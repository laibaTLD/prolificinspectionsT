'use client';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

let registered = false;
let refreshQueued = false;

/** Register ScrollTrigger once with performance-friendly defaults. */
export function ensureGsapScroll(): void {
  if (typeof window === 'undefined' || registered) return;
  registered = true;
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({
    limitCallbacks: true,
    ignoreMobileResize: true,
    autoRefreshEvents: 'visibilitychange,DOMContentLoaded,load',
  });
  ScrollTrigger.defaults({
    invalidateOnRefresh: true,
    anticipatePin: 1,
    fastScrollEnd: true,
  });
}

/** Recalculate ScrollTrigger positions after layout / CMS content changes (batched). */
export function refreshScrollLayout(): void {
  if (typeof window === 'undefined') return;
  ensureGsapScroll();
  if (refreshQueued) return;
  refreshQueued = true;
  requestAnimationFrame(() => {
    refreshQueued = false;
    ScrollTrigger.refresh();
  });
}

export { gsap, ScrollTrigger };
