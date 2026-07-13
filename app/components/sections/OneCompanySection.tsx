'use client';

import Image from 'next/image';
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
    imageUrl: '/services/home-inspection.jpg',
  },
  {
    key: 'roof',
    match: 'roof',
    step: 2,
    label: 'Roof Inspections',
    description:
      'A specialized look at the roofing system—covering, flashings, drainage, and ventilation—to identify issues before closing.',
    imageUrl: '/services/roof-inspection.jpg',
  },
  {
    key: 'termite',
    match: 'termite',
    step: 3,
    label: 'Termite (WDO) Inspections',
    description:
      'Licensed WDO inspections with clear findings, photos, and recommendations that help keep real estate transactions moving.',
    imageUrl: '/services/termite-inspection.jpg',
  },
] as const;

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
              <div className="hg-one-company-media">
                <Image
                  src={item.imageUrl}
                  alt={item.label}
                  width={160}
                  height={160}
                  className="hg-one-company-image"
                />
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
