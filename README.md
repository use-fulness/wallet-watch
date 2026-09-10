# Wallet Watch

A Chrome extension for tracking balances of any wallet you know the **public address** of. Read-only: no private keys, no seed phrases, no signing.

## Install

1. Open `chrome://extensions`
2. Turn on **Developer mode** (top right)
3. Click **Load unpacked** and select this folder

Pin the extension for one-click access to the popup.

## Use

1. Click **+ Add wallet**
2. Give it a label and paste a public address
3. The networks are detected automatically from the address format — toggle off any you don't want scanned
4. Click a wallet to expand its per-chain, per-token breakdown
5. **Rename** in the expanded card edits the name inline — Enter or click away to save, Escape to cancel

Balances refresh automatically (interval configurable in settings) and the toolbar icon shows a badge with your total.

## Coverage

| Network | Native | Tokens tracked |
|---|---|---|
| Ethereum | ETH | **USDT**, USDC, DAI, WBTC, WETH, LINK, UNI, SHIB, PEPE, AAVE, stETH |
| BNB Chain | BNB | **USDT**, USDC, BUSD, CAKE, BTCB |
| Polygon | POL | **USDT**, USDC, USDC.e, DAI, WETH |
| Arbitrum | ETH | **USDT**, USDC, ARB, WBTC |
| Optimism | ETH | **USDT**, USDC, OP |
| Base | ETH | **USDT**, USDC, DAI |
| Avalanche | AVAX | **USDT**, USDT.e, USDC |
| Tron | TRX | **USDT**, USDC, USDD |
| Solana | SOL | **USDT**, USDC, JUP, BONK |
| TON | TON | **USDT** |
| Bitcoin | BTC | — |
| Litecoin | LTC | — |
| Dogecoin | DOGE | — |

USDT is tracked on all ten of its major chains and is called out separately under the total.

One EVM address is scanned across all seven EVM chains at once, so a single `0x…` entry covers Ethereum, BNB Chain, Polygon, Arbitrum, Optimism, Base and Avalanche.

## Address formats detected

`0x…` (EVM) · `T…` (Tron) · `bc1…`/`1…`/`3…` (Bitcoin) · `ltc1…`/`L…`/`M…` (Litecoin) · `D…` (Dogecoin) · `r…` (XRP) · `EQ…`/`UQ…`/`0:…` (TON) · base58 32–44 chars (Solana)

## Data sources

All free and keyless:

- **EVM chains** — public JSON-RPC (publicnode, with per-chain fallbacks); balances read via `eth_getBalance` and ERC-20 `balanceOf`, batched into one request per chain
- **Bitcoin** — mempool.space
- **Tron** — TronGrid
- **Solana** — publicnode / Solana mainnet RPC
- **TON** — Toncenter
- **XRP** — xrplcluster
- **Litecoin, Dogecoin** — BlockCypher, falling back to Blockchair
- **Prices** — CoinGecko (cached 60s)

Public endpoints are rate-limited. If a chain can't be reached the wallet card says so explicitly rather than silently showing a zero balance.

## Settings

- **Auto refresh** — off, 5, 10, 30 or 60 minutes
- **Hide dust** — hide holdings below a USD threshold (default $0.50)
- **Show total on icon** — toolbar badge with total portfolio value

## Privacy

Addresses and balances are stored locally via `chrome.storage.local` and never leave your machine except as balance queries to the public APIs listed above. No analytics, no accounts, no remote code.
