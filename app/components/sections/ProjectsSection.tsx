'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { Page, Project } from '@/app/lib/types';
import { useWebBuilder } from '@/app/providers/WebBuilderProvider';
import { getPageHref } from '@/app/lib/siteContent';
import { tiptapToText } from '@/app/lib/seo';
import { cn, getImageSrc } from '@/app/lib/utils';
import { OptimizedImage, IMAGE_SIZES } from '@/app/components/ui/OptimizedImage';
import { useScrollAnimation, useStaggeredAnimation } from '@/hooks/useScrollAnimation';

interface ProjectsSectionProps {
  projectSection?: Page['projectSection'];
  projectsSection?: Page['projectsSection'];
  className?: string;
  showViewAllLink?: boolean;
  projectsLimit?: number;
}

type ManualProject = NonNullable<NonNullable<Page['projectsSection']>['projects']>[number];
type DisplayItem = Project | ManualProject;

type ProjectSectionInput = Page['projectSection'] & {
  heading?: unknown;
  subtitle?: unknown;
};

type ProjectCard = {
  key: string;
  title: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
  year: string;
  href: string;
};

function pickSectionField(
  section: ProjectSectionInput | undefined,
  primary: 'title' | 'description'
): unknown {
  if (!section) return undefined;
  const alt = primary === 'title' ? section.heading : section.subtitle;
  const value = section[primary] ?? alt;
  if (value == null || value === '') return undefined;
  return value;
}

function hasTiptapContent(content: unknown): boolean {
  if (content == null || content === '') return false;
  if (typeof content === 'object') return Boolean(tiptapToText(content));
  return Boolean(String(content).trim());
}

function isProjectEntity(p: DisplayItem): p is Project {
  return typeof (p as Project)._id === 'string' && typeof (p as Project).slug === 'string';
}

function normalizeHref(href: string): string {
  const t = href.trim();
  if (t.startsWith('http') || t.startsWith('mailto:') || t.startsWith('tel:')) return t;
  return t.startsWith('/') ? t : `/${t}`;
}

function projectHref(p: DisplayItem): string {
  if (isProjectEntity(p)) return `/project-detail/${p.slug}`;
  const href = (p as ManualProject).href;
  return typeof href === 'string' && href.length > 0 ? normalizeHref(href) : '';
}

function projectTitleText(p: DisplayItem): string {
  if (isProjectEntity(p)) return tiptapToText(p.title) || p.title || '';
  return tiptapToText((p as ManualProject).title);
}

function projectDescriptionText(p: DisplayItem): string {
  if (isProjectEntity(p)) {
    return tiptapToText(p.shortDescription) || tiptapToText(p.description) || '';
  }
  return tiptapToText((p as ManualProject).description);
}

function projectImageUrl(p: DisplayItem): string {
  if (isProjectEntity(p)) return getImageSrc(p.featuredImage?.url || p.featuredImage);
  const img = (p as ManualProject).image;
  return img?.url ? getImageSrc(img.url) : '';
}

function projectYear(p: DisplayItem): string {
  if (!isProjectEntity(p)) return '';
  const raw = p.date || p.publishedAt;
  if (!raw) return '';
  try {
    return String(new Date(raw).getFullYear());
  } catch {
    return '';
  }
}

function mapProjectCard(item: DisplayItem, index: number): ProjectCard | null {
  const title = projectTitleText(item);
  const description = projectDescriptionText(item);
  const imageUrl = projectImageUrl(item);
  if (!title && !imageUrl) return null;

  const key = isProjectEntity(item) ? item._id : `manual-${index}`;

  return {
    key,
    title: title || 'Project',
    description,
    imageUrl,
    imageAlt: title || 'Project',
    year: projectYear(item),
    href: projectHref(item),
  };
}

function ProjectCardInner({
  card,
  index,
  isVisible,
  featured = false,
}: {
  card: ProjectCard;
  index: number;
  isVisible: boolean;
  featured?: boolean;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <article
      className={cn(
        'group relative overflow-hidden rounded-2xl border wb-border-on-light transition-all duration-700 ease-out',
        featured ? 'min-h-[420px] sm:min-h-[480px]' : 'min-h-[280px] sm:min-h-[320px]',
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
      )}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {card.imageUrl ? (
        <OptimizedImage
          src={card.imageUrl}
          alt={card.imageAlt}
          fill
          className={cn(
            'object-cover transition-transform duration-[1.2s] ease-out',
            hovered ? 'scale-110' : 'scale-100'
          )}
          sizes={featured ? IMAGE_SIZES.fullWidth : IMAGE_SIZES.card}
        />
      ) : (
        <div className="absolute inset-0 bg-[var(--wb-section-bg-light)]" />
      )}

      <div
        className={cn(
          'absolute inset-0 transition-all duration-500',
          hovered ? 'bg-black/60' : 'bg-gradient-to-t from-black/70 via-black/20 to-transparent'
        )}
      />

      {card.year && (
        <span className="absolute top-4 right-4 rounded-full border wb-border-on-dark px-3 py-1 text-[10px] font-bold uppercase tracking-widest wb-text-on-dark backdrop-blur-sm">
          {card.year}
        </span>
      )}

      <div
        className={cn(
          'absolute inset-x-0 bottom-0 p-5 sm:p-6 lg:p-8 transition-all duration-500 ease-out wb-overlay-dark',
          hovered ? 'translate-y-0' : 'translate-y-2'
        )}
      >
        <span className="section-label mb-2 wb-text-on-dark-secondary">
          Project {String(index + 1).padStart(2, '0')}
        </span>
        <h3
          className={cn(
            'font-heading font-bold wb-text-on-dark transition-all duration-500',
            featured ? 'text-2xl sm:text-3xl lg:text-4xl' : 'text-lg sm:text-xl'
          )}
        >
          {card.title}
        </h3>
        {card.description && (
          <p
            className={cn(
              'mt-3 text-sm leading-relaxed wb-text-on-dark-secondary transition-all duration-500 overflow-hidden',
              hovered || featured ? 'max-h-32 opacity-100' : 'max-h-0 opacity-0 sm:max-h-16 sm:opacity-80'
            )}
          >
            {card.description.length > 160
              ? `${card.description.slice(0, 160)}…`
              : card.description}
          </p>
        )}
        {card.href && (
          <span
            className={cn(
              'mt-4 inline-flex items-center gap-2 text-sm font-medium wb-text-on-dark transition-all duration-500',
              hovered ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2 sm:opacity-70 sm:translate-x-0'
            )}
          >
            View project
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </span>
        )}
      </div>
    </article>
  );
}

export function ProjectsSection({
  projectSection,
  projectsSection,
  className,
  showViewAllLink = true,
  projectsLimit,
}: ProjectsSectionProps) {
  const { projects, pages } = useWebBuilder();

  const sectionData = useMemo(() => {
    const projectDetailPage = pages.find((p) => p.pageType === 'project-detail');
    const metaSource =
      (projectSection as ProjectSectionInput | undefined) ??
      (projectDetailPage?.projectSection as ProjectSectionInput | undefined);
    const listingSource = projectsSection ?? projectDetailPage?.projectsSection;

    return {
      enabled: metaSource?.enabled ?? listingSource?.enabled ?? true,
      title:
        pickSectionField(metaSource, 'title') ??
        pickSectionField(listingSource as ProjectSectionInput | undefined, 'title'),
      description:
        pickSectionField(metaSource, 'description') ??
        pickSectionField(listingSource as ProjectSectionInput | undefined, 'description'),
      projectIds: listingSource?.projectIds,
      manualProjects: listingSource?.projects ?? [],
    };
  }, [projectSection, projectsSection, pages]);

  const resolvedTitle = useMemo(() => {
    const text = tiptapToText(sectionData.title);
    return text || 'Selected Projects';
  }, [sectionData.title]);

  const resolvedDescription = useMemo(
    () => tiptapToText(sectionData.description),
    [sectionData.description]
  );

  const hasTitle = hasTiptapContent(sectionData.title);
  const hasDescription = hasTiptapContent(sectionData.description);

  const cards = useMemo(() => {
    const manual = sectionData.manualProjects;
    const fromApi = (projects ?? []).filter((p) =>
      sectionData.projectIds?.length
        ? sectionData.projectIds.includes(p._id)
        : p.status === 'published'
    );

    const items = manual.length > 0 ? manual : fromApi;
    const limited =
      typeof projectsLimit === 'number' && projectsLimit > 0
        ? items.slice(0, projectsLimit)
        : items;

    return limited
      .map((item, index) => mapProjectCard(item, index))
      .filter((card): card is ProjectCard => card !== null);
  }, [sectionData, projects, projectsLimit]);

  const projectsHref = useMemo(() => {
    const projectPage = pages.find((p) => p.pageType === 'project-detail');
    return projectPage ? getPageHref(projectPage) : '/project-detail';
  }, [pages]);

  const { ref: headerRef, isVisible: headerVisible } =
    useScrollAnimation<HTMLDivElement>({ threshold: 0.1 });
  const { ref: gridRef, visibleItems } = useStaggeredAnimation(cards.length, 120);

  if (!sectionData.enabled) return null;
  if (!cards.length && !hasTitle && !hasDescription) return null;

  const [featured, ...rest] = cards;

  return (
    <section
      id="projects"
      className={cn('relative py-12 lg:py-24 overflow-hidden wb-surface-page', className)}
    >
      <div className="container mx-auto px-6 lg:px-10 xl:px-14 relative z-10">
        <div
          ref={headerRef}
          className={`flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-10 lg:mb-14 transition-all duration-1000 ${
            headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <div>
            <span className="section-label">Featured Work</span>
            <h2 className="section-heading-lg max-w-2xl">{resolvedTitle}</h2>
          </div>
          {resolvedDescription && (
            <p className="section-desc max-w-md lg:max-w-sm lg:text-right">{resolvedDescription}</p>
          )}
        </div>

        {cards.length > 0 ? (
          <div ref={gridRef}>
            {featured && (
              <div className="mb-5 sm:mb-6">
                {featured.href ? (
                  <Link href={featured.href} className="block no-underline">
                    <ProjectCardInner
                      card={featured}
                      index={0}
                      isVisible={visibleItems.includes(0)}
                      featured
                    />
                  </Link>
                ) : (
                  <ProjectCardInner
                    card={featured}
                    index={0}
                    isVisible={visibleItems.includes(0)}
                    featured
                  />
                )}
              </div>
            )}

            {rest.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                {rest.map((card, i) => {
                  const index = i + 1;
                  const inner = (
                    <ProjectCardInner
                      card={card}
                      index={index}
                      isVisible={visibleItems.includes(index)}
                    />
                  );

                  return (
                    <div key={card.key}>
                      {card.href ? (
                        <Link href={card.href} className="block no-underline">
                          {inner}
                        </Link>
                      ) : (
                        inner
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <p className="section-desc text-center">
            No published projects yet. Add projects in the builder to show them here.
          </p>
        )}

        {showViewAllLink && cards.length > 0 && (
          <div
            className={`mt-10 flex justify-center transition-all duration-1000 delay-300 ${
              headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
          >
            <Link href={projectsHref} className="btn-pill">
              View All Projects
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

export default ProjectsSection;
