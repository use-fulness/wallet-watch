import { fetchWalletBalances } from './providers.js';
import { getPrices, priceOf } from './prices.js';
import { getWallets, getSnapshot, saveSnapshot } from './storage.js';

export function valueOfAssets(assets, prices) {
  return assets.reduce((sum, asset) => sum + asset.amount * priceOf(prices, asset.coingeckoId), 0);
}

export function walletValue(chains, prices) {
  return chains.reduce((sum, chain) => sum + valueOfAssets(chain.assets, prices), 0);
}

export function totalValue(snapshot, prices) {
  return Object.values(snapshot.wallets || {}).reduce(
    (sum, entry) => sum + walletValue(entry.chains || [], prices),
    0
  );
}

async function mapWithLimit(items, limit, worker) {
  const results = new Array(items.length);
  let cursor = 0;
  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor++;
      results[index] = await worker(items[index], index);
    }
  });
  await Promise.all(runners);
  return results;
}

export async function refreshAll({ onlyWalletId = null } = {}) {
  const wallets = await getWallets();
  const targets = onlyWalletId ? wallets.filter((w) => w.id === onlyWalletId) : wallets;
  const [prices, snapshot] = await Promise.all([
    getPrices(true).catch(() => ({})),
    getSnapshot()
  ]);

  const updated = { ...snapshot.wallets };
  await mapWithLimit(targets, 3, async (wallet) => {
    const chains = await fetchWalletBalances(wallet);
    updated[wallet.id] = { chains, at: Date.now() };
  });

  for (const id of Object.keys(updated)) {
    if (!wallets.some((wallet) => wallet.id === id)) delete updated[id];
  }

  const next = { at: Date.now(), wallets: updated };
  await saveSnapshot(next);
  return { snapshot: next, prices };
}
