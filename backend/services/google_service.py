import httpx
from datetime import datetime, timedelta
from urllib.parse import urlencode
from config import get_settings

settings = get_settings()


class GoogleService:
    AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
    TOKEN_URL = "https://oauth2.googleapis.com/token"
    USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo"
    GMAIL_URL = "https://gmail.googleapis.com/gmail/v1"
    CALENDAR_URL = "https://www.googleapis.com/calendar/v3"

    SCOPES = [
        "openid",
        "email",
        "profile",
        "https://www.googleapis.com/auth/gmail.readonly",
        "https://www.googleapis.com/auth/calendar.readonly",
    ]

    def get_auth_url(self) -> str:
        """Generate Google OAuth authorization URL."""
        params = {
            "client_id": settings.GOOGLE_CLIENT_ID,
            "redirect_uri": f"{settings.BACKEND_URL}/api/auth/callback/google",
            "response_type": "code",
            "scope": " ".join(self.SCOPES),
            "access_type": "offline",
            "prompt": "consent",
        }
        return f"{self.AUTH_URL}?{urlencode(params)}"

    def exchange_code(self, code: str) -> dict:
        """Exchange authorization code for tokens."""
        with httpx.Client() as client:
            response = client.post(
                self.TOKEN_URL,
                data={
                    "client_id": settings.GOOGLE_CLIENT_ID,
                    "client_secret": settings.GOOGLE_CLIENT_SECRET,
                    "code": code,
                    "grant_type": "authorization_code",
                    "redirect_uri": f"{settings.BACKEND_URL}/api/auth/callback/google",
                },
            )
            response.raise_for_status()
            data = response.json()

            expires_at = datetime.utcnow() + timedelta(seconds=data["expires_in"])

            return {
                "access_token": data["access_token"],
                "refresh_token": data.get("refresh_token", ""),
                "expires_at": expires_at.isoformat(),
                "scopes": self.SCOPES,
            }

    def refresh_tokens(self, refresh_token: str) -> dict:
        """Refresh access token using refresh token."""
        with httpx.Client() as client:
            response = client.post(
                self.TOKEN_URL,
                data={
                    "client_id": settings.GOOGLE_CLIENT_ID,
                    "client_secret": settings.GOOGLE_CLIENT_SECRET,
                    "refresh_token": refresh_token,
                    "grant_type": "refresh_token",
                },
            )
            response.raise_for_status()
            data = response.json()

            expires_at = datetime.utcnow() + timedelta(seconds=data["expires_in"])

            return {
                "access_token": data["access_token"],
                "expires_at": expires_at.isoformat(),
            }

    def get_user_info(self, access_token: str) -> dict:
        """Get user info from Google."""
        with httpx.Client() as client:
            response = client.get(
                self.USERINFO_URL,
                headers={"Authorization": f"Bearer {access_token}"},
            )
            response.raise_for_status()
            return response.json()

    def fetch_emails(
        self, access_token: str, start_date: str, end_date: str
    ) -> list[dict]:
        """Fetch emails from Gmail for the given date range."""
        emails = []

        with httpx.Client() as client:
            # Build query for date range
            query = f"after:{start_date} before:{end_date}"

            # List messages
            response = client.get(
                f"{self.GMAIL_URL}/users/me/messages",
                headers={"Authorization": f"Bearer {access_token}"},
                params={"q": query, "maxResults": 100},
            )
            response.raise_for_status()
            data = response.json()

            messages = data.get("messages", [])

            # Fetch each message's details
            for msg in messages[:50]:  # Limit to 50 for performance
                msg_response = client.get(
                    f"{self.GMAIL_URL}/users/me/messages/{msg['id']}",
                    headers={"Authorization": f"Bearer {access_token}"},
                    params={"format": "metadata", "metadataHeaders": ["Subject", "From", "To", "Date"]},
                )
                if msg_response.status_code == 200:
                    msg_data = msg_response.json()
                    headers = {
                        h["name"]: h["value"]
                        for h in msg_data.get("payload", {}).get("headers", [])
                    }
                    emails.append({
                        "id": msg["id"],
                        "subject": headers.get("Subject", ""),
                        "from": headers.get("From", ""),
                        "to": headers.get("To", ""),
                        "date": headers.get("Date", ""),
                        "snippet": msg_data.get("snippet", ""),
                    })

        return emails

    def fetch_calendar_events(
        self, access_token: str, start_date: str, end_date: str
    ) -> list[dict]:
        """Fetch calendar events for the given date range."""
        events = []

        with httpx.Client() as client:
            # Convert dates to RFC3339
            time_min = f"{start_date}T00:00:00Z"
            time_max = f"{end_date}T23:59:59Z"

            response = client.get(
                f"{self.CALENDAR_URL}/calendars/primary/events",
                headers={"Authorization": f"Bearer {access_token}"},
                params={
                    "timeMin": time_min,
                    "timeMax": time_max,
                    "singleEvents": True,
                    "orderBy": "startTime",
                    "maxResults": 100,
                },
            )
            response.raise_for_status()
            data = response.json()

            for event in data.get("items", []):
                start = event.get("start", {})
                end = event.get("end", {})
                attendees = event.get("attendees", [])

                events.append({
                    "id": event["id"],
                    "summary": event.get("summary", ""),
                    "description": event.get("description", ""),
                    "start": start.get("dateTime") or start.get("date"),
                    "end": end.get("dateTime") or end.get("date"),
                    "attendees": [
                        {"email": a.get("email"), "name": a.get("displayName")}
                        for a in attendees
                    ],
                    "location": event.get("location"),
                })

        return events
