from fastapi import APIRouter, Depends, HTTPException
from db import get_supabase
from db.models import User
from api.middleware import get_current_user
from services.ai_service import AIService
from pydantic import BaseModel

router = APIRouter()


class SummaryRequest(BaseModel):
    report_id: str


class SummaryResponse(BaseModel):
    summary: str


@router.post("/generate-summary", response_model=SummaryResponse)
async def generate_summary(
    request: SummaryRequest,
    current_user: User = Depends(get_current_user),
):
    """Generate an AI summary for a report."""
    supabase = get_supabase()

    # Get report and tasks
    report = (
        supabase.table("reports")
        .select("*")
        .eq("id", request.report_id)
        .eq("user_id", current_user.id)
        .single()
        .execute()
    )

    if not report.data:
        raise HTTPException(status_code=404, detail="Report not found")

    tasks = (
        supabase.table("tasks")
        .select("*")
        .eq("report_id", request.report_id)
        .execute()
    )

    ai_service = AIService()
    summary = ai_service.generate_summary(report.data, tasks.data)

    # Update report with summary
    supabase.table("reports").update({"summary": summary}).eq("id", request.report_id).execute()

    return SummaryResponse(summary=summary)
