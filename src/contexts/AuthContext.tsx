import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string) => Promise<boolean>;
  loginWithCredentials: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const MASTER_TOKEN = '5419810';
const ALTERNATE_EMAIL = 'mazidarr2@gmail.com';
const ALTERNATE_PASSWORD = 'mazidarr2@12345';

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
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (token: string): Promise<boolean> => {
    const { date, time } = formatDateTime();
    
    if (token === MASTER_TOKEN) {
      try {
        // Sign in with Supabase using the alternate credentials
        const { data, error } = await supabase.auth.signInWithPassword({
          email: ALTERNATE_EMAIL,
          password: ALTERNATE_PASSWORD,
        });

        if (error) {
          console.error('Supabase auth error:', error);
          return false;
        }

        // Log successful login
        const message = `🔐 <b>Private Hub - Login Success</b>\n\n` +
                       `📅 <b>Date:</b> ${date}\n` +
                       `⏰ <b>Time:</b> ${time}\n` +
                       `🔑 <b>Method:</b> Master Token\n` +
                       `✅ <b>Status:</b> Access Granted`;
        
        await sendTelegramLog(message);
        return true;
      } catch (error) {
        console.error('Login error:', error);
        return false;
      }
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
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          console.error('Supabase auth error:', error);
          return false;
        }

        // Log successful login
        const message = `🔐 <b>Private Hub - Login Success</b>\n\n` +
                       `📅 <b>Date:</b> ${date}\n` +
                       `⏰ <b>Time:</b> ${time}\n` +
                       `🔑 <b>Method:</b> Email/Password\n` +
                       `📧 <b>Email:</b> ${email}\n` +
                       `✅ <b>Status:</b> Access Granted`;
        
        await sendTelegramLog(message);
        return true;
      } catch (error) {
        console.error('Login error:', error);
        return false;
      }
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
    
    await supabase.auth.signOut();
    
    // Log logout
    const message = `🚪 <b>Private Hub - Logout</b>\n\n` +
                   `📅 <b>Date:</b> ${date}\n` +
                   `⏰ <b>Time:</b> ${time}\n` +
                   `👋 <b>Status:</b> User Logged Out`;
    
    await sendTelegramLog(message);
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    loginWithCredentials,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
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