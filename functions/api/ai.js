const ALLOWED_ORIGINS = new Set(['https://67royal.netlify.app','https://67.mel-m-ozturk.workers.dev']);

function response(body, status, origin) {
  const allowed = ALLOWED_ORIGINS.has(origin) ? origin : 'https://67.mel-m-ozturk.workers.dev';
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'Access-Control-Allow-Origin': allowed,
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'X-Content-Type-Options': 'nosniff'
    }
  });
}

const SIDEKICK_SYSTEM = `You are 67 Sidekick, the friendly technical and product support assistant for 67 Royale. Help users with sign-in, Google authentication, profiles, posts, reactions, comments, Royale battles, ELO, Crypto, navigation, AI features, and technical problems. Be concise, calm and practical. Give numbered steps when troubleshooting. Never ask for passwords, API keys, recovery codes, payment card numbers, or other secrets. Do not claim to have changed an account or system unless the user has actually done it. If a problem needs human support, say so and explain what information is safe to provide. You are a support agent, not the main 67 AI product.`;

export async function onRequestPost(context) {
  const origin = context.request.headers.get('Origin') || '';
  const openaiKey = context.env.OPENAI_API_KEY;
  if (!openaiKey) return response({ error: 'Sidekick AI is not connected yet.' }, 503, origin);

  let payload;
  try { payload = await context.request.json(); } catch { return response({ error: 'Invalid JSON' }, 400, origin); }
  const input = typeof payload.input === 'string' ? payload.input.trim().slice(0, 4000) : '';
  if (!input) return response({ error: 'Please describe the issue you need help with.' }, 400, origin);

  const messages = Array.isArray(payload.messages) ? payload.messages.slice(-8) : [];
  const safeMessages = messages
    .filter(m => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .map(m => ({ role: m.role, content: m.content.slice(0, 2500) }));
  if (!safeMessages.length || safeMessages[safeMessages.length - 1].role !== 'user') safeMessages.push({ role: 'user', content: input });

  const aiResponse = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${openaiKey}` },
    body: JSON.stringify({
      model: context.env.OPENAI_MODEL || 'gpt-5.6',
      instructions: SIDEKICK_SYSTEM,
      input: safeMessages,
      max_output_tokens: 500
    })
  });
  const result = await aiResponse.json().catch(() => ({}));
  if (!aiResponse.ok) {
    console.error('67 Sidekick OpenAI error', aiResponse.status, result);
    return response({ error: 'The Sidekick AI service is temporarily unavailable.' }, 502, origin);
  }
  return response({ reply: result?.output_text || 'I could not generate a response. Please try again.' }, 200, origin);
}

export async function onRequestOptions(context) {
  return response({}, 204, context.request.headers.get('Origin') || '');
}
