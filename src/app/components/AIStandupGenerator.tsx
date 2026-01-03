import { Sparkles, Copy, Check, MessageSquare, Mail, Send, MessageCircle, Smartphone } from 'lucide-react';
import { Task } from './TaskCard';
import { useState } from 'react';

interface AIStandupGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  theme?: 'dark' | 'light';
}

export function AIStandupGenerator({ isOpen, onClose, tasks, theme = 'dark' }: AIStandupGeneratorProps) {
  const isDark = theme === 'dark';
  const [copied, setCopied] = useState(false);
  const [format, setFormat] = useState<'standup' | 'weekly'>('standup');
  const [showSendModal, setShowSendModal] = useState(false);
  const [sending, setSending] = useState<string | null>(null);

  if (!isOpen) return null;

  // Generate standup summary
  const generateStandup = () => {
    const today = new Date();
    const completedToday = tasks.filter(t => t.completed).slice(0, 3);
    const inProgressToday = tasks.filter(t => !t.completed && t.priority === 'high').slice(0, 3);
    const blockers = tasks.filter(t => !t.completed && t.priority === 'high' && t.dueDate).slice(0, 2);

    let standup = `📅 Daily Standup - ${today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}\n\n`;
    
    standup += `✅ COMPLETED YESTERDAY:\n`;
    if (completedToday.length > 0) {
      completedToday.forEach(task => {
        standup += `   • ${task.title}\n`;
      });
    } else {
      standup += `   • Focused on planning and preparation\n`;
    }
    
    standup += `\n🎯 WORKING ON TODAY:\n`;
    if (inProgressToday.length > 0) {
      inProgressToday.forEach(task => {
        const estimate = task.dueDate ? ` (Due: ${task.dueDate})` : '';
        standup += `   • ${task.title}${estimate}\n`;
      });
    } else {
      standup += `   • Continuing progress on current initiatives\n`;
    }
    
    standup += `\n🚧 BLOCKERS/NEEDS:\n`;
    if (blockers.length > 0) {
      blockers.forEach(task => {
        if (task.teamMembers && task.teamMembers.length > 0) {
          standup += `   • ${task.title} - Need input from ${task.teamMembers[0].name}\n`;
        } else {
          standup += `   • ${task.title} - On track, no blockers\n`;
        }
      });
    } else {
      standup += `   • None at the moment, all clear! 🚀\n`;
    }

    return standup;
  };

  // Generate weekly summary
  const generateWeeklySummary = () => {
    const completed = tasks.filter(t => t.completed);
    const inProgress = tasks.filter(t => !t.completed);
    const highPriority = inProgress.filter(t => t.priority === 'high');
    
    const categories = tasks.reduce((acc, task) => {
      const cat = task.category || 'other';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(task);
      return acc;
    }, {} as Record<string, Task[]>);

    const collaborators = new Set<string>();
    tasks.forEach(task => {
      task.teamMembers?.forEach(member => collaborators.add(member.name));
    });

    let summary = `📊 Weekly Summary & Next Week Preview\n`;
    summary += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    
    summary += `🎉 THIS WEEK'S ACCOMPLISHMENTS:\n\n`;
    if (completed.length > 0) {
      const majorCompleted = completed.filter(t => t.priority === 'high').slice(0, 3);
      if (majorCompleted.length > 0) {
        summary += `Major wins:\n`;
        majorCompleted.forEach(task => {
          summary += `   ✓ ${task.title}\n`;
          if (task.description) {
            summary += `     ${task.description}\n`;
          }
        });
      }
      
      const byCategory = completed.reduce((acc, task) => {
        const cat = task.category || 'other';
        acc[cat] = (acc[cat] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      summary += `\nCompleted ${completed.length} tasks across:\n`;
      Object.entries(byCategory).forEach(([cat, count]) => {
        const label = cat === 'action-items' ? 'Action Items' : 
                      cat === 'meetings' ? 'Meetings' :
                      cat === 'deliverables' ? 'Deliverables' :
                      cat === 'projects' ? 'Projects' : cat;
        summary += `   • ${count} ${label}\n`;
      });
    } else {
      summary += `   • Focused on planning and strategic work\n`;
    }
    
    summary += `\n🔥 NEXT WEEK'S PRIORITIES:\n\n`;
    if (highPriority.length > 0) {
      highPriority.slice(0, 5).forEach((task, idx) => {
        summary += `${idx + 1}. ${task.title}\n`;
        if (task.dueDate) {
          summary += `   Due: ${task.dueDate}\n`;
        }
        if (task.teamMembers && task.teamMembers.length > 0) {
          summary += `   Team: ${task.teamMembers.map(m => m.name).join(', ')}\n`;
        }
      });
    } else {
      summary += `   • Planning new initiatives and priorities\n`;
    }
    
    if (collaborators.size > 0) {
      summary += `\n👥 COLLABORATION:\n`;
      summary += `Working with ${collaborators.size} team member${collaborators.size === 1 ? '' : 's'}: ${Array.from(collaborators).slice(0, 5).join(', ')}\n`;
    }
    
    summary += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    summary += `💬 Let me know if you need any support on these items!\n`;

    return summary;
  };

  const content = format === 'standup' ? generateStandup() : generateWeeklySummary();

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
              <h2 className="text-2xl font-bold text-white">AI Update Generator</h2>
            </div>
            <p className="text-white/90">
              Auto-generate standup and weekly summary posts
            </p>
          </div>

          {/* Format Toggle */}
          <div className={`p-4 border-b ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
            <div className={`inline-flex rounded-lg overflow-hidden ${isDark ? 'bg-black/20' : 'bg-gray-100'} p-1`}>
              <button
                onClick={() => setFormat('standup')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  format === 'standup'
                    ? (isDark ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-blue-600 shadow-md')
                    : (isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900')
                }`}
              >
                <MessageSquare className="w-4 h-4 inline mr-2" />
                Daily Standup
              </button>
              <button
                onClick={() => setFormat('weekly')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  format === 'weekly'
                    ? (isDark ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-blue-600 shadow-md')
                    : (isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900')
                }`}
              >
                <Mail className="w-4 h-4 inline mr-2" />
                Weekly Summary
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 max-h-[60vh] overflow-y-auto">
            <div className={`relative rounded-xl p-6 font-mono text-sm ${
              isDark ? 'bg-black/40 border border-gray-800' : 'bg-gray-50 border border-gray-200'
            }`}>
              <button
                onClick={handleCopy}
                className={`absolute top-4 right-4 p-2 rounded-lg transition-all ${
                  isDark ? 'bg-white/10 hover:bg-white/20' : 'bg-white hover:bg-gray-100'
                }`}
                title="Copy to clipboard"
              >
                {copied ? (
                  <Check className={`w-4 h-4 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
                ) : (
                  <Copy className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                )}
              </button>

              <pre className={`whitespace-pre-wrap ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {content}
              </pre>
            </div>

            <div className={`mt-4 p-4 rounded-lg ${isDark ? 'bg-blue-600/10 border border-blue-600/20' : 'bg-blue-50 border border-blue-200'}`}>
              <p className={`text-sm ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
                💡 <strong>Pro tip:</strong> Copy this and paste it directly into Slack, email, or your team chat!
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className={`p-4 border-t ${isDark ? 'border-gray-800' : 'border-gray-200'} flex justify-between items-center`}>
            <span className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
              Generated from {tasks.length} tasks
            </span>
            <div className="flex gap-3 items-center relative">
              <button
                onClick={handleCopy}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Copy className="w-4 h-4" />
                Copy to Clipboard
              </button>
              
              {/* Send Button with Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowSendModal(!showSendModal)}
                  className={`px-4 py-2 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                    sending ? 'bg-green-600' : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
                  }`}
                >
                  {sending ? (
                    <>
                      <Check className="w-4 h-4" />
                      Sent!
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send
                    </>
                  )}
                </button>
                
                {showSendModal && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setShowSendModal(false)}
                    />
                    <div className={`absolute bottom-full right-0 mb-2 min-w-[200px] rounded-xl overflow-hidden shadow-2xl z-20 animate-slide-up ${
                      isDark ? 'bg-[#1e1e1e] border border-gray-800' : 'bg-white border border-gray-200'
                    }`}>
                      <button
                        onClick={() => {
                          setSending('email');
                          setShowSendModal(false);
                          setTimeout(() => setSending(null), 3000);
                        }}
                        className={`w-full px-4 py-3 text-left transition-colors flex items-center gap-3 ${
                          isDark ? 'hover:bg-white/10 text-gray-300' : 'hover:bg-gray-100 text-gray-700'
                        }`}
                      >
                        <Mail className="w-5 h-5 text-blue-500" />
                        <div>
                          <div className="text-sm font-medium">Email</div>
                          <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Send via email</div>
                        </div>
                      </button>
                      
                      <div className={`h-px ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`} />
                      
                      <button
                        onClick={() => {
                          setSending('slack');
                          setShowSendModal(false);
                          setTimeout(() => setSending(null), 3000);
                        }}
                        className={`w-full px-4 py-3 text-left transition-colors flex items-center gap-3 ${
                          isDark ? 'hover:bg-white/10 text-gray-300' : 'hover:bg-gray-100 text-gray-700'
                        }`}
                      >
                        <MessageCircle className="w-5 h-5 text-purple-500" />
                        <div>
                          <div className="text-sm font-medium">Slack</div>
                          <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Post to Slack channel</div>
                        </div>
                      </button>
                      
                      <div className={`h-px ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`} />
                      
                      <button
                        onClick={() => {
                          setSending('sms');
                          setShowSendModal(false);
                          setTimeout(() => setSending(null), 3000);
                        }}
                        className={`w-full px-4 py-3 text-left transition-colors flex items-center gap-3 ${
                          isDark ? 'hover:bg-white/10 text-gray-300' : 'hover:bg-gray-100 text-gray-700'
                        }`}
                      >
                        <Smartphone className="w-5 h-5 text-green-500" />
                        <div>
                          <div className="text-sm font-medium">SMS</div>
                          <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Send text message</div>
                        </div>
                      </button>
                    </div>
                  </>
                )}
              </div>
              
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
    </div>
  );
}
