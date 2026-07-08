import type { Site } from '@/app/lib/types';

function hexLuminance(hex: string): number | null {
  const normalized = hex.trim().replace('#', '');
  if (!/^[0-9a-f]{6}$/i.test(normalized)) return null;
  const n = parseInt(normalized, 16);
  const r = ((n >> 16) & 255) / 255;
  const g = ((n >> 8) & 255) / 255;
  const b = (n & 255) / 255;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function pickContrastColor(
  colors: Array<string | undefined>,
  prefer: 'dark' | 'light'
): string | undefined {
  const candidates = colors.filter((c): c is string => Boolean(c?.trim()));
  if (!candidates.length) return undefined;
  if (candidates.length === 1) return candidates[0];

  const ranked = candidates
    .map((color) => ({ color, l: hexLuminance(color) ?? 0.5 }))
    .sort((a, b) => a.l - b.l);

  return prefer === 'dark' ? ranked[0].color : ranked[ranked.length - 1].color;
}

/** Resolve text colors for light vs dark surfaces from builder theme fields. */
export function resolveThemeTextColors(theme: Site['theme'] | undefined) {
  if (!theme) return null;

  const textOnLight = pickContrastColor(
    [theme.lightPrimaryColor, theme.darkPrimaryColor, theme.mainTextColor],
    'dark'
  );
  const textOnDark = pickContrastColor(
    [theme.darkPrimaryColor, theme.lightPrimaryColor, theme.textOnDarkColor],
    'light'
  );
  const textSecondaryOnLight = pickContrastColor(
    [theme.lightSecondaryColor, theme.darkSecondaryColor, theme.secondaryTextColor],
    'dark'
  );
  const textSecondaryOnDark = pickContrastColor(
    [theme.darkSecondaryColor, theme.lightSecondaryColor, theme.textOnDarkSecondaryColor],
    'light'
  );

  return {
    textOnLight,
    textOnDark,
    textSecondaryOnLight,
    textSecondaryOnDark,
  };
}
