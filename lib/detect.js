import { EVM_CHAINS } from './chains.js';

const BASE58 = /^[1-9A-HJ-NP-Za-km-z]+$/;

const PATTERNS = [
  {
    test: (a) => /^0x[a-fA-F0-9]{40}$/.test(a),
    chains: () => Object.keys(EVM_CHAINS),
    family: 'evm'
  },
  {
    test: (a) => /^T[1-9A-HJ-NP-Za-km-z]{33}$/.test(a),
    chains: () => ['tron'],
    family: 'tron'
  },
  {
    test: (a) => /^(bc1[a-z0-9]{25,62}|[13][a-km-zA-HJ-NP-Z1-9]{25,34})$/.test(a),
    chains: () => ['bitcoin'],
    family: 'bitcoin'
  },
  {
    test: (a) => /^(ltc1[a-z0-9]{25,62}|[LM][a-km-zA-HJ-NP-Z1-9]{26,34})$/.test(a),
    chains: () => ['litecoin'],
    family: 'litecoin'
  },
  {
    test: (a) => /^D[5-9A-HJ-NP-U][1-9A-HJ-NP-Za-km-z]{32}$/.test(a),
    chains: () => ['dogecoin'],
    family: 'dogecoin'
  },
  {
    test: (a) => /^r[1-9A-HJ-NP-Za-km-z]{24,34}$/.test(a),
    chains: () => ['ripple'],
    family: 'ripple'
  },
  {
    test: (a) => /^(0:[a-fA-F0-9]{64}|[EU]Q[A-Za-z0-9_-]{46})$/.test(a),
    chains: () => ['ton'],
    family: 'ton'
  },
  {
    test: (a) => a.length >= 32 && a.length <= 44 && BASE58.test(a),
    chains: () => ['solana'],
    family: 'solana'
  }
];

export function detectChains(address) {
  const trimmed = (address || '').trim();
  if (!trimmed) return { family: null, chains: [] };
  for (const pattern of PATTERNS) {
    if (pattern.test(trimmed)) {
      return { family: pattern.family, chains: pattern.chains() };
    }
  }
  return { family: null, chains: [] };
}

export function normalizeAddress(address) {
  const trimmed = (address || '').trim();
  return /^0x[a-fA-F0-9]{40}$/.test(trimmed) ? trimmed.toLowerCase() : trimmed;
}
