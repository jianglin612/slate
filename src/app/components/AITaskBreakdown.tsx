import { Sparkles, Clock, CheckCircle2, Plus, X } from 'lucide-react';
import { Task } from './TaskCard';
import { useState } from 'react';

interface AITaskBreakdownProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  onCreateSubtasks: (subtasks: Array<{ title: string; estimatedTime: string }>) => void;
  theme?: 'dark' | 'light';
}

interface Subtask {
  title: string;
  estimatedTime: string;
  reasoning: string;
}

export function AITaskBreakdown({ isOpen, onClose, task, onCreateSubtasks, theme = 'dark' }: AITaskBreakdownProps) {
  const isDark = theme === 'dark';
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen || !task) return null;

  // AI logic to break down task into subtasks
  const generateSubtasks = (): Subtask[] => {
    const subs: Subtask[] = [];
    
    // Pattern matching based on task category and title
    const title = task.title.toLowerCase();
    const category = task.category || '';

    if (category === 'projects' || title.includes('project') || title.includes('launch')) {
      subs.push(
        { 
          title: 'Research and planning phase',
          estimatedTime: '2-3 hours',
          reasoning: 'Projects typically start with thorough research and planning'
        },
        {
          title: 'Create initial design/wireframes',
          estimatedTime: '3-4 hours',
          reasoning: 'Visual planning helps align stakeholders early'
        },
        {
          title: 'Gather team feedback and iterate',
          estimatedTime: '1-2 hours',
          reasoning: 'Collaboration improves outcomes and catches issues early'
        },
        {
          title: 'Implementation and development',
          estimatedTime: '5-8 hours',
          reasoning: 'Core work phase, estimate based on project complexity'
        },
        {
          title: 'Testing and quality assurance',
          estimatedTime: '2-3 hours',
          reasoning: 'QA prevents issues from reaching production'
        },
        {
          title: 'Final review and deployment',
          estimatedTime: '1-2 hours',
          reasoning: 'Last check before going live'
        }
      );
    } else if (category === 'deliverables' || title.includes('deliver') || title.includes('create')) {
      subs.push(
        {
          title: 'Define requirements and scope',
          estimatedTime: '1 hour',
          reasoning: 'Clear scope prevents scope creep'
        },
        {
          title: 'Draft initial version',
          estimatedTime: '3-4 hours',
          reasoning: 'First draft captures main ideas and structure'
        },
        {
          title: 'Review with stakeholders',
          estimatedTime: '1-2 hours',
          reasoning: 'Early feedback saves time on revisions'
        },
        {
          title: 'Revise based on feedback',
          estimatedTime: '2-3 hours',
          reasoning: 'Incorporating feedback improves quality'
        },
        {
          title: 'Final polish and submission',
          estimatedTime: '1 hour',
          reasoning: 'Final quality check and delivery'
        }
      );
    } else if (category === 'meetings' || title.includes('meeting') || title.includes('sync')) {
      subs.push(
        {
          title: 'Prepare agenda and discussion points',
          estimatedTime: '30 min',
          reasoning: 'Structured agenda makes meetings more productive'
        },
        {
          title: 'Share pre-read materials with attendees',
          estimatedTime: '15 min',
          reasoning: 'Pre-reads help everyone come prepared'
        },
        {
          title: 'Conduct the meeting',
          estimatedTime: '1 hour',
          reasoning: 'Estimated meeting duration'
        },
        {
          title: 'Document decisions and action items',
          estimatedTime: '20 min',
          reasoning: 'Clear documentation ensures follow-through'
        },
        {
          title: 'Send follow-up summary to team',
          estimatedTime: '10 min',
          reasoning: 'Keeps everyone aligned on outcomes'
        }
      );
    } else if (title.includes('design')) {
      subs.push(
        {
          title: 'Research design inspiration and trends',
          estimatedTime: '1-2 hours',
          reasoning: 'Inspiration helps create modern, effective designs'
        },
        {
          title: 'Create low-fidelity sketches',
          estimatedTime: '1 hour',
          reasoning: 'Quick sketches explore ideas without commitment'
        },
        {
          title: 'Develop high-fidelity mockups',
          estimatedTime: '3-5 hours',
          reasoning: 'Detailed mockups show final vision'
        },
        {
          title: 'Present to team and gather feedback',
          estimatedTime: '1 hour',
          reasoning: 'Team input improves design quality'
        },
        {
          title: 'Iterate and finalize design',
          estimatedTime: '2-3 hours',
          reasoning: 'Refinement based on feedback'
        }
      );
    } else {
      // Generic breakdown
      subs.push(
        {
          title: 'Break down task into smaller steps',
          estimatedTime: '30 min',
          reasoning: 'Planning helps identify all necessary work'
        },
        {
          title: 'Complete core work',
          estimatedTime: '3-5 hours',
          reasoning: 'Main execution phase of the task'
        },
        {
          title: 'Review and refine output',
          estimatedTime: '1 hour',
          reasoning: 'Quality check ensures good results'
        },
        {
          title: 'Share with team or stakeholders',
          estimatedTime: '30 min',
          reasoning: 'Communication and handoff'
        }
      );
    }

    return subs;
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setSubtasks(generateSubtasks());
      setIsGenerating(false);
    }, 1200); // Simulate AI thinking time
  };

  const handleCreate = () => {
    onCreateSubtasks(subtasks.map(s => ({ title: s.title, estimatedTime: s.estimatedTime })));
    onClose();
    setSubtasks([]);
  };

  const totalTimeEstimate = () => {
    // Simple sum of min estimates
    const times = subtasks.map(s => {
      const match = s.estimatedTime.match(/(\d+)/);
      return match ? parseInt(match[0]) : 0;
    });
    const total = times.reduce((a, b) => a + b, 0);
    return `${total}+ hours`;
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-6 animate-fade-in" onClick={onClose}>
      <div className="w-full max-w-3xl max-h-[85vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className={`rounded-2xl overflow-hidden ${isDark ? 'bg-[#1e1e1e] shadow-2xl' : 'bg-white shadow-lg'}`}>
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">AI Task Breakdown</h2>
            </div>
            <p className="text-white/90 mb-3">
              Automatically break down complex tasks into actionable subtasks
            </p>
            <div className={`p-3 rounded-lg ${isDark ? 'bg-white/10' : 'bg-white/20'}`}>
              <p className="text-white font-medium">{task.title}</p>
              {task.description && (
                <p className="text-white/70 text-sm mt-1">{task.description}</p>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-6 max-h-[60vh] overflow-y-auto">
            {subtasks.length === 0 && !isGenerating ? (
              <div className="text-center py-12">
                <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${
                  isDark ? 'bg-blue-600/20' : 'bg-blue-100'
                }`}>
                  <Sparkles className={`w-8 h-8 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                </div>
                <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Ready to break down this task
                </h3>
                <p className={`text-sm mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  AI will analyze the task and create actionable subtasks with time estimates
                </p>
                <button
                  onClick={handleGenerate}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
                >
                  Generate Subtasks
                </button>
              </div>
            ) : isGenerating ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full mx-auto mb-4 bg-gradient-to-r from-blue-600 to-purple-600 animate-pulse" />
                <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Analyzing task...
                </h3>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  AI is breaking down your task into subtasks
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className={`flex items-center justify-between mb-4 pb-4 border-b ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
                  <div>
                    <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {subtasks.length} subtask{subtasks.length === 1 ? '' : 's'} • Estimated: {totalTimeEstimate()}
                    </span>
                  </div>
                  <button
                    onClick={handleCreate}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Create All Subtasks
                  </button>
                </div>

                {subtasks.map((subtask, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-xl border ${isDark ? 'bg-white/[0.03] border-gray-800' : 'bg-gray-50 border-gray-200'}`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                        isDark ? 'bg-blue-600/20 text-blue-400' : 'bg-blue-100 text-blue-600'
                      }`}>
                        {idx + 1}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {subtask.title}
                        </h4>

                        <div className="flex items-center gap-2 mb-2">
                          <Clock className={`w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                          <span className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {subtask.estimatedTime}
                          </span>
                        </div>

                        <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                          {subtask.reasoning}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  onClick={handleGenerate}
                  className={`w-full p-3 rounded-lg text-sm font-medium transition-colors border ${
                    isDark 
                      ? 'border-gray-800 text-gray-400 hover:bg-white/5' 
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Regenerate Subtasks
                </button>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className={`p-4 border-t ${isDark ? 'border-gray-800' : 'border-gray-200'} flex justify-end gap-3`}>
            <button
              onClick={() => {
                onClose();
                setSubtasks([]);
              }}
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
