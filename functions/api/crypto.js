const CG_BASE = 'https://api.coingecko.com/api/v3';

function json(data, status = 200, cacheSeconds = 300) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': `public, max-age=${cacheSeconds}, s-maxage=${cacheSeconds}`,
      'access-control-allow-origin': '*',
      'x-content-type-options': 'nosniff'
    }
  });
}

async function cg(path, env) {
  const key = env.COINGECKO_DEMO_KEY;
  if (!key) throw new Error('COINGECKO_DEMO_KEY is not configured');
  const response = await fetch(`${CG_BASE}${path}`, {
    headers: { 'x-cg-demo-api-key': key, accept: 'application/json' }
  });
  if (!response.ok) throw new Error(`CoinGecko ${response.status}`);
  return response.json();
}

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const view = url.searchParams.get('view') || 'dashboard';

  try {
    if (view === 'markets') {
      const data = await cg('/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=true&price_change_percentage=1h,24h,7d', env);
      return json({ source: 'coingecko', view, updatedAt: new Date().toISOString(), data });
    }

    if (view === 'trending') {
      const data = await cg('/search/trending', env);
      return json({ source: 'coingecko', view, updatedAt: new Date().toISOString(), data });
    }

    if (view === 'categories') {
      const data = await cg('/coins/categories?order=market_cap_desc', env);
      return json({ source: 'coingecko', view, updatedAt: new Date().toISOString(), data });
    }

    if (view === 'global') {
      const data = await cg('/global', env);
      return json({ source: 'coingecko', view, updatedAt: new Date().toISOString(), data });
    }

    const [global, markets, trending, categories] = await Promise.all([
      cg('/global', env),
      cg('/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=25&page=1&sparkline=true&price_change_percentage=1h,24h,7d', env),
      cg('/search/trending', env),
      cg('/coins/categories?order=market_cap_desc', env)
    ]);

    const gainers = [...markets].sort((a, b) => (b.price_change_percentage_24h ?? -Infinity) - (a.price_change_percentage_24h ?? -Infinity)).slice(0, 10);
    const losers = [...markets].sort((a, b) => (a.price_change_percentage_24h ?? Infinity) - (b.price_change_percentage_24h ?? Infinity)).slice(0, 10);

    return json({
      source: 'coingecko',
      view,
      updatedAt: new Date().toISOString(),
      global: global.data,
      markets,
      trending: trending.coins || [],
      categories,
      gainers,
      losers
    });
  } catch (error) {
    console.error('67 crypto API error', error);
    return json({ error: 'Crypto data temporarily unavailable', detail: error.message }, 502, 30);
  }
}
