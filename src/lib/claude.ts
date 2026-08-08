const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

interface GeminiCallParams {
  model: string;
  maxTokens: number;
  systemPrompt: string;
  userMessage: string;
  useWebSearch?: boolean;
}

export async function callLLM(params: GeminiCallParams, maxRetries = 3) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY not set');

  const { model, maxTokens, systemPrompt, userMessage, useWebSearch } = params;

  const body: Record<string, unknown> = {
    system_instruction: { parts: [{ text: systemPrompt }] },
    contents: [{ role: 'user', parts: [{ text: userMessage }] }],
    generationConfig: { maxOutputTokens: maxTokens },
  };

  if (useWebSearch) {
    body.tools = [{ google_search: {} }];
  }

  for (let i = 0; i <= maxRetries; i++) {
    try {
      const response = await fetch(
        `${GEMINI_BASE}/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        },
      );

      if (response.status === 429) {
        if (i === maxRetries) {
          const errorText = await response.text();
          throw new Error(`Gemini API error 429: ${errorText}`);
        }
        // Wait before retry — cap at 20s to stay within Vercel's 60s function timeout
        const waitMs = 20000;
        console.log(`[AXIOM LLM] Rate limited (429), waiting ${waitMs / 1000}s before retry ${i + 1}/${maxRetries}`);
        await new Promise(r => setTimeout(r, waitMs));
        continue;
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API error ${response.status}: ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      if (i === maxRetries) throw error;
      if (error instanceof Error && error.message.includes('429')) {
        await new Promise(r => setTimeout(r, 60000));
      } else {
        await new Promise(r => setTimeout(r, 3000 * (i + 1)));
      }
    }
  }
}

export function extractTextFromResponse(data: Record<string, unknown>): string {
  try {
    const candidates = data.candidates as { content: { parts: { text?: string }[] } }[];
    if (!candidates?.length) return '';
    return candidates[0].content.parts
      .filter(p => p.text)
      .map(p => p.text)
      .join('\n');
  } catch {
    return JSON.stringify(data);
  }
}
