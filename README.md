# Colour Contrast Checker

[Colour Contrast Checker](https://www.uwarp.design/colour-contrast-checker) —
WCAG 2.x relative luminance, contrast ratios, and AA/AAA pass/fail for
foreground/background color pairs.

A lightweight, dependency-free TypeScript library for calculating colour
contrast ratios and checking WCAG 2.x accessibility compliance. Works in Deno,
Node.js, Bun, browsers, and all modern JavaScript runtimes.

## Install

### Deno

```ts
import {
  evaluateContrast,
  getContrastRatio,
  meetsWcag,
} from "jsr:@sherotree/colour-contrast-checker";
```

### Node.js / Bun / Browser

```bash
npx jsr add @sherotree/colour-contrast-checker
```

Then import:

```ts
import {
  evaluateContrast,
  getContrastRatio,
  meetsWcag,
} from "@sherotree/colour-contrast-checker";
```

## API

### Quick Start

```ts
import {
  evaluateContrast,
  getContrastRatio,
  meetsWcag,
} from "@sherotree/colour-contrast-checker";

// Get a simple contrast ratio
const ratio = getContrastRatio("#000000", "#ffffff");
console.log(ratio); // 21

// Full WCAG evaluation
const report = evaluateContrast("#767676", "#ffffff");
console.log(report.ratio); // 4.54
console.log(report.ratioFormatted); // "4.54"
console.log(report.wcag); // AA/AAA × normal/large pass/fail

// Check a single WCAG requirement
const passes = meetsWcag("#000", "#fff", "AA", "normal");
console.log(passes); // true
```

### Core Functions

#### `getContrastRatio(foreground, background)`

Returns the contrast ratio as a number (1–21), rounded to two decimals.

```ts
getContrastRatio("#000", "#fff"); // 21
getContrastRatio("#767676", "#ffffff"); // 4.54
getContrastRatio({ r: 0, g: 0, b: 0 }, { r: 255, g: 255, b: 255 }); // 21
```

#### `evaluateContrast(foreground, background)`

Returns a detailed result with normalized colors, ratio, formatted ratio string,
and WCAG compliance for all four text requirements (AA/AAA × normal/large).

```ts
const result = evaluateContrast("#767676", "#ffffff");
/*
{
  foreground: { r: 118, g: 118, b: 118 },
  background: { r: 255, g: 255, b: 255 },
  ratio: 4.54,
  ratioFormatted: "4.54",
  wcag: [
    { level: "AA", textSize: "normal", minRatio: 4.5, pass: true },
    { level: "AA", textSize: "large", minRatio: 3, pass: true },
    { level: "AAA", textSize: "normal", minRatio: 7, pass: false },
    { level: "AAA", textSize: "large", minRatio: 4.5, pass: true }
  ]
}
*/
```

#### `meetsWcag(foreground, background, level, textSize)`

Returns `true` if the color pair meets the specified WCAG requirement.

```ts
meetsWcag("#000", "#fff", "AA", "normal"); // true (21:1 ≥ 4.5:1)
meetsWcag("#777", "#888", "AA", "normal"); // false (1.29:1 < 4.5:1)
meetsWcag("#767676", "#ffffff", "AAA", "large"); // true (4.54:1 ≥ 4.5:1)
```

**Parameters:**

- `level`: `"AA"` or `"AAA"`
- `textSize`: `"normal"` (< 18pt, or < 14pt bold) or `"large"` (≥ 18pt, or ≥ 14pt
  bold)

### Color Utilities

#### `parseHex(hex)`

Parse a hex color string into an RGB object.

```ts
parseHex("#ffffff"); // { r: 255, g: 255, b: 255 }
parseHex("000"); // { r: 0, g: 0, b: 0 }
parseHex("#abc"); // { r: 170, g: 187, b: 204 }
```

#### `normalizeColor(input)`

Normalize a color input to an RGB object. Accepts hex strings or RGB objects.

```ts
normalizeColor("#fff"); // { r: 255, g: 255, b: 255 }
normalizeColor({ r: 128, g: 0, b: 255 }); // { r: 128, g: 0, b: 255 }
```

#### `relativeLuminance(rgb)`

Calculate WCAG 2.x relative luminance (0–1) for an sRGB color.

```ts
relativeLuminance({ r: 255, g: 255, b: 255 }); // 1 (white)
relativeLuminance({ r: 0, g: 0, b: 0 }); // 0 (black)
```

#### `contrastRatio(foreground, background)`

Calculate the WCAG 2.x contrast ratio (1–21) between two RGB colors.

```ts
contrastRatio({ r: 0, g: 0, b: 0 }, { r: 255, g: 255, b: 255 }); // 21
```

## Color Formats

### Supported Inputs

All contrast functions accept colors as:

- **Hex strings**: `"#RGB"`, `"#RRGGBB"` (with or without `#`)
  - Examples: `"#fff"`, `"ffffff"`, `"#123abc"`
  - 3-digit shorthand is expanded: `#abc` → `#aabbcc`
- **RGB objects**: `{ r: number, g: number, b: number }` (0–255 integers)
  - Example: `{ r: 128, g: 0, b: 255 }`

### Validation

- Hex strings must match `/^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/` after trimming
- RGB channels must be finite numbers in the range 0–255
- Invalid inputs throw descriptive `Error` exceptions

## WCAG 2.x Requirements

This library implements the
[WCAG 2.x contrast ratio formula](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)
and minimum contrast requirements for text:

| Level | Text Size | Minimum Ratio |
| ----- | --------- | ------------- |
| AA    | Normal    | 4.5:1         |
| AA    | Large     | 3:1           |
| AAA   | Normal    | 7:1           |
| AAA   | Large     | 4.5:1         |

**Text size definitions:**

- **Normal text**: < 18pt, or < 14pt bold
- **Large text**: ≥ 18pt, or ≥ 14pt bold

Access these thresholds programmatically via `WCAG_THRESHOLDS`.

## Edge Cases & Precision

### Rounding

Contrast ratios are **rounded to two decimals** before comparing to WCAG
thresholds. This matches the display precision used in accessibility tools and
avoids false passes from floating-point precision beyond what matters in
practice.

**Example:**

```ts
getContrastRatio("#767676", "#ffffff"); // 4.54 (rounded from 4.541...)
meetsWcag("#767676", "#ffffff", "AA", "normal"); // true (4.54 ≥ 4.5)
```

### Boundary Cases

For colors near WCAG thresholds, the rounded ratio determines pass/fail:

```ts
// #767676 on white: unrounded ~4.5417, rounded 4.54
meetsWcag("#767676", "#ffffff", "AA", "normal"); // true (4.54 ≥ 4.5)

// #777 on white: unrounded ~4.4793, rounded 4.48
meetsWcag("#777", "#fff", "AA", "normal"); // false (4.48 < 4.5)
```

If you require the unrounded ratio, use `contrastRatio()` directly and round as
needed.

### Invalid Inputs

All functions throw `Error` for invalid color inputs:

```ts
parseHex("invalid"); // Error: Invalid hex color: invalid
normalizeColor({ r: -1, g: 0, b: 0 }); // Error: Invalid RGB r: -1
getContrastRatio("#000", NaN); // Error: Invalid RGB r: NaN
```

## Testing

Comprehensive test suite with 50+ test cases covering:

- Hex parsing (3-digit, 6-digit, with/without `#`, whitespace)
- RGB validation (boundaries, non-finite values, out-of-range)
- Relative luminance (known values, monotonicity)
- Contrast ratios (maximum, minimum, symmetry, known intermediate values)
- WCAG compliance (all four requirements, boundary cases, rounding)
- Edge cases and error handling

Run tests:

```bash
deno task test
```

## License

MIT License — see [LICENSE](./LICENSE) for details.

## Attribution

This library is based on algorithms and test cases from the
[uwarp-contrast](https://github.com/sherotree/uwarp-packages/tree/main/packages/contrast)
npm package (MIT License, Sherotree), which powers the
[Uwarp Colour Contrast Checker](https://www.uwarp.design/colour-contrast-checker).

See [SOURCES.md](./SOURCES.md) for complete provenance and attribution.

## Contributing

This package is maintained by Sherotree for the JSR ecosystem. For issues,
questions, or contributions, please open an issue on the
[GitHub repository](https://github.com/sherotree/colour-contrast-checker).
