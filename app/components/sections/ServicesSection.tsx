'use client';

import { useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Page, Service } from '@/app/lib/types';
import { useWebBuilder } from '@/app/providers/WebBuilderProvider';
import { tiptapToText } from '@/app/lib/seo';
import { cn, getImageSrc } from '@/app/lib/utils';
import { resolveServiceSlug } from '@/app/lib/serviceAreaSlugs';
import { getPageHref } from '@/app/lib/siteContent';

interface ServicesSectionProps {
  servicesSection?: Page['servicesSection'];
  companyDetailSection?: Page['companyDetailSection'];
  ctaSection?: Page['ctaSection'];
  page?: Page | null;
  className?: string;
  servicesLimit?: number;
  showViewAllLink?: boolean;
  showAllServices?: boolean;
  compact?: boolean;
}

type DisplayService = {
  id: string;
  name: string;
  description: string;
  slug: string;
  imageUrl: string;
};

const PRIORITY_ORDER = ['home', 'roof', 'termite'] as const;

function servicePriority(name: string): number {
  const label = name.toLowerCase();
  const index = PRIORITY_ORDER.findIndex((key) => label.includes(key));
  return index === -1 ? PRIORITY_ORDER.length : index;
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
    slug: resolveServiceSlug(service),
    imageUrl,
  };
}

export function ServicesSection({
  servicesSection,
  className,
  servicesLimit,
  showViewAllLink = false,
  showAllServices = false,
}: ServicesSectionProps) {
  const { services: allServices, pages } = useWebBuilder();

  const { services, hasMoreServices } = useMemo(() => {
    const published = allServices.filter((s) => s.status === 'published');
    const ids = servicesSection?.serviceIds ?? [];
    const selected =
      showAllServices || ids.length === 0
        ? published
        : ids
            .map((id) => allServices.find((s) => s._id === id))
            .filter((s): s is Service => Boolean(s));

    const mapped = selected
      .map(mapServiceToDisplay)
      .sort((a, b) => servicePriority(a.name) - servicePriority(b.name));

    const limited =
      typeof servicesLimit === 'number' && servicesLimit > 0
        ? mapped.slice(0, servicesLimit)
        : mapped;

    const moreAvailable = showAllServices
      ? false
      : published.length > limited.length || mapped.length > limited.length;

    return { services: limited, hasMoreServices: moreAvailable };
  }, [servicesSection?.serviceIds, allServices, servicesLimit, showAllServices]);

  const servicesHref = useMemo(() => {
    const servicesPage = pages.find((p) => p.pageType === 'service-list');
    return servicesPage ? getPageHref(servicesPage) : '/services';
  }, [pages]);

  const title = useMemo(
    () => tiptapToText(servicesSection?.title),
    [servicesSection?.title]
  );

  if (!servicesSection || servicesSection.enabled === false) return null;
  if (!services.length) return null;

  return (
    <section id="services" className={cn('gb-section', className)}>
      <div className="gb-container">
        {title ? <h2 className="gb-section-title">{title}</h2> : null}

        <div className="gb-offerings-grid">
          {services.map((service) => (
            <Link key={service.id} href={`/service/${service.slug}`} className="gb-offering-card">
              {service.imageUrl ? (
                <div className="gb-offering-thumb">
                  <Image
                    src={service.imageUrl}
                    alt=""
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover"
                  />
                </div>
              ) : (
                <svg viewBox="0 0 24 24" className="gb-card-icon" fill="none" aria-hidden>
                  <path
                    d="M4 12l8-7 8 7v8H4v-8z"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
              <h3 className="gb-offering-title">{service.name}</h3>
              {service.description ? (
                <p className="gb-offering-desc">{service.description}</p>
              ) : null}
            </Link>
          ))}
        </div>

        {showViewAllLink && hasMoreServices ? (
          <div className="gb-section-actions">
            <Link href={servicesHref} className="gb-btn-outline">
              View all services
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  );
}

export default ServicesSection;
