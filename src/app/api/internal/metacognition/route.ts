import { NextRequest, NextResponse } from 'next/server';
import { isInternalAuthorized } from '@/lib/auth';
import { callLLM, extractTextFromResponse } from '@/lib/claude';
import { getMetaCognitionPrompt } from '@/lib/prompts';
import { saveCycleOutput, loadMindState, getAgentMeta } from '@/lib/memory';
import type { MetaCognitionInput, CognitiveStage, Framework, DNAStrand, Prediction, CycleOutput } from '@/lib/types';

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
    const meta = await getAgentMeta(AGENT_ID);

    const userMessage = JSON.stringify({
      cognitionOutput,
      mindStateSummary: mindState,
    });

    const response = await callLLM({
      model: 'gemini-3.5-flash',
      maxTokens: 2048,
      systemPrompt,
      userMessage,
    });

    const rawOutput = extractTextFromResponse(response);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let metaOutput: any;
    try {
      const jsonMatch = rawOutput.match(/```json\s*([\s\S]*?)```/) || rawOutput.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : rawOutput;
      metaOutput = JSON.parse(jsonStr);
    } catch {
      console.warn('[AXIOM META] Failed to parse JSON, attempting emotion extraction from raw text');
      metaOutput = { raw: rawOutput };
      const curiosityMatch = rawOutput.match(/"curiosity"\s*:\s*(\d+)/);
      const excitementMatch = rawOutput.match(/"excitement"\s*:\s*(\d+)/);
      const anxietyMatch = rawOutput.match(/"anxiety"\s*:\s*(\d+)/);
      const confidenceMatch = rawOutput.match(/"confidence"\s*:\s*(\d+)/);
      if (curiosityMatch) {
        metaOutput.emotions = {
          curiosity: parseInt(curiosityMatch[1]),
          excitement: excitementMatch ? parseInt(excitementMatch[1]) : 30,
          anxiety: anxietyMatch ? parseInt(anxietyMatch[1]) : 30,
          confidence: confidenceMatch ? parseInt(confidenceMatch[1]) : 30,
        };
      }
    }

    console.log(`[AXIOM META] Parsed output keys: ${Object.keys(metaOutput).join(', ')}. Has emotions: ${!!metaOutput.emotions}`);

    // Parse cognition output to extract post/rejection/frameworks/predictions
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

    const cycleOutput: CycleOutput = {};
    const currentCycle = meta?.currentCycle || mindState?.total_cycles || 0;
    const action = cognitionData.action || cognitionData.decision;

    // Extract post
    if ((action === 'publish' || action === 'earthquake' || action === 'dna') && cognitionData.post) {
      const postCount = currentCycle + 1;
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

    // Extract rejection
    if (action === 'reject' && cognitionData.rejection) {
      const rejCount = currentCycle + 1;
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

    // Extract new frameworks from cognition output
    if (cognitionData.newFrameworks && Array.isArray(cognitionData.newFrameworks)) {
      cycleOutput.frameworkCreates = cognitionData.newFrameworks.map((fw: Record<string, unknown>, i: number) => ({
        id: `F-${String(currentCycle + 1).padStart(3, '0')}-${i + 1}`,
        name: (fw.name as string) || 'Unnamed Framework',
        description: (fw.description as string) || '',
        status: (fw.status as string) || 'seedling',
        confidence: (fw.confidence as number) || 30,
        bornCycle: currentCycle,
        evidenceTests: 0,
        evidenceTestsPassed: 0,
        testablePredictions: ((fw.predictions as string[]) || []),
        intellectualLineage: (fw.lineageNote as string) || '',
      } as Framework));
    }

    // Extract framework updates (nurseryUpdates)
    if (cognitionData.nurseryUpdates && Array.isArray(cognitionData.nurseryUpdates)) {
      cycleOutput.frameworkUpdates = cognitionData.nurseryUpdates.map((u: Record<string, unknown>) => ({
        id: (u.id as string) || (u.name as string) || '',
        updates: {
          confidence: u.confidence as number,
          status: u.status as string,
        },
      }));
    }

    // Extract new predictions
    if (cognitionData.newPredictions && Array.isArray(cognitionData.newPredictions)) {
      cycleOutput.predictionCreates = cognitionData.newPredictions.map((p: Record<string, unknown>, i: number) => ({
        id: `P-${String(currentCycle + 1).padStart(3, '0')}-${i + 1}`,
        prediction: (p.text as string) || (p.prediction as string) || '',
        stakedCycle: currentCycle,
        stakedAt: new Date().toISOString(),
        confidence: (p.confidence as number) || 50,
        derivedFromFramework: (p.framework as string) || (p.derivedFrom as string) || 'unknown',
        status: 'pending' as const,
        resolution: undefined,
        resolvedCycle: undefined,
      } as Prediction));
    }

    // Extract debate log
    if (cognitionData.debateLog) {
      const dl = cognitionData.debateLog;
      const winner: 'advocate' | 'skeptic' | 'compromise' =
        action === 'publish' ? 'advocate' :
        action === 'reject' ? 'skeptic' : 'compromise';
      cycleOutput.debateLog = {
        cycle: currentCycle,
        postId: cycleOutput.post?.id || cycleOutput.rejection?.id || '',
        winner,
        qualityScore: dl.confidence_adjustment || 'N/A',
      };
    }

    // Extract emotions from metacognition output
    if (metaOutput.emotions) {
      cycleOutput.emotionUpdate = {
        current: metaOutput.emotions,
        focusAreas: metaOutput.curiosityFocusAreas || [],
      };
      cycleOutput.mindStateUpdates = {
        cognitive_emotions: metaOutput.emotions,
        cognitive_health: metaOutput.cognitive_health || mindState?.cognitive_health || 'UNKNOWN',
      };
    }

    await saveCycleOutput(AGENT_ID, cycleOutput);

    console.log(`[AXIOM META] Emotions: C=${metaOutput.emotions?.curiosity} E=${metaOutput.emotions?.excitement} A=${metaOutput.emotions?.anxiety} Conf=${metaOutput.emotions?.confidence}`);
    console.log(`[AXIOM META] Frameworks created: ${cycleOutput.frameworkCreates?.length || 0}, Predictions: ${cycleOutput.predictionCreates?.length || 0}`);

    return NextResponse.json({
      status: 'metacognition_complete',
      emotions: metaOutput.emotions,
      blind_spots: metaOutput.blind_spots,
      calibration_note: metaOutput.calibration_note,
      cognitive_health: metaOutput.cognitive_health,
      curiosityFocusAreas: metaOutput.curiosityFocusAreas,
      usage: response.usageMetadata || {},
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[AXIOM META ERROR]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
