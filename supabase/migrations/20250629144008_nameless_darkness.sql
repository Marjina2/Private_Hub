/*
  # Photo Storage Policies

  1. Security Policies
    - Photo group access control
    - Individual photo protection
    - Privacy-aware photo management

  2. Features
    - User-specific photo access
    - Group-based organization security
    - Private photo protection
*/

-- Photo Storage Policies
CREATE POLICY "Users can manage their own photo groups"
  ON photo_groups
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own photos"
  ON photos
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);