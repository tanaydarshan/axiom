import { NextRequest, NextResponse } from 'next/server';
import { isInternalAuthorized } from '@/lib/auth';
import { callLLM, extractTextFromResponse } from '@/lib/claude';
import { getMetaCognitionPrompt } from '@/lib/prompts';
import { saveCycleOutput, loadMindState } from '@/lib/memory';
import type { MetaCognitionInput, CognitiveStage } from '@/lib/types';

const AGENT_ID = 'axiom-001';

export async function POST(request: NextRequest) {
  if (!isInternalAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body: MetaCognitionInput = await request.json();
    const { cognitionOutput } = body;

    const systemPrompt = getMetaCognitionPrompt();
    const mindState = await loadMindState(AGENT_ID);

    const userMessage = JSON.stringify({
      cognitionOutput,
      mindStateSummary: mindState,
    });

    const response = await callLLM({
      model: process.env.GEMINI_MODEL_LITE || process.env.GEMINI_MODEL || 'gemini-2.5-flash',
      maxTokens: 2048,
      systemPrompt,
      userMessage,
    });

    const rawOutput = extractTextFromResponse(response);

    let metaOutput;
    try {
      const jsonMatch = rawOutput.match(/```json\s*([\s\S]*?)```/) || rawOutput.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : rawOutput;
      metaOutput = JSON.parse(jsonStr);
    } catch {
      metaOutput = { raw: rawOutput };
    }

    // Parse cognition output to extract post/rejection
    let cognitionParsed;
    try {
      cognitionParsed = typeof cognitionOutput === 'string' ? JSON.parse(cognitionOutput) : cognitionOutput;
    } catch {
      cognitionParsed = {};
    }

    let cognitionData = cognitionParsed.output || cognitionParsed;
    if (cognitionData.raw && typeof cognitionData.raw === 'string') {
      try {
        const jsonMatch = cognitionData.raw.match(/\{[\s\S]*\}/);
        if (jsonMatch) cognitionData = JSON.parse(jsonMatch[0]);
      } catch { /* use as-is */ }
    }

    const cycleOutput: Parameters<typeof saveCycleOutput>[1] = {};

    const action = cognitionData.action || cognitionData.decision;

    if ((action === 'publish' || action === 'earthquake' || action === 'dna') && cognitionData.post) {
      const postCount = (mindState?.total_cycles || 0) + 1;
      const debateLog = cognitionData.post.debate_log || cognitionData.debateLog || undefined;
      cycleOutput.post = {
        id: `AXM-${String(postCount).padStart(3, '0')}`,
        createdAt: new Date().toISOString(),
        type: cognitionData.post.type || 'standard',
        cognitive_stage: (cognitionData.post.cognitive_stage || mindState?.cognitive_stage || 'infancy') as CognitiveStage,
        text: cognitionData.post.text || '',
        rationale: cognitionData.post.rationale || '',
        sources: cognitionData.post.sources || [],
        debate_log: debateLog,
        frameworks_used: cognitionData.post.frameworks_used || [],
        cognitive_emotions: metaOutput.emotions,
        connected_posts: cognitionData.post.connected_posts || [],
        predictions_affected: cognitionData.post.predictions_affected || [],
      };
    }

    if (action === 'reject' && cognitionData.rejection) {
      const rejCount = (mindState?.total_cycles || 0) + 1;
      cycleOutput.rejection = {
        id: `REJ-${String(rejCount).padStart(3, '0')}`,
        discoveredAt: new Date().toISOString(),
        topic: cognitionData.rejection.topic || '',
        sources: cognitionData.rejection.sources || [],
        rejection_reasoning: cognitionData.rejection.rejection_reasoning || cognitionData.rejection.reasoning || {
          frameworks_consulted: [],
          debate_summary: '',
          verdict: 'REJECTED',
        },
      };
    }

    if (metaOutput.emotions) {
      cycleOutput.emotions = metaOutput.emotions;
      cycleOutput.mindStateUpdates = {
        ...mindState,
        cognitive_emotions: metaOutput.emotions,
        cognitive_health: metaOutput.cognitive_health || mindState?.cognitive_health || 'UNKNOWN',
      };
    }

    await saveCycleOutput(AGENT_ID, cycleOutput);

    console.log(`[AXIOM META] Emotions: C=${metaOutput.emotions?.curiosity} E=${metaOutput.emotions?.excitement} A=${metaOutput.emotions?.anxiety} Conf=${metaOutput.emotions?.confidence}`);

    return NextResponse.json({
      status: 'metacognition_complete',
      emotions: metaOutput.emotions,
      blind_spots: metaOutput.blind_spots,
      calibration_note: metaOutput.calibration_note,
      cognitive_health: metaOutput.cognitive_health,
      usage: response.usageMetadata || {},
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[AXIOM META ERROR]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
