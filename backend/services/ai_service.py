import anthropic
from config import get_settings
from db.models import SuggestedTask, TaskCollaborator
import json

settings = get_settings()


class AIService:
    def __init__(self):
        self.client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)

    def extract_tasks(
        self, emails: list[dict], events: list[dict]
    ) -> list[SuggestedTask]:
        """Extract tasks from emails and calendar events using Claude."""

        # Format input for Claude
        email_text = "\n\n".join(
            f"Email: {e['subject']}\nFrom: {e['from']}\nDate: {e['date']}\nSnippet: {e['snippet']}"
            for e in emails[:30]  # Limit to avoid token limits
        )

        event_text = "\n\n".join(
            f"Meeting: {e['summary']}\nTime: {e['start']} - {e['end']}\nAttendees: {', '.join(a['name'] or a['email'] for a in e.get('attendees', []))}\nDescription: {e.get('description', '')[:200]}"
            for e in events[:30]
        )

        prompt = f"""Analyze these emails and calendar events to extract actionable tasks and accomplishments.

EMAILS:
{email_text}

CALENDAR EVENTS:
{event_text}

IMPORTANT FILTERING RULES - COMPLETELY IGNORE these types of emails:
- Spam, promotional emails, newsletters, marketing emails
- Automated notifications from apps (Todoist, Slack digest, Asana, Trello, GitHub notifications, JIRA alerts, etc.)
- Social media notifications (LinkedIn, Twitter, Facebook, etc.)
- Generic alerts like "You have X unread messages" or "X people viewed your profile"
- Shipping/delivery notifications
- Password reset or security alerts
- Subscription confirmations or receipts
- Automated status updates or digests
- Any "noreply@" sender addresses

ONLY extract tasks from:
- Direct emails from real colleagues/collaborators requesting specific action
- Meeting invites with clear agendas requiring preparation
- Emails with explicit deadlines or deliverables assigned to the user
- Project updates that specifically require the user's response or action

Extract tasks in the following categories:
- action-items: Explicit action items, to-dos, and requests FROM REAL PEOPLE
- meetings: ALL calendar meetings should be included here (meetings with colleagues, 1:1s, team syncs, etc.)
- deliverables: Documents, reports, or items to be delivered
- projects: Larger project work that requires active effort

IMPORTANT: Include ALL calendar events in the meetings category. The user wants to see their full calendar in the report.

For each task, provide:
1. title: Clear, concise task title (what needs to be done)
2. description: Brief context about the task
3. due_date: Any mentioned deadline (e.g., "Mon, Jan 6" or "This week")
4. priority: high/medium/low based on urgency language
5. source: "email", "calendar", or "both"
6. category: one of the categories above
7. confidence: 0-100 score of how confident you are this is a real actionable task
8. collaborators: List of people involved (name and email if available)

CRITICAL RULES:
1. For EMAILS: Be VERY selective. Only include emails that are clearly actionable tasks from real people.
2. For CALENDAR EVENTS: Include ALL calendar events as meetings. Every meeting from the calendar should appear in the output.

Return JSON array of tasks. If no legitimate items are found, return an empty array [].

Output format:
```json
[
  {{
    "title": "Task title",
    "description": "Task description",
    "due_date": "Mon, Jan 6",
    "priority": "high",
    "source": "email",
    "category": "action-items",
    "confidence": 85,
    "collaborators": [{{"name": "John Doe", "email": "john@example.com"}}]
  }}
]
```"""

        response = self.client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=4096,
            messages=[{"role": "user", "content": prompt}],
        )

        # Parse response
        response_text = response.content[0].text

        # Extract JSON from response
        try:
            # Find JSON array in response
            start = response_text.find("[")
            end = response_text.rfind("]") + 1
            if start != -1 and end > start:
                json_str = response_text[start:end]
                tasks_data = json.loads(json_str)

                return [
                    SuggestedTask(
                        title=t.get("title", ""),
                        description=t.get("description"),
                        due_date=t.get("due_date"),
                        priority=t.get("priority", "medium"),
                        source=t.get("source", "email"),
                        category=t.get("category", "action-items"),
                        ai_confidence=t.get("confidence", 50),
                        collaborators=[
                            TaskCollaborator(name=c.get("name", ""), email=c.get("email"))
                            for c in t.get("collaborators", [])
                        ],
                    )
                    for t in tasks_data
                ]
        except (json.JSONDecodeError, KeyError):
            pass

        return []

    def generate_summary(self, report: dict, tasks: list[dict]) -> str:
        """Generate a summary of the report period."""

        completed_tasks = [t for t in tasks if t.get("is_completed")]
        pending_tasks = [t for t in tasks if not t.get("is_completed")]

        tasks_text = "\n".join(
            f"- [{t['category']}] {t['title']}: {t.get('description', '')}"
            for t in tasks
        )

        prompt = f"""Write a professional summary for a {report['period_type']} report ({report['period_start']} to {report['period_end']}).

Tasks and Accomplishments:
{tasks_text}

Completed: {len(completed_tasks)}
In Progress: {len(pending_tasks)}

Write a 2-3 paragraph summary that:
1. Highlights key accomplishments and progress
2. Mentions important meetings or collaborations
3. Notes upcoming priorities

Keep the tone professional but personable. Focus on impact and outcomes."""

        response = self.client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=1024,
            messages=[{"role": "user", "content": prompt}],
        )

        return response.content[0].text
