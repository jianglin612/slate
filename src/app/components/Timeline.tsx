import { ChevronLeft, ChevronRight } from 'lucide-react';

interface TimelineProps {
  currentWeek: string;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
}

export function Timeline({ currentWeek, onPreviousWeek, onNextWeek }: TimelineProps) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-200 rounded-xl shadow-sm">
      <button
        onClick={onPreviousWeek}
        className="p-2 hover:bg-gray-100 rounded-lg transition-all"
      >
        <ChevronLeft className="w-5 h-5 text-gray-600" />
      </button>
      
      <div className="flex-1 text-center">
        <div className="text-sm font-medium text-gray-900">{currentWeek}</div>
        <div className="text-xs text-gray-500">Week of the year</div>
      </div>
      
      <button
        onClick={onNextWeek}
        className="p-2 hover:bg-gray-100 rounded-lg transition-all"
      >
        <ChevronRight className="w-5 h-5 text-gray-600" />
      </button>
    </div>
  );
}
