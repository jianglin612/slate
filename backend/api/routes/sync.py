from fastapi import APIRouter, Depends, HTTPException, Query
from db import get_supabase
from db.models import User, SyncRequest, SyncResponse
from api.middleware import get_current_user
from services.google_service import GoogleService
from services.microsoft_service import MicrosoftService
from services.ai_service import AIService
from utils import decrypt_token
from datetime import datetime, timezone, timedelta
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
    try:
        report = (
            supabase.table("reports")
            .select("*")
            .eq("id", report_id)
            .eq("user_id", current_user.id)
            .single()
            .execute()
        )
    except Exception as e:
        logger.error(f"Failed to fetch report: {e}")
        raise HTTPException(status_code=404, detail="Report not found")

    if not report.data:
        raise HTTPException(status_code=404, detail="Report not found")

    # Sync 4 weeks before and 2 weeks after today
    today = datetime.now(timezone.utc).date()
    period_start = (today - timedelta(weeks=4)).isoformat()
    period_end = (today + timedelta(weeks=2)).isoformat()

    emails = []
    events = []
    sync_errors = []

    # Get OAuth tokens
    try:
        tokens = (
            supabase.table("oauth_tokens")
            .select("*")
            .eq("user_id", current_user.id)
            .execute()
        )
    except Exception as e:
        logger.error(f"Failed to fetch OAuth tokens: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve account connections")

    if not tokens.data:
        raise HTTPException(
            status_code=400,
            detail="No connected accounts. Please connect Google or Microsoft in Settings."
        )

    for token_row in tokens.data:
        provider = token_row["provider"]

        try:
            access_token = decrypt_token(token_row["access_token"])
        except Exception as e:
            logger.error(f"Failed to decrypt {provider} token: {e}")
            sync_errors.append(f"{provider}: token decryption failed")
            continue

        if provider == "google":
            try:
                google = GoogleService()
                # Refresh token if needed
                if datetime.fromisoformat(token_row["token_expires_at"].replace("Z", "+00:00")) < datetime.now(timezone.utc):
                    try:
                        refresh_token = decrypt_token(token_row["refresh_token"])
                        new_tokens = google.refresh_tokens(refresh_token)
                        access_token = new_tokens["access_token"]
                        # Update stored tokens
                        from utils import encrypt_token
                        supabase.table("oauth_tokens").update({
                            "access_token": encrypt_token(new_tokens["access_token"]),
                            "token_expires_at": new_tokens["expires_at"],
                        }).eq("id", token_row["id"]).execute()
                    except Exception as e:
                        logger.error(f"Failed to refresh Google token: {e}")
                        sync_errors.append("Google: session expired, please reconnect")
                        continue

                google_emails = google.fetch_emails(access_token, period_start, period_end)
                google_events = google.fetch_calendar_events(access_token, period_start, period_end)
                logger.info(f"Google sync: fetched {len(google_emails)} emails and {len(google_events)} calendar events for period {period_start} to {period_end}")
                if google_events:
                    logger.info(f"Calendar events: {[e.get('summary', 'No title') for e in google_events[:5]]}")
                emails.extend(google_emails)
                events.extend(google_events)
            except Exception as e:
                logger.error(f"Google sync failed: {e}")
                sync_errors.append(f"Google: {str(e)}")

        elif provider == "microsoft":
            try:
                microsoft = MicrosoftService()
                if datetime.fromisoformat(token_row["token_expires_at"].replace("Z", "+00:00")) < datetime.now(timezone.utc):
                    try:
                        refresh_token = decrypt_token(token_row["refresh_token"])
                        new_tokens = microsoft.refresh_tokens(refresh_token)
                        access_token = new_tokens["access_token"]
                        from utils import encrypt_token
                        supabase.table("oauth_tokens").update({
                            "access_token": encrypt_token(new_tokens["access_token"]),
                            "token_expires_at": new_tokens["expires_at"],
                        }).eq("id", token_row["id"]).execute()
                    except Exception as e:
                        logger.error(f"Failed to refresh Microsoft token: {e}")
                        sync_errors.append("Microsoft: session expired, please reconnect")
                        continue

                ms_emails = microsoft.fetch_emails(access_token, period_start, period_end)
                ms_events = microsoft.fetch_calendar_events(access_token, period_start, period_end)
                emails.extend(ms_emails)
                events.extend(ms_events)
            except Exception as e:
                logger.error(f"Microsoft sync failed: {e}")
                sync_errors.append(f"Microsoft: {str(e)}")

    # If all providers failed, return error
    if sync_errors and not emails and not events:
        raise HTTPException(
            status_code=400,
            detail=f"Sync failed: {'; '.join(sync_errors)}"
        )

    # Use AI to extract tasks
    suggested_tasks = []
    ai_error = None
    logger.info(f"Data fetched: {len(emails)} emails, {len(events)} events")
    if emails or events:
        try:
            logger.info(f"Sending {len(emails)} emails and {len(events)} events to AI for task extraction")
            ai_service = AIService()
            suggested_tasks = ai_service.extract_tasks(emails, events)
            logger.info(f"AI extracted {len(suggested_tasks)} tasks")
        except Exception as e:
            logger.error(f"AI task extraction failed: {e}")
            ai_error = str(e)
            # Continue without AI suggestions rather than failing entirely
    else:
        logger.info("No emails or events to process - skipping AI extraction")

    # Record sync history
    try:
        supabase.table("sync_history").insert({
            "user_id": current_user.id,
            "provider": "all",
            "sync_type": "full",
            "last_sync_at": datetime.utcnow().isoformat(),
            "emails_fetched": len(emails),
            "events_fetched": len(events),
        }).execute()
    except Exception as e:
        logger.error(f"Failed to record sync history: {e}")
        # Non-critical, continue

    return SyncResponse(
        emails_fetched=len(emails),
        events_fetched=len(events),
        suggested_tasks=suggested_tasks,
        ai_error=ai_error,
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
