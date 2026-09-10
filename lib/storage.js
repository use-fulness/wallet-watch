const DEFAULT_SETTINGS = {
  autoRefreshMinutes: 10,
  hideDust: true,
  dustThreshold: 0.5,
  showBadge: true
};

export async function getWallets() {
  const { wallets } = await chrome.storage.local.get('wallets');
  return wallets || [];
}

export async function saveWallets(wallets) {
  await chrome.storage.local.set({ wallets });
}

export async function getSettings() {
  const { settings } = await chrome.storage.local.get('settings');
  return { ...DEFAULT_SETTINGS, ...(settings || {}) };
}

export async function saveSettings(patch) {
  const current = await getSettings();
  const settings = { ...current, ...patch };
  await chrome.storage.local.set({ settings });
  return settings;
}

export async function getSnapshot() {
  const { snapshot } = await chrome.storage.local.get('snapshot');
  return snapshot || { at: 0, wallets: {} };
}

export async function saveSnapshot(snapshot) {
  await chrome.storage.local.set({ snapshot });
}

export { DEFAULT_SETTINGS };
