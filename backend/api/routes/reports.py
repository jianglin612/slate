from fastapi import APIRouter, Depends, HTTPException, status, Query
from datetime import date, timedelta
from db import get_supabase
from db.models import (
    Report,
    ReportCreate,
    ReportUpdate,
    User,
    PeriodType,
)
from api.middleware import get_current_user
import secrets

router = APIRouter()


def get_period_dates(period_type: PeriodType, offset: int = 0) -> tuple[date, date]:
    """Calculate start and end dates for a period with optional offset.

    Args:
        period_type: Type of period (weekly, monthly, quarterly)
        offset: Number of periods to offset (negative = past, positive = future)
    """
    today = date.today()

    if period_type == "weekly":
        # Start on Monday
        start = today - timedelta(days=today.weekday())
        # Apply offset in weeks
        start = start + timedelta(weeks=offset)
        end = start + timedelta(days=6)
    elif period_type == "monthly":
        # Calculate the target month
        target_month = today.month + offset
        target_year = today.year
        while target_month <= 0:
            target_month += 12
            target_year -= 1
        while target_month > 12:
            target_month -= 12
            target_year += 1
        start = date(target_year, target_month, 1)
        # End of month
        if target_month == 12:
            end = date(target_year, 12, 31)
        else:
            end = date(target_year, target_month + 1, 1) - timedelta(days=1)
    else:  # quarterly
        quarter = (today.month - 1) // 3 + offset
        target_year = today.year
        while quarter < 0:
            quarter += 4
            target_year -= 1
        while quarter >= 4:
            quarter -= 4
            target_year += 1
        start = date(target_year, quarter * 3 + 1, 1)
        end_month = quarter * 3 + 3
        if end_month == 12:
            end = date(target_year, 12, 31)
        else:
            end = date(target_year, end_month + 1, 1) - timedelta(days=1)

    return start, end


@router.get("")
async def list_reports(
    current_user: User = Depends(get_current_user),
    limit: int = Query(default=10, le=50),
    offset: int = Query(default=0),
):
    """List user's reports."""
    supabase = get_supabase()
    result = (
        supabase.table("reports")
        .select("*")
        .eq("user_id", current_user.id)
        .order("period_start", desc=True)
        .range(offset, offset + limit - 1)
        .execute()
    )
    return result.data


@router.get("/current")
async def get_current_report(
    period_type: PeriodType = Query(default="weekly"),
    offset: int = Query(default=0, description="Period offset (negative = past, positive = future)"),
    current_user: User = Depends(get_current_user),
):
    """Get or create a period's report with optional offset."""
    supabase = get_supabase()
    period_start, period_end = get_period_dates(period_type, offset)

    # Try to find existing report
    result = (
        supabase.table("reports")
        .select("*")
        .eq("user_id", current_user.id)
        .eq("period_type", period_type)
        .eq("period_start", period_start.isoformat())
        .execute()
    )

    if result.data and len(result.data) > 0:
        return result.data[0]

    # Create new report
    new_report = (
        supabase.table("reports")
        .insert(
            {
                "user_id": current_user.id,
                "period_type": period_type,
                "period_start": period_start.isoformat(),
                "period_end": period_end.isoformat(),
            }
        )
        .execute()
    )

    return new_report.data[0]


@router.get("/{report_id}")
async def get_report(
    report_id: str,
    current_user: User = Depends(get_current_user),
):
    """Get a single report with its tasks."""
    supabase = get_supabase()

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

    # Get tasks with collaborators
    tasks = (
        supabase.table("tasks")
        .select("*, task_collaborators(*)")
        .eq("report_id", report_id)
        .order("sort_order")
        .execute()
    )

    return {**report.data, "tasks": tasks.data}


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_report(
    report_data: ReportCreate,
    current_user: User = Depends(get_current_user),
):
    """Create a new report."""
    supabase = get_supabase()

    result = (
        supabase.table("reports")
        .insert(
            {
                "user_id": current_user.id,
                "period_type": report_data.period_type,
                "period_start": report_data.period_start.isoformat(),
                "period_end": report_data.period_end.isoformat(),
                "title": report_data.title,
            }
        )
        .execute()
    )

    return result.data[0]


@router.put("/{report_id}")
async def update_report(
    report_id: str,
    report_data: ReportUpdate,
    current_user: User = Depends(get_current_user),
):
    """Update a report."""
    supabase = get_supabase()

    # Verify ownership
    existing = (
        supabase.table("reports")
        .select("id")
        .eq("id", report_id)
        .eq("user_id", current_user.id)
        .single()
        .execute()
    )

    if not existing.data:
        raise HTTPException(status_code=404, detail="Report not found")

    update_data = report_data.model_dump(exclude_none=True)
    if not update_data:
        raise HTTPException(status_code=400, detail="No data to update")

    result = (
        supabase.table("reports").update(update_data).eq("id", report_id).execute()
    )

    return result.data[0]


@router.delete("/{report_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_report(
    report_id: str,
    current_user: User = Depends(get_current_user),
):
    """Delete a report and its tasks."""
    supabase = get_supabase()

    # Verify ownership
    existing = (
        supabase.table("reports")
        .select("id")
        .eq("id", report_id)
        .eq("user_id", current_user.id)
        .single()
        .execute()
    )

    if not existing.data:
        raise HTTPException(status_code=404, detail="Report not found")

    # Tasks will be deleted by CASCADE
    supabase.table("reports").delete().eq("id", report_id).execute()


@router.post("/{report_id}/publish")
async def publish_report(
    report_id: str,
    current_user: User = Depends(get_current_user),
):
    """Publish a report and generate a share token."""
    supabase = get_supabase()

    # Verify ownership
    existing = (
        supabase.table("reports")
        .select("*")
        .eq("id", report_id)
        .eq("user_id", current_user.id)
        .single()
        .execute()
    )

    if not existing.data:
        raise HTTPException(status_code=404, detail="Report not found")

    # Generate share token if not exists
    share_token = existing.data.get("share_token") or secrets.token_urlsafe(16)

    result = (
        supabase.table("reports")
        .update({"is_published": True, "share_token": share_token})
        .eq("id", report_id)
        .execute()
    )

    return result.data[0]
