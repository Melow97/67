const money67 = value => {
  if (value == null || Number.isNaN(Number(value))) return '—';
  const n = Number(value);
  if (Math.abs(n) >= 1e12) return '$' + (n / 1e12).toFixed(2) + 'T';
  if (Math.abs(n) >= 1e9) return '$' + (n / 1e9).toFixed(2) + 'B';
  if (Math.abs(n) >= 1e6) return '$' + (n / 1e6).toFixed(2) + 'M';
  if (Math.abs(n) >= 1e3) return '$' + (n / 1e3).toFixed(2) + 'K';
  return '$' + n.toLocaleString(undefined, { maximumFractionDigits: 6 });
};

const pct67 = value => {
  if (value == null || Number.isNaN(Number(value))) return '—';
  const n = Number(value);
  return `${n >= 0 ? '+' : ''}${n.toFixed(2)}%`;
};

function cryptoRow67(coin) {
  const change = coin.price_change_percentage_24h;
  const cls = Number(change) >= 0 ? 'cryptoUp' : 'cryptoDown';
  return `<div class="cryptoRow67">
    <div class="cryptoRank67">${coin.market_cap_rank ?? '—'}</div>
    <img src="${coin.image || ''}" alt="" loading="lazy" width="32" height="32">
    <div class="cryptoName67"><b>${coin.name}</b><small>${String(coin.symbol || '').toUpperCase()}</small></div>
    <div class="cryptoPrice67"><b>${money67(coin.current_price)}</b><span class="${cls}">${pct67(change)}</span></div>
    <div class="cryptoCap67">${money67(coin.market_cap)}</div>
  </div>`;
}

async function load67CryptoDashboard() {
  const root = document.getElementById('cryptoDashboard');
  if (!root) return;
  root.innerHTML = '<div class="cryptoLoading67">Loading live market intelligence…</div>';
  try {
    const response = await fetch('/api/crypto?view=dashboard', { headers: { accept: 'application/json' } });
    if (!response.ok) throw new Error('Crypto API unavailable');
    const payload = await response.json();
    const markets = payload.markets || [];
    const global = payload.global || {};
    const trending = payload.trending || [];
    const gainers = payload.gainers || [];
    const losers = payload.losers || [];

    root.innerHTML = `
      <div class="cryptoHero67">
        <div><span class="cryptoEyebrow67">LIVE MARKET INTELLIGENCE</span><h2>Crypto, right now.</h2><p>Prices, market momentum, movers and what the crypto crowd is searching for.</p></div>
        <div class="cryptoStats67">
          <div><small>Total market cap</small><b>${money67(global.total_market_cap?.usd)}</b></div>
          <div><small>24h volume</small><b>${money67(global.total_volume?.usd)}</b></div>
          <div><small>BTC dominance</small><b>${global.market_cap_percentage?.btc ? Number(global.market_cap_percentage.btc).toFixed(1) + '%' : '—'}</b></div>
        </div>
      </div>
      <div class="cryptoGrid67">
        <section class="cryptoPanel67"><div class="cryptoTitle67"><b>Top markets</b><span>Market cap</span></div>${markets.slice(0, 12).map(cryptoRow67).join('')}</section>
        <section class="cryptoPanel67"><div class="cryptoTitle67"><b>🔥 Gainers</b><span>24h</span></div>${gainers.map(cryptoRow67).join('')}</section>
        <section class="cryptoPanel67"><div class="cryptoTitle67"><b>📉 Losers</b><span>24h</span></div>${losers.map(cryptoRow67).join('')}</section>
        <section class="cryptoPanel67"><div class="cryptoTitle67"><b>🧠 Crypto searches</b><span>Trending</span></div>${trending.slice(0, 10).map((item, i) => `<div class="trendCoin67"><span>${i + 1}</span><img src="${item.item?.thumb || ''}" width="28" height="28" alt=""><b>${item.item?.name || 'Unknown'}</b><small>${String(item.item?.symbol || '').toUpperCase()}</small></div>`).join('')}</section>
      </div>
      <div class="cryptoFooter67">Data supplied by CoinGecko · refreshed through 67's server-side cache · market data is informational, not financial advice.</div>`;
  } catch (error) {
    console.error(error);
    root.innerHTML = '<div class="cryptoError67">Live crypto data is temporarily unavailable. 67 will retry automatically.</div>';
  }
}

document.addEventListener('DOMContentLoaded', load67CryptoDashboard);
