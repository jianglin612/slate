from fastapi import APIRouter, Depends, HTTPException, Query
from db import get_supabase
from db.models import User, SyncRequest, SyncResponse
from api.middleware import get_current_user
from services.google_service import GoogleService
from services.microsoft_service import MicrosoftService
from services.ai_service import AIService
from utils import decrypt_token
from datetime import datetime, timezone
import logging

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("", response_model=SyncResponse)
async def sync_data(
    report_id: str = Query(...),
    current_user: User = Depends(get_current_user),
):
    """Sync emails and calendar for a report's time period."""
    supabase = get_supabase()

    # Get report to determine time period
    report = (
        supabase.table("reports")
        .select("*")
        .eq("id", report_id)
        .eq("user_id", current_user.id)
        .single()
        .execute()
    )

    if not report.data:
        raise HTTPException(status_code=404, detail="Report not found")

    period_start = report.data["period_start"]
    period_end = report.data["period_end"]

    emails = []
    events = []

    # Get OAuth tokens
    tokens = (
        supabase.table("oauth_tokens")
        .select("*")
        .eq("user_id", current_user.id)
        .execute()
    )

    for token_row in tokens.data:
        provider = token_row["provider"]
        access_token = decrypt_token(token_row["access_token"])

        if provider == "google":
            google = GoogleService()
            # Refresh token if needed
            if datetime.fromisoformat(token_row["token_expires_at"].replace("Z", "+00:00")) < datetime.now(timezone.utc):
                refresh_token = decrypt_token(token_row["refresh_token"])
                new_tokens = google.refresh_tokens(refresh_token)
                access_token = new_tokens["access_token"]
                # Update stored tokens
                from utils import encrypt_token
                supabase.table("oauth_tokens").update({
                    "access_token": encrypt_token(new_tokens["access_token"]),
                    "token_expires_at": new_tokens["expires_at"],
                }).eq("id", token_row["id"]).execute()

            google_emails = google.fetch_emails(access_token, period_start, period_end)
            google_events = google.fetch_calendar_events(access_token, period_start, period_end)
            logger.info(f"Google sync: fetched {len(google_emails)} emails and {len(google_events)} calendar events for period {period_start} to {period_end}")
            if google_events:
                logger.info(f"Calendar events: {[e.get('summary', 'No title') for e in google_events[:5]]}")
            emails.extend(google_emails)
            events.extend(google_events)

        elif provider == "microsoft":
            microsoft = MicrosoftService()
            if datetime.fromisoformat(token_row["token_expires_at"].replace("Z", "+00:00")) < datetime.now(timezone.utc):
                refresh_token = decrypt_token(token_row["refresh_token"])
                new_tokens = microsoft.refresh_tokens(refresh_token)
                access_token = new_tokens["access_token"]
                from utils import encrypt_token
                supabase.table("oauth_tokens").update({
                    "access_token": encrypt_token(new_tokens["access_token"]),
                    "token_expires_at": new_tokens["expires_at"],
                }).eq("id", token_row["id"]).execute()

            ms_emails = microsoft.fetch_emails(access_token, period_start, period_end)
            ms_events = microsoft.fetch_calendar_events(access_token, period_start, period_end)
            emails.extend(ms_emails)
            events.extend(ms_events)

    # Use AI to extract tasks
    logger.info(f"Sending {len(emails)} emails and {len(events)} events to AI for task extraction")
    ai_service = AIService()
    suggested_tasks = ai_service.extract_tasks(emails, events)
    logger.info(f"AI extracted {len(suggested_tasks)} tasks")

    # Record sync history
    supabase.table("sync_history").insert({
        "user_id": current_user.id,
        "provider": "all",
        "sync_type": "full",
        "last_sync_at": datetime.utcnow().isoformat(),
        "emails_fetched": len(emails),
        "events_fetched": len(events),
    }).execute()

    return SyncResponse(
        emails_fetched=len(emails),
        events_fetched=len(events),
        suggested_tasks=suggested_tasks,
    )


@router.get("/status")
async def get_sync_status(
    current_user: User = Depends(get_current_user),
):
    """Get sync history for user."""
    supabase = get_supabase()

    result = (
        supabase.table("sync_history")
        .select("*")
        .eq("user_id", current_user.id)
        .order("last_sync_at", desc=True)
        .limit(10)
        .execute()
    )

    return result.data
