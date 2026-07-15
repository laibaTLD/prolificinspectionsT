'use client';

import type { ReactNode, CSSProperties } from 'react';
import { cn } from '@/app/lib/utils';

type ScrollPerfSectionProps = {
  children: ReactNode;
  /** Approximate height hint for content-visibility (reduces scroll jank) */
  intrinsicSize?: string;
  className?: string;
};

/**
 * Lets the browser skip layout/paint for offscreen sections until scrolled near.
 * Keeps SSR content intact (unlike mount-gating).
 */
export function ScrollPerfSection({
  children,
  intrinsicSize = '480px',
  className,
}: ScrollPerfSectionProps) {
  const style = {
    contentVisibility: 'auto',
    containIntrinsicSize: `auto ${intrinsicSize}`,
  } as CSSProperties;

  return (
    <div className={cn('gb-scroll-perf', className)} style={style}>
      {children}
    </div>
  );
}
