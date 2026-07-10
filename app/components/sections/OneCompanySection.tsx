'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import type { Page } from '@/app/lib/types';
import { useWebBuilder } from '@/app/providers/WebBuilderProvider';
import { getPageHref } from '@/app/lib/siteContent';
import { resolveServiceSlug } from '@/app/lib/serviceAreaSlugs';
import { cn } from '@/app/lib/utils';

interface OneCompanySectionProps {
  className?: string;
  page?: Page | null;
}

const STEPS = [
  {
    key: 'home',
    match: 'home',
    step: 1,
    label: 'Home Inspections',
    description:
      'A comprehensive visual evaluation of the home’s major systems so buyers, sellers, and Realtors can decide with confidence.',
  },
  {
    key: 'roof',
    match: 'roof',
    step: 2,
    label: 'Roof Inspections',
    description:
      'A specialized look at the roofing system—covering, flashings, drainage, and ventilation—to identify issues before closing.',
  },
  {
    key: 'termite',
    match: 'termite',
    step: 3,
    label: 'Termite (WDO) Inspections',
    description:
      'Licensed WDO inspections with clear findings, photos, and recommendations that help keep real estate transactions moving.',
  },
] as const;

function HomeIcon() {
  return (
    <svg viewBox="0 0 64 64" className="hg-one-company-icon" fill="none" aria-hidden>
      <path
        d="M10 30 L32 12 L54 30 V52 H10 Z"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path d="M26 52 V36 H38 V52" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
      <circle cx="44" cy="40" r="8" stroke="currentColor" strokeWidth="2.5" />
      <path d="M49.5 45.5 L55 51" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

function RoofIcon() {
  return (
    <svg viewBox="0 0 64 64" className="hg-one-company-icon" fill="none" aria-hidden>
      <path
        d="M6 36 L32 14 L58 36"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M14 36 V50 H50 V36" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
      <path
        d="M18 30 L32 18 L46 30"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
        opacity="0.7"
      />
      <path d="M22 30 H42" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="46" cy="44" r="7" stroke="currentColor" strokeWidth="2.5" />
      <path d="M51 49 L56 54" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

function TermiteIcon() {
  return (
    <svg viewBox="0 0 64 64" className="hg-one-company-icon" fill="none" aria-hidden>
      <path
        d="M12 48 L32 20 L52 48 H12 Z"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <ellipse cx="32" cy="38" rx="9" ry="7" stroke="currentColor" strokeWidth="2.5" />
      <circle cx="29" cy="37" r="1.4" fill="currentColor" />
      <circle cx="35" cy="37" r="1.4" fill="currentColor" />
      <path
        d="M23 38 H18 M41 38 H46 M24 33 L20 29 M40 33 L44 29 M24 43 L20 47 M40 43 L44 47"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path d="M32 31 V26" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function StepIcon({ type }: { type: string }) {
  if (type === 'roof') return <RoofIcon />;
  if (type === 'termite') return <TermiteIcon />;
  return <HomeIcon />;
}

export function OneCompanySection({ className, page }: OneCompanySectionProps) {
  const { services, pages } = useWebBuilder();

  const steps = useMemo(() => {
    const published = services.filter((s) => s.status === 'published');
    return STEPS.map((item) => {
      const match = published.find((s) => s.name.toLowerCase().includes(item.match));
      return {
        ...item,
        href: match ? `/service/${resolveServiceSlug(match)}` : '/services',
      };
    });
  }, [services]);

  const ctaHref = useMemo(() => {
    const contactPage = pages?.find((p) => p.pageType === 'contact');
    if (contactPage) return getPageHref(contactPage);
    if (page?.ctaSection?.primaryButton?.href) return page.ctaSection.primaryButton.href;
    return '#contact';
  }, [pages, page]);

  return (
    <section id="one-company" className={cn('hg-one-company-section', className)}>
      <div className="container mx-auto px-4 lg:px-8">
        <div className="hg-one-company-header">
          <h2 className="hg-one-company-title">
            One Company. Every Inspection You Need.
          </h2>
          <p className="hg-one-company-subtitle">
            Simple. Professional. Easy to understand—Home, Roof, and Termite inspections
            under one trusted brand for your real estate transaction.
          </p>
        </div>

        <div className="hg-one-company-grid">
          {steps.map((item) => (
            <Link key={item.key} href={item.href} className="hg-one-company-card">
              <span className="hg-one-company-step" aria-hidden>
                {item.step}
              </span>
              <div className="hg-one-company-icon-wrap">
                <StepIcon type={item.key} />
              </div>
              <h3 className="hg-one-company-card-title">{item.label}</h3>
              <p className="hg-one-company-card-desc">{item.description}</p>
            </Link>
          ))}
        </div>

        <div className="hg-one-company-cta-wrap">
          <Link href={ctaHref} className="hg-one-company-cta">
            Schedule Inspection
          </Link>
        </div>
      </div>
    </section>
  );
}

export default OneCompanySection;
