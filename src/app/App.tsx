import { useState, useCallback, useEffect } from 'react';
import { RefreshCw, Share2, Video, Package, FileText, Zap, Plus, ChevronLeft, ChevronRight, Users, Eye, Search, Settings, Home, Sun, Moon, Menu, BarChart3, Send } from 'lucide-react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Task, TaskCard } from './components/TaskCard';
import { TaskGroup } from './components/TaskGroup';
import { SyncModal } from './components/SyncModal';
import { SummaryView } from './components/SummaryView';
import { SyncBanner } from './components/SyncBanner';
import { SuggestedTasksModal } from './components/SuggestedTasksModal';
import { TaskSidePanel } from './components/TaskSidePanel';
import { EditTaskModal } from './components/EditTaskModal';
import { PublishModal } from './components/PublishModal';
import { TaskTemplates } from './components/TaskTemplates';
import { SettingsModal } from './components/SettingsModal';
import { SearchBar } from './components/SearchBar';
import { TeamSlateDetail } from './components/TeamSlateDetail';
import { AIAssistantPanel } from './components/AIAssistantPanel';
import { AITaskBreakdown } from './components/AITaskBreakdown';
import { AIStandupGenerator } from './components/AIStandupGenerator';
import { AIDailyPlanner } from './components/AIDailyPlanner';
import { useReport } from '../hooks/useReport';
import { useAuth } from '../context/AuthContext';
import type { SuggestedTask, PeriodType } from '../types';

// Team member type for Team view
interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
  tasks: Task[];
}

// Empty team members array - will be populated from API in future
const teamMembers: TeamMember[] = [];

type ViewMode = 'my-week' | 'team' | 'published' | 'summary';
type Theme = 'dark' | 'light';
type SummaryPeriod = 'monthly' | 'quarterly' | 'yearly';

export default function App() {
  const { user, logout } = useAuth();
  const [periodType, setPeriodType] = useState<PeriodType>('weekly');
  const [currentWeek, setCurrentWeek] = useState(0);

  const {
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
    refresh,
  } = useReport(periodType, currentWeek);

  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [customCategories, setCustomCategories] = useState<Array<{ id: string; name: string; icon: string; color: string }>>([
    { id: 'custom-client-work', name: 'Client Work', icon: 'Briefcase', color: 'blue' },
    { id: 'custom-personal', name: 'Personal', icon: 'User', color: 'green' }
  ]);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [detailTask, setDetailTask] = useState<Task | null>(null);
  const [showPublish, setShowPublish] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('my-week');
  const [selectedTeamMember, setSelectedTeamMember] = useState<typeof teamMembers[0] | null>(null);
  const [theme, setTheme] = useState<Theme>('dark');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [teamViewMode, setTeamViewMode] = useState<'by-user' | 'all-tasks'>('by-user');
  const [summaryPeriod, setSummaryPeriod] = useState<SummaryPeriod>('monthly');
  const [pendingSuggestions, setPendingSuggestions] = useState<SuggestedTask[]>([]);
  const [hasSynced, setHasSynced] = useState(false);

  // AI Assistant states
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [showAIBreakdown, setShowAIBreakdown] = useState(false);
  const [showAIStandup, setShowAIStandup] = useState(false);
  const [showAIPlanner, setShowAIPlanner] = useState(false);
  const [selectedTaskForBreakdown, setSelectedTaskForBreakdown] = useState<Task | null>(null);

  // Update filtered tasks when tasks change
  useEffect(() => {
    setFilteredTasks(tasks);
  }, [tasks]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in input fields
      const target = e.target as HTMLElement;
      const isTyping = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearch(true);
      }
      if (e.key === 'n' && !e.metaKey && !e.ctrlKey && !e.altKey && !isTyping) {
        e.preventDefault();
        setEditingTask({} as Task);
      }
      if (e.key === 't' && !e.metaKey && !e.ctrlKey && !e.altKey && !isTyping) {
        e.preventDefault();
        setShowTemplates(true);
      }
      if (e.key === 'Escape') {
        setShowSearch(false);
        setShowTemplates(false);
        setShowSettings(false);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const getWeekLabel = () => {
    if (report) {
      const periodLabel = report.period_type.charAt(0).toUpperCase() + report.period_type.slice(1);
      return `${periodLabel} • ${report.period_start} - ${report.period_end}`;
    }
    if (currentWeek === 0) return 'This Week • Jan 6-12, 2026';
    if (currentWeek === -1) return 'Last Week • Dec 30-Jan 5, 2026';
    if (currentWeek === 1) return 'Next Week • Jan 13-19, 2026';
    return `Week ${currentWeek > 0 ? '+' : ''}${currentWeek}`;
  };

  const handleSync = () => {
    setIsSyncing(true);
  };

  const handleSyncComplete = (suggestions: SuggestedTask[]) => {
    setIsSyncing(false);
    setHasSynced(true);
    if (suggestions.length > 0) {
      setPendingSuggestions(suggestions);
      setTimeout(() => {
        setShowSuggestions(true);
      }, 300);
    }
  };

  const handleAddSuggestedTasks = async (newTasks: any[]) => {
    await addSuggestedTasks(newTasks);
    setShowSuggestions(false);
    setPendingSuggestions([]);
  };

  // Use filteredTasks for grouping so drag/drop visual updates work
  const groupedTasks = filteredTasks.reduce((acc, task) => {
    if (!acc[task.category]) {
      acc[task.category] = [];
    }
    acc[task.category].push(task);
    return acc;
  }, {} as Record<string, Task[]>);

  // Handle task move - called only on drop for reliability
  const handleMoveComplete = useCallback((dragId: string, dropTargetId: string | null, targetCategory: string) => {
    console.log('handleMoveComplete called:', { dragId, dropTargetId, targetCategory });

    const dragIndex = tasks.findIndex(t => t.id === dragId);
    if (dragIndex === -1) return;

    const newTasks = [...tasks];
    const [draggedTask] = newTasks.splice(dragIndex, 1);

    // Update category if moving between categories
    const updatedTask = { ...draggedTask, category: targetCategory };

    if (dropTargetId === null) {
      // Drop at end of category - just push to the end
      newTasks.push(updatedTask);
    } else {
      // Drop on a specific task - insert before it
      const newDropIndex = newTasks.findIndex(t => t.id === dropTargetId);
      if (newDropIndex === -1) return;
      newTasks.splice(newDropIndex, 0, updatedTask);
    }

    // Build reorder data for all tasks in the target category
    const categoryTasks = newTasks.filter(t => t.category === targetCategory);
    const reorderData = categoryTasks.map((task, idx) => ({
      task_id: task.id,
      sort_order: idx,
      category: targetCategory,
    }));

    // This will update both local state and persist to backend
    reorderTasks(reorderData);
  }, [tasks, reorderTasks]);

  const handleEdit = (task: Task) => {
    setDetailTask(task);
  };

  const handleSaveEdit = async (updatedTask: Task) => {
    await updateTask(updatedTask.id, updatedTask);
    setDetailTask(null);
  };

  const handleDelete = async (taskId: string) => {
    await deleteTask(taskId);
  };

  const handleToggleComplete = async (taskId: string) => {
    await toggleComplete(taskId);
  };

  const handlePublished = (publishedReport: any) => {
    // Report state is updated via useReport hook
    refresh();
  };

  const stats = {
    total: tasks.length,
    highPriority: tasks.filter(t => t.priority === 'high').length,
    meetings: groupedTasks.meetings?.length || 0,
    dueToday: tasks.filter(t => t.dueDate?.toLowerCase().includes('today')).length,
  };

  // Theme classes
  const isDark = theme === 'dark';
  const bgClass = isDark ? 'bg-[#131416]' : 'bg-[#fafafa]';
  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const borderClass = isDark ? 'border-gray-800/50' : 'border-gray-200';
  const hoverBg = isDark ? 'hover:bg-white/5' : 'hover:bg-gray-100';

  // Loading state
  if (isLoading) {
    return (
      <div className={`min-h-screen ${bgClass} flex items-center justify-center`}>
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className={`h-screen overflow-hidden ${bgClass} ${textClass} flex`}>
        {/* Sidebar */}
        <aside className={`${sidebarOpen ? 'w-64' : 'w-16'} ${isDark ? 'bg-[#1a1b1e] border-gray-800/50' : 'bg-white border-gray-200'} border-r flex-shrink-0 transition-all duration-300 flex flex-col h-screen`}>
          {/* Logo */}
          <div className="p-4 border-b ${borderClass}">
            {sidebarOpen ? (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-lg flex items-center justify-center shadow-lg">
                  <div className={`w-4 h-4 ${isDark ? 'bg-[#131416]' : 'bg-white'} rounded`}></div>
                </div>
                <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Slate</h1>
              </div>
            ) : (
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-lg flex items-center justify-center shadow-lg mx-auto">
                <div className={`w-4 h-4 ${isDark ? 'bg-[#131416]' : 'bg-white'} rounded`}></div>
              </div>
            )}
          </div>

          {/* Navigation - Independently Scrollable */}
          <nav className="flex-1 overflow-y-auto p-3 space-y-1">
            <button
              onClick={() => setViewMode('my-week')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                viewMode === 'my-week'
                  ? (isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-50 text-blue-600')
                  : (isDark ? 'text-gray-400 hover:bg-white/5' : 'text-gray-600 hover:bg-gray-100')
              }`}
            >
              <Home className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span className="text-sm font-medium">My Week</span>}
            </button>

            <button
              onClick={() => setViewMode('team')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                viewMode === 'team'
                  ? (isDark ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-50 text-purple-600')
                  : (isDark ? 'text-gray-400 hover:bg-white/5' : 'text-gray-600 hover:bg-gray-100')
              }`}
            >
              <Users className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span className="text-sm font-medium">Team</span>}
            </button>

            <button
              onClick={() => setViewMode('published')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                viewMode === 'published'
                  ? (isDark ? 'bg-green-500/20 text-green-400' : 'bg-green-50 text-green-600')
                  : (isDark ? 'text-gray-400 hover:bg-white/5' : 'text-gray-600 hover:bg-gray-100')
              }`}
            >
              <Eye className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span className="text-sm font-medium">Published</span>}
            </button>

            <button
              onClick={() => setViewMode('summary')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                viewMode === 'summary'
                  ? (isDark ? 'bg-orange-500/20 text-orange-400' : 'bg-orange-50 text-orange-600')
                  : (isDark ? 'text-gray-400 hover:bg-white/5' : 'text-gray-600 hover:bg-gray-100')
              }`}
            >
              <BarChart3 className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span className="text-sm font-medium">Review</span>}
            </button>

            <div className={`my-4 border-t ${borderClass}`}></div>

            <button
              onClick={() => setShowAIStandup(true)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${isDark ? 'text-gray-400 hover:bg-white/5' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <Send className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span className="text-sm font-medium">Send</span>}
            </button>

            <button
              onClick={() => setShowSearch(true)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${isDark ? 'text-gray-400 hover:bg-white/5' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <Search className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span className="text-sm font-medium">Search</span>}
              {sidebarOpen && <kbd className={`ml-auto px-1.5 py-0.5 ${isDark ? 'bg-gray-800/50 text-gray-500' : 'bg-gray-100 text-gray-500'} rounded text-xs`}>⌘K</kbd>}
            </button>

            {/* Team Members Section */}
            {sidebarOpen && (
              <>
                <div className={`my-4 border-t ${borderClass}`}></div>
                <div className={`px-3 py-2 text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  Team
                </div>
                {/* Example team members - will be populated from backend */}
                <button
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${isDark ? 'text-gray-400 hover:bg-white/5' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
                    SC
                  </div>
                  <div className="flex flex-col items-start min-w-0">
                    <span className="text-sm font-medium truncate">Sarah Chen</span>
                    <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'} truncate`}>Product Manager</span>
                  </div>
                </button>
                <button
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${isDark ? 'text-gray-400 hover:bg-white/5' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
                    MJ
                  </div>
                  <div className="flex flex-col items-start min-w-0">
                    <span className="text-sm font-medium truncate">Mike Johnson</span>
                    <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'} truncate`}>Engineering Lead</span>
                  </div>
                </button>
              </>
            )}
          </nav>

          {/* Bottom Actions */}
          <div className={`p-3 border-t ${borderClass} space-y-1`}>
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${isDark ? 'text-gray-400 hover:bg-white/5' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              {theme === 'dark' ? <Sun className="w-5 h-5 flex-shrink-0" /> : <Moon className="w-5 h-5 flex-shrink-0" />}
              {sidebarOpen && <span className="text-sm font-medium">{theme === 'dark' ? 'Light' : 'Dark'} Mode</span>}
            </button>

            <button
              onClick={() => setShowSettings(true)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${isDark ? 'text-gray-400 hover:bg-white/5' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <Settings className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span className="text-sm font-medium">Settings</span>}
            </button>

            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${isDark ? 'text-gray-400 hover:bg-white/5' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <Menu className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span className="text-sm font-medium">Collapse</span>}
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
          {/* Header */}
          <header className={`border-b ${borderClass} ${isDark ? 'bg-gradient-to-b from-[#1a1b1e] to-[#131416]' : 'bg-white'} sticky top-0 z-40 backdrop-blur-xl`}>
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {viewMode === 'my-week' ? 'My Week' : viewMode === 'team' ? 'Team' : viewMode === 'published' ? 'Published' : 'Summary'}
                  </h2>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mt-0.5`}>{getWeekLabel()}</p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleSync}
                    disabled={isSyncing}
                    className={`flex items-center gap-2 px-4 py-2.5 ${isDark ? 'bg-white/5 hover:bg-white/10 border-gray-700/50' : 'bg-gray-100 hover:bg-gray-200 border-gray-200'} border rounded-xl transition-all text-sm ${
                      isSyncing ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>Sync</span>
                  </button>

                  <button
                    onClick={() => setShowPublish(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl transition-all text-sm shadow-lg shadow-blue-500/20"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Share</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Week Navigator */}
            <div className={`px-6 py-3 border-t ${borderClass}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setCurrentWeek(w => w - 1)}
                    className={`p-2 ${hoverBg} rounded-lg transition-all border ${borderClass}`}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} flex items-center gap-2`}>
                    {getWeekLabel()}
                    {isNavigating && (
                      <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    )}
                  </span>

                  <button
                    onClick={() => setCurrentWeek(w => w + 1)}
                    className={`p-2 ${hoverBg} rounded-lg transition-all border ${borderClass}`}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  {currentWeek !== 0 && (
                    <button
                      onClick={() => setCurrentWeek(0)}
                      className={`px-3 py-1.5 text-xs ${isDark ? 'text-blue-400 hover:bg-blue-500/10' : 'text-blue-600 hover:bg-blue-50'} rounded-lg transition-all`}
                    >
                      Back to current
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <span className={isDark ? 'text-gray-500' : 'text-gray-600'}>Total</span>
                    <span className={`font-medium px-2.5 py-1 ${isDark ? 'bg-white/10 border-gray-700/50' : 'bg-gray-100 border-gray-200'} border rounded-lg`}>{stats.total}</span>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-auto p-6">
            {viewMode === 'my-week' && (
              <div className={`max-w-5xl mx-auto space-y-6 animate-fade-in transition-opacity duration-200 ${isNavigating ? 'opacity-50' : 'opacity-100'}`}>
                {/* Sync Banner - only show if not synced yet */}
                {!hasSynced && <SyncBanner theme={theme} onSync={handleSync} />}

                <TaskGroup
                  title="Action Items"
                  tasks={groupedTasks['action-items'] || []}
                  icon={<Zap className="w-4 h-4 text-amber-400" />}
                  categoryId="action-items"
                  onMoveComplete={handleMoveComplete}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onToggleComplete={handleToggleComplete}
                  onBreakdown={(task) => {
                    setSelectedTaskForBreakdown(task);
                    setShowAIBreakdown(true);
                  }}
                  theme={theme}
                />

                <TaskGroup
                  title="Meetings"
                  tasks={groupedTasks.meetings || []}
                  icon={<Video className="w-4 h-4 text-blue-400" />}
                  categoryId="meetings"
                  onMoveComplete={handleMoveComplete}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onToggleComplete={handleToggleComplete}
                  onBreakdown={(task) => {
                    setSelectedTaskForBreakdown(task);
                    setShowAIBreakdown(true);
                  }}
                  theme={theme}
                />

                <TaskGroup
                  title="Deliverables"
                  tasks={groupedTasks.deliverables || []}
                  icon={<FileText className="w-4 h-4 text-green-400" />}
                  categoryId="deliverables"
                  onMoveComplete={handleMoveComplete}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onToggleComplete={handleToggleComplete}
                  onBreakdown={(task) => {
                    setSelectedTaskForBreakdown(task);
                    setShowAIBreakdown(true);
                  }}
                  theme={theme}
                />

                <TaskGroup
                  title="Active Projects"
                  tasks={groupedTasks.projects || []}
                  icon={<Package className="w-4 h-4 text-purple-400" />}
                  categoryId="projects"
                  onMoveComplete={handleMoveComplete}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onToggleComplete={handleToggleComplete}
                  onBreakdown={(task) => {
                    setSelectedTaskForBreakdown(task);
                    setShowAIBreakdown(true);
                  }}
                  theme={theme}
                />

                {/* Custom Categories */}
                {customCategories.map((category) => (
                  <TaskGroup
                    key={category.id}
                    title={category.name}
                    tasks={groupedTasks[category.id] || []}
                    icon={<Package className={`w-4 h-4 text-${category.color}-400`} />}
                    categoryId={category.id}
                    onMoveComplete={handleMoveComplete}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onToggleComplete={handleToggleComplete}
                    onBreakdown={(task) => {
                      setSelectedTaskForBreakdown(task);
                      setShowAIBreakdown(true);
                    }}
                    theme={theme}
                  />
                ))}

                <button
                  onClick={() => setEditingTask({} as Task)}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-4 border-2 border-dashed ${isDark ? 'border-gray-700/50 hover:border-gray-600/50 text-gray-400 hover:text-gray-300' : 'border-gray-300 hover:border-gray-400 text-gray-600 hover:text-gray-700'} rounded-xl transition-all ${hoverBg}`}
                >
                  <Plus className="w-5 h-5" />
                  <span>Add Task Manually</span>
                </button>
              </div>
            )}

            {viewMode === 'team' && (
              <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
                {/* Team View Toggle */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setTeamViewMode('by-user')}
                      className={`px-4 py-2 rounded-lg text-sm transition-all ${
                        teamViewMode === 'by-user'
                          ? (isDark ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'bg-purple-50 text-purple-600 border border-purple-200')
                          : (isDark ? 'text-gray-400 hover:bg-white/5' : 'text-gray-600 hover:bg-gray-100')
                      }`}
                    >
                      By User
                    </button>
                    <button
                      onClick={() => setTeamViewMode('all-tasks')}
                      className={`px-4 py-2 rounded-lg text-sm transition-all ${
                        teamViewMode === 'all-tasks'
                          ? (isDark ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'bg-purple-50 text-purple-600 border border-purple-200')
                          : (isDark ? 'text-gray-400 hover:bg-white/5' : 'text-gray-600 hover:bg-gray-100')
                      }`}
                    >
                      All Tasks
                    </button>
                  </div>
                </div>

                {/* By User View */}
                {teamViewMode === 'by-user' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {teamMembers.map((member) => (
                      <button
                        key={member.id}
                        onClick={() => setSelectedTeamMember(member)}
                        className={`${isDark ? 'bg-gradient-to-br from-white/[0.07] to-white/[0.03] border-gray-800/50 hover:border-gray-700/50' : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-lg'} border rounded-xl p-6 transition-all cursor-pointer text-left`}
                      >
                        <div className="flex items-start gap-3 mb-5">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium shadow-lg">
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div className="flex-1">
                            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{member.name}</h3>
                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{member.role}</p>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className={`flex items-center justify-between text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'} mb-3 pb-2 border-b ${borderClass}`}>
                            <span>This Week</span>
                            <span className={`font-medium ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>{member.tasks.length} tasks</span>
                          </div>

                          {member.tasks.slice(0, 2).map((task) => (
                            <div
                              key={task.id}
                              className={`p-3 ${isDark ? 'bg-black/30 border-gray-800/50' : 'bg-gray-50 border-gray-200'} border rounded-lg`}
                            >
                              <p className={`text-sm font-medium mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{task.title}</p>
                              <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>{task.dueDate}</p>
                            </div>
                          ))}
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* All Tasks View */}
                {teamViewMode === 'all-tasks' && (
                  <div className="space-y-4">
                    {teamMembers.flatMap(member =>
                      member.tasks.map(task => ({ ...task, assignedTo: member }))
                    ).map((task) => (
                      <button
                        key={task.id}
                        onClick={() => handleEdit(task)}
                        className={`w-full ${isDark ? 'bg-gradient-to-br from-white/[0.07] to-white/[0.03] border-gray-800/50 hover:border-gray-700/50' : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-lg'} border rounded-xl p-5 transition-all cursor-pointer text-left group`}
                      >
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div className="flex-1">
                            <h3 className={`font-semibold mb-1 ${isDark ? 'text-white group-hover:text-blue-400' : 'text-gray-900 group-hover:text-blue-600'} transition-colors`}>
                              {task.title}
                            </h3>
                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{task.description}</p>
                          </div>
                          <span className={`px-2.5 py-1 rounded-lg text-xs border whitespace-nowrap ${
                            task.priority === 'high'
                              ? (isDark ? 'bg-red-500/10 text-red-400 border-red-500/30' : 'bg-red-50 text-red-600 border-red-200')
                              : task.priority === 'medium'
                              ? (isDark ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' : 'bg-amber-50 text-amber-600 border-amber-200')
                              : (isDark ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' : 'bg-blue-50 text-blue-600 border-blue-200')
                          }`}>
                            {task.priority}
                          </span>
                        </div>

                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-medium">
                              {task.assignedTo.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{task.assignedTo.name}</span>
                          </div>
                          <span className={isDark ? 'text-gray-600' : 'text-gray-400'}>•</span>
                          <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{task.dueDate}</span>
                          <span className={isDark ? 'text-gray-600' : 'text-gray-400'}>•</span>
                          <span className={`text-xs px-2 py-0.5 rounded ${isDark ? 'bg-white/5 text-gray-400' : 'bg-gray-100 text-gray-600'} capitalize`}>
                            {task.category.replace('-', ' ')}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {viewMode === 'published' && (
              <div className="max-w-3xl mx-auto animate-fade-in">
                <div className={`${isDark ? 'bg-gradient-to-br from-white/[0.07] to-white/[0.03] border-gray-800/50' : 'bg-white border-gray-200 shadow-lg'} border rounded-xl p-8`}>
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                      {user?.full_name?.split(' ').map(n => n[0]).join('') || 'ME'}
                    </div>
                    <h3 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {report?.title || 'My Weekly Summary'}
                    </h3>
                    <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>{getWeekLabel()}</p>
                    {report?.summary && (
                      <p className={`mt-4 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{report.summary}</p>
                    )}
                  </div>

                  <div className="space-y-6">
                    {Object.entries(groupedTasks).map(([category, categoryTasks]) => (
                      <div key={category}>
                        <h4 className={`text-sm font-semibold uppercase tracking-wider mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {category.replace('-', ' ')}
                        </h4>
                        <div className="space-y-2">
                          {categoryTasks.map((task) => (
                            <div
                              key={task.id}
                              className={`p-4 ${isDark ? 'bg-black/30 border-gray-800/50' : 'bg-gray-50 border-gray-200'} border rounded-lg`}
                            >
                              <h5 className={`font-medium mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{task.title}</h5>
                              <p className={`text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{task.description}</p>
                              <div className={`flex items-center gap-3 text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                                <span>{task.dueDate}</span>
                                {task.teamMembers && task.teamMembers.length > 0 && (
                                  <>
                                    <span>•</span>
                                    <span>With {task.teamMembers.map(m => m.name.split(' ')[0]).join(', ')}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {viewMode === 'summary' && (
              <SummaryView
                tasks={tasks}
                period={summaryPeriod}
                theme={theme}
                onPeriodChange={setSummaryPeriod}
              />
            )}
          </main>
        </div>

        {/* Modals */}
        <SyncModal
          isOpen={isSyncing}
          onClose={() => setIsSyncing(false)}
          onComplete={handleSyncComplete}
          reportId={report?.id}
          theme={theme}
        />
        <SuggestedTasksModal
          isOpen={showSuggestions}
          suggestions={pendingSuggestions.map(s => ({
            id: s.id || crypto.randomUUID(),
            title: s.title,
            description: s.description || '',
            dueDate: s.due_date || '',
            priority: s.priority,
            source: s.source,
            category: s.category,
            confidence: s.ai_confidence || 85,
            context: s.ai_context || '',
            teamMembers: (s.collaborators || []).map((c: any) => ({
              id: crypto.randomUUID(),
              name: c.name,
              avatar: c.avatar_url || '',
            })),
          }))}
          onClose={() => {
            setShowSuggestions(false);
            setPendingSuggestions([]);
          }}
          onAddTasks={handleAddSuggestedTasks}
        />
        <TaskSidePanel
          task={detailTask}
          isOpen={!!detailTask}
          onClose={() => setDetailTask(null)}
          onSave={handleSaveEdit}
        />
        <EditTaskModal
          task={editingTask}
          isOpen={!!editingTask}
          onClose={() => setEditingTask(null)}
          onSave={async (task) => {
            if (task.id) {
              await handleSaveEdit(task);
            } else {
              await createTask(task);
            }
            setEditingTask(null);
          }}
          theme={theme}
        />
        <PublishModal
          isOpen={showPublish}
          onClose={() => setShowPublish(false)}
          report={report}
          onPublished={handlePublished}
          theme={theme}
        />
        <TaskTemplates
          isOpen={showTemplates}
          onClose={() => setShowTemplates(false)}
          onSelectTemplate={async (template) => {
            await createTask(template as Task);
            setShowTemplates(false);
          }}
        />
        <SettingsModal
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          customCategories={customCategories}
          onCategoriesChange={setCustomCategories}
          onLogout={logout}
        />
        <SearchBar
          isOpen={showSearch}
          onClose={() => setShowSearch(false)}
          tasks={tasks}
          onFilter={setFilteredTasks}
        />
        <TeamSlateDetail
          member={selectedTeamMember}
          isOpen={!!selectedTeamMember}
          onClose={() => setSelectedTeamMember(null)}
          onTaskClick={handleEdit}
        />
        <AIAssistantPanel
          isOpen={showAIAssistant}
          onClose={() => setShowAIAssistant(false)}
          onOpenDailyPlanner={() => {
            setShowAIAssistant(false);
            setShowAIPlanner(true);
          }}
          theme={theme}
        />
        <AITaskBreakdown
          isOpen={showAIBreakdown}
          onClose={() => {
            setShowAIBreakdown(false);
            setSelectedTaskForBreakdown(null);
          }}
          task={selectedTaskForBreakdown}
          onCreateSubtasks={async (subtasks) => {
            // Add subtasks as new tasks
            for (const sub of subtasks) {
              await createTask({
                title: sub.title,
                description: sub.estimatedTime,
                dueDate: 'This Week',
                priority: 'medium',
                source: 'manual',
                teamMembers: [],
                category: 'action-items'
              });
            }
          }}
          theme={theme}
        />
        <AIStandupGenerator
          isOpen={showAIStandup}
          onClose={() => setShowAIStandup(false)}
          tasks={tasks}
          theme={theme}
        />
        <AIDailyPlanner
          isOpen={showAIPlanner}
          onClose={() => setShowAIPlanner(false)}
          tasks={tasks}
          theme={theme}
        />
      </div>
    </DndProvider>
  );
}
