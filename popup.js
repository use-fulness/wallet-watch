import { ALL_CHAINS } from './lib/chains.js';
import { detectChains, normalizeAddress } from './lib/detect.js';
import { getPrices, priceOf } from './lib/prices.js';
import { getWallets, saveWallets, getSettings, saveSettings, getSnapshot } from './lib/storage.js';
import { walletValue } from './lib/portfolio.js';

const STABLES = new Set(['USDT', 'USDC', 'USDC.e', 'USDT.e', 'DAI', 'BUSD', 'USDD']);

const el = (id) => document.getElementById(id);
const listEl = el('wallet-list');

let state = {
  wallets: [],
  snapshot: { at: 0, wallets: {} },
  prices: {},
  settings: {},
  expanded: new Set(),
  editing: null,
  selectedChains: new Set(),
  refreshing: false
};

/* ---------- formatting ---------- */

function money(value) {
  if (!Number.isFinite(value)) return '$0.00';
  if (value >= 1000) return `$${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
  if (value >= 1) return `$${value.toFixed(2)}`;
  if (value > 0) return `$${value.toFixed(4)}`;
  return '$0.00';
}

function quantity(amount) {
  if (amount === 0) return '0';
  if (amount >= 1000) return amount.toLocaleString('en-US', { maximumFractionDigits: 2 });
  if (amount >= 1) return amount.toFixed(4).replace(/\.?0+$/, '');
  return amount.toFixed(8).replace(/\.?0+$/, '');
}

function shortAddress(address) {
  return address.length > 20 ? `${address.slice(0, 10)}…${address.slice(-8)}` : address;
}

function timeAgo(timestamp) {
  if (!timestamp) return 'never';
  const seconds = Math.round((Date.now() - timestamp) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

/* ---------- rendering ---------- */

function visibleAssets(assets) {
  if (!state.settings.hideDust) return assets;
  return assets.filter((asset) => {
    const value = asset.amount * priceOf(state.prices, asset.coingeckoId);
    return value >= state.settings.dustThreshold;
  });
}

function assetRow(asset) {
  const price = priceOf(state.prices, asset.coingeckoId);
  const value = asset.amount * price;
  const change = state.prices[asset.coingeckoId]?.change24h ?? 0;
  const changeClass = change >= 0 ? 'up' : 'down';
  const stable = STABLES.has(asset.symbol) ? ' stable' : '';

  const row = document.createElement('div');
  row.className = 'asset';
  row.innerHTML = `
    <div class="asset-left">
      <span class="asset-sym${stable}"></span>
      <span class="asset-qty"></span>
    </div>
    <div>
      <span class="asset-usd"></span>
      <span class="asset-chg ${changeClass}"></span>
    </div>`;
  row.querySelector('.asset-sym').textContent = asset.symbol;
  row.querySelector('.asset-qty').textContent = quantity(asset.amount);
  row.querySelector('.asset-usd').textContent = money(value);
  row.querySelector('.asset-chg').textContent = price ? `${change >= 0 ? '+' : ''}${change.toFixed(1)}%` : '';
  return row;
}

async function commitRename(wallet, value) {
  if (state.editing !== wallet.id) return;
  state.editing = null;
  const label = value.trim().slice(0, 40);
  if (label && label !== wallet.label) {
    wallet.label = label;
    await saveWallets(state.wallets);
  }
  renderWallets();
}

function cancelRename() {
  state.editing = null;
  renderWallets();
}

function walletCard(wallet) {
  const entry = state.snapshot.wallets[wallet.id];
  const chains = entry?.chains || [];
  const value = walletValue(chains, state.prices);
  const isOpen = state.expanded.has(wallet.id);
  const loaded = Boolean(entry);

  const chainsWithAssets = chains.filter((chain) => visibleAssets(chain.assets).length > 0);
  const errored = chains.filter((chain) => chain.error);

  const card = document.createElement('div');
  card.className = `wallet${isOpen ? ' open' : ''}`;

  const head = document.createElement('div');
  head.className = 'wallet-head';
  head.innerHTML = `
    <div class="wallet-id">
      <div class="wallet-label"></div>
      <div class="wallet-addr"></div>
    </div>
    <div class="wallet-amount">
      <div class="wallet-usd"></div>
      <div class="wallet-sub"></div>
    </div>
    <svg class="caret" viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg>`;
  head.querySelector('.wallet-label').textContent = wallet.label;
  head.querySelector('.wallet-addr').textContent = shortAddress(wallet.address);

  if (state.editing === wallet.id) {
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'label-input';
    input.value = wallet.label;
    input.maxLength = 40;
    input.setAttribute('aria-label', 'Wallet name');
    input.addEventListener('click', (event) => event.stopPropagation());
    input.addEventListener('keydown', (event) => {
      event.stopPropagation();
      if (event.key === 'Enter') commitRename(wallet, input.value);
      else if (event.key === 'Escape') cancelRename();
    });
    input.addEventListener('blur', () => commitRename(wallet, input.value));
    head.querySelector('.wallet-label').replaceWith(input);
    requestAnimationFrame(() => { input.focus(); input.select(); });
  }

  if (loaded) {
    head.querySelector('.wallet-usd').textContent = money(value);
    const count = chainsWithAssets.reduce((sum, chain) => sum + visibleAssets(chain.assets).length, 0);
    head.querySelector('.wallet-sub').textContent =
      count === 0 ? 'empty' : `${count} asset${count === 1 ? '' : 's'}`;
  } else {
    const skeleton = document.createElement('div');
    skeleton.className = 'skeleton';
    skeleton.style.width = '64px';
    head.querySelector('.wallet-usd').append(skeleton);
  }

  head.addEventListener('click', () => {
    if (state.expanded.has(wallet.id)) state.expanded.delete(wallet.id);
    else state.expanded.add(wallet.id);
    renderWallets();
  });
  card.append(head);

  if (!isOpen) return card;

  const body = document.createElement('div');
  body.className = 'wallet-body';

  if (!loaded) {
    const pending = document.createElement('div');
    pending.className = 'chain-empty';
    pending.textContent = 'Loading balances…';
    body.append(pending);
  } else if (chainsWithAssets.length === 0 && errored.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'chain-empty';
    empty.textContent = state.settings.hideDust
      ? 'No balances above the dust threshold.'
      : 'No balances found.';
    body.append(empty);
  }

  for (const chain of chainsWithAssets) {
    const block = document.createElement('div');
    block.className = 'chain-block';
    const title = document.createElement('div');
    title.className = 'chain-name';
    title.innerHTML = '<span class="dot"></span>';
    title.querySelector('.dot').style.background = chain.color;
    title.append(document.createTextNode(chain.name));
    block.append(title);

    const assets = visibleAssets(chain.assets).sort((a, b) => {
      const av = a.amount * priceOf(state.prices, a.coingeckoId);
      const bv = b.amount * priceOf(state.prices, b.coingeckoId);
      return bv - av;
    });
    for (const asset of assets) block.append(assetRow(asset));
    body.append(block);
  }

  if (errored.length) {
    const warn = document.createElement('div');
    warn.className = 'chain-error';
    warn.textContent = `Couldn't reach: ${errored.map((chain) => chain.name).join(', ')}`;
    body.append(warn);
  }

  const tools = document.createElement('div');
  tools.className = 'wallet-tools';

  const renameBtn = document.createElement('button');
  renameBtn.className = 'tool';
  renameBtn.textContent = 'Rename';
  renameBtn.addEventListener('click', (event) => {
    event.stopPropagation();
    state.editing = wallet.id;
    renderWallets();
  });

  const copyBtn = document.createElement('button');
  copyBtn.className = 'tool';
  copyBtn.textContent = 'Copy';
  copyBtn.addEventListener('click', async (event) => {
    event.stopPropagation();
    await navigator.clipboard.writeText(wallet.address);
    copyBtn.textContent = 'Copied';
    setTimeout(() => { copyBtn.textContent = 'Copy'; }, 1200);
  });

  const explorerBtn = document.createElement('button');
  explorerBtn.className = 'tool';
  explorerBtn.textContent = 'Explorer';
  explorerBtn.addEventListener('click', (event) => {
    event.stopPropagation();
    const primary = ALL_CHAINS[wallet.chains[0]];
    if (primary) chrome.tabs.create({ url: primary.explorer + wallet.address });
  });

  const removeBtn = document.createElement('button');
  removeBtn.className = 'tool danger';
  removeBtn.textContent = 'Remove';
  removeBtn.addEventListener('click', async (event) => {
    event.stopPropagation();
    state.wallets = state.wallets.filter((item) => item.id !== wallet.id);
    state.expanded.delete(wallet.id);
    await saveWallets(state.wallets);
    render();
    triggerRefresh();
  });

  tools.append(renameBtn, copyBtn, explorerBtn, removeBtn);
  body.append(tools);
  card.append(body);
  return card;
}

function renderWallets() {
  listEl.textContent = '';
  if (state.wallets.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'empty';
    empty.innerHTML = `
      <div class="empty-mark">◎</div>
      <p>No wallets tracked yet.<br />Add a public address to watch its balance.</p>`;
    listEl.append(empty);
    return;
  }
  const sorted = [...state.wallets].sort((a, b) => {
    const av = walletValue(state.snapshot.wallets[a.id]?.chains || [], state.prices);
    const bv = walletValue(state.snapshot.wallets[b.id]?.chains || [], state.prices);
    return bv - av;
  });
  for (const wallet of sorted) listEl.append(walletCard(wallet));
}

function renderTotals() {
  const total = state.wallets.reduce(
    (sum, wallet) => sum + walletValue(state.snapshot.wallets[wallet.id]?.chains || [], state.prices),
    0
  );
  el('total-value').textContent = money(total);

  const stableTotal = state.wallets.reduce((sum, wallet) => {
    const chains = state.snapshot.wallets[wallet.id]?.chains || [];
    return sum + chains.reduce((chainSum, chain) => chainSum + chain.assets.reduce(
      (assetSum, asset) => assetSum + (asset.symbol.startsWith('USDT')
        ? asset.amount * priceOf(state.prices, asset.coingeckoId)
        : 0),
      0
    ), 0);
  }, 0);

  const count = state.wallets.length;
  el('total-meta').textContent = count === 0
    ? 'No wallets yet'
    : `${count} wallet${count === 1 ? '' : 's'}${stableTotal > 0 ? ` · ${money(stableTotal)} in USDT` : ''}`;

  el('stamp').textContent = state.snapshot.at ? `Updated ${timeAgo(state.snapshot.at)}` : '';
}

function render() {
  renderTotals();
  renderWallets();
}

/* ---------- add wallet form ---------- */

function renderDetection(address) {
  const output = el('detect-output');
  output.textContent = '';
  const saveBtn = el('btn-save-wallet');

  if (!address) {
    output.innerHTML = '<span class="detect-hint">Paste an address to detect its networks.</span>';
    saveBtn.disabled = true;
    return;
  }

  const { family, chains } = detectChains(address);
  if (!family) {
    output.innerHTML = '<span class="detect-bad">Unrecognized address format.</span>';
    saveBtn.disabled = true;
    state.selectedChains = new Set();
    return;
  }

  state.selectedChains = new Set(chains);
  for (const chainId of chains) {
    const chain = ALL_CHAINS[chainId];
    const chip = document.createElement('button');
    chip.className = 'chip';
    chip.type = 'button';
    chip.setAttribute('aria-pressed', 'true');
    chip.innerHTML = '<span class="dot"></span>';
    chip.querySelector('.dot').style.background = chain.color;
    chip.append(document.createTextNode(chain.name));
    chip.addEventListener('click', () => {
      if (state.selectedChains.has(chainId)) state.selectedChains.delete(chainId);
      else state.selectedChains.add(chainId);
      chip.setAttribute('aria-pressed', String(state.selectedChains.has(chainId)));
      el('btn-save-wallet').disabled = state.selectedChains.size === 0;
    });
    output.append(chip);
  }
  saveBtn.disabled = false;
}

function openAddPanel(open) {
  el('panel-add').hidden = !open;
  if (open) {
    el('panel-settings').hidden = true;
    el('add-error').hidden = true;
    el('input-label').value = '';
    el('input-address').value = '';
    renderDetection('');
    el('input-label').focus();
  }
}

async function saveWallet() {
  const address = normalizeAddress(el('input-address').value);
  const { family } = detectChains(address);
  const errorEl = el('add-error');

  if (!family || state.selectedChains.size === 0) {
    errorEl.textContent = 'Pick at least one network for this address.';
    errorEl.hidden = false;
    return;
  }
  if (state.wallets.some((wallet) => wallet.address.toLowerCase() === address.toLowerCase())) {
    errorEl.textContent = 'That address is already being tracked.';
    errorEl.hidden = false;
    return;
  }

  const label = el('input-label').value.trim() || shortAddress(address);
  const wallet = {
    id: crypto.randomUUID(),
    label,
    address,
    family,
    chains: [...state.selectedChains],
    createdAt: Date.now()
  };

  state.wallets.push(wallet);
  await saveWallets(state.wallets);
  state.expanded.add(wallet.id);
  openAddPanel(false);
  render();
  triggerRefresh();
}

/* ---------- settings ---------- */

function bindSettings() {
  el('set-refresh').value = String(state.settings.autoRefreshMinutes);
  el('set-dust').checked = state.settings.hideDust;
  el('set-threshold').value = state.settings.dustThreshold;
  el('set-badge').checked = state.settings.showBadge;

  el('set-refresh').addEventListener('change', async (event) => {
    state.settings = await saveSettings({ autoRefreshMinutes: Number(event.target.value) });
    chrome.runtime.sendMessage({ type: 'reschedule' });
  });
  el('set-dust').addEventListener('change', async (event) => {
    state.settings = await saveSettings({ hideDust: event.target.checked });
    render();
  });
  el('set-threshold').addEventListener('change', async (event) => {
    state.settings = await saveSettings({ dustThreshold: Math.max(0, Number(event.target.value) || 0) });
    render();
  });
  el('set-badge').addEventListener('change', async (event) => {
    state.settings = await saveSettings({ showBadge: event.target.checked });
    chrome.runtime.sendMessage({ type: 'reschedule' });
  });
}

/* ---------- refresh ---------- */

function triggerRefresh() {
  if (state.refreshing) return;
  state.refreshing = true;
  el('btn-refresh').classList.add('spinning');

  chrome.runtime.sendMessage({ type: 'refresh' }, async (response) => {
    state.refreshing = false;
    el('btn-refresh').classList.remove('spinning');
    if (chrome.runtime.lastError || !response || !response.ok) {
      state.snapshot = await getSnapshot();
      render();
      return;
    }
    state.snapshot = response.snapshot;
    if (response.prices && Object.keys(response.prices).length) state.prices = response.prices;
    render();
  });
}

/* ---------- boot ---------- */

async function init() {
  const [wallets, snapshot, settings] = await Promise.all([
    getWallets(), getSnapshot(), getSettings()
  ]);
  state.wallets = wallets;
  state.snapshot = snapshot;
  state.settings = settings;
  state.prices = await getPrices().catch(() => ({}));

  bindSettings();
  render();

  el('btn-add').addEventListener('click', () => openAddPanel(el('panel-add').hidden));
  el('btn-cancel-add').addEventListener('click', () => openAddPanel(false));
  el('btn-save-wallet').addEventListener('click', saveWallet);
  el('btn-refresh').addEventListener('click', triggerRefresh);
  el('btn-settings').addEventListener('click', () => {
    const panel = el('panel-settings');
    panel.hidden = !panel.hidden;
    if (!panel.hidden) el('panel-add').hidden = true;
  });

  el('input-address').addEventListener('input', (event) => {
    el('add-error').hidden = true;
    renderDetection(normalizeAddress(event.target.value));
  });
  el('input-address').addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !el('btn-save-wallet').disabled) saveWallet();
  });

  if (wallets.length && Date.now() - snapshot.at > 60_000) triggerRefresh();
}

init();
