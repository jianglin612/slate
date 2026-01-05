import { useState, useEffect } from 'react';
import { X, Copy, Check, Link, Loader2, Mail, Send, UserPlus } from 'lucide-react';
import { reportsApi, shareApi } from '../../api';
import type { Report } from '../../types';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  report?: Report | null;
  onPublished?: (report: Report) => void;
  theme?: 'dark' | 'light';
}

interface InvitedUser {
  email: string;
  invited_at: string;
}

export function PublishModal({ isOpen, onClose, report, onPublished, theme = 'dark' }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isSendingInvite, setIsSendingInvite] = useState(false);
  const [allowComments, setAllowComments] = useState(true);
  const [allowReactions, setAllowReactions] = useState(true);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [invitedUsers, setInvitedUsers] = useState<InvitedUser[]>([]);
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null);

  // Auto-publish when modal opens if not already published
  useEffect(() => {
    const autoPublish = async () => {
      if (isOpen && report?.id && !report.share_token) {
        setIsPublishing(true);
        setError(null);
        try {
          const published = await reportsApi.publish(report.id, {
            allow_comments: allowComments,
            allow_reactions: allowReactions,
          });
          const baseUrl = window.location.origin;
          setShareUrl(`${baseUrl}/share/${published.share_token}`);
          onPublished?.(published);
        } catch (err: any) {
          console.error('Failed to publish:', err);
          setError(err.message || 'Failed to create share link');
        } finally {
          setIsPublishing(false);
        }
      } else if (report?.share_token) {
        const baseUrl = window.location.origin;
        setShareUrl(`${baseUrl}/share/${report.share_token}`);
      }
    };

    if (isOpen) {
      autoPublish();
      loadInvitedUsers();
    }
  }, [isOpen, report?.id, report?.share_token]);

  const loadInvitedUsers = async () => {
    if (!report?.id) return;
    try {
      const users = await shareApi.getInvites(report.id);
      setInvitedUsers(users);
    } catch (err) {
      // Silently fail - invites list is not critical
      console.error('Failed to load invites:', err);
    }
  };

  const handleCopy = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSendInvite = async () => {
    if (!report?.id || !inviteEmail.trim()) return;

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inviteEmail.trim())) {
      setError('Please enter a valid email address');
      return;
    }

    setIsSendingInvite(true);
    setError(null);
    setInviteSuccess(null);

    try {
      await shareApi.invite(report.id, inviteEmail.trim());
      setInviteSuccess(`Invite sent to ${inviteEmail}`);
      setInviteEmail('');
      loadInvitedUsers();
      setTimeout(() => setInviteSuccess(null), 3000);
    } catch (err: any) {
      console.error('Failed to send invite:', err);
      setError(err.message || 'Failed to send invite');
    } finally {
      setIsSendingInvite(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isSendingInvite) {
      handleSendInvite();
    }
  };

  if (!isOpen) return null;

  const isDark = theme === 'dark';

  return (
    <div className={`fixed inset-0 ${isDark ? 'bg-black/70' : 'bg-black/40'} backdrop-blur-md flex items-center justify-center z-50`}>
      <div className={`${isDark ? 'bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border-gray-800/50' : 'bg-white border-gray-200'} border rounded-2xl p-6 w-full max-w-md shadow-2xl backdrop-blur-xl`}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-xl border ${isDark ? 'border-purple-500/30' : 'border-purple-300'}`}>
              <UserPlus className={`w-5 h-5 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
            </div>
            <h2 className={`text-xl font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Share
            </h2>
          </div>
          <button
            onClick={onClose}
            className={`p-2 ${isDark ? 'hover:bg-white/5' : 'hover:bg-gray-100'} rounded-xl transition-all`}
          >
            <X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
          </button>
        </div>

        {error && (
          <div className={`mb-4 p-3 rounded-xl ${isDark ? 'bg-red-500/10 border border-red-500/30 text-red-400' : 'bg-red-50 border border-red-200 text-red-600'} text-sm`}>
            {error}
          </div>
        )}

        {inviteSuccess && (
          <div className={`mb-4 p-3 rounded-xl ${isDark ? 'bg-green-500/10 border border-green-500/30 text-green-400' : 'bg-green-50 border border-green-200 text-green-600'} text-sm flex items-center gap-2`}>
            <Check className="w-4 h-4" />
            {inviteSuccess}
          </div>
        )}

        {/* Share Link Section */}
        <div className="mb-5">
          <div className={`flex items-center gap-2 mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            <Link className="w-4 h-4" />
            <span className="text-sm font-medium">Share link</span>
          </div>
          {isPublishing ? (
            <div className={`${isDark ? 'bg-white/5 border-gray-800' : 'bg-gray-50 border-gray-200'} border rounded-xl p-3 flex items-center justify-center`}>
              <Loader2 className={`w-5 h-5 animate-spin ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
              <span className={`ml-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Creating link...</span>
            </div>
          ) : shareUrl ? (
            <div className={`${isDark ? 'bg-white/5 border-gray-800' : 'bg-gray-50 border-gray-200'} border rounded-xl p-3`}>
              <div className="flex items-center justify-between gap-3">
                <code className={`text-sm ${isDark ? 'text-purple-400' : 'text-purple-600'} truncate`}>{shareUrl}</code>
                <button
                  onClick={handleCopy}
                  className={`p-2 ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-200'} rounded-lg transition-all flex-shrink-0`}
                >
                  {copied ? (
                    <Check className={`w-4 h-4 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
                  ) : (
                    <Copy className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                  )}
                </button>
              </div>
            </div>
          ) : null}
          <p className={`mt-2 text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
            Anyone with this link can view your report
          </p>
        </div>

        {/* Email Invite Section */}
        <div className="mb-5">
          <div className={`flex items-center gap-2 mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            <Mail className="w-4 h-4" />
            <span className="text-sm font-medium">Invite by email</span>
          </div>
          <div className="flex gap-2">
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="colleague@company.com"
              className={`flex-1 px-3 py-2.5 rounded-xl text-sm ${isDark ? 'bg-white/5 border-gray-800 text-white placeholder-gray-500' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'} border focus:outline-none focus:ring-2 focus:ring-purple-500/50`}
            />
            <button
              onClick={handleSendInvite}
              disabled={isSendingInvite || !inviteEmail.trim()}
              className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white text-sm rounded-xl transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {isSendingInvite ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Invited Users List */}
        {invitedUsers.length > 0 && (
          <div className="mb-5">
            <div className={`text-xs font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Shared with
            </div>
            <div className={`${isDark ? 'bg-white/5 border-gray-800' : 'bg-gray-50 border-gray-200'} border rounded-xl divide-y ${isDark ? 'divide-gray-800' : 'divide-gray-200'}`}>
              {invitedUsers.map((user, index) => (
                <div key={index} className="px-3 py-2 flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-full ${isDark ? 'bg-purple-500/20' : 'bg-purple-100'} flex items-center justify-center`}>
                    <span className={`text-xs ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
                      {user.email[0].toUpperCase()}
                    </span>
                  </div>
                  <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'} truncate`}>
                    {user.email}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Settings */}
        <div className="space-y-3 mb-5">
          <div className={`flex items-center justify-between p-3 ${isDark ? 'bg-white/5' : 'bg-gray-50'} rounded-xl`}>
            <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Allow comments</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={allowComments}
                onChange={(e) => setAllowComments(e.target.checked)}
              />
              <div className={`w-11 h-6 ${isDark ? 'bg-gray-800' : 'bg-gray-300'} peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-purple-600 peer-checked:to-blue-600`}></div>
            </label>
          </div>

          <div className={`flex items-center justify-between p-3 ${isDark ? 'bg-white/5' : 'bg-gray-50'} rounded-xl`}>
            <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Allow reactions</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={allowReactions}
                onChange={(e) => setAllowReactions(e.target.checked)}
              />
              <div className={`w-11 h-6 ${isDark ? 'bg-gray-800' : 'bg-gray-300'} peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-purple-600 peer-checked:to-blue-600`}></div>
            </label>
          </div>
        </div>

        <div className="flex items-center justify-end">
          <button
            onClick={onClose}
            className={`px-5 py-2.5 text-sm ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors rounded-xl`}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
