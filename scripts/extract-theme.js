#!/usr/bin/env node
/**
 * SlideDown — Extract Theme from Existing PPTX
 * 
 * Reads an existing .pptx file and extracts colors, fonts, and
 * layout information into a SlideDown-compatible theme JSON.
 * 
 * Usage:
 *   node extract-theme.js company.pptx                    → prints JSON to stdout
 *   node extract-theme.js company.pptx -o brand.json      → saves to file
 *   node extract-theme.js company.pptx -o brand.json -n "Acme Corp"
 * 
 * Then use with SlideDown:
 *   node md2pptx.js talk.md talk.pptx --theme-file brand.json
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// ─── HELPERS ───────────────────────────────────────────────────────

function hexToRgb(hex) {
  hex = hex.replace(/^#/, "");
  if (hex.length === 3) hex = hex.split("").map(c => c + c).join("");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return { r, g, b };
}

function rgbBrightness({ r, g, b }) {
  return (r * 299 + g * 587 + b * 114) / 1000;
}

function darken(hex, amount = 20) {
  const { r, g, b } = hexToRgb(hex);
  const d = (v) => Math.max(0, Math.round(v * (1 - amount / 100)));
  return [d(r), d(g), d(b)].map(v => v.toString(16).padStart(2, "0")).join("").toUpperCase();
}

function lighten(hex, amount = 15) {
  const { r, g, b } = hexToRgb(hex);
  const l = (v) => Math.min(255, Math.round(v + (255 - v) * (amount / 100)));
  return [l(r), l(g), l(b)].map(v => v.toString(16).padStart(2, "0")).join("").toUpperCase();
}

// ─── PPTX COLOR EXTRACTION ────────────────────────────────────────

function extractFromPptx(pptxPath) {
  // Unpack PPTX (it's a ZIP)
  const tmpDir = `/tmp/slidedown-extract-${Date.now()}`;
  fs.mkdirSync(tmpDir, { recursive: true });

  try {
    execSync(`unzip -q -o "${pptxPath}" -d "${tmpDir}"`, { stdio: "pipe" });
  } catch (err) {
    console.error("  ✗ Failed to unpack PPTX. Is it a valid file?");
    process.exit(1);
  }

  const colors = new Map();
  const fonts = new Set();
  let bgColor = null;

  // Parse theme XML (primary source of truth)
  const themeDir = path.join(tmpDir, "ppt", "theme");
  if (fs.existsSync(themeDir)) {
    const themeFiles = fs.readdirSync(themeDir).filter(f => f.endsWith(".xml"));
    for (const file of themeFiles) {
      const xml = fs.readFileSync(path.join(themeDir, file), "utf-8");

      // Extract scheme colors (dk1, dk2, lt1, lt2, accent1-6, hlink, folHlink)
      const schemeColorRegex = /<a:(dk1|dk2|lt1|lt2|accent1|accent2|accent3|accent4|accent5|accent6|hlink|folHlink)>[\s\S]*?<a:srgbClr val="([0-9A-Fa-f]{6})"[\s\S]*?<\/a:\1>/g;
      let match;
      while ((match = schemeColorRegex.exec(xml)) !== null) {
        colors.set(match[1], match[2].toUpperCase());
      }

      // Also try sysClr (Windows system colors)
      const sysColorRegex = /<a:(dk1|dk2|lt1|lt2)>[\s\S]*?<a:sysClr[^>]*lastClr="([0-9A-Fa-f]{6})"[\s\S]*?<\/a:\1>/g;
      while ((match = sysColorRegex.exec(xml)) !== null) {
        if (!colors.has(match[1])) {
          colors.set(match[1], match[2].toUpperCase());
        }
      }

      // Extract font names
      const fontRegex = /typeface="([^"]+)"/g;
      while ((match = fontRegex.exec(xml)) !== null) {
        const font = match[1];
        if (font !== "" && !font.startsWith("+") && !font.startsWith("-")) {
          fonts.add(font);
        }
      }

      // Extract major/minor font
      const majorFontMatch = xml.match(/<a:majorFont>[\s\S]*?<a:latin typeface="([^"]+)"/);
      const minorFontMatch = xml.match(/<a:minorFont>[\s\S]*?<a:latin typeface="([^"]+)"/);
      if (majorFontMatch) fonts.add(`major:${majorFontMatch[1]}`);
      if (minorFontMatch) fonts.add(`minor:${minorFontMatch[1]}`);
    }
  }

  // Parse slide layouts for additional colors & background
  const slideLayoutDir = path.join(tmpDir, "ppt", "slideLayouts");
  if (fs.existsSync(slideLayoutDir)) {
    const layoutFiles = fs.readdirSync(slideLayoutDir).filter(f => f.endsWith(".xml"));
    for (const file of layoutFiles.slice(0, 3)) {
      const xml = fs.readFileSync(path.join(slideLayoutDir, file), "utf-8");

      // Try to find background color
      const bgMatch = xml.match(/<a:srgbClr val="([0-9A-Fa-f]{6})"/);
      if (bgMatch && !bgColor) {
        bgColor = bgMatch[1].toUpperCase();
      }
    }
  }

  // Parse slideMaster for background
  const slideMasterDir = path.join(tmpDir, "ppt", "slideMasters");
  if (fs.existsSync(slideMasterDir)) {
    const masterFiles = fs.readdirSync(slideMasterDir).filter(f => f.endsWith(".xml"));
    for (const file of masterFiles.slice(0, 1)) {
      const xml = fs.readFileSync(path.join(slideMasterDir, file), "utf-8");
      const bgMatch = xml.match(/<p:bg>[\s\S]*?<a:srgbClr val="([0-9A-Fa-f]{6})"/);
      if (bgMatch) bgColor = bgMatch[1].toUpperCase();
    }
  }

  // Cleanup
  execSync(`rm -rf "${tmpDir}"`, { stdio: "pipe" });

  return { colors, fonts, bgColor };
}

// ─── BUILD THEME ──────────────────────────────────────────────────

function buildTheme(extracted, name) {
  const { colors, fonts, bgColor } = extracted;

  // Determine if dark or light based on background
  const bg = bgColor || colors.get("lt1") || "FFFFFF";
  const bgBrightness = rgbBrightness(hexToRgb(bg));
  const isDark = bgBrightness < 128;

  // Pick colors from scheme
  let textColor, headingColor, accentColor, accent2Color;

  if (isDark) {
    textColor = colors.get("lt1") || colors.get("lt2") || "E5E5E5";
    headingColor = colors.get("lt1") || "FFFFFF";
    accentColor = colors.get("accent1") || colors.get("accent2") || "818CF8";
    accent2Color = colors.get("accent2") || colors.get("accent3") || accentColor;
  } else {
    textColor = colors.get("dk1") || colors.get("dk2") || "1A1A1A";
    headingColor = colors.get("dk1") || "111827";
    accentColor = colors.get("accent1") || colors.get("accent2") || "2563EB";
    accent2Color = colors.get("accent2") || colors.get("accent3") || accentColor;
  }

  // Pick fonts
  let headingFont = "Calibri";
  let bodyFont = "Calibri";

  for (const f of fonts) {
    if (f.startsWith("major:")) headingFont = f.replace("major:", "");
    if (f.startsWith("minor:")) bodyFont = f.replace("minor:", "");
  }

  // Build derived colors
  const bgAlt = isDark ? lighten(bg, 10) : darken(bg, 5);
  const muted = isDark ? darken(textColor, 30) : lighten(textColor, 40);
  const tableBg = isDark ? darken(bg, 10) : lighten(bg, 2);
  const tableAlt = isDark ? lighten(bg, 5) : darken(bg, 3);
  const codeBg = isDark ? darken(bg, 30) : "1F2937";

  return {
    name: name || "Custom",
    category: isDark ? "dark" : "light",
    description: `Extracted from ${name || "PPTX"}`,
    bg,
    bgAlt,
    text: textColor,
    heading: headingColor,
    accent: accentColor,
    accent2: accent2Color,
    muted,
    tableBg,
    tableAlt,
    codeBg,
    headingFont,
    bodyFont,
    _source: {
      allSchemeColors: Object.fromEntries(colors),
      allFonts: [...fonts].filter(f => !f.startsWith("major:") && !f.startsWith("minor:")),
      detectedBackground: bgColor,
      isDarkTheme: isDark,
    },
  };
}

// ─── CLI ───────────────────────────────────────────────────────────

const args = process.argv.slice(2);

if (args.length < 1 || args.includes("--help") || args.includes("-h")) {
  console.log(`
  SlideDown — Extract Theme from PPTX

  Reads an existing .pptx file and outputs a SlideDown theme JSON
  with the presentation's color scheme and fonts.

  Usage:
    node extract-theme.js <presentation.pptx> [options]

  Options:
    -o, --output <file>    Save to file (default: stdout)
    -n, --name <name>      Theme name (default: "Custom")
    -h, --help             Show this help

  Examples:
    node extract-theme.js company.pptx
    node extract-theme.js company.pptx -o acme-theme.json -n "Acme Corp"
    node extract-theme.js template.pptx -o brand.json

  Then use with SlideDown:
    node md2pptx.js talk.md talk.pptx --theme-file brand.json
`);
  process.exit(0);
}

const pptxFile = args[0];

if (!fs.existsSync(pptxFile)) {
  console.error(`  ✗ File not found: ${pptxFile}`);
  process.exit(1);
}

// Parse options
let outputFile = null;
let themeName = null;

for (let i = 1; i < args.length; i++) {
  if ((args[i] === "-o" || args[i] === "--output") && args[i + 1]) {
    outputFile = args[++i];
  } else if ((args[i] === "-n" || args[i] === "--name") && args[i + 1]) {
    themeName = args[++i];
  }
}

console.error(`\n  SlideDown — Extracting theme from ${path.basename(pptxFile)}...\n`);

const extracted = extractFromPptx(pptxFile);
const theme = buildTheme(extracted, themeName);

// Report
console.error(`  Colors found: ${extracted.colors.size}`);
console.error(`  Fonts found:  ${[...extracted.fonts].filter(f => !f.startsWith("major:") && !f.startsWith("minor:")).length}`);
console.error(`  Background:   #${theme.bg} (${theme.category})`);
console.error(`  Accent:       #${theme.accent}`);
console.error(`  Heading font: ${theme.headingFont}`);
console.error(`  Body font:    ${theme.bodyFont}`);

// Remove _source before output (keep it clean)
const output = { ...theme };
const source = output._source;
delete output._source;

// Add _source as a comment section
output._extracted = source;

const json = JSON.stringify(output, null, 2);

if (outputFile) {
  fs.writeFileSync(outputFile, json);
  console.error(`\n  ✓ Theme saved to ${outputFile}`);
  console.error(`  Use: node md2pptx.js talk.md talk.pptx --theme-file ${outputFile}\n`);
} else {
  console.log(json);
}
