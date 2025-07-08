/*
  # Fix RLS Policies for Core Tables

  1. Security
    - Drop existing policies if they exist to avoid conflicts
    - Create RLS policies for all core tables
    - Ensure users can only access their own data

  2. Tables Covered
    - notes: User notes and content
    - websites: Bookmarked websites
    - todo_groups: Task organization groups
    - todos: Individual tasks
    - contacts: Contact information

  This migration ensures proper row-level security is in place for all core functionality.
*/

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Users can manage their own notes" ON notes;
DROP POLICY IF EXISTS "Users can manage their own websites" ON websites;
DROP POLICY IF EXISTS "Users can manage their own todo groups" ON todo_groups;
DROP POLICY IF EXISTS "Users can manage their own todos" ON todos;
DROP POLICY IF EXISTS "Users can manage their own contacts" ON contacts;

-- Create RLS Policies for Core Tables
CREATE POLICY "Users can manage their own notes"
  ON notes
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own websites"
  ON websites
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own todo groups"
  ON todo_groups
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own todos"
  ON todos
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own contacts"
  ON contacts
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);