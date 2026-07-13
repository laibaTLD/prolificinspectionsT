'use client';

import Image from 'next/image';
import { useMemo } from 'react';
import type { Page } from '@/app/lib/types';
import { useWebBuilder } from '@/app/providers/WebBuilderProvider';
import { getPageHref } from '@/app/lib/siteContent';
import { tiptapToText } from '@/app/lib/seo';
import { cn, getImageSrc } from '@/app/lib/utils';

interface AboutSectionProps {
  aboutSection?: Page['aboutSection'];
  page?: Page | null;
  className?: string;
}

export function AboutSection({ aboutSection, page, className }: AboutSectionProps) {
  const { pages } = useWebBuilder();

  const title = useMemo(() => tiptapToText(aboutSection?.title), [aboutSection?.title]);
  const description = useMemo(
    () => tiptapToText(aboutSection?.description),
    [aboutSection?.description]
  );

  const eyebrow = useMemo(() => {
    const first = aboutSection?.features?.[0];
    if (!first) return '';
    return first.label?.trim() || tiptapToText(first.description);
  }, [aboutSection?.features]);

  const aboutImage = useMemo(() => {
    const url = aboutSection?.image?.url;
    return url ? getImageSrc(url) : '';
  }, [aboutSection?.image?.url]);

  const ctaButton = useMemo(() => {
    const contactPage = pages?.find((p) => p.pageType === 'contact');
    if (!contactPage?.name?.trim()) return null;
    return { label: contactPage.name.trim(), href: getPageHref(contactPage) };
  }, [pages]);

  if (aboutSection?.enabled === false) return null;
  if (!title && !description && !aboutImage) return null;

  return (
    <section
      id="about"
      className={cn('gb-about', !aboutImage && 'gb-about--no-media', className)}
    >
      <div className="gb-about-track">
        <div className="gb-about-sticky">
          <div className="gb-about-copy">
            {eyebrow ? <p className="gb-about-eyebrow">{eyebrow}</p> : null}
            {title ? <h2 className="gb-about-title">{title}</h2> : null}
            {description ? <p className="gb-about-desc">{description}</p> : null}
            {ctaButton ? (
              <a href={ctaButton.href} className="gb-btn-outline">
                {ctaButton.label}
              </a>
            ) : null}
          </div>

          {aboutImage ? (
            <div className="gb-about-media">
              <Image
                src={aboutImage}
                alt={aboutSection?.image?.altText || title || ''}
                fill
                sizes="(max-width: 1024px) 100vw, 45vw"
                quality={90}
                className="gb-about-image"
              />
            </div>
          ) : null}
        </div>

        {aboutImage ? (
          <div className="gb-about-frame" aria-hidden>
            <div className="gb-about-border gb-about-border--top" />
            <div className="gb-about-border gb-about-border--bottom" />
          </div>
        ) : null}
      </div>
    </section>
  );
}

export default AboutSection;
