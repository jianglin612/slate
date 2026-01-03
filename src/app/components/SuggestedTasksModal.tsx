import { useState } from 'react';
import { X, Plus, Sparkles, Mail, Calendar, Check } from 'lucide-react';
import { Task } from './TaskCard';

interface SuggestedTask {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
  source: 'email' | 'calendar' | 'both';
  category: string;
  confidence: number;
  context: string;
  teamMembers: { id: string; name: string; avatar: string }[];
}

interface SuggestedTasksModalProps {
  isOpen: boolean;
  suggestions: SuggestedTask[];
  onClose: () => void;
  onAddTasks: (tasks: SuggestedTask[]) => void;
}

export function SuggestedTasksModal({ isOpen, suggestions, onClose, onAddTasks }: SuggestedTasksModalProps) {
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set(suggestions.map(t => t.id)));
  const [editingTask, setEditingTask] = useState<SuggestedTask | null>(null);

  if (!isOpen) return null;

  const toggleTask = (id: string) => {
    const newSelected = new Set(selectedTasks);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedTasks(newSelected);
  };

  const handleAddSelected = () => {
    const tasksToAdd = suggestions.filter(t => selectedTasks.has(t.id));
    onAddTasks(tasksToAdd);
    onClose();
  };

  const handleEdit = (task: SuggestedTask) => {
    setEditingTask(task);
  };

  const priorityColors = {
    high: 'bg-red-500/10 text-red-400 border-red-500/30',
    medium: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    low: 'bg-blue-500/10 text-blue-400 border-blue-500/30'
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-6">
      <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border border-gray-800/50 rounded-2xl w-full max-w-4xl shadow-2xl max-h-[85vh] overflow-hidden backdrop-blur-xl">
        {/* Header */}
        <div className="border-b border-gray-800/50 p-6 bg-gradient-to-r from-purple-500/5 to-blue-500/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-xl border border-purple-500/30">
                <Sparkles className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-white">AI Suggested Tasks</h2>
                <p className="text-sm text-gray-400 mt-0.5">Review and select tasks to add to your week</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/5 rounded-xl transition-all"
            >
              <X className="w-6 h-6 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Suggestions List */}
        <div className="p-6 overflow-y-auto max-h-[calc(85vh-180px)]">
          <div className="space-y-3">
            {suggestions.map((task) => {
              const isSelected = selectedTasks.has(task.id);
              return (
                <div
                  key={task.id}
                  className={`group relative rounded-xl border transition-all ${
                    isSelected 
                      ? 'bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/30' 
                      : 'bg-white/5 border-gray-800/50 hover:border-gray-700/50'
                  }`}
                >
                  <div className="p-4">
                    <div className="flex items-start gap-4">
                      {/* Checkbox */}
                      <button
                        onClick={() => toggleTask(task.id)}
                        className={`mt-1 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                          isSelected 
                            ? 'bg-purple-500 border-purple-500' 
                            : 'border-gray-700 hover:border-gray-600'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                      </button>

                      {/* Task Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex-1">
                            <h3 className="text-white font-medium mb-1">{task.title}</h3>
                            <p className="text-sm text-gray-400">{task.description}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2.5 py-1 rounded-lg text-xs border ${priorityColors[task.priority]}`}>
                              {task.priority}
                            </span>
                            <button
                              onClick={() => handleEdit(task)}
                              className="px-3 py-1 text-xs text-purple-400 hover:bg-purple-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                            >
                              Edit
                            </button>
                          </div>
                        </div>

                        {/* Context */}
                        <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
                          <div className="flex items-center gap-1.5">
                            {task.source === 'email' && <Mail className="w-3.5 h-3.5" />}
                            {task.source === 'calendar' && <Calendar className="w-3.5 h-3.5" />}
                            {task.source === 'both' && (
                              <>
                                <Mail className="w-3.5 h-3.5" />
                                <Calendar className="w-3.5 h-3.5" />
                              </>
                            )}
                            <span>{task.dueDate}</span>
                          </div>
                          {task.teamMembers.length > 0 && (
                            <>
                              <span>•</span>
                              <span>with {task.teamMembers.map(m => m.name.split(' ')[0]).join(', ')}</span>
                            </>
                          )}
                        </div>

                        {/* AI Context */}
                        <div className="bg-black/30 border border-gray-800/50 rounded-lg p-3 text-xs text-gray-400">
                          <div className="flex items-start gap-2">
                            <Sparkles className="w-3.5 h-3.5 text-purple-400 mt-0.5 flex-shrink-0" />
                            <div>
                              <span className="text-purple-400 font-medium">AI Context: </span>
                              {task.context}
                            </div>
                          </div>
                        </div>

                        {/* Confidence */}
                        <div className="mt-3 flex items-center gap-2">
                          <span className="text-xs text-gray-500">Confidence:</span>
                          <div className="flex-1 max-w-[120px] h-1.5 bg-gray-800 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
                              style={{ width: `${task.confidence}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-400">{task.confidence}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-800/50 p-6 bg-black/30">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">
              {selectedTasks.size} of {suggestions.length} tasks selected
            </span>
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-5 py-2.5 text-sm text-gray-400 hover:text-white transition-colors rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleAddSelected}
                disabled={selectedTasks.size === 0}
                className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white text-sm rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/20"
              >
                <div className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  <span>Add Selected Tasks</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
