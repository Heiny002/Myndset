-- Migration: Add usage tracking fields for billing cycle management
-- Date: 2025-01-22
-- Story: US-024 - Implement usage tracking system

-- Add new columns to users table for usage tracking
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS remixes_this_month INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS remixes_limit INTEGER NOT NULL DEFAULT 2,
ADD COLUMN IF NOT EXISTS billing_cycle_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS billing_cycle_anchor INTEGER NOT NULL DEFAULT 1;

-- Create index for efficient billing cycle queries
CREATE INDEX IF NOT EXISTS idx_users_billing_cycle_start ON public.users(billing_cycle_start);

-- Create function to reset monthly usage counters
CREATE OR REPLACE FUNCTION public.reset_monthly_usage()
RETURNS void AS $$
BEGIN
  UPDATE public.users
  SET
    meditations_generated = 0,
    remixes_this_month = 0,
    billing_cycle_start = NOW()
  WHERE
    -- Reset if we're past the billing cycle anchor day
    EXTRACT(DAY FROM NOW()) >= billing_cycle_anchor
    AND EXTRACT(DAY FROM billing_cycle_start) < billing_cycle_anchor
    AND (NOW() - billing_cycle_start) >= INTERVAL '28 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get user's current usage
CREATE OR REPLACE FUNCTION public.get_user_usage(check_user_id UUID)
RETURNS TABLE (
  meditations_generated INTEGER,
  meditations_limit INTEGER,
  remixes_this_month INTEGER,
  remixes_limit INTEGER,
  billing_cycle_start TIMESTAMPTZ,
  billing_cycle_anchor INTEGER,
  days_until_reset INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    u.meditations_generated,
    u.meditations_limit,
    u.remixes_this_month,
    u.remixes_limit,
    u.billing_cycle_start,
    u.billing_cycle_anchor,
    -- Calculate days until next reset
    CASE
      WHEN EXTRACT(DAY FROM NOW()) >= u.billing_cycle_anchor THEN
        u.billing_cycle_anchor + EXTRACT(DAY FROM (DATE_TRUNC('month', NOW()) + INTERVAL '1 month' - INTERVAL '1 day'))::INTEGER - EXTRACT(DAY FROM NOW())::INTEGER
      ELSE
        u.billing_cycle_anchor - EXTRACT(DAY FROM NOW())::INTEGER
    END::INTEGER AS days_until_reset
  FROM public.users u
  WHERE u.id = check_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to increment meditation count
CREATE OR REPLACE FUNCTION public.increment_meditation_count(check_user_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.users
  SET meditations_generated = meditations_generated + 1
  WHERE id = check_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to increment remix count
CREATE OR REPLACE FUNCTION public.increment_remix_count(check_user_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.users
  SET remixes_this_month = remixes_this_month + 1
  WHERE id = check_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to update tier limits when subscription changes
CREATE OR REPLACE FUNCTION public.update_tier_limits()
RETURNS TRIGGER AS $$
BEGIN
  -- Update limits based on subscription tier
  IF NEW.subscription_tier = 'free' THEN
    NEW.meditations_limit := 1;
    NEW.remixes_limit := 2;
  ELSIF NEW.subscription_tier = 'basic' THEN
    NEW.meditations_limit := 10;
    NEW.remixes_limit := 10;
  ELSIF NEW.subscription_tier = 'premium' THEN
    NEW.meditations_limit := 45;
    NEW.remixes_limit := 45;
  END IF;

  -- Set billing cycle start if this is a new subscription
  IF OLD.subscription_tier = 'free' AND NEW.subscription_tier != 'free' THEN
    NEW.billing_cycle_start := NOW();
    NEW.billing_cycle_anchor := EXTRACT(DAY FROM NOW())::INTEGER;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update limits on tier change
DROP TRIGGER IF EXISTS update_tier_limits_trigger ON public.users;
CREATE TRIGGER update_tier_limits_trigger
  BEFORE UPDATE OF subscription_tier ON public.users
  FOR EACH ROW
  WHEN (OLD.subscription_tier IS DISTINCT FROM NEW.subscription_tier)
  EXECUTE FUNCTION public.update_tier_limits();

-- Update existing free users to have correct limits
UPDATE public.users
SET
  meditations_limit = 1,
  remixes_limit = 2
WHERE subscription_tier = 'free';

-- Comment on new columns
COMMENT ON COLUMN public.users.remixes_this_month IS 'Number of remixes used in current billing cycle';
COMMENT ON COLUMN public.users.remixes_limit IS 'Maximum remixes allowed per billing cycle based on tier';
COMMENT ON COLUMN public.users.billing_cycle_start IS 'Start date of current billing cycle';
COMMENT ON COLUMN public.users.billing_cycle_anchor IS 'Day of month when billing cycle resets (1-31)';
