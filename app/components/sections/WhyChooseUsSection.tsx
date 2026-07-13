'use client';

import { useMemo } from 'react';
import type { Page } from '@/app/lib/types';
import { tiptapToText } from '@/app/lib/seo';
import { cn } from '@/app/lib/utils';

interface WhyChooseUsSectionProps {
  whyChooseUsSection?: Page['whyChooseUsSection'];
  className?: string;
}

function CardIcon() {
  return (
    <svg viewBox="0 0 24 24" className="gb-card-icon" fill="none" aria-hidden>
      <path
        d="M4 12l8-7 8 7v8H4v-8z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path d="M10 20v-6h4v6" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
    </svg>
  );
}

export function WhyChooseUsSection({
  whyChooseUsSection,
  className,
}: WhyChooseUsSectionProps) {
  const title = useMemo(
    () => tiptapToText(whyChooseUsSection?.title),
    [whyChooseUsSection?.title]
  );

  const description = useMemo(
    () => tiptapToText(whyChooseUsSection?.description),
    [whyChooseUsSection?.description]
  );

  const items = useMemo(() => {
    return (whyChooseUsSection?.items ?? [])
      .map((item, index) => {
        const itemTitle = tiptapToText(item?.title);
        const itemDesc = tiptapToText(item?.description);
        if (!itemTitle && !itemDesc) return null;
        return {
          id: String(index),
          title: itemTitle,
          description: itemDesc,
        };
      })
      .filter((item): item is { id: string; title: string; description: string } => Boolean(item));
  }, [whyChooseUsSection?.items]);

  if (!whyChooseUsSection || whyChooseUsSection.enabled === false) return null;
  if (!title && !description && items.length === 0) return null;

  return (
    <section id="why-choose-us" className={cn('gb-section', className)}>
      <div className="gb-container">
        {(title || description) && (
          <div className="gb-section-head">
            {title ? <h2 className="gb-section-title">{title}</h2> : null}
            {description ? <p className="gb-section-desc">{description}</p> : null}
          </div>
        )}

        {items.length > 0 ? (
          <div className="gb-offerings-grid">
            {items.map((item) => (
              <article key={item.id} className="gb-offering-card">
                <CardIcon />
                {item.title ? <h3 className="gb-offering-title">{item.title}</h3> : null}
                {item.description ? (
                  <p className="gb-offering-desc">{item.description}</p>
                ) : null}
              </article>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

export default WhyChooseUsSection;
