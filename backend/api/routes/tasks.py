from fastapi import APIRouter, Depends, HTTPException, status
from db import get_supabase
from db.models import Task, TaskCreate, TaskUpdate, TaskReorder, User
from api.middleware import get_current_user
from pydantic import BaseModel

router = APIRouter()


class ReorderRequest(BaseModel):
    tasks: list[TaskReorder]


# NOTE: /reorder must be defined BEFORE /{task_id} routes to avoid "reorder" being matched as a task_id
@router.put("/reorder")
async def reorder_tasks(
    reorder_data: ReorderRequest,
    current_user: User = Depends(get_current_user),
):
    """Reorder multiple tasks at once."""
    supabase = get_supabase()

    # Verify all tasks belong to user
    task_ids = [t.task_id for t in reorder_data.tasks]
    existing = (
        supabase.table("tasks")
        .select("id")
        .eq("user_id", current_user.id)
        .in_("id", task_ids)
        .execute()
    )

    if len(existing.data) != len(task_ids):
        raise HTTPException(status_code=403, detail="Some tasks not found or not owned")

    # Update each task
    for task in reorder_data.tasks:
        update_data = {"sort_order": task.sort_order}
        if task.category:
            update_data["category"] = task.category

        supabase.table("tasks").update(update_data).eq("id", task.task_id).execute()

    return {"message": "Tasks reordered"}


@router.get("/report/{report_id}")
async def list_tasks(
    report_id: str,
    current_user: User = Depends(get_current_user),
):
    """List all tasks for a report."""
    supabase = get_supabase()

    # Verify report ownership
    report = (
        supabase.table("reports")
        .select("id")
        .eq("id", report_id)
        .eq("user_id", current_user.id)
        .single()
        .execute()
    )

    if not report.data:
        raise HTTPException(status_code=404, detail="Report not found")

    result = (
        supabase.table("tasks")
        .select("*, task_collaborators(*)")
        .eq("report_id", report_id)
        .order("sort_order")
        .execute()
    )

    return result.data


@router.post("/report/{report_id}", status_code=status.HTTP_201_CREATED)
async def create_task(
    report_id: str,
    task_data: TaskCreate,
    current_user: User = Depends(get_current_user),
):
    """Create a new task in a report."""
    supabase = get_supabase()

    # Verify report ownership
    report = (
        supabase.table("reports")
        .select("id")
        .eq("id", report_id)
        .eq("user_id", current_user.id)
        .single()
        .execute()
    )

    if not report.data:
        raise HTTPException(status_code=404, detail="Report not found")

    # Get max sort_order for this report
    max_order = (
        supabase.table("tasks")
        .select("sort_order")
        .eq("report_id", report_id)
        .order("sort_order", desc=True)
        .limit(1)
        .execute()
    )
    next_order = (max_order.data[0]["sort_order"] + 1) if max_order.data else 0

    # Create task
    task = (
        supabase.table("tasks")
        .insert(
            {
                "report_id": report_id,
                "user_id": current_user.id,
                "title": task_data.title,
                "description": task_data.description,
                "due_date": task_data.due_date,
                "priority": task_data.priority,
                "source": task_data.source,
                "category": task_data.category,
                "is_private": task_data.is_private,
                "sort_order": next_order,
            }
        )
        .execute()
    )

    task_id = task.data[0]["id"]

    # Add collaborators
    if task_data.collaborators:
        collaborators = [
            {"task_id": task_id, "name": c.name, "email": c.email, "avatar_url": c.avatar_url}
            for c in task_data.collaborators
        ]
        supabase.table("task_collaborators").insert(collaborators).execute()

    # Return task with collaborators
    result = (
        supabase.table("tasks")
        .select("*, task_collaborators(*)")
        .eq("id", task_id)
        .single()
        .execute()
    )

    return result.data


@router.put("/{task_id}")
async def update_task(
    task_id: str,
    task_data: TaskUpdate,
    current_user: User = Depends(get_current_user),
):
    """Update a task."""
    supabase = get_supabase()

    # Verify ownership
    existing = (
        supabase.table("tasks")
        .select("id")
        .eq("id", task_id)
        .eq("user_id", current_user.id)
        .single()
        .execute()
    )

    if not existing.data:
        raise HTTPException(status_code=404, detail="Task not found")

    update_data = task_data.model_dump(exclude_none=True)
    if not update_data:
        raise HTTPException(status_code=400, detail="No data to update")

    result = (
        supabase.table("tasks")
        .update(update_data)
        .eq("id", task_id)
        .execute()
    )

    # Return updated task with collaborators
    task = (
        supabase.table("tasks")
        .select("*, task_collaborators(*)")
        .eq("id", task_id)
        .single()
        .execute()
    )

    return task.data


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(
    task_id: str,
    current_user: User = Depends(get_current_user),
):
    """Delete a task."""
    supabase = get_supabase()

    existing = (
        supabase.table("tasks")
        .select("id")
        .eq("id", task_id)
        .eq("user_id", current_user.id)
        .single()
        .execute()
    )

    if not existing.data:
        raise HTTPException(status_code=404, detail="Task not found")

    supabase.table("tasks").delete().eq("id", task_id).execute()


@router.put("/{task_id}/complete")
async def toggle_complete(
    task_id: str,
    current_user: User = Depends(get_current_user),
):
    """Toggle task completion status."""
    supabase = get_supabase()

    existing = (
        supabase.table("tasks")
        .select("id, is_completed")
        .eq("id", task_id)
        .eq("user_id", current_user.id)
        .single()
        .execute()
    )

    if not existing.data:
        raise HTTPException(status_code=404, detail="Task not found")

    result = (
        supabase.table("tasks")
        .update({"is_completed": not existing.data["is_completed"]})
        .eq("id", task_id)
        .execute()
    )

    return result.data[0]
