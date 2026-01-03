from typing import Optional
from fastapi import APIRouter, HTTPException, status
from fastapi.responses import RedirectResponse
from pydantic import BaseModel
from config import get_settings
from db import get_supabase
from utils import create_access_token, encrypt_token
from services.google_service import GoogleService
from services.microsoft_service import MicrosoftService
from api.middleware import get_current_user
from db.models import User
from fastapi import Depends

router = APIRouter()
settings = get_settings()


class AuthUrlResponse(BaseModel):
    auth_url: str


class TokenResponse(BaseModel):
    token: str
    user: User


@router.post("/login/google", response_model=AuthUrlResponse)
async def login_google():
    """Get Google OAuth URL for login."""
    google = GoogleService()
    auth_url = google.get_auth_url()
    return AuthUrlResponse(auth_url=auth_url)


@router.post("/login/microsoft", response_model=AuthUrlResponse)
async def login_microsoft():
    """Get Microsoft OAuth URL for login."""
    microsoft = MicrosoftService()
    auth_url = microsoft.get_auth_url()
    return AuthUrlResponse(auth_url=auth_url)


@router.get("/callback/google")
async def callback_google(code: str, state: Optional[str] = None):
    """Handle Google OAuth callback."""
    try:
        google = GoogleService()
        tokens = google.exchange_code(code)

        # Get user info from Google
        user_info = google.get_user_info(tokens["access_token"])

        supabase = get_supabase()

        # Check if user exists
        existing = (
            supabase.table("users")
            .select("*")
            .eq("email", user_info["email"])
            .execute()
        )

        if existing.data:
            user_id = existing.data[0]["id"]
            # Update user info
            supabase.table("users").update(
                {
                    "full_name": user_info.get("name"),
                    "avatar_url": user_info.get("picture"),
                }
            ).eq("id", user_id).execute()
        else:
            # Create new user
            result = (
                supabase.table("users")
                .insert(
                    {
                        "email": user_info["email"],
                        "full_name": user_info.get("name"),
                        "avatar_url": user_info.get("picture"),
                    }
                )
                .execute()
            )
            user_id = result.data[0]["id"]

        # Store OAuth tokens
        supabase.table("oauth_tokens").upsert(
            {
                "user_id": user_id,
                "provider": "google",
                "access_token": encrypt_token(tokens["access_token"]),
                "refresh_token": encrypt_token(tokens["refresh_token"]),
                "token_expires_at": tokens["expires_at"],
                "scopes": tokens["scopes"],
            },
            on_conflict="user_id,provider",
        ).execute()

        # Create JWT
        jwt_token = create_access_token(user_id)

        # Redirect to frontend with token
        return RedirectResponse(
            url=f"{settings.FRONTEND_URL}?token={jwt_token}", status_code=302
        )

    except Exception as e:
        return RedirectResponse(
            url=f"{settings.FRONTEND_URL}?error={str(e)}", status_code=302
        )


@router.get("/callback/microsoft")
async def callback_microsoft(code: str, state: Optional[str] = None):
    """Handle Microsoft OAuth callback."""
    try:
        microsoft = MicrosoftService()
        tokens = microsoft.exchange_code(code)

        # Get user info from Microsoft
        user_info = microsoft.get_user_info(tokens["access_token"])

        supabase = get_supabase()

        # Check if user exists
        existing = (
            supabase.table("users")
            .select("*")
            .eq("email", user_info["email"])
            .execute()
        )

        if existing.data:
            user_id = existing.data[0]["id"]
            supabase.table("users").update(
                {
                    "full_name": user_info.get("name"),
                    "avatar_url": user_info.get("picture"),
                }
            ).eq("id", user_id).execute()
        else:
            result = (
                supabase.table("users")
                .insert(
                    {
                        "email": user_info["email"],
                        "full_name": user_info.get("name"),
                        "avatar_url": user_info.get("picture"),
                    }
                )
                .execute()
            )
            user_id = result.data[0]["id"]

        # Store OAuth tokens
        supabase.table("oauth_tokens").upsert(
            {
                "user_id": user_id,
                "provider": "microsoft",
                "access_token": encrypt_token(tokens["access_token"]),
                "refresh_token": encrypt_token(tokens["refresh_token"]),
                "token_expires_at": tokens["expires_at"],
                "scopes": tokens["scopes"],
            },
            on_conflict="user_id,provider",
        ).execute()

        jwt_token = create_access_token(user_id)

        return RedirectResponse(
            url=f"{settings.FRONTEND_URL}?token={jwt_token}", status_code=302
        )

    except Exception as e:
        return RedirectResponse(
            url=f"{settings.FRONTEND_URL}?error={str(e)}", status_code=302
        )


@router.get("/me", response_model=User)
async def get_me(current_user: User = Depends(get_current_user)):
    """Get current authenticated user."""
    return current_user


@router.post("/logout")
async def logout(current_user: User = Depends(get_current_user)):
    """Logout current user (client should discard token)."""
    return {"message": "Logged out successfully"}
