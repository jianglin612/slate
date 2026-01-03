import { useState } from 'react';
import { X, Mail, Calendar, Sparkles, MessageSquare, FileText, TrendingUp } from 'lucide-react';
import { Task } from './TaskCard';

interface TaskDetailModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Task) => void;
}

export function TaskDetailModal({ task, isOpen, onClose, onSave }: TaskDetailModalProps) {
  const [editedTask, setEditedTask] = useState<Task | null>(task);

  if (!isOpen || !task || !editedTask) return null;

  const handleSave = () => {
    if (editedTask) {
      onSave(editedTask);
      onClose();
    }
  };

  const priorityColors = {
    high: 'bg-red-500/10 text-red-400 border-red-500/30',
    medium: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    low: 'bg-blue-500/10 text-blue-400 border-blue-500/30'
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-6 animate-fade-in">
      <div className="bg-gradient-to-br from-[#1a1b1e] to-[#131416] border border-gray-800/50 rounded-2xl w-full max-w-3xl shadow-2xl max-h-[90vh] overflow-hidden backdrop-blur-xl animate-slide-up">
        {/* Header */}
        <div className="border-b border-gray-800/50 p-6 bg-gradient-to-r from-blue-500/5 to-purple-500/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl border border-blue-500/30">
                <FileText className="w-5 h-5 text-blue-400" />
              </div>
              <h2 className="text-xl font-semibold text-white">Edit Task</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/5 rounded-xl transition-all"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          <div className="space-y-5">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Title</label>
              <input
                type="text"
                value={editedTask.title}
                onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
                className="w-full bg-white/5 border border-gray-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
                placeholder="Task title"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Description</label>
              <textarea
                value={editedTask.description}
                onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
                rows={4}
                className="w-full bg-white/5 border border-gray-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 resize-none transition-all"
                placeholder="Task description"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Priority</label>
                <select
                  value={editedTask.priority}
                  onChange={(e) => setEditedTask({ ...editedTask, priority: e.target.value as 'high' | 'medium' | 'low' })}
                  className="w-full bg-white/5 border border-gray-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Due Date</label>
                <input
                  type="text"
                  value={editedTask.dueDate}
                  onChange={(e) => setEditedTask({ ...editedTask, dueDate: e.target.value })}
                  className="w-full bg-white/5 border border-gray-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  placeholder="e.g., Mon, Jan 6"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Category</label>
                <select
                  value={editedTask.category}
                  onChange={(e) => setEditedTask({ ...editedTask, category: e.target.value })}
                  className="w-full bg-white/5 border border-gray-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
                >
                  <option value="action-items">Action Items</option>
                  <option value="meetings">Meetings</option>
                  <option value="deliverables">Deliverables</option>
                  <option value="projects">Projects</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Source</label>
              <div className="flex gap-3">
                <button
                  onClick={() => setEditedTask({ ...editedTask, source: 'email' })}
                  className={`flex-1 px-4 py-3 rounded-xl border transition-all ${
                    editedTask.source === 'email'
                      ? 'bg-blue-500/20 border-blue-500/30 text-blue-400'
                      : 'bg-white/5 border-gray-800 text-gray-400 hover:border-gray-700'
                  }`}
                >
                  <Mail className="w-4 h-4 mx-auto mb-1" />
                  <span className="text-xs">Email</span>
                </button>
                <button
                  onClick={() => setEditedTask({ ...editedTask, source: 'calendar' })}
                  className={`flex-1 px-4 py-3 rounded-xl border transition-all ${
                    editedTask.source === 'calendar'
                      ? 'bg-purple-500/20 border-purple-500/30 text-purple-400'
                      : 'bg-white/5 border-gray-800 text-gray-400 hover:border-gray-700'
                  }`}
                >
                  <Calendar className="w-4 h-4 mx-auto mb-1" />
                  <span className="text-xs">Calendar</span>
                </button>
                <button
                  onClick={() => setEditedTask({ ...editedTask, source: 'both' })}
                  className={`flex-1 px-4 py-3 rounded-xl border transition-all ${
                    editedTask.source === 'both'
                      ? 'bg-green-500/20 border-green-500/30 text-green-400'
                      : 'bg-white/5 border-gray-800 text-gray-400 hover:border-gray-700'
                  }`}
                >
                  <div className="flex gap-1 justify-center mb-1">
                    <Mail className="w-3.5 h-3.5" />
                    <Calendar className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs">Both</span>
                </button>
              </div>
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
                  <p className="text-xs text-gray-300">Based on similar tasks, this typically takes 3-4 hours. Consider blocking time tomorrow morning.</p>
                </div>
                <div className="bg-black/30 border border-gray-800/50 rounded-lg p-3">
                  <p className="text-xs text-gray-300">This task relates to ongoing projects. Consider linking them for better visibility.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-800/50 p-6 bg-black/30">
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 text-sm text-gray-400 hover:text-white transition-colors rounded-xl"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-sm rounded-xl transition-all shadow-lg shadow-blue-500/20"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
