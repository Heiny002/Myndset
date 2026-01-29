/**
 * ElevenLabs voice synthesis integration
 * Converts meditation scripts to professional audio using AI voice generation
 */

import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';

// Voice configurations for different meditation styles
export const VOICE_OPTIONS = {
  calm: {
    id: 'EXAVITQu4vr4xnSDxMaL', // Sarah - calm, clear female voice
    name: 'Sarah',
    description: 'Calm, clear female voice - ideal for relaxation meditations',
    settings: {
      stability: 0.75,
      similarity_boost: 0.75,
      style: 0.0,
      use_speaker_boost: true,
    },
  },
  professional: {
    id: 'pNInz6obpgDQGcFmaJgB', // Adam - professional male voice
    name: 'Adam',
    description: 'Professional, authoritative male voice - ideal for performance-focused meditations',
    settings: {
      stability: 0.65,
      similarity_boost: 0.75,
      style: 0.15,
      use_speaker_boost: true,
    },
  },
  energizing: {
    id: 'ErXwobaYiN019PkySvjV', // Antoni - energetic male voice
    name: 'Antoni',
    description: 'Energizing, confident male voice - ideal for pre-performance meditations',
    settings: {
      stability: 0.55,
      similarity_boost: 0.75,
      style: 0.25,
      use_speaker_boost: true,
    },
  },
  default: {
    id: 'Km0Soh4qk4kpe8euVFnO',
    name: 'Coach',
    description: 'Premium default voice - optimized for all meditation types',
    settings: {
      stability: 0.70,
      similarity_boost: 0.80,
      style: 0.15,
      use_speaker_boost: true,
    },
  },
  sarge: {
    id: 'Csl0vkcBfWnfYT30wkjW',
    name: 'Sarge',
    description: 'Commanding, authoritative voice - ideal for motivational and performance-driven meditations',
    settings: {
      stability: 0.65,
      similarity_boost: 0.75,
      style: 0.20,
      use_speaker_boost: true,
    },
  },
} as const;

export type VoiceType = keyof typeof VOICE_OPTIONS;

// ElevenLabs pricing (as of 2025)
// Starter: $5/month for ~30k characters
// Creator: $22/month for ~100k characters
// Pro: $99/month for ~500k characters
// We'll use pay-as-you-go initially: $0.30 per 1k characters
const COST_PER_1K_CHARACTERS = 0.3; // in dollars

/**
 * Initialize ElevenLabs client
 */
export function getElevenLabsClient(): ElevenLabsClient {
  const apiKey = process.env.ELEVENLABS_API_KEY;

  console.log('[voice-synthesis] Checking ELEVENLABS_API_KEY:', {
    exists: !!apiKey,
    length: apiKey?.length,
    prefix: apiKey?.substring(0, 8) + '...',
  });

  if (!apiKey) {
    throw new Error('ELEVENLABS_API_KEY environment variable is not set');
  }

  return new ElevenLabsClient({ apiKey });
}

/**
 * Calculate cost for voice synthesis in cents
 */
export function calculateVoiceSynthesisCost(text: string): number {
  const characters = text.length;
  const costDollars = (characters / 1000) * COST_PER_1K_CHARACTERS;
  return Math.ceil(costDollars * 100); // Convert to cents
}

/**
 * Convert meditation script to audio using ElevenLabs
 */
export async function synthesizeVoice(
  scriptText: string,
  voiceType: VoiceType = 'professional'
): Promise<{
  audioBuffer: Buffer;
  characterCount: number;
  costCents: number;
  voiceId: string;
  voiceName: string;
}> {
  const client = getElevenLabsClient();
  const voice = VOICE_OPTIONS[voiceType];

  try {
    console.log('[voice-synthesis] Starting synthesis:', {
      voiceId: voice.id,
      voiceName: voice.name,
      textLength: scriptText.length,
      voiceType,
    });

    // Generate audio using ElevenLabs streaming API
    // Using turbo_v2_5 which supports SSML break tags for precise pausing
    const audioStream = await client.textToSpeech.convert(voice.id, {
      text: scriptText,
      modelId: 'eleven_turbo_v2_5', // Supports SSML break tags and audio tags
      voiceSettings: voice.settings,
      outputFormat: 'mp3_44100_128', // Standard quality MP3
    });

    console.log('[voice-synthesis] Audio stream received, reading chunks...');

    // Convert ReadableStream to buffer
    const reader = audioStream.getReader();
    const chunks: Uint8Array[] = [];

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) chunks.push(value);
    }

    const audioBuffer = Buffer.concat(chunks);

    console.log('[voice-synthesis] Audio buffer created:', {
      bufferSize: audioBuffer.length,
      chunks: chunks.length,
    });

    // Calculate costs
    const characterCount = scriptText.length;
    const costCents = calculateVoiceSynthesisCost(scriptText);

    console.log('[voice-synthesis] Synthesis complete:', {
      characterCount,
      costCents,
      bufferSizeKB: Math.round(audioBuffer.length / 1024),
    });

    return {
      audioBuffer,
      characterCount,
      costCents,
      voiceId: voice.id,
      voiceName: voice.name,
    };
  } catch (error) {
    console.error('[voice-synthesis] Error:', error);

    // Log additional error details if available
    if (error && typeof error === 'object') {
      console.error('[voice-synthesis] Error details:', {
        message: (error as any).message,
        name: (error as any).name,
        statusCode: (error as any).statusCode,
        body: (error as any).body,
      });
    }

    throw new VoiceSynthesisError(
      error instanceof Error ? error.message : 'Unknown voice synthesis error',
      error
    );
  }
}

/**
 * Get available voices with their details
 */
export async function getAvailableVoices() {
  const client = getElevenLabsClient();

  try {
    const voices = await client.voices.getAll();
    return voices.voices.map((voice) => ({
      id: voice.voiceId,
      name: voice.name,
      category: voice.category,
      description: voice.description,
      labels: voice.labels,
    }));
  } catch (error) {
    console.error('Error fetching voices:', error);
    throw new VoiceSynthesisError(
      error instanceof Error ? error.message : 'Failed to fetch voices',
      error
    );
  }
}

/**
 * Custom error class for voice synthesis errors
 */
export class VoiceSynthesisError extends Error {
  public readonly originalError?: unknown;

  constructor(message: string, originalError?: unknown) {
    super(message);
    this.name = 'VoiceSynthesisError';
    this.originalError = originalError;
  }
}

/**
 * Validate script text before synthesis
 */
export function validateScriptForSynthesis(scriptText: string): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check minimum length
  if (scriptText.length < 100) {
    errors.push('Script is too short (minimum 100 characters)');
  }

  // Check maximum length (ElevenLabs limit: 5000 characters for single request)
  if (scriptText.length > 5000) {
    errors.push('Script is too long (maximum 5000 characters)');
  }

  // Check for empty content
  if (!scriptText.trim()) {
    errors.push('Script text is empty');
  }

  // Warnings for potentially problematic content
  if (scriptText.includes('***')) {
    warnings.push('Script contains *** markers that may affect speech');
  }

  // Check for old-style tone markers that will be spoken aloud
  if (scriptText.match(/\*\*\([^)]+\)\*\*/)) {
    warnings.push('Script contains **(markers)** that will be SPOKEN ALOUD - use [audio tags] instead');
  }

  // Check for ellipses that should be SSML breaks
  if (scriptText.includes('...')) {
    warnings.push('Script uses ellipses (...) - consider using <break time="X.Xs" /> for consistent pausing');
  }

  if (scriptText.split('\n\n').length > 20) {
    warnings.push('Script has many paragraph breaks - may affect pacing');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}
