'use client';

import { useMemo } from 'react';
import type { Page } from '@/app/lib/types';
import { useWebBuilder } from '@/app/providers/WebBuilderProvider';
import { tiptapToText } from '@/app/lib/seo';
import { cn } from '@/app/lib/utils';

interface TestimonialsSectionProps {
  testimonialsSection?: Page['testimonialsSection'];
  className?: string;
}

type TestimonialItem = {
  name: string;
  role: string;
  text: string;
  company: string;
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
      content?: unknown;
    };
    const text = tiptapToText(record.text) || tiptapToText(record.content);
    const name = record.name?.trim() || '';
    const role = record.role?.trim() || '';
    const company = record.company?.trim() || '';
    if (!text && !name) continue;

    items.push({ text, name, role, company });
  }

  return items;
}

export function TestimonialsSection({
  testimonialsSection,
  className,
}: TestimonialsSectionProps) {
  const { testimonials: siteTestimonials } = useWebBuilder();

  const title = useMemo(() => {
    const fromSection = tiptapToText(testimonialsSection?.title);
    if (fromSection) return fromSection;
    return siteTestimonials?.title?.trim() || '';
  }, [testimonialsSection?.title, siteTestimonials?.title]);

  const testimonials = useMemo(
    () => mapTestimonials(testimonialsSection, siteTestimonials),
    [testimonialsSection, siteTestimonials]
  );

  if (testimonialsSection?.enabled === false) return null;
  if (!testimonials.length) return null;

  return (
    <section id="testimonials" className={cn('gb-section', className)}>
      <div className="gb-container">
        {title ? <h2 className="gb-section-title">{title}</h2> : null}

        <ul className="gb-stories-list">
          {testimonials.map((item, index) => (
            <li key={`${item.name}-${index}`} className="gb-stories-item">
              <div className="gb-stories-meta">
                <span className="gb-stories-avatar" aria-hidden>
                  {(item.name || '?').charAt(0).toUpperCase()}
                </span>
                <div>
                  {item.name ? <p className="gb-stories-name">{item.name}</p> : null}
                  {(item.role || item.company) && (
                    <p className="gb-stories-role">
                      {[item.role, item.company].filter(Boolean).join(' · ')}
                    </p>
                  )}
                </div>
              </div>
              {item.text ? <p className="gb-stories-quote">{item.text}</p> : null}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default TestimonialsSection;
