from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import (
    auth_router,
    reports_router,
    tasks_router,
    sync_router,
    ai_router,
    share_router,
    settings_router,
)
from config import get_settings

settings = get_settings()

app = FastAPI(
    title="Slate API",
    description="AI-powered task reporting backend",
    version="1.0.0",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router, prefix="/api/auth", tags=["auth"])
app.include_router(reports_router, prefix="/api/reports", tags=["reports"])
app.include_router(tasks_router, prefix="/api/tasks", tags=["tasks"])
app.include_router(sync_router, prefix="/api/sync", tags=["sync"])
app.include_router(ai_router, prefix="/api/ai", tags=["ai"])
app.include_router(share_router, prefix="/api/share", tags=["share"])
app.include_router(settings_router, prefix="/api/settings", tags=["settings"])


@app.get("/api/health")
async def health_check():
    return {"status": "healthy"}
