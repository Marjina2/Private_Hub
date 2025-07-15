import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Check, X, Clock, User, Calendar } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Header from './Header';

const InvitationsPage: React.FC = () => {
  const navigate = useNavigate();
  const { getInvitationsForCurrentUser, respondToInvitation, masterTokens } = useAuth();
  
  const invitations = getInvitationsForCurrentUser();

  const handleResponse = (invitationId: string, response: 'accepted' | 'rejected') => {
    respondToInvitation(invitationId, response);
  };

  const getSenderName = (token: string) => {
    if (token === '5419810') return 'Master Admin';
    const foundToken = masterTokens.find(t => t.token === token);
    return foundToken ? foundToken.name : 'Unknown User';
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getAppDisplayName = (appType: string) => {
    const appNames: Record<string, string> = {
      'notes': 'Notes',
      'websites': 'Websites',
      'todos': 'Tasks',
      'contacts': 'Contacts',
      'discord': 'Discord Contacts',
      'instagram': 'Instagram Contacts',
      'youtube': 'YouTube Videos',
      'photos': 'Photo Gallery',
      'osint': 'OSINT Tools',
      'pdf-tools': 'PDF Tools'
    };
    return appNames[appType] || appType;
  };

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
            <Mail className="w-8 h-8 text-blue-400" />
            Share Invitations
          </h1>
        </div>

        <div className="backdrop-blur-lg bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
          {invitations.length === 0 ? (
            <div className="text-center py-12">
              <Mail className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No pending invitations</h3>
              <p className="text-slate-300">You don't have any share invitations at the moment</p>
            </div>
          ) : (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-white mb-4">
                Pending Invitations ({invitations.length})
              </h2>
              
              {invitations.map((invitation) => (
                <div key={invitation.id} className="p-4 bg-slate-700/30 border border-slate-600/30 rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-medium text-white">
                          {getSenderName(invitation.fromToken)}
                        </h3>
                        <p className="text-sm text-slate-300">
                          wants to share {getAppDisplayName(invitation.appType)} data
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Clock className="w-3 h-3" />
                      {formatDate(invitation.createdAt)}
                    </div>
                  </div>

                  {invitation.message && (
                    <div className="mb-4 p-3 bg-slate-600/30 rounded-lg">
                      <p className="text-slate-200 text-sm">{invitation.message}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Calendar className="w-3 h-3" />
                      Expires: {formatDate(invitation.expiresAt)}
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleResponse(invitation.id, 'accepted')}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-2 text-sm"
                      >
                        <Check className="w-4 h-4" />
                        Accept
                      </button>
                      <button
                        onClick={() => handleResponse(invitation.id, 'rejected')}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center gap-2 text-sm"
                      >
                        <X className="w-4 h-4" />
                        Decline
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="mt-6 backdrop-blur-lg bg-blue-900/20 border border-blue-500/30 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-blue-200 mb-3">📤 About Data Sharing</h3>
          <div className="text-blue-300 text-sm space-y-2">
            <p>• <strong>Accepting an invitation</strong> will merge the sender's data with yours</p>
            <p>• <strong>Both users</strong> will have access to the combined data after merging</p>
            <p>• <strong>Data merging</strong> combines content from both accounts without duplicates</p>
            <p>• <strong>Invitations expire</strong> after 7 days and cannot be recovered</p>
            <p>• <strong>You can decline</strong> invitations without any consequences</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvitationsPage;