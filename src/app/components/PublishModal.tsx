import { useState, useEffect } from 'react';
import { X, Copy, Check, Globe, Loader2 } from 'lucide-react';
import { reportsApi } from '../../api';
import type { Report } from '../../types';

interface PublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  report?: Report | null;
  onPublished?: (report: Report) => void;
  theme?: 'dark' | 'light';
}

export function PublishModal({ isOpen, onClose, report, onPublished, theme = 'dark' }: PublishModalProps) {
  const [copied, setCopied] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [allowComments, setAllowComments] = useState(true);
  const [allowReactions, setAllowReactions] = useState(true);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Update share URL when report changes
  useEffect(() => {
    if (report?.share_token) {
      const baseUrl = window.location.origin;
      setShareUrl(`${baseUrl}/share/${report.share_token}`);
    } else {
      setShareUrl(null);
    }
  }, [report?.share_token]);

  const handleCopy = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePublish = async () => {
    if (!report?.id) return;

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
      setError(err.message || 'Failed to publish report');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleUnpublish = async () => {
    if (!report?.id) return;

    setIsPublishing(true);
    setError(null);

    try {
      const updated = await reportsApi.update(report.id, { is_published: false });
      setShareUrl(null);
      onPublished?.(updated);
    } catch (err: any) {
      console.error('Failed to unpublish:', err);
      setError(err.message || 'Failed to unpublish report');
    } finally {
      setIsPublishing(false);
    }
  };

  if (!isOpen) return null;

  const isDark = theme === 'dark';
  const isPublished = !!shareUrl;

  return (
    <div className={`fixed inset-0 ${isDark ? 'bg-black/70' : 'bg-black/40'} backdrop-blur-md flex items-center justify-center z-50`}>
      <div className={`${isDark ? 'bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border-gray-800/50' : 'bg-white border-gray-200'} border rounded-2xl p-6 w-full max-w-md shadow-2xl backdrop-blur-xl`}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-xl border ${isDark ? 'border-purple-500/30' : 'border-purple-300'}`}>
              <Globe className={`w-5 h-5 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
            </div>
            <h2 className={`text-xl font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {isPublished ? 'Published' : 'Publish'} Summary
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

        <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-sm mb-4`}>
          {isPublished
            ? 'Your summary is live. Anyone with the link can view it.'
            : 'Share your task summary with your team. Anyone with the link can view it.'}
        </p>

        {isPublished && shareUrl && (
          <div className={`${isDark ? 'bg-white/5 border-gray-800' : 'bg-gray-50 border-gray-200'} border rounded-xl p-3 mb-4`}>
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
        )}

        <div className="space-y-3">
          <div className={`flex items-center justify-between p-3 ${isDark ? 'bg-white/5' : 'bg-gray-50'} rounded-xl`}>
            <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Allow comments</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={allowComments}
                onChange={(e) => setAllowComments(e.target.checked)}
                disabled={isPublished}
              />
              <div className={`w-11 h-6 ${isDark ? 'bg-gray-800' : 'bg-gray-300'} peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-purple-600 peer-checked:to-blue-600 ${isPublished ? 'opacity-50' : ''}`}></div>
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
                disabled={isPublished}
              />
              <div className={`w-11 h-6 ${isDark ? 'bg-gray-800' : 'bg-gray-300'} peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-purple-600 peer-checked:to-blue-600 ${isPublished ? 'opacity-50' : ''}`}></div>
            </label>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className={`px-5 py-2.5 text-sm ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors rounded-xl`}
          >
            {isPublished ? 'Close' : 'Cancel'}
          </button>
          {isPublished ? (
            <button
              onClick={handleUnpublish}
              disabled={isPublishing}
              className={`px-5 py-2.5 ${isDark ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/30' : 'bg-red-50 hover:bg-red-100 text-red-600 border-red-200'} border text-sm rounded-xl transition-all flex items-center gap-2 disabled:opacity-50`}
            >
              {isPublishing && <Loader2 className="w-4 h-4 animate-spin" />}
              Unpublish
            </button>
          ) : (
            <button
              onClick={handlePublish}
              disabled={isPublishing || !report?.id}
              className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white text-sm rounded-xl transition-all shadow-lg shadow-purple-500/20 flex items-center gap-2 disabled:opacity-50"
            >
              {isPublishing && <Loader2 className="w-4 h-4 animate-spin" />}
              Publish
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
