import { useState, useRef } from 'react';
import { Mail, Calendar, Users, GripVertical, MoreHorizontal, Trash2, Edit2, Lock, Scissors } from 'lucide-react';
import { useDrag, useDrop } from 'react-dnd';

interface TeamMember {
  id: string;
  name: string;
  avatar: string;
}

interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
  source: 'email' | 'calendar' | 'both';
  teamMembers: TeamMember[];
  category: string;
  isPrivate?: boolean;
  subtasks?: Subtask[];
  attachments?: Attachment[];
  tags?: string[];
  isRecurring?: boolean;
  recurrencePattern?: string;
  weekOffset?: number; // 0 = current week, -1 = last week, 1 = next week
  completed?: boolean;
}

interface TaskCardProps {
  task: Task;
  index: number;
  onMoveComplete: (dragId: string, dropTargetId: string | null, targetCategory: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onToggleComplete?: (taskId: string) => void;
  onBreakdown?: (task: Task) => void;
  theme?: 'dark' | 'light';
}

export function TaskCard({ task, index, onMoveComplete, onEdit, onDelete, onToggleComplete, onBreakdown, theme = 'dark' }: TaskCardProps) {
  const isDark = theme === 'dark';
  const [showMenu, setShowMenu] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag, preview] = useDrag({
    type: 'TASK',
    item: () => {
      console.log('Drag started:', task.id);
      return { id: task.id, category: task.category };
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    end: (item, monitor) => {
      console.log('Drag ended:', { item, didDrop: monitor.didDrop() });
    },
  });

  const [{ isOver, canDrop }, drop] = useDrop({
    accept: 'TASK',
    canDrop: (item: { id: string; category: string }) => item.id !== task.id,
    drop(item: { id: string; category: string }) {
      console.log('Drop detected:', { dragId: item.id, dropTargetId: task.id, targetCategory: task.category });
      onMoveComplete(item.id, task.id, task.category);
      return { moved: true };
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
      canDrop: monitor.canDrop(),
    }),
  });

  // Apply drag to the whole card for easier dragging
  drag(drop(ref));

  const priorityColors = {
    high: 'text-red-400',
    medium: 'text-amber-400',
    low: 'text-blue-400'
  };

  return (
    <div
      ref={ref}
      className={`flex items-center gap-3 px-3 py-2.5 ${isDark ? 'hover:bg-white/[0.03]' : 'hover:bg-gray-100'} rounded-lg transition-all duration-200 group cursor-pointer ${isDragging ? 'opacity-50 scale-95' : ''} ${isOver && canDrop ? 'ring-2 ring-blue-500 bg-blue-500/10' : ''} ${task.completed ? 'opacity-60' : ''}`}
    >
      {/* Checkbox */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleComplete?.(task.id);
        }}
        className={`flex-shrink-0 w-5 h-5 rounded border-2 ${isDark ? 'border-gray-600 hover:border-gray-500 hover:bg-white/5' : 'border-gray-300 hover:border-gray-400 hover:bg-gray-100'} flex items-center justify-center transition-all`}
      >
        {task.completed && (
          <svg className="w-3 h-3 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>

      {/* Drag Handle */}
      <div 
        className="cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical className="w-4 h-4 text-gray-600" />
      </div>

      {/* Content */}
      <div 
        className="flex-1 min-w-0 flex items-center gap-3"
        onClick={() => onEdit(task)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            {task.isPrivate && (
              <Lock className="w-3 h-3 text-purple-400" title="Private task" />
            )}
            <h3 className={`text-sm font-medium ${task.completed ? 'line-through text-gray-500' : isDark ? 'text-white' : 'text-gray-900'}`}>
              {task.title}
            </h3>
          </div>
          <p className={`text-xs leading-relaxed ${task.completed ? 'line-through text-gray-600' : isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {task.description}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Due Date */}
          <span className="text-xs text-gray-500 whitespace-nowrap">{task.dueDate}</span>

          {/* Source Icons */}
          <div className="flex items-center gap-1">
            {task.source === 'email' && <Mail className="w-3.5 h-3.5 text-gray-600" />}
            {task.source === 'calendar' && <Calendar className="w-3.5 h-3.5 text-gray-600" />}
            {task.source === 'both' && (
              <>
                <Mail className="w-3.5 h-3.5 text-gray-600" />
                <Calendar className="w-3.5 h-3.5 text-gray-600" />
              </>
            )}
          </div>

          {/* Team Members */}
          {task.teamMembers.length > 0 && (
            <div className="flex -space-x-2">
              {task.teamMembers.slice(0, 3).map((member) => (
                <div
                  key={member.id}
                  className="w-6 h-6 rounded-full border-2 border-[#131416] bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-[10px] text-white font-medium"
                  title={member.name}
                >
                  {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </div>
              ))}
            </div>
          )}

          {/* Priority Indicator */}
          <div className={`w-2 h-2 rounded-full ${
            task.priority === 'high' ? 'bg-red-500' : 
            task.priority === 'medium' ? 'bg-amber-500' : 
            'bg-blue-500'
          }`} title={`${task.priority} priority`} />
        </div>
      </div>

      {/* Menu */}
      <div className="relative flex-shrink-0">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu(!showMenu);
          }}
          className="p-1.5 hover:bg-white/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200"
        >
          <MoreHorizontal className="w-4 h-4 text-gray-400" />
        </button>
        
        {showMenu && (
          <>
            <div 
              className="fixed inset-0 z-10" 
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(false);
              }}
            />
            <div className="absolute right-0 mt-1 bg-[#1a1b1e] border border-gray-800 rounded-xl shadow-xl z-20 min-w-[140px] overflow-hidden backdrop-blur-xl animate-slide-up">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(task);
                  setShowMenu(false);
                }}
                className="w-full px-3 py-2.5 text-left text-sm text-gray-300 hover:bg-white/10 flex items-center gap-2 transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" />
                Edit
              </button>
              {onBreakdown && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onBreakdown(task);
                    setShowMenu(false);
                  }}
                  className="w-full px-3 py-2.5 text-left text-sm text-gray-300 hover:bg-white/10 flex items-center gap-2 transition-colors"
                >
                  <Scissors className="w-3.5 h-3.5" />
                  Breakdown
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(task.id);
                  setShowMenu(false);
                }}
                className="w-full px-3 py-2.5 text-left text-sm text-red-400 hover:bg-white/10 flex items-center gap-2 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}