'use client';

import { useMemo } from 'react';
import type { Page } from '@/app/lib/types';
import { tiptapToText } from '@/app/lib/seo';
import { cn } from '@/app/lib/utils';

interface WhyChooseUsSectionProps {
  whyChooseUsSection?: Page['whyChooseUsSection'];
  className?: string;
}

const DEFAULT_TITLE = 'Why Realtors Choose Prolific';

const DEFAULT_DESCRIPTION =
  'Built for real estate transactions—fast scheduling, clear reports, and one trusted partner for Home, Roof, and Termite inspections.';

const DEFAULT_BENEFITS = [
  'One Company',
  'One Appointment',
  'Home, Roof & Termite Inspections',
  'Reports Delivered Within 24 Hours',
  'Expedited Reporting Options Available',
  'Licensed Contractor Insight',
  'Fast Scheduling',
  'Detailed Digital Reports',
  'Clear Communication',
  'Supporting Buyers, Sellers & Agents',
];

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className ?? 'hg-realtors-check-icon'} aria-hidden>
      <path
        fill="currentColor"
        d="M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0l-3.5-3.5a1 1 0 011.4-1.4L8.5 12l6.8-6.7a1 1 0 011.4 0z"
      />
    </svg>
  );
}

export function WhyChooseUsSection({
  whyChooseUsSection,
  className,
}: WhyChooseUsSectionProps) {
  const title = useMemo(
    () => tiptapToText(whyChooseUsSection?.title) || DEFAULT_TITLE,
    [whyChooseUsSection?.title]
  );

  const description = useMemo(
    () => tiptapToText(whyChooseUsSection?.description) || DEFAULT_DESCRIPTION,
    [whyChooseUsSection?.description]
  );

  const benefits = useMemo(() => {
    const fromCms = (whyChooseUsSection?.items ?? [])
      .map((item) => tiptapToText(item?.title) || tiptapToText(item?.description))
      .filter(Boolean);

    const seen = new Set(DEFAULT_BENEFITS.map((b) => b.toLowerCase()));
    const extras = fromCms.filter((item) => {
      const key = item.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // Always show the full realtor checklist, then any unique CMS items
    return [...DEFAULT_BENEFITS, ...extras];
  }, [whyChooseUsSection?.items]);

  if (!whyChooseUsSection || whyChooseUsSection.enabled === false) return null;

  return (
    <section id="why-choose-us" className={cn('hg-realtors-section', className)}>
      <div className="hg-realtors-shell">
        <div className="hg-realtors-intro">
          <p className="hg-realtors-eyebrow">Trusted by Realtors</p>
          <h2 className="hg-realtors-title">
            <span className="hg-realtors-title-text">{title}</span>
          </h2>
          <div className="hg-realtors-rule" aria-hidden />
          <p className="hg-realtors-desc">{description}</p>
        </div>

        <ul className="hg-realtors-grid">
          {benefits.map((benefit) => (
            <li key={benefit} className="hg-realtors-item">
              <div className="hg-realtors-card">
                <div className="hg-realtors-card-face hg-realtors-card-front">
                  <span className="hg-realtors-check" aria-hidden>
                    <CheckIcon />
                  </span>
                  <span className="hg-realtors-item-text">{benefit}</span>
                </div>
                <div className="hg-realtors-card-face hg-realtors-card-back" aria-hidden>
                  <span className="hg-realtors-check hg-realtors-check--lg">
                    <CheckIcon className="hg-realtors-check-icon hg-realtors-check-icon--lg" />
                  </span>
                  <span className="hg-realtors-item-text hg-realtors-item-text--back">
                    {benefit}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default WhyChooseUsSection;
