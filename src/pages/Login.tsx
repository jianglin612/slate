import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function Login() {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (provider: 'google' | 'microsoft') => {
    setIsLoading(true);
    setError(null);

    try {
      await login(provider);
    } catch (err) {
      setError('Failed to start login. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-block mb-4">
            <svg width="64" height="64" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{ stopColor: '#3B82F6' }} />
                  <stop offset="50%" style={{ stopColor: '#8B5CF6' }} />
                  <stop offset="100%" style={{ stopColor: '#EC4899' }} />
                </linearGradient>
              </defs>
              <rect width="32" height="32" rx="8" fill="url(#logoGrad)" />
              <rect x="10" y="10" width="12" height="12" rx="3" fill="#131416" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Slate</h1>
          <p className="text-slate-400">
            AI-powered task reporting for busy professionals
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8">
          <h2 className="text-xl font-semibold text-white mb-6 text-center">
            Sign in to continue
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {/* Google Login */}
            <button
              onClick={() => handleLogin('google')}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white hover:bg-gray-50 text-gray-900 font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              {isLoading ? 'Connecting...' : 'Continue with Google'}
            </button>

            {/* Microsoft Login */}
            <button
              onClick={() => handleLogin('microsoft')}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-[#2F2F2F] hover:bg-[#3F3F3F] text-white font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" viewBox="0 0 23 23">
                <path fill="#f35325" d="M1 1h10v10H1z" />
                <path fill="#81bc06" d="M12 1h10v10H12z" />
                <path fill="#05a6f0" d="M1 12h10v10H1z" />
                <path fill="#ffba08" d="M12 12h10v10H12z" />
              </svg>
              {isLoading ? 'Connecting...' : 'Continue with Microsoft'}
            </button>
          </div>

          <p className="mt-6 text-center text-sm text-slate-500">
            By signing in, you agree to our{' '}
            <Link to="/terms" className="text-slate-400 hover:text-white underline">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link to="/privacy" className="text-slate-400 hover:text-white underline">
              Privacy Policy
            </Link>
          </p>
        </div>

        {/* Features */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div className="p-4">
            <div className="text-2xl mb-2">📧</div>
            <p className="text-sm text-slate-400">Sync with Email</p>
          </div>
          <div className="p-4">
            <div className="text-2xl mb-2">🤖</div>
            <p className="text-sm text-slate-400">AI Extraction</p>
          </div>
          <div className="p-4">
            <div className="text-2xl mb-2">📤</div>
            <p className="text-sm text-slate-400">Easy Sharing</p>
          </div>
        </div>
      </div>
    </div>
  );
}
