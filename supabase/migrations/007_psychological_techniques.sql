-- Migration: Create psychological_techniques table
-- Description: Moves psychological techniques from JSON file to Supabase for
--              proper management, querying, and versioning.

-- ============================================================================
-- TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.psychological_techniques (
  -- Identification
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  domain TEXT NOT NULL CHECK (domain IN ('motivational', 'hypnosis', 'nlp', 'sports_performance', 'cognitive', 'persuasion')),

  -- Classification (filterable)
  tags TEXT[] NOT NULL DEFAULT '{}',
  audio_compatible BOOLEAN NOT NULL DEFAULT true,
  performance_focus SMALLINT NOT NULL CHECK (performance_focus BETWEEN 1 AND 5),

  -- Core description
  description TEXT NOT NULL,
  psychological_mechanism TEXT NOT NULL,

  -- Evidence & research
  evidence_level TEXT NOT NULL CHECK (evidence_level IN ('strong', 'moderate', 'emerging', 'limited')),

  -- Implementation guidelines (filterable)
  when_to_use TEXT[] NOT NULL DEFAULT '{}',
  when_not_to_use TEXT[] NOT NULL DEFAULT '{}',
  duration_minutes SMALLINT NOT NULL CHECK (duration_minutes BETWEEN 1 AND 60),
  intensity_level TEXT NOT NULL CHECK (intensity_level IN ('low', 'medium', 'high')),

  -- Relationships
  combines_well_with TEXT[] DEFAULT '{}',
  contradicts_without TEXT[] DEFAULT '{}',

  -- Metadata (filterable)
  target_audience TEXT[] NOT NULL DEFAULT '{}',
  best_for TEXT[] NOT NULL DEFAULT '{}',
  implementation_speed TEXT NOT NULL CHECK (implementation_speed IN ('instant', 'quick', 'moderate')),
  version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- JSONB columns (nested objects consumed as-is by AI generators)
  academic_sources JSONB NOT NULL DEFAULT '[]'::jsonb,
  implementation_protocol JSONB NOT NULL DEFAULT '{}'::jsonb,
  script_example JSONB NOT NULL DEFAULT '{}'::jsonb
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- GIN indexes for array columns (containment queries)
CREATE INDEX IF NOT EXISTS idx_techniques_tags ON public.psychological_techniques USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_techniques_best_for ON public.psychological_techniques USING GIN (best_for);
CREATE INDEX IF NOT EXISTS idx_techniques_target_audience ON public.psychological_techniques USING GIN (target_audience);

-- B-tree indexes for scalar filter columns
CREATE INDEX IF NOT EXISTS idx_techniques_domain ON public.psychological_techniques (domain);
CREATE INDEX IF NOT EXISTS idx_techniques_evidence_level ON public.psychological_techniques (evidence_level);
CREATE INDEX IF NOT EXISTS idx_techniques_performance_focus ON public.psychological_techniques (performance_focus);
CREATE INDEX IF NOT EXISTS idx_techniques_duration ON public.psychological_techniques (duration_minutes);
CREATE INDEX IF NOT EXISTS idx_techniques_implementation_speed ON public.psychological_techniques (implementation_speed);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE public.psychological_techniques ENABLE ROW LEVEL SECURITY;

-- Public read access (techniques are not user-specific)
CREATE POLICY "Anyone can read techniques"
  ON public.psychological_techniques
  FOR SELECT
  USING (true);

-- Admin-only write access
CREATE POLICY "Admins can insert techniques"
  ON public.psychological_techniques
  FOR INSERT
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update techniques"
  ON public.psychological_techniques
  FOR UPDATE
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete techniques"
  ON public.psychological_techniques
  FOR DELETE
  USING (public.is_admin(auth.uid()));

-- ============================================================================
-- TRIGGER: auto-update updated_at
-- ============================================================================

CREATE TRIGGER handle_psychological_techniques_updated_at
  BEFORE UPDATE ON public.psychological_techniques
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
