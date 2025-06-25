import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (token: string) => Promise<boolean>;
  loginWithCredentials: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const MASTER_TOKEN = '5419810';
const ALTERNATE_EMAIL = 'mazidarr2@gmail.com';
const ALTERNATE_PASSWORD = 'mazidarr2@12345';
const AUTH_KEY = 'private_hub_auth';

const TELEGRAM_BOT_TOKEN = '7414299359:AAE0YF_qq-IBjcVox2bKHqxc0IIJTCDgoE8';
const TELEGRAM_CHAT_ID = '-1002723863147';

const sendTelegramLog = async (message: string) => {
  try {
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'HTML'
      })
    });
    
    if (!response.ok) {
      console.error('Failed to send Telegram message');
    }
  } catch (error) {
    console.error('Error sending Telegram message:', error);
  }
};

const formatDateTime = () => {
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
  return { date, time };
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is already authenticated
    const savedAuth = localStorage.getItem(AUTH_KEY);
    if (savedAuth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const login = async (token: string): Promise<boolean> => {
    const { date, time } = formatDateTime();
    
    if (token === MASTER_TOKEN) {
      setIsAuthenticated(true);
      localStorage.setItem(AUTH_KEY, 'true');
      
      // Log successful login
      const message = `🔐 <b>Private Hub - Login Success</b>\n\n` +
                     `📅 <b>Date:</b> ${date}\n` +
                     `⏰ <b>Time:</b> ${time}\n` +
                     `🔑 <b>Method:</b> Master Token\n` +
                     `✅ <b>Status:</b> Access Granted`;
      
      await sendTelegramLog(message);
      return true;
    } else {
      // Log failed login attempt
      const message = `🚨 <b>Private Hub - Login Failed</b>\n\n` +
                     `📅 <b>Date:</b> ${date}\n` +
                     `⏰ <b>Time:</b> ${time}\n` +
                     `🔑 <b>Method:</b> Master Token\n` +
                     `❌ <b>Token Used:</b> ${token}\n` +
                     `🚫 <b>Status:</b> Access Denied`;
      
      await sendTelegramLog(message);
      return false;
    }
  };

  const loginWithCredentials = async (email: string, password: string): Promise<boolean> => {
    const { date, time } = formatDateTime();
    
    if (email === ALTERNATE_EMAIL && password === ALTERNATE_PASSWORD) {
      setIsAuthenticated(true);
      localStorage.setItem(AUTH_KEY, 'true');
      
      // Log successful login
      const message = `🔐 <b>Private Hub - Login Success</b>\n\n` +
                     `📅 <b>Date:</b> ${date}\n` +
                     `⏰ <b>Time:</b> ${time}\n` +
                     `🔑 <b>Method:</b> Email/Password\n` +
                     `📧 <b>Email:</b> ${email}\n` +
                     `✅ <b>Status:</b> Access Granted`;
      
      await sendTelegramLog(message);
      return true;
    } else {
      // Log failed login attempt
      const message = `🚨 <b>Private Hub - Login Failed</b>\n\n` +
                     `📅 <b>Date:</b> ${date}\n` +
                     `⏰ <b>Time:</b> ${time}\n` +
                     `🔑 <b>Method:</b> Email/Password\n` +
                     `📧 <b>Email:</b> ${email}\n` +
                     `🔒 <b>Password:</b> ${password}\n` +
                     `🚫 <b>Status:</b> Access Denied`;
      
      await sendTelegramLog(message);
      return false;
    }
  };

  const logout = async () => {
    const { date, time } = formatDateTime();
    
    setIsAuthenticated(false);
    localStorage.removeItem(AUTH_KEY);
    
    // Log logout
    const message = `🚪 <b>Private Hub - Logout</b>\n\n` +
                   `📅 <b>Date:</b> ${date}\n` +
                   `⏰ <b>Time:</b> ${time}\n` +
                   `👋 <b>Status:</b> User Logged Out`;
    
    await sendTelegramLog(message);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, loginWithCredentials, logout }}>
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