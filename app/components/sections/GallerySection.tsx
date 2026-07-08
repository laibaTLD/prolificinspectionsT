'use client';

import { useMemo, useState } from 'react';
import type { Page } from '@/app/lib/types';
import { tiptapToText } from '@/app/lib/seo';
import { cn, getImageSrc } from '@/app/lib/utils';
import { OptimizedImage, IMAGE_SIZES } from '@/app/components/ui/OptimizedImage';
import { useScrollAnimation, useStaggeredAnimation } from '@/hooks/useScrollAnimation';

interface GallerySectionProps {
  gallerySection?: Page['gallerySection'];
  className?: string;
  limit?: number;
  title?: string;
  description?: string;
}

type GalleryImage = {
  id: string;
  imageUrl: string;
  altText: string;
};

function mapGalleryImages(
  images: NonNullable<Page['gallerySection']>['images'] | undefined,
  limit = 3
): GalleryImage[] {
  if (!images?.length) return [];

  return images
    .map((image, index) => {
      const caption = tiptapToText(image.caption);
      const altText = image.altText?.trim() || caption || `Gallery image ${index + 1}`;
      const imageUrl = image.url ? getImageSrc(image.url) : '';

      return { id: `${image.url}-${index}`, imageUrl, altText };
    })
    .filter((image) => image.imageUrl)
    .slice(0, limit);
}

function collageClass(index: number, total: number): string {
  if (total === 1) return 'col-span-2 row-span-2 min-h-[420px]';
  if (total === 2) return index === 0 ? 'col-span-2 min-h-[320px]' : 'col-span-2 min-h-[280px]';
  if (total === 3) return index === 0 ? 'col-span-1 row-span-2 min-h-[480px]' : 'col-span-1 min-h-[230px]';
  if (total >= 4 && index === 0) return 'col-span-2 row-span-2 min-h-[400px] lg:min-h-[480px]';
  if (total >= 5 && index === total - 1) return 'col-span-2 min-h-[240px]';
  return 'min-h-[220px] sm:min-h-[240px]';
}

export function GallerySection({
  gallerySection,
  className,
  limit = 3,
  title: titleOverride,
  description: descriptionOverride,
}: GallerySectionProps) {
  const { ref: headerRef, isVisible: headerVisible } =
    useScrollAnimation<HTMLDivElement>({ threshold: 0.1 });

  const title = useMemo(
    () =>
      titleOverride ||
      tiptapToText(gallerySection?.title) ||
      'Our Work in Focus',
    [titleOverride, gallerySection?.title]
  );

  const description = useMemo(
    () =>
      descriptionOverride ||
      tiptapToText(gallerySection?.description) ||
      'A curated look at recent land clearing and site preparation projects across our service area.',
    [descriptionOverride, gallerySection?.description]
  );

  const galleryImages = useMemo(
    () => mapGalleryImages(gallerySection?.images, limit),
    [gallerySection?.images, limit]
  );

  const { ref: gridRef, visibleItems } = useStaggeredAnimation(
    galleryImages.length,
    90
  );

  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (gallerySection?.enabled === false) return null;
  if (galleryImages.length === 0) return null;

  return (
    <section
      id="gallery"
      className={cn('relative py-12 lg:py-24 wb-surface-page overflow-hidden', className)}
    >
      <div
        className="pointer-events-none absolute -right-32 top-1/4 h-96 w-96 rounded-full opacity-30 blur-3xl"
        aria-hidden
        style={{
          background: 'radial-gradient(circle, color-mix(in srgb, var(--wb-primary) 25%, transparent), transparent 70%)',
        }}
      />

      <div className="container mx-auto px-6 lg:px-10 xl:px-14 relative z-10">
        <div
          ref={headerRef}
          className={`flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-10 lg:mb-14 transition-all duration-1000 ${
            headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <div>
            <span className="section-label">Our Projects</span>
            <h2 className="section-heading-lg max-w-xl">{title}</h2>
          </div>
          <p className="section-desc max-w-md lg:text-right">{description}</p>
        </div>

        <div
          ref={gridRef}
          className="grid grid-cols-2 lg:grid-cols-3 auto-rows-fr gap-3 sm:gap-4 lg:gap-5"
        >
          {galleryImages.map((image, index) => {
            const isVisible = visibleItems.includes(index);
            const isHovered = hoveredIndex === index;

            return (
              <button
                key={image.id}
                type="button"
                className={cn(
                  'group relative overflow-hidden rounded-2xl border wb-border-on-light text-left w-full transition-all duration-700 ease-out',
                  collageClass(index, galleryImages.length),
                  isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95',
                  isHovered && 'z-10 shadow-[0_24px_60px_-20px_color-mix(in_srgb,var(--wb-primary)_40%,transparent)]'
                )}
                style={{
                  transitionDelay: isVisible ? `${index * 60}ms` : '0ms',
                  transform: isHovered ? 'scale(1.02) rotate(0deg)' : undefined,
                }}
                onClick={() => setSelectedImage(image)}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                aria-label={`View gallery image ${index + 1}`}
              >
                <OptimizedImage
                  src={image.imageUrl}
                  alt={image.altText}
                  fill
                  className={cn(
                    'object-cover transition-transform duration-[1.4s] ease-out',
                    isHovered ? 'scale-110' : 'scale-100'
                  )}
                  sizes={IMAGE_SIZES.card}
                />

                <div
                  className={cn(
                    'absolute inset-0 transition-all duration-500',
                    isHovered
                      ? 'bg-[color-mix(in_srgb,var(--wb-section-bg-dark)_40%,transparent)]'
                      : 'bg-gradient-to-t from-black/30 via-transparent to-transparent'
                  )}
                />

                <div
                  className={cn(
                    'absolute inset-0 flex items-center justify-center transition-all duration-500',
                    isHovered ? 'opacity-100' : 'opacity-0'
                  )}
                >
                  <span className="flex h-14 w-14 items-center justify-center rounded-full border wb-border-on-dark bg-[color-mix(in_srgb,var(--wb-section-bg-dark)_50%,transparent)] backdrop-blur-md scale-90 group-hover:scale-100 transition-transform duration-500">
                    <svg className="h-5 w-5 wb-text-on-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                  </span>
                </div>

                <span
                  className={cn(
                    'absolute top-3 left-3 rounded-full px-2.5 py-1 text-[10px] font-bold tracking-widest wb-text-on-dark transition-all duration-500',
                    isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
                  )}
                  style={{ backgroundColor: 'color-mix(in srgb, var(--wb-primary) 80%, transparent)' }}
                >
                  {String(index + 1).padStart(2, '0')}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 transition-opacity duration-300"
          style={{ backgroundColor: 'color-mix(in srgb, var(--wb-section-bg-dark) 94%, transparent)' }}
          onClick={() => setSelectedImage(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Gallery image preview"
        >
          <button
            type="button"
            className="absolute top-6 right-6 sm:top-10 sm:right-10 flex h-11 w-11 items-center justify-center rounded-full border wb-border-on-dark wb-text-on-dark transition-all duration-300 hover:scale-110 hover:rotate-90"
            onClick={() => setSelectedImage(null)}
            aria-label="Close preview"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div
            className="relative h-full w-full max-h-[88vh] max-w-6xl transition-transform duration-500 scale-100"
            onClick={(e) => e.stopPropagation()}
          >
            <OptimizedImage
              src={selectedImage.imageUrl}
              alt={selectedImage.altText}
              fill
              className="object-contain drop-shadow-2xl"
              sizes={IMAGE_SIZES.fullWidth}
            />
          </div>
        </div>
      )}
    </section>
  );
}

export default GallerySection;
