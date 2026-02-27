import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/admin';
import {
  buildPlanFromQuestionnaire,
  buildMappedDataFromQuestionnaire,
  type LabQuestionnaire,
} from '@/lib/ai/script-lab-chat';

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();
    const { labQuestionnaire, scriptMethod } = body as {
      labQuestionnaire: LabQuestionnaire;
      scriptMethod?: string;
    };

    if (!labQuestionnaire) {
      return NextResponse.json({ error: 'Missing labQuestionnaire' }, { status: 400 });
    }

    const plan = buildPlanFromQuestionnaire(labQuestionnaire, 'preview', 'preview');
    const mapped = buildMappedDataFromQuestionnaire(labQuestionnaire, scriptMethod);

    return NextResponse.json({ plan, mapped });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    return NextResponse.json(
      { error: 'Failed to preview plan', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 },
    );
  }
}
