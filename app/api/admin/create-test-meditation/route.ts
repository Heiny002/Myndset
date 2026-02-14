import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/admin';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { generateMeditationPlanFromQuestionnaire } from '@/lib/ai/plan-generator';
import { generateEnergizingScript } from '@/lib/ai/energizing-script-generator';
import { synthesizeVoice } from '@/lib/ai/voice-synthesis';
import { logAPIUsage } from '@/lib/ai/cost-tracking';
import { mapQuestionnaireResponses } from '@/lib/questionnaire/response-mapper';

export async function POST(request: NextRequest) {
  try {
    // Verify admin access
    await requireAdmin();

    // Get the current user
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { userId, tier, responses, autoApprove } = body;

    if (!userId || !tier || !responses) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const adminClient = createAdminClient();

    // Map the new questionnaire responses to the expected format
    const mappedData = mapQuestionnaireResponses(responses);

    // Step 1: Create questionnaire response
    console.log('Creating questionnaire response...');
    const { data: questionnaireData, error: questionnaireError } = await adminClient
      .from('questionnaire_responses')
      .insert({
        user_id: userId,
        tier,
        responses,
        completed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (questionnaireError) {
      console.error('Questionnaire error:', questionnaireError);
      return NextResponse.json(
        { error: 'Failed to save questionnaire', details: questionnaireError.message },
        { status: 500 }
      );
    }

    console.log('Questionnaire created:', questionnaireData.id);

    // Step 2: Generate meditation plan using mapped data
    console.log('Generating meditation plan...');
    const { plan, aiResponse } = await generateMeditationPlanFromQuestionnaire({
      id: questionnaireData.id,
      userId: questionnaireData.user_id,
      primaryGoal: mappedData.primaryGoal,
      currentChallenge: mappedData.currentChallenge,
      sessionLength: mappedData.sessionLength,
      experienceLevel: mappedData.experienceLevel,
      skepticismLevel: mappedData.skepticismLevel,
      performanceContext: mappedData.performanceContext,
      preferredTime: mappedData.preferredTime,
      specificOutcome: mappedData.specificOutcome,
      tier: questionnaireData.tier || 1,
      responses,
      createdAt: questionnaireData.created_at,
    });

    const planResult = {
      plan,
      tokensUsed: aiResponse.inputTokens + aiResponse.outputTokens,
      costCents: aiResponse.costCents,
    };

    const { data: planData, error: planError } = await adminClient
      .from('meditation_plans')
      .insert({
        user_id: userId,
        questionnaire_response_id: questionnaireData.id,
        plan_data: planResult.plan as any,
        status: autoApprove ? 'approved' : 'pending_approval',
      })
      .select()
      .single();

    if (planError) {
      console.error('Plan error:', planError);
      return NextResponse.json(
        { error: 'Failed to save plan', details: planError.message },
        { status: 500 }
      );
    }

    console.log('Plan created:', planData.id);

    // Log plan generation cost
    await logAPIUsage({
      userId: userId,
      service: 'claude',
      operation: 'plan_generation',
      inputTokens: aiResponse.inputTokens,
      outputTokens: aiResponse.outputTokens,
      costCents: planResult.costCents,
    });

    // Step 3: Generate ENERGIZING script (not regular meditation script)
    console.log('Generating energizing script...');
    const { script: energizingScript, aiResponse: scriptAiResponse } = await generateEnergizingScript(
      planResult.plan,
      mappedData
    );

    const scriptText = energizingScript.scriptText;
    const wordCount = energizingScript.wordCount;
    const durationSeconds = energizingScript.estimatedDurationSeconds;

    // Create meditation record with script
    const { data: meditationData, error: meditationError } = await adminClient
      .from('meditations')
      .insert({
        user_id: userId,
        meditation_plan_id: planData.id,
        title: `Activation: ${mappedData.challengeType || mappedData.userType}`,
        description: planResult.plan.overallRationale.substring(0, 200),
        script_text: scriptText,
        session_length: mappedData.sessionLength || 'standard',
        techniques: {
          status: autoApprove ? 'approved' : 'pending_review',
          word_count: wordCount,
          duration_seconds: durationSeconds,
          version: 1,
          tokens_used: scriptAiResponse.inputTokens + scriptAiResponse.outputTokens,
          cost_cents: scriptAiResponse.costCents,
          model: 'claude-sonnet-4',
          generated_at: new Date().toISOString(),
          script_type: 'energizing',
          user_type: mappedData.userType,
          elevenlabs_guidance: energizingScript.elevenLabsGuidance,
        },
        generation_cost_cents: Math.round(scriptAiResponse.costCents),
      })
      .select()
      .single();

    if (meditationError) {
      console.error('Meditation error:', meditationError);
      return NextResponse.json(
        { error: 'Failed to save meditation', details: meditationError.message },
        { status: 500 }
      );
    }

    console.log('Meditation created:', meditationData.id);

    // Log script generation cost
    await logAPIUsage({
      userId: userId,
      service: 'claude',
      operation: 'script_generation',
      inputTokens: scriptAiResponse.inputTokens,
      outputTokens: scriptAiResponse.outputTokens,
      costCents: scriptAiResponse.costCents,
    });

    // Step 4: Generate audio (if auto-approve is enabled)
    if (autoApprove) {
      console.log('Generating audio...');
      try {
        // Use Professional voice by default for test meditations
        const voiceType = 'professional';
        const audioResult = await synthesizeVoice(scriptText, voiceType);

        // Upload to Supabase Storage
        const fileName = `${userId}/${meditationData.id}.mp3`;
        const { error: uploadError } = await adminClient.storage
          .from('meditation-audio')
          .upload(fileName, audioResult.audioBuffer, {
            contentType: 'audio/mpeg',
            upsert: false,
          });

        if (uploadError) {
          console.error('Audio upload error:', uploadError);
          throw uploadError;
        }

        // Get public URL
        const {
          data: { publicUrl },
        } = adminClient.storage.from('meditation-audio').getPublicUrl(fileName);

        // Update meditation with audio URL
        const { error: updateError } = await adminClient
          .from('meditations')
          .update({
            audio_url: publicUrl,
            audio_duration_seconds: durationSeconds,
            techniques: {
              ...(meditationData.techniques as any),
              audio_cost_cents: audioResult.costCents,
              voice_id: audioResult.voiceId,
              voice_name: audioResult.voiceName,
              character_count: audioResult.characterCount,
              audio_generated_at: new Date().toISOString(),
            },
          })
          .eq('id', meditationData.id);

        if (updateError) {
          console.error('Update error:', updateError);
          throw updateError;
        }

        console.log('Audio generated and uploaded successfully');

        // Log audio generation cost
        await logAPIUsage({
          userId: userId,
          service: 'elevenlabs',
          operation: 'voice_synthesis',
          audioSeconds: durationSeconds,
          costCents: audioResult.costCents,
        });
      } catch (audioError) {
        console.error('Audio generation failed:', audioError);
        // Don't fail the whole request if audio fails
        // The meditation will still be created, just without audio
      }
    }

    return NextResponse.json({
      success: true,
      meditationId: meditationData.id,
      planId: planData.id,
      questionnaireId: questionnaireData.id,
      autoApproved: autoApprove,
    });
  } catch (error) {
    console.error('Error creating test meditation:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
