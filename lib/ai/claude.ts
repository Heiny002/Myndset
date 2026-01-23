import Anthropic from '@anthropic-ai/sdk';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// WORKAROUND: Next.js Turbopack doesn't load .env.local for API routes
// Manually read and parse the env file
if (!process.env.ANTHROPIC_API_KEY) {
  try {
    const envPath = resolve(process.cwd(), '.env.local');
    const envFile = readFileSync(envPath, 'utf8');
    const lines = envFile.split('\n');
    for (const line of lines) {
      const match = line.match(/^ANTHROPIC_API_KEY=(.+)$/);
      if (match) {
        process.env.ANTHROPIC_API_KEY = match[1].trim();
        break;
      }
    }
  } catch (error) {
    console.error('[claude] Failed to load .env.local:', error);
  }
}

// Claude model configurations
export const CLAUDE_MODELS = {
  // Sonnet: Best balance of speed and capability for script generation
  SONNET: 'claude-sonnet-4-20250514',
  // Haiku: Fast and cost-effective for simple tasks
  HAIKU: 'claude-3-5-haiku-20241022',
} as const;

export type ClaudeModel = (typeof CLAUDE_MODELS)[keyof typeof CLAUDE_MODELS];

// Default model for meditation script generation
export const DEFAULT_MODEL: ClaudeModel = CLAUDE_MODELS.SONNET;

// Cost per million tokens (approximate, check Anthropic pricing for updates)
export const TOKEN_COSTS = {
  [CLAUDE_MODELS.SONNET]: {
    input: 3.0, // $3 per million input tokens
    output: 15.0, // $15 per million output tokens
  },
  [CLAUDE_MODELS.HAIKU]: {
    input: 0.25, // $0.25 per million input tokens
    output: 1.25, // $1.25 per million output tokens
  },
} as const;

// Create Anthropic client (singleton pattern)
let anthropicClient: Anthropic | null = null;

export function getAnthropicClient(): Anthropic {
  if (!anthropicClient) {
    const apiKey = process.env.ANTHROPIC_API_KEY;

    console.log('[claude] API Key check:', {
      exists: !!apiKey,
      length: apiKey?.length || 0,
      prefix: apiKey?.substring(0, 10) || 'none'
    });

    if (!apiKey) {
      console.error('[claude] All env vars:', Object.keys(process.env).filter(k => k.includes('ANTHROPIC')));
      throw new Error(
        'ANTHROPIC_API_KEY environment variable is not set. Please add it to your .env.local file.'
      );
    }

    anthropicClient = new Anthropic({
      apiKey,
    });
  }

  return anthropicClient;
}

// Types for Claude API interactions
export interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ClaudeRequestOptions {
  model?: ClaudeModel;
  maxTokens?: number;
  temperature?: number;
  systemPrompt?: string;
}

export interface ClaudeResponse {
  content: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  stopReason: string | null;
  costCents: number;
}

// Calculate cost in cents from token usage
export function calculateCostCents(
  model: ClaudeModel,
  inputTokens: number,
  outputTokens: number
): number {
  const costs = TOKEN_COSTS[model];
  const inputCost = (inputTokens / 1_000_000) * costs.input;
  const outputCost = (outputTokens / 1_000_000) * costs.output;
  // Convert to cents and round to 2 decimal places
  return Math.round((inputCost + outputCost) * 100 * 100) / 100;
}

// Main function to send a message to Claude
export async function sendMessage(
  messages: ClaudeMessage[],
  options: ClaudeRequestOptions = {}
): Promise<ClaudeResponse> {
  const client = getAnthropicClient();

  const {
    model = DEFAULT_MODEL,
    maxTokens = 4096,
    temperature = 0.7,
    systemPrompt,
  } = options;

  try {
    const response = await client.messages.create({
      model,
      max_tokens: maxTokens,
      temperature,
      system: systemPrompt,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    });

    // Extract text content from response
    const textContent = response.content.find((block) => block.type === 'text');
    const content = textContent?.type === 'text' ? textContent.text : '';

    const inputTokens = response.usage.input_tokens;
    const outputTokens = response.usage.output_tokens;
    const costCents = calculateCostCents(model, inputTokens, outputTokens);

    return {
      content,
      model: response.model,
      inputTokens,
      outputTokens,
      stopReason: response.stop_reason,
      costCents,
    };
  } catch (error) {
    // Re-throw with more context
    if (error instanceof Anthropic.APIError) {
      throw new ClaudeAPIError(
        `Claude API error: ${error.message}`,
        error.status,
        error.error as Record<string, unknown>
      );
    }
    throw error;
  }
}

// Simple helper for single-turn conversations
export async function generateText(
  prompt: string,
  options: ClaudeRequestOptions = {}
): Promise<ClaudeResponse> {
  return sendMessage([{ role: 'user', content: prompt }], options);
}

// Custom error class for Claude API errors
export class ClaudeAPIError extends Error {
  constructor(
    message: string,
    public status: number,
    public details: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ClaudeAPIError';
  }

  isRateLimited(): boolean {
    return this.status === 429;
  }

  isInvalidRequest(): boolean {
    return this.status === 400;
  }

  isAuthenticationError(): boolean {
    return this.status === 401;
  }

  isServerError(): boolean {
    return this.status >= 500;
  }
}

// Rate limiting helper - tracks request timing
const requestTimestamps: number[] = [];
const MAX_REQUESTS_PER_MINUTE = 50; // Conservative limit

export function checkRateLimit(): { allowed: boolean; waitMs: number } {
  const now = Date.now();
  const oneMinuteAgo = now - 60_000;

  // Clean up old timestamps
  while (requestTimestamps.length > 0 && requestTimestamps[0] < oneMinuteAgo) {
    requestTimestamps.shift();
  }

  if (requestTimestamps.length >= MAX_REQUESTS_PER_MINUTE) {
    const oldestRequest = requestTimestamps[0];
    const waitMs = oldestRequest + 60_000 - now;
    return { allowed: false, waitMs };
  }

  requestTimestamps.push(now);
  return { allowed: true, waitMs: 0 };
}

// Retry helper with exponential backoff
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    initialDelayMs?: number;
    maxDelayMs?: number;
  } = {}
): Promise<T> {
  const { maxRetries = 3, initialDelayMs = 1000, maxDelayMs = 30000 } = options;

  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      // Don't retry authentication or invalid request errors
      if (error instanceof ClaudeAPIError) {
        if (error.isAuthenticationError() || error.isInvalidRequest()) {
          throw error;
        }
      }

      // Calculate delay with exponential backoff
      if (attempt < maxRetries) {
        const delay = Math.min(initialDelayMs * Math.pow(2, attempt), maxDelayMs);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}
