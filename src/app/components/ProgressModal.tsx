import { useState } from 'react';
import { X, TrendingUp, Send } from 'lucide-react';

interface ProgressUpdate {
  id: string;
  text: string;
  timestamp: string;
  author: string;
}

interface ProgressModalProps {
  isOpen: boolean;
  taskTitle: string;
  updates: ProgressUpdate[];
  onClose: () => void;
  onAddUpdate: (text: string) => void;
}

export function ProgressModal({ isOpen, taskTitle, updates, onClose, onAddUpdate }: ProgressModalProps) {
  const [updateText, setUpdateText] = useState('');

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (updateText.trim()) {
      onAddUpdate(updateText);
      setUpdateText('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-6">
      <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-2xl shadow-2xl max-h-[80vh] overflow-hidden">
        <div className="border-b border-gray-200 p-6 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-xl shadow-sm">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Progress Updates</h2>
                <p className="text-sm text-gray-600 mt-0.5">{taskTitle}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/50 rounded-xl transition-all"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(80vh-220px)]">
          {updates.length === 0 ? (
            <div className="text-center py-12">
              <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No progress updates yet</p>
              <p className="text-sm text-gray-400 mt-1">Add your first update below</p>
            </div>
          ) : (
            <div className="space-y-4">
              {updates.map((update) => (
                <div key={update.id} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
                    {update.author.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="flex-1">
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-900">{update.author}</span>
                        <span className="text-xs text-gray-500">{update.timestamp}</span>
                      </div>
                      <p className="text-sm text-gray-700">{update.text}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <div className="flex gap-3">
            <textarea
              value={updateText}
              onChange={(e) => setUpdateText(e.target.value)}
              placeholder="Add a progress update..."
              rows={3}
              className="flex-1 bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 resize-none"
            />
            <button
              onClick={handleSubmit}
              disabled={!updateText.trim()}
              className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm self-end flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Send</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
