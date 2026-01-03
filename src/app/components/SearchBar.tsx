import { useState, useEffect } from 'react';
import { Search, X, Filter, Tag, Calendar, Users, Zap } from 'lucide-react';
import { Task } from './TaskCard';

interface SearchBarProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  onFilter: (filteredTasks: Task[]) => void;
}

export interface SearchFilters {
  query: string;
  priority?: 'high' | 'medium' | 'low';
  category?: string;
  tags?: string[];
  teamMember?: string;
}

export function SearchBar({ isOpen, onClose, tasks, onFilter }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({ query: '' });

  useEffect(() => {
    if (!isOpen) return;
    
    const handleKeyPress = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K to open search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('search-input')?.focus();
      }
      // Escape to close
      if (e.key === 'Escape') {
        onClose?.();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSearch = (newQuery: string) => {
    setQuery(newQuery);
    performSearch(newQuery, { ...filters, query: newQuery });
  };

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    const newFilters = { ...filters, [key]: value, query };
    setFilters(newFilters);
    performSearch(query, newFilters);
  };

  const clearFilters = () => {
    setFilters({ query: '' });
    setQuery('');
    performSearch('', { query: '' });
    onFilter(tasks);
  };

  const performSearch = (searchQuery: string, searchFilters: SearchFilters) => {
    let filtered = tasks;

    // Filter by query
    if (searchQuery) {
      filtered = filtered.filter(
        (task) =>
          task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          task.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by priority
    if (searchFilters.priority) {
      filtered = filtered.filter((task) => task.priority === searchFilters.priority);
    }

    // Filter by category
    if (searchFilters.category) {
      filtered = filtered.filter((task) => task.category === searchFilters.category);
    }

    onFilter(filtered);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-start justify-center z-50 p-6 pt-20 animate-fade-in" onClick={onClose}>
      <div className="w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="bg-gradient-to-br from-[#1a1b1e] to-[#131416] border border-gray-800/50 rounded-2xl p-6 shadow-2xl backdrop-blur-xl animate-slide-up">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              id="search-input"
              type="text"
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search tasks... (⌘K)"
              className="w-full bg-white/5 border border-gray-800 rounded-xl pl-12 pr-24 py-3.5 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
              {(query || Object.keys(filters).length > 1) && (
                <button
                  onClick={clearFilters}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-all"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              )}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
                  showFilters ? 'bg-blue-500/20 text-blue-400' : 'text-gray-400 hover:bg-white/10'
                }`}
              >
                <Filter className="w-4 h-4" />
                <span className="text-xs">Filters</span>
              </button>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-3 p-4 bg-white/5 border border-gray-800 rounded-xl space-y-3 animate-slide-up">
              <div className="grid grid-cols-2 gap-3">
                {/* Priority Filter */}
                <div>
                  <label className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                    <Zap className="w-3.5 h-3.5" />
                    Priority
                  </label>
                  <select
                    value={filters.priority || ''}
                    onChange={(e) => updateFilter('priority', e.target.value || undefined)}
                    className="w-full bg-white/5 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50"
                  >
                    <option value="" className="bg-[#1a1b1e]">All</option>
                    <option value="high" className="bg-[#1a1b1e]">High</option>
                    <option value="medium" className="bg-[#1a1b1e]">Medium</option>
                    <option value="low" className="bg-[#1a1b1e]">Low</option>
                  </select>
                </div>

                {/* Category Filter */}
                <div>
                  <label className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                    <Tag className="w-3.5 h-3.5" />
                    Category
                  </label>
                  <select
                    value={filters.category || ''}
                    onChange={(e) => updateFilter('category', e.target.value || undefined)}
                    className="w-full bg-white/5 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50"
                  >
                    <option value="" className="bg-[#1a1b1e]">All</option>
                    <option value="action-items" className="bg-[#1a1b1e]">Action Items</option>
                    <option value="meetings" className="bg-[#1a1b1e]">Meetings</option>
                    <option value="deliverables" className="bg-[#1a1b1e]">Deliverables</option>
                    <option value="projects" className="bg-[#1a1b1e]">Projects</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-gray-800/50">
                <p className="text-xs text-gray-500">
                  Use filters to narrow down your search results
                </p>
                <button
                  onClick={clearFilters}
                  className="text-xs text-blue-400 hover:text-blue-300"
                >
                  Clear all
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}