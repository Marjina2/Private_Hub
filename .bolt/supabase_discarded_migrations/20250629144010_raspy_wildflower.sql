/*
  # Performance Indexes

  1. Database Optimization
    - User-specific query optimization
    - Timestamp-based sorting indexes
    - Relationship indexes for joins

  2. Coverage
    - All major query patterns optimized
    - Fast user data retrieval
    - Efficient filtering and sorting
*/

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS notes_user_id_idx ON notes(user_id);
CREATE INDEX IF NOT EXISTS notes_created_at_idx ON notes(created_at DESC);
CREATE INDEX IF NOT EXISTS notes_tags_idx ON notes USING GIN(tags);

CREATE INDEX IF NOT EXISTS websites_user_id_idx ON websites(user_id);
CREATE INDEX IF NOT EXISTS websites_created_at_idx ON websites(created_at DESC);

CREATE INDEX IF NOT EXISTS todo_groups_user_id_idx ON todo_groups(user_id);

CREATE INDEX IF NOT EXISTS todos_user_id_idx ON todos(user_id);
CREATE INDEX IF NOT EXISTS todos_group_id_idx ON todos(group_id);
CREATE INDEX IF NOT EXISTS todos_completed_idx ON todos(completed);
CREATE INDEX IF NOT EXISTS todos_priority_idx ON todos(priority);

CREATE INDEX IF NOT EXISTS contacts_user_id_idx ON contacts(user_id);
CREATE INDEX IF NOT EXISTS contacts_email_idx ON contacts(email);

CREATE INDEX IF NOT EXISTS discord_contacts_user_id_idx ON discord_contacts(user_id);
CREATE INDEX IF NOT EXISTS instagram_contacts_user_id_idx ON instagram_contacts(user_id);
CREATE INDEX IF NOT EXISTS youtube_videos_user_id_idx ON youtube_videos(user_id);

CREATE INDEX IF NOT EXISTS photo_groups_user_id_idx ON photo_groups(user_id);
CREATE INDEX IF NOT EXISTS photos_user_id_idx ON photos(user_id);
CREATE INDEX IF NOT EXISTS photos_group_id_idx ON photos(group_id);
CREATE INDEX IF NOT EXISTS photos_is_favorite_idx ON photos(is_favorite);
CREATE INDEX IF NOT EXISTS photos_tags_idx ON photos USING GIN(tags);

CREATE INDEX IF NOT EXISTS osint_searches_user_id_idx ON osint_searches(user_id);
CREATE INDEX IF NOT EXISTS osint_searches_created_at_idx ON osint_searches(created_at DESC);
CREATE INDEX IF NOT EXISTS osint_searches_category_idx ON osint_searches(category);