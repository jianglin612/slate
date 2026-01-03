import { useState, useEffect } from 'react';
import { X, Mail, Calendar, Sparkles, MessageSquare, Paperclip, Users, Clock, Lock, Globe, TrendingUp, Plus, Send, CheckCircle2, Circle, Trash2, Tag, Repeat, Link as LinkIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { Task } from './TaskCard';

interface Comment {
  id: string;
  author: string;
  text: string;
  timestamp: string;
  mentions?: string[];
}

interface TaskSidePanelProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Task) => void;
  onMoveWeek?: (taskId: string, weekOffset: number) => void;
}

export function TaskSidePanel({ task, isOpen, onClose, onSave, onMoveWeek }: TaskSidePanelProps) {
  const [editedTask, setEditedTask] = useState<Task | null>(task);
  const [activeTab, setActiveTab] = useState<'details' | 'comments' | 'activity'>('details');
  const [commentText, setCommentText] = useState('');
  const [newSubtask, setNewSubtask] = useState('');
  const [newTag, setNewTag] = useState('');
  const [comments, setComments] = useState<Comment[]>([
    {
      id: '1',
      author: 'Sarah Chen',
      text: 'I can help with the presentation slides if needed!',
      timestamp: '2 hours ago'
    }
  ]);

  // Update editedTask when task prop changes
  useEffect(() => {
    if (task) {
      setEditedTask(task);
    }
  }, [task]);

  if (!isOpen || !task || !editedTask) return null;

  const handleSave = () => {
    if (editedTask) {
      onSave(editedTask);
    }
  };

  const handleAddComment = () => {
    if (commentText.trim()) {
      // Extract @mentions
      const mentions = commentText.match(/@\w+/g)?.map(m => m.slice(1)) || [];
      
      setComments([...comments, {
        id: Date.now().toString(),
        author: 'You',
        text: commentText,
        timestamp: 'Just now',
        mentions
      }]);
      setCommentText('');
    }
  };

  const handleAddSubtask = () => {
    if (newSubtask.trim()) {
      const subtasks = editedTask.subtasks || [];
      setEditedTask({
        ...editedTask,
        subtasks: [...subtasks, {
          id: Date.now().toString(),
          title: newSubtask,
          completed: false
        }]
      });
      setNewSubtask('');
      handleSave();
    }
  };

  const handleToggleSubtask = (subtaskId: string) => {
    const subtasks = editedTask.subtasks?.map(st =>
      st.id === subtaskId ? { ...st, completed: !st.completed } : st
    ) || [];
    setEditedTask({ ...editedTask, subtasks });
    handleSave();
  };

  const handleDeleteSubtask = (subtaskId: string) => {
    const subtasks = editedTask.subtasks?.filter(st => st.id !== subtaskId) || [];
    setEditedTask({ ...editedTask, subtasks });
    handleSave();
  };

  const handleAddTag = () => {
    if (newTag.trim()) {
      const tags = editedTask.tags || [];
      if (!tags.includes(newTag.toLowerCase())) {
        setEditedTask({
          ...editedTask,
          tags: [...tags, newTag.toLowerCase()]
        });
        handleSave();
      }
      setNewTag('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    const tags = editedTask.tags?.filter(t => t !== tag) || [];
    setEditedTask({ ...editedTask, tags });
    handleSave();
  };

  const handleAddAttachment = () => {
    // Simulate file upload
    const attachments = editedTask.attachments || [];
    const newAttachment = {
      id: Date.now().toString(),
      name: 'document.pdf',
      url: '#',
      type: 'application/pdf'
    };
    setEditedTask({
      ...editedTask,
      attachments: [...attachments, newAttachment]
    });
    handleSave();
  };

  const handleMoveToWeek = (direction: 'prev' | 'next') => {
    const currentOffset = editedTask.weekOffset || 0;
    const newOffset = direction === 'next' ? currentOffset + 1 : currentOffset - 1;
    setEditedTask({ ...editedTask, weekOffset: newOffset });
    onMoveWeek?.(editedTask.id, newOffset);
    handleSave();
  };

  const priorityColors = {
    high: 'bg-red-500/10 text-red-400 border-red-500/30',
    medium: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    low: 'bg-blue-500/10 text-blue-400 border-blue-500/30'
  };

  const completedSubtasks = editedTask.subtasks?.filter(st => st.completed).length || 0;
  const totalSubtasks = editedTask.subtasks?.length || 0;
  const progress = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Side Panel */}
      <div 
        className={`fixed top-0 right-0 h-full w-full max-w-2xl bg-gradient-to-br from-[#1a1b1e] to-[#131416] border-l border-gray-800/50 shadow-2xl z-50 overflow-hidden backdrop-blur-xl transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="border-b border-gray-800/50 p-6 bg-gradient-to-r from-blue-500/5 to-purple-500/5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setEditedTask({ ...editedTask, isPrivate: false });
                    handleSave();
                  }}
                  className={`p-2 rounded-lg transition-all ${
                    !editedTask.isPrivate
                      ? 'bg-blue-500/20 border border-blue-500/30'
                      : 'hover:bg-white/5'
                  }`}
                  title="Public - visible to team"
                >
                  <Globe className={`w-4 h-4 ${!editedTask.isPrivate ? 'text-blue-400' : 'text-gray-500'}`} />
                </button>
                <button
                  onClick={() => {
                    setEditedTask({ ...editedTask, isPrivate: true });
                    handleSave();
                  }}
                  className={`p-2 rounded-lg transition-all ${
                    editedTask.isPrivate
                      ? 'bg-purple-500/20 border border-purple-500/30'
                      : 'hover:bg-white/5'
                  }`}
                  title="Private - only visible to you"
                >
                  <Lock className={`w-4 h-4 ${editedTask.isPrivate ? 'text-purple-400' : 'text-gray-500'}`} />
                </button>
              </div>
              <div className="w-px h-6 bg-gray-800"></div>
              <span className="text-xs text-gray-400">
                {editedTask.isPrivate ? 'Private task' : 'Visible to team'}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/5 rounded-xl transition-all"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Week Navigation */}
          <div className="flex items-center gap-2 mb-4">
            <button
              onClick={() => handleMoveToWeek('prev')}
              className="p-1.5 hover:bg-white/10 rounded-lg transition-all"
              title="Move to previous week"
            >
              <ChevronLeft className="w-4 h-4 text-gray-400" />
            </button>
            <span className="text-xs text-gray-500">
              {editedTask.weekOffset === 0 ? 'This week' : 
               editedTask.weekOffset === -1 ? 'Last week' :
               editedTask.weekOffset === 1 ? 'Next week' :
               `Week ${editedTask.weekOffset > 0 ? '+' : ''}${editedTask.weekOffset}`}
            </span>
            <button
              onClick={() => handleMoveToWeek('next')}
              className="p-1.5 hover:bg-white/10 rounded-lg transition-all"
              title="Move to next week"
            >
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('details')}
              className={`px-4 py-2 rounded-lg text-sm transition-all ${
                activeTab === 'details'
                  ? 'bg-white/10 text-white'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              Details
            </button>
            <button
              onClick={() => setActiveTab('comments')}
              className={`px-4 py-2 rounded-lg text-sm transition-all flex items-center gap-2 ${
                activeTab === 'comments'
                  ? 'bg-white/10 text-white'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Comments
              {comments.length > 0 && (
                <span className="px-1.5 py-0.5 bg-blue-500/20 text-blue-400 rounded text-xs">
                  {comments.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`px-4 py-2 rounded-lg text-sm transition-all flex items-center gap-2 ${
                activeTab === 'activity'
                  ? 'bg-white/10 text-white'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              Activity
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto h-[calc(100vh-200px)]">
          {activeTab === 'details' && (
            <div className="p-6 space-y-5">
              {/* Title */}
              <div>
                <input
                  type="text"
                  value={editedTask.title}
                  onChange={(e) => {
                    setEditedTask({ ...editedTask, title: e.target.value });
                    handleSave();
                  }}
                  className="w-full bg-transparent border-none text-xl font-semibold text-white focus:outline-none placeholder:text-gray-600"
                  placeholder="Task name"
                />
              </div>

              {/* Progress Bar */}
              {totalSubtasks > 0 && (
                <div className="bg-white/5 border border-gray-800 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-400">Progress</span>
                    <span className="text-xs text-gray-400">{completedSubtasks}/{totalSubtasks} completed</span>
                  </div>
                  <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Description */}
              <div>
                <textarea
                  value={editedTask.description}
                  onChange={(e) => {
                    setEditedTask({ ...editedTask, description: e.target.value });
                  }}
                  onBlur={handleSave}
                  rows={3}
                  className="w-full bg-white/5 border border-gray-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 resize-none transition-all"
                  placeholder="Description"
                />
              </div>

              {/* Quick Actions Grid */}
              <div className="grid grid-cols-2 gap-3">
                {/* Due Date */}
                <div className="bg-white/5 border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition-all">
                  <label className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                    <Clock className="w-3.5 h-3.5" />
                    Due Date
                  </label>
                  <input
                    type="text"
                    value={editedTask.dueDate}
                    onChange={(e) => {
                      setEditedTask({ ...editedTask, dueDate: e.target.value });
                    }}
                    onBlur={handleSave}
                    className="w-full bg-transparent border-none text-white text-sm focus:outline-none"
                    placeholder="e.g., Mon, Jan 6"
                  />
                </div>

                {/* Priority */}
                <div className="bg-white/5 border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition-all">
                  <label className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                    <Sparkles className="w-3.5 h-3.5" />
                    Priority
                  </label>
                  <select
                    value={editedTask.priority}
                    onChange={(e) => {
                      setEditedTask({ ...editedTask, priority: e.target.value as 'high' | 'medium' | 'low' });
                      handleSave();
                    }}
                    className="w-full bg-transparent border-none text-white text-sm focus:outline-none cursor-pointer"
                  >
                    <option value="low" className="bg-[#1a1b1e]">Low</option>
                    <option value="medium" className="bg-[#1a1b1e]">Medium</option>
                    <option value="high" className="bg-[#1a1b1e]">High</option>
                  </select>
                </div>
              </div>

              {/* Category & Source */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/5 border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition-all">
                  <label className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                    Category
                  </label>
                  <select
                    value={editedTask.category}
                    onChange={(e) => {
                      setEditedTask({ ...editedTask, category: e.target.value });
                      handleSave();
                    }}
                    className="w-full bg-transparent border-none text-white text-sm focus:outline-none cursor-pointer"
                  >
                    <option value="action-items" className="bg-[#1a1b1e]">Action Items</option>
                    <option value="meetings" className="bg-[#1a1b1e]">Meetings</option>
                    <option value="deliverables" className="bg-[#1a1b1e]">Deliverables</option>
                    <option value="projects" className="bg-[#1a1b1e]">Projects</option>
                  </select>
                </div>

                <div className="bg-white/5 border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition-all">
                  <label className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                    Source
                  </label>
                  <select
                    value={editedTask.source}
                    onChange={(e) => {
                      setEditedTask({ ...editedTask, source: e.target.value as 'email' | 'calendar' | 'both' });
                      handleSave();
                    }}
                    className="w-full bg-transparent border-none text-white text-sm focus:outline-none cursor-pointer"
                  >
                    <option value="email" className="bg-[#1a1b1e]">Email</option>
                    <option value="calendar" className="bg-[#1a1b1e]">Calendar</option>
                    <option value="both" className="bg-[#1a1b1e]">Both</option>
                  </select>
                </div>
              </div>

              {/* Recurring */}
              <div className="bg-white/5 border border-gray-800 rounded-xl p-4">
                <label className="flex items-center gap-2 mb-3">
                  <input
                    type="checkbox"
                    checked={editedTask.isRecurring || false}
                    onChange={(e) => {
                      setEditedTask({ ...editedTask, isRecurring: e.target.checked });
                      handleSave();
                    }}
                    className="w-4 h-4 rounded bg-white/5 border-gray-800 text-blue-500"
                  />
                  <Repeat className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-sm text-white">Recurring Task</span>
                </label>
                {editedTask.isRecurring && (
                  <select
                    value={editedTask.recurrencePattern || 'weekly'}
                    onChange={(e) => {
                      setEditedTask({ ...editedTask, recurrencePattern: e.target.value });
                      handleSave();
                    }}
                    className="w-full bg-white/5 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
                  >
                    <option value="daily" className="bg-[#1a1b1e]">Daily</option>
                    <option value="weekly" className="bg-[#1a1b1e]">Weekly</option>
                    <option value="biweekly" className="bg-[#1a1b1e]">Bi-weekly</option>
                    <option value="monthly" className="bg-[#1a1b1e]">Monthly</option>
                  </select>
                )}
              </div>

              {/* Subtasks */}
              <div className="bg-white/5 border border-gray-800 rounded-xl p-4">
                <label className="flex items-center gap-2 text-xs text-gray-400 mb-3">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Subtasks
                </label>
                <div className="space-y-2 mb-3">
                  {editedTask.subtasks?.map((subtask) => (
                    <div key={subtask.id} className="flex items-center gap-2 group">
                      <button
                        onClick={() => handleToggleSubtask(subtask.id)}
                        className="flex-shrink-0"
                      >
                        {subtask.completed ? (
                          <CheckCircle2 className="w-4 h-4 text-green-400" />
                        ) : (
                          <Circle className="w-4 h-4 text-gray-600" />
                        )}
                      </button>
                      <span className={`flex-1 text-sm ${subtask.completed ? 'text-gray-500 line-through' : 'text-gray-300'}`}>
                        {subtask.title}
                      </span>
                      <button
                        onClick={() => handleDeleteSubtask(subtask.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-gray-500" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSubtask}
                    onChange={(e) => setNewSubtask(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddSubtask()}
                    placeholder="Add subtask..."
                    className="flex-1 bg-white/5 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50"
                  />
                  <button
                    onClick={handleAddSubtask}
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-all"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Tags */}
              <div className="bg-white/5 border border-gray-800 rounded-xl p-4">
                <label className="flex items-center gap-2 text-xs text-gray-400 mb-3">
                  <Tag className="w-3.5 h-3.5" />
                  Tags
                </label>
                {editedTask.tags && editedTask.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {editedTask.tags.map((tag) => (
                      <span
                        key={tag}
                        className="flex items-center gap-1 px-2.5 py-1 bg-blue-500/10 border border-blue-500/30 rounded-lg text-xs text-blue-400"
                      >
                        #{tag}
                        <button
                          onClick={() => handleRemoveTag(tag)}
                          className="hover:text-blue-300"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                    placeholder="Add tag..."
                    className="flex-1 bg-white/5 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50"
                  />
                  <button
                    onClick={handleAddTag}
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-all"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Team Members */}
              <div className="bg-white/5 border border-gray-800 rounded-xl p-4">
                <label className="flex items-center gap-2 text-xs text-gray-400 mb-3">
                  <Users className="w-3.5 h-3.5" />
                  Collaborators
                </label>
                {editedTask.teamMembers.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {editedTask.teamMembers.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-gray-800 rounded-lg"
                      >
                        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-[10px] text-white font-medium">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span className="text-sm text-gray-300">{member.name}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <button className="text-sm text-gray-500 hover:text-gray-400 transition-colors">
                    + Add collaborators
                  </button>
                )}
              </div>

              {/* Attachments */}
              <div className="bg-white/5 border border-gray-800 rounded-xl p-4">
                <label className="flex items-center gap-2 text-xs text-gray-400 mb-3">
                  <Paperclip className="w-3.5 h-3.5" />
                  Attachments
                </label>
                {editedTask.attachments && editedTask.attachments.length > 0 ? (
                  <div className="space-y-2 mb-3">
                    {editedTask.attachments.map((attachment) => (
                      <div key={attachment.id} className="flex items-center gap-2 p-2 bg-white/5 border border-gray-800 rounded-lg">
                        <LinkIcon className="w-4 h-4 text-gray-500" />
                        <span className="flex-1 text-sm text-gray-300">{attachment.name}</span>
                      </div>
                    ))}
                  </div>
                ) : null}
                <button 
                  onClick={handleAddAttachment}
                  className="text-sm text-gray-500 hover:text-gray-400 transition-colors"
                >
                  + Add files or links
                </button>
              </div>

              {/* AI Suggestions */}
              <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-xl p-5">
                <div className="flex items-start gap-3 mb-4">
                  <Sparkles className="w-5 h-5 text-blue-400 mt-0.5" />
                  <div>
                    <h3 className="text-white font-medium mb-1">AI Suggestions</h3>
                    <p className="text-sm text-gray-400">Smart recommendations for this task</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="bg-black/30 border border-gray-800/50 rounded-lg p-3">
                    <p className="text-xs text-gray-300">Consider scheduling prep time before this meeting. I found 30 minutes available tomorrow at 2 PM.</p>
                    <button className="mt-2 text-xs text-blue-400 hover:text-blue-300">Apply suggestion →</button>
                  </div>
                  <div className="bg-black/30 border border-gray-800/50 rounded-lg p-3">
                    <p className="text-xs text-gray-300">Similar tasks typically need input from Design team. Want to add Emily Davis as a collaborator?</p>
                    <button className="mt-2 text-xs text-blue-400 hover:text-blue-300">Add Emily →</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'comments' && (
            <div className="p-6 space-y-4">
              <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <p className="text-xs text-blue-400">💡 Tip: Use @mention to notify team members</p>
              </div>

              {comments.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="w-12 h-12 text-gray-700 mx-auto mb-3" />
                  <p className="text-gray-500">No comments yet</p>
                  <p className="text-sm text-gray-600 mt-1">Start the conversation</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
                        {comment.author.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="flex-1">
                        <div className="bg-white/5 border border-gray-800 rounded-xl p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-white">{comment.author}</span>
                            <span className="text-xs text-gray-500">{comment.timestamp}</span>
                          </div>
                          <p className="text-sm text-gray-300">{comment.text}</p>
                          {comment.mentions && comment.mentions.length > 0 && (
                            <div className="mt-2 flex gap-1">
                              {comment.mentions.map((mention) => (
                                <span key={mention} className="text-xs text-blue-400">@{mention}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Comment */}
              <div className="pt-4 border-t border-gray-800/50">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
                    ME
                  </div>
                  <div className="flex-1 flex gap-2">
                    <input
                      type="text"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                      placeholder="Add a comment... (use @name to mention)"
                      className="flex-1 bg-white/5 border border-gray-800 rounded-xl px-4 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
                    />
                    <button
                      onClick={handleAddComment}
                      disabled={!commentText.trim()}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20 flex items-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="p-6 space-y-4">
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-300">Task created by <span className="text-white font-medium">You</span></p>
                    <p className="text-xs text-gray-500 mt-1">Today at 9:30 AM</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-purple-500 mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-300">Priority changed to <span className="text-red-400 font-medium">High</span></p>
                    <p className="text-xs text-gray-500 mt-1">Today at 10:15 AM</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-300"><span className="text-white font-medium">Sarah Chen</span> added as collaborator</p>
                    <p className="text-xs text-gray-500 mt-1">Today at 11:00 AM</p>
                  </div>
                </div>
                {editedTask.subtasks && editedTask.subtasks.filter(s => s.completed).length > 0 && (
                  <div className="flex gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-300">
                        Completed {editedTask.subtasks.filter(s => s.completed).length} subtask{editedTask.subtasks.filter(s => s.completed).length > 1 ? 's' : ''}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Today at 12:00 PM</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}