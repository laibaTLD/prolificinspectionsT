'use client';

import dynamic from 'next/dynamic';
import { useWebBuilder } from '@/app/providers/WebBuilderProvider';
import { Page } from '@/app/lib/types';
import { Footer } from '@/app/components/layout/Footer';
import { HeroSection } from '@/app/components/sections/HeroSection';
import { AboutSection } from '@/app/components/sections/AboutSection';
import { ScrollPerfSection } from '@/app/components/performance/ScrollPerfSection';
import { getThemeColors } from '@/app/lib/themeBuilder';

function SectionFallback({ height = '36vh' }: { height?: string }) {
  return <div className="gb-defer-skel" style={{ minHeight: height }} aria-hidden />;
}

/* Below-fold sections: separate JS chunks for faster initial load */
const ServicesSection = dynamic(
  () =>
    import('@/app/components/sections/ServicesSection').then((m) => ({
      default: m.ServicesSection,
    })),
  { ssr: true, loading: () => <SectionFallback height="48vh" /> }
);

const WhyChooseUsSection = dynamic(
  () =>
    import('@/app/components/sections/WhyChooseUsSection').then((m) => ({
      default: m.WhyChooseUsSection,
    })),
  { ssr: true, loading: () => <SectionFallback /> }
);

const CTASection = dynamic(
  () =>
    import('@/app/components/sections/CTASection').then((m) => ({
      default: m.CTASection,
    })),
  { ssr: true, loading: () => <SectionFallback height="28vh" /> }
);

const CompanyDetailSection = dynamic(
  () =>
    import('@/app/components/sections/CompanyDetailSection').then((m) => ({
      default: m.CompanyDetailSection,
    })),
  { ssr: true, loading: () => <SectionFallback height="50vh" /> }
);

const TestimonialsSection = dynamic(
  () =>
    import('@/app/components/sections/TestimonialsSection').then((m) => ({
      default: m.TestimonialsSection,
    })),
  { ssr: true, loading: () => <SectionFallback /> }
);

const FAQSection = dynamic(
  () =>
    import('@/app/components/sections/FAQSection').then((m) => ({
      default: m.FAQSection,
    })),
  { ssr: true, loading: () => <SectionFallback height="30vh" /> }
);

const ContactSection = dynamic(
  () =>
    import('@/app/components/sections/ContactSection').then((m) => ({
      default: m.ContactSection,
    })),
  { ssr: true, loading: () => <SectionFallback height="40vh" /> }
);

export default function HomeClient() {
  const { site, pages, loading, error } = useWebBuilder();

  const themeColors = getThemeColors(site);

  const themeFonts = {
    heading: site?.theme?.headingFont,
    body: site?.theme?.bodyFont,
  };

  if (loading && pages.length === 0 && !site) {
    return null;
  }

  if (error && !site) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{ backgroundColor: themeColors.pageBackground }}
      >
        <div
          className="p-6 rounded-lg max-w-lg text-center"
          style={{
            backgroundColor: themeColors.cardBackground,
            borderColor: themeColors.inactive,
            borderWidth: '1px',
          }}
        >
          <h2
            className="mb-2 text-xl font-bold"
            style={{
              color: themeColors.mainText,
              fontFamily: themeFonts.heading,
            }}
          >
            Error
          </h2>
          <p
            style={{
              color: themeColors.secondaryText,
              fontFamily: themeFonts.body,
            }}
          >
            {error}
          </p>
        </div>
      </div>
    );
  }

  const displayPage = pages.find((p: Page) => p.pageType === 'home');

  if (!displayPage) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center p-4"
        style={{ backgroundColor: themeColors.pageBackground }}
      >
        <h2
          className="text-2xl font-bold mb-4"
          style={{
            color: themeColors.mainText,
            fontFamily: themeFonts.heading,
          }}
        >
          No Home Page Found
        </h2>
        <p
          style={{
            color: themeColors.secondaryText,
            fontFamily: themeFonts.body,
          }}
        >
          Please create a page with type &quot;home&quot; in the site builder.
        </p>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen selection:bg-black/10 selection:text-inherit gb-site"
      style={{
        backgroundColor: themeColors.pageBackground,
        color: themeColors.mainText,
        fontFamily: themeFonts.body,
      }}
    >
      <main>
        <HeroSection hero={displayPage.hero} page={displayPage} />
        <AboutSection aboutSection={displayPage.aboutSection} page={displayPage} />
        <ScrollPerfSection intrinsicSize="560px">
          <ServicesSection
            servicesSection={displayPage.servicesSection}
            page={displayPage}
            servicesLimit={3}
            showViewAllLink
          />
        </ScrollPerfSection>
        <ScrollPerfSection intrinsicSize="420px">
          <WhyChooseUsSection whyChooseUsSection={displayPage.whyChooseUsSection} />
        </ScrollPerfSection>
        <ScrollPerfSection intrinsicSize="320px">
          <CTASection ctaSection={displayPage.ctaSection} />
        </ScrollPerfSection>
        <ScrollPerfSection intrinsicSize="560px">
          <CompanyDetailSection companyDetailSection={displayPage.companyDetailSection} />
        </ScrollPerfSection>
        <ScrollPerfSection intrinsicSize="420px">
          <TestimonialsSection
            testimonialsSection={displayPage.testimonialsSection}
            limit={4}
            showViewAllLink
          />
        </ScrollPerfSection>
        <ScrollPerfSection intrinsicSize="360px">
          <FAQSection faqSection={displayPage.faqSection} />
        </ScrollPerfSection>
        <ScrollPerfSection intrinsicSize="480px">
          <ContactSection contactSection={displayPage.contactSection} />
        </ScrollPerfSection>
      </main>
      <Footer />
    </div>
  );
}
