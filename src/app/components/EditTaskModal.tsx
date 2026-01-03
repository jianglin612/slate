import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Task } from './TaskCard';

interface EditTaskModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Task) => void;
  theme?: 'dark' | 'light';
}

const getDefaultTask = (): Task => ({
  id: '',
  title: '',
  description: '',
  dueDate: '',
  priority: 'medium',
  source: 'email',
  teamMembers: [],
  category: 'action-items',
});

export function EditTaskModal({ task, isOpen, onClose, onSave, theme = 'dark' }: EditTaskModalProps) {
  const [formData, setFormData] = useState<Task>(getDefaultTask());
  const isNewTask = !task?.id;

  // Update formData when task changes or modal opens
  useEffect(() => {
    if (isOpen && task) {
      // Merge task with defaults for any missing properties
      setFormData({
        ...getDefaultTask(),
        ...task,
      });
    } else if (isOpen) {
      // New task - use defaults
      setFormData(getDefaultTask());
    }
  }, [isOpen, task]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (formData) {
      onSave(formData);
      onClose();
    }
  };

  const isDark = theme === 'dark';

  return (
    <div className={`fixed inset-0 ${isDark ? 'bg-black/20' : 'bg-black/20'} backdrop-blur-sm flex items-center justify-center z-50`}>
      <div className={`${isDark ? 'bg-[#1a1b1e] border-gray-800/50' : 'bg-white border-gray-200'} border rounded-lg p-6 w-full max-w-lg shadow-2xl`}>
        <div className="flex items-center justify-between mb-6">
          <h2 className={`text-xl font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{isNewTask ? 'Add Task' : 'Edit Task'}</h2>
          <button
            onClick={onClose}
            className={`p-1 ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'} rounded transition-colors`}
          >
            <X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className={`block text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className={`w-full ${isDark ? 'bg-black/30 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'} border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500`}
            />
          </div>

          <div>
            <label className={`block text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className={`w-full ${isDark ? 'bg-black/30 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'} border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 resize-none`}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as 'high' | 'medium' | 'low' })}
                className={`w-full ${isDark ? 'bg-black/30 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'} border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500`}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div>
              <label className={`block text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Due Date</label>
              <input
                type="text"
                value={formData.dueDate}
                placeholder="e.g., Today, Tomorrow, Jan 15"
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className={`w-full ${isDark ? 'bg-black/30 border-gray-700 text-white placeholder-gray-500' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'} border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500`}
              />
            </div>
          </div>

          <div>
            <label className={`block text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className={`w-full ${isDark ? 'bg-black/30 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'} border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500`}
            >
              <option value="action-items">Action Items</option>
              <option value="meetings">Meetings</option>
              <option value="deliverables">Deliverables</option>
              <option value="projects">Projects</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className={`px-4 py-2 text-sm ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition-colors"
          >
            {isNewTask ? 'Add Task' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}