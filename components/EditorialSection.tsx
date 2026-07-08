'use client';

import { themeSurface } from '@/lib/theme';

export const SECTION = {
  wrap: 'relative overflow-hidden py-12 lg:py-16 wb-surface-page',
  container: 'mx-auto w-full max-w-[90rem] px-6 md:px-12 lg:px-16 xl:px-20',
  header: 'grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start mb-8 lg:mb-10',
  content: 'mt-6',
  label: 'flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.28em] mb-6',
  labelBar: 'inline-block h-px w-8 shrink-0',
  body: 'text-sm leading-relaxed text-[var(--wb-text-secondary)]',
};

export function EditorialBackdrop({ primaryColor }: { primaryColor: string }) {
  return (
    <>
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          background: `radial-gradient(ellipse 70% 55% at 15% 25%, ${primaryColor}, transparent 70%)`,
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-8 top-12 h-48 w-48 rounded-full opacity-[0.05] blur-3xl"
        style={{ backgroundColor: primaryColor }}
        aria-hidden
      />
    </>
  );
}

export function SectionTopAccent({ primaryColor }: { primaryColor: string }) {
  return (
    <div
      className="absolute left-6 top-0 h-1 w-20 md:left-12 lg:left-16 xl:left-20"
      style={{ backgroundColor: primaryColor }}
      aria-hidden
    />
  );
}

export function SectionRail({
  index,
  loaded,
  primaryColor,
}: {
  index: string;
  loaded: boolean;
  primaryColor: string;
}) {
  return (
    <div
      className="flex flex-col items-center gap-2"
      style={{
        opacity: loaded ? 1 : 0,
        transform: loaded ? 'translateY(0)' : 'translateY(16px)',
        transition:
          'opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1), transform 0.7s cubic-bezier(0.22, 1, 0.36, 1)',
        transitionDelay: '0.4s',
      }}
    >
      <span
        className="text-[10px] font-medium uppercase tracking-[0.3em]"
        style={{ color: primaryColor, fontFamily: 'var(--wb-body-font, sans-serif)' }}
      >
        Section
      </span>
      <span
        className="text-4xl font-normal tabular-nums leading-none"
        style={{ color: primaryColor, fontFamily: 'var(--wb-heading-font, Georgia, serif)' }}
      >
        {index}
      </span>
      <div className="h-16 w-px" style={{ backgroundColor: themeSurface(primaryColor, 0.25) }} />
    </div>
  );
}
