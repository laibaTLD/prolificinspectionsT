function parseHex(color: string): [number, number, number] | null {
  const c = color.trim();
  if (!c.startsWith('#')) return null;
  let hex = c.slice(1);
  if (hex.length === 3) hex = hex.split('').map((ch) => ch + ch).join('');
  if (hex.length !== 6) return null;
  return [
    parseInt(hex.slice(0, 2), 16),
    parseInt(hex.slice(2, 4), 16),
    parseInt(hex.slice(4, 6), 16),
  ];
}

/** Tint a brand color for borders, fills, and overlays. */
export function themeSurface(color: string, alpha: number): string {
  const a = Math.max(0, Math.min(1, alpha));
  if (color.startsWith('var(')) {
    return `color-mix(in srgb, ${color} ${Math.round(a * 100)}%, transparent)`;
  }
  const rgb = parseHex(color);
  if (rgb) return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${a})`;
  return `color-mix(in srgb, ${color} ${Math.round(a * 100)}%, transparent)`;
}
