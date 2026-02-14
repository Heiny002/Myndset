-- Myndset Database Schema
-- Run this in the Supabase SQL Editor (https://supabase.com/dashboard/project/crhduxupcvfbvchslbcn/sql)

-- Enable UUID extension (usually already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ENUMS
-- ============================================

CREATE TYPE subscription_tier AS ENUM ('free', 'basic', 'premium');
CREATE TYPE subscription_status AS ENUM ('active', 'canceled', 'past_due');
CREATE TYPE plan_status AS ENUM ('pending_approval', 'approved', 'rejected', 'generating', 'completed');
CREATE TYPE session_length AS ENUM ('ultra_quick', 'quick', 'standard', 'deep');
CREATE TYPE admin_role AS ENUM ('admin', 'super_admin');

-- ============================================
-- TABLES
-- ============================================

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  subscription_tier subscription_tier NOT NULL DEFAULT 'free',
  subscription_status subscription_status,
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  meditations_generated INTEGER NOT NULL DEFAULT 0,
  meditations_limit INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Questionnaire responses (stores all three tiers)
CREATE TABLE public.questionnaire_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  tier SMALLINT NOT NULL CHECK (tier IN (1, 2, 3)),
  responses JSONB NOT NULL,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Meditation plans (AI-generated, requires admin approval)
CREATE TABLE public.meditation_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  questionnaire_response_id UUID NOT NULL REFERENCES public.questionnaire_responses(id) ON DELETE CASCADE,
  plan_data JSONB NOT NULL,
  status plan_status NOT NULL DEFAULT 'pending_approval',
  admin_notes TEXT,
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Generated meditations
CREATE TABLE public.meditations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  meditation_plan_id UUID NOT NULL REFERENCES public.meditation_plans(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  script_text TEXT NOT NULL,
  audio_url TEXT,
  audio_duration_seconds INTEGER,
  voice_id TEXT,
  session_length session_length NOT NULL DEFAULT 'standard',
  techniques JSONB NOT NULL DEFAULT '[]'::jsonb,
  generation_cost_cents INTEGER,
  is_favorite BOOLEAN NOT NULL DEFAULT FALSE,
  play_count INTEGER NOT NULL DEFAULT 0,
  last_played_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Meditation remixes (regenerate specific sections)
CREATE TABLE public.meditation_remixes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  original_meditation_id UUID NOT NULL REFERENCES public.meditations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  section_to_remix TEXT NOT NULL,
  remix_instructions TEXT,
  new_script_text TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Admin users table
CREATE TABLE public.admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  role admin_role NOT NULL DEFAULT 'admin',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_stripe_customer_id ON public.users(stripe_customer_id);
CREATE INDEX idx_questionnaire_responses_user_id ON public.questionnaire_responses(user_id);
CREATE INDEX idx_meditation_plans_user_id ON public.meditation_plans(user_id);
CREATE INDEX idx_meditation_plans_status ON public.meditation_plans(status);
CREATE INDEX idx_meditations_user_id ON public.meditations(user_id);
CREATE INDEX idx_meditations_created_at ON public.meditations(created_at DESC);
CREATE INDEX idx_meditation_remixes_user_id ON public.meditation_remixes(user_id);
CREATE INDEX idx_admin_users_user_id ON public.admin_users(user_id);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to check if a user is an admin
CREATE OR REPLACE FUNCTION public.is_admin(check_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_users WHERE user_id = check_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- TRIGGERS
-- ============================================

-- Auto-update updated_at for all tables
CREATE TRIGGER set_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_questionnaire_responses_updated_at
  BEFORE UPDATE ON public.questionnaire_responses
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_meditation_plans_updated_at
  BEFORE UPDATE ON public.meditation_plans
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_meditations_updated_at
  BEFORE UPDATE ON public.meditations
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Auto-create user profile on auth.users insert
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questionnaire_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meditation_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meditations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meditation_remixes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all users"
  ON public.users FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update all users"
  ON public.users FOR UPDATE
  USING (public.is_admin(auth.uid()));

-- Questionnaire responses policies
CREATE POLICY "Users can view own questionnaire responses"
  ON public.questionnaire_responses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own questionnaire responses"
  ON public.questionnaire_responses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own questionnaire responses"
  ON public.questionnaire_responses FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all questionnaire responses"
  ON public.questionnaire_responses FOR SELECT
  USING (public.is_admin(auth.uid()));

-- Meditation plans policies
CREATE POLICY "Users can view own meditation plans"
  ON public.meditation_plans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own meditation plans"
  ON public.meditation_plans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all meditation plans"
  ON public.meditation_plans FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update meditation plans"
  ON public.meditation_plans FOR UPDATE
  USING (public.is_admin(auth.uid()));

-- Meditations policies
CREATE POLICY "Users can view own meditations"
  ON public.meditations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own meditations"
  ON public.meditations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own meditations"
  ON public.meditations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all meditations"
  ON public.meditations FOR SELECT
  USING (public.is_admin(auth.uid()));

-- Meditation remixes policies
CREATE POLICY "Users can view own remixes"
  ON public.meditation_remixes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own remixes"
  ON public.meditation_remixes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all remixes"
  ON public.meditation_remixes FOR SELECT
  USING (public.is_admin(auth.uid()));

-- Admin users policies (only super_admins can manage)
CREATE POLICY "Admins can view admin users"
  ON public.admin_users FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Super admins can insert admin users"
  ON public.admin_users FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE user_id = auth.uid() AND role = 'super_admin'
    )
  );

-- ============================================
-- STORAGE BUCKETS
-- ============================================

-- Create storage bucket for meditation audio files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'meditation-audio',
  'meditation-audio',
  true,
  52428800, -- 50MB limit
  ARRAY['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg']
) ON CONFLICT (id) DO NOTHING;

-- Storage policies for meditation audio
CREATE POLICY "Anyone can view meditation audio"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'meditation-audio');

CREATE POLICY "Authenticated users can upload meditation audio"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'meditation-audio'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update own meditation audio"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'meditation-audio'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own meditation audio"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'meditation-audio'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- ============================================
-- INITIAL DATA (Optional - Jim as super_admin)
-- ============================================
-- Uncomment and run after you've signed up to make yourself a super_admin:
-- INSERT INTO public.admin_users (user_id, role)
-- SELECT id, 'super_admin' FROM public.users WHERE email = 'your-email@example.com';
