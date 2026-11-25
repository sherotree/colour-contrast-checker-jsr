# Source Attribution and Provenance

This package implements WCAG 2.x colour contrast calculations for the JSR
ecosystem. The algorithms, implementation, and test cases are derived from
verified existing sources with proper license compliance.

## Primary Source

**[uwarp-contrast](https://github.com/sherotree/uwarp-packages/tree/main/packages/contrast)**

- **License:** MIT
- **Author:** Sherotree
- **Repository:** <https://github.com/sherotree/uwarp-packages>
- **npm:** <https://www.npmjs.com/package/uwarp-contrast> (v0.1.0)
- **Description:** WCAG 2.x relative luminance contrast ratios and AA/AAA
  pass/fail for foreground/background color pairs
- **Live Tool:** [Uwarp Colour Contrast Checker](https://www.uwarp.design/colour-contrast-checker)

This JSR package is a **standalone JSR-ready TypeScript repackaging** of the
verified algorithms and test cases from uwarp-contrast. The core functionality
(relative luminance calculation, contrast ratio formula, WCAG threshold
comparisons, and color parsing) is preserved from the original MIT-licensed
implementation.

## Implementation Notes

### Algorithms Used

1. **WCAG 2.x Relative Luminance**

   - Formula per [WCAG 2.1 specification](https://www.w3.org/TR/WCAG21/#dfn-relative-luminance)
   - sRGB gamma correction: `s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ^ 2.4`
   - Weighted sum: `0.2126 * R + 0.7152 * G + 0.0722 * B`

2. **Contrast Ratio Calculation**

   - Formula per [WCAG 2.1 specification](https://www.w3.org/TR/WCAG21/#dfn-contrast-ratio)
   - `(L1 + 0.05) / (L2 + 0.05)` where L1 is lighter, L2 is darker
   - Range: 1:1 (no contrast) to 21:1 (maximum)
   - Rounded to two decimals for display and threshold comparison

3. **WCAG Text Contrast Requirements**
   - [Understanding SC 1.4.3: Contrast (Minimum)](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)
   - [Understanding SC 1.4.6: Contrast (Enhanced)](https://www.w3.org/WAI/WCAG21/Understanding/contrast-enhanced.html)
   - AA normal: 4.5:1 | AA large: 3:1 | AAA normal: 7:1 | AAA large: 4.5:1

### Adaptations for JSR

This package differs from the original uwarp-contrast in the following ways:

- **JSR-native exports:** Uses Deno/JSR module structure (`mod.ts`, `deno.json`)
  instead of npm `package.json` + `tsup` build
- **Deno standard library:** Test assertions use `jsr:@std/assert` instead of
  Vitest
- **TypeScript imports:** Explicit `.ts` extensions (required by Deno)
- **Documentation:** Enhanced JSDoc comments for JSR's documentation generator
- **Package metadata:** JSR-specific `deno.json` configuration
- **No dependencies:** Maintains zero runtime dependencies (test-only dev
  dependency on `@std/assert`)

### Verified Behavior

Test cases verify correctness against:

- **WCAG 2.1 specification examples**
- **Known contrast ratios** (black on white = 21:1, mid-gray = 4.54:1)
- **WCAG threshold boundaries** (AA normal 4.5:1, AAA normal 7:1, etc.)
- **Rounding behavior** matching accessibility tools

## Related Sources

The website implementation at
<https://www.uwarp.design/colour-contrast-checker> (from the
[tangweikun/zero](https://github.com/tangweikun/zero) private repository)
shares the same core algorithms as uwarp-contrast, confirming the correctness of
the published npm package used as this JSR package's source.

## License Compliance

This package is distributed under the **MIT License**, matching the original
uwarp-contrast license. The MIT License permits commercial use, modification,
distribution, and sublicensing provided the original copyright notice and
permission notice are included.

**Original Copyright Notice:**

```
MIT License
Copyright (c) Sherotree
```

**This Package:**

```
MIT License
Copyright (c) 2026 Sherotree
```

## JSR Availability

**JSR Package Name:** `@sherotree/colour-contrast-checker`

This name was verified as available on JSR (404 at
`https://jsr.io/@sherotree/colour-contrast-checker/meta.json` on 2026-11-25).

**Packagist:** The PHP package `sherotree/uwarp-contrast` v0.1.0 exists on
Packagist (published 2026-11-09). This is a separate PHP implementation of the
same WCAG 2.x algorithms.

## Standards Compliance

This implementation follows:

- [WCAG 2.1 Level AA and AAA](https://www.w3.org/WAI/WCAG21/quickref/) success
  criteria
- [Section 508 (U.S.)](https://www.section508.gov/) accessibility standards
  (which reference WCAG 2.0 Level AA)
- [EN 301 549 (EU)](https://www.etsi.org/deliver/etsi_en/301500_301599/301549/03.02.01_60/en_301549v030201p.pdf)
  accessibility requirements

## References

- [WCAG 2.1 Specification](https://www.w3.org/TR/WCAG21/)
- [Understanding WCAG 2.1](https://www.w3.org/WAI/WCAG21/Understanding/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [MDN: WCAG](https://developer.mozilla.org/en-US/docs/Web/Accessibility/Understanding_WCAG)
