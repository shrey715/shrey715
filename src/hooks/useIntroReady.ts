'use client';
import { useSyncExternalStore } from 'react';
import { INTRO_EVENT } from '@/lib/constants';

const FALLBACK_MS = 3200;
let lifted = false;

function subscribe(onChange: () => void) {
  const go = () => {
    lifted = true;
    onChange();
  };
  window.addEventListener(INTRO_EVENT, go);
  // Guards against the event never arriving (e.g. the Preloader bailing out).
  const timer = setTimeout(go, FALLBACK_MS);
  return () => {
    window.removeEventListener(INTRO_EVENT, go);
    clearTimeout(timer);
  };
}

const getSnapshot = () => lifted || sessionStorage.getItem('preloaded') === '1';
const getServerSnapshot = () => false;

/**
 * True once the page is actually visible: immediately on repeat visits
 * (Preloader already played this session), otherwise when the Preloader
 * starts lifting its curtain.
 */
export function useIntroReady(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
