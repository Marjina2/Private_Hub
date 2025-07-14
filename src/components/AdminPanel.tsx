import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Plus, Trash2, Eye, EyeOff, Calendar, Shield, 
  Key, Clock, User, Settings, ToggleLeft, ToggleRight,
  Copy, CheckCircle, AlertTriangle, RefreshCw
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Header from './Header';

const AdminPanel: React.FC = () => {
  const navigate = useNavigate();
  const { masterTokens, createMasterToken, deleteMasterToken, toggleTokenStatus, currentToken } = useAuth();
  const [isCreating, setIsCreating] = useState(false);
  const [newTokenName, setNewTokenName] = useState('');
  const [newTokenExpiry, setNewTokenExpiry] = useState('');
  const [showTokens, setShowTokens] = useState<Set<string>>(new Set());
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const handleCreateToken = () => {
    if (!newTokenName.trim()) {
      alert('Please enter a token name');
      return;
    }

    const expiresAt = newTokenExpiry ? new Date(newTokenExpiry) : null;
    
    if (expiresAt && expiresAt <= new Date()) {
      alert('Expiry date must be in the future');
      return;
    }

    const token = createMasterToken(newTokenName.trim(), expiresAt);
    setNewTokenName('');
    setNewTokenExpiry('');
    setIsCreating(false);
    
    // Auto-show the newly created token
    setShowTokens(prev => new Set([...prev, token]));
    
    alert(`Token created successfully: ${token}`);
  };

  const toggleTokenVisibility = (token: string) => {
    setShowTokens(prev => {
      const newSet = new Set(prev);
      if (newSet.has(token)) {
        newSet.delete(token);
      } else {
        newSet.add(token);
      }
      return newSet;
    });
  };

  const copyToClipboard = async (token: string) => {
    try {
      await navigator.clipboard.writeText(token);
      setCopiedToken(token);
      setTimeout(() => setCopiedToken(null), 2000);
    } catch (error) {
      alert('Failed to copy token');
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const isTokenExpired = (expiresAt: Date | null) => {
    return expiresAt && expiresAt <= new Date();
  };

  const getTokenStatus = (token: any) => {
    if (!token.isActive) return { status: 'Disabled', color: 'text-red-400', bgColor: 'bg-red-900/20' };
    if (isTokenExpired(token.expiresAt)) return { status: 'Expired', color: 'text-yellow-400', bgColor: 'bg-yellow-900/20' };
    return { status: 'Active', color: 'text-green-400', bgColor: 'bg-green-900/20' };
  };

  const activeTokens = masterTokens.filter(t => t.isActive && !isTokenExpired(t.expiresAt)).length;
  const expiredTokens = masterTokens.filter(t => isTokenExpired(t.expiresAt)).length;
  const disabledTokens = masterTokens.filter(t => !t.isActive).length;

  return (
    <div className="min-h-screen bg-slate-900">
      <Header />
      
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate('/')}
            className="mr-4 p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Settings className="w-8 h-8 text-purple-400" />
            Admin Panel
          </h1>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="backdrop-blur-lg bg-white/10 dark:bg-black/20 border border-white/20 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-300 text-sm">Total Tokens</p>
                <p className="text-2xl font-bold text-white">{masterTokens.length + 1}</p>
                <p className="text-xs text-slate-400">+1 default</p>
              </div>
              <Key className="w-8 h-8 text-purple-400" />
            </div>
          </div>
          <div className="backdrop-blur-lg bg-white/10 dark:bg-black/20 border border-white/20 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-300 text-sm">Active</p>
                <p className="text-2xl font-bold text-white">{activeTokens + 1}</p>
                <p className="text-xs text-slate-400">+1 default</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </div>
          <div className="backdrop-blur-lg bg-white/10 dark:bg-black/20 border border-white/20 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-300 text-sm">Expired</p>
                <p className="text-2xl font-bold text-white">{expiredTokens}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-400" />
            </div>
          </div>
          <div className="backdrop-blur-lg bg-white/10 dark:bg-black/20 border border-white/20 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-300 text-sm">Disabled</p>
                <p className="text-2xl font-bold text-white">{disabledTokens}</p>
              </div>
              <Shield className="w-8 h-8 text-red-400" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Token Creation */}
          <div className="lg:col-span-1 backdrop-blur-lg bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Create Token</h2>
              <button
                onClick={() => setIsCreating(!isCreating)}
                className="p-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {isCreating && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">
                    Token Name *
                  </label>
                  <input
                    type="text"
                    placeholder="Enter token name..."
                    value={newTokenName}
                    onChange={(e) => setNewTokenName(e.target.value)}
                    className="w-full p-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">
                    Expiry Date (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    value={newTokenExpiry}
                    onChange={(e) => setNewTokenExpiry(e.target.value)}
                    min={new Date().toISOString().slice(0, 16)}
                    className="w-full p-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleCreateToken}
                    className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                  >
                    Create Token
                  </button>
                  <button
                    onClick={() => {
                      setIsCreating(false);
                      setNewTokenName('');
                      setNewTokenExpiry('');
                    }}
                    className="flex-1 px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Current Session Info */}
            <div className="mt-6 pt-6 border-t border-slate-700/50">
              <h3 className="text-sm font-medium text-slate-300 mb-3">Current Session</h3>
              <div className="p-3 bg-slate-700/30 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-4 h-4 text-purple-400" />
                  <span className="text-white font-medium">
                    {currentToken === '5419810' ? 'Default Master' : 'Custom Token'}
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Token: {currentToken?.substring(0, 4)}****
                </p>
              </div>
            </div>
          </div>

          {/* Token List */}
          <div className="lg:col-span-2 backdrop-blur-lg bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Master Tokens</h2>

            {/* Default Token */}
            <div className="mb-4 p-4 bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-500/30 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-5 h-5 text-purple-400" />
                    <h3 className="font-medium text-white">Default Master Token</h3>
                    <span className="px-2 py-1 bg-green-600/30 text-green-200 rounded text-xs">
                      Active
                    </span>
                  </div>
                  <p className="text-sm text-slate-300">System default token</p>
                  <p className="text-xs text-slate-400 mt-1">Never expires • Cannot be modified</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400">Token</p>
                  <p className="text-sm text-white font-mono">5419****</p>
                </div>
              </div>
            </div>

            {/* Custom Tokens */}
            <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-thin scrollbar-track-slate-800 scrollbar-thumb-slate-600">
              {masterTokens.length === 0 ? (
                <div className="text-center py-8">
                  <Key className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                  <p className="text-slate-400">No custom tokens created yet</p>
                  <p className="text-slate-500 text-sm">Click the + button to create your first token</p>
                </div>
              ) : (
                masterTokens.map((token) => {
                  const { status, color, bgColor } = getTokenStatus(token);
                  const isVisible = showTokens.has(token.token);
                  const isCopied = copiedToken === token.token;
                  
                  return (
                    <div key={token.id} className={`p-4 border rounded-lg ${bgColor} border-slate-600/50`}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium text-white">{token.name}</h3>
                            <span className={`px-2 py-1 rounded text-xs ${color} ${bgColor}`}>
                              {status}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400">
                            Created: {formatDate(token.createdAt)}
                          </p>
                          {token.expiresAt && (
                            <p className="text-xs text-slate-400">
                              Expires: {formatDate(token.expiresAt)}
                            </p>
                          )}
                        </div>
                        
                        <div className="flex gap-1">
                          <button
                            onClick={() => toggleTokenStatus(token.id)}
                            className="p-1 text-slate-400 hover:text-white transition-colors"
                            title={token.isActive ? 'Disable token' : 'Enable token'}
                          >
                            {token.isActive ? (
                              <ToggleRight className="w-4 h-4 text-green-400" />
                            ) : (
                              <ToggleLeft className="w-4 h-4 text-red-400" />
                            )}
                          </button>
                          <button
                            onClick={() => deleteMasterToken(token.id)}
                            className="p-1 text-slate-400 hover:text-red-400 transition-colors"
                            title="Delete token"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div className="flex-1 p-2 bg-slate-700/50 rounded font-mono text-sm text-white">
                          {isVisible ? token.token : '••••••••••••••••'}
                        </div>
                        <button
                          onClick={() => toggleTokenVisibility(token.token)}
                          className="p-2 text-slate-400 hover:text-white transition-colors"
                          title={isVisible ? 'Hide token' : 'Show token'}
                        >
                          {isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => copyToClipboard(token.token)}
                          className={`p-2 transition-colors ${
                            isCopied ? 'text-green-400' : 'text-slate-400 hover:text-white'
                          }`}
                          title="Copy token"
                        >
                          {isCopied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-8 backdrop-blur-lg bg-red-900/20 border border-red-500/30 rounded-2xl p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-red-200 mb-2">⚠️ Security Guidelines</h3>
              <ul className="text-red-300 text-sm space-y-1 leading-relaxed">
                <li>• Master tokens provide full system access - treat them like passwords</li>
                <li>• Set expiry dates for temporary access tokens</li>
                <li>• Regularly review and disable unused tokens</li>
                <li>• All token activities are logged and monitored via Telegram</li>
                <li>• Never share tokens through insecure channels</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;