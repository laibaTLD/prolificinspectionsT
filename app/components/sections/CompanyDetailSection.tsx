'use client';

import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { Page } from '@/app/lib/types';
import { tiptapToText } from '@/app/lib/seo';
import { cn, getImageSrc } from '@/app/lib/utils';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

interface CompanyDetailSectionProps {
  companyDetailSection?: Page['companyDetailSection'];
  className?: string;
}

type DetailSection = {
  heading: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
};

function mapDetailSections(
  details: NonNullable<Page['companyDetailSection']>['details'] | undefined
): DetailSection[] {
  if (!details?.length) return [];

  return details
    .map((detail) => {
      const heading = tiptapToText(detail.title) || detail.label?.trim() || '';
      const description =
        tiptapToText(detail.description) || tiptapToText(detail.value) || '';
      const imageUrl = detail.image?.url ? getImageSrc(detail.image.url) : '';

      return {
        heading,
        description,
        imageUrl,
        imageAlt: detail.image?.altText?.trim() || heading || 'Company detail',
      };
    })
    .filter((section) => section.heading || section.description || section.imageUrl);
}

export function CompanyDetailSection({
  companyDetailSection,
  className,
}: CompanyDetailSectionProps) {
  const heading = useMemo(
    () =>
      tiptapToText(companyDetailSection?.title) ||
      'Built on Experience & Trust',
    [companyDetailSection?.title]
  );

  const description = useMemo(
    () => tiptapToText(companyDetailSection?.description) || '',
    [companyDetailSection?.description]
  );

  const sections = useMemo(
    () => mapDetailSections(companyDetailSection?.details),
    [companyDetailSection?.details]
  );

  const [activeIndex, setActiveIndex] = useState(0);
  const itemRefs = useRef<(HTMLElement | null)[]>([]);

  const { ref: headerRef, isVisible: headerVisible } =
    useScrollAnimation<HTMLDivElement>({ threshold: 0.1 });

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    itemRefs.current.forEach((el, i) => {
      if (!el) return;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveIndex(i);
        },
        { threshold: 0.55, rootMargin: '-15% 0px -15% 0px' }
      );
      observer.observe(el);
      observers.push(observer);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, [sections.length]);

  if (!companyDetailSection || companyDetailSection.enabled === false) return null;
  if (!sections.length) return null;

  const active = sections[activeIndex] ?? sections[0];

  return (
    <section
      id="company-details"
      className={cn('relative py-12 lg:py-24 overflow-hidden wb-surface-light', className)}
    >
      <div className="container mx-auto px-6 lg:px-10 xl:px-14 relative z-10">
        <div
          ref={headerRef}
          className={`mb-10 lg:mb-14 transition-all duration-1000 ${
            headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <span className="section-label">Company Highlights</span>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <h2 className="section-heading-lg max-w-2xl">{heading}</h2>
            {description && (
              <p className="section-desc max-w-md lg:text-right">{description}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] gap-8 lg:gap-14 xl:gap-20">
          <div className="relative lg:sticky lg:top-28 lg:self-start">
            <div className="relative aspect-[4/5] sm:aspect-[3/4] lg:aspect-[4/5] overflow-hidden rounded-2xl border wb-border-on-light shadow-[0_24px_60px_-30px_color-mix(in_srgb,var(--wb-text-main)_25%,transparent)]">
              {sections.map((section, index) => (
                <div
                  key={index}
                  className={cn(
                    'absolute inset-0 transition-all duration-700 ease-out',
                    activeIndex === index
                      ? 'opacity-100 scale-100'
                      : 'opacity-0 scale-105 pointer-events-none'
                  )}
                >
                  {section.imageUrl ? (
                    <Image
                      src={section.imageUrl}
                      alt={section.imageAlt}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 45vw"
                      priority={index === 0}
                    />
                  ) : (
                    <div className="absolute inset-0 bg-[var(--wb-section-bg-light)]" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                </div>
              ))}

              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 wb-overlay-dark">
                <span className="section-label mb-2 wb-text-on-dark-secondary">
                  {String(activeIndex + 1).padStart(2, '0')} / {String(sections.length).padStart(2, '0')}
                </span>
                <h3 className="text-xl sm:text-2xl font-heading font-bold wb-text-on-dark">
                  {active.heading}
                </h3>
              </div>
            </div>

            <div className="mt-4 hidden lg:flex gap-2">
              {sections.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  aria-label={`Show highlight ${index + 1}`}
                  onClick={() => setActiveIndex(index)}
                  className={cn(
                    'h-1 rounded-full transition-all duration-500',
                    activeIndex === index
                      ? 'w-10 bg-[var(--wb-primary)]'
                      : 'w-4 bg-[color-mix(in_srgb,var(--wb-text-main)_20%,transparent)]'
                  )}
                />
              ))}
            </div>
          </div>

          <div className="relative">
            <div
              className="absolute left-3 top-0 bottom-0 w-px hidden sm:block"
              style={{
                background:
                  'linear-gradient(to bottom, transparent, color-mix(in srgb, var(--wb-primary) 50%, transparent), transparent)',
              }}
              aria-hidden
            />

            <div className="space-y-4 sm:space-y-6">
              {sections.map((section, index) => {
                const isActive = activeIndex === index;

                return (
                  <article
                    key={index}
                    ref={(el) => {
                      itemRefs.current[index] = el;
                    }}
                    className={cn(
                      'relative rounded-xl border p-5 sm:p-6 lg:p-7 transition-all duration-500 cursor-pointer',
                      isActive
                        ? 'wb-card-light wb-border-on-light shadow-[0_16px_40px_-24px_color-mix(in_srgb,var(--wb-primary)_30%,transparent)] translate-x-0 sm:translate-x-2'
                        : 'border-transparent opacity-60 hover:opacity-90'
                    )}
                    onClick={() => setActiveIndex(index)}
                    onKeyDown={(e) => e.key === 'Enter' && setActiveIndex(index)}
                    role="button"
                    tabIndex={0}
                  >
                    <span
                      className={cn(
                        'absolute -left-[1.625rem] top-1/2 hidden sm:flex h-3 w-3 -translate-y-1/2 rounded-full border-2 transition-all duration-500',
                        isActive
                          ? 'scale-125 border-[var(--wb-primary)] bg-[var(--wb-primary)]'
                          : 'border-[color-mix(in_srgb,var(--wb-text-main)_30%,transparent)] bg-[var(--wb-section-bg-light)]'
                      )}
                      aria-hidden
                    />

                    <div className="flex items-baseline gap-4">
                      <span
                        className={cn(
                          'text-3xl font-heading font-bold tabular-nums transition-colors duration-500',
                          isActive ? 'text-[var(--wb-primary)]' : 'text-[color-mix(in_srgb,var(--wb-text-main)_25%,transparent)]'
                        )}
                      >
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-lg sm:text-xl font-heading font-bold text-[var(--wb-text-main)]">
                          {section.heading}
                        </h3>
                        {section.description && (
                          <p
                            className={cn(
                              'section-desc mt-2 transition-all duration-500 overflow-hidden',
                              isActive ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 sm:max-h-96 sm:opacity-100 sm:line-clamp-2'
                            )}
                          >
                            {section.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CompanyDetailSection;
