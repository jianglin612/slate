import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useDrop } from 'react-dnd';
import { Task, TaskCard } from './TaskCard';

interface TaskGroupProps {
  title: string;
  tasks: Task[];
  icon: React.ReactNode;
  categoryId: string;
  onMoveComplete: (dragId: string, dropTargetId: string | null, targetCategory: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onToggleComplete?: (taskId: string) => void;
  onBreakdown?: (task: Task) => void;
  theme?: 'dark' | 'light';
}

export function TaskGroup({ title, tasks, icon, categoryId, onMoveComplete, onEdit, onDelete, onToggleComplete, onBreakdown, theme = 'dark' }: TaskGroupProps) {
  const isDark = theme === 'dark';
  const [isExpanded, setIsExpanded] = useState(true);

  // Drop zone at the end of the list
  const [{ isOverEnd }, dropEnd] = useDrop({
    accept: 'TASK',
    drop(item: { id: string; category: string }) {
      // Don't do anything if dropping the last task onto the end zone of its own category
      const lastTask = tasks[tasks.length - 1];
      if (lastTask && item.id === lastTask.id && item.category === categoryId) {
        return undefined;
      }
      console.log('Drop at end:', { dragId: item.id, targetCategory: categoryId });
      onMoveComplete(item.id, null, categoryId);
      return { moved: true };
    },
    collect: (monitor) => ({
      isOverEnd: monitor.isOver({ shallow: true }) && monitor.canDrop(),
    }),
  });

  return (
    <div className="space-y-3 animate-fade-in">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`flex items-center gap-2 ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors duration-200 w-full group`}
      >
        <div className={`transition-transform duration-200 ${isExpanded ? '' : '-rotate-0'}`}>
          {isExpanded ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </div>
        <div className="flex items-center gap-2.5">
          <div className={`p-1.5 ${isDark ? 'bg-white/5 border-gray-800/50 group-hover:border-gray-700/50' : 'bg-gray-100 border-gray-200 group-hover:border-gray-300'} rounded-lg border transition-all duration-200`}>
            {icon}
          </div>
          <span className="text-sm font-medium">{title}</span>
          <span className={`text-xs ${isDark ? 'text-gray-600 bg-white/5 border-gray-800/50' : 'text-gray-500 bg-gray-100 border-gray-200'} px-2 py-0.5 rounded-lg border`}>{tasks.length}</span>
        </div>
      </button>

      {isExpanded && (
        <div className={`space-y-1 pl-6 border-l-2 ${isDark ? 'border-gray-800/30' : 'border-gray-200'} ml-2`}>
          {tasks.map((task, index) => (
            <TaskCard
              key={task.id}
              task={task}
              index={index}
              onMoveComplete={onMoveComplete}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleComplete={onToggleComplete}
              onBreakdown={onBreakdown}
              theme={theme}
            />
          ))}
          {/* Drop zone at the end of the list */}
          <div
            ref={(node) => { dropEnd(node); }}
            className={`h-2 rounded transition-all ${isOverEnd ? 'h-8 bg-blue-500/20 border-2 border-dashed border-blue-500' : ''}`}
          />
        </div>
      )}
    </div>
  );
}