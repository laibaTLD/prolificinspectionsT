'use client';

import { useMemo, useState } from 'react';
import type { Page } from '@/app/lib/types';
import { tiptapToText } from '@/app/lib/seo';
import { cn } from '@/app/lib/utils';
import { useScrollAnimation, useStaggeredAnimation } from '@/hooks/useScrollAnimation';

interface WhyChooseUsSectionProps {
  whyChooseUsSection?: Page['whyChooseUsSection'];
  className?: string;
}

function bentoSpan(index: number, total: number): string {
  if (total === 1) return 'sm:col-span-2 lg:col-span-3';
  if (total === 2) return '';
  if (total >= 5 && index === 0) return 'sm:col-span-2';
  if (total >= 4 && index === total - 1 && total % 2 !== 0) return 'sm:col-span-2';
  return '';
}

export function WhyChooseUsSection({
  whyChooseUsSection,
  className,
}: WhyChooseUsSectionProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const title = useMemo(
    () => tiptapToText(whyChooseUsSection?.title) || 'Why Choose Us',
    [whyChooseUsSection?.title]
  );

  const description = useMemo(
    () =>
      tiptapToText(whyChooseUsSection?.description) ||
      'Precision site preparation and land clearing built on experience, safety, and results you can trust.',
    [whyChooseUsSection?.description]
  );

  const items = useMemo(
    () =>
      (whyChooseUsSection?.items ?? [])
        .map((item) => ({
          heading: tiptapToText(item.title),
          description: tiptapToText(item.description),
        }))
        .filter((item) => item.heading || item.description),
    [whyChooseUsSection?.items]
  );

  const { ref: headerRef, isVisible: headerVisible } =
    useScrollAnimation<HTMLDivElement>({ threshold: 0.1 });
  const { ref: gridRef, visibleItems } = useStaggeredAnimation(items.length, 100);

  if (!whyChooseUsSection || whyChooseUsSection.enabled === false) return null;
  if (!items.length) return null;

  return (
    <section
      id="why-choose-us"
      className={cn('relative py-12 lg:py-24 overflow-hidden wb-surface-page', className)}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        aria-hidden
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 50% 0%, color-mix(in srgb, var(--wb-primary) 12%, transparent), transparent 70%)',
        }}
      />

      <div className="container mx-auto px-6 lg:px-10 xl:px-14 relative z-10">
        <div
          ref={headerRef}
          className={`mx-auto max-w-3xl text-center mb-12 lg:mb-16 transition-all duration-1000 ${
            headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <span className="section-label">Why Choose Us</span>
          <h2 className="section-heading-lg">{title}</h2>
          <p className="section-desc mt-6">{description}</p>
        </div>

        <div
          ref={gridRef}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6"
        >
          {items.map((item, index) => {
            const isActive = activeIndex === index;
            const isVisible = visibleItems.includes(index);

            return (
              <article
                key={index}
                className={cn(
                  'group relative rounded-2xl border wb-border-on-light wb-card-light p-6 sm:p-8 transition-all duration-700 ease-out',
                  bentoSpan(index, items.length),
                  isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95',
                  isActive && '-translate-y-1 shadow-[0_20px_50px_-20px_color-mix(in_srgb,var(--wb-primary)_35%,transparent)]'
                )}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
                onFocus={() => setActiveIndex(index)}
                onBlur={() => setActiveIndex(null)}
                tabIndex={0}
              >
                <div
                  className={cn(
                    'absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 pointer-events-none',
                    isActive && 'opacity-100'
                  )}
                  style={{
                    background:
                      'linear-gradient(135deg, color-mix(in srgb, var(--wb-primary) 8%, transparent), transparent 60%)',
                  }}
                />

                <div className="relative flex items-start gap-5">
                  <div
                    className={cn(
                      'flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border wb-border-on-light transition-all duration-500',
                      isActive && 'scale-110 border-[color-mix(in_srgb,var(--wb-primary)_40%,transparent)] bg-[color-mix(in_srgb,var(--wb-primary)_10%,transparent)]'
                    )}
                  >
                    <span className="text-xl font-heading font-bold text-[var(--wb-text-main)] tabular-nums">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3
                      className={cn(
                        'text-lg sm:text-xl font-heading font-bold text-[var(--wb-text-main)] transition-transform duration-500',
                        isActive && 'translate-x-1'
                      )}
                    >
                      {item.heading}
                    </h3>
                    {item.description && (
                      <p
                        className={cn(
                          'section-desc mt-3 transition-all duration-500',
                          isActive ? 'opacity-100 max-h-96' : 'opacity-80'
                        )}
                      >
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>

                <div
                  className={cn(
                    'absolute bottom-0 left-6 right-6 h-0.5 origin-left scale-x-0 rounded-full transition-transform duration-700 ease-out',
                    isActive && 'scale-x-100'
                  )}
                  style={{ backgroundColor: 'var(--wb-primary)' }}
                />
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default WhyChooseUsSection;
