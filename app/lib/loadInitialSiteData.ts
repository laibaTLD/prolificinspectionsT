import {
  blogApi,
  pageApi,
  projectApi,
  serviceApi,
  serviceAreaApi,
  siteApi,
  testimonialApi,
} from '@/app/lib/api';
import type { BlogPost, Page, Project, Service, Site } from '@/app/lib/types';

export type InitialSiteData = {
  site: Site;
  pages: Page[];
  services: Service[];
  blogPosts: BlogPost[];
  projects: Project[];
  testimonials: { title?: string; description?: string; testimonials: unknown[] } | null;
  serviceAreaPages: unknown[];
};

export async function loadInitialSiteData(
  siteSlug: string | undefined
): Promise<InitialSiteData | null> {
  if (!siteSlug?.trim()) return null;

  try {
    const site = await siteApi.getSiteBySlug(siteSlug, { silent: true });

    const [pages, services, blogPosts, projects, testimonials, serviceAreaPages] =
      await Promise.all([
        pageApi.getPagesBySite(site.slug, { silent: true }),
        serviceApi.getServicesBySite(site.slug, { silent: true }),
        blogApi.getPostsBySite(site.slug).catch(() => [] as BlogPost[]),
        projectApi.getProjectsBySite(site.slug, undefined, { silent: true }),
        testimonialApi.getTestimonialsBySite(site.slug).catch(() => null),
        serviceAreaApi.getServiceAreaPagesBySite(site.slug, { silent: true }),
      ]);

    return {
      site,
      pages,
      services,
      blogPosts,
      projects,
      testimonials,
      serviceAreaPages,
    };
  } catch {
    return null;
  }
}
