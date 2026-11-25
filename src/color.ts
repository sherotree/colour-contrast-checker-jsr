/**
 * RGB color representation with 0–255 integer channels.
 */
export type Rgb = { r: number; g: number; b: number };

const HEX_SHORT = /^#?([0-9a-fA-F]{3})$/;
const HEX_LONG = /^#?([0-9a-fA-F]{6})$/;

function expandShortHex(hex: string): string {
  const m = HEX_SHORT.exec(hex.trim());
  if (!m) return hex;
  const [a, b, c] = m[1].split("");
  return `#${a}${a}${b}${b}${c}${c}`;
}

/**
 * Parse a hex color string into an RGB object.
 *
 * Accepts 3-digit (#RGB) and 6-digit (#RRGGBB) formats, with or without `#`.
 *
 * @param hex Hex color string (e.g. "#fff", "ffffff", "#123abc")
 * @returns RGB object with 0–255 integer channels
 * @throws {Error} If the input is not a valid hex color
 *
 * @example
 * ```ts
 * parseHex("#ffffff"); // { r: 255, g: 255, b: 255 }
 * parseHex("000"); // { r: 0, g: 0, b: 0 }
 * parseHex("#abc"); // { r: 170, g: 187, b: 204 }
 * ```
 */
export function parseHex(hex: string): Rgb {
  const normalized = expandShortHex(hex.trim());
  const m = HEX_LONG.exec(normalized);
  if (!m) {
    throw new Error(`Invalid hex color: ${hex}`);
  }
  const n = parseInt(m[1], 16);
  return {
    r: (n >> 16) & 0xff,
    g: (n >> 8) & 0xff,
    b: n & 0xff,
  };
}

/**
 * Normalize a color input to an RGB object.
 *
 * Accepts hex strings or RGB objects. Validates that RGB channels are
 * finite numbers in the range 0–255.
 *
 * @param input Hex string or RGB object
 * @returns Validated RGB object
 * @throws {Error} If RGB channels are invalid or out of range
 *
 * @example
 * ```ts
 * normalizeColor("#fff"); // { r: 255, g: 255, b: 255 }
 * normalizeColor({ r: 128, g: 0, b: 255 }); // { r: 128, g: 0, b: 255 }
 * ```
 */
export function normalizeColor(input: string | Rgb): Rgb {
  if (typeof input === "string") {
    return parseHex(input);
  }
  const { r, g, b } = input;
  for (
    const [name, v] of [
      ["r", r],
      ["g", g],
      ["b", b],
    ] as const
  ) {
    if (!Number.isFinite(v) || v < 0 || v > 255) {
      throw new Error(`Invalid RGB ${name}: ${v}`);
    }
  }
  return { r, g, b };
}

/**
 * Calculate the WCAG 2.x relative luminance for an sRGB color.
 *
 * Returns a value in the range 0 (black) to 1 (white).
 * Uses the sRGB gamma correction formula from WCAG 2.x.
 *
 * @param rgb RGB color with 0–255 integer channels
 * @returns Relative luminance in the range 0–1
 *
 * @example
 * ```ts
 * relativeLuminance({ r: 255, g: 255, b: 255 }); // 1 (white)
 * relativeLuminance({ r: 0, g: 0, b: 0 }); // 0 (black)
 * relativeLuminance({ r: 128, g: 128, b: 128 }); // ~0.216 (mid gray)
 * ```
 */
export function relativeLuminance(rgb: Rgb): number {
  const channel = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return (
    0.2126 * channel(rgb.r) + 0.7152 * channel(rgb.g) + 0.0722 * channel(rgb.b)
  );
}

/**
 * Calculate the WCAG 2.x contrast ratio between two colors.
 *
 * Returns a value in the range 1 (no contrast) to 21 (maximum contrast).
 *
 * @param foreground Foreground RGB color
 * @param background Background RGB color
 * @returns Contrast ratio in the range 1–21
 *
 * @example
 * ```ts
 * contrastRatio({ r: 0, g: 0, b: 0 }, { r: 255, g: 255, b: 255 }); // 21 (black on white)
 * contrastRatio({ r: 128, g: 128, b: 128 }, { r: 128, g: 128, b: 128 }); // 1 (same color)
 * ```
 */
export function contrastRatio(foreground: Rgb, background: Rgb): number {
  const l1 = relativeLuminance(foreground);
  const l2 = relativeLuminance(background);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}
