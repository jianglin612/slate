import { Mail, Calendar, RefreshCw, Sparkles, TrendingUp } from 'lucide-react';

interface SyncBannerProps {
  theme?: 'dark' | 'light';
  onSync: () => void;
  lastSyncTime?: string;
}

export function SyncBanner({ theme = 'dark', onSync, lastSyncTime = '2 hours ago' }: SyncBannerProps) {
  const isDark = theme === 'dark';

  return (
    <div className={`${isDark ? 'bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 border-blue-500/30' : 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200'} border-2 rounded-xl p-6 mb-6 overflow-hidden relative`}>
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className={`absolute -top-10 -right-10 w-40 h-40 ${isDark ? 'bg-blue-500' : 'bg-blue-400'} rounded-full blur-3xl`}></div>
        <div className={`absolute -bottom-10 -left-10 w-40 h-40 ${isDark ? 'bg-purple-500' : 'bg-purple-400'} rounded-full blur-3xl`}></div>
      </div>

      <div className="relative">
        <div className="flex items-start justify-between gap-6">
          {/* Left Content */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2 ${isDark ? 'bg-blue-500/20 border-blue-500/30' : 'bg-blue-100 border-blue-300'} border rounded-lg`}>
                <Sparkles className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
              </div>
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                AI-Powered Weekly Report Builder
              </h3>
            </div>

            <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-4 max-w-2xl`}>
              Automatically discover what you accomplished and what's planned from your email and calendar. Our AI identifies completed work, upcoming commitments, and team collaborations—building your weekly summary without manual tracking.
            </p>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
              <div className="flex items-center gap-2">
                <div className={`p-1.5 ${isDark ? 'bg-white/10' : 'bg-white/70'} rounded`}>
                  <Mail className={`w-4 h-4 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                </div>
                <div>
                  <p className={`text-xs font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Email Analysis</p>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Gmail & Outlook</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className={`p-1.5 ${isDark ? 'bg-white/10' : 'bg-white/70'} rounded`}>
                  <Calendar className={`w-4 h-4 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
                </div>
                <div>
                  <p className={`text-xs font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Calendar Events</p>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Google & Microsoft</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className={`p-1.5 ${isDark ? 'bg-white/10' : 'bg-white/70'} rounded`}>
                  <TrendingUp className={`w-4 h-4 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
                </div>
                <div>
                  <p className={`text-xs font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Smart Insights</p>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Priority & Context</p>
                </div>
              </div>
            </div>

            <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
              Last synced {lastSyncTime}
            </p>
          </div>

          {/* Right CTA */}
          <div className="flex flex-col items-end gap-3">
            <button
              onClick={onSync}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl transition-all shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 font-medium group"
            >
              <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
              <span>Sync Now</span>
            </button>

            <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'} text-right`}>
              Syncing usually takes 10-15 seconds
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
