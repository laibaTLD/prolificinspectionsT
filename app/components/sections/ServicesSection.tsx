'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Page, Service } from '@/app/lib/types';
import { useWebBuilder } from '@/app/providers/WebBuilderProvider';
import { tiptapToText } from '@/app/lib/seo';
import { cn, getImageSrc } from '@/app/lib/utils';
import { resolveServiceSlug } from '@/app/lib/serviceAreaSlugs';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

interface ServicesSectionProps {
  servicesSection?: Page['servicesSection'];
  companyDetailSection?: Page['companyDetailSection'];
  ctaSection?: Page['ctaSection'];
  page?: Page | null;
  className?: string;
}

type DisplayService = {
  id: string;
  name: string;
  description: string;
  price: string;
  features: string[];
  slug: string;
  imageUrl: string;
};

const FALLBACK_IMAGE =
  'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg';

function resolveFeatureLabels(service: Service): string[] {
  if (service.tags?.length) {
    return service.tags.map((tag) => tag.trim()).filter(Boolean);
  }

  return (service.features ?? [])
    .map((feature) => {
      if (typeof feature === 'string') return feature.trim();
      return tiptapToText(feature);
    })
    .filter(Boolean);
}

function mapServiceToDisplay(service: Service): DisplayService {
  const imageUrl = service.thumbnailImage?.url
    ? getImageSrc(service.thumbnailImage.url)
    : service.galleryImages?.[0]?.url
      ? getImageSrc(service.galleryImages[0].url)
      : '';

  return {
    id: service._id,
    name: service.name,
    description:
      tiptapToText(service.shortDescription) || tiptapToText(service.description) || '',
    price: service.price?.trim() || '',
    features: resolveFeatureLabels(service),
    slug: resolveServiceSlug(service),
    imageUrl,
  };
}

export function ServicesSection({
  servicesSection,
  className,
}: ServicesSectionProps) {
  const { services: allServices } = useWebBuilder();

  const { ref: titleRef, isVisible: titleVisible } = useScrollAnimation<HTMLDivElement>({ threshold: 0.1 });
  const { ref: panelRef, isVisible: panelVisible } = useScrollAnimation<HTMLDivElement>({ threshold: 0.12 });

  const [activeIndex, setActiveIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const services = useMemo(() => {
    const ids = servicesSection?.serviceIds ?? [];
    const selected =
      ids.length > 0
        ? ids
            .map((id) => allServices.find((s) => s._id === id))
            .filter((s): s is Service => Boolean(s))
        : allServices.filter((s) => s.status === 'published');

    return selected.map(mapServiceToDisplay);
  }, [servicesSection?.serviceIds, allServices]);

  const title = useMemo(
    () =>
      tiptapToText(servicesSection?.title) ||
      'Land Clearing Services Built for Your Site',
    [servicesSection?.title]
  );

  const description = useMemo(
    () =>
      tiptapToText(servicesSection?.description) ||
      'From brush removal to full site prep, explore the services we offer to get your property ready for what comes next.',
    [servicesSection?.description]
  );

  const getImageUrl = useCallback(
    (index: number) => services[index]?.imageUrl || FALLBACK_IMAGE,
    [services]
  );

  const selectService = (index: number) => {
    if (index === activeIndex || isTransitioning) return;
    setIsTransitioning(true);
    setActiveIndex(index);
    window.setTimeout(() => setIsTransitioning(false), 450);
  };

  useEffect(() => {
    if (activeIndex >= services.length) setActiveIndex(0);
  }, [activeIndex, services.length]);

  if (!servicesSection || servicesSection.enabled === false) return null;
  if (!services.length) return null;

  const active = services[activeIndex];

  return (
    <section
      id="services"
      className={cn(
        'relative pt-0 pb-12 lg:pb-20 overflow-hidden wb-surface-page',
        className
      )}
    >
      <div className="container mx-auto px-6 lg:px-10 xl:px-14 relative z-10">
        <div
          ref={titleRef}
          className={`grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-start mb-8 lg:mb-12 transition-all duration-1000 ${
            titleVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
          }`}
        >
          <div>
            <span
              className="section-label"
            >
              Our Expertise
            </span>
            <h2
              className="section-heading-lg"
            >
              {title}
            </h2>
          </div>
          <p
            className="section-desc lg:pt-2 border-l-0 lg:border-l-2 lg:pl-8 border-[color-mix(in_srgb,var(--wb-text-main)_14%,transparent)]"
          >
            {description}
          </p>
        </div>

        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-4 mb-6 lg:hidden -mx-6 px-6">
          {services.map((service, index) => (
            <button
              key={service.id}
              type="button"
              onClick={() => selectService(index)}
              className={`shrink-0 px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-[0.12em] transition-all duration-300 ${
                activeIndex === index
                  ? 'bg-[var(--wb-text-main)] text-[var(--wb-text-on-dark)]'
                  : 'border wb-border-on-light wb-text-on-light-secondary bg-[var(--wb-card-bg-light)]'
              }`}
            >
              {service.name}
            </button>
          ))}
        </div>

        <div
          ref={panelRef}
          className={`grid grid-cols-1 lg:grid-cols-[minmax(240px,340px)_1fr] lg:items-stretch gap-4 lg:gap-5 xl:gap-6 transition-all duration-1000 delay-150 ${
            panelVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <nav className="hidden lg:flex lg:flex-col lg:gap-2 lg:h-full lg:w-full" aria-label="Services">
            {services.map((service, index) => {
              const isActive = activeIndex === index;
              return (
                <button
                  key={service.id}
                  type="button"
                  onClick={() => selectService(index)}
                  className={`group flex-1 w-full text-left rounded-xl border px-5 py-4 transition-all duration-400 ease-[cubic-bezier(0.34,1.2,0.64,1)] ${
                    isActive
                      ? 'border-[color-mix(in_srgb,var(--wb-primary)_40%,transparent)] bg-[var(--wb-card-bg-light)] shadow-[0_12px_32px_-20px_rgba(0,0,0,0.15)]'
                      : 'border-transparent hover:border-[color-mix(in_srgb,var(--wb-text-main)_14%,transparent)] hover:bg-[var(--wb-card-bg-light)]/60'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <span
                      className={`text-[10px] font-bold tracking-[0.15em] mt-1 transition-colors ${
                        isActive ? 'text-[var(--wb-primary)]' : 'text-[var(--wb-text-secondary)]'
                      }`}
                    >
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <div className="min-w-0">
                      <p
                        className={`font-heading font-bold text-base leading-snug transition-colors ${
                          isActive
                            ? 'text-[var(--wb-text-main)]'
                            : 'text-[var(--wb-text-secondary)] group-hover:text-[var(--wb-text-main)]'
                        }`}
                      >
                        {service.name}
                      </p>
                      {service.price && (
                        <p
                          className="text-[10px] uppercase tracking-[0.1em] text-[var(--wb-text-secondary)] mt-1 opacity-70"
                        >
                          {service.price}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </nav>

          <article className="relative w-full min-w-0 rounded-2xl sm:rounded-3xl overflow-hidden border wb-border-on-light wb-card-light shadow-[0_24px_60px_-32px_color-mix(in_srgb,var(--wb-text-main)_18%,transparent)] min-h-[420px] sm:min-h-[480px]">
            <div className="absolute inset-0">
              <Image
                key={activeIndex}
                src={getImageUrl(activeIndex)}
                alt={active.name}
                fill
                className={`object-cover transition-all duration-500 ease-out ${
                  isTransitioning ? 'opacity-0 scale-105' : 'opacity-100 scale-100'
                }`}
                sizes="(max-width: 1024px) 100vw, 66vw"
                priority={activeIndex === 0}
              />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'linear-gradient(to top, color-mix(in srgb, var(--wb-section-bg-dark) 80%, transparent), color-mix(in srgb, var(--wb-section-bg-dark) 35%, transparent), color-mix(in srgb, var(--wb-section-bg-dark) 10%, transparent))',
                }}
              />
            </div>

            <div
              className={`relative z-10 h-full min-h-[420px] sm:min-h-[480px] flex flex-col justify-end p-6 sm:p-8 lg:p-10 wb-overlay-dark transition-all duration-500 ${
                isTransitioning ? 'opacity-0 translate-y-3' : 'opacity-100 translate-y-0'
              }`}
            >
              <span className="inline-block w-fit rounded-full wb-glass-on-dark border wb-border-on-dark px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] wb-text-on-dark mb-4">
                Service {String(activeIndex + 1).padStart(2, '0')}
              </span>

              <h3 className="font-heading font-bold text-2xl sm:text-3xl lg:text-4xl wb-text-on-dark leading-tight mb-4 max-w-2xl">
                {active.name}
              </h3>

              <p className="text-sm sm:text-base wb-text-on-dark-secondary leading-relaxed max-w-2xl mb-6 line-clamp-3 sm:line-clamp-4">
                {active.description}
              </p>

              {active.features.length > 0 && (
                <ul className="flex flex-wrap gap-2 mb-6 sm:mb-8">
                  {active.features.slice(0, 4).map((feature, fIdx) => (
                    <li
                      key={fIdx}
                      className="text-[10px] font-bold uppercase tracking-[0.1em] px-3 py-1.5 rounded-full wb-glass-on-dark border wb-border-on-dark wb-text-on-dark"
                    >
                      {feature}
                    </li>
                  ))}
                </ul>
              )}

              <div className="flex flex-wrap items-center gap-4">
                <Link href={`/service/${active.slug}`} className="btn-pill">
                  View Service
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>

                {active.price && (
                  <span className="text-xs font-bold uppercase tracking-[0.12em] wb-text-on-dark-secondary">
                    {active.price}
                  </span>
                )}
              </div>
            </div>

            <div className="absolute top-5 right-5 sm:top-6 sm:right-6 z-20 flex gap-1.5">
              {services.map((service, index) => (
                <button
                  key={service.id}
                  type="button"
                  aria-label={`Show service ${index + 1}`}
                  onClick={() => selectService(index)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    activeIndex === index
                      ? 'w-6 bg-[var(--wb-text-on-dark)]'
                      : 'w-1.5 bg-[color-mix(in_srgb,var(--wb-text-on-dark)_40%,transparent)] hover:bg-[color-mix(in_srgb,var(--wb-text-on-dark)_70%,transparent)]'
                  }`}
                />
              ))}
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}

export default ServicesSection;
