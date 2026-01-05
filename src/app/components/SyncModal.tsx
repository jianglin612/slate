import { CheckCircle, Loader2, Mail, Calendar, Sparkles, BrainCircuit, AlertCircle, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { syncApi } from '../../api';
import type { SuggestedTask } from '../../types';

interface SyncStep {
  id: string;
  label: string;
  status: 'pending' | 'loading' | 'completed' | 'error';
  icon: 'mail' | 'calendar' | 'ai';
}

interface SyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (suggestions: SuggestedTask[]) => void;
  onError?: (error: string) => void;
  reportId?: string;
  theme?: 'dark' | 'light';
}

export function SyncModal({ isOpen, onClose, onComplete, onError, reportId, theme = 'dark' }: SyncModalProps) {
  const [steps, setSteps] = useState<SyncStep[]>([
    { id: '1', label: 'Fetching emails from Gmail...', status: 'pending', icon: 'mail' },
    { id: '2', label: 'Loading calendar events...', status: 'pending', icon: 'calendar' },
    { id: '3', label: 'AI analyzing task patterns...', status: 'pending', icon: 'ai' },
    { id: '4', label: 'Extracting action items...', status: 'pending', icon: 'ai' },
    { id: '5', label: 'Identifying collaborators...', status: 'pending', icon: 'ai' },
    { id: '6', label: 'Organizing by categories...', status: 'pending', icon: 'ai' },
  ]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      // Reset state when modal closes
      setSteps(prev => prev.map(step => ({ ...step, status: 'pending' })));
      setError(null);
      return;
    }

    const runSync = async () => {
      // Animate first few steps while API call is in progress
      const animateSteps = async () => {
        for (let i = 0; i < 3; i++) {
          setSteps(prev => prev.map((step, idx) => ({
            ...step,
            status: idx === i ? 'loading' : idx < i ? 'completed' : 'pending'
          })));
          await new Promise(resolve => setTimeout(resolve, 600));
          setSteps(prev => prev.map((step, idx) => ({
            ...step,
            status: idx <= i ? 'completed' : 'pending'
          })));
        }
      };

      try {
        // Start animation
        const animationPromise = animateSteps();

        // Make actual API call
        const response = await syncApi.sync(reportId);

        // Log AI response for debugging
        console.log('Sync response:', response);
        if (response.ai_error) {
          console.error('AI Error:', response.ai_error);
        }

        // Wait for animation to catch up
        await animationPromise;

        // Complete remaining steps quickly
        for (let i = 3; i < steps.length; i++) {
          setSteps(prev => prev.map((step, idx) => ({
            ...step,
            status: idx === i ? 'loading' : idx < i ? 'completed' : 'pending'
          })));
          await new Promise(resolve => setTimeout(resolve, 300));
          setSteps(prev => prev.map((step, idx) => ({
            ...step,
            status: idx <= i ? 'completed' : 'pending'
          })));
        }

        // Wait a bit then complete
        await new Promise(resolve => setTimeout(resolve, 500));
        onComplete(response.suggested_tasks || []);
      } catch (err: any) {
        console.error('Sync failed:', err);
        setError(err.message || 'Sync failed. Please try again.');
        setSteps(prev => prev.map((step) => ({
          ...step,
          status: step.status === 'loading' ? 'error' : step.status
        })));
        onError?.(err.message || 'Sync failed');
      }
    };

    runSync();
  }, [isOpen, reportId]);

  if (!isOpen) return null;

  const getIcon = (icon: string) => {
    switch (icon) {
      case 'mail':
        return Mail;
      case 'calendar':
        return Calendar;
      case 'ai':
        return BrainCircuit;
    }
  };

  const isDark = theme === 'dark';

  return (
    <div className={`fixed inset-0 ${isDark ? 'bg-black/70' : 'bg-black/40'} backdrop-blur-md flex items-center justify-center z-50`}>
      <div className={`${isDark ? 'bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border-gray-800/50' : 'bg-white border-gray-200'} border rounded-2xl p-6 w-full max-w-md shadow-2xl backdrop-blur-xl`}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-xl border ${isDark ? 'border-purple-500/30' : 'border-purple-300'}`}>
              <Sparkles className={`w-6 h-6 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
            </div>
            <h2 className={`text-xl font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Syncing with AI</h2>
          </div>
          <button
            onClick={onClose}
            className={`p-2 ${isDark ? 'hover:bg-white/5' : 'hover:bg-gray-100'} rounded-xl transition-all`}
          >
            <X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
          </button>
        </div>

        {error && (
          <div className={`mb-4 p-3 rounded-xl flex items-center gap-2 ${isDark ? 'bg-red-500/10 border border-red-500/30 text-red-400' : 'bg-red-50 border border-red-200 text-red-600'}`}>
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <div className="space-y-3">
          {steps.map((step) => {
            const Icon = getIcon(step.icon);
            return (
              <div key={step.id} className="flex items-center gap-3">
                {step.status === 'completed' ? (
                  <CheckCircle className={`w-5 h-5 ${isDark ? 'text-green-400' : 'text-green-600'} flex-shrink-0`} />
                ) : step.status === 'loading' ? (
                  <Loader2 className={`w-5 h-5 ${isDark ? 'text-purple-400' : 'text-purple-600'} flex-shrink-0 animate-spin`} />
                ) : step.status === 'error' ? (
                  <AlertCircle className={`w-5 h-5 ${isDark ? 'text-red-400' : 'text-red-600'} flex-shrink-0`} />
                ) : (
                  <div className={`w-5 h-5 rounded-full border-2 ${isDark ? 'border-gray-800' : 'border-gray-300'} flex-shrink-0`} />
                )}

                <div className="flex items-center gap-2 flex-1">
                  <Icon className={`w-4 h-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
                  <span className={`text-sm ${
                    step.status === 'completed' ? (isDark ? 'text-gray-500' : 'text-gray-400') :
                    step.status === 'loading' ? (isDark ? 'text-white' : 'text-gray-900') :
                    step.status === 'error' ? (isDark ? 'text-red-400' : 'text-red-600') :
                    (isDark ? 'text-gray-700' : 'text-gray-500')
                  }`}>
                    {step.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
