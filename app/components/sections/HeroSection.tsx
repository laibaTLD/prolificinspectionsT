'use client';

import Image from 'next/image';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Page } from '@/app/lib/types';
import { useWebBuilder } from '@/app/providers/WebBuilderProvider';
import { tiptapToText } from '@/app/lib/seo';
import {
  getHeroEyebrowText,
  getHeroTitleText,
  getPrimaryHeroImageFromHero,
} from '@/app/lib/siteContent';
import { resolvePrimaryCta } from '@/app/components/ui/made';
import { cn } from '@/app/lib/utils';

interface HeroSectionProps {
  hero?: Page['hero'];
  page?: Page | null;
  className?: string;
  /** Legacy overrides — prefer CMS `hero` data when present */
  title?: string;
  subtitle?: string;
  description?: string;
  ctaButton?: { href: string; label: string };
  backgroundImage?: string;
}

function findHighlightWord(text: string): string {
  const words = text.split(/\s+/).filter((w) => w.length > 3);
  if (!words.length) return text.split(/\s+/)[0] || '';
  return words.reduce((a, b) => (b.length > a.length ? b : a), words[0]);
}

const WordReveal = memo(function WordReveal({
  text,
  baseDelay,
  active,
  glowWord,
  accent,
  glow,
}: {
  text: string;
  baseDelay: number;
  active: boolean;
  glowWord?: string;
  accent: string;
  glow: string;
}) {
  const words = text.split(/\s+/);
  const glowKey = glowWord?.toLowerCase().replace(/[^a-z0-9]/gi, '');

  return (
    <>
      {words.map((word, i) => {
        const isGlow = glowKey && word.toLowerCase().replace(/[^a-z0-9]/gi, '') === glowKey;
        return (
          <span
            key={i}
            className={`hero-word-reveal inline-block mr-[0.28em] last:mr-0 ${isGlow ? 'hero-gradient-glow' : ''}`}
            style={{
              animationDelay: active ? `${baseDelay + i * 0.08}s` : '999s',
              ['--hero-accent' as string]: accent,
              ['--hero-glow' as string]: glow,
            }}
          >
            {word}
          </span>
        );
      })}
    </>
  );
});

export function HeroSection({
  hero,
  page,
  className,
  title: titleOverride,
  subtitle: subtitleOverride,
  description: descriptionOverride,
  ctaButton: ctaOverride,
  backgroundImage: backgroundOverride,
}: HeroSectionProps) {
  const { site, pages } = useWebBuilder();

  const [phase, setPhase] = useState(0);
  const [colorRevealDone, setColorRevealDone] = useState(false);
  const [btnOffset, setBtnOffset] = useState({ x: 0, y: 0 });
  const btnRef = useRef<HTMLAnchorElement>(null);

  const title = titleOverride || getHeroTitleText(hero, site);
  const subtitle = subtitleOverride || getHeroEyebrowText(hero, site);
  const description =
    descriptionOverride ||
    tiptapToText(hero?.description) ||
    'Specializing in land clearing and site preparation that delivers precision results for every acre we touch.';

  const ctaButton = useMemo(() => {
    if (ctaOverride) return ctaOverride;
    const fromPage = resolvePrimaryCta(page, site, pages);
    if (fromPage) return fromPage;
    if (hero?.primaryCta?.label?.trim() && hero?.primaryCta?.href?.trim()) {
      return { label: hero.primaryCta.label.trim(), href: hero.primaryCta.href.trim() };
    }
    return { href: '#contact', label: 'Get a Quote' };
  }, [ctaOverride, page, site, pages, hero?.primaryCta]);

  const backgroundImage =
    backgroundOverride || getPrimaryHeroImageFromHero(hero) || undefined;

  const accent = 'var(--wb-text-main)';
  const glow = 'var(--wb-primary)';
  const highlightWord = useMemo(() => findHighlightWord(title), [title]);

  const fallbackGradient = useMemo(
    () =>
      'linear-gradient(160deg, var(--wb-section-bg-dark), color-mix(in srgb, var(--wb-primary) 40%, var(--wb-section-bg-dark)))',
    []
  );

  useEffect(() => {
    const steps = [
      { ms: 0, p: 1 },
      { ms: 300, p: 2 },
      { ms: 500, p: 3 },
      { ms: 750, p: 4 },
      { ms: 1200, p: 5 },
      { ms: 1500, p: 6 },
    ];
    const timers = steps.map(({ ms, p }) => setTimeout(() => setPhase(p), ms));
    const revealDone = setTimeout(() => setColorRevealDone(true), 3200);
    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(revealDone);
    };
  }, []);

  const handleBtnMouseMove = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    setBtnOffset({
      x: (e.clientX - rect.left - rect.width / 2) * 0.15,
      y: (e.clientY - rect.top - rect.height / 2) * 0.15,
    });
  }, []);

  const revealActive = phase >= 4 && !colorRevealDone;

  if (hero?.enabled === false) return null;

  return (
    <>
      <style jsx global>{`
        @keyframes hero-word-up {
          from { opacity: 0; transform: translateY(1.25rem); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes hero-fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes hero-overlay-in {
          from { opacity: 0; transform: translateY(1rem); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes hero-color-sweep {
          from { --hero-reveal: 0%; }
          to { --hero-reveal: 108%; }
        }
        @keyframes hero-btn-in {
          from { opacity: 0; transform: scale(0.92); }
          to { opacity: 1; transform: scale(1); }
        }
        @property --hero-reveal {
          syntax: '<percentage>';
          initial-value: 0%;
          inherits: false;
        }
        .hero-word-reveal {
          opacity: 0;
          animation: hero-word-up 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .hero-gradient-glow {
          background: linear-gradient(135deg, var(--hero-accent), var(--hero-glow), var(--hero-accent));
          background-size: 200% 200%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .hero-visual-enter {
          animation: hero-fade-in 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
        }
        .hero-image-grayscale {
          filter: grayscale(100%) contrast(1.05);
        }
        .hero-color-reveal-layer {
          --hero-reveal: 0%;
          -webkit-mask-image: linear-gradient(
            to right,
            #000 0%,
            #000 max(0%, calc(var(--hero-reveal) - 12%)),
            rgba(0, 0, 0, 0.5) var(--hero-reveal),
            transparent min(100%, calc(var(--hero-reveal) + 5%))
          );
          mask-image: linear-gradient(
            to right,
            #000 0%,
            #000 max(0%, calc(var(--hero-reveal) - 12%)),
            rgba(0, 0, 0, 0.5) var(--hero-reveal),
            transparent min(100%, calc(var(--hero-reveal) + 5%))
          );
          -webkit-mask-size: 100% 100%;
          mask-size: 100% 100%;
        }
        .hero-color-reveal-active {
          animation: hero-color-sweep 2.5s cubic-bezier(0.22, 1, 0.36, 1) 0.35s forwards;
        }
        .hero-color-reveal-done {
          -webkit-mask-image: none;
          mask-image: none;
        }
        .hero-overlay-enter {
          animation: hero-overlay-in 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
        }
        .hero-btn-enter {
          animation: hero-btn-in 0.6s cubic-bezier(0.34, 1.2, 0.64, 1) forwards;
          opacity: 0;
        }
        .hero-glass-panel {
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          background: color-mix(in srgb, var(--wb-card-bg-dark) 88%, transparent);
          border: 1px solid color-mix(in srgb, var(--wb-text-on-dark) 12%, transparent);
          box-shadow: 0 8px 32px color-mix(in srgb, var(--wb-section-bg-dark) 35%, transparent);
        }
        .hero-fullscreen {
          height: 100dvh;
          max-height: 100dvh;
        }
        .hero-text-block {
          padding-top: calc(var(--wb-header-height) + 0.25rem);
        }
        @media (min-width: 1024px) {
          .hero-fullscreen {
            height: 100vh;
            max-height: 100vh;
          }
          .hero-text-block {
            padding-top: calc(var(--wb-header-height) + 0.5rem);
          }
        }
        .hero-image-block {
          flex: 1.1 1 0%;
          min-height: 54vh;
        }
        @media (min-width: 1024px) {
          .hero-image-block {
            min-height: 58vh;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .hero-word-reveal,
          .hero-visual-enter,
          .hero-overlay-enter,
          .hero-btn-enter,
          .hero-color-reveal-active {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
          }
          .hero-color-reveal-layer {
            -webkit-mask-image: none !important;
            mask-image: none !important;
          }
          .hero-image-grayscale {
            filter: none !important;
          }
        }
      `}</style>

      <section
        id="home"
        className={cn(
          'hero-fullscreen relative wb-surface-page flex flex-col overflow-hidden -mt-[var(--wb-header-height)]',
          className
        )}
      >
        <div className="relative z-10 flex flex-1 flex-col min-h-0">
          <div className="hero-text-block shrink-0 px-6 lg:px-10 xl:px-14 pb-1 sm:pb-2">
            {subtitle && (
              <p
                className={`text-[10px] lg:text-xs font-semibold uppercase tracking-[0.25em] wb-text-on-light-secondary mb-2 sm:mb-3 ${phase < 2 ? 'opacity-0' : ''}`}
              >
                <WordReveal text={subtitle} baseDelay={0.1} active={phase >= 2} accent={accent} glow={glow} />
              </p>
            )}
            <h1 className="font-heading text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tight wb-text-on-light leading-[1.08] max-w-4xl">
              <WordReveal
                text={title}
                baseDelay={0.2}
                active={phase >= 3}
                glowWord={highlightWord}
                accent={accent}
                glow={glow}
              />
            </h1>
          </div>

          <div className="hero-image-block relative min-h-0 w-full overflow-hidden">
            <div className={`absolute inset-0 ${phase >= 4 ? 'hero-visual-enter' : 'opacity-0'}`}>
              {backgroundImage ? (
                <>
                  <Image
                    src={backgroundImage}
                    alt=""
                    fill
                    className="object-cover object-center hero-image-grayscale"
                    priority
                    sizes="100vw"
                  />
                  <div
                    className={`absolute inset-0 hero-color-reveal-layer ${revealActive ? 'hero-color-reveal-active' : ''} ${colorRevealDone ? 'hero-color-reveal-done' : ''}`}
                    aria-hidden
                  >
                    <Image
                      src={backgroundImage}
                      alt=""
                      fill
                      className="object-cover object-center"
                      sizes="100vw"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="absolute inset-0 hero-image-grayscale" style={{ background: fallbackGradient }} />
                  <div
                    className={`absolute inset-0 hero-color-reveal-layer ${revealActive ? 'hero-color-reveal-active' : ''} ${colorRevealDone ? 'hero-color-reveal-done' : ''}`}
                    style={{ background: fallbackGradient }}
                  />
                </>
              )}
            </div>

            <div
              className="absolute inset-0 pointer-events-none z-[2]"
              style={{
                background:
                  'linear-gradient(to bottom, color-mix(in srgb, var(--wb-section-bg-dark) 15%, transparent), transparent, color-mix(in srgb, var(--wb-section-bg-dark) 50%, transparent))',
              }}
            />

            <div
              className={`absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 lg:bottom-8 lg:left-8 lg:right-auto lg:max-w-md xl:max-w-lg z-10 ${phase >= 5 ? 'hero-overlay-enter' : 'opacity-0 pointer-events-none'}`}
              style={{ animationDelay: phase >= 5 ? '0.15s' : '999s' }}
            >
              <div className="hero-glass-panel wb-overlay-dark rounded-2xl px-5 py-4 sm:px-6 sm:py-5">
                <p className="text-xs sm:text-sm wb-text-on-dark-secondary leading-relaxed mb-4 line-clamp-3 sm:line-clamp-4">
                  {description}
                </p>
                {ctaButton && (
                  <a
                    ref={btnRef}
                    href={ctaButton.href}
                    className={`hero-btn-enter btn-pill text-[10px] sm:text-[11px] px-6 py-3 ${phase >= 6 ? '' : 'opacity-0'}`}
                    style={{
                      animationDelay: phase >= 6 ? '0.1s' : '999s',
                      transform: `translate(${btnOffset.x}px, ${btnOffset.y}px)`,
                    }}
                    onMouseMove={handleBtnMouseMove}
                    onMouseLeave={() => setBtnOffset({ x: 0, y: 0 })}
                  >
                    {ctaButton.label}
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default HeroSection;
