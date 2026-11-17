import { useSyncExternalStore } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';
const KEY = 'yashmeen:motion';
const EVENT = 'motion-preference-change';
let volatileSetting;

function readSetting() {
  try { return volatileSetting || localStorage.getItem(KEY) || 'system'; } catch { return volatileSetting || 'system'; }
}

function subscribe(update) {
  const media = window.matchMedia(QUERY);
  media.addEventListener('change', update);
  window.addEventListener('storage', update);
  window.addEventListener(EVENT, update);
  return () => {
    media.removeEventListener('change', update);
    window.removeEventListener('storage', update);
    window.removeEventListener(EVENT, update);
  };
}

function readPreference() {
  const setting = readSetting();
  return setting === 'reduced' || (setting !== 'full' && window.matchMedia(QUERY).matches);
}

export function setMotionPreference(setting) {
  volatileSetting = setting;
  try { localStorage.setItem(KEY, setting); } catch { /* Private browsing can disable storage. */ }
  window.dispatchEvent(new Event(EVENT));
}

export default function useReducedMotionPreference() {
  // Hydration starts static, then uses the visitor's live system/site preference.
  return useSyncExternalStore(subscribe, readPreference, () => true);
}
