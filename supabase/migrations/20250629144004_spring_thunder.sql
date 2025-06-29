/*
  # Social Media and Content Policies

  1. Security Policies
    - Social media contact protection
    - Video content access control
    - OSINT search history privacy

  2. Implementation
    - User-specific access for all social features
    - Secure content management
*/

-- Social Media and Content Policies
CREATE POLICY "Users can manage their own discord contacts"
  ON discord_contacts
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own instagram contacts"
  ON instagram_contacts
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own youtube videos"
  ON youtube_videos
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own osint searches"
  ON osint_searches
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);