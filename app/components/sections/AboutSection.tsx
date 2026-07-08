'use client';

import { OptimizedImage } from '@/app/components/ui/OptimizedImage';
import { IMAGE_SIZES } from '@/app/lib/imageDefaults';
import { useMemo } from 'react';
import type { Page } from '@/app/lib/types';
import { useWebBuilder } from '@/app/providers/WebBuilderProvider';
import { getPageHref } from '@/app/lib/siteContent';
import { tiptapToText } from '@/app/lib/seo';
import { resolvePrimaryCta } from '@/app/components/ui/made';
import { cn, getImageSrc } from '@/app/lib/utils';
import { useScrollAnimation, useStaggeredAnimation } from '@/hooks/useScrollAnimation';

interface AboutSectionProps {
  aboutSection?: Page['aboutSection'];
  page?: Page | null;
  className?: string;
  /** Legacy overrides — prefer CMS `aboutSection` data when present */
  title?: string;
  description?: string;
  features?: string[];
  ctaButton?: { href: string; label: string };
  image?: string;
}

function isCmsUploadUrl(src: string): boolean {
  return /\/uploads\//i.test(src);
}

function resolveAboutCta(
  page: Page | null | undefined,
  site: ReturnType<typeof useWebBuilder>['site'],
  pages: Page[] | undefined
): { href: string; label: string } | null {
  const primary = resolvePrimaryCta(page, site, pages);
  if (primary) return primary;

  const aboutPage = pages?.find((p) => p.pageType === 'about');
  if (aboutPage?.name?.trim()) {
    return { label: 'Show More', href: getPageHref(aboutPage) };
  }

  const contactPage = pages?.find((p) => p.pageType === 'contact');
  if (contactPage) {
    return { label: 'Show More', href: getPageHref(contactPage) };
  }

  return { href: '#contact', label: 'Show More' };
}

export function AboutSection({
  aboutSection,
  page,
  className,
  title: titleOverride,
  description: descriptionOverride,
  features: featuresOverride,
  ctaButton: ctaOverride,
  image: imageOverride,
}: AboutSectionProps) {
  const { site, pages } = useWebBuilder();
  const { ref: sectionRef, isVisible: sectionVisible } = useScrollAnimation<HTMLDivElement>({ threshold: 0.15 });

  const title = useMemo(
    () =>
      titleOverride ||
      tiptapToText(aboutSection?.title) ||
      'Through Our Work, Beyond Your Expectations',
    [titleOverride, aboutSection?.title]
  );

  const description = useMemo(
    () =>
      descriptionOverride ||
      tiptapToText(aboutSection?.description) ||
      'Specializing in land clearing and site preparation that captures the full scope of your project, delivers precision results, and creates lasting value for every acre we touch.',
    [descriptionOverride, aboutSection?.description]
  );

  const features = useMemo(() => {
    if (featuresOverride?.length) return featuresOverride;
    return (aboutSection?.features ?? [])
      .map((feature) => feature.label?.trim() || tiptapToText(feature.description))
      .filter(Boolean);
  }, [featuresOverride, aboutSection?.features]);

  const ctaButton = useMemo(
    () => ctaOverride || resolveAboutCta(page, site, pages),
    [ctaOverride, page, site, pages]
  );

  const aboutImage = useMemo(() => {
    if (imageOverride) return imageOverride;
    const url = aboutSection?.image?.url;
    return url ? getImageSrc(url) : undefined;
  }, [imageOverride, aboutSection?.image?.url]);

  const { ref: featuresRef, visibleItems } = useStaggeredAnimation(features.length, 100);

  if (aboutSection?.enabled === false) return null;

  return (
    <section
      id="about"
      className={cn(
        'relative w-full pt-4 sm:pt-6 lg:pt-8 pb-12 lg:pb-20 wb-surface-page overflow-hidden',
        className
      )}
    >
      <div className="container mx-auto px-6 lg:px-10 xl:px-14">
        <div
          ref={sectionRef}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 xl:gap-16 items-center"
        >
          <div
            className={`lg:col-span-5 relative transition-opacity duration-1000 ${
              sectionVisible ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="absolute -inset-3 rounded-3xl bg-[color-mix(in_srgb,var(--wb-text-main)_14%,transparent)] opacity-40 -z-10 translate-x-3 translate-y-3 hidden sm:block" />
            <div className="group relative aspect-[4/3] sm:aspect-[5/4] lg:aspect-[4/5] rounded-2xl overflow-hidden border border-[color-mix(in_srgb,var(--wb-text-main)_14%,transparent)] shadow-[0_20px_50px_-20px_rgba(0,0,0,0.15)]">
              {aboutImage ? (
                <OptimizedImage
                  src={aboutImage}
                  alt={aboutSection?.image?.altText || title || 'About Us'}
                  fill
                  className="object-cover"
                  priority
                  quality={100}
                  sizes={IMAGE_SIZES.aboutSplit}
                  unoptimized={isCmsUploadUrl(aboutImage)}
                />
              ) : (
                <div className="w-full h-full bg-[var(--wb-section-bg-light)]" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent pointer-events-none" />
            </div>
          </div>

          <div className="lg:col-span-7">
            <div
              className={`transition-all duration-700 delay-100 ${
                sectionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              }`}
            >
              <span className="section-label">About Us</span>
              <h2 className="section-heading-lg mb-5 sm:mb-6">{title}</h2>
              <p className="section-desc max-w-2xl mb-8 sm:mb-10">{description}</p>
            </div>

            {features.length > 0 && (
              <div
                ref={featuresRef}
                className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-8 sm:mb-10"
              >
                {features.map((feature, i) => (
                  <div
                    key={i}
                    className={`flex items-start gap-3 rounded-xl border wb-border-on-light wb-card-light px-4 py-3.5 transition-all duration-500 ${
                      visibleItems.includes(i) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                    }`}
                    style={{ transitionDelay: `${i * 80 + 200}ms` }}
                  >
                    <span
                      className="shrink-0 mt-0.5 text-[10px] font-bold tracking-[0.15em] text-[var(--wb-primary)]"
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span
                      className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.1em] leading-snug text-[var(--wb-text-main)]"
                    >
                      {feature}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {ctaButton && (
              <div
                className={`transition-all duration-700 delay-300 ${
                  sectionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                }`}
              >
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
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default AboutSection;
