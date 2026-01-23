/**
 * Usage Tracking System
 *
 * Tracks meditation generation and remix counts per user per billing cycle.
 * Enforces tier limits and provides usage analytics.
 */

import { createClient } from '@/lib/supabase/server';

/**
 * Tier limits configuration
 */
export const TIER_LIMITS = {
  free: {
    meditations: 1,
    remixes: 2,
  },
  basic: {
    meditations: 10,
    remixes: 10,
  },
  premium: {
    meditations: 45,
    remixes: 45,
  },
} as const;

export type UserUsage = {
  meditations_generated: number;
  meditations_limit: number;
  remixes_this_month: number;
  remixes_limit: number;
  billing_cycle_start: string;
  billing_cycle_anchor: number;
  days_until_reset: number;
};

export type SubscriptionTier = 'free' | 'basic' | 'premium';

/**
 * Get user's current usage statistics
 */
export async function getUserUsage(userId: string): Promise<UserUsage | null> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc('get_user_usage', {
    check_user_id: userId,
  });

  if (error) {
    console.error('Error fetching user usage:', error);
    return null;
  }

  return data && data.length > 0 ? data[0] : null;
}

/**
 * Check if user can generate a new meditation
 */
export async function canGenerateMeditation(userId: string): Promise<{
  allowed: boolean;
  reason?: string;
  current: number;
  limit: number;
}> {
  const usage = await getUserUsage(userId);

  if (!usage) {
    return {
      allowed: false,
      reason: 'Unable to fetch usage data',
      current: 0,
      limit: 0,
    };
  }

  const allowed = usage.meditations_generated < usage.meditations_limit;

  return {
    allowed,
    reason: allowed ? undefined : 'Monthly meditation limit reached',
    current: usage.meditations_generated,
    limit: usage.meditations_limit,
  };
}

/**
 * Check if user can create a remix
 */
export async function canCreateRemix(userId: string): Promise<{
  allowed: boolean;
  reason?: string;
  current: number;
  limit: number;
}> {
  const usage = await getUserUsage(userId);

  if (!usage) {
    return {
      allowed: false,
      reason: 'Unable to fetch usage data',
      current: 0,
      limit: 0,
    };
  }

  const allowed = usage.remixes_this_month < usage.remixes_limit;

  return {
    allowed,
    reason: allowed ? undefined : 'Monthly remix limit reached',
    current: usage.remixes_this_month,
    limit: usage.remixes_limit,
  };
}

/**
 * Increment meditation generation count
 */
export async function incrementMeditationCount(userId: string): Promise<boolean> {
  const supabase = await createClient();

  const { error } = await supabase.rpc('increment_meditation_count', {
    check_user_id: userId,
  });

  if (error) {
    console.error('Error incrementing meditation count:', error);
    return false;
  }

  return true;
}

/**
 * Increment remix count
 */
export async function incrementRemixCount(userId: string): Promise<boolean> {
  const supabase = await createClient();

  const { error } = await supabase.rpc('increment_remix_count', {
    check_user_id: userId,
  });

  if (error) {
    console.error('Error incrementing remix count:', error);
    return false;
  }

  return true;
}

/**
 * Get user's subscription tier
 */
export async function getUserTier(userId: string): Promise<SubscriptionTier> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('users')
    .select('subscription_tier')
    .eq('id', userId)
    .single();

  if (error || !data) {
    console.error('Error fetching user tier:', error);
    return 'free';
  }

  return data.subscription_tier as SubscriptionTier;
}

/**
 * Format usage display string (e.g., "3/10 meditations")
 */
export function formatUsageDisplay(current: number, limit: number, type: 'meditations' | 'remixes'): string {
  return `${current}/${limit} ${type}`;
}

/**
 * Calculate usage percentage
 */
export function calculateUsagePercentage(current: number, limit: number): number {
  if (limit === 0) return 0;
  return Math.min(Math.round((current / limit) * 100), 100);
}

/**
 * Get upgrade recommendation based on usage
 */
export function getUpgradeRecommendation(
  tier: SubscriptionTier,
  meditationUsage: number,
  meditationLimit: number
): {
  shouldUpgrade: boolean;
  recommendedTier?: 'basic' | 'premium';
  reason?: string;
} {
  // Already on premium
  if (tier === 'premium') {
    return { shouldUpgrade: false };
  }

  // At or near limit (80%+)
  const usagePercentage = calculateUsagePercentage(meditationUsage, meditationLimit);

  if (usagePercentage >= 80) {
    return {
      shouldUpgrade: true,
      recommendedTier: tier === 'free' ? 'basic' : 'premium',
      reason: 'You\'re approaching your monthly limit. Upgrade for more meditations.',
    };
  }

  return { shouldUpgrade: false };
}

/**
 * Reset monthly usage for all users (called by cron job)
 */
export async function resetMonthlyUsage(): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase.rpc('reset_monthly_usage');

  if (error) {
    console.error('Error resetting monthly usage:', error);
    throw error;
  }
}

/**
 * Get usage history for analytics (admin only)
 */
export async function getUsageAnalytics(): Promise<{
  totalMeditations: number;
  totalRemixes: number;
  activeUsers: number;
  tierDistribution: Record<SubscriptionTier, number>;
}> {
  const supabase = await createClient();

  // Get total meditations
  const { count: totalMeditations } = await supabase
    .from('meditations')
    .select('*', { count: 'exact', head: true });

  // Get total remixes
  const { count: totalRemixes } = await supabase
    .from('meditation_remixes')
    .select('*', { count: 'exact', head: true });

  // Get active users (generated at least one meditation)
  const { count: activeUsers } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .gt('meditations_generated', 0);

  // Get tier distribution
  const { data: tierData } = await supabase
    .from('users')
    .select('subscription_tier');

  const tierDistribution: Record<SubscriptionTier, number> = {
    free: 0,
    basic: 0,
    premium: 0,
  };

  tierData?.forEach((user) => {
    const tier = user.subscription_tier as SubscriptionTier;
    tierDistribution[tier]++;
  });

  return {
    totalMeditations: totalMeditations || 0,
    totalRemixes: totalRemixes || 0,
    activeUsers: activeUsers || 0,
    tierDistribution,
  };
}
