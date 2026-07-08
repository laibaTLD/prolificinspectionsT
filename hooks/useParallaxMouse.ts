'use client';

import { useEffect, useState, type RefObject } from 'react';

/** Normalized pointer position within an element (-1..1 on each axis). */
export function useParallaxMouse(
  ref: RefObject<HTMLElement | null>,
  enabled = true
): { x: number; y: number } {
  const [pos, setPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!enabled) {
      setPos({ x: 0, y: 0 });
      return;
    }

    const el = ref.current;
    if (!el) return;

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      setPos({
        x: ((e.clientX - rect.left) / rect.width - 0.5) * 2,
        y: ((e.clientY - rect.top) / rect.height - 0.5) * 2,
      });
    };

    const onLeave = () => setPos({ x: 0, y: 0 });

    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    return () => {
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseleave', onLeave);
    };
  }, [enabled, ref]);

  return pos;
}
