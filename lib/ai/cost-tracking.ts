import { createClient } from '@/lib/supabase/server';

// Types for cost tracking
export interface APIUsageRecord {
  userId: string;
  service: 'claude' | 'elevenlabs';
  operation: string;
  model?: string;
  inputTokens?: number;
  outputTokens?: number;
  audioSeconds?: number;
  costCents: number;
  metadata?: Record<string, unknown>;
}

// Log API usage to the database
export async function logAPIUsage(record: APIUsageRecord): Promise<void> {
  try {
    const supabase = await createClient();

    // For now, we'll store usage data in the meditation_plans or meditations table
    // In a production system, you'd want a dedicated api_usage table
    // This is a simple in-memory tracking for the MVP

    // Log to console for development
    console.log('[API Usage]', {
      ...record,
      timestamp: new Date().toISOString(),
    });

    // TODO: Create api_usage table and store records
    // const { error } = await supabase.from('api_usage').insert({
    //   user_id: record.userId,
    //   service: record.service,
    //   operation: record.operation,
    //   model: record.model,
    //   input_tokens: record.inputTokens,
    //   output_tokens: record.outputTokens,
    //   audio_seconds: record.audioSeconds,
    //   cost_cents: record.costCents,
    //   metadata: record.metadata,
    //   created_at: new Date().toISOString(),
    // });

    // if (error) {
    //   console.error('Failed to log API usage:', error);
    // }
  } catch (error) {
    // Don't throw - cost tracking shouldn't break the main flow
    console.error('Error logging API usage:', error);
  }
}

// Get monthly usage for a user
export async function getMonthlyUsage(
  userId: string,
  service?: 'claude' | 'elevenlabs'
): Promise<{ totalCostCents: number; requestCount: number }> {
  // TODO: Implement when api_usage table is created
  // For now, return placeholder values
  return {
    totalCostCents: 0,
    requestCount: 0,
  };
}

// Check if user is within budget limits
export async function checkBudgetLimit(
  userId: string,
  estimatedCostCents: number
): Promise<{ allowed: boolean; reason?: string }> {
  // Monthly budget limits per tier (in cents)
  const BUDGET_LIMITS = {
    free: 50, // $0.50 for free tier (1 meditation)
    basic: 500, // $5.00 for basic tier
    premium: 2000, // $20.00 for premium tier
  };

  // TODO: Get user's tier from database
  // For now, allow all requests in MVP
  return { allowed: true };
}

// Cost estimation helpers
export function estimateMeditationCost(sessionLength: 'ultra_quick' | 'quick' | 'standard' | 'deep'): {
  claudeCostCents: number;
  elevenLabsCostCents: number;
  totalCents: number;
} {
  // Estimated token usage per session type
  const tokenEstimates = {
    ultra_quick: { input: 1500, output: 250 }, // 1 min scripts
    quick: { input: 2000, output: 500 }, // 2-5 min scripts
    standard: { input: 3000, output: 1000 }, // 5-10 min scripts
    deep: { input: 4000, output: 2000 }, // 15-30 min scripts
  };

  // Audio duration estimates in seconds
  const audioSeconds = {
    ultra_quick: 60, // 1 minute
    quick: 180, // 3 minutes
    standard: 480, // 8 minutes
    deep: 1200, // 20 minutes
  };

  const tokens = tokenEstimates[sessionLength];
  const duration = audioSeconds[sessionLength];

  // Claude Sonnet pricing: $3/1M input, $15/1M output
  const claudeCostCents = Math.round(
    ((tokens.input / 1_000_000) * 3 + (tokens.output / 1_000_000) * 15) * 100
  );

  // ElevenLabs pricing: roughly $0.30 per 1000 characters
  // Average ~150 words per minute, ~5 chars per word = 750 chars/min
  const charsPerSecond = 12.5;
  const totalChars = duration * charsPerSecond;
  const elevenLabsCostCents = Math.round((totalChars / 1000) * 30);

  return {
    claudeCostCents,
    elevenLabsCostCents,
    totalCents: claudeCostCents + elevenLabsCostCents,
  };
}
