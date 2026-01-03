import { X, Target, CheckCircle2, Circle } from 'lucide-react';
import { Task } from './TaskCard';

interface FocusModeProps {
  tasks: Task[];
  isOpen: boolean;
  onClose: () => void;
  onTaskClick: (task: Task) => void;
  onToggleComplete?: (taskId: string) => void;
}

export function FocusMode({ tasks, isOpen, onClose, onTaskClick, onToggleComplete }: FocusModeProps) {
  if (!isOpen) return null;

  // Filter to show only high priority and due today/overdue
  const focusTasks = tasks.filter(
    t => t.priority === 'high' || t.dueDate.toLowerCase().includes('today')
  );

  return (
    <div className="fixed inset-0 bg-[#0a0b0c] z-50 overflow-auto animate-fade-in">
      {/* Header */}
      <div className="border-b border-gray-800/50 bg-gradient-to-b from-[#1a1b1e] to-[#0a0b0c] sticky top-0 z-10 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl border border-blue-500/30">
                <Target className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Focus Mode</h1>
                <p className="text-sm text-gray-400 mt-0.5">
                  {focusTasks.length} {focusTasks.length === 1 ? 'task' : 'tasks'} need your attention
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-xl transition-all"
            >
              <X className="w-6 h-6 text-gray-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        {focusTasks.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl mx-auto mb-6 flex items-center justify-center border border-green-500/30">
              <CheckCircle2 className="w-10 h-10 text-green-400" />
            </div>
            <h2 className="text-2xl font-semibold text-white mb-2">All caught up! 🎉</h2>
            <p className="text-gray-400">No urgent tasks requiring your attention right now.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {focusTasks.map((task, index) => (
              <div
                key={task.id}
                onClick={() => onTaskClick(task)}
                className="bg-gradient-to-br from-white/[0.07] to-white/[0.03] border border-gray-800/50 rounded-2xl p-6 hover:border-gray-700/50 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 cursor-pointer group animate-slide-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start gap-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleComplete?.(task.id);
                    }}
                    className="mt-1 p-1 hover:bg-white/10 rounded-lg transition-all"
                  >
                    <Circle className="w-6 h-6 text-gray-600 group-hover:text-blue-400 transition-colors" />
                  </button>

                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-white group-hover:text-blue-400 transition-colors">
                        {task.title}
                      </h3>
                      <span
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border whitespace-nowrap ${
                          task.priority === 'high'
                            ? 'bg-red-500/10 text-red-400 border-red-500/30'
                            : task.priority === 'medium'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            : 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                        }`}
                      >
                        {task.priority}
                      </span>
                    </div>

                    <p className="text-gray-400 mb-4 leading-relaxed">{task.description}</p>

                    <div className="flex items-center gap-6 text-sm">
                      <div className="flex items-center gap-2 text-gray-500">
                        <span className="text-xs">Due:</span>
                        <span className="text-white font-medium">{task.dueDate}</span>
                      </div>

                      {task.teamMembers.length > 0 && (
                        <>
                          <div className="w-px h-4 bg-gray-800"></div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">With:</span>
                            <div className="flex -space-x-2">
                              {task.teamMembers.map((member) => (
                                <div
                                  key={member.id}
                                  className="w-7 h-7 rounded-full border-2 border-[#0a0b0c] bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-[10px] text-white font-medium shadow-lg"
                                  title={member.name}
                                >
                                  {member.name.split(' ').map((n) => n[0]).join('').toUpperCase()}
                                </div>
                              ))}
                            </div>
                            <span className="text-sm text-gray-400 ml-1">
                              {task.teamMembers.map((m) => m.name.split(' ')[0]).join(', ')}
                            </span>
                          </div>
                        </>
                      )}

                      {task.subtasks && task.subtasks.length > 0 && (
                        <>
                          <div className="w-px h-4 bg-gray-800"></div>
                          <div className="text-xs text-gray-500">
                            {task.subtasks.filter((s) => s.completed).length}/{task.subtasks.length} subtasks
                          </div>
                        </>
                      )}
                    </div>

                    {task.tags && task.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-4">
                        {task.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2.5 py-1 bg-white/5 border border-gray-800 rounded-lg text-xs text-gray-400"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Focus Tips */}
        <div className="mt-12 p-6 bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-xl">
          <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
            <Target className="w-4 h-4" />
            Focus Tips
          </h3>
          <ul className="text-sm text-gray-400 space-y-1.5">
            <li>• Focus on one task at a time for better results</li>
            <li>• High priority tasks and items due today are shown here</li>
            <li>• Click any task to see full details and make edits</li>
            <li>• Press Esc to exit Focus Mode anytime</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
