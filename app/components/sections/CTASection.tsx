'use client';

import { useMemo } from 'react';
import Image from 'next/image';
import type { Page } from '@/app/lib/types';
import { useWebBuilder } from '@/app/providers/WebBuilderProvider';
import { getPageHref } from '@/app/lib/siteContent';
import { tiptapToText } from '@/app/lib/seo';
import { cn, getImageSrc } from '@/app/lib/utils';
import { useEditorialTheme } from '@/hooks/useEditorialTheme';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

interface CTASectionProps {
  ctaSection?: Page['ctaSection'];
  className?: string;
  /** Legacy overrides — prefer CMS `ctaSection` data when present */
  subHeading?: string;
  heading?: string;
  description?: string;
  ctaButton?: { href: string; label: string };
  backgroundImage?: string;
}

function normalizeHref(href: string): string {
  const t = href.trim();
  if (t.startsWith('http') || t.startsWith('mailto:') || t.startsWith('tel:')) return t;
  return t.startsWith('/') ? t : `/${t}`;
}

function resolveCtaImage(ctaSection?: Page['ctaSection'], override?: string): string {
  if (override?.trim()) return getImageSrc(override);

  if (!ctaSection) return '';

  const raw = ctaSection.backgroundImage;
  if (typeof raw === 'string' && raw.trim()) return getImageSrc(raw);

  const extended = ctaSection as Page['ctaSection'] & {
    image?: string | { url?: string; altText?: string };
    mediaItems?: Array<{ url?: string }>;
  };

  if (typeof extended.image === 'string' && extended.image.trim()) {
    return getImageSrc(extended.image);
  }
  if (extended.image && typeof extended.image === 'object' && extended.image.url) {
    return getImageSrc(extended.image.url);
  }
  const mediaUrl = extended.mediaItems?.[0]?.url;
  return mediaUrl ? getImageSrc(mediaUrl) : '';
}

export function CTASection({
  ctaSection,
  className,
  subHeading: subHeadingOverride,
  heading: headingOverride,
  description: descriptionOverride,
  ctaButton: ctaOverride,
  backgroundImage: backgroundOverride,
}: CTASectionProps) {
  const { pages } = useWebBuilder();
  const theme = useEditorialTheme();

  const { ref: contentRef, isVisible: contentVisible } =
    useScrollAnimation<HTMLDivElement>({ threshold: 0.2 });

  const subHeading = subHeadingOverride || 'Next Steps';

  const heading = useMemo(
    () =>
      headingOverride ||
      tiptapToText(ctaSection?.title) ||
      'Ready to Start Your Project?',
    [headingOverride, ctaSection?.title]
  );

  const description = useMemo(
    () =>
      descriptionOverride ||
      tiptapToText(ctaSection?.description) ||
      'Tell us about your site and we will follow up with a clear plan, timeline, and quote.',
    [descriptionOverride, ctaSection?.description]
  );

  const ctaButton = useMemo(() => {
    if (ctaOverride) return ctaOverride;
    const label = ctaSection?.primaryButton?.label?.trim();
    const href = ctaSection?.primaryButton?.href?.trim();
    if (label && href) return { label, href: normalizeHref(href) };
    const contactPage = pages?.find((p) => p.pageType === 'contact');
    return {
      label: label || 'Contact Us',
      href: contactPage ? getPageHref(contactPage) : '/contact-us',
    };
  }, [ctaOverride, ctaSection?.primaryButton, pages]);

  const ctaImage = useMemo(
    () => resolveCtaImage(ctaSection, backgroundOverride),
    [ctaSection, backgroundOverride]
  );

  if (ctaSection?.enabled === false) return null;

  return (
    <section
      id="cta"
      className={cn('relative min-h-[80vh] flex items-center overflow-hidden wb-surface-dark', className)}
    >
      <div className="absolute inset-0 z-0">
        {ctaImage && (
          <Image
            src={ctaImage}
            alt={heading || 'CTA background'}
            fill
            className="object-cover opacity-40 grayscale"
            quality={90}
            sizes="100vw"
          />
        )}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to right, color-mix(in srgb, ${theme.primary} 80%, var(--wb-section-bg-dark)) 0%, color-mix(in srgb, var(--wb-section-bg-dark) 80%, transparent) 100%)`,
          }}
        />
      </div>

      <div
        className="absolute top-0 left-1/4 w-px h-full hidden lg:block"
        style={{ backgroundColor: 'color-mix(in srgb, var(--wb-text-on-dark) 10%, transparent)' }}
      />

      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        <div
          ref={contentRef}
          className={`grid grid-cols-1 lg:grid-cols-12 gap-12 items-center transition-all duration-1000 ${
            contentVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
          }`}
        >
          <div className="lg:col-span-8 lg:col-start-2">
            <span className="section-label">{subHeading}</span>

            <h2 className="section-heading-lg mb-6 sm:mb-8">{heading}</h2>

            <p className="section-desc max-w-2xl mb-10 sm:mb-12">{description}</p>

            {ctaButton && (
              <div className="flex flex-col sm:flex-row items-start gap-8">
                <a href={ctaButton.href} className="btn-pill">
                  {ctaButton.label}
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </a>

                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-widest wb-text-on-dark-secondary opacity-60 mb-1">
                    Direct Inquiries
                  </span>
                  <span className="wb-text-on-dark font-light text-lg tracking-tight">Available 24/7</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 w-full h-1/3 wb-fade-vignette-b pointer-events-none" />
    </section>
  );
}

export default CTASection;
