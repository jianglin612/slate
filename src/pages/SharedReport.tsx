import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { shareApi } from '../api';
import type { SharedReport as SharedReportType, Comment, Reaction } from '../types';
import { MessageCircle, Send, Calendar, Mail, Users } from 'lucide-react';

const EMOJI_OPTIONS = ['👍', '❤️', '🎉', '🔥', '👏', '💯'];

export function SharedReport() {
  const { token } = useParams<{ token: string }>();
  const [report, setReport] = useState<SharedReportType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Comment form
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [commentTaskId, setCommentTaskId] = useState<string | undefined>();
  const [commentName, setCommentName] = useState('');
  const [commentEmail, setCommentEmail] = useState('');
  const [commentContent, setCommentContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Local email for reactions
  const [reactionEmail, setReactionEmail] = useState(() =>
    localStorage.getItem('slate_reaction_email') || ''
  );

  useEffect(() => {
    if (!token) return;

    const fetchReport = async () => {
      try {
        const data = await shareApi.getReport(token);
        setReport(data);
      } catch {
        setError('Report not found or no longer available.');
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [token]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !commentContent.trim() || !commentName.trim() || !commentEmail.trim()) return;

    setSubmitting(true);
    try {
      const newComment = await shareApi.addComment(token, {
        task_id: commentTaskId,
        author_name: commentName,
        author_email: commentEmail,
        content: commentContent,
      });

      setReport(prev => prev ? {
        ...prev,
        comments: [...prev.comments, newComment],
      } : null);

      setCommentContent('');
      setShowCommentForm(false);
      setCommentTaskId(undefined);

      // Save email for future use
      localStorage.setItem('slate_reaction_email', commentEmail);
      setReactionEmail(commentEmail);
    } catch (err) {
      alert('Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReaction = async (emoji: string, taskId?: string) => {
    if (!token) return;

    // Prompt for email if not set
    if (!reactionEmail) {
      const email = prompt('Enter your email to react:');
      if (!email) return;
      localStorage.setItem('slate_reaction_email', email);
      setReactionEmail(email);
    }

    const email = reactionEmail || localStorage.getItem('slate_reaction_email');
    if (!email) return;

    try {
      const existingReaction = report?.reactions.find(
        r => r.emoji === emoji && r.author_email === email && r.task_id === taskId
      );

      if (existingReaction) {
        await shareApi.removeReaction(token, {
          task_id: taskId,
          author_email: email,
          emoji,
        });
        setReport(prev => prev ? {
          ...prev,
          reactions: prev.reactions.filter(r => r.id !== existingReaction.id),
        } : null);
      } else {
        const newReaction = await shareApi.addReaction(token, {
          task_id: taskId,
          author_email: email,
          emoji,
        });
        setReport(prev => prev ? {
          ...prev,
          reactions: [...prev.reactions, newReaction],
        } : null);
      }
    } catch {
      // Ignore errors
    }
  };

  const getReactionCount = (emoji: string, taskId?: string) => {
    return report?.reactions.filter(
      r => r.emoji === emoji && r.task_id === taskId
    ).length || 0;
  };

  const hasReacted = (emoji: string, taskId?: string) => {
    return report?.reactions.some(
      r => r.emoji === emoji && r.author_email === reactionEmail && r.task_id === taskId
    ) || false;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Report Not Found</h1>
          <p className="text-slate-400">{error || 'This report may have been unpublished.'}</p>
        </div>
      </div>
    );
  }

  const tasksByCategory = report.tasks.reduce((acc, task) => {
    if (!acc[task.category]) acc[task.category] = [];
    acc[task.category].push(task);
    return acc;
  }, {} as Record<string, typeof report.tasks>);

  const categoryLabels: Record<string, string> = {
    'action-items': 'Action Items',
    'meetings': 'Meetings',
    'deliverables': 'Deliverables',
    'projects': 'Projects',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 mb-6">
          <div className="flex items-center gap-4 mb-4">
            {report.user_avatar ? (
              <img
                src={report.user_avatar}
                alt={report.user_name || 'User'}
                className="w-12 h-12 rounded-full"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                {report.user_name?.[0] || '?'}
              </div>
            )}
            <div>
              <h1 className="text-xl font-bold text-white">
                {report.title || `${report.period_type.charAt(0).toUpperCase() + report.period_type.slice(1)} Report`}
              </h1>
              <p className="text-slate-400">
                {report.user_name} • {report.period_start} to {report.period_end}
              </p>
            </div>
          </div>

          {report.summary && (
            <div className="mt-4 p-4 bg-slate-700/30 rounded-xl">
              <p className="text-slate-300 whitespace-pre-wrap">{report.summary}</p>
            </div>
          )}

          {/* Report-level reactions */}
          {report.allow_reactions && (
            <div className="flex gap-2 mt-4 flex-wrap">
              {EMOJI_OPTIONS.map(emoji => {
                const count = getReactionCount(emoji);
                const reacted = hasReacted(emoji);
                return (
                  <button
                    key={emoji}
                    onClick={() => handleReaction(emoji)}
                    className={`px-3 py-1.5 rounded-full text-sm flex items-center gap-1.5 transition-colors ${
                      reacted
                        ? 'bg-blue-500/20 border border-blue-500/50 text-blue-400'
                        : 'bg-slate-700/50 border border-slate-600/50 text-slate-400 hover:bg-slate-600/50'
                    }`}
                  >
                    <span>{emoji}</span>
                    {count > 0 && <span>{count}</span>}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Tasks by Category */}
        {Object.entries(tasksByCategory).map(([category, tasks]) => (
          <div key={category} className="mb-6">
            <h2 className="text-lg font-semibold text-white mb-3">
              {categoryLabels[category] || category}
            </h2>
            <div className="space-y-3">
              {tasks.map(task => (
                <div
                  key={task.id}
                  className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      task.priority === 'high' ? 'bg-red-500' :
                      task.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                    }`} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className={`font-medium ${task.is_completed ? 'text-slate-500 line-through' : 'text-white'}`}>
                          {task.title}
                        </h3>
                        {task.source === 'email' && <Mail className="w-3.5 h-3.5 text-slate-500" />}
                        {task.source === 'calendar' && <Calendar className="w-3.5 h-3.5 text-slate-500" />}
                        {task.source === 'both' && (
                          <>
                            <Mail className="w-3.5 h-3.5 text-slate-500" />
                            <Calendar className="w-3.5 h-3.5 text-slate-500" />
                          </>
                        )}
                      </div>
                      {task.description && (
                        <p className="text-sm text-slate-400 mt-1">{task.description}</p>
                      )}
                      {task.due_date && (
                        <p className="text-xs text-slate-500 mt-2">{task.due_date}</p>
                      )}
                      {task.task_collaborators && task.task_collaborators.length > 0 && (
                        <div className="flex items-center gap-1 mt-2">
                          <Users className="w-3.5 h-3.5 text-slate-500" />
                          <span className="text-xs text-slate-500">
                            {task.task_collaborators.map(c => c.name).join(', ')}
                          </span>
                        </div>
                      )}

                      {/* Task-level reactions */}
                      {report.allow_reactions && (
                        <div className="flex gap-1.5 mt-3 flex-wrap">
                          {EMOJI_OPTIONS.map(emoji => {
                            const count = getReactionCount(emoji, task.id);
                            const reacted = hasReacted(emoji, task.id);
                            if (count === 0 && !reacted) return null;
                            return (
                              <button
                                key={emoji}
                                onClick={() => handleReaction(emoji, task.id)}
                                className={`px-2 py-0.5 rounded-full text-xs flex items-center gap-1 transition-colors ${
                                  reacted
                                    ? 'bg-blue-500/20 border border-blue-500/50 text-blue-400'
                                    : 'bg-slate-700/50 border border-slate-600/50 text-slate-400'
                                }`}
                              >
                                <span>{emoji}</span>
                                <span>{count}</span>
                              </button>
                            );
                          })}
                          <button
                            onClick={() => {
                              const emoji = EMOJI_OPTIONS.find(e => getReactionCount(e, task.id) === 0 && !hasReacted(e, task.id));
                              if (emoji) handleReaction(emoji, task.id);
                            }}
                            className="px-2 py-0.5 rounded-full text-xs bg-slate-700/50 border border-slate-600/50 text-slate-400 hover:bg-slate-600/50"
                          >
                            +
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Comments Section */}
        {report.allow_comments && (
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Comments ({report.comments.length})
            </h2>

            {/* Comment List */}
            <div className="space-y-4 mb-4">
              {report.comments.map(comment => (
                <div key={comment.id} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                    {comment.author_name[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-white">{comment.author_name}</span>
                      <span className="text-xs text-slate-500">
                        {new Date(comment.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-slate-300 mt-1">{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Comment Form */}
            {showCommentForm ? (
              <form onSubmit={handleAddComment} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Your name"
                    value={commentName}
                    onChange={e => setCommentName(e.target.value)}
                    required
                    className="px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                  <input
                    type="email"
                    placeholder="Your email"
                    value={commentEmail}
                    onChange={e => setCommentEmail(e.target.value)}
                    required
                    className="px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <textarea
                  placeholder="Write a comment..."
                  value={commentContent}
                  onChange={e => setCommentContent(e.target.value)}
                  required
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCommentForm(false)}
                    className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    {submitting ? 'Sending...' : 'Send'}
                  </button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setShowCommentForm(true)}
                className="w-full py-3 border border-dashed border-slate-600 rounded-lg text-slate-400 hover:text-white hover:border-slate-500 transition-colors"
              >
                Add a comment...
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
