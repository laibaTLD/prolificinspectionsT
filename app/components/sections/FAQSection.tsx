'use client';

import { useMemo, useState } from 'react';
import type { Page } from '@/app/lib/types';
import { tiptapToText } from '@/app/lib/seo';
import { cn } from '@/app/lib/utils';

interface FAQSectionProps {
  faqSection?: Page['faqSection'];
  className?: string;
  title?: string;
  description?: string;
  questions?: Array<{ question: string; answer: string }>;
}

export function FAQSection({
  faqSection,
  className,
  title: titleOverride,
  description: descriptionOverride,
  questions: questionsOverride,
}: FAQSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const title = useMemo(
    () => titleOverride || tiptapToText(faqSection?.title),
    [titleOverride, faqSection?.title]
  );

  const description = useMemo(
    () => descriptionOverride || tiptapToText(faqSection?.description),
    [descriptionOverride, faqSection?.description]
  );

  const questions = useMemo(() => {
    if (questionsOverride?.length) return questionsOverride;
    return (faqSection?.items ?? [])
      .map((item) => ({
        question: tiptapToText(item.question),
        answer: tiptapToText(item.answer),
      }))
      .filter((item) => item.question || item.answer);
  }, [questionsOverride, faqSection?.items]);

  if (!faqSection || faqSection.enabled === false) return null;
  if (!questions.length) return null;

  return (
    <section id="faq" className={cn('gb-section gb-section-alt', className)}>
      <div className="gb-container gb-container-narrow">
        {title ? <h2 className="gb-section-title">{title}</h2> : null}
        {description ? <p className="gb-section-desc">{description}</p> : null}

        <div className="gb-faq-list">
          {questions.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div key={index} className="gb-faq-item">
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="gb-faq-trigger"
                  aria-expanded={isOpen}
                >
                  <span>{faq.question}</span>
                  <span aria-hidden>{isOpen ? '−' : '+'}</span>
                </button>
                {isOpen && faq.answer ? (
                  <div className="gb-faq-answer">{faq.answer}</div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default FAQSection;
