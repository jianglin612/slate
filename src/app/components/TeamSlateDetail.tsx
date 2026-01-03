import { X, MessageSquare, Star, Bell, BellOff, Video, Package, FileText, Zap } from 'lucide-react';
import { Task } from './TaskCard';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
  tasks: Task[];
}

interface TeamSlateDetailProps {
  member: TeamMember | null;
  isOpen: boolean;
  onClose: () => void;
  onTaskClick: (task: Task) => void;
}

export function TeamSlateDetail({ member, isOpen, onClose, onTaskClick }: TeamSlateDetailProps) {
  if (!isOpen || !member) return null;

  const groupedTasks = member.tasks.reduce((acc, task) => {
    if (!acc[task.category]) {
      acc[task.category] = [];
    }
    acc[task.category].push(task);
    return acc;
  }, {} as Record<string, Task[]>);

  const categoryIcons: Record<string, JSX.Element> = {
    'action-items': <Zap className="w-4 h-4 text-amber-400" />,
    'meetings': <Video className="w-4 h-4 text-blue-400" />,
    'deliverables': <FileText className="w-4 h-4 text-green-400" />,
    'projects': <Package className="w-4 h-4 text-purple-400" />
  };

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
        className={`fixed top-0 right-0 h-full w-full max-w-3xl bg-gradient-to-br from-[#1a1b1e] to-[#131416] border-l border-gray-800/50 shadow-2xl z-50 overflow-hidden backdrop-blur-xl transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="border-b border-gray-800/50 p-6 bg-gradient-to-r from-purple-500/5 to-blue-500/5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                {member.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-white">{member.name}</h2>
                <p className="text-sm text-gray-400 mt-0.5">{member.role}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/5 rounded-xl transition-all"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-xl transition-all text-sm">
              <Star className="w-4 h-4 text-blue-400" />
              <span className="text-blue-400">Follow</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-gray-700/50 rounded-xl transition-all text-sm">
              <Bell className="w-4 h-4 text-gray-400" />
              <span className="text-gray-400">Notify me</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-gray-700/50 rounded-xl transition-all text-sm">
              <MessageSquare className="w-4 h-4 text-gray-400" />
              <span className="text-gray-400">Message</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto h-[calc(100vh-180px)] p-6 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-white/[0.07] to-white/[0.03] border border-gray-800/50 rounded-xl p-4">
              <div className="text-2xl font-bold text-white mb-1">{member.tasks.length}</div>
              <div className="text-xs text-gray-400">Total Tasks</div>
            </div>
            <div className="bg-gradient-to-br from-red-500/10 to-red-500/5 border border-red-500/30 rounded-xl p-4">
              <div className="text-2xl font-bold text-red-400 mb-1">
                {member.tasks.filter(t => t.priority === 'high').length}
              </div>
              <div className="text-xs text-gray-400">High Priority</div>
            </div>
            <div className="bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/30 rounded-xl p-4">
              <div className="text-2xl font-bold text-green-400 mb-1">
                {member.tasks.filter(t => t.dueDate.toLowerCase().includes('today')).length}
              </div>
              <div className="text-xs text-gray-400">Due Today</div>
            </div>
          </div>

          {/* Tasks by Category */}
          {Object.entries(groupedTasks).map(([category, tasks]) => (
            <div key={category}>
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-white/5 rounded-lg border border-gray-800">
                  {categoryIcons[category]}
                </div>
                <h3 className="font-semibold text-white capitalize">
                  {category.replace('-', ' ')}
                </h3>
                <span className="text-xs text-gray-500">({tasks.length})</span>
              </div>

              <div className="space-y-3">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => onTaskClick(task)}
                    className="bg-gradient-to-br from-white/[0.07] to-white/[0.03] border border-gray-800/50 rounded-xl p-4 hover:border-gray-700/50 hover:shadow-lg hover:shadow-purple-500/5 transition-all cursor-pointer group"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h4 className="font-medium text-white group-hover:text-blue-400 transition-colors flex-1">
                        {task.title}
                      </h4>
                      <span
                        className={`px-2.5 py-1 rounded-lg text-xs border ${
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

                    <p className="text-sm text-gray-400 mb-3">{task.description}</p>

                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span>Due: {task.dueDate}</span>
                      <span>•</span>
                      <span className="capitalize">{task.source}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {member.tasks.length === 0 && (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-700 to-gray-800 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <Package className="w-10 h-10 text-gray-500" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">No tasks this week</h3>
              <p className="text-sm text-gray-400">{member.name.split(' ')[0]} hasn't shared any tasks yet.</p>
            </div>
          )}

          {/* Collaboration Section */}
          <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-xl p-5">
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Collaborate
            </h3>
            <p className="text-sm text-gray-400 mb-3">
              Want to work together on a task? Send {member.name.split(' ')[0]} a message or add them to one of your tasks.
            </p>
            <button className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-all">
              Start Collaboration
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
