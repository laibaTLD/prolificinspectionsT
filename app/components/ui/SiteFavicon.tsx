'use client';

import { useEffect } from 'react';
import { useWebBuilder } from '@/app/providers/WebBuilderProvider';
import { getSiteFaviconUrl } from '@/app/lib/metadata';

export function SiteFavicon() {
  const { site } = useWebBuilder();

  useEffect(() => {
    const href = getSiteFaviconUrl(site);
    if (!href) return;

    const links = document.querySelectorAll<HTMLLinkElement>(
      'link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]'
    );

    if (links.length > 0) {
      links.forEach((link) => {
        link.href = href;
      });
      return;
    }

    const link = document.createElement('link');
    link.rel = 'icon';
    link.href = href;
    document.head.appendChild(link);
  }, [site?.seo?.faviconUrl]);

  return null;
}

export default SiteFavicon;
