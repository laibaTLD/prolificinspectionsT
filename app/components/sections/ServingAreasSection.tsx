'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import type { Page, Service, ServiceAreaPage } from '@/app/lib/types';
import { useWebBuilder } from '@/app/providers/WebBuilderProvider';
import { getBusinessTagline } from '@/app/lib/siteContent';
import { tiptapToText } from '@/app/lib/seo';
import { cn } from '@/app/lib/utils';
import {
  getAreaCity,
  getAreaRegion,
  getServiceAreaPageHref,
  getServiceSlugFromAreaPage,
  normalizeSlug,
  resolveServiceSlug,
} from '@/app/lib/serviceAreaSlugs';
import { useScrollAnimation, useStaggeredAnimation } from '@/hooks/useScrollAnimation';

interface ServingAreasSectionProps {
  servingAreasSection?: Page['servingAreasSection'];
  className?: string;
}

type DisplayArea = {
  city: string;
  region: string;
  description?: string;
  href?: string;
};

function resolveAreaCity(area: unknown): string {
  const fromHelper = getAreaCity(area);
  if (fromHelper) return fromHelper;

  if (area && typeof area === 'object') {
    const record = area as Record<string, unknown>;
    for (const key of ['area', 'location', 'label', 'title', 'name']) {
      const value = record[key];
      if (typeof value === 'string' && value.trim()) return value.trim();
    }
  }

  return '';
}

function getAreaDescription(area: unknown): string {
  if (area && typeof area === 'object') {
    const desc = (area as { description?: string }).description;
    return typeof desc === 'string' ? desc.trim() : '';
  }
  return '';
}

function normalizeServiceArea(area: unknown): Omit<DisplayArea, 'href'> | null {
  const city = resolveAreaCity(area);
  if (!city) return null;

  return {
    city,
    region: getAreaRegion(area),
    description: getAreaDescription(area) || undefined,
  };
}

function isVisibleService(service: Service): boolean {
  return service.status !== 'draft' && service.status !== 'archived';
}

function areaKey(area: Pick<DisplayArea, 'city' | 'region'>): string {
  return `${area.city.toLowerCase()}|${area.region.toLowerCase()}`;
}

function enrichArea(
  area: Omit<DisplayArea, 'href'>,
  serviceSlug: string,
  serviceAreaPages: ServiceAreaPage[] | undefined
): DisplayArea {
  const href = getServiceAreaPageHref(serviceSlug, area, serviceAreaPages);
  return { ...area, href: href || undefined };
}

function buildServiceAreas(
  servingAreasSection: Page['servingAreasSection'] | undefined,
  services: Service[],
  serviceAreaPages: ServiceAreaPage[],
  siteServiceAreas: string[] | undefined
): DisplayArea[] {
  const result: DisplayArea[] = [];
  const seen = new Set<string>();

  const addArea = (area: unknown, serviceSlug: string) => {
    const normalized = normalizeServiceArea(area);
    if (!normalized) return;
    const key = areaKey(normalized);
    if (seen.has(key)) return;
    seen.add(key);
    result.push(enrichArea(normalized, serviceSlug, serviceAreaPages));
  };

  const resolveSlugForPage = (page: ServiceAreaPage): string => {
    const serviceRef = page.serviceId as string | { slug?: string } | undefined;
    if (serviceRef && typeof serviceRef === 'object' && serviceRef.slug) {
      return resolveServiceSlug({ slug: serviceRef.slug });
    }
    if (typeof serviceRef === 'string') {
      const svc = services.find((s) => s._id === serviceRef);
      if (svc) return resolveServiceSlug(svc);
    }
    return 'service';
  };

  const addAreasFromServiceAreaPages = (filterPublished = true) => {
    serviceAreaPages.forEach((page) => {
      if (filterPublished && page.status !== 'published') return;
      if (!page.city?.trim()) return;
      addArea({ city: page.city, region: page.region }, resolveSlugForPage(page));
    });
  };

  const addAreasFromServiceAreaPagesForSlug = (slug: string, filterPublished = true) => {
    const normSlug = normalizeSlug(slug);
    serviceAreaPages.forEach((page) => {
      if (filterPublished && page.status !== 'published') return;
      if (!page.city?.trim()) return;
      const pageSlug = getServiceSlugFromAreaPage(page) || resolveSlugForPage(page);
      if (normalizeSlug(pageSlug) !== normSlug) return;
      addArea({ city: page.city, region: page.region }, normSlug);
    });
  };

  const sectionSlug = servingAreasSection?.serviceSlug?.trim();
  if (sectionSlug) {
    const normSectionSlug = normalizeSlug(sectionSlug);
    const match = services.find((s) => resolveServiceSlug(s) === normSectionSlug);
    const slug = match ? resolveServiceSlug(match) : normSectionSlug;

    addAreasFromServiceAreaPagesForSlug(slug, true);
    if (result.length === 0) addAreasFromServiceAreaPagesForSlug(slug, false);
    if (result.length === 0) {
      (match?.serviceAreas ?? []).forEach((area) => addArea(area, slug));
    }
    return result;
  }

  addAreasFromServiceAreaPages(true);
  if (result.length > 0) return result;

  const visibleServices = services.filter(isVisibleService);
  for (const service of visibleServices) {
    const slug = resolveServiceSlug(service);
    (service.serviceAreas ?? []).forEach((area) => addArea(area, slug));
  }
  if (result.length > 0) return result;

  const defaultSlug = visibleServices[0]
    ? resolveServiceSlug(visibleServices[0])
    : services[0]
      ? resolveServiceSlug(services[0])
      : 'service';
  (siteServiceAreas ?? []).forEach((area) => addArea(area, defaultSlug));
  if (result.length > 0) return result;

  addAreasFromServiceAreaPages(false);
  return result;
}

export function ServingAreasSection({
  servingAreasSection,
  className,
}: ServingAreasSectionProps) {
  const { site, services, serviceAreaPages } = useWebBuilder();

  const serviceAreas = useMemo(
    () =>
      buildServiceAreas(
        servingAreasSection,
        services,
        serviceAreaPages,
        site?.serviceAreas
      ),
    [servingAreasSection, services, serviceAreaPages, site?.serviceAreas]
  );

  const title = useMemo(
    () => tiptapToText(servingAreasSection?.title) || 'Service Areas',
    [servingAreasSection?.title]
  );

  const description = useMemo(
    () =>
      tiptapToText(servingAreasSection?.description) ||
      getBusinessTagline(site) ||
      'Providing expert services across the following key regions.',
    [servingAreasSection?.description, site]
  );

  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation<HTMLDivElement>({ threshold: 0.1 });
  const { ref: areasRef, visibleItems: areasVisible } = useStaggeredAnimation(serviceAreas.length, 100);

  if (servingAreasSection?.enabled === false) return null;
  if (!serviceAreas.length) return null;

  return (
    <section
      id="service-areas"
      className={cn(
        'relative pt-8 pb-8 lg:pt-10 lg:pb-10 wb-surface-page overflow-hidden',
        className
      )}
    >
      <div className="container mx-auto px-6 lg:px-10 xl:px-14 relative z-10">
        <div
          ref={headerRef}
          className={`max-w-4xl mb-6 transition-all duration-1000 ${
            headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
          }`}
        >
          <span
            className="section-label"
          >
            Coverage
          </span>
          <h2
            className="section-heading-lg mb-6"
          >
            {title}
          </h2>
          <p
            className="section-desc max-w-2xl"
          >
            {description}
          </p>
        </div>

        <div
          ref={areasRef}
          className="flex overflow-x-auto gap-6 pb-2 snap-x snap-mandatory scrollbar-hide -mx-6 px-6 lg:-mx-10 lg:px-10 xl:-mx-14 xl:px-14"
        >
          {serviceAreas.map((area, index) => {
            const card = (
              <div className="relative pb-4 flex flex-col group border-b border-[color-mix(in_srgb,var(--wb-text-main)_12%,transparent)]">
                <div className="flex items-center gap-4 mb-6">
                  <span
                    className="text-[10px] font-bold tracking-[0.12em] text-[var(--wb-text-secondary)]"
                  >
                    {(index + 1).toString().padStart(2, '0')}
                  </span>
                  <div className="h-px w-8 transition-all duration-700 group-hover:w-16 bg-[var(--wb-primary)]" />
                </div>

                <h3
                  className="text-xl font-heading font-bold tracking-tight mb-2 text-[var(--wb-text-main)]"
                >
                  {area.city}
                </h3>

                {area.region && (
                  <p
                    className="text-[10px] uppercase tracking-[0.12em] font-bold mb-4 text-[var(--wb-primary)]"
                  >
                    {area.region}
                  </p>
                )}

                {area.description && (
                  <p
                    className="section-desc text-sm mb-6 line-clamp-3"
                  >
                    {area.description}
                  </p>
                )}

                <div className="mt-auto flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--wb-primary)]" />
                  <span
                    className="text-[10px] uppercase tracking-[0.12em] font-bold text-[var(--wb-text-secondary)]"
                  >
                    Service Region
                  </span>
                </div>
              </div>
            );

            return (
              <div
                key={areaKey(area)}
                className={`min-w-[160px] sm:min-w-[200px] md:min-w-[220px] lg:min-w-[18%] snap-start transition-all duration-1000 ${
                  areasVisible.includes(index) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
                }`}
              >
                {area.href ? (
                  <Link href={area.href} className="block">
                    {card}
                  </Link>
                ) : (
                  card
                )}
              </div>
            );
          })}
        </div>

        <div className="flex justify-start items-center gap-3 mt-4 opacity-40">
          <div className="w-12 h-px bg-[var(--wb-text-secondary)]" />
          <span
            className="text-[9px] uppercase tracking-[0.12em] font-medium text-[var(--wb-text-secondary)]"
          >
            Scroll to explore
          </span>
        </div>
      </div>
    </section>
  );
}

export default ServingAreasSection;
