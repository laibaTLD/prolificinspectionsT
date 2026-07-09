'use client';

import Image from 'next/image';
import { useMemo } from 'react';
import type { Page } from '@/app/lib/types';
import { useWebBuilder } from '@/app/providers/WebBuilderProvider';
import { tiptapToText } from '@/app/lib/seo';
import { cn } from '@/app/lib/utils';

interface WhyChooseUsSectionProps {
  whyChooseUsSection?: Page['whyChooseUsSection'];
  className?: string;
}

const DEFAULT_IMAGE =
  'https://images.pexels.com/photos/4063856/pexels-photo-4063856.jpeg?auto=compress&cs=tinysrgb&w=1200';

const DEFAULT_DESCRIPTION =
  'Schedule inspections, reschedule inspections, cancel inspections, view service area maps, view reports, view the amount due, live chat with Customer Care, and edit your personal information.';

const INSTAGRAM_QR = {
  src: '/qrcode_372293605_760b597e22566c951f982703ceb64723.png',
  href: 'https://www.instagram.com/',
};

function isUrl(value: string): boolean {
  return /^https?:\/\//i.test(value.trim());
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-8 w-8" aria-hidden>
      <path
        fill="currentColor"
        d="M7 3h10a4 4 0 014 4v10a4 4 0 01-4 4H7a4 4 0 01-4-4V7a4 4 0 014-4zm5 5a5 5 0 100 10 5 5 0 000-10zm6.5-.9a1.1 1.1 0 11-2.2 0 1.1 1.1 0 012.2 0z"
      />
    </svg>
  );
}

function QrImage({ src, alt, href }: { src: string; alt: string; href: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="hg-download-app-qr-link">
      <div className="hg-download-app-qr">
        <Image
          src={src}
          alt={alt}
          width={140}
          height={140}
          className="h-full w-full object-contain"
        />
      </div>
    </a>
  );
}

export function WhyChooseUsSection({
  whyChooseUsSection,
  className,
}: WhyChooseUsSectionProps) {
  const { site } = useWebBuilder();

  const title = useMemo(
    () => tiptapToText(whyChooseUsSection?.title) || 'Download the App',
    [whyChooseUsSection?.title]
  );

  const description = useMemo(
    () => tiptapToText(whyChooseUsSection?.description) || DEFAULT_DESCRIPTION,
    [whyChooseUsSection?.description]
  );

  const instagram = useMemo(() => {
    const items = whyChooseUsSection?.items ?? [];
    const instagramItem =
      items.find((item) => {
        const titleText = tiptapToText(item?.title).toLowerCase();
        const descText = tiptapToText(item?.description).toLowerCase();
        return titleText.includes('instagram') || descText.includes('instagram');
      }) ?? items[2];

    const label = tiptapToText(instagramItem?.title) || 'Instagram';
    const itemUrl = tiptapToText(instagramItem?.description);
    const socialUrl = site?.socialLinks?.find(
      (link) => link.platform === 'instagram' && link.url?.trim()
    )?.url;

    return {
      label,
      href:
        (itemUrl && isUrl(itemUrl) ? itemUrl.trim() : undefined) ??
        socialUrl ??
        INSTAGRAM_QR.href,
    };
  }, [whyChooseUsSection?.items, site?.socialLinks]);

  if (!whyChooseUsSection || whyChooseUsSection.enabled === false) return null;

  return (
    <section id="why-choose-us" className={cn('hg-download-app-section', className)}>
      <div className="hg-download-app-grid">
        <div className="hg-download-app-media">
          <Image
            src={DEFAULT_IMAGE}
            alt="Prolific Inspections"
            fill
            className="object-cover object-center"
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority={false}
          />
        </div>

        <div className="hg-download-app-panel">
          <div className="hg-download-app-panel-inner">
            <h2 className="hg-download-app-title">{title}</h2>
            <p className="hg-download-app-desc">{description}</p>

            <div className="hg-download-app-stores">
              <div className="hg-download-app-store">
                <InstagramIcon />
                <p className="hg-download-app-store-label">{instagram.label}</p>
                <QrImage
                  src={INSTAGRAM_QR.src}
                  alt={`${instagram.label} QR code`}
                  href={instagram.href}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default WhyChooseUsSection;
