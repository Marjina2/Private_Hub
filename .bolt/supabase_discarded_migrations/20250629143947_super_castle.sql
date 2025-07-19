/*
  # Social Media and Content Tables

  1. New Tables
    - `discord_contacts` - Discord user management
    - `instagram_contacts` - Instagram user tracking
    - `youtube_videos` - YouTube video storage with transcriptions
    - `osint_searches` - OSINT tool search history

  2. Features
    - Social media contact management
    - Video transcription storage
    - Search history tracking
*/

CREATE TABLE IF NOT EXISTS discord_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL DEFAULT '',
  discord_id text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS instagram_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL DEFAULT '',
  instagram_id text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS youtube_videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  url text NOT NULL DEFAULT '',
  video_id text NOT NULL DEFAULT '',
  thumbnail text NOT NULL DEFAULT '',
  transcription text,
  original_language text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS osint_searches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tool text NOT NULL DEFAULT '',
  query text NOT NULL DEFAULT '',
  result text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now()
);