export interface User {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
}

export type PeriodType = 'weekly' | 'monthly' | 'quarterly';
export type Priority = 'high' | 'medium' | 'low';
export type TaskSource = 'email' | 'calendar' | 'both' | 'manual';

export interface TaskCollaborator {
  id?: string;
  name: string;
  email?: string;
  avatar_url?: string;
}

export interface Task {
  id: string;
  report_id: string;
  user_id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  priority: Priority;
  source: TaskSource;
  category: string;
  is_completed: boolean;
  is_private: boolean;
  sort_order: number;
  ai_confidence: number | null;
  ai_context: string | null;
  created_at: string;
  updated_at: string;
  task_collaborators: TaskCollaborator[];
}

export interface Report {
  id: string;
  user_id: string;
  period_type: PeriodType;
  period_start: string;
  period_end: string;
  title: string | null;
  summary: string | null;
  is_published: boolean;
  share_token: string | null;
  allow_comments: boolean;
  allow_reactions: boolean;
  created_at: string;
  updated_at: string;
  tasks?: Task[];
}

export interface SuggestedTask {
  title: string;
  description: string | null;
  due_date: string | null;
  priority: Priority;
  source: TaskSource;
  category: string;
  ai_confidence: number;
  ai_context: string | null;
  collaborators: TaskCollaborator[];
}

export interface SyncResponse {
  emails_fetched: number;
  events_fetched: number;
  suggested_tasks: SuggestedTask[];
  ai_error?: string;
}

export interface Comment {
  id: string;
  report_id: string;
  task_id: string | null;
  author_name: string;
  author_email: string;
  content: string;
  created_at: string;
}

export interface Reaction {
  id: string;
  report_id: string;
  task_id: string | null;
  author_email: string;
  emoji: string;
  created_at: string;
}

export interface SharedReport {
  id: string;
  period_type: PeriodType;
  period_start: string;
  period_end: string;
  title: string | null;
  summary: string | null;
  allow_comments: boolean;
  allow_reactions: boolean;
  user_name: string | null;
  user_avatar: string | null;
  tasks: Task[];
  comments: Comment[];
  reactions: Reaction[];
}

export interface Category {
  id: string;
  user_id: string;
  name: string;
  icon: string;
  color: string;
  sort_order: number;
}

export interface IntegrationStatus {
  provider: 'google' | 'microsoft';
  connected: boolean;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}
