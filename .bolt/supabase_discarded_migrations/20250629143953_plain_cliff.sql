/*
  # Photo Storage Tables

  1. New Tables
    - `photo_groups` - Photo organization and privacy
    - `photos` - Photo metadata and storage references

  2. Features
    - Group-based photo organization
    - Privacy controls with password protection
    - Favorite marking and tagging
    - Secure file storage integration
*/

CREATE TABLE IF NOT EXISTS photo_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL DEFAULT '',
  color text NOT NULL DEFAULT 'from-purple-500 to-purple-600',
  is_private boolean DEFAULT false,
  password_hash text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  file_name text NOT NULL DEFAULT '',
  file_size bigint DEFAULT 0,
  mime_type text NOT NULL DEFAULT '',
  storage_path text NOT NULL DEFAULT '',
  group_id uuid REFERENCES photo_groups(id) ON DELETE SET NULL,
  is_private boolean DEFAULT false,
  is_favorite boolean DEFAULT false,
  tags text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);