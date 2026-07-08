'use client';

import { useEffect, useMemo, useState } from 'react';
import type { Page } from '@/app/lib/types';
import { useWebBuilder } from '@/app/providers/WebBuilderProvider';
import { tiptapToText } from '@/app/lib/seo';
import { cn } from '@/app/lib/utils';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

interface TestimonialsSectionProps {
  testimonialsSection?: Page['testimonialsSection'];
  className?: string;
}

type TestimonialItem = {
  name: string;
  role: string;
  text: string;
  company: string;
  rating?: number;
};

function mapTestimonials(
  section?: Page['testimonialsSection'],
  siteTestimonials?: { title?: string; description?: string; testimonials: unknown[] } | null
): TestimonialItem[] {
  const fromSection = section?.testimonials ?? [];
  const source =
    fromSection.length > 0 ? fromSection : (siteTestimonials?.testimonials ?? []);

  const items: TestimonialItem[] = [];

  for (const item of source) {
    const record = item as {
      name?: string;
      role?: string;
      company?: string;
      text?: unknown;
      rating?: number;
    };
    const text = tiptapToText(record.text);
    const name = record.name?.trim() || '';
    const role = record.role?.trim() || '';
    const company = record.company?.trim() || '';
    if (!text && !name) continue;

    items.push({
      text,
      name,
      role,
      company,
      rating: typeof record.rating === 'number' ? record.rating : undefined,
    });
  }

  return items;
}

function StarRating({ rating = 5, animate }: { rating?: number; animate?: boolean }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className={cn(
            'h-4 w-4 transition-all duration-500',
            animate ? 'scale-100 opacity-100' : 'scale-75 opacity-0',
            i < rating ? 'text-[var(--wb-primary)]' : 'text-[color-mix(in_srgb,var(--wb-text-main)_15%,transparent)]'
          )}
          style={{ transitionDelay: animate ? `${i * 80}ms` : '0ms' }}
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export function TestimonialsSection({
  testimonialsSection,
  className,
}: TestimonialsSectionProps) {
  const { testimonials: siteTestimonials } = useWebBuilder();

  const { ref: sectionRef, isVisible: sectionVisible } =
    useScrollAnimation<HTMLDivElement>({ threshold: 0.1 });

  const [active, setActive] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [direction, setDirection] = useState<'next' | 'prev'>('next');

  const title = useMemo(() => {
    const fromSection = tiptapToText(testimonialsSection?.title);
    if (fromSection) return fromSection;
    if (siteTestimonials?.title?.trim()) return siteTestimonials.title.trim();
    return 'What Our Clients Say';
  }, [testimonialsSection?.title, siteTestimonials?.title]);

  const description = useMemo(() => {
    const fromSection = tiptapToText(testimonialsSection?.description);
    if (fromSection) return fromSection;
    if (siteTestimonials?.description?.trim()) return siteTestimonials.description.trim();
    return 'Real feedback from property owners and contractors who trust us with their land clearing projects.';
  }, [testimonialsSection?.description, siteTestimonials?.description]);

  const testimonials = useMemo(
    () => mapTestimonials(testimonialsSection, siteTestimonials),
    [testimonialsSection, siteTestimonials]
  );

  const goTo = (index: number, dir: 'next' | 'prev' = 'next') => {
    if (index === active) return;
    setDirection(dir);
    setActive(index);
  };

  const goNext = () => goTo((active + 1) % testimonials.length, 'next');
  const goPrev = () => goTo((active - 1 + testimonials.length) % testimonials.length, 'prev');

  useEffect(() => {
    if (active >= testimonials.length) setActive(0);
  }, [active, testimonials.length]);

  useEffect(() => {
    if (!sectionVisible) return;
    setAnimating(true);
    const timer = setTimeout(() => setAnimating(false), 300);
    return () => clearTimeout(timer);
  }, [active, sectionVisible]);

  useEffect(() => {
    if (testimonials.length <= 1) return;
    const interval = setInterval(() => {
      setDirection('next');
      setActive((prev) => (prev + 1) % testimonials.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  if (testimonialsSection?.enabled === false) return null;
  if (!testimonials.length) return null;

  const current = testimonials[active];

  return (
    <section
      id="testimonials"
      ref={sectionRef}
      className={cn('relative py-8 lg:py-12 wb-surface-light overflow-hidden', className)}
    >
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[clamp(8rem,20vw,16rem)] font-heading font-black leading-none select-none opacity-[0.03] text-[var(--wb-text-main)]"
        aria-hidden
      >
        &ldquo;
      </div>

      <div className="container mx-auto px-6 lg:px-10 xl:px-14 relative z-10">
        <div
          className={`text-center mb-6 lg:mb-8 transition-all duration-1000 ${
            sectionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <span className="section-label">Client Voices</span>
          <h2 className="section-heading-lg">{title}</h2>
          <p className="section-desc mt-4 max-w-lg mx-auto">{description}</p>
        </div>

        <div
          className={`relative max-w-4xl mx-auto transition-all duration-1000 delay-200 ${
            sectionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
          }`}
        >
          <div className="relative min-h-[220px] sm:min-h-[260px] flex flex-col items-center justify-center text-center px-4 sm:px-8">
            <StarRating rating={current?.rating ?? 5} animate={sectionVisible && !animating} />

            <blockquote
              className={cn(
                'mt-6 text-xl sm:text-2xl md:text-3xl lg:text-4xl font-heading font-bold leading-snug text-[var(--wb-text-main)] max-w-3xl transition-all duration-300',
                animating
                  ? direction === 'next'
                    ? 'opacity-0 translate-x-8'
                    : 'opacity-0 -translate-x-8'
                  : 'opacity-100 translate-x-0'
              )}
            >
              &ldquo;{current?.text}&rdquo;
            </blockquote>

            <div
              className={cn(
                'mt-8 transition-all duration-300 delay-100',
                animating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
              )}
            >
              <p className="text-sm font-bold uppercase tracking-[0.15em] text-[var(--wb-text-main)]">
                {current?.name}
              </p>
              <p className="mt-1 text-xs uppercase tracking-[0.12em] text-[var(--wb-text-secondary)]">
                {[current?.role, current?.company].filter(Boolean).join(' · ')}
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            {testimonials.map((t, i) => {
              const isActive = i === active;
              const initials = t.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)
                .toUpperCase();

              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => goTo(i, i > active ? 'next' : 'prev')}
                  aria-label={`Show testimonial from ${t.name}`}
                  aria-current={isActive}
                  className={cn(
                    'group relative flex items-center gap-3 rounded-full border transition-all duration-500',
                    isActive
                      ? 'border-[color-mix(in_srgb,var(--wb-primary)_50%,transparent)] bg-[color-mix(in_srgb,var(--wb-primary)_10%,transparent)] pl-1.5 pr-5 py-1.5 scale-105'
                      : 'border-[color-mix(in_srgb,var(--wb-text-main)_12%,transparent)] px-1.5 py-1.5 hover:border-[color-mix(in_srgb,var(--wb-text-main)_25%,transparent)]'
                  )}
                >
                  <span
                    className={cn(
                      'flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold transition-all duration-500',
                      isActive
                        ? 'bg-[var(--wb-primary)] wb-text-on-dark'
                        : 'bg-[color-mix(in_srgb,var(--wb-text-main)_8%,transparent)] text-[var(--wb-text-main)]'
                    )}
                  >
                    {initials || String(i + 1)}
                  </span>
                  {isActive && (
                    <span className="text-xs font-medium text-[var(--wb-text-main)] whitespace-nowrap transition-opacity duration-300">
                      {t.name}
                    </span>
                  )}

                  {isActive && (
                    <span className="absolute bottom-0 left-[10%] right-[10%] h-0.5 overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--wb-text-main)_10%,transparent)]" aria-hidden>
                      <span
                        key={active}
                        className="block h-full origin-left bg-[var(--wb-primary)] transition-all duration-[7000ms] ease-linear"
                        style={{ width: sectionVisible ? '100%' : '0%' }}
                      />
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {testimonials.length > 1 && (
            <div className="mt-6 flex justify-center gap-3">
              <button
                type="button"
                onClick={goPrev}
                aria-label="Previous testimonial"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[color-mix(in_srgb,var(--wb-text-main)_14%,transparent)] text-[var(--wb-text-main)] transition-all duration-300 hover:bg-[var(--wb-text-main)] hover:text-[var(--wb-text-on-dark)] hover:scale-110"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path d="M15 19l-7-7 7-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button
                type="button"
                onClick={goNext}
                aria-label="Next testimonial"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[color-mix(in_srgb,var(--wb-text-main)_14%,transparent)] text-[var(--wb-text-main)] transition-all duration-300 hover:bg-[var(--wb-text-main)] hover:text-[var(--wb-text-on-dark)] hover:scale-110"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path d="M9 5l7 7-7 7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>

    </section>
  );
}

export default TestimonialsSection;
