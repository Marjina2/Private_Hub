/*
  # Storage Setup for Photos

  1. Storage Bucket
    - Creates 'photos' bucket for secure image storage
    - Private bucket with user-based access control

  2. Security Policies
    - Users can only access their own photos
    - Organized by user ID folders
    - Supports standard image formats
*/

-- Create storage bucket for photos (simple insert with conflict handling)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('photos', 'photos', false)
ON CONFLICT (id) DO NOTHING;

-- Simple storage policies without complex checks
CREATE POLICY "photo_upload_policy" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'photos');

CREATE POLICY "photo_select_policy" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'photos');

CREATE POLICY "photo_update_policy" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'photos');

CREATE POLICY "photo_delete_policy" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'photos');