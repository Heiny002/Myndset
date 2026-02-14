/**
 * Seed Psychological Techniques into Supabase
 *
 * Reads lib/ai/psychological-techniques-db.json and upserts all techniques
 * into the psychological_techniques table. Idempotent — safe to re-run.
 *
 * Usage: npm run seed-techniques
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { readFileSync } from 'fs';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables');
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓' : '✗');
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✓' : '✗');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

interface JsonTechnique {
  id: string;
  name: string;
  domain: string;
  tags: string[];
  audioCompatible: boolean;
  performanceFocus: number;
  description: string;
  psychologicalMechanism: string;
  evidenceLevel: string;
  academicSources: unknown[];
  whenToUse: string[];
  whenNotToUse: string[];
  durationMinutes: number;
  intensityLevel: string;
  implementationProtocol: unknown;
  scriptExample: unknown;
  combinesWellWith: string[];
  contradictsWithout: string[];
  targetAudience: string[];
  bestFor: string[];
  implementationSpeed: string;
  createdAt: string;
  updatedAt: string;
  version: number;
}

interface JsonDatabase {
  version: string;
  lastUpdated: string;
  totalTechniques: number;
  techniques: JsonTechnique[];
}

/**
 * Map a camelCase JSON technique to snake_case Supabase row
 */
function mapToRow(t: JsonTechnique) {
  return {
    id: t.id,
    name: t.name,
    domain: t.domain,
    tags: t.tags,
    audio_compatible: t.audioCompatible,
    performance_focus: t.performanceFocus,
    description: t.description,
    psychological_mechanism: t.psychologicalMechanism,
    evidence_level: t.evidenceLevel,
    academic_sources: t.academicSources,
    when_to_use: t.whenToUse,
    when_not_to_use: t.whenNotToUse,
    duration_minutes: t.durationMinutes,
    intensity_level: t.intensityLevel,
    implementation_protocol: t.implementationProtocol,
    script_example: t.scriptExample || {},
    combines_well_with: t.combinesWellWith,
    contradicts_without: t.contradictsWithout,
    target_audience: t.targetAudience,
    best_for: t.bestFor,
    implementation_speed: t.implementationSpeed,
    version: t.version,
  };
}

async function seedTechniques() {
  console.log('📦 Loading techniques from JSON...\n');

  const dbPath = path.join(__dirname, '../lib/ai/psychological-techniques-db.json');
  const fileContents = readFileSync(dbPath, 'utf-8');
  const db: JsonDatabase = JSON.parse(fileContents);

  console.log(`   Found ${db.techniques.length} techniques (v${db.version})\n`);

  const rows = db.techniques.map(mapToRow);

  console.log('🚀 Upserting into Supabase...\n');

  const { data, error } = await supabase
    .from('psychological_techniques')
    .upsert(rows, { onConflict: 'id' })
    .select('id, name');

  if (error) {
    console.error('❌ Upsert failed:', error.message);
    console.error('   Details:', error);
    process.exit(1);
  }

  console.log(`✅ Successfully upserted ${data.length} techniques:\n`);
  data.forEach((row: { id: string; name: string }) => {
    console.log(`   • ${row.id} — ${row.name}`);
  });

  // Verify count
  const { count, error: countError } = await supabase
    .from('psychological_techniques')
    .select('*', { count: 'exact', head: true });

  if (countError) {
    console.error('\n⚠️  Could not verify count:', countError.message);
  } else {
    console.log(`\n📊 Total techniques in database: ${count}`);
  }

  console.log('\n✅ Seed complete!');
}

seedTechniques().catch((err) => {
  console.error('❌ Unexpected error:', err);
  process.exit(1);
});
