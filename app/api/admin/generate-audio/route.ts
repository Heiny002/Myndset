import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth/admin';
import {
  synthesizeVoice,
  validateScriptForSynthesis,
  VoiceType,
} from '@/lib/ai/voice-synthesis';
import { logAPIUsage } from '@/lib/ai/cost-tracking';
import { sendMeditationReadyEmail } from '@/lib/email/resend';

export async function POST(request: NextRequest) {
  try {
    // Verify admin access
    await requireAdmin();

    const { scriptId, voiceType = 'professional' } = await request.json();

    if (!scriptId) {
      return NextResponse.json({ error: 'scriptId is required' }, { status: 400 });
    }

    const adminClient = createAdminClient();

    // Fetch approved script
    const { data: script, error: scriptError } = await adminClient
      .from('meditations')
      .select('*')
      .eq('id', scriptId)
      .single();

    if (scriptError || !script) {
      return NextResponse.json({ error: 'Script not found' }, { status: 404 });
    }

    // Check script is approved
    const scriptMetadata = (script.techniques as any) || {};
    if (scriptMetadata.status !== 'approved') {
      return NextResponse.json(
        { error: 'Script must be approved before generating audio' },
        { status: 400 }
      );
    }

    // Check if audio already exists
    if (script.audio_url) {
      return NextResponse.json(
        {
          error: 'Audio already exists for this script',
          audioUrl: script.audio_url,
        },
        { status: 400 }
      );
    }

    // Validate script text
    const validation = validateScriptForSynthesis(script.script_text);
    if (!validation.isValid) {
      return NextResponse.json(
        {
          error: 'Script validation failed',
          validationErrors: validation.errors,
        },
        { status: 400 }
      );
    }

    // Generate audio using ElevenLabs
    const {
      audioBuffer,
      characterCount,
      costCents,
      voiceId,
      voiceName,
    } = await synthesizeVoice(script.script_text, voiceType as VoiceType);

    // Upload audio to Supabase Storage
    const fileName = `${script.user_id}/${scriptId}.mp3`;
    const { data: uploadData, error: uploadError } = await adminClient.storage
      .from('meditation-audio')
      .upload(fileName, audioBuffer, {
        contentType: 'audio/mpeg',
        upsert: false,
      });

    if (uploadError) {
      console.error('Error uploading audio:', uploadError);
      return NextResponse.json(
        { error: 'Failed to upload audio file' },
        { status: 500 }
      );
    }

    // Get public URL for the audio file
    const { data: urlData } = adminClient.storage
      .from('meditation-audio')
      .getPublicUrl(fileName);

    // Update meditation record with audio URL and synthesis metadata
    const { data: updatedScript, error: updateError } = await adminClient
      .from('meditations')
      .update({
        audio_url: urlData.publicUrl,
        audio_generation_cost_cents: costCents,
        techniques: {
          ...scriptMetadata,
          audio_generated: true,
          audio_generated_at: new Date().toISOString(),
          audio_character_count: characterCount,
          audio_voice_id: voiceId,
          audio_voice_name: voiceName,
          audio_cost_cents: costCents,
        } as any,
      })
      .eq('id', scriptId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating meditation:', updateError);
      return NextResponse.json(
        { error: 'Failed to update meditation record' },
        { status: 500 }
      );
    }

    // Log API usage for cost tracking
    await logAPIUsage({
      userId: script.user_id,
      service: 'elevenlabs',
      operation: 'text_to_speech',
      model: 'eleven_turbo_v2_5',
      inputTokens: 0, // ElevenLabs uses characters, not tokens
      outputTokens: 0,
      costCents,
      metadata: {
        scriptId,
        characterCount,
        voiceType,
        voiceId,
        voiceName,
      },
    });

    // Send email notification to user
    const { data: userData } = await adminClient.auth.admin.getUserById(script.user_id);
    if (userData?.user?.email) {
      const emailResult = await sendMeditationReadyEmail({
        to: userData.user.email,
        userName: userData.user.user_metadata?.full_name,
        meditationId: scriptId,
        meditationTitle: script.title,
      });

      if (!emailResult.success) {
        console.error('Failed to send notification email:', emailResult.error);
        // Don't fail the request if email fails - meditation is still ready
      }
    }

    return NextResponse.json({
      success: true,
      audioUrl: urlData.publicUrl,
      meditation: updatedScript,
      synthesis: {
        characterCount,
        costCents,
        voiceId,
        voiceName,
      },
    });
  } catch (error) {
    console.error('Error generating audio:', error);

    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    return NextResponse.json(
      { error: 'Failed to generate meditation audio' },
      { status: 500 }
    );
  }
}
