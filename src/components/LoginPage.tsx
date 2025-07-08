import React, { useState } from 'react';
import { Shield, Lock, Mail, User, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const LoginPage: React.FC = () => {
  const [token, setToken] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loginMethod, setLoginMethod] = useState<'token' | 'credentials'>('token');
  const { login, loginWithCredentials } = useAuth();

  const handleTokenSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Token submit attempt:', token);
    setIsLoading(true);
    setError('');

    // Simulate loading delay for security effect
    await new Promise(resolve => setTimeout(resolve, 1000));

    const success = await login(token);
    if (!success) {
      setError('Invalid master token. Access denied.');
      setToken('');
    }
    setIsLoading(false);
  };

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Credentials submit attempt:', email, password);
    setIsLoading(true);
    setError('');

    // Simulate loading delay for security effect
    await new Promise(resolve => setTimeout(resolve, 1000));

    const success = await loginWithCredentials(email, password);
    if (!success) {
      setError('Invalid credentials. Access denied.');
      setEmail('');
      setPassword('');
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="backdrop-blur-lg bg-white/10 dark:bg-black/20 border border-white/20 rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Private Hub</h1>
            <p className="text-slate-300">Secure Access Portal</p>
          </div>

          {/* Login Method Toggle */}
          <div className="flex mb-6 bg-white/5 rounded-lg p-1">
            <button
              type="button"
              onClick={() => setLoginMethod('token')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                loginMethod === 'token'
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Master Token
            </button>
            <button
              type="button"
              onClick={() => setLoginMethod('credentials')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                loginMethod === 'credentials'
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Credentials
            </button>
          </div>

          {loginMethod === 'token' ? (
            <form onSubmit={handleTokenSubmit} className="space-y-6">
              <div>
                <label htmlFor="token" className="block text-sm font-medium text-slate-200 mb-2">
                  Master Token
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="password"
                    id="token"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="Enter master token"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-200 text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  'Access Hub'
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleCredentialsSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-200 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="Enter email address"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-200 mb-2">
                  Password
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="Enter password"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-200 text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  'Sign In'
                )}
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <p className="text-xs text-slate-400">
              Authorized personnel only. All access attempts are logged and monitored.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;