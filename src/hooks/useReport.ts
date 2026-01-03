import { useState, useEffect, useCallback, useRef } from 'react';
import { reportsApi, tasksApi, syncApi, aiApi } from '../api';
import type { Report, Task, SuggestedTask, PeriodType } from '../types';

// Convert API task to frontend Task format
function apiTaskToTask(apiTask: any): Task {
  return {
    id: apiTask.id,
    title: apiTask.title,
    description: apiTask.description || '',
    dueDate: apiTask.due_date || '',
    priority: apiTask.priority,
    source: apiTask.source,
    teamMembers: (apiTask.task_collaborators || []).map((c: any) => ({
      id: c.id || crypto.randomUUID(),
      name: c.name,
      avatar: c.avatar_url || '',
    })),
    category: apiTask.category,
    isPrivate: apiTask.is_private,
    completed: apiTask.is_completed,
  };
}

// Convert frontend Task to API format
function taskToApiTask(task: any) {
  return {
    title: task.title,
    description: task.description,
    due_date: task.dueDate,
    priority: task.priority,
    source: task.source || 'manual',
    category: task.category,
    is_private: task.isPrivate || false,
    is_completed: task.completed || false,
    collaborators: (task.teamMembers || []).map((m: any) => ({
      name: m.name,
      email: m.email,
      avatar_url: m.avatar,
    })),
  };
}

export function useReport(periodType: PeriodType = 'weekly', weekOffset: number = 0) {
  const [report, setReport] = useState<Report | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isNavigating, setIsNavigating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestedTasks, setSuggestedTasks] = useState<SuggestedTask[]>([]);
  const isInitialLoad = useRef(true);

  // Load current report
  const loadReport = useCallback(async () => {
    // Only show full loading on initial load, not when navigating weeks
    if (isInitialLoad.current) {
      setIsLoading(true);
    } else {
      setIsNavigating(true);
    }
    setError(null);
    try {
      const reportData = await reportsApi.getCurrent(periodType, weekOffset);
      setReport(reportData);

      // Load tasks for this report
      if (reportData.id) {
        const tasksData = await tasksApi.list(reportData.id);
        setTasks(tasksData.map(apiTaskToTask));
      } else {
        setTasks([]);
      }
    } catch (err) {
      setError('Failed to load report');
      console.error(err);
    } finally {
      setIsLoading(false);
      setIsNavigating(false);
      isInitialLoad.current = false;
    }
  }, [periodType, weekOffset]);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  // Sync with email/calendar
  const sync = useCallback(async () => {
    if (!report?.id) return { suggested: [] };

    try {
      const response = await syncApi.sync(report.id);
      setSuggestedTasks(response.suggested_tasks);
      return { suggested: response.suggested_tasks };
    } catch (err) {
      console.error('Sync failed:', err);
      throw err;
    }
  }, [report?.id]);

  // Add suggested tasks
  const addSuggestedTasks = useCallback(async (tasksToAdd: SuggestedTask[]) => {
    if (!report?.id) return;

    const newTasks: Task[] = [];
    for (const suggested of tasksToAdd) {
      try {
        const created = await tasksApi.create(report.id, {
          title: suggested.title,
          description: suggested.description || undefined,
          due_date: suggested.due_date || undefined,
          priority: suggested.priority,
          source: suggested.source,
          category: suggested.category,
          collaborators: suggested.collaborators,
        });
        newTasks.push(apiTaskToTask(created));
      } catch (err) {
        console.error('Failed to create task:', err);
      }
    }
    setTasks(prev => [...prev, ...newTasks]);
    setSuggestedTasks([]);
  }, [report?.id]);

  // Create task
  const createTask = useCallback(async (task: Partial<Task>) => {
    if (!report?.id) return;

    try {
      const created = await tasksApi.create(report.id, taskToApiTask(task));
      setTasks(prev => [...prev, apiTaskToTask(created)]);
      return created;
    } catch (err) {
      console.error('Failed to create task:', err);
      throw err;
    }
  }, [report?.id]);

  // Update task
  const updateTask = useCallback(async (taskId: string, updates: Partial<Task>) => {
    try {
      const apiUpdates: any = {};
      if (updates.title !== undefined) apiUpdates.title = updates.title;
      if (updates.description !== undefined) apiUpdates.description = updates.description;
      if (updates.dueDate !== undefined) apiUpdates.due_date = updates.dueDate;
      if (updates.priority !== undefined) apiUpdates.priority = updates.priority;
      if (updates.category !== undefined) apiUpdates.category = updates.category;
      if (updates.completed !== undefined) apiUpdates.is_completed = updates.completed;
      if (updates.isPrivate !== undefined) apiUpdates.is_private = updates.isPrivate;

      const updated = await tasksApi.update(taskId, apiUpdates);
      setTasks(prev => prev.map(t => t.id === taskId ? apiTaskToTask(updated) : t));
      return updated;
    } catch (err) {
      console.error('Failed to update task:', err);
      throw err;
    }
  }, []);

  // Delete task
  const deleteTask = useCallback(async (taskId: string) => {
    try {
      await tasksApi.delete(taskId);
      setTasks(prev => prev.filter(t => t.id !== taskId));
    } catch (err) {
      console.error('Failed to delete task:', err);
      throw err;
    }
  }, []);

  // Toggle task completion
  const toggleComplete = useCallback(async (taskId: string) => {
    try {
      const updated = await tasksApi.toggleComplete(taskId);
      setTasks(prev => prev.map(t => t.id === taskId ? apiTaskToTask(updated) : t));
    } catch (err) {
      console.error('Failed to toggle task:', err);
      throw err;
    }
  }, []);

  // Reorder tasks
  const reorderTasks = useCallback(async (reorderedTasks: { task_id: string; sort_order: number; category?: string }[]) => {
    try {
      const reorderMap = new Map(reorderedTasks.map(r => [r.task_id, r]));
      const targetCategory = reorderedTasks[0]?.category;

      setTasks(prev => {
        // Separate tasks by category
        const targetCategoryTasks: Task[] = [];
        const otherTasks: Task[] = [];

        for (const task of prev) {
          const reorder = reorderMap.get(task.id);
          if (reorder) {
            // Task is being reordered - update its category and store with sort order
            targetCategoryTasks.push({
              ...task,
              category: reorder.category || task.category
            });
          } else if (task.category === targetCategory) {
            // Task is in target category but not in reorder - shouldn't happen but handle it
            targetCategoryTasks.push(task);
          } else {
            // Task is in a different category - keep as is
            otherTasks.push(task);
          }
        }

        // Sort target category tasks by their new sort_order
        targetCategoryTasks.sort((a, b) => {
          const aOrder = reorderMap.get(a.id)?.sort_order ?? 0;
          const bOrder = reorderMap.get(b.id)?.sort_order ?? 0;
          return aOrder - bOrder;
        });

        // Reconstruct: other categories first (in original order), then sorted target category
        return [...otherTasks, ...targetCategoryTasks];
      });

      // Then persist to backend
      await tasksApi.reorder(reorderedTasks);
    } catch (err) {
      console.error('Failed to reorder tasks:', err);
      // Reload on error to restore correct state
      loadReport();
    }
  }, [loadReport]);

  // Publish report
  const publishReport = useCallback(async () => {
    if (!report?.id) return null;

    try {
      const published = await reportsApi.publish(report.id);
      setReport(published);
      return published;
    } catch (err) {
      console.error('Failed to publish report:', err);
      throw err;
    }
  }, [report?.id]);

  // Generate AI summary
  const generateSummary = useCallback(async () => {
    if (!report?.id) return null;

    try {
      const response = await aiApi.generateSummary(report.id);
      setReport(prev => prev ? { ...prev, summary: response.summary } : null);
      return response.summary;
    } catch (err) {
      console.error('Failed to generate summary:', err);
      throw err;
    }
  }, [report?.id]);

  return {
    report,
    tasks,
    isLoading,
    isNavigating,
    error,
    suggestedTasks,
    sync,
    addSuggestedTasks,
    createTask,
    updateTask,
    deleteTask,
    toggleComplete,
    reorderTasks,
    publishReport,
    generateSummary,
    refresh: loadReport,
  };
}
