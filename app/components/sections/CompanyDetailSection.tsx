'use client';

import Image from 'next/image';
import { useMemo } from 'react';
import type { Page } from '@/app/lib/types';
import { useWebBuilder } from '@/app/providers/WebBuilderProvider';
import { tiptapToText } from '@/app/lib/seo';
import { cn } from '@/app/lib/utils';

const DEFAULT_VIDEO_URL = 'https://www.facebook.com/reel/546563248337315';
const DEFAULT_VIDEO_THUMBNAIL = '/inspection-reel.jpg';

const DEFAULT_TITLE =
  'Real Estate Transaction Inspections in Dublin, CA';

const DEFAULT_DESCRIPTION =
  'Prolific Inspections helps Realtors, buyers, and sellers close with confidence through Home, Roof, and Termite (WDO) inspections—one company, one appointment, clear digital reports.';

interface CompanyDetailSectionProps {
  companyDetailSection?: Page['companyDetailSection'];
  className?: string;
}

type SocialPlatform = 'facebook' | 'instagram' | 'X' | 'youtube' | 'linkedin';

const VIDEO_SOCIAL_ORDER: SocialPlatform[] = ['facebook', 'X', 'youtube', 'linkedin', 'instagram'];

function SocialIcon({ platform }: { platform: SocialPlatform }) {
  switch (platform) {
    case 'facebook':
      return (
        <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
          <path
            fill="currentColor"
            d="M13.5 4H16V1h-3c-2.8 0-4.5 1.7-4.5 4.6V10H6v3h2.5v9H12v-9h2.7l.5-3H12V5.4c0-.9.3-1.4 1.5-1.4z"
          />
        </svg>
      );
    case 'X':
      return (
        <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
          <path
            fill="currentColor"
            d="M17.3 3H20l-6.2 7.1L21 21h-5.9l-4.6-5.9L5.4 21H2.7l6.7-7.7L3 3h6l4.2 5.5L17.3 3zm-2.1 16.2h1.6L8.9 4.8H7.2l8 14.4z"
          />
        </svg>
      );
    case 'youtube':
      return (
        <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
          <path
            fill="currentColor"
            d="M21.6 7.2a2.5 2.5 0 00-1.8-1.8C17.7 5 12 5 12 5s-5.7 0-7.8.4A2.5 2.5 0 002.4 7.2 26 26 0 002 12a26 26 0 00.4 4.8 2.5 2.5 0 001.8 1.8C6.3 19 12 19 12 19s5.7 0 7.8-.4a2.5 2.5 0 001.8-1.8A26 26 0 0022 12a26 26 0 00-.4-4.8zM10 15.5v-7l6 3.5-6 3.5z"
          />
        </svg>
      );
    case 'linkedin':
      return (
        <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
          <path
            fill="currentColor"
            d="M6.5 8.7H3.4V20h3.1V8.7zM5 3a1.8 1.8 0 100 3.6A1.8 1.8 0 005 3zm4.2 5.7H6.1V20h3.1v-5.6c0-1.3.3-2.7 2-2.7 1.7 0 1.7 1.6 1.7 2.8V20h3.1v-6c0-3-1.6-4.4-3.9-4.4-1.8 0-2.6 1-3 1.7l-.1-1.2z"
          />
        </svg>
      );
    case 'instagram':
      return (
        <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
          <path
            fill="currentColor"
            d="M7 3h10a4 4 0 014 4v10a4 4 0 01-4 4H7a4 4 0 01-4-4V7a4 4 0 014-4zm5 5a5 5 0 100 10 5 5 0 000-10zm6.5-.9a1.1 1.1 0 11-2.2 0 1.1 1.1 0 012.2 0z"
          />
        </svg>
      );
  }
}

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path fill="currentColor" d="M8 5v14l11-7z" />
    </svg>
  );
}

function SpcbLogo() {
  return (
    <svg viewBox="0 0 180 72" className="hg-cert-logo-svg" role="img" aria-label="SPCB">
      <path
        d="M28 52V28c0-8 6-14 14-14h20c8 0 14 6 14 14v24"
        fill="none"
        stroke="#5ba4d9"
        strokeWidth="3"
      />
      <path d="M18 52h80" stroke="#5ba4d9" strokeWidth="3" />
      <path d="M48 38h12v14H48z" fill="#5ba4d9" />
      <text x="96" y="34" fill="#5ba4d9" fontSize="28" fontWeight="700" fontFamily="Arial, sans-serif">
        SPCB
      </text>
      <text x="96" y="50" fill="#5ba4d9" fontSize="7" fontWeight="700" fontFamily="Arial, sans-serif">
        TERMITE &amp; WDO INSPECTION
      </text>
    </svg>
  );
}

function AshiLogo() {
  return (
    <svg viewBox="0 0 120 120" className="hg-cert-logo-svg hg-cert-logo-seal" role="img" aria-label="ASHI">
      {Array.from({ length: 20 }).map((_, i) => {
        const angle = (i * 360) / 20;
        return (
          <polygon
            key={i}
            points="60,8 66,24 60,30 54,24"
            fill="#c9a227"
            transform={`rotate(${angle} 60 60)`}
          />
        );
      })}
      <circle cx="60" cy="60" r="38" fill="#f4e4b0" stroke="#c9a227" strokeWidth="2" />
      <text x="60" y="58" textAnchor="middle" fill="#111" fontSize="22" fontWeight="700" fontFamily="Arial, sans-serif">
        ASHI
      </text>
      <text x="60" y="72" textAnchor="middle" fill="#111" fontSize="5.5" fontWeight="600" fontFamily="Arial, sans-serif">
        AMERICAN SOCIETY
      </text>
      <text x="60" y="79" textAnchor="middle" fill="#111" fontSize="5.5" fontWeight="600" fontFamily="Arial, sans-serif">
        OF HOME INSPECTORS
      </text>
    </svg>
  );
}

function CslbLogo() {
  return (
    <svg viewBox="0 0 220 72" className="hg-cert-logo-svg" role="img" aria-label="CSLB">
      <path d="M8 52V24l28-12 28 12v28H8z" fill="#1f5fa8" />
      <text x="22" y="34" fill="#fff" fontSize="14" fontWeight="700" fontFamily="Arial, sans-serif">
        CSLB
      </text>
      <rect x="18" y="38" width="8" height="8" fill="#fff" opacity="0.85" />
      <rect x="30" y="38" width="8" height="8" fill="#fff" opacity="0.85" />
      <text x="72" y="28" fill="#111" fontSize="11" fontWeight="700" fontFamily="Arial, sans-serif">
        CALIFORNIA CONTRACTORS
      </text>
      <text x="72" y="42" fill="#111" fontSize="11" fontWeight="700" fontFamily="Arial, sans-serif">
        STATE LICENSE BOARD
      </text>
      <text x="72" y="58" fill="#111" fontSize="9" fontFamily="Arial, sans-serif">
        Licensed Inspection Services
      </text>
    </svg>
  );
}

function DublinLogo() {
  return (
    <svg viewBox="0 0 220 72" className="hg-cert-logo-svg" role="img" aria-label="Dublin CA inspections">
      <circle cx="30" cy="36" r="22" fill="none" stroke="#1f5fa8" strokeWidth="3" />
      <path d="M30 22 L42 36 L30 50 L18 36 Z" fill="#1f5fa8" />
      <circle cx="30" cy="34" r="4" fill="#fff" />
      <text x="58" y="30" fill="#111" fontSize="16" fontWeight="700" fontFamily="Arial, sans-serif">
        DUBLIN, CA
      </text>
      <text x="58" y="46" fill="#111" fontSize="9" fontWeight="700" fontFamily="Arial, sans-serif">
        TRI-VALLEY HOME INSPECTIONS
      </text>
      <text x="58" y="58" fill="#111" fontSize="8" fontFamily="Arial, sans-serif">
        Alameda County Service Area
      </text>
    </svg>
  );
}

function InternachiLogo() {
  return (
    <svg viewBox="0 0 220 72" className="hg-cert-logo-svg" role="img" aria-label="InterNACHI">
      <rect x="6" y="14" width="48" height="44" rx="4" fill="#c41e3a" />
      <path
        d="M18 28h24M18 36h24M18 44h16"
        stroke="#fff"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <text x="64" y="30" fill="#111" fontSize="18" fontWeight="800" fontFamily="Arial, sans-serif">
        InterNACHI
      </text>
      <text x="64" y="44" fill="#111" fontSize="9" fontWeight="700" fontFamily="Arial, sans-serif">
        CERTIFIED HOME INSPECTOR
      </text>
      <text x="64" y="56" fill="#111" fontSize="8" fontFamily="Arial, sans-serif">
        Dublin &amp; Bay Area Inspections
      </text>
    </svg>
  );
}

const CERTIFICATIONS_TITLE =
  'Inspection Certifications, Licensing & Memberships — Dublin, CA';

const CERTIFICATIONS = [
  {
    id: 'ashi',
    label: 'ASHI Certified Home Inspector — Dublin & Tri-Valley',
    Logo: AshiLogo,
  },
  {
    id: 'spcb',
    label: 'SPCB Licensed Termite & WDO Inspection — California',
    Logo: SpcbLogo,
  },
  {
    id: 'cslb',
    label: 'CSLB Licensed Contractor — California Inspection Services',
    Logo: CslbLogo,
  },
  {
    id: 'dublin',
    label: 'Serving Dublin, CA & Alameda County',
    Logo: DublinLogo,
  },
  {
    id: 'internachi',
    label: 'InterNACHI Certified Home Inspector',
    Logo: InternachiLogo,
  },
] as const;

export function CompanyDetailSection({
  companyDetailSection,
  className,
}: CompanyDetailSectionProps) {
  const { site } = useWebBuilder();
  const phoneNumber = site?.business?.phone?.trim() || '';

  const videoUrl = DEFAULT_VIDEO_URL;

  const title = useMemo(
    () => tiptapToText(companyDetailSection?.title) || DEFAULT_TITLE,
    [companyDetailSection?.title]
  );

  const description = useMemo(
    () => tiptapToText(companyDetailSection?.description) || DEFAULT_DESCRIPTION,
    [companyDetailSection?.description]
  );

  const socialLinks = useMemo(() => {
    const links = site?.socialLinks ?? [];
    return VIDEO_SOCIAL_ORDER.map((platform) =>
      links.find((link) => link.platform === platform && link.url?.trim())
    ).filter((link): link is { platform: SocialPlatform; url: string } => Boolean(link));
  }, [site?.socialLinks]);

  if (companyDetailSection?.enabled === false) return null;

  return (
    <section id="company-details" className={cn('hg-section hg-company-detail-section', className)}>
      <div className="container mx-auto px-4 lg:px-8">
        <div className="hg-company-detail-grid">
          <div className="hg-company-detail-content">
            <h2 className="hg-company-detail-title">{title}</h2>
            <p className="hg-company-detail-desc">{description}</p>

            <div className="hg-company-detail-actions">
              <a
                href={videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hg-btn hg-company-video-cta"
              >
                <PlayIcon className="h-4 w-4" />
                Watch Video
              </a>

              {phoneNumber && (
                <p className="hg-company-detail-cta">
                  Schedule an Appointment{' '}
                  <a href={`tel:${phoneNumber.replace(/\s/g, '')}`} className="hg-company-detail-phone">
                    ({phoneNumber})
                  </a>
                </p>
              )}
            </div>
          </div>

          <div className="hg-company-detail-media">
            <a
              href={videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hg-company-video-frame hg-company-video-thumb-link"
              aria-label="Watch inspection video on Facebook"
            >
              <Image
                src={DEFAULT_VIDEO_THUMBNAIL}
                alt="Prolific Inspections home inspection video"
                fill
                className="object-cover object-top"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <span className="hg-company-video-play" aria-hidden>
                <span className="hg-company-video-play-btn">
                  <PlayIcon className="h-7 w-7" />
                </span>
              </span>
            </a>

            {socialLinks.length > 0 && (
              <div className="hg-company-video-socials">
                {socialLinks.map((link) => (
                  <a
                    key={link.platform}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hg-company-video-social-link"
                    aria-label={link.platform}
                  >
                    <SocialIcon platform={link.platform} />
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="hg-company-detail-certs">
          <h3 className="hg-certifications-title">{CERTIFICATIONS_TITLE}</h3>
          <div className="hg-certifications-logos">
            {CERTIFICATIONS.map(({ id, label, Logo }) => (
              <div key={id} className="hg-certifications-logo-item" title={label}>
                <Logo />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default CompanyDetailSection;
