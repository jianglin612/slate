from typing import Optional, List
import secrets
from fastapi import APIRouter, HTTPException, Depends
from db import get_supabase
from db.models import CommentCreate, Comment, ReactionCreate, Reaction, User
from api.middleware import get_current_user
from services.email_service import EmailService
from pydantic import BaseModel
from config import get_settings

settings = get_settings()
router = APIRouter()


class InviteCreate(BaseModel):
    email: str


class InviteResponse(BaseModel):
    email: str
    invited_at: str


class SharedReport(BaseModel):
    id: str
    period_type: str
    period_start: str
    period_end: str
    title: Optional[str]
    summary: Optional[str]
    allow_comments: bool
    allow_reactions: bool
    user_name: Optional[str]
    user_avatar: Optional[str]
    tasks: List
    comments: List
    reactions: List


@router.get("/{share_token}")
async def get_shared_report(share_token: str):
    """Get a publicly shared report."""
    supabase = get_supabase()

    # Get report by share token
    report = (
        supabase.table("reports")
        .select("*, users(full_name, avatar_url)")
        .eq("share_token", share_token)
        .eq("is_published", True)
        .single()
        .execute()
    )

    if not report.data:
        raise HTTPException(status_code=404, detail="Report not found or not published")

    report_id = report.data["id"]

    # Get public tasks (non-private)
    tasks = (
        supabase.table("tasks")
        .select("id, title, description, due_date, priority, source, category, is_completed, task_collaborators(*)")
        .eq("report_id", report_id)
        .eq("is_private", False)
        .order("sort_order")
        .execute()
    )

    # Get comments
    comments = (
        supabase.table("comments")
        .select("*")
        .eq("report_id", report_id)
        .order("created_at")
        .execute()
    )

    # Get reactions
    reactions = (
        supabase.table("reactions")
        .select("*")
        .eq("report_id", report_id)
        .execute()
    )

    user_data = report.data.get("users", {})

    return SharedReport(
        id=report.data["id"],
        period_type=report.data["period_type"],
        period_start=report.data["period_start"],
        period_end=report.data["period_end"],
        title=report.data.get("title"),
        summary=report.data.get("summary"),
        allow_comments=report.data["allow_comments"],
        allow_reactions=report.data["allow_reactions"],
        user_name=user_data.get("full_name"),
        user_avatar=user_data.get("avatar_url"),
        tasks=tasks.data,
        comments=comments.data,
        reactions=reactions.data,
    )


@router.post("/{share_token}/comments")
async def add_comment(share_token: str, comment: CommentCreate):
    """Add a comment to a shared report."""
    supabase = get_supabase()

    # Verify report exists and allows comments
    report = (
        supabase.table("reports")
        .select("id, allow_comments")
        .eq("share_token", share_token)
        .eq("is_published", True)
        .single()
        .execute()
    )

    if not report.data:
        raise HTTPException(status_code=404, detail="Report not found")

    if not report.data["allow_comments"]:
        raise HTTPException(status_code=403, detail="Comments are disabled for this report")

    # If task_id provided, verify it belongs to report
    if comment.task_id:
        task = (
            supabase.table("tasks")
            .select("id")
            .eq("id", comment.task_id)
            .eq("report_id", report.data["id"])
            .single()
            .execute()
        )
        if not task.data:
            raise HTTPException(status_code=404, detail="Task not found")

    result = (
        supabase.table("comments")
        .insert({
            "report_id": report.data["id"],
            "task_id": comment.task_id,
            "author_name": comment.author_name,
            "author_email": comment.author_email,
            "content": comment.content,
        })
        .execute()
    )

    return result.data[0]


@router.post("/{share_token}/reactions")
async def add_reaction(share_token: str, reaction: ReactionCreate):
    """Add a reaction to a shared report or task."""
    supabase = get_supabase()

    report = (
        supabase.table("reports")
        .select("id, allow_reactions")
        .eq("share_token", share_token)
        .eq("is_published", True)
        .single()
        .execute()
    )

    if not report.data:
        raise HTTPException(status_code=404, detail="Report not found")

    if not report.data["allow_reactions"]:
        raise HTTPException(status_code=403, detail="Reactions are disabled for this report")

    # If task_id provided, verify it belongs to report
    if reaction.task_id:
        task = (
            supabase.table("tasks")
            .select("id")
            .eq("id", reaction.task_id)
            .eq("report_id", report.data["id"])
            .single()
            .execute()
        )
        if not task.data:
            raise HTTPException(status_code=404, detail="Task not found")

    # Upsert reaction (one per user per emoji per target)
    try:
        result = (
            supabase.table("reactions")
            .upsert(
                {
                    "report_id": report.data["id"],
                    "task_id": reaction.task_id,
                    "author_email": reaction.author_email,
                    "emoji": reaction.emoji,
                },
                on_conflict="report_id,task_id,author_email,emoji",
            )
            .execute()
        )
        return result.data[0]
    except Exception:
        # Reaction already exists
        return {"message": "Reaction already exists"}


@router.delete("/{share_token}/reactions")
async def remove_reaction(share_token: str, reaction: ReactionCreate):
    """Remove a reaction."""
    supabase = get_supabase()

    report = (
        supabase.table("reports")
        .select("id")
        .eq("share_token", share_token)
        .eq("is_published", True)
        .single()
        .execute()
    )

    if not report.data:
        raise HTTPException(status_code=404, detail="Report not found")

    supabase.table("reactions").delete().eq("report_id", report.data["id"]).eq(
        "author_email", reaction.author_email
    ).eq("emoji", reaction.emoji).eq("task_id", reaction.task_id).execute()

    return {"message": "Reaction removed"}


@router.post("/{report_id}/invite")
async def invite_to_report(
    report_id: str,
    invite: InviteCreate,
    current_user: User = Depends(get_current_user),
):
    """Invite someone to view a report via email."""
    supabase = get_supabase()

    # Get report and verify ownership
    try:
        report = (
            supabase.table("reports")
            .select("*, users(full_name)")
            .eq("id", report_id)
            .eq("user_id", current_user.id)
            .single()
            .execute()
        )
    except Exception:
        raise HTTPException(status_code=404, detail="Report not found")

    if not report.data:
        raise HTTPException(status_code=404, detail="Report not found")

    # Auto-publish if not already published
    share_token = report.data.get("share_token")
    if not report.data.get("is_published") or not share_token:
        share_token = secrets.token_urlsafe(16)
        supabase.table("reports").update({
            "is_published": True,
            "share_token": share_token,
        }).eq("id", report_id).execute()

    # Store invite in report_shares table
    try:
        supabase.table("report_shares").upsert({
            "report_id": report_id,
            "email": invite.email,
            "invited_by": current_user.id,
        }, on_conflict="report_id,email").execute()
    except Exception as e:
        # Table might not exist yet, log but continue
        print(f"Failed to store invite: {e}")

    # Send email
    share_url = f"{settings.FRONTEND_URL}/share/{share_token}"
    from_name = report.data.get("users", {}).get("full_name") or "Someone"
    report_title = report.data.get("title")

    email_service = EmailService()
    email_sent = email_service.send_share_invite(
        to_email=invite.email,
        from_name=from_name,
        share_url=share_url,
        report_title=report_title,
    )

    if not email_sent:
        raise HTTPException(status_code=500, detail="Failed to send invite email")

    return {"message": "Invite sent successfully"}


@router.get("/{report_id}/invites", response_model=List[InviteResponse])
async def get_report_invites(
    report_id: str,
    current_user: User = Depends(get_current_user),
):
    """Get list of people invited to a report."""
    supabase = get_supabase()

    # Verify report ownership
    try:
        report = (
            supabase.table("reports")
            .select("id")
            .eq("id", report_id)
            .eq("user_id", current_user.id)
            .single()
            .execute()
        )
    except Exception:
        raise HTTPException(status_code=404, detail="Report not found")

    if not report.data:
        raise HTTPException(status_code=404, detail="Report not found")

    # Get invites
    try:
        invites = (
            supabase.table("report_shares")
            .select("email, invited_at")
            .eq("report_id", report_id)
            .order("invited_at", desc=True)
            .execute()
        )
        return invites.data
    except Exception:
        # Table might not exist yet
        return []
