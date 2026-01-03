from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime, date


# Auth models
class User(BaseModel):
    id: str
    email: str
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    created_at: Optional[datetime] = None


class TokenPayload(BaseModel):
    sub: str  # user_id
    exp: datetime


# Report models
PeriodType = Literal["weekly", "monthly", "quarterly"]
Priority = Literal["high", "medium", "low"]
TaskSource = Literal["email", "calendar", "both", "manual"]


class ReportCreate(BaseModel):
    period_type: PeriodType
    period_start: date
    period_end: date
    title: Optional[str] = None


class ReportUpdate(BaseModel):
    title: Optional[str] = None
    summary: Optional[str] = None
    allow_comments: Optional[bool] = None
    allow_reactions: Optional[bool] = None


class Report(BaseModel):
    id: str
    user_id: str
    period_type: PeriodType
    period_start: date
    period_end: date
    title: Optional[str] = None
    summary: Optional[str] = None
    is_published: bool = False
    share_token: Optional[str] = None
    allow_comments: bool = True
    allow_reactions: bool = True
    created_at: datetime
    updated_at: datetime


# Task models
class TaskCollaborator(BaseModel):
    id: Optional[str] = None
    name: str
    email: Optional[str] = None
    avatar_url: Optional[str] = None


class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    due_date: Optional[str] = None
    priority: Priority = "medium"
    source: TaskSource = "manual"
    category: str = "action-items"
    is_private: bool = False
    collaborators: list[TaskCollaborator] = []


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    due_date: Optional[str] = None
    priority: Optional[Priority] = None
    category: Optional[str] = None
    is_completed: Optional[bool] = None
    is_private: Optional[bool] = None
    sort_order: Optional[int] = None


class Task(BaseModel):
    id: str
    report_id: str
    user_id: str
    title: str
    description: Optional[str] = None
    due_date: Optional[str] = None
    priority: Priority = "medium"
    source: TaskSource = "manual"
    category: str = "action-items"
    is_completed: bool = False
    is_private: bool = False
    sort_order: int = 0
    ai_confidence: Optional[float] = None
    ai_context: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    collaborators: list[TaskCollaborator] = []


class TaskReorder(BaseModel):
    task_id: str
    sort_order: int
    category: Optional[str] = None


# Comment and Reaction models
class CommentCreate(BaseModel):
    task_id: Optional[str] = None
    author_name: str
    author_email: str
    content: str


class Comment(BaseModel):
    id: str
    report_id: str
    task_id: Optional[str] = None
    author_name: str
    author_email: str
    content: str
    created_at: datetime


class ReactionCreate(BaseModel):
    task_id: Optional[str] = None
    author_email: str
    emoji: str


class Reaction(BaseModel):
    id: str
    report_id: str
    task_id: Optional[str] = None
    author_email: str
    emoji: str
    created_at: datetime


# Category models
class CategoryCreate(BaseModel):
    name: str
    icon: str = "Folder"
    color: str = "blue"


class Category(BaseModel):
    id: str
    user_id: str
    name: str
    icon: str
    color: str
    sort_order: int


# Sync models
class SyncRequest(BaseModel):
    report_id: str


class SuggestedTask(BaseModel):
    title: str
    description: Optional[str] = None
    due_date: Optional[str] = None
    priority: Priority = "medium"
    source: TaskSource
    category: str = "action-items"
    ai_confidence: float
    ai_context: Optional[str] = None
    collaborators: list[TaskCollaborator] = []


class SyncResponse(BaseModel):
    emails_fetched: int
    events_fetched: int
    suggested_tasks: list[SuggestedTask]
