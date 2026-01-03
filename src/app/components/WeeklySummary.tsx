import { Calendar, TrendingUp, Users, CheckCircle } from 'lucide-react';

interface WeeklySummaryProps {
  totalTasks: number;
  completedTasks: number;
  upcomingMeetings: number;
  collaborators: number;
}

export function WeeklySummary({ totalTasks, completedTasks, upcomingMeetings, collaborators }: WeeklySummaryProps) {
  const completionRate = Math.round((completedTasks / totalTasks) * 100);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-600 text-sm">Total Tasks</span>
          <Calendar className="w-5 h-5 text-blue-500" />
        </div>
        <p className="text-3xl font-semibold text-gray-900">{totalTasks}</p>
        <p className="text-xs text-gray-500 mt-1">This week</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-600 text-sm">Completion Rate</span>
          <TrendingUp className="w-5 h-5 text-green-500" />
        </div>
        <p className="text-3xl font-semibold text-gray-900">{completionRate}%</p>
        <p className="text-xs text-gray-500 mt-1">{completedTasks} of {totalTasks} done</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-600 text-sm">Meetings</span>
          <CheckCircle className="w-5 h-5 text-purple-500" />
        </div>
        <p className="text-3xl font-semibold text-gray-900">{upcomingMeetings}</p>
        <p className="text-xs text-gray-500 mt-1">Scheduled</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-600 text-sm">Collaborators</span>
          <Users className="w-5 h-5 text-amber-500" />
        </div>
        <p className="text-3xl font-semibold text-gray-900">{collaborators}</p>
        <p className="text-xs text-gray-500 mt-1">Team members</p>
      </div>
    </div>
  );
}
