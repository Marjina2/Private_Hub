import React, { useState } from 'react';
import { Share2, Send, X, Users, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface ShareComponentProps {
  appType: string;
  appName: string;
}

const ShareComponent: React.FC<ShareComponentProps> = ({ appType, appName }) => {
  const { sendShareInvitation, currentUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [targetToken, setTargetToken] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSendInvitation = async () => {
    if (!targetToken.trim()) {
      alert('Please enter a token');
      return;
    }

    setIsLoading(true);
    
    const defaultMessage = `${currentUser?.name || 'Someone'} wants to share their ${appName} data with you.`;
    const finalMessage = message.trim() || defaultMessage;
    
    const success = sendShareInvitation(targetToken.trim(), appType, finalMessage);
    
    if (success) {
      setStatus('success');
      setTargetToken('');
      setMessage('');
      setTimeout(() => {
        setStatus('idle');
        setIsOpen(false);
      }, 2000);
    } else {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    }
    
    setIsLoading(false);
  };

  const handleClose = () => {
    setIsOpen(false);
    setTargetToken('');
    setMessage('');
    setStatus('idle');
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
      >
        <Share2 className="w-4 h-4" />
        Share {appName}
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 max-w-md mx-4 w-full">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Users className="w-6 h-6 text-blue-400" />
                <h3 className="text-lg font-semibold text-white">Share {appName}</h3>
              </div>
              <button
                onClick={handleClose}
                className="p-1 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {status === 'success' && (
              <div className="mb-4 p-3 bg-green-600/20 border border-green-500/30 rounded-lg flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-green-200 text-sm">Invitation sent successfully!</span>
              </div>
            )}

            {status === 'error' && (
              <div className="mb-4 p-3 bg-red-600/20 border border-red-500/30 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <span className="text-red-200 text-sm">Failed to send invitation. Token may not exist or invitation already sent.</span>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Recipient Token *
                </label>
                <input
                  type="text"
                  placeholder="Enter the token of the user you want to share with..."
                  value={targetToken}
                  onChange={(e) => setTargetToken(e.target.value)}
                  className="w-full p-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Message (Optional)
                </label>
                <textarea
                  placeholder={`${currentUser?.name || 'Someone'} wants to share their ${appName} data with you.`}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  className="w-full p-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  disabled={isLoading}
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleSendInvitation}
                  disabled={isLoading || !targetToken.trim()}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send Invitation
                    </>
                  )}
                </button>
                <button
                  onClick={handleClose}
                  disabled={isLoading}
                  className="px-4 py-2 bg-slate-600 hover:bg-slate-700 disabled:opacity-50 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>

            <div className="mt-4 p-3 bg-slate-700/30 rounded-lg">
              <p className="text-slate-300 text-sm">
                <strong>How sharing works:</strong>
              </p>
              <ul className="text-slate-400 text-xs mt-1 space-y-1">
                <li>• The recipient will receive an invitation notification</li>
                <li>• If they accept, your {appName} data will be merged with theirs</li>
                <li>• Both users will have access to the combined data</li>
                <li>• Invitations expire after 7 days</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ShareComponent;