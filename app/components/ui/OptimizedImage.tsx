import NextImage, { type ImageProps } from 'next/image';
import { forwardRef } from 'react';
import { IMAGE_QUALITY, IMAGE_SIZES } from '@/app/lib/imageDefaults';
import { cn } from '@/app/lib/utils';

export type OptimizedImageProps = Omit<ImageProps, 'src'> & {
  src: string;
};

function useNativeImgElement(src: string, unoptimized?: boolean): boolean {
  if (!src || unoptimized) return true;
  if (src.startsWith('data:') || src.startsWith('blob:')) return true;
  if (/\.svg(\?|#|$)/i.test(src)) return true;
  return false;
}

/**
 * Wrapper around next/image: WebP/AVIF, default quality 90, sensible size hints for CMS URLs.
 */
export const OptimizedImage = forwardRef<HTMLImageElement | null, OptimizedImageProps>(
  function OptimizedImage(
    {
      src,
      alt = '',
      className,
      fill,
      width,
      height,
      sizes,
      style,
      quality = IMAGE_QUALITY,
      unoptimized,
      ...rest
    },
    ref
  ) {
    if (!src) return null;

    if (useNativeImgElement(src, unoptimized)) {
      const {
        priority,
        placeholder: _placeholder,
        blurDataURL: _blurDataURL,
        loader: _loader,
        overrideSrc: _overrideSrc,
        onLoadingComplete: _onLoadingComplete,
        loading: loadingProp,
        ...nativeRest
      } = rest;

      const fillStyle = fill
        ? { position: 'absolute' as const, inset: 0, width: '100%', height: '100%', objectFit: 'cover' as const }
        : undefined;
      return (
        <img
          ref={ref}
          src={src}
          alt={alt}
          className={cn(fill && 'h-full w-full object-cover', className)}
          style={{ ...fillStyle, ...style }}
          loading={priority ? 'eager' : loadingProp ?? 'lazy'}
          fetchPriority={priority ? 'high' : undefined}
          {...nativeRest}
        />
      );
    }

    const { loading: _omitLoading, ...imageRest } = rest;
    void _omitLoading;

    if (fill) {
      return (
        <NextImage
          ref={ref}
          src={src}
          alt={alt}
          fill
          quality={quality}
          sizes={sizes ?? IMAGE_SIZES.sectionWide}
          className={cn('object-cover', className)}
          style={style}
          {...imageRest}
        />
      );
    }

    const w = width ?? 1200;
    const h = height ?? 800;

    return (
      <NextImage
        ref={ref}
        src={src}
        alt={alt}
        width={w}
        height={h}
        quality={quality}
        sizes={sizes ?? IMAGE_SIZES.content}
        className={cn('h-auto max-w-full', className)}
        style={style}
        {...imageRest}
      />
    );
  }
);

export { IMAGE_QUALITY, IMAGE_QUALITY_HIGH, IMAGE_SIZES } from '@/app/lib/imageDefaults';
