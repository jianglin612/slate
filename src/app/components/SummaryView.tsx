import { Calendar, TrendingUp, Users, CheckCircle2, Target, Award, Zap, Clock, Sparkles, ArrowRight, CheckCheck } from 'lucide-react';
import { Task } from './TaskCard';

interface SummaryViewProps {
  tasks: Task[];
  period: 'monthly' | 'quarterly' | 'yearly';
  theme?: 'dark' | 'light';
  onPeriodChange?: (period: 'monthly' | 'quarterly' | 'yearly') => void;
}

export function SummaryView({ tasks, period, theme = 'dark', onPeriodChange }: SummaryViewProps) {
  const isDark = theme === 'dark';
  
  // Calculate stats
  const completedTasks = tasks.filter(t => t.completed).length;
  const totalTasks = tasks.length;
  
  // Identify major tasks (high priority or tasks with many collaborators)
  const majorTasks = tasks
    .filter(t => t.priority === 'high' || (t.teamMembers && t.teamMembers.length >= 2))
    .slice(0, 5);
  
  // Group remaining tasks by category
  const tasksByCategory = tasks
    .filter(t => !majorTasks.includes(t))
    .reduce((acc, task) => {
      const cat = task.category || 'other';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(task);
      return acc;
    }, {} as Record<string, Task[]>);

  // Get unique collaborators
  const collaboratorMap = new Map<string, number>();
  tasks.forEach(task => {
    task.teamMembers?.forEach(member => {
      collaboratorMap.set(member.name, (collaboratorMap.get(member.name) || 0) + 1);
    });
  });

  // Sort collaborators by frequency
  const topCollaborators = Array.from(collaboratorMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const getPeriodLabel = () => {
    if (period === 'monthly') return 'January 2026';
    if (period === 'quarterly') return 'Q1 2026';
    return '2026';
  };

  const getPeriodDescription = () => {
    if (period === 'monthly') return 'This month';
    if (period === 'quarterly') return 'This quarter';
    return 'This year';
  };

  const categoryLabels: Record<string, string> = {
    'action-items': 'Action Items',
    'meetings': 'Meetings',
    'deliverables': 'Deliverables',
    'projects': 'Projects',
  };

  // Generate AI-style summary text
  const generateSummaryText = () => {
    const completedCount = completedTasks;
    const pendingCount = totalTasks - completedTasks;
    const majorCount = majorTasks.length;
    
    if (totalTasks === 0) {
      return `${getPeriodDescription()} was focused on planning and preparation. No major tasks were tracked during this period.`;
    }
    
    if (completedCount === totalTasks) {
      return `${getPeriodDescription()} was highly productive with all ${totalTasks} tasks completed. The team made significant progress across ${Object.keys(tasksByCategory).length} key areas, with ${majorCount} major accomplishments standing out.`;
    }
    
    if (completedCount > totalTasks * 0.7) {
      return `${getPeriodDescription()} showed strong momentum with ${completedCount} of ${totalTasks} tasks completed. The focus was on ${majorCount} major initiatives while maintaining progress across ${Object.keys(tasksByCategory).length} different areas.`;
    }
    
    return `${getPeriodDescription()} involved ${totalTasks} tasks across multiple areas, with ${completedCount} completed. The team prioritized ${majorCount} major initiatives while working on ${Object.keys(tasksByCategory).length} different categories.`;
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in pb-8">
      {/* Period Toggle - Material Design Segmented Button */}
      {onPeriodChange && (
        <div className={`inline-flex rounded-lg overflow-hidden ${isDark ? 'bg-[#1e1e1e]' : 'bg-gray-100'} p-1`}>
          <button
            onClick={() => onPeriodChange('monthly')}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
              period === 'monthly'
                ? (isDark ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-blue-600 shadow-md')
                : (isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900')
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => onPeriodChange('quarterly')}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
              period === 'quarterly'
                ? (isDark ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-blue-600 shadow-md')
                : (isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900')
            }`}
          >
            Quarterly
          </button>
          <button
            onClick={() => onPeriodChange('yearly')}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
              period === 'yearly'
                ? (isDark ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-blue-600 shadow-md')
                : (isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900')
            }`}
          >
            Yearly
          </button>
        </div>
      )}
      
      {/* AI-Generated Summary Header - Material Card */}
      <div className={`rounded-2xl overflow-hidden ${
        isDark ? 'bg-[#1e1e1e] shadow-2xl' : 'bg-white shadow-lg'
      }`}>
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full">
              <span className="text-xs font-medium text-white">AI Generated</span>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">
            {getPeriodLabel()}
          </h2>
          <p className="text-lg text-white/90 leading-relaxed">
            {generateSummaryText()}
          </p>
        </div>
        
        {/* Quick stats - Material Design Metrics */}
        <div className="grid grid-cols-3 divide-x divide-gray-200 dark:divide-gray-800">
          <div className="p-6 text-center">
            <div className="flex items-center justify-center mb-2">
              <div className={`p-2 rounded-full ${isDark ? 'bg-green-600/20' : 'bg-green-100'}`}>
                <CheckCheck className={`w-5 h-5 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
              </div>
            </div>
            <div className={`text-3xl font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {completedTasks}
            </div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Completed
            </div>
          </div>
          
          <div className="p-6 text-center">
            <div className="flex items-center justify-center mb-2">
              <div className={`p-2 rounded-full ${isDark ? 'bg-blue-600/20' : 'bg-blue-100'}`}>
                <Clock className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
              </div>
            </div>
            <div className={`text-3xl font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {totalTasks - completedTasks}
            </div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              In Progress
            </div>
          </div>
          
          <div className="p-6 text-center">
            <div className="flex items-center justify-center mb-2">
              <div className={`p-2 rounded-full ${isDark ? 'bg-purple-600/20' : 'bg-purple-100'}`}>
                <Users className={`w-5 h-5 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
              </div>
            </div>
            <div className={`text-3xl font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {collaboratorMap.size}
            </div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Collaborators
            </div>
          </div>
        </div>
      </div>

      {/* Major Accomplishments - Material Card */}
      {majorTasks.length > 0 && (
        <div className={`rounded-2xl overflow-hidden ${
          isDark ? 'bg-[#1e1e1e] shadow-2xl' : 'bg-white shadow-lg'
        }`}>
          <div className="p-6 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${isDark ? 'bg-yellow-600/20' : 'bg-yellow-100'}`}>
                <Award className={`w-6 h-6 ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`} />
              </div>
              <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Major Accomplishments
              </h3>
            </div>
          </div>
          
          <div className="divide-y divide-gray-200 dark:divide-gray-800">
            {majorTasks.map((task, idx) => (
              <div 
                key={task.id}
                className={`p-6 transition-all ${
                  isDark ? 'hover:bg-white/[0.03]' : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg">
                    {idx + 1}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <h4 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {task.title}
                      </h4>
                      {task.completed && (
                        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full ${isDark ? 'bg-green-600/20 text-green-400' : 'bg-green-100 text-green-700'}`}>
                          <CheckCircle2 className="w-4 h-4" />
                          <span className="text-xs font-medium">Complete</span>
                        </div>
                      )}
                    </div>
                    
                    {task.description && (
                      <p className={`mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {task.description}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-4 flex-wrap">
                      {task.teamMembers && task.teamMembers.length > 0 && (
                        <div className="flex items-center gap-2">
                          <div className="flex -space-x-2">
                            {task.teamMembers.slice(0, 3).map((member, i) => (
                              <div 
                                key={i}
                                className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-semibold ring-4 ring-[#0D0D0D] dark:ring-[#1e1e1e] shadow-md"
                                title={member.name}
                              >
                                {member.name.split(' ').map(n => n[0]).join('')}
                              </div>
                            ))}
                            {task.teamMembers.length > 3 && (
                              <div className={`w-8 h-8 rounded-full ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'} flex items-center justify-center text-xs font-semibold ring-4 ring-[#0D0D0D] dark:ring-[#1e1e1e]`}>
                                +{task.teamMembers.length - 3}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {task.dueDate && (
                        <div className={`flex items-center gap-2 px-3 py-1 rounded-lg ${isDark ? 'bg-white/5' : 'bg-gray-100'}`}>
                          <Calendar className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                          <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {task.dueDate}
                          </span>
                        </div>
                      )}
                      
                      {task.priority && (
                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                          task.priority === 'high' 
                            ? (isDark ? 'bg-red-600/20 text-red-400' : 'bg-red-100 text-red-700')
                            : task.priority === 'medium'
                            ? (isDark ? 'bg-amber-600/20 text-amber-400' : 'bg-amber-100 text-amber-700')
                            : (isDark ? 'bg-blue-600/20 text-blue-400' : 'bg-blue-100 text-blue-700')
                        }`}>
                          {task.priority.toUpperCase()} PRIORITY
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Activity Summary - Material Cards Grid */}
      {Object.keys(tasksByCategory).length > 0 && (
        <div className={`rounded-2xl overflow-hidden ${
          isDark ? 'bg-[#1e1e1e] shadow-2xl' : 'bg-white shadow-lg'
        }`}>
          <div className="p-6 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${isDark ? 'bg-blue-600/20' : 'bg-blue-100'}`}>
                <Zap className={`w-6 h-6 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
              </div>
              <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Activity Summary
              </h3>
            </div>
          </div>
          
          <div className="p-6 space-y-6">
            {Object.entries(tasksByCategory).map(([category, categoryTasks]) => {
              const label = categoryLabels[category] || category.charAt(0).toUpperCase() + category.slice(1);
              const completed = categoryTasks.filter(t => t.completed).length;
              const total = categoryTasks.length;
              const percentage = total > 0 ? (completed / total) * 100 : 0;
              
              return (
                <div key={category} className={`p-5 rounded-xl ${isDark ? 'bg-white/[0.03]' : 'bg-gray-50'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {label}
                    </h4>
                    <span className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {completed} / {total} completed
                    </span>
                  </div>
                  
                  {/* Progress bar */}
                  <div className={`w-full h-2 rounded-full mb-3 overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`}>
                    <div 
                      className="h-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-500 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  
                  <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {category === 'action-items' && `Focused on ${total} action items, completing ${completed} tasks that moved key initiatives forward.`}
                    {category === 'meetings' && `Participated in ${total} meetings to align on priorities and collaborate with the team.`}
                    {category === 'deliverables' && `Delivered ${completed} out of ${total} key deliverables, maintaining momentum on critical outputs.`}
                    {category === 'projects' && `Advanced ${total} active projects with ${completed} milestones reached.`}
                    {!['action-items', 'meetings', 'deliverables', 'projects'].includes(category) && 
                      `Worked on ${total} ${label.toLowerCase()} with ${completed} completed successfully.`}
                  </p>
                  
                  {/* Sample tasks */}
                  <div className="space-y-2">
                    {categoryTasks.slice(0, 3).map(task => (
                      <div 
                        key={task.id}
                        className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                          isDark ? 'hover:bg-white/[0.05]' : 'hover:bg-white'
                        }`}
                      >
                        <div className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          task.completed 
                            ? (isDark ? 'bg-green-600 border-green-600' : 'bg-green-500 border-green-500')
                            : (isDark ? 'border-gray-600' : 'border-gray-400')
                        }`}>
                          {task.completed && (
                            <CheckCircle2 className="w-3 h-3 text-white" />
                          )}
                        </div>
                        <span className={`text-sm flex-1 ${task.completed ? (isDark ? 'text-gray-600 line-through' : 'text-gray-500 line-through') : (isDark ? 'text-gray-300' : 'text-gray-700')}`}>
                          {task.title}
                        </span>
                      </div>
                    ))}
                    
                    {categoryTasks.length > 3 && (
                      <div className={`text-sm px-3 py-2 ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                        +{categoryTasks.length - 3} more tasks
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Team Highlights - Material Card */}
      {topCollaborators.length > 0 && (
        <div className={`rounded-2xl overflow-hidden ${
          isDark ? 'bg-[#1e1e1e] shadow-2xl' : 'bg-white shadow-lg'
        }`}>
          <div className="p-6 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${isDark ? 'bg-purple-600/20' : 'bg-purple-100'}`}>
                <Users className={`w-6 h-6 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
              </div>
              <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Team Highlights
              </h3>
            </div>
          </div>
          
          <div className="p-6">
            <p className={`mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {getPeriodDescription()} involved collaboration with {collaboratorMap.size} team member{collaboratorMap.size === 1 ? '' : 's'}, 
              with the most frequent partnerships being:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {topCollaborators.map(([name, count], idx) => (
                <div 
                  key={idx}
                  className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
                    isDark ? 'bg-white/[0.03] hover:bg-white/[0.05]' : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold shadow-lg">
                    {name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="flex-1">
                    <div className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {name}
                    </div>
                    <div className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                      {count} task{count === 1 ? '' : 's'} together
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full ${isDark ? 'bg-blue-600/20 text-blue-400' : 'bg-blue-100 text-blue-700'} font-semibold text-sm`}>
                    {count}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}