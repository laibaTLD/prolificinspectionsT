'use client';

import { useMemo, useState } from 'react';
import type { Page } from '@/app/lib/types';
import { tiptapToText } from '@/app/lib/seo';
import { cn } from '@/app/lib/utils';
import { useScrollAnimation, useStaggeredAnimation } from '@/hooks/useScrollAnimation';

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
    () =>
      titleOverride ||
      tiptapToText(faqSection?.title) ||
      'Frequently Asked Questions',
    [titleOverride, faqSection?.title]
  );

  const description = useMemo(
    () =>
      descriptionOverride ||
      tiptapToText(faqSection?.description) ||
      'Clear answers to the questions we hear most often about our land clearing and site preparation services.',
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

  const { ref: headerRef, isVisible: headerVisible } =
    useScrollAnimation<HTMLDivElement>({ threshold: 0.1 });
  const { ref: gridRef, visibleItems } = useStaggeredAnimation(questions.length, 80);

  const toggleQuestion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  if (!faqSection || faqSection.enabled === false) return null;
  if (!questions.length) return null;

  return (
    <section
      id="faq"
      className={cn('relative py-12 lg:py-24 overflow-hidden wb-surface-dark', className)}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-50"
        aria-hidden
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 20% 20%, color-mix(in srgb, var(--wb-primary) 15%, transparent), transparent 50%), radial-gradient(ellipse 60% 50% at 80% 80%, color-mix(in srgb, var(--wb-primary) 10%, transparent), transparent 50%)',
        }}
      />

      <div className="container mx-auto px-6 lg:px-10 xl:px-14 relative z-10">
        <div
          ref={headerRef}
          className={`mx-auto max-w-2xl text-center mb-10 lg:mb-14 transition-all duration-1000 ${
            headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <span className="section-label">Information</span>
          <h2 className="section-heading-lg">{title}</h2>
          <p className="section-desc mt-6">{description}</p>
        </div>

        <div
          ref={gridRef}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 lg:gap-6"
        >
          {questions.map((faq, index) => {
            const isOpen = openIndex === index;
            const isVisible = visibleItems.includes(index);

            return (
              <article
                key={index}
                className={cn(
                  'group relative rounded-2xl border transition-all duration-700 ease-out overflow-hidden',
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10',
                  isOpen
                    ? 'border-[color-mix(in_srgb,var(--wb-primary)_50%,transparent)] bg-[color-mix(in_srgb,var(--wb-primary)_8%,var(--wb-section-bg-dark))] shadow-[0_20px_50px_-20px_color-mix(in_srgb,var(--wb-primary)_35%,transparent)]'
                    : 'wb-border-on-dark bg-[color-mix(in_srgb,var(--wb-text-on-dark)_4%,transparent)] hover:border-[color-mix(in_srgb,var(--wb-text-on-dark)_25%,transparent)]'
                )}
              >
                <button
                  type="button"
                  onClick={() => toggleQuestion(index)}
                  className="w-full p-5 sm:p-6 text-left flex items-start gap-4"
                  aria-expanded={isOpen}
                >
                  <span
                    className={cn(
                      'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-bold tabular-nums transition-all duration-500',
                      isOpen
                        ? 'bg-[var(--wb-primary)] wb-text-on-dark scale-110'
                        : 'border wb-border-on-dark wb-text-on-dark-secondary'
                    )}
                  >
                    {String(index + 1).padStart(2, '0')}
                  </span>

                  <span className="min-w-0 flex-1 pt-1">
                    <h3 className="font-heading text-base sm:text-lg font-bold wb-text-on-dark pr-6">
                      {faq.question}
                    </h3>
                  </span>

                  <span
                    className={cn(
                      'mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-all duration-500',
                      isOpen
                        ? 'rotate-180 border-[color-mix(in_srgb,var(--wb-primary)_60%,transparent)] bg-[color-mix(in_srgb,var(--wb-primary)_15%,transparent)]'
                        : 'wb-border-on-dark'
                    )}
                  >
                    <svg
                      className={cn('h-4 w-4 transition-colors duration-300', isOpen ? 'text-[var(--wb-primary)]' : 'wb-text-on-dark-secondary')}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </button>

                <div
                  className={cn(
                    'grid transition-all duration-500 ease-in-out',
                    isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                  )}
                >
                  <div className="overflow-hidden">
                    <p className="px-5 sm:px-6 pb-5 sm:pb-6 pl-[4.5rem] sm:pl-[5.5rem] wb-text-on-dark-secondary text-sm sm:text-base leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>

                <div
                  className={cn(
                    'absolute bottom-0 left-0 h-0.5 origin-left transition-transform duration-700 ease-out',
                    isOpen ? 'scale-x-100' : 'scale-x-0'
                  )}
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--wb-primary)',
                  }}
                />
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default FAQSection;
