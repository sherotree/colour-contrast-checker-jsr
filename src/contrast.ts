import { contrastRatio, normalizeColor, type Rgb } from "./color.ts";

/**
 * WCAG conformance level: AA or AAA.
 */
export type WcagLevel = "AA" | "AAA";

/**
 * Text size category for WCAG contrast requirements.
 * - "normal": Regular text (< 18pt, or < 14pt bold)
 * - "large": Large text (≥ 18pt, or ≥ 14pt bold)
 */
export type WcagTextSize = "normal" | "large";

/**
 * A WCAG contrast requirement definition.
 */
export type WcagRequirement = {
  level: WcagLevel;
  textSize: WcagTextSize;
  minRatio: number;
};

/**
 * WCAG 2.x minimum contrast ratios for text.
 *
 * | Level | Text Size | Minimum Ratio |
 * |-------|-----------| -------------|
 * | AA    | normal    | 4.5           |
 * | AA    | large     | 3             |
 * | AAA   | normal    | 7             |
 * | AAA   | large     | 4.5           |
 */
export const WCAG_THRESHOLDS: readonly WcagRequirement[] = [
  { level: "AA", textSize: "normal", minRatio: 4.5 },
  { level: "AA", textSize: "large", minRatio: 3 },
  { level: "AAA", textSize: "normal", minRatio: 7 },
  { level: "AAA", textSize: "large", minRatio: 4.5 },
] as const;

/**
 * Pass/fail result for a single WCAG requirement.
 */
export type WcagPassResult = {
  level: WcagLevel;
  textSize: WcagTextSize;
  minRatio: number;
  pass: boolean;
};

/**
 * Complete contrast evaluation result with WCAG compliance.
 */
export type ContrastResult = {
  /** Normalized foreground RGB color */
  foreground: Rgb;
  /** Normalized background RGB color */
  background: Rgb;
  /** Contrast ratio rounded to two decimals */
  ratio: number;
  /** Formatted ratio string (e.g. "4.54") */
  ratioFormatted: string;
  /** WCAG pass/fail results for all AA/AAA × normal/large combinations */
  wcag: WcagPassResult[];
};

function roundRatio(ratio: number): number {
  return Math.round(ratio * 100) / 100;
}

/**
 * Compute contrast ratio and WCAG AA/AAA pass/fail for normal and large text.
 *
 * Returns the normalized colors, the contrast ratio (rounded to two decimals),
 * and pass/fail results for all four WCAG requirements (AA/AAA × normal/large).
 *
 * @param foreground Foreground color (hex string or RGB object)
 * @param background Background color (hex string or RGB object)
 * @returns Complete evaluation result with WCAG compliance
 * @throws {Error} If color inputs are invalid
 *
 * @example
 * ```ts
 * const result = evaluateContrast("#767676", "#ffffff");
 * console.log(result.ratio); // 4.54
 * console.log(result.ratioFormatted); // "4.54"
 * console.log(result.wcag);
 * // [
 * //   { level: "AA", textSize: "normal", minRatio: 4.5, pass: true },
 * //   { level: "AA", textSize: "large", minRatio: 3, pass: true },
 * //   { level: "AAA", textSize: "normal", minRatio: 7, pass: false },
 * //   { level: "AAA", textSize: "large", minRatio: 4.5, pass: true }
 * // ]
 * ```
 */
export function evaluateContrast(
  foreground: string | Rgb,
  background: string | Rgb,
): ContrastResult {
  const fg = normalizeColor(foreground);
  const bg = normalizeColor(background);
  const ratio = contrastRatio(fg, bg);
  const rounded = roundRatio(ratio);

  const wcag: WcagPassResult[] = WCAG_THRESHOLDS.map((req) => ({
    level: req.level,
    textSize: req.textSize,
    minRatio: req.minRatio,
    pass: ratio >= req.minRatio,
  }));

  return {
    foreground: fg,
    background: bg,
    ratio: rounded,
    ratioFormatted: rounded.toFixed(2),
    wcag,
  };
}

/**
 * Get the numeric contrast ratio between two colors.
 *
 * Shorthand for calculating just the ratio without full WCAG evaluation.
 * Returns the ratio rounded to two decimals.
 *
 * @param foreground Foreground color (hex string or RGB object)
 * @param background Background color (hex string or RGB object)
 * @returns Contrast ratio rounded to two decimals
 * @throws {Error} If color inputs are invalid
 *
 * @example
 * ```ts
 * getContrastRatio("#000000", "#ffffff"); // 21
 * getContrastRatio("#767676", "#ffffff"); // 4.54
 * getContrastRatio({ r: 0, g: 0, b: 0 }, { r: 255, g: 255, b: 255 }); // 21
 * ```
 */
export function getContrastRatio(
  foreground: string | Rgb,
  background: string | Rgb,
): number {
  return roundRatio(
    contrastRatio(normalizeColor(foreground), normalizeColor(background)),
  );
}

/**
 * Check if a color pair meets a specific WCAG requirement.
 *
 * @param foreground Foreground color (hex string or RGB object)
 * @param background Background color (hex string or RGB object)
 * @param level WCAG level: "AA" or "AAA"
 * @param textSize Text size: "normal" or "large"
 * @returns True if the pair meets the requirement, false otherwise
 * @throws {Error} If color inputs are invalid
 *
 * @example
 * ```ts
 * meetsWcag("#000", "#fff", "AA", "normal"); // true (21:1 ≥ 4.5:1)
 * meetsWcag("#777", "#888", "AA", "normal"); // false (1.29:1 < 4.5:1)
 * meetsWcag("#767676", "#ffffff", "AAA", "large"); // true (4.54:1 ≥ 4.5:1)
 * ```
 */
export function meetsWcag(
  foreground: string | Rgb,
  background: string | Rgb,
  level: WcagLevel,
  textSize: WcagTextSize,
): boolean {
  const ratio = contrastRatio(
    normalizeColor(foreground),
    normalizeColor(background),
  );
  const req = WCAG_THRESHOLDS.find(
    (t) => t.level === level && t.textSize === textSize,
  );
  if (!req) return false;
  return ratio >= req.minRatio;
}
