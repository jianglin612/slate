from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from db import get_supabase
from db.models import User, Category, CategoryCreate
from api.middleware import get_current_user
from pydantic import BaseModel

router = APIRouter()


class IntegrationStatus(BaseModel):
    provider: str
    connected: bool
    email: Optional[str] = None


@router.get("/categories")
async def list_categories(
    current_user: User = Depends(get_current_user),
):
    """List user's custom categories."""
    supabase = get_supabase()

    result = (
        supabase.table("custom_categories")
        .select("*")
        .eq("user_id", current_user.id)
        .order("sort_order")
        .execute()
    )

    return result.data


@router.post("/categories", status_code=status.HTTP_201_CREATED)
async def create_category(
    category: CategoryCreate,
    current_user: User = Depends(get_current_user),
):
    """Create a custom category."""
    supabase = get_supabase()

    # Get max sort_order
    max_order = (
        supabase.table("custom_categories")
        .select("sort_order")
        .eq("user_id", current_user.id)
        .order("sort_order", desc=True)
        .limit(1)
        .execute()
    )
    next_order = (max_order.data[0]["sort_order"] + 1) if max_order.data else 0

    result = (
        supabase.table("custom_categories")
        .insert({
            "user_id": current_user.id,
            "name": category.name,
            "icon": category.icon,
            "color": category.color,
            "sort_order": next_order,
        })
        .execute()
    )

    return result.data[0]


@router.put("/categories/{category_id}")
async def update_category(
    category_id: str,
    category: CategoryCreate,
    current_user: User = Depends(get_current_user),
):
    """Update a custom category."""
    supabase = get_supabase()

    existing = (
        supabase.table("custom_categories")
        .select("id")
        .eq("id", category_id)
        .eq("user_id", current_user.id)
        .single()
        .execute()
    )

    if not existing.data:
        raise HTTPException(status_code=404, detail="Category not found")

    result = (
        supabase.table("custom_categories")
        .update({
            "name": category.name,
            "icon": category.icon,
            "color": category.color,
        })
        .eq("id", category_id)
        .execute()
    )

    return result.data[0]


@router.delete("/categories/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_category(
    category_id: str,
    current_user: User = Depends(get_current_user),
):
    """Delete a custom category."""
    supabase = get_supabase()

    existing = (
        supabase.table("custom_categories")
        .select("id")
        .eq("id", category_id)
        .eq("user_id", current_user.id)
        .single()
        .execute()
    )

    if not existing.data:
        raise HTTPException(status_code=404, detail="Category not found")

    supabase.table("custom_categories").delete().eq("id", category_id).execute()


@router.get("/integrations")
async def list_integrations(
    current_user: User = Depends(get_current_user),
):
    """List connected OAuth integrations."""
    supabase = get_supabase()

    tokens = (
        supabase.table("oauth_tokens")
        .select("provider")
        .eq("user_id", current_user.id)
        .execute()
    )

    connected_providers = {t["provider"] for t in tokens.data}

    return [
        IntegrationStatus(
            provider="google",
            connected="google" in connected_providers,
        ),
        IntegrationStatus(
            provider="microsoft",
            connected="microsoft" in connected_providers,
        ),
    ]


@router.delete("/integrations/{provider}", status_code=status.HTTP_204_NO_CONTENT)
async def disconnect_integration(
    provider: str,
    current_user: User = Depends(get_current_user),
):
    """Disconnect an OAuth integration."""
    if provider not in ["google", "microsoft"]:
        raise HTTPException(status_code=400, detail="Invalid provider")

    supabase = get_supabase()

    supabase.table("oauth_tokens").delete().eq("user_id", current_user.id).eq(
        "provider", provider
    ).execute()
