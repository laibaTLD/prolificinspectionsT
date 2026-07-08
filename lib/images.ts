import { IMAGE_QUALITY, IMAGE_QUALITY_HIGH, IMAGE_SIZES } from '@/app/lib/imageDefaults';
import { getImageSrc } from '@/app/lib/utils';

export { IMAGE_QUALITY, IMAGE_QUALITY_HIGH, IMAGE_SIZES };

export const HERO_IMAGE_QUALITY = IMAGE_QUALITY_HIGH;
export const HERO_IMAGE_SIZES = IMAGE_SIZES.fullWidth;

export const SERVICE_IMAGE_QUALITY = IMAGE_QUALITY;
export const SERVICE_IMAGE_SIZES = IMAGE_SIZES.card;
export const SERVICE_IMAGE_WIDTH = 1200;

/** Default quality for section content images (cards, splits, galleries). */
export const SECTION_IMAGE_QUALITY = IMAGE_QUALITY;

/** Large feature / banner images within sections. */
export const SECTION_FEATURE_IMAGE_QUALITY = IMAGE_QUALITY_HIGH;

export function getHighResImageUrl(url: string, _width = 1920): string {
  return getImageSrc(url);
}
