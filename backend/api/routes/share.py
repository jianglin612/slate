from typing import Optional, List
from fastapi import APIRouter, HTTPException
from db import get_supabase
from db.models import CommentCreate, Comment, ReactionCreate, Reaction
from pydantic import BaseModel

router = APIRouter()


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
