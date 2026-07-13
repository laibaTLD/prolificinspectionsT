'use client';

import Image from 'next/image';
import { useMemo } from 'react';
import type { Page } from '@/app/lib/types';
import { tiptapToText } from '@/app/lib/seo';
import { cn, getImageSrc } from '@/app/lib/utils';

interface CompanyDetailSectionProps {
  companyDetailSection?: Page['companyDetailSection'];
  className?: string;
}

export function CompanyDetailSection({
  companyDetailSection,
  className,
}: CompanyDetailSectionProps) {
  const title = useMemo(
    () => tiptapToText(companyDetailSection?.title),
    [companyDetailSection?.title]
  );

  const description = useMemo(
    () => tiptapToText(companyDetailSection?.description),
    [companyDetailSection?.description]
  );

  const details = useMemo(() => {
    return (companyDetailSection?.details ?? [])
      .map((detail, index) => {
        const detailTitle =
          tiptapToText(detail.title) || detail.label?.trim() || '';
        const detailDesc =
          tiptapToText(detail.description) || tiptapToText(detail.value) || '';
        const imageUrl = detail.image?.url ? getImageSrc(detail.image.url) : '';
        if (!detailTitle && !detailDesc && !imageUrl) return null;
        return {
          id: String(index),
          title: detailTitle,
          description: detailDesc,
          imageUrl,
        };
      })
      .filter(
        (
          item
        ): item is { id: string; title: string; description: string; imageUrl: string } =>
          Boolean(item)
      );
  }, [companyDetailSection?.details]);

  if (companyDetailSection?.enabled === false) return null;
  if (!title && !description && details.length === 0) return null;

  return (
    <section id="company-details" className={cn('gb-section gb-section-alt', className)}>
      <div className="gb-container">
        {(title || description) && (
          <div className="gb-section-head gb-section-head-row">
            {title ? <h2 className="gb-section-title">{title}</h2> : null}
            {description ? <p className="gb-section-desc">{description}</p> : null}
          </div>
        )}

        {details.length > 0 ? (
          <div className="gb-advantage-grid">
            {details.map((item) => (
              <article key={item.id} className="gb-advantage-card">
                <div className="gb-advantage-copy">
                  {item.title ? <h3 className="gb-offering-title">{item.title}</h3> : null}
                  {item.description ? (
                    <p className="gb-offering-desc">{item.description}</p>
                  ) : null}
                </div>
                {item.imageUrl ? (
                  <div className="gb-advantage-media">
                    <Image
                      src={item.imageUrl}
                      alt={item.title || ''}
                      fill
                      sizes="(max-width: 768px) 100vw, 25vw"
                      className="object-cover"
                    />
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

export default CompanyDetailSection;
