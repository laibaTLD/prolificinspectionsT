import { resolveThemeTextColors } from '@/app/lib/themeColorResolve';

export type ThemeColors = {
  primary: string;
  primaryHover: string;
  secondary: string;
  accent: string;
  mainText: string;
  secondaryText: string;
  pageBackground: string;
  sectionBackground: string;
  cardBackground: string;
  primaryButton: string;
  hoverActive: string;
  inactive: string;
  textOnDark: string;
  textOnDarkSecondary: string;
};

export const getThemeColors = (site: any): ThemeColors => {
  const text = resolveThemeTextColors(site?.theme);

  return {
  primary: site?.theme?.darkPrimaryColor || 'var(--wb-primary)',
  primaryHover: site?.theme?.darkPrimaryHoverColor || 'var(--wb-primary-hover)',
  secondary: site?.theme?.darkSecondaryColor || 'var(--wb-primary)',
  accent: site?.theme?.lightPrimaryColor || 'var(--wb-primary)',
  mainText: text?.textOnLight || 'var(--wb-text-main)',
  secondaryText: text?.textSecondaryOnLight || 'var(--wb-text-secondary)',
  pageBackground: site?.theme?.pageBackgroundColor || 'var(--wb-page-bg)',
  sectionBackground: site?.theme?.sectionBackgroundColorLight || 'var(--wb-section-bg-light)',
  cardBackground: site?.theme?.cardBackgroundColorLight || 'var(--wb-card-bg-light)',
  primaryButton: site?.theme?.primaryButtonColorLight || 'var(--wb-primary)',
  hoverActive: site?.theme?.hoverActiveColorLight || 'var(--wb-primary-hover)',
  inactive: site?.theme?.inactiveColorLight || 'var(--color-gray-400)',
  textOnDark: text?.textOnDark || 'var(--wb-text-on-dark)',
  textOnDarkSecondary: text?.textSecondaryOnDark || 'var(--wb-text-on-dark-secondary)',
};
};
