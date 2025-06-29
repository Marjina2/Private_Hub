/*
  # Skip Storage Setup - Application Level Photo Handling

  This migration intentionally skips Supabase Storage setup to avoid timeout issues.
  Photos will be handled at the application level using:
  1. Base64 encoding for small images
  2. localStorage for client-side storage
  3. Future storage implementation can be added separately

  ## Changes Made
  - Removed all storage.buckets operations
  - Removed all storage.objects policies
  - Photos table already exists from previous migrations
  - Application will handle photo data directly
*/

-- This migration intentionally contains no operations
-- All storage setup will be handled at the application level
-- The photos table already exists and will store base64 data or file references

-- Add a comment to track this decision
COMMENT ON TABLE photos IS 'Photos are stored as base64 data in application. Storage bucket setup skipped due to timeout issues.';