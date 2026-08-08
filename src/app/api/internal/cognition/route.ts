import { NextRequest, NextResponse } from 'next/server';
import { isInternalAuthorized } from '@/lib/auth';
import { callLLM, extractTextFromResponse } from '@/lib/claude';
import { getCognitionPrompt } from '@/lib/prompts';
import { compressMindState, getPreviousTopics } from '@/lib/memory';
import type { CognitionInput, CognitiveStage } from '@/lib/types';

const AGENT_ID = 'axiom-001';

export async function POST(request: NextRequest) {
  if (!isInternalAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body: CognitionInput = await request.json();
    const { discoveryResults, cognitiveStage } = body;

    const systemPrompt = getCognitionPrompt(cognitiveStage as CognitiveStage, 'full');
    const compressedState = await compressMindState(AGENT_ID);
    const previousTopics = await getPreviousTopics(AGENT_ID);

    const userMessage = JSON.stringify({
      discoveries: discoveryResults,
      mindState: compressedState,
      previousTopics,
    });

    const response = await callLLM({
      model: process.env.GEMINI_COGNITION_MODEL || 'gemini-2.0-flash',
      maxTokens: 8192,
      systemPrompt,
      userMessage,
    });

    const rawOutput = extractTextFromResponse(response);

    let parsed;
    try {
      const jsonMatch = rawOutput.match(/```json\s*([\s\S]*?)```/) || rawOutput.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : rawOutput;
      parsed = JSON.parse(jsonStr);
    } catch {
      parsed = { raw: rawOutput };
    }

    console.log(`[AXIOM COGNITION] Decision: ${parsed.decision || 'unparsed'}`);

    return NextResponse.json({
      status: 'cognition_complete',
      output: parsed,
      usage: response.usageMetadata || {},
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[AXIOM COGNITION ERROR]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
