export const EVM_CHAINS = {
  ethereum: {
    id: 'ethereum',
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18,
    coingeckoId: 'ethereum',
    color: '#8ba1f5',
    rpc: ['https://ethereum-rpc.publicnode.com', 'https://rpc.mevblocker.io', 'https://eth.merkle.io'],
    explorer: 'https://etherscan.io/address/',
    tokens: [
      { symbol: 'USDT', address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', decimals: 6, coingeckoId: 'tether' },
      { symbol: 'USDC', address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', decimals: 6, coingeckoId: 'usd-coin' },
      { symbol: 'DAI', address: '0x6B175474E89094C44Da98b954EedeAC495271d0F', decimals: 18, coingeckoId: 'dai' },
      { symbol: 'WBTC', address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', decimals: 8, coingeckoId: 'wrapped-bitcoin' },
      { symbol: 'WETH', address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', decimals: 18, coingeckoId: 'weth' },
      { symbol: 'LINK', address: '0x514910771AF9Ca656af840dff83E8264EcF986CA', decimals: 18, coingeckoId: 'chainlink' },
      { symbol: 'UNI', address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984', decimals: 18, coingeckoId: 'uniswap' },
      { symbol: 'SHIB', address: '0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE', decimals: 18, coingeckoId: 'shiba-inu' },
      { symbol: 'PEPE', address: '0x6982508145454Ce325dDbE47a25d4ec3d2311933', decimals: 18, coingeckoId: 'pepe' },
      { symbol: 'AAVE', address: '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9', decimals: 18, coingeckoId: 'aave' },
      { symbol: 'stETH', address: '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84', decimals: 18, coingeckoId: 'staked-ether' }
    ]
  },
  bsc: {
    id: 'bsc',
    name: 'BNB Chain',
    symbol: 'BNB',
    decimals: 18,
    coingeckoId: 'binancecoin',
    color: '#f0b90b',
    rpc: ['https://bsc-rpc.publicnode.com', 'https://bsc-dataseed.binance.org'],
    explorer: 'https://bscscan.com/address/',
    tokens: [
      { symbol: 'USDT', address: '0x55d398326f99059fF775485246999027B3197955', decimals: 18, coingeckoId: 'tether' },
      { symbol: 'USDC', address: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d', decimals: 18, coingeckoId: 'usd-coin' },
      { symbol: 'BUSD', address: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56', decimals: 18, coingeckoId: 'binance-usd' },
      { symbol: 'CAKE', address: '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82', decimals: 18, coingeckoId: 'pancakeswap-token' },
      { symbol: 'BTCB', address: '0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c', decimals: 18, coingeckoId: 'bitcoin' }
    ]
  },
  polygon: {
    id: 'polygon',
    name: 'Polygon',
    symbol: 'POL',
    decimals: 18,
    coingeckoId: 'polygon-ecosystem-token',
    color: '#a06cf0',
    rpc: ['https://polygon-bor-rpc.publicnode.com', 'https://polygon.drpc.org'],
    explorer: 'https://polygonscan.com/address/',
    tokens: [
      { symbol: 'USDT', address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F', decimals: 6, coingeckoId: 'tether' },
      { symbol: 'USDC', address: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359', decimals: 6, coingeckoId: 'usd-coin' },
      { symbol: 'USDC.e', address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', decimals: 6, coingeckoId: 'usd-coin' },
      { symbol: 'DAI', address: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063', decimals: 18, coingeckoId: 'dai' },
      { symbol: 'WETH', address: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619', decimals: 18, coingeckoId: 'weth' }
    ]
  },
  arbitrum: {
    id: 'arbitrum',
    name: 'Arbitrum',
    symbol: 'ETH',
    decimals: 18,
    coingeckoId: 'ethereum',
    color: '#4fa3d1',
    rpc: ['https://arbitrum-one-rpc.publicnode.com', 'https://arb1.arbitrum.io/rpc'],
    explorer: 'https://arbiscan.io/address/',
    tokens: [
      { symbol: 'USDT', address: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9', decimals: 6, coingeckoId: 'tether' },
      { symbol: 'USDC', address: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831', decimals: 6, coingeckoId: 'usd-coin' },
      { symbol: 'ARB', address: '0x912CE59144191C1204E64559FE8253a0e49E6548', decimals: 18, coingeckoId: 'arbitrum' },
      { symbol: 'WBTC', address: '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f', decimals: 8, coingeckoId: 'wrapped-bitcoin' }
    ]
  },
  optimism: {
    id: 'optimism',
    name: 'Optimism',
    symbol: 'ETH',
    decimals: 18,
    coingeckoId: 'ethereum',
    color: '#e05a5a',
    rpc: ['https://optimism-rpc.publicnode.com', 'https://mainnet.optimism.io'],
    explorer: 'https://optimistic.etherscan.io/address/',
    tokens: [
      { symbol: 'USDT', address: '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58', decimals: 6, coingeckoId: 'tether' },
      { symbol: 'USDC', address: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85', decimals: 6, coingeckoId: 'usd-coin' },
      { symbol: 'OP', address: '0x4200000000000000000000000000000000000042', decimals: 18, coingeckoId: 'optimism' }
    ]
  },
  base: {
    id: 'base',
    name: 'Base',
    symbol: 'ETH',
    decimals: 18,
    coingeckoId: 'ethereum',
    color: '#5b8def',
    rpc: ['https://base-rpc.publicnode.com', 'https://mainnet.base.org'],
    explorer: 'https://basescan.org/address/',
    tokens: [
      { symbol: 'USDC', address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', decimals: 6, coingeckoId: 'usd-coin' },
      { symbol: 'USDT', address: '0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2', decimals: 6, coingeckoId: 'tether' },
      { symbol: 'DAI', address: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb', decimals: 18, coingeckoId: 'dai' }
    ]
  },
  avalanche: {
    id: 'avalanche',
    name: 'Avalanche',
    symbol: 'AVAX',
    decimals: 18,
    coingeckoId: 'avalanche-2',
    color: '#e84142',
    rpc: ['https://avalanche-c-chain-rpc.publicnode.com', 'https://api.avax.network/ext/bc/C/rpc'],
    explorer: 'https://snowtrace.io/address/',
    tokens: [
      { symbol: 'USDT', address: '0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7', decimals: 6, coingeckoId: 'tether' },
      { symbol: 'USDC', address: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E', decimals: 6, coingeckoId: 'usd-coin' },
      { symbol: 'USDT.e', address: '0xc7198437980c041c805A1EDcbA50c1Ce5db95118', decimals: 6, coingeckoId: 'tether' }
    ]
  }
};

export const NON_EVM_CHAINS = {
  bitcoin: {
    id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC', decimals: 8,
    coingeckoId: 'bitcoin', color: '#f7931a',
    explorer: 'https://mempool.space/address/'
  },
  tron: {
    id: 'tron', name: 'Tron', symbol: 'TRX', decimals: 6,
    coingeckoId: 'tron', color: '#e5342c',
    explorer: 'https://tronscan.org/#/address/',
    tokens: [
      { symbol: 'USDT', address: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t', decimals: 6, coingeckoId: 'tether' },
      { symbol: 'USDC', address: 'TEkxiTehnzSmSe2XqrBj4w32RUN966rdz8', decimals: 6, coingeckoId: 'usd-coin' },
      { symbol: 'USDD', address: 'TPYmHEhy5n8TCEfYGqW2rPxsghSfzghPDn', decimals: 18, coingeckoId: 'usdd' }
    ]
  },
  solana: {
    id: 'solana', name: 'Solana', symbol: 'SOL', decimals: 9,
    coingeckoId: 'solana', color: '#14f195',
    explorer: 'https://solscan.io/account/',
    tokens: [
      { symbol: 'USDT', address: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', decimals: 6, coingeckoId: 'tether' },
      { symbol: 'USDC', address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', decimals: 6, coingeckoId: 'usd-coin' },
      { symbol: 'JUP', address: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN', decimals: 6, coingeckoId: 'jupiter-exchange-solana' },
      { symbol: 'BONK', address: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263', decimals: 5, coingeckoId: 'bonk' }
    ]
  },
  ton: {
    id: 'ton', name: 'TON', symbol: 'TON', decimals: 9,
    coingeckoId: 'the-open-network', color: '#4fa3d1',
    explorer: 'https://tonviewer.com/'
  },
  ripple: {
    id: 'ripple', name: 'XRP Ledger', symbol: 'XRP', decimals: 6,
    coingeckoId: 'ripple', color: '#c9c9c9',
    explorer: 'https://xrpscan.com/account/'
  },
  litecoin: {
    id: 'litecoin', name: 'Litecoin', symbol: 'LTC', decimals: 8,
    coingeckoId: 'litecoin', color: '#a6a9aa',
    explorer: 'https://blockchair.com/litecoin/address/'
  },
  dogecoin: {
    id: 'dogecoin', name: 'Dogecoin', symbol: 'DOGE', decimals: 8,
    coingeckoId: 'dogecoin', color: '#c3a634',
    explorer: 'https://blockchair.com/dogecoin/address/'
  }
};

export const ALL_CHAINS = { ...EVM_CHAINS, ...NON_EVM_CHAINS };

export function chainById(id) {
  return ALL_CHAINS[id];
}

export function allCoingeckoIds() {
  const ids = new Set();
  for (const chain of Object.values(ALL_CHAINS)) {
    ids.add(chain.coingeckoId);
    for (const token of chain.tokens || []) ids.add(token.coingeckoId);
  }
  return [...ids];
}
