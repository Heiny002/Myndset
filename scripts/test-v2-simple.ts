/**
 * Simple V2 Database Test
 * Tests technique selection with a mock user profile
 */

import { generateMeditationPlan as generatePlanV2 } from '../lib/ai/meditation-knowledge-base-v2';
import { generateMeditationPlan as generatePlanV1 } from '../lib/ai/meditation-knowledge-base';
import { getDatabaseStats, getTechniqueById } from '../lib/ai/psychological-techniques';

// Mock user profile - ambitious sales professional
const testProfile = {
  primaryGoal: 'Close more deals',
  currentChallenge: 'Staying focused under pressure',
  sessionLength: 'standard' as any, // V1 uses string keys
  experienceLevel: 'beginner',
  skepticismLevel: 'medium',
  performanceContext: 'Sales - high-stakes client presentations',
  specificOutcome: 'Close the Johnson account presentation tomorrow'
};

// V2 expects numbers
const testProfileV2 = {
  ...testProfile,
  sessionLength: 10 // standard 10-minute session
};

async function main() {
  console.log('🧪 Testing V2 Psychological Techniques Database\n');

  // Database stats
  const stats = await getDatabaseStats();
  console.log('📊 Database Stats:');
  console.log(`   Total techniques: ${stats.totalTechniques}`);
  console.log(`   Evidence-based: ${stats.totalTechniques} techniques with academic backing\n`);

  console.log('👤 Test User Profile:');
  console.log(`   Goal: ${testProfile.primaryGoal}`);
  console.log(`   Challenge: ${testProfile.currentChallenge}`);
  console.log(`   Context: ${testProfile.performanceContext}`);
  console.log(`   Session: 10 minutes (standard)`);
  console.log(`   Experience: ${testProfile.experienceLevel}\n`);

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔬 V1 (Current System) Output:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const planV1 = generatePlanV1(testProfile);
  console.log(`Selected Components: ${planV1.components.length}`);
  planV1.components.forEach((comp: any, i: number) => {
    console.log(`\n${i + 1}. ${comp.name}`);
    console.log(`   Duration: ${comp.estimatedDuration} min`);
    console.log(`   Function: ${comp.function.substring(0, 100)}...`);
    console.log(`   Evidence: ${comp.evidenceLevel}`);
  });

  console.log(`\nSession: ${planV1.structure.name} (${planV1.structure.totalMinutes} min)`);
  console.log(`Messaging: ${planV1.messaging.name}`);

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🚀 V2 (New Psychological Techniques) Output:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const planV2 = await generatePlanV2(testProfileV2);
  console.log(`Selected Techniques: ${planV2.components.length}`);

  // Get full technique details for display
  const techniques = (await Promise.all(planV2.components.map((c: any) => getTechniqueById(c.id)))).filter(Boolean);

  techniques.forEach((tech: any, i: number) => {
    console.log(`\n${i + 1}. ${tech.name}`);
    console.log(`   Domain: ${tech.domain}`);
    console.log(`   Duration: ${tech.durationMinutes} min`);
    console.log(`   Evidence: ${tech.evidenceLevel}`);
    console.log(`   Performance Focus: ${tech.performanceFocus}/5 ⭐`);

    if (tech.academicSources && tech.academicSources.length > 0) {
      console.log(`\n   📚 Primary Academic Source:`);
      const source = tech.academicSources[0];
      const authors = Array.isArray(source.authors) ? source.authors.join(', ') : source.authors;
      console.log(`      ${authors} (${source.year})`);
      console.log(`      "${source.title}"`);
      console.log(`      ${source.journal || source.publisher}`);
    }

    if (tech.implementationProtocol) {
      console.log(`\n   🎯 Implementation Guide:`);
      const overview = tech.implementationProtocol.overview || tech.implementationProtocol;
      if (typeof overview === 'string') {
        console.log(`      ${overview.substring(0, 150)}...`);
      }
      if (tech.implementationProtocol.languagePatterns && tech.implementationProtocol.languagePatterns.length > 0) {
        console.log(`\n      Language Patterns Available: ${tech.implementationProtocol.languagePatterns.length}`);
        console.log(`      Sample patterns:`);
        tech.implementationProtocol.languagePatterns.slice(0, 2).forEach((pattern: string, idx: number) => {
          console.log(`        ${idx + 1}. "${pattern}"`);
        });
      }
    }

    if (tech.scriptExample) {
      console.log(`\n   📝 Practitioner Script Example (${tech.scriptExample.duration || '30-60s'}):`);
      const text = tech.scriptExample.text || tech.scriptExample;
      if (typeof text === 'string') {
        const preview = text.substring(0, 120);
        console.log(`      "${preview}..."`);
      }
    }
  });

  console.log(`\nSession: ${planV2.sessionStructure?.name || 'Unknown'} (${planV2.sessionStructure?.totalMinutes || planV2.totalDuration} min)`);
  console.log(`Messaging: ${planV2.messagingFramework?.name || 'Unknown'}`);

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 V1 vs V2 Comparison:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const v1Sources = planV1.components.filter((c: any) => c.neuroscience).length;
  const v2Sources = techniques.reduce((acc: number, t: any) => acc + (t?.academicSources?.length || 0), 0);

  console.log(`Techniques Selected:`);
  console.log(`  V1: ${planV1.components.length} components`);
  console.log(`  V2: ${planV2.components.length} techniques\n`);

  console.log(`Academic Citations:`);
  console.log(`  V1: ~${v1Sources} neuroscience references (brief)`);
  console.log(`  V2: ${v2Sources} full academic citations with journals\n`);

  console.log(`Implementation Guidance:`);
  console.log(`  V1: General component descriptions`);
  console.log(`  V2: ✅ Detailed implementation protocols`);
  console.log(`  V2: ✅ ${techniques.reduce((acc: number, t: any) => acc + (t?.implementationProtocol?.languagePatterns?.length || 0), 0)} language patterns`);
  console.log(`  V2: ✅ ${techniques.filter((t: any) => t?.scriptExample).length} practitioner script examples\n`);

  console.log('✅ Test Complete!\n');
}

main().catch(console.error);
