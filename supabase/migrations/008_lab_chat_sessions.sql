-- Lab Chat Sessions
-- Stores the full chat conversation for each Script Lab session,
-- including revision requests, AI responses, and proposed variants.

CREATE TABLE IF NOT EXISTS lab_chat_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,

  -- The most recently generated script in this chat session
  -- Updated each time "Use this version" produces a new meditation
  meditation_id UUID REFERENCES meditations(id) ON DELETE SET NULL,

  -- Full conversation: [{role, content, timestamp}]
  messages JSONB NOT NULL DEFAULT '[]',

  -- The questionnaire context active when the session started
  questionnaire JSONB,

  -- Generation settings at time of session
  session_length TEXT,
  script_method TEXT,
  custom_prompt_used BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS lab_chat_sessions_user_id_idx ON lab_chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS lab_chat_sessions_created_at_idx ON lab_chat_sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS lab_chat_sessions_meditation_id_idx ON lab_chat_sessions(meditation_id);

-- RLS: accessible only via service role (admin-only tool)
ALTER TABLE lab_chat_sessions ENABLE ROW LEVEL SECURITY;
