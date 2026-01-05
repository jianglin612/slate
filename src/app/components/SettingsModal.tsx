import { X, Bell, Slack, Mail, Zap, Globe, Lock, FolderPlus, Trash2, Edit2, Folder, LogOut } from 'lucide-react';
import { useState } from 'react';

interface CustomCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
}

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  customCategories?: CustomCategory[];
  onCategoriesChange?: (categories: CustomCategory[]) => void;
  onLogout?: () => void;
}

export function SettingsModal({ isOpen, onClose, customCategories, onCategoriesChange, onLogout }: SettingsModalProps) {
  const [notifications, setNotifications] = useState({
    mentions: true,
    taskAssigned: true,
    taskDue: true,
    comments: false,
    weeklyDigest: true
  });

  const [integrations, setIntegrations] = useState({
    slack: false,
    email: true
  });

  const [categories, setCategories] = useState<CustomCategory[]>(customCategories || []);

  if (!isOpen) return null;

  const addCategory = () => {
    const newCategory: CustomCategory = {
      id: `category-${categories.length + 1}`,
      name: `Category ${categories.length + 1}`,
      icon: 'Folder',
      color: 'blue'
    };
    setCategories([...categories, newCategory]);
    if (onCategoriesChange) {
      onCategoriesChange([...categories, newCategory]);
    }
  };

  const removeCategory = (id: string) => {
    const updatedCategories = categories.filter(category => category.id !== id);
    setCategories(updatedCategories);
    if (onCategoriesChange) {
      onCategoriesChange(updatedCategories);
    }
  };

  const editCategory = (id: string, newName: string) => {
    const updatedCategories = categories.map(category => 
      category.id === id ? { ...category, name: newName } : category
    );
    setCategories(updatedCategories);
    if (onCategoriesChange) {
      onCategoriesChange(updatedCategories);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-6 animate-fade-in">
      <div className="bg-gradient-to-br from-[#1a1b1e] to-[#131416] border border-gray-800/50 rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-hidden backdrop-blur-xl animate-slide-up">
        {/* Header */}
        <div className="border-b border-gray-800/50 p-6 bg-gradient-to-r from-blue-500/5 to-purple-500/5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white">Settings</h2>
              <p className="text-sm text-gray-400 mt-0.5">Manage your preferences and integrations</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/5 rounded-xl transition-all"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)] space-y-6">
          {/* Notifications */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Bell className="w-5 h-5 text-blue-400" />
              <h3 className="text-white font-semibold">Notifications</h3>
            </div>

            <div className="space-y-3 bg-white/5 border border-gray-800 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white">@Mentions</p>
                  <p className="text-xs text-gray-500">Get notified when someone mentions you</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications.mentions}
                    onChange={(e) => setNotifications({ ...notifications, mentions: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-800/50">
                <div>
                  <p className="text-sm text-white">Task Assigned</p>
                  <p className="text-xs text-gray-500">When you're assigned to a task</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications.taskAssigned}
                    onChange={(e) => setNotifications({ ...notifications, taskAssigned: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-800/50">
                <div>
                  <p className="text-sm text-white">Task Due Soon</p>
                  <p className="text-xs text-gray-500">Reminders for upcoming deadlines</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications.taskDue}
                    onChange={(e) => setNotifications({ ...notifications, taskDue: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-800/50">
                <div>
                  <p className="text-sm text-white">New Comments</p>
                  <p className="text-xs text-gray-500">Activity on tasks you're following</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications.comments}
                    onChange={(e) => setNotifications({ ...notifications, comments: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-800/50">
                <div>
                  <p className="text-sm text-white">Weekly Digest</p>
                  <p className="text-xs text-gray-500">Summary of your week every Sunday</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications.weeklyDigest}
                    onChange={(e) => setNotifications({ ...notifications, weeklyDigest: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Integrations */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-purple-400" />
              <h3 className="text-white font-semibold">Integrations</h3>
            </div>

            <div className="space-y-3">
              {/* Slack Integration */}
              <div className="bg-white/5 border border-gray-800 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-purple-500/20 rounded-lg border border-purple-500/30">
                    <Slack className="w-5 h-5 text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-white font-medium mb-1">Slack</h4>
                    <p className="text-sm text-gray-400 mb-3">Send notifications to Slack channels</p>
                    {integrations.slack ? (
                      <div className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                        <span className="text-sm text-green-400">Connected to #team-updates</span>
                        <button
                          onClick={() => setIntegrations({ ...integrations, slack: false })}
                          className="text-xs text-gray-400 hover:text-gray-300"
                        >
                          Disconnect
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setIntegrations({ ...integrations, slack: true })}
                        className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition-all"
                      >
                        Connect Slack
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Email Integration */}
              <div className="bg-white/5 border border-gray-800 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-500/20 rounded-lg border border-blue-500/30">
                    <Mail className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-white font-medium mb-1">Email</h4>
                    <p className="text-sm text-gray-400 mb-3">Receive notifications via email</p>
                    {integrations.email ? (
                      <div className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                        <span className="text-sm text-green-400">Connected to you@example.com</span>
                        <button
                          onClick={() => setIntegrations({ ...integrations, email: false })}
                          className="text-xs text-gray-400 hover:text-gray-300"
                        >
                          Disconnect
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setIntegrations({ ...integrations, email: true })}
                        className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-all"
                      >
                        Connect Email
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Privacy */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Lock className="w-5 h-5 text-green-400" />
              <h3 className="text-white font-semibold">Privacy</h3>
            </div>

            <div className="bg-white/5 border border-gray-800 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white">Make all tasks private by default</p>
                  <p className="text-xs text-gray-500">New tasks won't be visible to team</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Custom Categories */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <FolderPlus className="w-5 h-5 text-blue-400" />
              <h3 className="text-white font-semibold">Custom Categories</h3>
            </div>

            <div className="space-y-3">
              {categories.map(category => (
                <div key={category.id} className="bg-white/5 border border-gray-800 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-500/20 rounded-lg border border-blue-500/30">
                      <Folder className="w-5 h-5 text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white font-medium mb-1">Category: {category.name}</h4>
                      <p className="text-sm text-gray-400 mb-3">Manage your custom categories</p>
                      <div className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                        <input
                          type="text"
                          value={category.name}
                          onChange={(e) => editCategory(category.id, e.target.value)}
                          className="text-sm text-gray-400 hover:text-gray-300 bg-transparent focus:outline-none"
                        />
                        <button
                          onClick={() => removeCategory(category.id)}
                          className="text-xs text-gray-400 hover:text-gray-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <button
                onClick={addCategory}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-all"
              >
                Add Category
              </button>
            </div>
          </div>

          {/* Account */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <LogOut className="w-5 h-5 text-red-400" />
              <h3 className="text-white font-semibold">Account</h3>
            </div>

            <div className="bg-white/5 border border-gray-800 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white">Log out</p>
                  <p className="text-xs text-gray-500">Sign out of your account</p>
                </div>
                <button
                  onClick={onLogout}
                  className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 text-sm rounded-lg transition-all border border-red-600/30"
                >
                  Log out
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-800/50 p-6 bg-black/30">
          <button
            onClick={onClose}
            className="w-full px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-sm rounded-xl transition-all shadow-lg shadow-blue-500/20"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}