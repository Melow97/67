const ALLOWED_ORIGINS = new Set(['https://67royal.netlify.app','http://localhost:5173']);

function json(statusCode, body, origin) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
      'Access-Control-Allow-Origin': ALLOWED_ORIGINS.has(origin) ? origin : 'https://67royal.netlify.app',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'POST, OPTIONS'
    },
    body: JSON.stringify(body)
  };
}

exports.handler = async (event) => {
  const origin = event.headers?.origin || '';
  if (event.httpMethod === 'OPTIONS') return json(204, {}, origin);
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' }, origin);

  const auth = event.headers?.authorization || event.headers?.Authorization || '';
  if (!auth.startsWith('Bearer ')) return json(401, { error: 'Sign in required' }, origin);

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_PUBLISHABLE_KEY;
  const groqKey = process.env.GROQ_API_KEY;
  if (!supabaseUrl || !supabaseKey) return json(500, { error: 'Supabase server configuration is missing' }, origin);
  if (!groqKey) return json(503, { error: 'AI provider is not connected yet. Add GROQ_API_KEY in Netlify environment variables.' }, origin);

  const token = auth.slice(7);
  const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: { Authorization: `Bearer ${token}`, apikey: supabaseKey }
  });
  if (!userResponse.ok) return json(401, { error: 'Invalid or expired session' }, origin);

  let payload;
  try { payload = JSON.parse(event.body || '{}'); } catch { return json(400, { error: 'Invalid JSON' }, origin); }
  const input = typeof payload.input === 'string' ? payload.input.trim() : '';
  if (!input || input.length > 4000) return json(400, { error: 'Input must be between 1 and 4000 characters' }, origin);

  const messages = Array.isArray(payload.messages) ? payload.messages.slice(-10) : [];
  const safeMessages = messages
    .filter(m => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .map(m => ({ role: m.role, content: m.content.slice(0, 4000) }));
  if (!safeMessages.length || safeMessages[safeMessages.length - 1].role !== 'user') safeMessages.push({ role: 'user', content: input });

  const aiResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${groqKey}` },
    body: JSON.stringify({
      model: process.env.GROQ_MODEL || 'openai/gpt-oss-20b',
      messages: [
        { role: 'system', content: 'You are 67 AI, the fast meme-culture assistant inside 67 Royale. Be concise, current when supplied with current context, playful without being abusive, and clearly distinguish guesses from facts.' },
        ...safeMessages
      ],
      temperature: 0.7,
      max_tokens: 700
    })
  });
  const result = await aiResponse.json().catch(() => ({}));
  if (!aiResponse.ok) return json(502, { error: result?.error?.message || 'AI provider request failed' }, origin);
  return json(200, { reply: result?.choices?.[0]?.message?.content || '', model: result?.model || process.env.GROQ_MODEL || 'openai/gpt-oss-20b' }, origin);
};
