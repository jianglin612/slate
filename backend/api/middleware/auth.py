from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from utils.jwt import decode_access_token
from db import get_supabase
from db.models import User

security = HTTPBearer()
security_optional = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> User:
    """Require authentication and return current user."""
    user_id = decode_access_token(credentials.credentials)
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )

    supabase = get_supabase()
    result = supabase.table("users").select("*").eq("id", user_id).single().execute()

    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    return User(**result.data)


async def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_optional),
) -> Optional[User]:
    """Optionally authenticate - returns None if no valid token."""
    if not credentials:
        return None

    user_id = decode_access_token(credentials.credentials)
    if not user_id:
        return None

    supabase = get_supabase()
    result = supabase.table("users").select("*").eq("id", user_id).single().execute()

    if not result.data:
        return None

    return User(**result.data)
