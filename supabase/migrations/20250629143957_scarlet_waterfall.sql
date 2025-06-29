/*
  # Enable Row Level Security

  1. Security
    - Enable RLS on all tables
    - Ensure data isolation between users
    - Protect against unauthorized access

  2. Implementation
    - RLS enabled for all user data tables
    - Foundation for user-specific policies
*/

-- Enable Row Level Security on all tables
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE websites ENABLE ROW LEVEL SECURITY;
ALTER TABLE todo_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE discord_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE instagram_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE youtube_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE photo_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE osint_searches ENABLE ROW LEVEL SECURITY;