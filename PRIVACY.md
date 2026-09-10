# Wallet Watch — Privacy Policy

_Last updated: 2026-09-09_

Wallet Watch is a Chrome extension for tracking the balances of public blockchain wallet addresses you choose to add. This policy explains what data the extension handles and how.

## What Wallet Watch never collects

- No names, email addresses, or other personal identifiers
- No private keys, seed phrases, or passwords — Wallet Watch is strictly read-only and never asks for them
- No browsing history, page content, clicks, or keystrokes
- No location or IP-based tracking
- No analytics, telemetry, or advertising SDKs of any kind

## What Wallet Watch stores

When you add a wallet, Wallet Watch stores the following locally in your browser using the `chrome.storage.local` API:

- The public wallet address(es) and label you provide
- Which networks are enabled for that address
- Your extension settings (refresh interval, dust threshold, badge preference)
- A cached snapshot of the balances last fetched, so the popup can show data instantly before refreshing

This data stays on your device. It is never transmitted to, or stored on, any server operated by the developer. Uninstalling the extension, or clearing its storage in `chrome://extensions`, deletes it.

## What Wallet Watch sends to third parties

To look up a balance, Wallet Watch sends the public wallet address to the relevant public blockchain RPC node or explorer API for that network — this is the only way to read an on-chain balance. Prices are looked up by token symbol via CoinGecko. These are the only endpoints Wallet Watch contacts:

publicnode.com, rpc.mevblocker.io, eth.merkle.io, polygon.drpc.org, bsc-dataseed.binance.org, arb1.arbitrum.io, mainnet.optimism.io, api.avax.network, mainnet.base.org, mempool.space, api.trongrid.io, api.mainnet-beta.solana.com, toncenter.com, s1.ripple.com / xrplcluster.com, api.blockcypher.com, api.blockchair.com, and api.coingecko.com.

A wallet address alone does not identify you personally, but is inherently public information (blockchain data is public by design). Wallet Watch does not attach any other identifying information to these requests. As with any network request, the request necessarily includes your IP address at the network/transport level — Wallet Watch does not read, log, or otherwise use it.

Wallet Watch does not sell or share your data with third parties for advertising, and does not use your data for any purpose other than showing you the balances you asked to track.

## Children's privacy

Wallet Watch is not directed at children and does not knowingly collect data from children.

## Changes to this policy

If this policy changes, the "Last updated" date above will be revised and the change will be reflected in the extension's repository.

## Contact

Questions about this policy or the extension: **info@usefulness.website**
