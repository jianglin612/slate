import { Users, Sparkles } from 'lucide-react';
import { Task } from './TaskCard';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
  tasks: Task[];
}

interface TeamViewProps {
  teamMembers: TeamMember[];
}

export function TeamView({ teamMembers }: TeamViewProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-50 rounded-lg">
          <Users className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Team Activity</h2>
          <p className="text-sm text-gray-500">See what your team is working on</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {teamMembers.map((member) => (
          <div
            key={member.id}
            className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-all"
          >
            <div className="flex items-start gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium text-sm">
                {member.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">{member.name}</h3>
                <p className="text-sm text-gray-500">{member.role}</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                <span>This Week</span>
                <span>{member.tasks.length} tasks</span>
              </div>
              
              {member.tasks.slice(0, 3).map((task) => (
                <div
                  key={task.id}
                  className="p-3 bg-gray-50 rounded-lg border border-gray-100"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{task.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{task.dueDate}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-xs border whitespace-nowrap ${
                      task.priority === 'high' ? 'bg-red-50 text-red-700 border-red-200' :
                      task.priority === 'medium' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                      'bg-blue-50 text-blue-700 border-blue-200'
                    }`}>
                      {task.priority}
                    </span>
                  </div>
                </div>
              ))}

              {member.tasks.length > 3 && (
                <button className="w-full text-center text-xs text-blue-600 hover:text-blue-700 py-2">
                  View all {member.tasks.length} tasks
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
