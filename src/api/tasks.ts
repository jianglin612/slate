import { api } from './client';
import type { Task, Priority, TaskSource, TaskCollaborator } from '../types';

export interface TaskCreate {
  title: string;
  description?: string;
  due_date?: string;
  priority?: Priority;
  source?: TaskSource;
  category?: string;
  is_private?: boolean;
  collaborators?: TaskCollaborator[];
}

export interface TaskUpdate {
  title?: string;
  description?: string;
  due_date?: string;
  priority?: Priority;
  category?: string;
  is_completed?: boolean;
  is_private?: boolean;
  sort_order?: number;
}

export interface TaskReorder {
  task_id: string;
  sort_order: number;
  category?: string;
}

export const tasksApi = {
  list: async (reportId: string): Promise<Task[]> => {
    return api.get<Task[]>(`/api/tasks/report/${reportId}`);
  },

  create: async (reportId: string, data: TaskCreate): Promise<Task> => {
    return api.post<Task>(`/api/tasks/report/${reportId}`, data);
  },

  update: async (taskId: string, data: TaskUpdate): Promise<Task> => {
    return api.put<Task>(`/api/tasks/${taskId}`, data);
  },

  delete: async (taskId: string): Promise<void> => {
    return api.delete(`/api/tasks/${taskId}`);
  },

  toggleComplete: async (taskId: string): Promise<Task> => {
    return api.put<Task>(`/api/tasks/${taskId}/complete`);
  },

  reorder: async (tasks: TaskReorder[]): Promise<void> => {
    return api.put('/api/tasks/reorder', { tasks });
  },
};
