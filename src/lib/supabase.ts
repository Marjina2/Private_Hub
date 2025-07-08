import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables:', {
    url: supabaseUrl ? 'Set' : 'Missing',
    key: supabaseAnonKey ? 'Set' : 'Missing'
  });
  throw new Error('Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.');
}

console.log('Supabase configuration:', {
  url: supabaseUrl,
  keyLength: supabaseAnonKey?.length || 0
});

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  global: {
    headers: {
      'apikey': supabaseAnonKey
    }
  }
});

// Database types
export interface Database {
  public: {
    Tables: {
      notes: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          content: string;
          tags: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title?: string;
          content?: string;
          tags?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          content?: string;
          tags?: string[];
          created_at?: string;
          updated_at?: string;
        };
      };
      websites: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string;
          url: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title?: string;
          description?: string;
          url?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string;
          url?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      todo_groups: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          color: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name?: string;
          color?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          color?: string;
          created_at?: string;
        };
      };
      todos: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string;
          priority: string;
          completed: boolean;
          group_id: string | null;
          step_number: number | null;
          created_at: string;
          updated_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          title?: string;
          description?: string;
          priority?: string;
          completed?: boolean;
          group_id?: string | null;
          step_number?: number | null;
          created_at?: string;
          updated_at?: string;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string;
          priority?: string;
          completed?: boolean;
          group_id?: string | null;
          step_number?: number | null;
          created_at?: string;
          updated_at?: string;
          completed_at?: string | null;
        };
      };
      contacts: {
        Row: {
          id: string;
          user_id: string;
          first_name: string;
          last_name: string;
          email: string;
          phone: string;
          address: string;
          company: string;
          job_title: string;
          website: string;
          notes: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          first_name?: string;
          last_name?: string;
          email?: string;
          phone?: string;
          address?: string;
          company?: string;
          job_title?: string;
          website?: string;
          notes?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          first_name?: string;
          last_name?: string;
          email?: string;
          phone?: string;
          address?: string;
          company?: string;
          job_title?: string;
          website?: string;
          notes?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      discord_contacts: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          discord_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title?: string;
          discord_id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          discord_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      instagram_contacts: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          instagram_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title?: string;
          instagram_id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          instagram_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      youtube_videos: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string;
          url: string;
          video_id: string;
          thumbnail: string;
          transcription: string | null;
          original_language: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title?: string;
          description?: string;
          url?: string;
          video_id?: string;
          thumbnail?: string;
          transcription?: string | null;
          original_language?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string;
          url?: string;
          video_id?: string;
          thumbnail?: string;
          transcription?: string | null;
          original_language?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      photo_groups: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          color: string;
          is_private: boolean;
          password_hash: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name?: string;
          color?: string;
          is_private?: boolean;
          password_hash?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          color?: string;
          is_private?: boolean;
          password_hash?: string | null;
          created_at?: string;
        };
      };
      photos: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string;
          file_name: string;
          file_size: number;
          mime_type: string;
          storage_path: string;
          group_id: string | null;
          is_private: boolean;
          is_favorite: boolean;
          tags: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title?: string;
          description?: string;
          file_name?: string;
          file_size?: number;
          mime_type?: string;
          storage_path?: string;
          group_id?: string | null;
          is_private?: boolean;
          is_favorite?: boolean;
          tags?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string;
          file_name?: string;
          file_size?: number;
          mime_type?: string;
          storage_path?: string;
          group_id?: string | null;
          is_private?: boolean;
          is_favorite?: boolean;
          tags?: string[];
          created_at?: string;
          updated_at?: string;
        };
      };
      osint_searches: {
        Row: {
          id: string;
          user_id: string;
          tool: string;
          query: string;
          result: string;
          category: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          tool?: string;
          query?: string;
          result?: string;
          category?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          tool?: string;
          query?: string;
          result?: string;
          category?: string;
          created_at?: string;
        };
      };
    };
  };
}