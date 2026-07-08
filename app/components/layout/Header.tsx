'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import type { Service, ServiceAreaPage } from '@/app/lib/types';
import { useWebBuilder } from '@/app/providers/WebBuilderProvider';
import { getBrandName, getHeaderNavLinks } from '@/app/lib/siteContent';
import { getImageSrc } from '@/app/lib/utils';
import {
  getAreaCity,
  getAreaRegion,
  getServiceAreaPageHref,
  getServiceSlugFromAreaPage,
  normalizeSlug,
  resolveServiceSlug,
} from '@/app/lib/serviceAreaSlugs';

type DisplayArea = {
  city: string;
  region: string;
  href?: string;
};

type ServiceMenuItem = {
  slug: string;
  name: string;
  href: string;
  areas: DisplayArea[];
};

function getAreasForService(
  service: Service,
  serviceAreaPages: ServiceAreaPage[],
  siteServiceAreas?: unknown[]
): DisplayArea[] {
  const slug = resolveServiceSlug(service);
  const result: DisplayArea[] = [];
  const seen = new Set<string>();

  const add = (city: string, region: string) => {
    const key = `${city}|${region}`.toLowerCase();
    if (!city.trim() || seen.has(key)) return;
    seen.add(key);
    result.push({
      city: city.trim(),
      region: region.trim(),
      href: getServiceAreaPageHref(slug, { city, region }, serviceAreaPages) || undefined,
    });
  };

  for (const page of serviceAreaPages) {
    if (page.status !== 'published' || !page.city?.trim()) continue;

    const pageServiceSlug = getServiceSlugFromAreaPage(page);
    let matches = pageServiceSlug && normalizeSlug(pageServiceSlug) === normalizeSlug(slug);

    if (!matches && page.serviceId) {
      const ref = page.serviceId as string | { _id?: string; slug?: string };
      if (typeof ref === 'string') {
        matches = ref === service._id;
      } else if (ref && typeof ref === 'object') {
        matches =
          ref._id === service._id ||
          Boolean(ref.slug && normalizeSlug(ref.slug) === normalizeSlug(slug));
      }
    }

    if (matches) add(page.city, page.region || '');
  }

  if (!result.length) {
    for (const area of service.serviceAreas ?? []) {
      add(getAreaCity(area), getAreaRegion(area));
    }
  }

  if (!result.length && siteServiceAreas?.length) {
    for (const area of siteServiceAreas) {
      add(getAreaCity(area), getAreaRegion(area));
    }
  }

  return result;
}

function buildServiceMenuItems(
  services: Service[],
  serviceAreaPages: ServiceAreaPage[],
  siteServiceAreas?: unknown[]
): ServiceMenuItem[] {
  return services
    .filter((s) => s.status === 'published' && s.name?.trim())
    .map((service) => {
      const slug = resolveServiceSlug(service);
      return {
        slug,
        name: service.name.trim(),
        href: `/service/${slug}`,
        areas: getAreasForService(service, serviceAreaPages, siteServiceAreas),
      };
    });
}

function isServicesNavLink(href: string): boolean {
  return href === '/#services' || href === '/services';
}

function areaLabel(area: DisplayArea): string {
  return area.region ? `${area.city}, ${area.region}` : area.city;
}

function ServicesMegaMenu({
  label,
  sectionHref,
  items,
}: {
  label: string;
  sectionHref: string;
  items: ServiceMenuItem[];
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = items[activeIndex] ?? items[0];

  if (!items.length) return null;

  return (
    <div
      className="relative group"
      onMouseLeave={() => setActiveIndex(0)}
    >
      <button
        type="button"
        className="font-heading text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--wb-text-secondary)] group-hover:text-[var(--wb-text-main)] transition-colors flex items-center gap-2"
      >
        {label}
        <span className="text-[9px] opacity-50 transition-transform duration-300 group-hover:rotate-180">
          ▼
        </span>
      </button>

      <div className="invisible opacity-0 translate-y-2 group-hover:visible group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 absolute top-full right-0 pt-4 pointer-events-none group-hover:pointer-events-auto">
        <div className="flex w-[min(42rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-[color-mix(in_srgb,var(--wb-text-main)_14%,transparent)] bg-[var(--wb-card-bg-light)] shadow-xl">
          <div className="w-1/2 min-w-0 border-r border-[color-mix(in_srgb,var(--wb-text-main)_10%,transparent)] bg-[color-mix(in_srgb,var(--wb-section-bg-light)_60%,var(--wb-card-bg-light))] p-6">
            <span className="section-label mb-3">Serving Areas</span>
            {active && (
              <>
                <h4 className="text-lg font-heading font-bold text-[var(--wb-text-main)] mb-4">
                  {active.name}
                </h4>
                <div className="space-y-2 max-h-[min(16rem,50vh)] overflow-y-auto">
                  {active.areas.length > 0 ? (
                    active.areas.map((area, idx) => (
                      <Link
                        key={`${area.city}-${area.region}-${idx}`}
                        href={area.href || '/#service-areas'}
                        className="flex items-center gap-2 text-sm text-[var(--wb-primary)] hover:opacity-80 transition-opacity"
                      >
                        <svg className="h-4 w-4 shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
                          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                        {areaLabel(area)}
                      </Link>
                    ))
                  ) : (
                    <p className="text-sm text-[var(--wb-text-secondary)]">
                      Serving areas coming soon.
                    </p>
                  )}
                </div>
                <Link
                  href={active.href}
                  className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-[var(--wb-primary)] hover:opacity-80 transition-opacity"
                >
                  View service details
                  <span aria-hidden>→</span>
                </Link>
              </>
            )}
          </div>

          <div className="w-1/2 min-w-0 p-6">
            <span className="section-label mb-3">Services</span>
            <Link
              href={sectionHref}
              className="mb-3 flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-[var(--wb-text-main)] hover:bg-[color-mix(in_srgb,var(--wb-text-main)_6%,transparent)] transition-colors"
            >
              All Services
            </Link>
            <div className="space-y-1 max-h-[min(18rem,55vh)] overflow-y-auto">
              {items.map((item, index) => {
                const isActive = index === activeIndex;
                return (
                  <button
                    key={item.slug}
                    type="button"
                    onMouseEnter={() => setActiveIndex(index)}
                    onFocus={() => setActiveIndex(index)}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-[color-mix(in_srgb,var(--wb-text-main)_8%,transparent)] text-[var(--wb-text-main)]'
                        : 'text-[var(--wb-text-secondary)] hover:bg-[color-mix(in_srgb,var(--wb-text-main)_5%,transparent)] hover:text-[var(--wb-text-main)]'
                    }`}
                  >
                    <span>{item.name}</span>
                    {item.areas.length > 0 && (
                      <span className="text-[var(--wb-text-secondary)]" aria-hidden>
                        ‹
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Header() {
  const { site, pages, services, serviceAreaPages } = useWebBuilder();

  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [expandedMobileService, setExpandedMobileService] = useState<string | null>(null);

  const businessName = getBrandName(site) || 'ACE Grading LLC';
  const phoneNumber = site?.business?.phone?.trim() || '';

  const logoSrc = useMemo(() => {
    const raw = site?.footer?.logo?.url || site?.theme?.logoUrl;
    return raw ? getImageSrc(raw) : '/logo.png';
  }, [site?.footer?.logo?.url, site?.theme?.logoUrl]);

  const serviceMenuItems = useMemo(
    () => buildServiceMenuItems(services, serviceAreaPages, site?.serviceAreas),
    [services, serviceAreaPages, site?.serviceAreas]
  );

  const { mainNavLinks, mobileNavLinks, contactNav } = useMemo(
    () => getHeaderNavLinks(pages),
    [pages]
  );

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <nav
      className={`fixed w-full z-[100] transition-all duration-500 ${
        scrolled ? 'site-glass-nav py-3 lg:py-4' : 'bg-transparent py-5 lg:py-7'
      }`}
    >
      <div className="container mx-auto px-6 lg:px-10 xl:px-14 relative">
        <div className="flex justify-between items-center relative z-10">
          <Link href="/" className="flex items-center shrink-0">
            <Image
              src={logoSrc}
              alt={site?.footer?.logo?.altText?.trim() || businessName}
              width={360}
              height={100}
              priority
              className={`transition-all duration-500 object-contain w-auto ${
                scrolled ? 'h-10 lg:h-12' : 'h-12 lg:h-16'
              }`}
            />
          </Link>

          <div className="hidden lg:flex items-center gap-5 xl:gap-8 min-w-0">
            {mainNavLinks.map((link) => {
              if (isServicesNavLink(link.href) && serviceMenuItems.length > 0) {
                return (
                  <ServicesMegaMenu
                    key={link.id}
                    label={link.label}
                    sectionHref={link.href}
                    items={serviceMenuItems}
                  />
                );
              }

              return (
                <Link
                  key={link.id}
                  href={link.href}
                  className="font-heading text-[10px] xl:text-[11px] font-bold uppercase tracking-[0.18em] xl:tracking-[0.22em] text-[var(--wb-text-secondary)] hover:text-[var(--wb-text-main)] transition-colors relative group whitespace-nowrap"
                >
                  {link.label}
                  <span className="absolute -bottom-1.5 left-0 w-0 h-px bg-[var(--wb-primary)] transition-all duration-300 group-hover:w-full" />
                </Link>
              );
            })}

            <Link
              href={contactNav.href}
              className="btn-pill text-[10px] py-2.5 px-5"
            >
              {contactNav.label}
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
            className="lg:hidden relative z-[110] p-2 -mr-2"
          >
            <div className="w-7 flex flex-col items-end gap-1.5">
              <div
                className={`h-px bg-[var(--wb-text-main)] transition-all duration-300 ${
                  isOpen ? 'w-7 rotate-45 translate-y-[5px]' : 'w-7'
                }`}
              />
              <div
                className={`h-px bg-[var(--wb-text-main)] transition-all duration-300 ${
                  isOpen ? 'opacity-0 w-7' : 'w-4'
                }`}
              />
              <div
                className={`h-px bg-[var(--wb-text-main)] transition-all duration-300 ${
                  isOpen ? 'w-7 -rotate-45 -translate-y-[5px]' : 'w-2'
                }`}
              />
            </div>
          </button>
        </div>
      </div>

      <div
        className={`fixed inset-0 z-[99] wb-surface-page transition-transform duration-500 ease-out lg:hidden ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full px-6 pt-28 pb-10">
          <div className="space-y-6 overflow-y-auto">
            {mobileNavLinks.map((item) => {
              if (isServicesNavLink(item.href) && serviceMenuItems.length > 0) {
                return (
                  <div key={item.id} className="space-y-3">
                    <Link
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className="block font-heading text-3xl sm:text-4xl font-bold tracking-tight text-[var(--wb-text-main)] hover:text-[var(--wb-primary)] transition-colors"
                    >
                      {item.label}
                    </Link>
                    <div className="pl-4 space-y-3 border-l border-[color-mix(in_srgb,var(--wb-text-main)_14%,transparent)]">
                      {serviceMenuItems.map((service) => {
                        const isExpanded = expandedMobileService === service.slug;
                        return (
                          <div key={service.slug}>
                            <button
                              type="button"
                              onClick={() =>
                                setExpandedMobileService(isExpanded ? null : service.slug)
                              }
                              className="flex w-full items-center justify-between text-sm font-medium uppercase tracking-[0.12em] text-[var(--wb-text-secondary)] hover:text-[var(--wb-text-main)] transition-colors"
                            >
                              {service.name}
                              {service.areas.length > 0 && (
                                <span className="text-xs">{isExpanded ? '−' : '+'}</span>
                              )}
                            </button>
                            {isExpanded && service.areas.length > 0 && (
                              <div className="mt-2 space-y-2 pl-3">
                                {service.areas.map((area, idx) => (
                                  <Link
                                    key={`${area.city}-${idx}`}
                                    href={area.href || '/#service-areas'}
                                    onClick={() => setIsOpen(false)}
                                    className="block text-xs text-[var(--wb-primary)]"
                                  >
                                    {areaLabel(area)}
                                  </Link>
                                ))}
                              </div>
                            )}
                            <Link
                              href={service.href}
                              onClick={() => setIsOpen(false)}
                              className="mt-1 block text-xs text-[var(--wb-text-secondary)] hover:text-[var(--wb-text-main)]"
                            >
                              View service details
                            </Link>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              }

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="block font-heading text-3xl sm:text-4xl font-bold tracking-tight text-[var(--wb-text-main)] hover:text-[var(--wb-primary)] transition-colors"
                >
                  {item.label}
                </Link>
              );
            })}
            <Link
              href={contactNav.href}
              onClick={() => setIsOpen(false)}
              className="block font-heading text-3xl sm:text-4xl font-bold tracking-tight text-[var(--wb-text-main)] hover:text-[var(--wb-primary)] transition-colors"
            >
              {contactNav.label}
            </Link>
          </div>

          <div className="mt-auto pt-8 border-t border-[color-mix(in_srgb,var(--wb-text-main)_14%,transparent)]">
            <p
              className="section-label mb-2"
            >
              Direct Line
            </p>
            <a
              href={phoneNumber ? `tel:${phoneNumber.replace(/\s/g, '')}` : contactNav.href}
              className="font-heading text-lg text-[var(--wb-text-main)]"
            >
              {phoneNumber || 'Call Us'}
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Header;
