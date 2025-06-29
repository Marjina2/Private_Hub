/*
  # Create Photo Storage Bucket and Policies

  1. Storage Setup
    - Create secure photo storage bucket
    - Configure private access by default
  
  2. Security Policies
    - Users can only access their own photos
    - Folder-based isolation using user ID
    - Full CRUD operations for authenticated users
*/

-- Create storage bucket for photos (simplified approach)
DO $$
BEGIN
  INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
  VALUES (
    'photos', 
    'photos', 
    false,
    10485760, -- 10MB limit
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
  );
EXCEPTION WHEN unique_violation THEN
  -- Bucket already exists, do nothing
  NULL;
END $$;

-- Enable RLS on storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create simplified storage policies
DO $$
BEGIN
  -- Policy for uploading photos
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Users can upload photos'
  ) THEN
    CREATE POLICY "Users can upload photos"
      ON storage.objects
      FOR INSERT
      TO authenticated
      WITH CHECK (
        bucket_id = 'photos' AND 
        auth.uid() IS NOT NULL AND
        (storage.foldername(name))[1] = auth.uid()::text
      );
  END IF;

  -- Policy for viewing photos
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Users can view photos'
  ) THEN
    CREATE POLICY "Users can view photos"
      ON storage.objects
      FOR SELECT
      TO authenticated
      USING (
        bucket_id = 'photos' AND 
        auth.uid() IS NOT NULL AND
        (storage.foldername(name))[1] = auth.uid()::text
      );
  END IF;

  -- Policy for updating photos
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Users can update photos'
  ) THEN
    CREATE POLICY "Users can update photos"
      ON storage.objects
      FOR UPDATE
      TO authenticated
      USING (
        bucket_id = 'photos' AND 
        auth.uid() IS NOT NULL AND
        (storage.foldername(name))[1] = auth.uid()::text
      );
  END IF;

  -- Policy for deleting photos
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Users can delete photos'
  ) THEN
    CREATE POLICY "Users can delete photos"
      ON storage.objects
      FOR DELETE
      TO authenticated
      USING (
        bucket_id = 'photos' AND 
        auth.uid() IS NOT NULL AND
        (storage.foldername(name))[1] = auth.uid()::text
      );
  END IF;

EXCEPTION WHEN OTHERS THEN
  -- Log error but don't fail migration
  RAISE NOTICE 'Error creating storage policies: %', SQLERRM;
END $$;