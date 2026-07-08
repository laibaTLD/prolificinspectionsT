'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useMemo } from 'react';
import { useWebBuilder } from '@/app/providers/WebBuilderProvider';
import {
  getBrandName,
  getFooterNavLinks,
  getMenuFooterLine,
} from '@/app/lib/siteContent';
import { getImageSrc } from '@/app/lib/utils';
import { tiptapToText } from '@/app/lib/seo';

const FALLBACK_NAV_LINKS = [
  { id: 'home', label: 'Home', href: '#home' },
  { id: 'about', label: 'About', href: '#about' },
  { id: 'services', label: 'Services', href: '#services' },
  { id: 'gallery', label: 'Gallery', href: '#gallery' },
  { id: 'contact', label: 'Contact', href: '#contact' },
];

export function Footer() {
  const { site, pages } = useWebBuilder();

  const businessName = getBrandName(site) || 'ACE Grading LLC';
  const description = getMenuFooterLine(site);

  const logoSrc = useMemo(() => {
    const raw = site?.footer?.logo?.url || site?.theme?.logoUrl;
    return raw ? getImageSrc(raw) : '/logo.png';
  }, [site?.footer?.logo?.url, site?.theme?.logoUrl]);

  const navLinks = useMemo(() => {
    const fromBuilder = getFooterNavLinks(pages);
    return fromBuilder.length ? fromBuilder : FALLBACK_NAV_LINKS;
  }, [pages]);

  const email = site?.business?.email?.trim();
  const address = site?.business?.address;

  const copyrightLine = useMemo(() => {
    const fromCms = tiptapToText(site?.footer?.copyright);
    if (fromCms) return fromCms;
    return `${new Date().getFullYear()} ©${businessName}. All Rights Reserved. Build by`;
  }, [site?.footer?.copyright, businessName]);

  const showBuilderCredit = !tiptapToText(site?.footer?.copyright)?.includes('Brand Booster');

  return (
    <footer
      id="footer"
      className="relative pt-12 pb-8 overflow-hidden wb-surface-dark"
    >
      <div className="container mx-auto px-6 lg:px-10 xl:px-14 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-8 sm:gap-10 mb-10">
          <div className="md:col-span-5">
            <Link href="/" className="inline-block mb-4 sm:mb-5">
              <Image
                src={logoSrc}
                alt={site?.footer?.logo?.altText?.trim() || businessName}
                width={360}
                height={100}
                className="h-16 sm:h-20 w-auto object-contain object-left brightness-0 invert"
              />
            </Link>
            {description && (
              <p className="text-xs sm:text-sm leading-relaxed opacity-75 wb-text-on-dark max-w-xl">
                {description}
              </p>
            )}
          </div>

          <div className="md:col-span-3">
            <h4 className="section-label section-label-on-dark mb-4">
              Navigation
            </h4>
            <nav className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <Link
                  key={link.id}
                  href={link.href}
                  className="text-sm wb-text-on-dark opacity-80 hover:opacity-100 transition-opacity"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="md:col-span-4">
            <h4 className="section-label section-label-on-dark mb-4">
              Contact
            </h4>
            <div className="space-y-5 text-sm wb-text-on-dark">
              {email && (
                <div>
                  <p className="opacity-40 text-[10px] uppercase tracking-[0.12em] mb-1">Inquiries</p>
                  <a href={`mailto:${email}`} className="opacity-90 hover:opacity-100 transition-opacity">
                    {email}
                  </a>
                </div>
              )}
              {(address?.street || address?.city) && (
                <div>
                  <p className="opacity-40 text-[10px] uppercase tracking-[0.12em] mb-1">Office</p>
                  <address className="not-italic opacity-75">
                    {address?.street && (
                      <>
                        {address.street}
                        <br />
                      </>
                    )}
                    {[address?.city, address?.state].filter(Boolean).join(', ')}
                    {address?.zipCode ? ` ${address.zipCode}` : ''}
                  </address>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="pt-8 sm:pt-10 flex flex-col md:flex-row justify-between items-center gap-4 sm:gap-6 border-t border-white/15">
          <p
            className="text-[10px] uppercase tracking-[0.12em] opacity-50 wb-text-on-dark text-center md:text-left"
          >
            {copyrightLine}
            {showBuilderCredit && (
              <>
                {' '}
                <a
                href="https://usbrandbooster.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 hover:opacity-100 transition-opacity"
              >
                US Brand Booster
              </a>
              </>
            )}
          </p>

          <div
            className="flex items-center gap-8 text-[10px] uppercase tracking-[0.2em] opacity-40 wb-text-on-dark"
          >
            <Link href="/privacy-policy" className="hover:opacity-100 transition-opacity">
              Privacy Policy
            </Link>
            <Link href="/terms-of-service" className="hover:opacity-100 transition-opacity">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
