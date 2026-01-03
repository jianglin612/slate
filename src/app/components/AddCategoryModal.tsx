import { useState } from 'react';
import { X, Plus, Palette } from 'lucide-react';

interface AddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (category: { name: string; icon: string; color: string }) => void;
}

const iconOptions = ['📋', '🎯', '💡', '🚀', '⚡', '🔥', '⭐', '📊', '🎨', '💼'];
const colorOptions = [
  { name: 'Blue', value: 'blue' },
  { name: 'Purple', value: 'purple' },
  { name: 'Green', value: 'green' },
  { name: 'Red', value: 'red' },
  { name: 'Amber', value: 'amber' },
  { name: 'Pink', value: 'pink' },
];

export function AddCategoryModal({ isOpen, onClose, onAdd }: AddCategoryModalProps) {
  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('📋');
  const [selectedColor, setSelectedColor] = useState('blue');

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (name.trim()) {
      onAdd({ name: name.trim(), icon: selectedIcon, color: selectedColor });
      setName('');
      setSelectedIcon('📋');
      setSelectedColor('blue');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white border border-gray-200 rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-xl">
              <Plus className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Add Task Category</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-all"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Research, Planning, Reviews"
              className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Icon</label>
            <div className="grid grid-cols-5 gap-2">
              {iconOptions.map((icon) => (
                <button
                  key={icon}
                  onClick={() => setSelectedIcon(icon)}
                  className={`p-3 text-2xl rounded-xl transition-all ${
                    selectedIcon === icon
                      ? 'bg-blue-50 border-2 border-blue-500'
                      : 'bg-gray-50 border-2 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
            <div className="grid grid-cols-3 gap-2">
              {colorOptions.map((color) => (
                <button
                  key={color.value}
                  onClick={() => setSelectedColor(color.value)}
                  className={`p-3 rounded-xl transition-all ${
                    selectedColor === color.value
                      ? `bg-${color.value}-100 border-2 border-${color.value}-500`
                      : 'bg-gray-50 border-2 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full bg-${color.value}-500 mx-auto`}></div>
                  <span className="text-xs text-gray-600 mt-1 block">{color.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm text-gray-600 hover:text-gray-900 transition-colors rounded-xl"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!name.trim()}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            Add Category
          </button>
        </div>
      </div>
    </div>
  );
}
