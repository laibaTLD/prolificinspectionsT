'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import type { Page } from '@/app/lib/types';
import { useWebBuilder } from '@/app/providers/WebBuilderProvider';
import { getPageHref } from '@/app/lib/siteContent';
import { tiptapToText } from '@/app/lib/seo';
import { getImageSrc, cn } from '@/app/lib/utils';
import { OptimizedImage, IMAGE_QUALITY_HIGH, IMAGE_SIZES } from '@/app/components/ui/OptimizedImage';
import { useScrollAnimation, useStaggeredAnimation } from '@/hooks/useScrollAnimation';

type BlogSectionInput = NonNullable<Page['blogSection']> & {
  heading?: unknown;
  subtitle?: unknown;
};

function pickSectionField(
  section: BlogSectionInput | undefined,
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

function resolvePostImageRaw(post: {
  featuredImage?: unknown;
  seo?: { ogImageUrl?: string };
}): string | undefined {
  const img = post?.featuredImage;
  if (typeof img === 'string' && img.trim()) return img;
  if (img && typeof img === 'object' && (img as { url?: string }).url) {
    return (img as { url: string }).url;
  }
  if (post?.seo?.ogImageUrl) return post.seo.ogImageUrl;
  return undefined;
}

function getPostImageSrc(post: {
  featuredImage?: unknown;
  seo?: { ogImageUrl?: string };
}): string {
  const raw = resolvePostImageRaw(post);
  return raw ? getImageSrc(raw) : '';
}

function getPostImageAlt(post: { featuredImage?: unknown; title?: string }): string {
  const img = post?.featuredImage;
  if (img && typeof img === 'object' && (img as { altText?: string }).altText) {
    return (img as { altText: string }).altText;
  }
  return post?.title || '';
}

function formatPostDate(iso: string | undefined, show: boolean): string | null {
  if (!show || !iso) return null;
  try {
    return new Intl.DateTimeFormat(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(iso));
  } catch {
    return null;
  }
}

interface BlogSectionProps {
  blogSection?: Page['blogSection'];
  className?: string;
}

type BlogPostItem = {
  _id: string;
  slug: string;
  title?: string;
  excerpt?: unknown;
  publishedAt?: string;
  createdAt?: string;
  author?: { name?: string };
  categories?: string[];
  featuredImage?: unknown;
  seo?: { ogImageUrl?: string };
};

export function BlogSection({ blogSection, className }: BlogSectionProps) {
  const { blogPosts, loading, pages } = useWebBuilder();

  const sectionData = useMemo(() => {
    const fallback = pages.find((p) => p.pageType === 'blog-list')?.blogSection as
      | BlogSectionInput
      | undefined;
    const current = blogSection as BlogSectionInput | undefined;
    if (!current && !fallback) return undefined;

    return {
      enabled: current?.enabled ?? fallback?.enabled ?? false,
      postsToShow: current?.postsToShow ?? fallback?.postsToShow ?? 3,
      showExcerpt: current?.showExcerpt ?? fallback?.showExcerpt ?? true,
      showDate: current?.showDate ?? fallback?.showDate ?? true,
      title: pickSectionField(current, 'title') ?? pickSectionField(fallback, 'title'),
      description:
        pickSectionField(current, 'description') ??
        pickSectionField(fallback, 'description'),
    };
  }, [blogSection, pages]);

  const resolvedTitle = useMemo(
    () => tiptapToText(sectionData?.title) || 'Latest Articles',
    [sectionData?.title]
  );

  const resolvedDescription = useMemo(
    () => tiptapToText(sectionData?.description),
    [sectionData?.description]
  );

  const hasTitle = hasTiptapContent(sectionData?.title);
  const hasDescription = hasTiptapContent(sectionData?.description);

  const blogHref = useMemo(() => {
    const blogPage = pages.find((p) => p.pageType === 'blog-list');
    return blogPage ? getPageHref(blogPage) : '/blog';
  }, [pages]);

  const { ref: headerRef, isVisible: headerVisible } =
    useScrollAnimation<HTMLDivElement>({ threshold: 0.1 });

  if (!sectionData?.enabled) return null;

  const count = Math.min(Math.max(sectionData.postsToShow || 3, 1), 12);
  const displayPosts = blogPosts.slice(0, count) as BlogPostItem[];
  const showExcerpt = Boolean(sectionData.showExcerpt);
  const showDate = Boolean(sectionData.showDate);

  const { ref: listRef, visibleItems } = useStaggeredAnimation(
    Math.max(displayPosts.length - 1, 0),
    100
  );

  if (loading && blogPosts.length === 0) {
    return (
      <section
        id="blog"
        className={cn('relative py-8 lg:py-12 overflow-hidden wb-surface-light', className)}
      >
        <div className="container mx-auto px-6 lg:px-10 xl:px-14">
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="aspect-[4/3] animate-pulse rounded-2xl bg-[var(--wb-section-bg-light)]" />
            <div className="space-y-4">
              <div className="h-8 w-2/3 animate-pulse rounded bg-[var(--wb-section-bg-light)]" />
              <div className="h-24 animate-pulse rounded bg-[var(--wb-section-bg-light)]" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (displayPosts.length === 0 && !hasTitle && !hasDescription) {
    return null;
  }

  const [featured, ...morePosts] = displayPosts;

  return (
    <section
      id="blog"
      className={cn('relative py-8 lg:py-12 overflow-hidden wb-surface-light', className)}
    >
      <div className="container mx-auto px-6 lg:px-10 xl:px-14 relative z-10">
        <div
          ref={headerRef}
          className={`grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-start mb-6 lg:mb-8 transition-all duration-1000 ${
            headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <div>
            <span className="section-label">Journal</span>
            <h2 className="section-heading-lg">{resolvedTitle}</h2>
          </div>
          {resolvedDescription && (
            <p className="section-desc lg:pt-2 border-l-0 lg:border-l-2 lg:pl-8 border-[color-mix(in_srgb,var(--wb-text-main)_14%,transparent)]">
              {resolvedDescription}
            </p>
          )}
        </div>

        {displayPosts.length === 0 ? (
          <p className="section-desc text-center">
            No published posts yet. Add posts in the builder to show them here.
          </p>
        ) : (
          <div>
            {featured && (
              <FeaturedPostCard
                post={featured}
                showExcerpt={showExcerpt}
                showDate={showDate}
                loaded={headerVisible}
              />
            )}

            {morePosts.length > 0 && (
              <div ref={listRef} className="mt-6 lg:mt-8 divide-y divide-[color-mix(in_srgb,var(--wb-text-main)_10%,transparent)]">
                {morePosts.map((post, i) => (
                  <MorePostRow
                    key={post._id}
                    post={post}
                    index={i + 2}
                    showExcerpt={showExcerpt}
                    showDate={showDate}
                    loaded={visibleItems.includes(i)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {displayPosts.length > 0 && (
          <div
            className={`mt-6 flex justify-center lg:justify-end transition-all duration-1000 delay-500 ${
              headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
          >
            <Link href={blogHref} className="btn-pill">
              View All Articles
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

function PostMeta({
  post,
  showDate,
  className,
}: {
  post: BlogPostItem;
  showDate: boolean;
  className?: string;
}) {
  const dateLabel = formatPostDate(post.publishedAt || post.createdAt, showDate);
  const author = post.author?.name?.trim();
  const category = post.categories?.[0];

  return (
    <div className={cn('flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--wb-text-secondary)]', className)}>
      {category && (
        <span className="rounded-full border wb-border-on-light px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wide">
          {category}
        </span>
      )}
      {author && <span>By {author}</span>}
      {dateLabel && <span>{dateLabel}</span>}
    </div>
  );
}

function FeaturedPostCard({
  post,
  showExcerpt,
  showDate,
  loaded,
}: {
  post: BlogPostItem;
  showExcerpt: boolean;
  showDate: boolean;
  loaded: boolean;
}) {
  const imgSrc = getPostImageSrc(post);
  const excerpt = tiptapToText(post.excerpt);

  return (
    <article
      className={cn(
        'group overflow-hidden rounded-2xl border wb-border-on-light wb-card-light transition-all duration-1000',
        loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
      )}
    >
      <Link href={`/blog/${post.slug}`} className="grid lg:grid-cols-2 no-underline">
        <div className="relative aspect-[4/3] lg:aspect-auto lg:min-h-[360px] overflow-hidden">
          {imgSrc ? (
            <OptimizedImage
              src={imgSrc}
              alt={getPostImageAlt(post)}
              fill
              className="object-cover transition-transform duration-[1.1s] ease-out group-hover:scale-105"
              sizes={IMAGE_SIZES.sectionHalf}
              quality={IMAGE_QUALITY_HIGH}
              priority
            />
          ) : (
            <div className="absolute inset-0 bg-[var(--wb-section-bg-light)]" />
          )}
        </div>

        <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10 xl:p-12">
          <span className="section-label">Featured</span>
          <PostMeta post={post} showDate={showDate} className="mb-4" />
          {post.title && (
            <h3 className="text-2xl sm:text-3xl font-heading font-bold text-[var(--wb-text-main)] leading-tight transition-transform duration-500 group-hover:translate-x-1">
              {post.title}
            </h3>
          )}
          {showExcerpt && excerpt && (
            <p className="section-desc mt-4 line-clamp-3">{excerpt}</p>
          )}
          <span className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-[var(--wb-text-main)] transition-all duration-500 group-hover:gap-3">
            Read article
            <svg className="w-4 h-4 transition-transform duration-500 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </span>
        </div>
      </Link>
    </article>
  );
}

function MorePostRow({
  post,
  index,
  showExcerpt,
  showDate,
  loaded,
}: {
  post: BlogPostItem;
  index: number;
  showExcerpt: boolean;
  showDate: boolean;
  loaded: boolean;
}) {
  const imgSrc = getPostImageSrc(post);
  const excerpt = tiptapToText(post.excerpt);

  return (
    <Link
      href={`/blog/${post.slug}`}
      className={cn(
        'group flex items-stretch gap-4 sm:gap-8 py-6 sm:py-8 no-underline transition-all duration-700',
        loaded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
      )}
    >
      <span
        className="hidden sm:block text-4xl lg:text-5xl font-heading font-bold tabular-nums leading-none text-[color-mix(in_srgb,var(--wb-text-main)_15%,transparent)] transition-colors duration-500 group-hover:text-[var(--wb-primary)]"
        aria-hidden
      >
        {String(index).padStart(2, '0')}
      </span>

      <div className="min-w-0 flex-1">
        <PostMeta post={post} showDate={showDate} className="mb-2" />
        {post.title && (
          <h4 className="text-lg sm:text-xl font-heading font-bold text-[var(--wb-text-main)] transition-transform duration-500 group-hover:translate-x-1">
            {post.title}
          </h4>
        )}
        {showExcerpt && excerpt && (
          <p className="section-desc mt-2 line-clamp-2 hidden md:block">{excerpt}</p>
        )}
      </div>

      <div className="relative hidden md:block h-20 w-28 lg:h-24 lg:w-36 shrink-0 overflow-hidden rounded-xl border wb-border-on-light">
        {imgSrc ? (
          <OptimizedImage
            src={imgSrc}
            alt={getPostImageAlt(post)}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            sizes={IMAGE_SIZES.thumb}
          />
        ) : (
          <div className="absolute inset-0 bg-[var(--wb-section-bg-light)]" />
        )}
      </div>

      <span className="flex shrink-0 items-center self-center opacity-0 transition-all duration-500 group-hover:opacity-100 group-hover:translate-x-1 text-[var(--wb-text-main)]">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
      </span>
    </Link>
  );
}

export default BlogSection;
