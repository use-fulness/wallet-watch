import { allCoingeckoIds } from './chains.js';

const PRICE_TTL_MS = 60 * 1000;
const ENDPOINT = 'https://api.coingecko.com/api/v3/simple/price';

let cache = { at: 0, prices: {} };

export async function getPrices(force = false) {
  const fresh = Date.now() - cache.at < PRICE_TTL_MS;
  if (!force && fresh && Object.keys(cache.prices).length) return cache.prices;

  const stored = await chrome.storage.local.get('priceCache');
  if (!force && stored.priceCache && Date.now() - stored.priceCache.at < PRICE_TTL_MS) {
    cache = stored.priceCache;
    return cache.prices;
  }

  const ids = allCoingeckoIds().join(',');
  const url = `${ENDPOINT}?ids=${encodeURIComponent(ids)}&vs_currencies=usd&include_24hr_change=true`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    const prices = {};
    for (const [id, entry] of Object.entries(data)) {
      prices[id] = { usd: entry.usd ?? 0, change24h: entry.usd_24h_change ?? 0 };
    }
    cache = { at: Date.now(), prices };
    await chrome.storage.local.set({ priceCache: cache });
    return prices;
  } catch (error) {
    if (stored.priceCache) return stored.priceCache.prices;
    if (Object.keys(cache.prices).length) return cache.prices;
    throw error;
  }
}

export function priceOf(prices, coingeckoId) {
  const entry = prices[coingeckoId];
  return entry ? entry.usd : 0;
}
