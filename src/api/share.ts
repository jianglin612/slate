import type { SharedReport, Comment, Reaction } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Share API doesn't require auth, so we use direct fetch
export const shareApi = {
  getReport: async (shareToken: string): Promise<SharedReport> => {
    const response = await fetch(`${API_BASE}/api/share/${shareToken}`);
    if (!response.ok) {
      throw new Error('Report not found');
    }
    return response.json();
  },

  addComment: async (
    shareToken: string,
    data: {
      task_id?: string;
      author_name: string;
      author_email: string;
      content: string;
    }
  ): Promise<Comment> => {
    const response = await fetch(`${API_BASE}/api/share/${shareToken}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to add comment');
    }
    return response.json();
  },

  addReaction: async (
    shareToken: string,
    data: {
      task_id?: string;
      author_email: string;
      emoji: string;
    }
  ): Promise<Reaction> => {
    const response = await fetch(`${API_BASE}/api/share/${shareToken}/reactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to add reaction');
    }
    return response.json();
  },

  removeReaction: async (
    shareToken: string,
    data: {
      task_id?: string;
      author_email: string;
      emoji: string;
    }
  ): Promise<void> => {
    const response = await fetch(`${API_BASE}/api/share/${shareToken}/reactions`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to remove reaction');
    }
  },

  // Invite methods require auth
  invite: async (reportId: string, email: string): Promise<void> => {
    const token = localStorage.getItem('slate_token');
    const response = await fetch(`${API_BASE}/api/share/${reportId}/invite`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ email }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to send invite');
    }
  },

  getInvites: async (reportId: string): Promise<{ email: string; invited_at: string }[]> => {
    const token = localStorage.getItem('slate_token');
    const response = await fetch(`${API_BASE}/api/share/${reportId}/invites`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      return [];
    }
    return response.json();
  },
};
