-- Apply this migration in your Supabase SQL Editor
-- Go to: https://supabase.com/dashboard/project/crhduxupcvfbvchslbcn/sql

-- Create meditation_versions table to store historical versions
CREATE TABLE IF NOT EXISTS meditation_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meditation_id UUID NOT NULL REFERENCES meditations(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,

  -- Script data
  script_text TEXT NOT NULL,
  script_style TEXT, -- 'energizing' or 'calming'

  -- Audio data
  audio_url TEXT,
  audio_duration_seconds INTEGER,
  voice_id TEXT,
  voice_type TEXT, -- 'professional', 'calm', 'energizing'

  -- Metadata
  techniques JSONB DEFAULT '{}'::jsonb,
  generation_cost_cents INTEGER,

  -- Tracking
  is_live BOOLEAN DEFAULT false,
  replaced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(meditation_id, version_number)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_meditation_versions_meditation_id ON meditation_versions(meditation_id);
CREATE INDEX IF NOT EXISTS idx_meditation_versions_is_live ON meditation_versions(is_live) WHERE is_live = true;

-- RLS policies
ALTER TABLE meditation_versions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own meditation versions" ON meditation_versions;
DROP POLICY IF EXISTS "Admins can manage all meditation versions" ON meditation_versions;

-- Users can view their own meditation versions
CREATE POLICY "Users can view own meditation versions"
  ON meditation_versions FOR SELECT
  USING (
    meditation_id IN (
      SELECT id FROM meditations WHERE user_id = auth.uid()
    )
  );

-- Admins can manage all meditation versions
CREATE POLICY "Admins can manage all meditation versions"
  ON meditation_versions FOR ALL
  USING (
    auth.uid() IN (SELECT user_id FROM admin_users)
  );

-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS archive_meditation_version(UUID);
DROP FUNCTION IF EXISTS set_meditation_version_live(UUID);

-- Function to archive current meditation before redo
CREATE OR REPLACE FUNCTION archive_meditation_version(p_meditation_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_version_id UUID;
  v_next_version INTEGER;
  v_meditation RECORD;
BEGIN
  -- Get the meditation record
  SELECT * INTO v_meditation
  FROM meditations
  WHERE id = p_meditation_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Meditation not found: %', p_meditation_id;
  END IF;

  -- Calculate next version number
  SELECT COALESCE(MAX(version_number), 0) + 1 INTO v_next_version
  FROM meditation_versions
  WHERE meditation_id = p_meditation_id;

  -- Archive current version
  INSERT INTO meditation_versions (
    meditation_id,
    version_number,
    script_text,
    script_style,
    audio_url,
    audio_duration_seconds,
    voice_id,
    voice_type,
    techniques,
    generation_cost_cents,
    is_live,
    replaced_at
  ) VALUES (
    p_meditation_id,
    v_next_version,
    v_meditation.script_text,
    (v_meditation.techniques->>'scriptStyle')::TEXT,
    v_meditation.audio_url,
    v_meditation.audio_duration_seconds,
    v_meditation.voice_id,
    (v_meditation.techniques->>'audio_voice_type')::TEXT,
    v_meditation.techniques,
    v_meditation.generation_cost_cents,
    false, -- not live since we're replacing it
    NOW()
  ) RETURNING id INTO v_version_id;

  RETURN v_version_id;
END;
$$;

-- Function to set a version as live (restore from history)
CREATE OR REPLACE FUNCTION set_meditation_version_live(p_version_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_version RECORD;
  v_meditation_id UUID;
BEGIN
  -- Get the version record
  SELECT * INTO v_version
  FROM meditation_versions
  WHERE id = p_version_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Version not found: %', p_version_id;
  END IF;

  v_meditation_id := v_version.meditation_id;

  -- Archive current live version first
  PERFORM archive_meditation_version(v_meditation_id);

  -- Restore this version to meditations table
  UPDATE meditations
  SET
    script_text = v_version.script_text,
    audio_url = v_version.audio_url,
    audio_duration_seconds = v_version.audio_duration_seconds,
    voice_id = v_version.voice_id,
    techniques = v_version.techniques,
    generation_cost_cents = v_version.generation_cost_cents,
    updated_at = NOW()
  WHERE id = v_meditation_id;

  -- Mark this version as live, all others as not live
  UPDATE meditation_versions
  SET is_live = false
  WHERE meditation_id = v_meditation_id;

  UPDATE meditation_versions
  SET is_live = true
  WHERE id = p_version_id;

  RETURN v_meditation_id;
END;
$$;

-- Add helpful comments
COMMENT ON TABLE meditation_versions IS 'Stores historical versions of meditations when they are regenerated';
COMMENT ON FUNCTION archive_meditation_version IS 'Archives current meditation version before regeneration';
COMMENT ON FUNCTION set_meditation_version_live IS 'Restores a historical version as the live meditation';

-- Verify the migration was successful
SELECT 'Migration completed successfully!' as status;
