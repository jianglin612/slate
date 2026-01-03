import { Sparkles, Clock, Calendar, TrendingUp, Zap, Coffee, Sun, Moon } from 'lucide-react';
import { Task } from './TaskCard';

interface AIDailyPlannerProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  theme?: 'dark' | 'light';
}

interface TimeBlock {
  time: string;
  period: 'morning' | 'midday' | 'afternoon' | 'evening';
  task: Task | null;
  type: 'focus' | 'collaboration' | 'break' | 'admin';
  reasoning: string;
}

export function AIDailyPlanner({ isOpen, onClose, tasks, theme = 'dark' }: AIDailyPlannerProps) {
  const isDark = theme === 'dark';

  if (!isOpen) return null;

  // AI logic to create optimal daily plan
  const generateDailyPlan = (): TimeBlock[] => {
    const plan: TimeBlock[] = [];
    const availableTasks = tasks.filter(t => !t.completed);
    const highPriority = availableTasks.filter(t => t.priority === 'high');
    const mediumPriority = availableTasks.filter(t => t.priority === 'medium');
    const meetings = availableTasks.filter(t => t.category === 'meetings');
    
    // Morning - Deep work (best for high-priority complex tasks)
    plan.push({
      time: '9:00 - 9:30 AM',
      period: 'morning',
      task: null,
      type: 'focus',
      reasoning: 'Start with planning to set clear intentions for the day'
    });

    if (highPriority.length > 0) {
      plan.push({
        time: '9:30 - 11:30 AM',
        period: 'morning',
        task: highPriority[0],
        type: 'focus',
        reasoning: 'Peak focus time - tackle most important task when energy is highest'
      });
    }

    plan.push({
      time: '11:30 - 12:00 PM',
      period: 'morning',
      task: null,
      type: 'break',
      reasoning: 'Mid-morning break to recharge before lunch'
    });

    // Midday - Collaboration and meetings
    if (meetings.length > 0) {
      plan.push({
        time: '12:00 - 1:00 PM',
        period: 'midday',
        task: meetings[0],
        type: 'collaboration',
        reasoning: 'Schedule meetings when others are typically available'
      });
    } else {
      plan.push({
        time: '12:00 - 1:00 PM',
        period: 'midday',
        task: null,
        type: 'break',
        reasoning: 'Lunch break - step away to recharge'
      });
    }

    // Afternoon - Collaborative work
    if (mediumPriority.length > 0) {
      const collaborativeTask = mediumPriority.find(t => t.teamMembers && t.teamMembers.length > 0);
      plan.push({
        time: '1:00 - 3:00 PM',
        period: 'afternoon',
        task: collaborativeTask || mediumPriority[0],
        type: 'collaboration',
        reasoning: 'Afternoon is ideal for collaborative tasks when team is active'
      });
    }

    if (highPriority.length > 1) {
      plan.push({
        time: '3:00 - 4:30 PM',
        period: 'afternoon',
        task: highPriority[1],
        type: 'focus',
        reasoning: 'Second focus block for another priority task'
      });
    }

    // Evening - Admin and wrap-up
    plan.push({
      time: '4:30 - 5:00 PM',
      period: 'evening',
      task: null,
      type: 'admin',
      reasoning: 'Review progress, respond to messages, plan tomorrow'
    });

    return plan;
  };

  const plan = generateDailyPlan();

  const getPeriodIcon = (period: string) => {
    if (period === 'morning') return Sun;
    if (period === 'midday') return Sun;
    if (period === 'afternoon') return Coffee;
    return Moon;
  };

  const getTypeColor = (type: string) => {
    if (type === 'focus') return isDark ? 'bg-blue-600/20 text-blue-400 border-blue-600/30' : 'bg-blue-100 text-blue-700 border-blue-200';
    if (type === 'collaboration') return isDark ? 'bg-purple-600/20 text-purple-400 border-purple-600/30' : 'bg-purple-100 text-purple-700 border-purple-200';
    if (type === 'break') return isDark ? 'bg-green-600/20 text-green-400 border-green-600/30' : 'bg-green-100 text-green-700 border-green-200';
    return isDark ? 'bg-gray-600/20 text-gray-400 border-gray-600/30' : 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const getTypeIcon = (type: string) => {
    if (type === 'focus') return Zap;
    if (type === 'collaboration') return TrendingUp;
    if (type === 'break') return Coffee;
    return Clock;
  };

  const today = new Date();
  const dateString = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-6 animate-fade-in" onClick={onClose}>
      <div className="w-full max-w-4xl max-h-[85vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className={`rounded-2xl overflow-hidden ${isDark ? 'bg-[#1e1e1e] shadow-2xl' : 'bg-white shadow-lg'}`}>
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">AI Daily Planner</h2>
            </div>
            <p className="text-white/90 mb-2">
              Optimized schedule based on your tasks, energy levels, and work patterns
            </p>
            <div className="flex items-center gap-2 text-white/80 text-sm">
              <Calendar className="w-4 h-4" />
              <span>{dateString}</span>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 max-h-[65vh] overflow-y-auto">
            <div className="space-y-3">
              {plan.map((block, idx) => {
                const PeriodIcon = getPeriodIcon(block.period);
                const TypeIcon = getTypeIcon(block.type);
                
                return (
                  <div
                    key={idx}
                    className={`rounded-xl border overflow-hidden ${
                      isDark ? 'bg-white/[0.03] border-gray-800' : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="p-4">
                      <div className="flex items-start gap-4">
                        {/* Time */}
                        <div className="flex-shrink-0 w-32">
                          <div className="flex items-center gap-2 mb-1">
                            <PeriodIcon className={`w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                            <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {block.time}
                            </span>
                          </div>
                          <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium border ${getTypeColor(block.type)}`}>
                            <TypeIcon className="w-3 h-3" />
                            {block.type.charAt(0).toUpperCase() + block.type.slice(1)}
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          {block.task ? (
                            <>
                              <h4 className={`font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {block.task.title}
                              </h4>
                              {block.task.description && (
                                <p className={`text-sm mb-2 ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                                  {block.task.description}
                                </p>
                              )}
                              {block.task.teamMembers && block.task.teamMembers.length > 0 && (
                                <div className="flex items-center gap-2 mb-2">
                                  <div className="flex -space-x-1">
                                    {block.task.teamMembers.slice(0, 3).map((member, i) => (
                                      <div 
                                        key={i}
                                        className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-medium ring-2 ring-[#0D0D0D] dark:ring-[#1e1e1e]"
                                        title={member.name}
                                      >
                                        {member.name.split(' ').map(n => n[0]).join('')}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </>
                          ) : (
                            <h4 className={`font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {block.type === 'break' ? '☕ Break Time' : 
                               block.type === 'admin' ? '📋 Admin & Planning' : 
                               '📝 Planning Time'}
                            </h4>
                          )}
                          
                          <div className={`flex items-start gap-2 p-3 rounded-lg ${isDark ? 'bg-blue-600/10' : 'bg-blue-50'}`}>
                            <Sparkles className={`w-4 h-4 flex-shrink-0 mt-0.5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                            <p className={`text-sm ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
                              {block.reasoning}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Summary Stats */}
            <div className={`mt-6 p-4 rounded-xl border ${isDark ? 'bg-white/[0.03] border-gray-800' : 'bg-gray-50 border-gray-200'}`}>
              <h4 className={`font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Today's Focus
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className={`text-2xl font-bold mb-1 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                    {plan.filter(p => p.type === 'focus').length}
                  </div>
                  <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                    Focus Blocks
                  </div>
                </div>
                <div>
                  <div className={`text-2xl font-bold mb-1 ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
                    {plan.filter(p => p.type === 'collaboration').length}
                  </div>
                  <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                    Collaboration
                  </div>
                </div>
                <div>
                  <div className={`text-2xl font-bold mb-1 ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                    {plan.filter(p => p.type === 'break').length}
                  </div>
                  <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                    Breaks
                  </div>
                </div>
                <div>
                  <div className={`text-2xl font-bold mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {plan.filter(p => p.task !== null).length}
                  </div>
                  <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                    Tasks Planned
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className={`p-4 border-t ${isDark ? 'border-gray-800' : 'border-gray-200'} flex justify-between items-center`}>
            <span className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
              💡 Adjust your calendar to match this optimal schedule
            </span>
            <button
              onClick={onClose}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isDark ? 'text-gray-400 hover:bg-white/5' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
