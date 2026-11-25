import { assertEquals } from "jsr:@std/assert@1";
import {
  evaluateContrast,
  getContrastRatio,
  meetsWcag,
  WCAG_THRESHOLDS,
} from "./contrast.ts";

Deno.test("WCAG_THRESHOLDS - correct values", () => {
  assertEquals(WCAG_THRESHOLDS.length, 4);
  assertEquals(WCAG_THRESHOLDS[0], {
    level: "AA",
    textSize: "normal",
    minRatio: 4.5,
  });
  assertEquals(WCAG_THRESHOLDS[1], { level: "AA", textSize: "large", minRatio: 3 });
  assertEquals(WCAG_THRESHOLDS[2], {
    level: "AAA",
    textSize: "normal",
    minRatio: 7,
  });
  assertEquals(WCAG_THRESHOLDS[3], {
    level: "AAA",
    textSize: "large",
    minRatio: 4.5,
  });
});

Deno.test("getContrastRatio - black on white", () => {
  const ratio = getContrastRatio("#000", "#fff");
  assertEquals(ratio, 21);
});

Deno.test("getContrastRatio - with RGB objects", () => {
  const ratio = getContrastRatio(
    { r: 0, g: 0, b: 0 },
    { r: 255, g: 255, b: 255 },
  );
  assertEquals(ratio, 21);
});

Deno.test("getContrastRatio - intermediate value", () => {
  const ratio = getContrastRatio("#767676", "#ffffff");
  assertEquals(ratio, 4.54);
});

Deno.test("getContrastRatio - same color", () => {
  const ratio = getContrastRatio("#888", "#888");
  assertEquals(ratio, 1);
});

Deno.test("evaluateContrast - structure", () => {
  const result = evaluateContrast("#767676", "#ffffff");

  assertEquals(result.foreground, { r: 118, g: 118, b: 118 });
  assertEquals(result.background, { r: 255, g: 255, b: 255 });
  assertEquals(result.ratio, 4.54);
  assertEquals(result.ratioFormatted, "4.54");
  assertEquals(result.wcag.length, 4);
});

Deno.test("evaluateContrast - WCAG pass/fail for #767676 on white", () => {
  const result = evaluateContrast("#767676", "#ffffff");

  const aaNormal = result.wcag.find(
    (w) => w.level === "AA" && w.textSize === "normal",
  );
  assertEquals(aaNormal?.pass, true, "Should pass AA normal (4.54 ≥ 4.5)");

  const aaLarge = result.wcag.find(
    (w) => w.level === "AA" && w.textSize === "large",
  );
  assertEquals(aaLarge?.pass, true, "Should pass AA large (4.54 ≥ 3)");

  const aaaNormal = result.wcag.find(
    (w) => w.level === "AAA" && w.textSize === "normal",
  );
  assertEquals(aaaNormal?.pass, false, "Should fail AAA normal (4.54 < 7)");

  const aaaLarge = result.wcag.find(
    (w) => w.level === "AAA" && w.textSize === "large",
  );
  assertEquals(aaaLarge?.pass, true, "Should pass AAA large (4.54 ≥ 4.5)");
});

Deno.test("evaluateContrast - black on white passes all", () => {
  const result = evaluateContrast("#000", "#fff");

  for (const req of result.wcag) {
    assertEquals(
      req.pass,
      true,
      `Black on white should pass ${req.level} ${req.textSize}`,
    );
  }
});

Deno.test("evaluateContrast - low contrast fails all", () => {
  const result = evaluateContrast("#888", "#999");

  for (const req of result.wcag) {
    assertEquals(
      req.pass,
      false,
      `Low contrast should fail ${req.level} ${req.textSize}`,
    );
  }
});

Deno.test("meetsWcag - black on white", () => {
  assertEquals(meetsWcag("#000", "#fff", "AA", "normal"), true);
  assertEquals(meetsWcag("#000", "#fff", "AA", "large"), true);
  assertEquals(meetsWcag("#000", "#fff", "AAA", "normal"), true);
  assertEquals(meetsWcag("#000", "#fff", "AAA", "large"), true);
});

Deno.test("meetsWcag - low contrast", () => {
  assertEquals(meetsWcag("#888", "#999", "AA", "normal"), false);
  assertEquals(meetsWcag("#888", "#999", "AA", "large"), false);
  assertEquals(meetsWcag("#888", "#999", "AAA", "normal"), false);
  assertEquals(meetsWcag("#888", "#999", "AAA", "large"), false);
});

Deno.test("meetsWcag - boundary case #767676 on white", () => {
  assertEquals(meetsWcag("#767676", "#ffffff", "AA", "normal"), true);
  assertEquals(meetsWcag("#767676", "#ffffff", "AA", "large"), true);
  assertEquals(meetsWcag("#767676", "#ffffff", "AAA", "normal"), false);
  assertEquals(meetsWcag("#767676", "#ffffff", "AAA", "large"), true);
});

Deno.test("meetsWcag - with RGB objects", () => {
  assertEquals(
    meetsWcag({ r: 0, g: 0, b: 0 }, { r: 255, g: 255, b: 255 }, "AA", "normal"),
    true,
  );
});

Deno.test("meetsWcag - symmetric (order doesn't matter)", () => {
  const fg = "#767676";
  const bg = "#ffffff";
  assertEquals(meetsWcag(fg, bg, "AA", "normal"), meetsWcag(bg, fg, "AA", "normal"));
});

Deno.test("evaluateContrast - no rounding errors at boundaries", () => {
  const testCases = [
    { fg: "#767676", bg: "#ffffff", aaExpected: true },
    { fg: "#777", bg: "#fff", aaExpected: false },
  ];

  for (const tc of testCases) {
    const result = evaluateContrast(tc.fg, tc.bg);
    const aaNormal = result.wcag.find(
      (w) => w.level === "AA" && w.textSize === "normal",
    );
    assertEquals(
      aaNormal?.pass,
      tc.aaExpected,
      `${tc.fg} on ${tc.bg} should ${tc.aaExpected ? "pass" : "fail"} AA normal`,
    );
  }
});

Deno.test("evaluateContrast - rounding must not cause false pass", () => {
  const result = evaluateContrast({ r: 118, g: 119, b: 118 }, "#ffffff");

  assertEquals(
    result.ratioFormatted,
    "4.50",
    "Display ratio must be 4.50",
  );

  const aaNormal = result.wcag.find(
    (w) => w.level === "AA" && w.textSize === "normal",
  );
  assertEquals(
    aaNormal?.pass,
    false,
    "RGB(118,119,118) has unrounded ratio 4.496<4.5, must FAIL AA normal despite displaying 4.50",
  );
});

Deno.test("evaluateContrast - precision matches rounded display", () => {
  const result = evaluateContrast("#767676", "#ffffff");

  assertEquals(result.ratio, 4.54);
  assertEquals(result.ratioFormatted, "4.54");

  const displayedValue = parseFloat(result.ratioFormatted);
  assertEquals(result.ratio, displayedValue);
});
