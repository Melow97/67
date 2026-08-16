const ALLOWED_ORIGINS = new Set(['https://67royal.netlify.app','https://67.mel-m-ozturk.workers.dev','http://localhost:5173']);

const SIDEKICK_SYSTEM = `You are 67 Sidekick, the friendly technical and product support assistant for 67 Royale. Help users with sign-in, Google authentication, profiles, posts, reactions, comments, Royale battles, ELO, Crypto, navigation, AI features, and technical problems. Be concise, calm and practical. Give numbered steps when troubleshooting. Never ask for passwords, API keys, recovery codes, payment card numbers, or other secrets. Do not claim to have changed an account or system unless the user has actually done it. If a problem needs human support, say so and explain what information is safe to provide. You are a support agent, not the main 67 AI product.`;

function cors(origin) {
  return {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'Access-Control-Allow-Origin': ALLOWED_ORIGINS.has(origin) ? origin : 'https://67royal.netlify.app',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'X-Content-Type-Options': 'nosniff'
  };
}
function json(statusCode, body, origin) {
  return { statusCode, headers: cors(origin), body: JSON.stringify(body) };
}

exports.handler = async (event) => {
  const origin = event.headers?.origin || '';
  if (event.httpMethod === 'OPTIONS') return json(204, {}, origin);
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' }, origin);

  const openaiKey = process.env.OPENAI_API_KEY;
  if (!openaiKey) {
    console.error('67 Sidekick: OPENAI_API_KEY is missing from Netlify environment variables.');
    return json(503, { error: 'Sidekick AI is not connected yet.' }, origin);
  }

  let payload;
  try { payload = JSON.parse(event.body || '{}'); }
  catch { return json(400, { error: 'Invalid request.' }, origin); }

  const input = typeof payload.input === 'string' ? payload.input.trim().slice(0, 4000) : '';
  if (!input) return json(400, { error: 'Please describe the issue you need help with.' }, origin);

  const messages = Array.isArray(payload.messages) ? payload.messages.slice(-8) : [];
  const safeMessages = messages
    .filter(m => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .map(m => ({ role: m.role, content: m.content.slice(0, 2500) }));
  if (!safeMessages.length || safeMessages[safeMessages.length - 1].role !== 'user') {
    safeMessages.push({ role: 'user', content: input });
  }

  try {
    const aiResponse = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiKey}`
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gpt-5.6',
        instructions: SIDEKICK_SYSTEM,
        input: safeMessages,
        max_output_tokens: 500
      })
    });

    const result = await aiResponse.json().catch(() => ({}));
    if (!aiResponse.ok) {
      console.error('67 Sidekick OpenAI error:', aiResponse.status, JSON.stringify(result));
      return json(502, { error: 'The Sidekick AI service is temporarily unavailable.' }, origin);
    }

    return json(200, { reply: result.output_text || 'I could not generate a response. Please try again.' }, origin);
  } catch (error) {
    console.error('67 Sidekick network error:', error);
    return json(502, { error: 'The Sidekick connection is temporarily unavailable.' }, origin);
  }
};
