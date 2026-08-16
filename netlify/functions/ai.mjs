const MODEL = process.env.HF_MODEL || 'openai/gpt-oss-120b:fastest';

export default async (req) => {
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });
  if (!process.env.HF_TOKEN) return Response.json({ error: 'AI provider is not configured yet.' }, { status: 503 });

  try {
    const body = await req.json();
    const query = String(body?.query || '').trim().slice(0, 2000);
    if (!query) return Response.json({ error: 'Query is required.' }, { status: 400 });

    const system = `You are 67 AI, the fast cultural intelligence assistant inside 67 Royale. Explain internet culture, memes, slang, gaming, streamers, crypto and NFTs clearly and briefly. Never invent live facts. If current data is not supplied, say that the answer is based on available context and may be stale. Keep the tone sharp, modern and concise. Do not provide financial advice.`;
    const response = await fetch('https://router.huggingface.co/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.HF_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: 'system', content: system }, { role: 'user', content: query }],
        temperature: 0.4,
        max_tokens: 500
      })
    });

    if (!response.ok) return Response.json({ error: 'AI provider request failed.' }, { status: 502 });
    const data = await response.json();
    return Response.json({ answer: data?.choices?.[0]?.message?.content || '67 AI had no answer.' });
  } catch {
    return Response.json({ error: 'Unable to reach 67 AI.' }, { status: 500 });
  }
};
