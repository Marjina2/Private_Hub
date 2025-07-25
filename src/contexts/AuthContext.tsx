import React, { createContext, useContext, useState, useEffect } from 'react';

interface MasterToken {
  id: string;
  token: string;
  name: string;
  createdAt: Date;
  expiresAt: Date | null;
  isActive: boolean;
  createdBy: string;
}

interface ShareInvitation {
  id: string;
  fromToken: string;
  toToken: string;
  appType: string;
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
  expiresAt: Date;
}

interface User {
  id: string;
  token: string;
  name: string;
  createdAt: Date;
}
interface AuthContextType {
  isAuthenticated: boolean;
  currentToken: string | null;
  currentUser: User | null;
  login: (token: string) => boolean;
  logout: () => void;
  isAdmin: boolean;
  masterTokens: MasterToken[];
  createMasterToken: (name: string, expiresAt: Date | null, customToken?: string) => string;
  deleteMasterToken: (tokenId: string) => void;
  toggleTokenStatus: (tokenId: string) => void;
  shareInvitations: ShareInvitation[];
  sendShareInvitation: (toToken: string, appType: string, message: string) => boolean;
  respondToInvitation: (invitationId: string, response: 'accepted' | 'rejected') => void;
  getInvitationsForCurrentUser: () => ShareInvitation[];
  pendingInvitations: ShareInvitation[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentToken, setCurrentToken] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [masterTokens, setMasterTokens] = useState<MasterToken[]>([]);
  const [shareInvitations, setShareInvitations] = useState<ShareInvitation[]>([]);

  // Default master token
  const DEFAULT_MASTER_TOKEN = '5419810';

  useEffect(() => {
    // Load saved tokens from localStorage
    const savedTokens = localStorage.getItem('private_hub_master_tokens');
    if (savedTokens) {
      try {
        const parsedTokens = JSON.parse(atob(savedTokens)).map((token: any) => ({
          ...token,
          createdAt: new Date(token.createdAt),
          expiresAt: token.expiresAt ? new Date(token.expiresAt) : null
        }));
        setMasterTokens(parsedTokens);
      } catch (error) {
        console.error('Failed to load master tokens:', error);
      }
    }

    // Load share invitations
    const savedInvitations = localStorage.getItem('private_hub_share_invitations');
    if (savedInvitations) {
      try {
        const parsedInvitations = JSON.parse(atob(savedInvitations)).map((inv: any) => ({
          ...inv,
          createdAt: new Date(inv.createdAt),
          expiresAt: new Date(inv.expiresAt)
        }));
        setShareInvitations(parsedInvitations);
      } catch (error) {
        console.error('Failed to load share invitations:', error);
      }
    }
    // Check if user is already authenticated
    const savedAuth = localStorage.getItem('private_hub_auth');
    if (savedAuth) {
      try {
        const authData = JSON.parse(atob(savedAuth));
        if (authData.token && authData.expiresAt && new Date(authData.expiresAt) > new Date()) {
          setIsAuthenticated(true);
          setCurrentToken(authData.token);
          setCurrentUser(getUserFromToken(authData.token));
        } else {
          localStorage.removeItem('private_hub_auth');
        }
      } catch (error) {
        localStorage.removeItem('private_hub_auth');
      }
    }
  }, []);

  const saveTokens = (tokens: MasterToken[]) => {
    setMasterTokens(tokens);
    localStorage.setItem('private_hub_master_tokens', btoa(JSON.stringify(tokens)));
  };

  const saveInvitations = (invitations: ShareInvitation[]) => {
    setShareInvitations(invitations);
    localStorage.setItem('private_hub_share_invitations', btoa(JSON.stringify(invitations)));
  };

  const getUserFromToken = (token: string): User => {
    if (token === DEFAULT_MASTER_TOKEN) {
      return {
        id: 'master',
        token: token,
        name: 'Master Admin',
        createdAt: new Date('2024-01-01')
      };
    }

    const foundToken = masterTokens.find(t => t.token === token);
    if (foundToken) {
      return {
        id: foundToken.id,
        token: foundToken.token,
        name: foundToken.name,
        createdAt: foundToken.createdAt
      };
    }

    return {
      id: 'unknown',
      token: token,
      name: 'Unknown User',
      createdAt: new Date()
    };
  };
  const isValidToken = (token: string): boolean => {
    // Check default master token
    if (token === DEFAULT_MASTER_TOKEN) {
      return true;
    }

    // Check custom master tokens
    const foundToken = masterTokens.find(t => 
      t.token === token && 
      t.isActive && 
      (!t.expiresAt || t.expiresAt > new Date())
    );

    return !!foundToken;
  };

  const login = (token: string): boolean => {
    if (isValidToken(token)) {
      setIsAuthenticated(true);
      setCurrentToken(token);
      setCurrentUser(getUserFromToken(token));
      
      // Save auth state with 24 hour expiry
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);
      
      const authData = {
        token,
        expiresAt: expiresAt.toISOString()
      };
      
      localStorage.setItem('private_hub_auth', btoa(JSON.stringify(authData)));
      
      // Log successful authentication to Telegram
      logToTelegram('SUCCESSFUL_LOGIN', token);
      
      return true;
    }
    
    // Log failed authentication attempt
    logToTelegram('FAILED_LOGIN', token);
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setCurrentToken(null);
    setCurrentUser(null);
    localStorage.removeItem('private_hub_auth');
    
    // Log logout
    if (currentToken) {
      logToTelegram('LOGOUT', currentToken);
    }
  };

  const createMasterToken = (name: string, expiresAt: Date | null, customToken?: string): string => {
    const newToken = customToken || generateToken();
    const masterToken: MasterToken = {
      id: Date.now().toString(),
      token: newToken,
      name,
      createdAt: new Date(),
      expiresAt,
      isActive: true,
      createdBy: currentToken || 'system'
    };

    const newTokens = [...masterTokens, masterToken];
    saveTokens(newTokens);
    
    // Log token creation
    logToTelegram('TOKEN_CREATED', newToken, `Created by: ${currentToken}, Name: ${name}`);
    
    return newToken;
  };

  const deleteMasterToken = (tokenId: string) => {
    const tokenToDelete = masterTokens.find(t => t.id === tokenId);
    const newTokens = masterTokens.filter(t => t.id !== tokenId);
    saveTokens(newTokens);
    
    if (tokenToDelete) {
      logToTelegram('TOKEN_DELETED', tokenToDelete.token, `Deleted by: ${currentToken}`);
    }
  };

  const toggleTokenStatus = (tokenId: string) => {
    const newTokens = masterTokens.map(token => {
      if (token.id === tokenId) {
        const updatedToken = { ...token, isActive: !token.isActive };
        logToTelegram(
          updatedToken.isActive ? 'TOKEN_ACTIVATED' : 'TOKEN_DEACTIVATED',
          token.token,
          `Modified by: ${currentToken}`
        );
        return updatedToken;
      }
      return token;
    });
    saveTokens(newTokens);
  };

  const generateToken = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 16; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const logToTelegram = (action: string, token: string, details?: string) => {
    const TELEGRAM_BOT_TOKEN = '7414299359:AAE0YF_qq-IBjcVox2bKHqxc0IIJTCDgoE8';
    const TELEGRAM_CHAT_ID = '-1002723863147';
    
    const now = new Date();
    const date = now.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    const time = now.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      hour12: true 
    });

    const actionEmojis: Record<string, string> = {
      'SUCCESSFUL_LOGIN': '✅',
      'FAILED_LOGIN': '❌',
      'LOGOUT': '🚪',
      'TOKEN_CREATED': '🆕',
      'TOKEN_DELETED': '🗑️',
      'TOKEN_ACTIVATED': '🟢',
      'TOKEN_DEACTIVATED': '🔴'
    };

    const emoji = actionEmojis[action] || '📝';
    
    let message = `${emoji} <b>PRIVATE HUB AUTH LOG</b>\n\n` +
                  `📅 <b>Date:</b> ${date}\n` +
                  `⏰ <b>Time:</b> ${time}\n` +
                  `🔑 <b>Action:</b> ${action.replace('_', ' ')}\n` +
                  `🎫 <b>Token:</b> ${token.substring(0, 4)}****\n` +
                  `🌐 <b>User Agent:</b> ${navigator.userAgent.substring(0, 50)}...\n` +
                  `📍 <b>URL:</b> ${window.location.href}`;
    
    if (details) {
      message += `\n📝 <b>Details:</b> ${details}`;
    }
    
    fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'HTML'
      })
    }).catch(() => {});
  };

  const sendShareInvitation = (toToken: string, appType: string, message: string): boolean => {
    if (!currentToken) return false;
    
    // Check if target token exists
    const targetExists = toToken === DEFAULT_MASTER_TOKEN || 
                        masterTokens.some(t => t.token === toToken && t.isActive);
    
    if (!targetExists) return false;
    
    // Check for existing pending invitation
    const existingInvitation = shareInvitations.find(inv => 
      inv.fromToken === currentToken && 
      inv.toToken === toToken && 
      inv.appType === appType && 
      inv.status === 'pending'
    );
    
    if (existingInvitation) return false;
    
    const newInvitation: ShareInvitation = {
      id: Date.now().toString(),
      fromToken: currentToken,
      toToken,
      appType,
      message,
      status: 'pending',
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    };
    
    const newInvitations = [...shareInvitations, newInvitation];
    saveInvitations(newInvitations);
    
    // Log invitation
    logToTelegram('SHARE_INVITATION_SENT', currentToken, 
      `To: ${toToken.substring(0, 4)}****, App: ${appType}`);
    
    return true;
  };

  const respondToInvitation = (invitationId: string, response: 'accepted' | 'rejected') => {
    const invitation = shareInvitations.find(inv => inv.id === invitationId);
    if (!invitation || invitation.toToken !== currentToken) return;
    
    const updatedInvitations = shareInvitations.map(inv => 
      inv.id === invitationId ? { ...inv, status: response } : inv
    );
    saveInvitations(updatedInvitations);
    
    // Log response
    logToTelegram(`INVITATION_${response.toUpperCase()}`, currentToken, 
      `From: ${invitation.fromToken.substring(0, 4)}****, App: ${invitation.appType}`);
    
    // If accepted, merge data (implementation depends on app type)
    if (response === 'accepted') {
      // TODO: Implement data merging logic for each app type
      console.log(`Merging ${invitation.appType} data between ${invitation.fromToken} and ${invitation.toToken}`);
    }
  };

  const getInvitationsForCurrentUser = (): ShareInvitation[] => {
    if (!currentToken) return [];
    
    return shareInvitations.filter(inv => 
      inv.toToken === currentToken && 
      inv.status === 'pending' &&
      inv.expiresAt > new Date()
    );
  };

  const pendingInvitations = getInvitationsForCurrentUser();

  const isAdmin = currentToken === DEFAULT_MASTER_TOKEN;

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      currentToken,
      currentUser,
      login,
      logout,
      isAdmin,
      masterTokens,
      createMasterToken,
      deleteMasterToken,
      toggleTokenStatus,
      shareInvitations,
      sendShareInvitation,
      respondToInvitation,
      getInvitationsForCurrentUser,
      pendingInvitations
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}