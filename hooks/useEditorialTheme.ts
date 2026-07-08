'use client';

import { useMemo } from 'react';
import { useThemeColors } from '@/app/hooks/useTheme';
import { themeSurface } from '@/lib/theme';

/** CSS variable tokens injected from the website builder theme. */
export const WB = {
  primary: 'var(--wb-primary)',
  primaryHover: 'var(--wb-primary-hover)',
  textMain: 'var(--wb-text-main)',
  textSecondary: 'var(--wb-text-secondary)',
  textOnDark: 'var(--wb-text-on-dark)',
  textOnDarkSecondary: 'var(--wb-text-on-dark-secondary)',
  pageBg: 'var(--wb-page-bg)',
  sectionBgLight: 'var(--wb-section-bg-light)',
  sectionBgDark: 'var(--wb-section-bg-dark)',
  cardBgLight: 'var(--wb-card-bg-light)',
  cardBgDark: 'var(--wb-card-bg-dark)',
  headingFont: 'var(--wb-heading-font, sans-serif)',
  bodyFont: 'var(--wb-body-font, sans-serif)',
} as const;

export function useEditorialTheme() {
  const colors = useThemeColors();

  return useMemo(
    () => ({
      primary: colors.primaryButton,
      primaryHover: colors.hoverActive,
      mainText: colors.mainText,
      secondaryText: colors.secondaryText,
      textOnDark: colors.darkPrimaryText,
      textOnDarkSecondary: colors.darkSecondaryText,
      pageBackground: colors.pageBackground,
      sectionBackground: colors.sectionBackground,
      sectionBackgroundDark: colors.sectionBackgroundDark,
      cardBackground: colors.cardBackground,
      cardBackgroundDark: colors.cardBackgroundDark,
      inactive: colors.inactive,
      fonts: {
        heading: WB.headingFont,
        body: WB.bodyFont,
      },
      surface: themeSurface,
      cardTint: (alpha: number) => themeSurface(colors.cardBackground, alpha),
      sectionTint: (alpha: number) => themeSurface(colors.pageBackground, alpha),
      pageTint: (alpha: number) => themeSurface(colors.pageBackground, alpha),
      mainTint: (alpha: number) => themeSurface(colors.mainText, alpha),
    }),
    [colors]
  );
}
