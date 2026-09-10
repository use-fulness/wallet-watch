import { refreshAll, totalValue } from './lib/portfolio.js';
import { getPrices } from './lib/prices.js';
import { getSettings, getSnapshot } from './lib/storage.js';

const ALARM_NAME = 'wallet-watch-refresh';

async function scheduleRefresh() {
  const settings = await getSettings();
  await chrome.alarms.clear(ALARM_NAME);
  if (settings.autoRefreshMinutes > 0) {
    chrome.alarms.create(ALARM_NAME, {
      periodInMinutes: settings.autoRefreshMinutes,
      delayInMinutes: settings.autoRefreshMinutes
    });
  }
}

function formatBadge(value) {
  if (!(value > 0)) return '';
  const scaled = (amount, suffix) =>
    (amount >= 10 ? String(Math.round(amount)) : amount.toFixed(1)) + suffix;
  if (value >= 999.5e6) return scaled(value / 1e9, 'B');
  if (value >= 999.5e3) return scaled(value / 1e6, 'M');
  if (value >= 999.5) return scaled(value / 1e3, 'K');
  if (value >= 1) return String(Math.round(value));
  return '<1';
}

async function updateBadge() {
  const settings = await getSettings();
  if (!settings.showBadge) {
    await chrome.action.setBadgeText({ text: '' });
    return;
  }
  const [snapshot, prices] = await Promise.all([getSnapshot(), getPrices().catch(() => ({}))]);
  const total = totalValue(snapshot, prices);
  await chrome.action.setBadgeText({ text: formatBadge(total) });
  await chrome.action.setBadgeBackgroundColor({ color: '#c8a227' });
  if (chrome.action.setBadgeTextColor) {
    await chrome.action.setBadgeTextColor({ color: '#12100b' });
  }
}

async function runRefresh() {
  try {
    await refreshAll();
    await updateBadge();
  } catch (error) {
    console.error('Wallet Watch refresh failed', error);
  }
}

chrome.runtime.onInstalled.addListener(() => {
  scheduleRefresh();
  runRefresh();
});

chrome.runtime.onStartup.addListener(() => {
  scheduleRefresh();
  runRefresh();
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === ALARM_NAME) runRefresh();
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'refresh') {
    refreshAll(message.options || {})
      .then(async (result) => {
        await updateBadge();
        sendResponse({ ok: true, ...result });
      })
      .catch((error) => sendResponse({ ok: false, error: error.message }));
    return true;
  }
  if (message.type === 'reschedule') {
    scheduleRefresh().then(() => {
      updateBadge();
      sendResponse({ ok: true });
    });
    return true;
  }
  return false;
});
