'use client';

import Image from 'next/image';
import { useMemo } from 'react';
import type { Page } from '@/app/lib/types';
import { useWebBuilder } from '@/app/providers/WebBuilderProvider';
import { getPageHref } from '@/app/lib/siteContent';
import { tiptapToText } from '@/app/lib/seo';
import { cn, getImageSrc } from '@/app/lib/utils';

interface CTASectionProps {
  ctaSection?: Page['ctaSection'];
  className?: string;
}

function normalizeHref(href: string): string {
  const t = href.trim();
  if (t.startsWith('http') || t.startsWith('mailto:') || t.startsWith('tel:')) return t;
  return t.startsWith('/') ? t : `/${t}`;
}

export function CTASection({ ctaSection, className }: CTASectionProps) {
  const { pages } = useWebBuilder();

  const heading = useMemo(() => tiptapToText(ctaSection?.title), [ctaSection?.title]);
  const description = useMemo(
    () => tiptapToText(ctaSection?.description),
    [ctaSection?.description]
  );

  const ctaButton = useMemo(() => {
    const label = ctaSection?.primaryButton?.label?.trim();
    const href = ctaSection?.primaryButton?.href?.trim();
    if (label && href) return { label, href: normalizeHref(href) };
    if (label) {
      const contactPage = pages?.find((p) => p.pageType === 'contact');
      return {
        label,
        href: contactPage ? getPageHref(contactPage) : '/contact-us',
      };
    }
    return null;
  }, [ctaSection?.primaryButton, pages]);

  const image = useMemo(() => {
    const bg = ctaSection?.backgroundImage;
    if (typeof bg === 'string' && bg.trim()) return getImageSrc(bg);
    const legacyImage = (ctaSection as { image?: { url?: string } } | undefined)?.image?.url;
    if (legacyImage?.trim()) return getImageSrc(legacyImage);
    return '';
  }, [ctaSection]);

  if (ctaSection?.enabled === false) return null;
  if (!heading && !description && !ctaButton && !image) return null;

  return (
    <section
      id="cta"
      className={cn('gb-cta', !image && 'gb-cta--no-media', className)}
    >
      <div className="gb-cta-track">
        <div className="gb-cta-sticky">
          <div className="gb-cta-copy">
            {heading ? <h2 className="gb-cta-title">{heading}</h2> : null}
            {description ? <p className="gb-cta-desc">{description}</p> : null}
            {ctaButton ? (
              <a href={ctaButton.href} className="gb-btn-outline">
                {ctaButton.label}
              </a>
            ) : null}
          </div>

          {image ? (
            <div className="gb-cta-media">
              <Image
                src={image}
                alt={heading || ''}
                fill
                sizes="(max-width: 1024px) 100vw, 45vw"
                quality={90}
                className="gb-cta-image"
              />
            </div>
          ) : null}
        </div>

        {image ? (
          <div className="gb-cta-frame" aria-hidden>
            <div className="gb-cta-border gb-cta-border--top" />
            <div className="gb-cta-border gb-cta-border--bottom" />
          </div>
        ) : null}
      </div>
    </section>
  );
}

export default CTASection;
