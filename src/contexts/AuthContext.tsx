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

interface AuthContextType {
  isAuthenticated: boolean;
  currentToken: string | null;
  login: (token: string) => boolean;
  logout: () => void;
  isAdmin: boolean;
  masterTokens: MasterToken[];
  createMasterToken: (name: string, expiresAt: Date | null, customToken?: string) => string;
  deleteMasterToken: (tokenId: string) => void;
  toggleTokenStatus: (tokenId: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentToken, setCurrentToken] = useState<string | null>(null);
  const [masterTokens, setMasterTokens] = useState<MasterToken[]>([]);

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

    // Check if user is already authenticated
    const savedAuth = localStorage.getItem('private_hub_auth');
    if (savedAuth) {
      try {
        const authData = JSON.parse(atob(savedAuth));
        if (authData.token && authData.expiresAt && new Date(authData.expiresAt) > new Date()) {
          setIsAuthenticated(true);
          setCurrentToken(authData.token);
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

  const isAdmin = currentToken === DEFAULT_MASTER_TOKEN || isAuthenticated;

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      currentToken,
      login,
      logout,
      isAdmin,
      masterTokens,
      createMasterToken,
      deleteMasterToken,
      toggleTokenStatus
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