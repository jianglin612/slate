import { X, FileText, Video, Package, Zap, Plus, Sparkles } from 'lucide-react';
import { Task } from './TaskCard';

interface TaskTemplatesProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: Partial<Task>) => void;
}

const templates = [
  {
    id: 'weekly-report',
    name: 'Weekly Report',
    icon: <FileText className="w-5 h-5 text-green-400" />,
    color: 'green',
    template: {
      title: 'Weekly Report',
      description: 'Compile and share weekly progress update with team',
      priority: 'medium' as const,
      category: 'deliverables',
      dueDate: 'Friday',
      subtasks: [
        { id: '1', title: 'Review completed tasks', completed: false },
        { id: '2', title: 'Document key achievements', completed: false },
        { id: '3', title: 'List upcoming priorities', completed: false },
        { id: '4', title: 'Share with team', completed: false },
      ],
      tags: ['report', 'weekly']
    }
  },
  {
    id: 'client-meeting',
    name: 'Client Meeting',
    icon: <Video className="w-5 h-5 text-blue-400" />,
    color: 'blue',
    template: {
      title: 'Client Meeting',
      description: 'Meet with client to discuss project progress and next steps',
      priority: 'high' as const,
      category: 'meetings',
      dueDate: 'TBD',
      subtasks: [
        { id: '1', title: 'Prepare agenda', completed: false },
        { id: '2', title: 'Review previous meeting notes', completed: false },
        { id: '3', title: 'Prepare demo/presentation', completed: false },
        { id: '4', title: 'Send calendar invite', completed: false },
        { id: '5', title: 'Send follow-up email', completed: false },
      ],
      tags: ['client', 'meeting']
    }
  },
  {
    id: 'project-kickoff',
    name: 'Project Kickoff',
    icon: <Package className="w-5 h-5 text-purple-400" />,
    color: 'purple',
    template: {
      title: 'Project Kickoff',
      description: 'Initialize new project with team and stakeholders',
      priority: 'high' as const,
      category: 'projects',
      dueDate: 'TBD',
      subtasks: [
        { id: '1', title: 'Define project goals and scope', completed: false },
        { id: '2', title: 'Identify team members and roles', completed: false },
        { id: '3', title: 'Set timeline and milestones', completed: false },
        { id: '4', title: 'Schedule kickoff meeting', completed: false },
        { id: '5', title: 'Create project documentation', completed: false },
      ],
      tags: ['project', 'kickoff']
    }
  },
  {
    id: 'code-review',
    name: 'Code Review',
    icon: <Zap className="w-5 h-5 text-amber-400" />,
    color: 'amber',
    template: {
      title: 'Code Review',
      description: 'Review pull request and provide feedback',
      priority: 'medium' as const,
      category: 'action-items',
      dueDate: 'Today',
      subtasks: [
        { id: '1', title: 'Review code changes', completed: false },
        { id: '2', title: 'Test functionality', completed: false },
        { id: '3', title: 'Check for security issues', completed: false },
        { id: '4', title: 'Provide feedback', completed: false },
        { id: '5', title: 'Approve or request changes', completed: false },
      ],
      tags: ['code', 'review']
    }
  },
  {
    id: '1on1',
    name: '1-on-1 Meeting',
    icon: <Video className="w-5 h-5 text-pink-400" />,
    color: 'pink',
    template: {
      title: '1-on-1 Meeting',
      description: 'Regular check-in with team member',
      priority: 'medium' as const,
      category: 'meetings',
      dueDate: 'TBD',
      isRecurring: true,
      recurrencePattern: 'weekly',
      subtasks: [
        { id: '1', title: 'Review recent work and challenges', completed: false },
        { id: '2', title: 'Discuss career goals', completed: false },
        { id: '3', title: 'Provide feedback', completed: false },
        { id: '4', title: 'Set action items', completed: false },
      ],
      tags: ['1on1', 'recurring']
    }
  },
  {
    id: 'sprint-planning',
    name: 'Sprint Planning',
    icon: <Package className="w-5 h-5 text-indigo-400" />,
    color: 'indigo',
    template: {
      title: 'Sprint Planning',
      description: 'Plan upcoming sprint with team',
      priority: 'high' as const,
      category: 'meetings',
      dueDate: 'TBD',
      isRecurring: true,
      recurrencePattern: 'biweekly',
      subtasks: [
        { id: '1', title: 'Review backlog items', completed: false },
        { id: '2', title: 'Estimate story points', completed: false },
        { id: '3', title: 'Assign tasks to team members', completed: false },
        { id: '4', title: 'Set sprint goals', completed: false },
      ],
      tags: ['sprint', 'planning', 'recurring']
    }
  }
];

export function TaskTemplates({ isOpen, onClose, onSelectTemplate }: TaskTemplatesProps) {
  if (!isOpen) return null;

  const handleSelectTemplate = (template: Partial<Task>) => {
    onSelectTemplate({
      ...template,
      id: Date.now().toString(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-6 animate-fade-in">
      <div className="bg-gradient-to-br from-[#1a1b1e] to-[#131416] border border-gray-800/50 rounded-2xl w-full max-w-4xl shadow-2xl max-h-[90vh] overflow-hidden backdrop-blur-xl animate-slide-up">
        {/* Header */}
        <div className="border-b border-gray-800/50 p-6 bg-gradient-to-r from-blue-500/5 to-purple-500/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl border border-blue-500/30">
                <Sparkles className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">Task Templates</h2>
                <p className="text-sm text-gray-400 mt-0.5">Start with a pre-built template</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/5 rounded-xl transition-all"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Templates Grid */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map((item) => (
              <button
                key={item.id}
                onClick={() => handleSelectTemplate(item.template)}
                className="text-left bg-gradient-to-br from-white/[0.07] to-white/[0.03] border border-gray-800/50 rounded-xl p-5 hover:border-gray-700/50 hover:shadow-lg hover:shadow-blue-500/5 transition-all group"
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 bg-${item.color}-500/20 rounded-xl border border-${item.color}-500/30 group-hover:scale-110 transition-transform`}>
                    {item.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-semibold mb-1 group-hover:text-blue-400 transition-colors">
                      {item.name}
                    </h3>
                    <p className="text-sm text-gray-400 mb-3">{item.template.description}</p>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-2 py-1 bg-white/5 border border-gray-800 rounded text-xs text-gray-500">
                        {item.template.subtasks?.length || 0} subtasks
                      </span>
                      {item.template.isRecurring && (
                        <span className="px-2 py-1 bg-purple-500/10 border border-purple-500/30 rounded text-xs text-purple-400">
                          Recurring
                        </span>
                      )}
                      {item.template.tags?.map((tag) => (
                        <span key={tag} className="px-2 py-1 bg-blue-500/10 border border-blue-500/30 rounded text-xs text-blue-400">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </button>
            ))}

            {/* Create Custom Template */}
            <button
              onClick={onClose}
              className="text-left bg-gradient-to-br from-white/[0.03] to-white/[0.01] border-2 border-dashed border-gray-800/50 rounded-xl p-5 hover:border-gray-700/50 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/5 rounded-xl border border-gray-800 group-hover:bg-white/10 transition-all">
                  <Plus className="w-5 h-5 text-gray-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-semibold mb-1">Create Custom Template</h3>
                  <p className="text-sm text-gray-400">Build your own reusable template</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
