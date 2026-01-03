import { Calendar, Mail, Users, Sparkles } from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  avatar: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
  source: 'email' | 'calendar' | 'both';
  teamMembers: TeamMember[];
  aiGenerated: boolean;
}

interface TaskSummaryCardProps {
  task: Task;
}

export function TaskSummaryCard({ task }: TaskSummaryCardProps) {
  const priorityColors = {
    high: 'bg-red-100 text-red-700 border-red-200',
    medium: 'bg-amber-100 text-amber-700 border-amber-200',
    low: 'bg-green-100 text-green-700 border-green-200'
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-medium text-gray-900">{task.title}</h3>
            {task.aiGenerated && (
              <Sparkles className="w-4 h-4 text-purple-500" />
            )}
          </div>
          <p className="text-gray-600 text-sm">{task.description}</p>
        </div>
        <span className={`px-2 py-1 rounded text-xs border ${priorityColors[task.priority]}`}>
          {task.priority}
        </span>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            {task.source === 'email' && <Mail className="w-4 h-4" />}
            {task.source === 'calendar' && <Calendar className="w-4 h-4" />}
            {task.source === 'both' && (
              <>
                <Mail className="w-4 h-4" />
                <Calendar className="w-4 h-4" />
              </>
            )}
          </div>
          <span className="text-gray-400">•</span>
          <span>{task.dueDate}</span>
        </div>
        
        {task.teamMembers.length > 0 && (
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-400" />
            <div className="flex -space-x-2">
              {task.teamMembers.map((member) => (
                <div
                  key={member.id}
                  className="w-7 h-7 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-xs text-gray-600 overflow-hidden"
                  title={member.name}
                >
                  {member.avatar ? (
                    <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                  ) : (
                    member.name.split(' ').map(n => n[0]).join('').toUpperCase()
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
