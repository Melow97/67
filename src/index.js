const SUPABASE_URL = 'https://pbokbnixktqmmtigehul.supabase.co';

function json(body, status = 200, origin = '*') {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'access-control-allow-origin': origin,
      'access-control-allow-headers': 'Content-Type, Authorization',
      'access-control-allow-methods': 'POST, OPTIONS'
    }
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin') || '*';

    if (request.method === 'OPTIONS') return json({}, 204, origin);
    if (url.pathname === '/health') return json({ ok: true, service: '67-royal', environment: 'cloudflare' }, 200, origin);

    if (url.pathname === '/api/ai') {
      if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405, origin);
      const authorization = request.headers.get('Authorization') || '';
      if (!authorization.startsWith('Bearer ')) return json({ error: 'Sign in required' }, 401, origin);
      if (!env.GROQ_API_KEY) return json({ error: 'AI provider is not configured' }, 503, origin);
      const userResponse = await fetch(`${SUPABASE_URL}/auth/v1/user`, { headers: { Authorization: authorization, apikey: env.SUPABASE_PUBLISHABLE_KEY || '' } });
      if (!userResponse.ok) return json({ error: 'Invalid or expired session' }, 401, origin);
      let payload;
      try { payload = await request.json(); } catch { return json({ error: 'Invalid JSON' }, 400, origin); }
      const input = typeof payload.input === 'string' ? payload.input.trim() : '';
      if (!input || input.length > 4000) return json({ error: 'Input must be between 1 and 4000 characters' }, 400, origin);
      const messages = Array.isArray(payload.messages) ? payload.messages.slice(-10) : [];
      const safeMessages = messages.filter(m => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string').map(m => ({ role: m.role, content: m.content.slice(0, 4000) }));
      if (!safeMessages.length || safeMessages[safeMessages.length - 1].role !== 'user') safeMessages.push({ role: 'user', content: input });
      const aiResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'content-type': 'application/json', Authorization: `Bearer ${env.GROQ_API_KEY}` },
        body: JSON.stringify({ model: env.GROQ_MODEL || 'openai/gpt-oss-20b', messages: [{ role: 'system', content: 'You are 67 AI, the fast meme-culture assistant inside 67 Royale. Be concise, playful, useful, and distinguish guesses from facts.' }, ...safeMessages], temperature: 0.7, max_tokens: 700 })
      });
      const result = await aiResponse.json().catch(() => ({}));
      if (!aiResponse.ok) return json({ error: result?.error?.message || 'AI provider request failed' }, 502, origin);
      return json({ reply: result?.choices?.[0]?.message?.content || '', model: result?.model || env.GROQ_MODEL || 'openai/gpt-oss-20b' }, 200, origin);
    }

    return env.ASSETS.fetch(request);
  }
};
