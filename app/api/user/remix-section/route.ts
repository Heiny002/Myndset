import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { remixScriptSection, canUserRemix, getRemixUsageForUser } from '@/lib/ai/section-remix';
import { synthesizeVoice } from '@/lib/ai/voice-synthesis';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { meditationId, sectionToRemix, remixInstructions, regenerateAudio = true } = body;

    // Validate inputs
    if (!meditationId || !sectionToRemix || !remixInstructions) {
      return NextResponse.json(
        { error: 'Missing required fields: meditationId, sectionToRemix, remixInstructions' },
        { status: 400 }
      );
    }

    // Check if user has reached their remix limit
    const canRemix = await canUserRemix(user.id, supabase);
    if (!canRemix) {
      const usage = await getRemixUsageForUser(user.id, supabase);
      return NextResponse.json(
        {
          error: 'Remix limit reached',
          message: `You've used all ${usage.limit} remixes for this month. Upgrade your plan for more remixes.`,
          usage,
        },
        { status: 403 }
      );
    }

    // Fetch the meditation
    const { data: meditation, error: fetchError } = await supabase
      .from('meditations')
      .select('*')
      .eq('id', meditationId)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !meditation) {
      return NextResponse.json(
        { error: 'Meditation not found or access denied' },
        { status: 404 }
      );
    }

    // Validate meditation has a script
    if (!meditation.script_text) {
      return NextResponse.json(
        { error: 'Meditation does not have a script yet' },
        { status: 400 }
      );
    }

    // Extract meditation context from techniques metadata
    const metadata = (meditation.techniques as any) || {};
    const meditationContext = {
      title: meditation.title,
      goal: metadata.messagingFramework || 'performance optimization',
      techniques: metadata.selectedComponents?.map((c: any) => c.name) || [],
      sessionLength: meditation.audio_duration_seconds
        ? Math.round(meditation.audio_duration_seconds / 60)
        : 10,
    };

    // Regenerate the section using AI
    console.log('Remixing section for meditation:', meditationId);
    const remixResult = await remixScriptSection({
      originalScript: meditation.script_text,
      sectionToRemix,
      remixInstructions,
      meditationContext,
    });

    // Create remix record in database
    const { data: remixRecord, error: remixInsertError } = await supabase
      .from('meditation_remixes')
      .insert({
        original_meditation_id: meditationId,
        user_id: user.id,
        section_to_remix: sectionToRemix,
        remix_instructions: remixInstructions,
        new_script_text: remixResult.fullScriptWithNewSection,
        status: 'completed',
      })
      .select()
      .single();

    if (remixInsertError) {
      console.error('Error creating remix record:', remixInsertError);
      return NextResponse.json({ error: 'Failed to save remix' }, { status: 500 });
    }

    // Update meditation with new script
    const { error: updateError } = await supabase
      .from('meditations')
      .update({
        script_text: remixResult.fullScriptWithNewSection,
        techniques: {
          ...metadata,
          lastRemix: {
            remixId: remixRecord.id,
            date: new Date().toISOString(),
            section: sectionToRemix.substring(0, 100) + '...',
            instructions: remixInstructions,
            wordCountChange: remixResult.wordCount - sectionToRemix.split(' ').length,
          },
        },
      })
      .eq('id', meditationId);

    if (updateError) {
      console.error('Error updating meditation:', updateError);
      return NextResponse.json({ error: 'Failed to update meditation' }, { status: 500 });
    }

    // Optionally regenerate audio with new script
    let audioUrl = meditation.audio_url;
    let audioGenerationCostCents = meditation.generation_cost_cents;

    if (regenerateAudio) {
      try {
        console.log('Regenerating audio for remixed script...');

        // Get voice type from metadata or default to professional
        const voiceType =
          metadata.audio_voice_name?.toLowerCase().includes('sarah')
            ? 'calm'
            : metadata.audio_voice_name?.toLowerCase().includes('antoni')
              ? 'energizing'
              : 'professional';

        const { audioBuffer, costCents, voiceId, voiceName } = await synthesizeVoice(
          remixResult.fullScriptWithNewSection,
          voiceType
        );

        // Upload to Supabase Storage
        const fileName = `${user.id}/${meditationId}.mp3`;
        const { error: uploadError } = await supabase.storage
          .from('meditation-audio')
          .upload(fileName, audioBuffer, {
            contentType: 'audio/mpeg',
            upsert: true, // Overwrite existing file
          });

        if (uploadError) {
          console.error('Error uploading audio:', uploadError);
        } else {
          // Get public URL
          const { data: urlData } = supabase.storage
            .from('meditation-audio')
            .getPublicUrl(fileName);

          audioUrl = urlData.publicUrl;
          audioGenerationCostCents = (meditation.generation_cost_cents || 0) + costCents;

          // Update meditation with new audio URL
          await supabase
            .from('meditations')
            .update({
              audio_url: audioUrl,
              generation_cost_cents: audioGenerationCostCents,
              techniques: {
                ...metadata,
                audio_voice_name: voiceName,
                audio_regenerated: true,
                audio_regenerated_at: new Date().toISOString(),
                lastRemix: {
                  remixId: remixRecord.id,
                  date: new Date().toISOString(),
                  section: sectionToRemix.substring(0, 100) + '...',
                  instructions: remixInstructions,
                  wordCountChange: remixResult.wordCount - sectionToRemix.split(' ').length,
                  audioRegenerated: true,
                },
              },
            })
            .eq('id', meditationId);

          console.log('Audio regenerated successfully');
        }
      } catch (audioError) {
        console.error('Error regenerating audio:', audioError);
        // Continue even if audio generation fails - user still has updated script
      }
    }

    // Get updated usage
    const usage = await getRemixUsageForUser(user.id, supabase);

    return NextResponse.json({
      success: true,
      remixId: remixRecord.id,
      newScript: remixResult.fullScriptWithNewSection,
      changeExplanation: remixResult.changeExplanation,
      audioUrl,
      audioRegenerated: regenerateAudio,
      usage,
    });
  } catch (error) {
    console.error('Error in remix-section route:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to check remix usage for current user
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get usage
    const usage = await getRemixUsageForUser(user.id, supabase);

    return NextResponse.json({
      success: true,
      usage,
      canRemix: usage.used < usage.limit,
    });
  } catch (error) {
    console.error('Error checking remix usage:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
