import { Sparkles, Calendar, X } from 'lucide-react';

interface AIAssistantPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenDailyPlanner: () => void;
  theme?: 'dark' | 'light';
}

export function AIAssistantPanel({ 
  isOpen, 
  onClose, 
  onOpenDailyPlanner,
  theme = 'dark' 
}: AIAssistantPanelProps) {
  const isDark = theme === 'dark';

  if (!isOpen) return null;

  const features = [
    {
      icon: Calendar,
      title: 'Daily Planner',
      description: 'AI-generated optimal schedule for today',
      color: isDark ? 'from-purple-600 to-purple-500' : 'from-purple-500 to-purple-400',
      action: onOpenDailyPlanner
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-6 animate-fade-in" onClick={onClose}>
      <div className="w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
        <div className={`rounded-2xl overflow-hidden ${isDark ? 'bg-[#1e1e1e] shadow-2xl' : 'bg-white shadow-lg'}`}>
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white">AI Assistant</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
            <p className="text-white/90">
              Powerful AI tools to help you work smarter, not harder
            </p>
          </div>

          {/* Features Grid */}
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <button
                  key={idx}
                  onClick={feature.action}
                  className={`group p-6 rounded-xl border text-left transition-all hover:scale-[1.02] ${
                    isDark 
                      ? 'bg-white/[0.03] border-gray-800 hover:bg-white/[0.05] hover:border-gray-700' 
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  
                  <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {feature.title}
                  </h3>
                  
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {feature.description}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div className={`p-4 border-t ${isDark ? 'border-gray-800 bg-white/[0.02]' : 'border-gray-200 bg-gray-50'}`}>
            <p className={`text-sm text-center ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
              ✨ All AI features run locally and analyze your task data in real-time
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}