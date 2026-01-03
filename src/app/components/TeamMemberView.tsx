import { CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface TeamTask {
  id: string;
  title: string;
  status: 'completed' | 'in-progress' | 'pending';
  dueDate: string;
}

interface TeamMemberViewProps {
  name: string;
  avatar: string;
  role: string;
  tasks: TeamTask[];
}

export function TeamMemberView({ name, avatar, role, tasks }: TeamMemberViewProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'in-progress':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'pending':
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 overflow-hidden">
          {avatar ? (
            <img src={avatar} alt={name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-lg">
              {name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </span>
          )}
        </div>
        <div>
          <h3 className="font-medium text-gray-900">{name}</h3>
          <p className="text-sm text-gray-500">{role}</p>
        </div>
      </div>
      
      <div className="space-y-2">
        {tasks.map((task) => (
          <div key={task.id} className="flex items-start gap-2 p-2 rounded bg-gray-50">
            {getStatusIcon(task.status)}
            <div className="flex-1">
              <p className="text-sm text-gray-700">{task.title}</p>
              <p className="text-xs text-gray-500">{task.dueDate}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
