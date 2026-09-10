import { EVM_CHAINS, NON_EVM_CHAINS } from './chains.js';

const TIMEOUT_MS = 12000;
const BALANCE_OF_SELECTOR = '0x70a08231';
const SOL_TOKEN_PROGRAM = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';
const TON_JETTONS = [
  {
    symbol: 'USDT',
    master: '0:b113a994b5024a16719f69139328eb759596c38a25f59028b146fecdc3621dfe',
    decimals: 6,
    coingeckoId: 'tether'
  }
];

async function request(url, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } finally {
    clearTimeout(timer);
  }
}

function rpc(url, body) {
  return request(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
}

function assertUsableRpcResponse(response, body) {
  const batched = Array.isArray(body);
  if (batched && !Array.isArray(response)) {
    throw new Error('Endpoint rejected the batch request');
  }
  const entries = Array.isArray(response) ? response : [response];
  if (entries.length === 0) throw new Error('Empty response');
  const failed = entries.filter((entry) => entry && entry.error);
  if (failed.length === entries.length) {
    throw new Error(failed[0].error.message || 'RPC error');
  }
  return response;
}

async function rpcWithFallback(urls, body) {
  let lastError;
  for (const url of urls) {
    try {
      return assertUsableRpcResponse(await rpc(url, body), body);
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError || new Error('No RPC endpoint available');
}

export function toDecimal(raw, decimals) {
  let value;
  try {
    value = typeof raw === 'bigint' ? raw : BigInt(raw);
  } catch {
    return 0;
  }
  if (value === 0n) return 0;
  const divisor = 10n ** BigInt(decimals);
  const whole = value / divisor;
  const remainder = value % divisor;
  return Number(whole) + Number(remainder) / Number(divisor);
}

function padAddress(address) {
  return address.toLowerCase().replace('0x', '').padStart(64, '0');
}

async function fetchEvmChain(chain, address) {
  const calls = [
    { jsonrpc: '2.0', id: 0, method: 'eth_getBalance', params: [address, 'latest'] }
  ];
  chain.tokens.forEach((token, index) => {
    calls.push({
      jsonrpc: '2.0',
      id: index + 1,
      method: 'eth_call',
      params: [{ to: token.address, data: BALANCE_OF_SELECTOR + padAddress(address) }, 'latest']
    });
  });

  const response = await rpcWithFallback(chain.rpc, calls);
  const list = Array.isArray(response) ? response : [response];
  const byId = new Map(list.map((entry) => [entry.id, entry]));

  const assets = [];
  const native = byId.get(0);
  if (native && native.result) {
    const amount = toDecimal(native.result, chain.decimals);
    if (amount > 0) {
      assets.push({ symbol: chain.symbol, amount, coingeckoId: chain.coingeckoId, isNative: true });
    }
  }

  chain.tokens.forEach((token, index) => {
    const entry = byId.get(index + 1);
    if (!entry || !entry.result || entry.result === '0x') return;
    const amount = toDecimal(entry.result, token.decimals);
    if (amount > 0) {
      assets.push({ symbol: token.symbol, amount, coingeckoId: token.coingeckoId, isNative: false });
    }
  });

  return assets;
}

async function fetchBitcoin(address) {
  const data = await request(`https://mempool.space/api/address/${address}`);
  const confirmed = BigInt(data.chain_stats.funded_txo_sum) - BigInt(data.chain_stats.spent_txo_sum);
  const pending = BigInt(data.mempool_stats.funded_txo_sum) - BigInt(data.mempool_stats.spent_txo_sum);
  const amount = toDecimal(confirmed + pending, 8);
  return amount > 0 ? [{ symbol: 'BTC', amount, coingeckoId: 'bitcoin', isNative: true }] : [];
}

async function fetchTron(address) {
  const chain = NON_EVM_CHAINS.tron;
  const data = await request(`https://api.trongrid.io/v1/accounts/${address}`);
  const account = data.data && data.data[0];
  if (!account) return [];

  const assets = [];
  const trx = toDecimal(account.balance || 0, 6);
  if (trx > 0) assets.push({ symbol: 'TRX', amount: trx, coingeckoId: 'tron', isNative: true });

  const holdings = new Map();
  for (const entry of account.trc20 || []) {
    for (const [contract, raw] of Object.entries(entry)) holdings.set(contract, raw);
  }
  for (const token of chain.tokens) {
    const raw = holdings.get(token.address);
    if (!raw) continue;
    const amount = toDecimal(raw, token.decimals);
    if (amount > 0) {
      assets.push({ symbol: token.symbol, amount, coingeckoId: token.coingeckoId, isNative: false });
    }
  }
  return assets;
}

async function fetchSolana(address) {
  const chain = NON_EVM_CHAINS.solana;
  const endpoints = ['https://solana-rpc.publicnode.com', 'https://api.mainnet-beta.solana.com'];
  const response = await rpcWithFallback(endpoints, [
    { jsonrpc: '2.0', id: 1, method: 'getBalance', params: [address] },
    {
      jsonrpc: '2.0',
      id: 2,
      method: 'getTokenAccountsByOwner',
      params: [address, { programId: SOL_TOKEN_PROGRAM }, { encoding: 'jsonParsed' }]
    }
  ]);

  const list = Array.isArray(response) ? response : [response];
  const byId = new Map(list.map((entry) => [entry.id, entry]));
  const assets = [];

  const native = byId.get(1);
  if (native && native.result) {
    const amount = toDecimal(native.result.value || 0, 9);
    if (amount > 0) assets.push({ symbol: 'SOL', amount, coingeckoId: 'solana', isNative: true });
  }

  const tokenAccounts = byId.get(2);
  const holdings = new Map();
  for (const account of (tokenAccounts && tokenAccounts.result && tokenAccounts.result.value) || []) {
    const info = account.account.data.parsed.info;
    const previous = holdings.get(info.mint) || 0;
    holdings.set(info.mint, previous + Number(info.tokenAmount.uiAmount || 0));
  }
  for (const token of chain.tokens) {
    const amount = holdings.get(token.address);
    if (amount > 0) {
      assets.push({ symbol: token.symbol, amount, coingeckoId: token.coingeckoId, isNative: false });
    }
  }
  return assets;
}

async function fetchTon(address) {
  const assets = [];
  const balance = await request(`https://toncenter.com/api/v2/getAddressBalance?address=${address}`);
  if (balance.ok) {
    const amount = toDecimal(balance.result || 0, 9);
    if (amount > 0) {
      assets.push({ symbol: 'TON', amount, coingeckoId: 'the-open-network', isNative: true });
    }
  }
  try {
    const jettons = await request(
      `https://toncenter.com/api/v3/jetton/wallets?owner_address=${address}&limit=100`
    );
    for (const wallet of jettons.jetton_wallets || []) {
      const master = (wallet.jetton || '').toLowerCase();
      const known = TON_JETTONS.find((j) => j.master === master);
      if (!known) continue;
      const amount = toDecimal(wallet.balance, known.decimals);
      if (amount > 0) {
        assets.push({ symbol: known.symbol, amount, coingeckoId: known.coingeckoId, isNative: false });
      }
    }
  } catch {
    // jetton lookup is best-effort; native balance still reported
  }
  return assets;
}

async function fetchRipple(address) {
  const endpoints = ['https://xrplcluster.com', 'https://s1.ripple.com:51234'];
  const response = await rpcWithFallback(endpoints, {
    method: 'account_info',
    params: [{ account: address, ledger_index: 'validated' }]
  });
  const data = response.result && response.result.account_data;
  if (!data) return [];
  const amount = toDecimal(data.Balance, 6);
  return amount > 0 ? [{ symbol: 'XRP', amount, coingeckoId: 'ripple', isNative: true }] : [];
}

const BLOCKCYPHER_CODES = { litecoin: 'ltc', dogecoin: 'doge' };

async function fetchUtxoChain(chainId, address) {
  const chain = NON_EVM_CHAINS[chainId];
  let raw = null;

  try {
    const data = await request(
      `https://api.blockcypher.com/v1/${BLOCKCYPHER_CODES[chainId]}/main/addrs/${address}/balance`
    );
    raw = data.final_balance ?? data.balance ?? 0;
  } catch (primaryError) {
    const data = await request(`https://api.blockchair.com/${chainId}/dashboards/address/${address}`);
    const entry = data.data && data.data[address];
    if (!entry) throw primaryError;
    raw = entry.address.balance || 0;
  }

  const amount = toDecimal(raw, chain.decimals);
  return amount > 0
    ? [{ symbol: chain.symbol, amount, coingeckoId: chain.coingeckoId, isNative: true }]
    : [];
}

async function fetchChain(chainId, address) {
  if (EVM_CHAINS[chainId]) return fetchEvmChain(EVM_CHAINS[chainId], address);
  switch (chainId) {
    case 'bitcoin': return fetchBitcoin(address);
    case 'tron': return fetchTron(address);
    case 'solana': return fetchSolana(address);
    case 'ton': return fetchTon(address);
    case 'ripple': return fetchRipple(address);
    case 'litecoin':
    case 'dogecoin': return fetchUtxoChain(chainId, address);
    default: throw new Error(`Unsupported chain: ${chainId}`);
  }
}

export async function fetchWalletBalances(wallet, enabledChains) {
  const targets = wallet.chains.filter((id) => !enabledChains || enabledChains.includes(id));
  const results = await Promise.all(
    targets.map(async (chainId) => {
      const chain = EVM_CHAINS[chainId] || NON_EVM_CHAINS[chainId];
      try {
        const assets = await fetchChain(chainId, wallet.address);
        return { chainId, name: chain.name, symbol: chain.symbol, color: chain.color, assets, error: null };
      } catch (error) {
        return {
          chainId, name: chain.name, symbol: chain.symbol, color: chain.color,
          assets: [], error: error.message || 'Lookup failed'
        };
      }
    })
  );
  return results;
}
