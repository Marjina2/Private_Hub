/*
  # Create authentication user for Private Hub

  1. User Creation
    - Creates the user account for mazidarr2@gmail.com
    - Sets up proper authentication credentials
  
  2. Security
    - Ensures user has proper access to the system
    - Sets up initial user profile
*/

-- Insert the user into auth.users table
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'mazidarr2@gmail.com',
  crypt('mazidarr2@12345', gen_salt('bf')),
  now(),
  now(),
  now(),
  '',
  '',
  '',
  ''
) ON CONFLICT (email) DO UPDATE SET
  encrypted_password = crypt('mazidarr2@12345', gen_salt('bf')),
  updated_at = now();

-- Insert corresponding identity record
INSERT INTO auth.identities (
  id,
  user_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at
) SELECT 
  gen_random_uuid(),
  u.id,
  jsonb_build_object('sub', u.id::text, 'email', u.email),
  'email',
  now(),
  now(),
  now()
FROM auth.users u 
WHERE u.email = 'mazidarr2@gmail.com'
ON CONFLICT (provider, user_id) DO NOTHING;