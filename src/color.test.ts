import { assertEquals, assertThrows } from "jsr:@std/assert@1";
import { contrastRatio, normalizeColor, parseHex, relativeLuminance } from "./color.ts";

Deno.test("parseHex - 6-digit with hash", () => {
  assertEquals(parseHex("#ffffff"), { r: 255, g: 255, b: 255 });
  assertEquals(parseHex("#000000"), { r: 0, g: 0, b: 0 });
  assertEquals(parseHex("#123abc"), { r: 18, g: 58, b: 188 });
});

Deno.test("parseHex - 6-digit without hash", () => {
  assertEquals(parseHex("ffffff"), { r: 255, g: 255, b: 255 });
  assertEquals(parseHex("000000"), { r: 0, g: 0, b: 0 });
});

Deno.test("parseHex - 3-digit shorthand with hash", () => {
  assertEquals(parseHex("#fff"), { r: 255, g: 255, b: 255 });
  assertEquals(parseHex("#000"), { r: 0, g: 0, b: 0 });
  assertEquals(parseHex("#abc"), { r: 170, g: 187, b: 204 });
});

Deno.test("parseHex - 3-digit shorthand without hash", () => {
  assertEquals(parseHex("fff"), { r: 255, g: 255, b: 255 });
  assertEquals(parseHex("000"), { r: 0, g: 0, b: 0 });
});

Deno.test("parseHex - whitespace handling", () => {
  assertEquals(parseHex("  #ffffff  "), { r: 255, g: 255, b: 255 });
  assertEquals(parseHex("  fff  "), { r: 255, g: 255, b: 255 });
});

Deno.test("parseHex - invalid inputs", () => {
  assertThrows(() => parseHex("invalid"), Error, "Invalid hex color");
  assertThrows(() => parseHex("#gggggg"), Error, "Invalid hex color");
  assertThrows(() => parseHex("#ff"), Error, "Invalid hex color");
  assertThrows(() => parseHex(""), Error, "Invalid hex color");
});

Deno.test("normalizeColor - hex string", () => {
  assertEquals(normalizeColor("#fff"), { r: 255, g: 255, b: 255 });
  assertEquals(normalizeColor("000000"), { r: 0, g: 0, b: 0 });
});

Deno.test("normalizeColor - RGB object", () => {
  assertEquals(normalizeColor({ r: 128, g: 0, b: 255 }), {
    r: 128,
    g: 0,
    b: 255,
  });
});

Deno.test("normalizeColor - boundary values", () => {
  assertEquals(normalizeColor({ r: 0, g: 0, b: 0 }), { r: 0, g: 0, b: 0 });
  assertEquals(normalizeColor({ r: 255, g: 255, b: 255 }), {
    r: 255,
    g: 255,
    b: 255,
  });
});

Deno.test("normalizeColor - invalid RGB values", () => {
  assertThrows(
    () => normalizeColor({ r: -1, g: 0, b: 0 }),
    Error,
    "Invalid RGB r",
  );
  assertThrows(
    () => normalizeColor({ r: 256, g: 0, b: 0 }),
    Error,
    "Invalid RGB r",
  );
  assertThrows(
    () => normalizeColor({ r: 0, g: NaN, b: 0 }),
    Error,
    "Invalid RGB g",
  );
  assertThrows(
    () => normalizeColor({ r: 0, g: 0, b: Infinity }),
    Error,
    "Invalid RGB b",
  );
});

Deno.test("relativeLuminance - known values", () => {
  const white = relativeLuminance({ r: 255, g: 255, b: 255 });
  assertEquals(Math.round(white * 100000) / 100000, 1);

  const black = relativeLuminance({ r: 0, g: 0, b: 0 });
  assertEquals(Math.round(black * 100000) / 100000, 0);

  const midGray = relativeLuminance({ r: 128, g: 128, b: 128 });
  assertEquals(Math.round(midGray * 1000) / 1000, 0.216);
});

Deno.test("relativeLuminance - monotonic for gray scale", () => {
  let prev = 0;
  for (let i = 0; i <= 255; i += 5) {
    const lum = relativeLuminance({ r: i, g: i, b: i });
    if (i > 0) {
      assertEquals(lum > prev, true, `Luminance should increase at i=${i}`);
    }
    prev = lum;
  }
});

Deno.test("contrastRatio - maximum contrast (black on white)", () => {
  const ratio = contrastRatio(
    { r: 0, g: 0, b: 0 },
    { r: 255, g: 255, b: 255 },
  );
  assertEquals(Math.round(ratio * 100) / 100, 21);
});

Deno.test("contrastRatio - minimum contrast (same color)", () => {
  const ratio = contrastRatio(
    { r: 128, g: 128, b: 128 },
    { r: 128, g: 128, b: 128 },
  );
  assertEquals(Math.round(ratio * 100) / 100, 1);
});

Deno.test("contrastRatio - symmetric (order doesn't matter)", () => {
  const fg = { r: 118, g: 118, b: 118 };
  const bg = { r: 255, g: 255, b: 255 };
  const ratio1 = contrastRatio(fg, bg);
  const ratio2 = contrastRatio(bg, fg);
  assertEquals(ratio1, ratio2);
});

Deno.test("contrastRatio - known intermediate values", () => {
  const ratio = contrastRatio(
    { r: 118, g: 118, b: 118 },
    { r: 255, g: 255, b: 255 },
  );
  assertEquals(Math.round(ratio * 100) / 100, 4.54);
});

Deno.test("contrastRatio - boundary AA normal (4.5:1)", () => {
  const fg = { r: 118, g: 118, b: 118 };
  const bg = { r: 255, g: 255, b: 255 };
  const ratio = contrastRatio(fg, bg);
  assertEquals(ratio >= 4.5, true, "Should pass AA normal");
});

Deno.test("contrastRatio - boundary AAA normal (7:1)", () => {
  const fgPass = { r: 89, g: 89, b: 89 };
  const fgFail = { r: 118, g: 118, b: 118 };
  const bg = { r: 255, g: 255, b: 255 };

  const ratioPass = contrastRatio(fgPass, bg);
  assertEquals(ratioPass >= 7, true, "Should pass AAA normal");

  const ratioFail = contrastRatio(fgFail, bg);
  assertEquals(ratioFail < 7, true, "Should fail AAA normal");
});
