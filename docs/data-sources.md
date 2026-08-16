# 67 Data Intelligence Architecture

67 should not depend on one external provider. The product is designed as a source-aggregation layer with provenance, caching and graceful fallbacks.

## Source matrix

| Surface | Primary source | Secondary / fallback | What 67 extracts |
|---|---|---|---|
| Crypto | CoinGecko | Onchain providers later | prices, market cap, volume, movers, trending, categories, global dominance |
| NFTs | OpenSea | Direct chain/indexer data later | floor, volume, sales, trending collections, activity, traits |
| Streamers | Twitch | YouTube public signals later | live streams, viewers, games, rising creators |
| Gaming | Twitch + game/community sources | Steam / IGDB later | live games, categories, creator activity, releases |
| Internet trends | 67 engagement | public APIs / licensed feeds | velocity, reactions, reposts, battle activity |
| People | Supabase | external identity sources only when justified | profiles, follows, ELO, creator activity |
| AI | 67 AI provider | second model provider later | summaries, explanations, trend synthesis, comparisons |

## Design rules

1. External API keys stay server-side. Never place provider secrets in browser JavaScript.
2. Frontend requests go through `/api/*` endpoints.
3. Provider responses are cached at the edge to reduce cost and rate-limit pressure.
4. Every external data object should retain `source`, `sourceUrl`, `fetchedAt` and provider identifiers where available.
5. A provider outage must not blank the entire page. Show cached data with a stale indicator where possible.
6. 67's own engagement signals should eventually outrank raw external popularity for the 67 Trending score.

## Crypto v1

CoinGecko is the first live source. The `/api/crypto` endpoint supports:

- `view=dashboard`
- `view=markets`
- `view=trending`
- `view=categories`
- `view=global`

The dashboard combines global market state, top markets, 24h gainers, 24h losers, trending searches and categories. The server caches the dashboard for five minutes.

Required server secret:

`COINGECKO_DEMO_KEY`

Do not commit the value to GitHub. Add it as a Cloudflare/Pages or serverless environment secret for the deployment that serves `/api/crypto`.

## Next intelligence layer

The goal is not to clone a market-data website. 67 should calculate a cross-source **Momentum Score** from:

- velocity: how quickly attention is increasing
- volume: market / stream / post activity
- acceleration: whether velocity itself is increasing
- community: 67 reactions, posts and Royale votes
- persistence: whether the trend survives multiple snapshots
- novelty: whether the topic is new rather than permanently popular
- cross-source confirmation: whether multiple independent sources agree

This becomes the foundation for Trend Radar, Royale prompts and 67 AI answers.
