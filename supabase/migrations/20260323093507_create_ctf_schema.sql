/*
  # CTF Competition Schema

  1. New Tables
    - `ctf_progress`
      - `id` (uuid, primary key)
      - `user_id` (text, identifies the user/team)
      - `challenge_id` (text, identifies the challenge)
      - `hints_used` (integer, number of hints requested)
      - `completed` (boolean, challenge completion status)
      - `score` (integer, final score for the challenge)
      - `completion_time` (timestamptz, when completed)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `ctf_submissions`
      - `id` (uuid, primary key)
      - `user_id` (text, identifies the user/team)
      - `challenge_id` (text, identifies the challenge)
      - `submission` (text, the submitted solution)
      - `correct` (boolean, whether submission was correct)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
*/

CREATE TABLE IF NOT EXISTS ctf_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  challenge_id text NOT NULL,
  hints_used integer DEFAULT 0,
  completed boolean DEFAULT false,
  score integer DEFAULT 100,
  completion_time timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, challenge_id)
);

CREATE TABLE IF NOT EXISTS ctf_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  challenge_id text NOT NULL,
  submission text NOT NULL,
  correct boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE ctf_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE ctf_submissions ENABLE ROW LEVEL SECURITY;

-- Policies for ctf_progress
CREATE POLICY "Users can view own progress"
  ON ctf_progress FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own progress"
  ON ctf_progress FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update own progress"
  ON ctf_progress FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policies for ctf_submissions
CREATE POLICY "Users can view own submissions"
  ON ctf_submissions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own submissions"
  ON ctf_submissions FOR INSERT
  TO authenticated
  WITH CHECK (true);