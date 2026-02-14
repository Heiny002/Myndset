/**
 * Test V2 Psychological Techniques Database Integration
 *
 * This script:
 * 1. Fetches a real questionnaire response
 * 2. Generates a meditation plan using V2 (new database)
 * 3. Compares it with what V1 would generate
 * 4. Shows the implementation protocols and language patterns
 */

import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { generateMeditationPlan as generatePlanV2 } from '../lib/ai/meditation-knowledge-base-v2';
import { generateMeditationPlan as generatePlanV1 } from '../lib/ai/meditation-knowledge-base';
import { loadTechniquesDatabase, getDatabaseStats } from '../lib/ai/psychological-techniques';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log('🧪 Testing V2 Psychological Techniques Database\n');

  // Get database stats
  const stats = await getDatabaseStats();
  console.log('📊 Database Stats:');
  console.log(`   Total techniques: ${stats.totalTechniques}`);
  console.log();

  // Fetch a recent questionnaire
  const { data: questionnaires, error } = await supabase
    .from('questionnaire_responses')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error || !questionnaires) {
    console.error('❌ Error fetching questionnaire:', error);
    return;
  }

  // Extract responses from JSONB
  const responses = questionnaires.responses as any;

  console.log('📋 Test Questionnaire:');
  console.log(`   ID: ${questionnaires.id}`);
  console.log(`   Tier: ${questionnaires.tier}`);
  console.log('   Raw Responses:', JSON.stringify(responses, null, 2));
  console.log();

  // Convert to UserProfile format
  const sessionLengthMap = {
    'ultra_quick': 3,
    'quick': 5,
    'standard': 10,
    'deep': 20
  };

  const profile = {
    primaryGoal: responses.primary_goal || 'Close more deals',
    currentChallenge: responses.current_challenge || 'Staying focused under pressure',
    sessionLength: sessionLengthMap[(responses.session_length as keyof typeof sessionLengthMap) || 'standard'] || 10,
    experienceLevel: responses.experience_level || 'beginner',
    skepticismLevel: responses.skepticism_level?.toString() || 'medium',
    performanceContext: responses.performance_context || 'Sales',
    specificOutcome: responses.specific_outcome
  };

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔬 V1 (Current System) Output:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const planV1 = generatePlanV1(profile);
  console.log(`Selected Components (${planV1.selectedComponents.length}):`);
  planV1.selectedComponents.forEach((comp, i) => {
    console.log(`\n${i + 1}. ${comp.name}`);
    console.log(`   Duration: ${comp.estimatedDuration} min`);
    console.log(`   Function: ${comp.function}`);
    console.log(`   Evidence: ${comp.evidenceLevel}`);
  });

  console.log(`\nSession Structure: ${planV1.sessionStructure.name}`);
  console.log(`Total Duration: ${planV1.sessionStructure.totalMinutes} min`);
  console.log(`\nMessaging Framework: ${planV1.messagingFramework.name}`);

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🚀 V2 (New Psychological Techniques) Output:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const planV2 = await generatePlanV2(profile);
  console.log(`Selected Techniques (${planV2.selectedTechniques.length}):`);
  planV2.selectedTechniques.forEach((tech, i) => {
    console.log(`\n${i + 1}. ${tech.name} (Score: ${tech.matchScore}/130)`);
    console.log(`   ID: ${tech.id}`);
    console.log(`   Duration: ${tech.durationMinutes} min`);
    console.log(`   Domain: ${tech.domain}`);
    console.log(`   Evidence: ${tech.evidenceLevel}`);
    console.log(`   Performance Focus: ${tech.performanceFocus}/5`);

    if (tech.academicSources.length > 0) {
      console.log(`\n   📚 Academic Source:`);
      const source = tech.academicSources[0];
      console.log(`      ${source.citation}`);
    }

    if (tech.implementationProtocol) {
      console.log(`\n   🎯 Implementation Protocol:`);
      console.log(`      ${tech.implementationProtocol.overview}`);
      console.log(`\n      Language Patterns (${tech.implementationProtocol.languagePatterns.length}):`);
      tech.implementationProtocol.languagePatterns.slice(0, 3).forEach(pattern => {
        console.log(`      - ${pattern}`);
      });
      if (tech.implementationProtocol.languagePatterns.length > 3) {
        console.log(`      ... and ${tech.implementationProtocol.languagePatterns.length - 3} more`);
      }
    }

    if (tech.scriptExample) {
      console.log(`\n   📝 Script Example:`);
      console.log(`      "${tech.scriptExample.text.substring(0, 150)}..."`);
    }
  });

  console.log(`\nSession Structure: ${planV2.sessionStructure.name}`);
  console.log(`Total Duration: ${planV2.sessionStructure.totalMinutes} min`);
  console.log(`\nMessaging Framework: ${planV2.messagingFramework.name}`);

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 Comparison Summary:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log(`V1 Components: ${planV1.selectedComponents.length}`);
  console.log(`V2 Techniques: ${planV2.selectedTechniques.length}`);
  console.log(`\nV1 Total Sources: ${planV1.selectedComponents.reduce((acc, c) => acc + (c.neuroscience ? 1 : 0), 0)}`);
  console.log(`V2 Total Sources: ${planV2.selectedTechniques.reduce((acc, t) => acc + t.academicSources.length, 0)}`);
  console.log(`\nV2 Adds:`);
  console.log(`  ✅ Academic citations with full references`);
  console.log(`  ✅ Implementation protocols with language patterns`);
  console.log(`  ✅ Practitioner-proven script examples`);
  console.log(`  ✅ Match scoring algorithm (0-130 points)`);
  console.log(`  ✅ Evidence-based contraindications`);

  console.log('\n✅ Test Complete!\n');
}

main().catch(console.error);
