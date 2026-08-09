const GROQ_BASE = 'https://api.groq.com/openai/v1/chat/completions';

interface LLMCallParams {
  model: string;
  maxTokens: number;
  systemPrompt: string;
  userMessage: string;
  useWebSearch?: boolean;
}

export async function callLLM(params: LLMCallParams, maxRetries = 2) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY not set');

  const { maxTokens, systemPrompt, userMessage } = params;
  const model = 'llama-3.3-70b-versatile';

  const body = {
    model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
    max_tokens: maxTokens,
    temperature: 0.7,
  };

  for (let i = 0; i <= maxRetries; i++) {
    try {
      const response = await fetch(GROQ_BASE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify(body),
      });

      if (response.status === 429) {
        if (i === maxRetries) {
          const errorText = await response.text();
          throw new Error(`LLM API error 429: ${errorText}`);
        }
        const waitMs = 5000 + (i * 3000);
        console.log(`[AXIOM LLM] Rate limited (429), waiting ${waitMs / 1000}s before retry ${i + 1}/${maxRetries}`);
        await new Promise(r => setTimeout(r, waitMs));
        continue;
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`LLM API error ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (i === maxRetries) throw error;
      await new Promise(r => setTimeout(r, 3000 * (i + 1)));
    }
  }
}

export function extractTextFromResponse(data: Record<string, unknown>): string {
  try {
    // Groq/OpenAI format
    const choices = data.choices as { message: { content: string } }[];
    if (choices?.length && choices[0].message?.content) {
      return choices[0].message.content;
    }
    // Gemini fallback
    const candidates = data.candidates as { content: { parts: { text?: string }[] } }[];
    if (candidates?.length) {
      return candidates[0].content.parts
        .filter(p => p.text)
        .map(p => p.text)
        .join('\n');
    }
    return JSON.stringify(data);
  } catch {
    return JSON.stringify(data);
  }
}
