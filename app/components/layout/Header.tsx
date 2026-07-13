'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import type { Service, ServiceAreaPage } from '@/app/lib/types';
import { useWebBuilder } from '@/app/providers/WebBuilderProvider';
import {
  getBrandName,
  getHeaderNavLinks,
  getPageHref,
} from '@/app/lib/siteContent';
import { cn, getImageSrc } from '@/app/lib/utils';
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
      if (typeof ref === 'string') matches = ref === service._id;
      else if (ref && typeof ref === 'object') {
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

export function Header() {
  const { site, pages, services, serviceAreaPages } = useWebBuilder();
  const [isOpen, setIsOpen] = useState(false);

  const businessName = getBrandName(site);

  const logoSrc = useMemo(() => {
    const raw = site?.footer?.logo?.url || site?.theme?.logoUrl;
    return raw ? getImageSrc(raw) : '';
  }, [site?.footer?.logo?.url, site?.theme?.logoUrl]);

  const serviceMenuItems = useMemo(
    () => buildServiceMenuItems(services, serviceAreaPages, site?.serviceAreas),
    [services, serviceAreaPages, site?.serviceAreas]
  );

  const { mainNavLinks, mobileNavLinks, contactNav } = useMemo(
    () => getHeaderNavLinks(pages),
    [pages]
  );

  const servicesPage = useMemo(
    () => pages.find((p) => p.pageType === 'service-list'),
    [pages]
  );
  const servicesHref = servicesPage ? getPageHref(servicesPage) : '/services';

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <header className="gb-header">
      <div className="gb-header-main">
        <Link href="/" className="gb-header-logo">
          {logoSrc ? (
            <Image
              src={logoSrc}
              alt={site?.footer?.logo?.altText?.trim() || businessName || 'Logo'}
              width={200}
              height={56}
              priority
              className="gb-header-logo-img"
            />
          ) : (
            <span className="gb-header-logo-text">{businessName}</span>
          )}
        </Link>

        <nav className="gb-header-nav" aria-label="Primary">
          {mainNavLinks.map((link) => {
            const isServices =
              link.href === '/services' ||
              link.href === servicesHref ||
              servicesPage?._id === link.id;

            if (isServices && serviceMenuItems.length > 0) {
              return (
                <div key={link.id} className="gb-header-nav-item group">
                  <Link href={link.href} className="gb-header-nav-link">
                    {link.label}
                  </Link>
                  <div className="gb-header-dropdown">
                    {serviceMenuItems.map((item) => (
                      <Link key={item.slug} href={item.href} className="gb-header-dropdown-link">
                        {item.name}
                      </Link>
                    ))}
                  </div>
                </div>
              );
            }

            return (
              <Link key={link.id} href={link.href} className="gb-header-nav-link">
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="gb-header-actions">
          <Link href={contactNav.href} className="gb-header-contact">
            {contactNav.label}
          </Link>
          <button
            type="button"
            className="gb-header-menu-btn"
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isOpen}
            onClick={() => setIsOpen((o) => !o)}
          >
            <span className={cn('gb-header-burger', isOpen && 'is-open')} aria-hidden>
              <span />
              <span />
              <span />
            </span>
          </button>
        </div>
      </div>

      <div className={cn('gb-header-drawer', isOpen && 'is-open')} aria-hidden={!isOpen}>
        <nav className="gb-header-drawer-nav">
          {mobileNavLinks.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className="gb-header-drawer-link"
              onClick={() => setIsOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          {serviceMenuItems.map((item) => (
            <Link
              key={item.slug}
              href={item.href}
              className="gb-header-drawer-sublink"
              onClick={() => setIsOpen(false)}
            >
              {item.name}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

export default Header;
