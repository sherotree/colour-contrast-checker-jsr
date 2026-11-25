/**
 * WCAG 2.x colour contrast ratio calculator and accessibility compliance checker.
 *
 * Calculate relative luminance, contrast ratios, and test WCAG AA/AAA pass/fail
 * for foreground/background color pairs. Supports hex strings (#RGB, #RRGGBB) and
 * RGB objects with 0–255 channel values.
 *
 * @module
 *
 * @example
 * ```ts
 * import { evaluateContrast, getContrastRatio, meetsWcag } from "@sherotree/colour-contrast-checker";
 *
 * // Quick ratio check
 * const ratio = getContrastRatio("#000000", "#ffffff");
 * console.log(ratio); // 21
 *
 * // Full WCAG evaluation
 * const result = evaluateContrast("#767676", "#ffffff");
 * console.log(result.ratio); // 4.54
 * console.log(result.wcag); // AA/AAA × normal/large pass/fail
 *
 * // Single compliance check
 * const passes = meetsWcag("#000", "#fff", "AA", "normal");
 * console.log(passes); // true
 * ```
 */

export type { Rgb } from "./src/color.ts";
export type {
  ContrastResult,
  WcagLevel,
  WcagPassResult,
  WcagRequirement,
  WcagTextSize,
} from "./src/contrast.ts";

export {
  contrastRatio,
  normalizeColor,
  parseHex,
  relativeLuminance,
} from "./src/color.ts";

export {
  evaluateContrast,
  getContrastRatio,
  meetsWcag,
  WCAG_THRESHOLDS,
} from "./src/contrast.ts";
