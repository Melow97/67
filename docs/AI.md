# 67 AI

67 uses a server-side Netlify Function as the AI gateway. The browser never receives the provider API key.

## Current provider

The first provider is Groq because its API is OpenAI-compatible and optimized for fast inference. The gateway defaults to `openai/gpt-oss-20b` and can be changed with `GROQ_MODEL`.

## Netlify environment variables

Set these in Netlify site settings, not GitHub:

- `GROQ_API_KEY` — required for live AI requests
- `GROQ_MODEL` — optional; defaults to `openai/gpt-oss-20b`
- `SUPABASE_URL` — `https://pbokbnixktqmmtigehul.supabase.co`
- `SUPABASE_PUBLISHABLE_KEY` — the public/publishable Supabase key used by the browser app

Never commit provider keys or Supabase service-role keys.

## Client

Load `js/ai.js` after `js/supabase.js`, then call:

```js
const result = await ask67AI('Explain this meme');
console.log(result.reply);
```

The endpoint requires a valid Supabase access token. It is available at `/.netlify/functions/ai`.

## Architecture

Browser → Supabase Auth session → Netlify `/ai` function → Groq → browser.

The provider can later be swapped for another OpenAI-compatible provider without exposing credentials or rewriting the UI.
