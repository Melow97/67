const ALLOWED_ORIGINS = new Set(['https://67royal.netlify.app']);

function response(body, status, origin) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
      'Access-Control-Allow-Origin': ALLOWED_ORIGINS.has(origin) ? origin : 'https://67royal.netlify.app',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'POST, OPTIONS'
    }
  });
}

export async function onRequestPost(context) {
  const origin = context.request.headers.get('Origin') || '';
  const auth = context.request.headers.get('Authorization') || '';
  if (!auth.startsWith('Bearer ')) return response({ error: 'Sign in required' }, 401, origin);

  const supabaseUrl = context.env.SUPABASE_URL;
  const supabaseKey = context.env.SUPABASE_PUBLISHABLE_KEY;
  const groqKey = context.env.GROQ_API_KEY;
  if (!supabaseUrl || !supabaseKey) return response({ error: 'Supabase server configuration is missing' }, 500, origin);
  if (!groqKey) return response({ error: 'AI provider is not connected yet.' }, 503, origin);

  const token = auth.slice(7);
  const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: { Authorization: `Bearer ${token}`, apikey: supabaseKey }
  });
  if (!userResponse.ok) return response({ error: 'Invalid or expired session' }, 401, origin);

  let payload;
  try { payload = await context.request.json(); } catch { return response({ error: 'Invalid JSON' }, 400, origin); }
  const input = typeof payload.input === 'string' ? payload.input.trim() : '';
  if (!input || input.length > 4000) return response({ error: 'Input must be between 1 and 4000 characters' }, 400, origin);

  const messages = Array.isArray(payload.messages) ? payload.messages.slice(-10) : [];
  const safeMessages = messages
    .filter(m => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .map(m => ({ role: m.role, content: m.content.slice(0, 4000) }));
  if (!safeMessages.length || safeMessages[safeMessages.length - 1].role !== 'user') safeMessages.push({ role: 'user', content: input });

  const aiResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${groqKey}` },
    body: JSON.stringify({
      model: context.env.GROQ_MODEL || 'openai/gpt-oss-20b',
      messages: [
        { role: 'system', content: 'You are 67 AI, the fast meme-culture assistant inside 67 Royale. Be concise, current when supplied with current context, playful without being abusive, and clearly distinguish guesses from facts.' },
        ...safeMessages
      ],
      temperature: 0.7,
      max_tokens: 700
    })
  });
  const result = await aiResponse.json().catch(() => ({}));
  if (!aiResponse.ok) return response({ error: result?.error?.message || 'AI provider request failed' }, 502, origin);
  return response({ reply: result?.choices?.[0]?.message?.content || '', model: result?.model || context.env.GROQ_MODEL || 'openai/gpt-oss-20b' }, 200, origin);
}

export async function onRequestOptions(context) {
  return response({}, 204, context.request.headers.get('Origin') || '');
}
