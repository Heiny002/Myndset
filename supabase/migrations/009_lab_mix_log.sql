-- Lab Mix Log
-- Stores every "Mix Things Up" change set with full override details.
-- Active mix is session-only (React state); this log persists across sessions
-- so past mixes can be reviewed, starred, and reapplied.

CREATE TABLE IF NOT EXISTS lab_mix_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Short human-readable ID, e.g. "MIX-3F7A"
  changes_id TEXT NOT NULL UNIQUE,

  description TEXT NOT NULL,
  rationale TEXT,

  -- 'moderate' | 'radical' | 'experimental'
  intensity TEXT NOT NULL,

  -- Which stages were overridden: ['stage1', 'stage2', 'stage3']
  changed_stages TEXT[] NOT NULL,

  -- Full override object — can be reapplied to recreate the exact mix
  changes JSONB NOT NULL,

  -- Scripts generated while this mix was active
  meditation_ids TEXT[] NOT NULL DEFAULT '{}',

  -- Admin-starred (liked the output quality)
  starred BOOLEAN NOT NULL DEFAULT FALSE,

  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS lab_mix_log_created_at_idx ON lab_mix_log(created_at DESC);
CREATE INDEX IF NOT EXISTS lab_mix_log_starred_idx ON lab_mix_log(starred) WHERE starred = TRUE;

-- RLS: accessible only via service role (admin-only tool)
ALTER TABLE lab_mix_log ENABLE ROW LEVEL SECURITY;
