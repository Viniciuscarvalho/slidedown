#!/usr/bin/env node
/**
 * SlideDown — Markdown to Beautiful PPTX Converter
 * 
 * Usage: node md2pptx.js input.md output.pptx [theme]
 * 
 * Themes: midnight, aurora, sunset, minimal, forest, brutalist
 * Default: midnight
 */

const pptxgen = require("pptxgenjs");
const fs = require("fs");
const path = require("path");

// ─── THEME DEFINITIONS ────────────────────────────────────────────

const THEMES = {
  midnight: {
    name: "Midnight",
    bg: "1E2761",
    bgAlt: "283572",
    text: "E8ECF1",
    heading: "CADCFC",
    accent: "818CF8",
    accent2: "6366F1",
    muted: "8B95B0",
    tableBg: "1B2252",
    tableAlt: "222D5A",
    codeBg: "111B3A",
    headingFont: "Georgia",
    bodyFont: "Calibri",
  },
  aurora: {
    name: "Aurora",
    bg: "0F0B2E",
    bgAlt: "1E1B4B",
    text: "E0E7FF",
    heading: "C4B5FD",
    accent: "A78BFA",
    accent2: "06B6D4",
    muted: "7C7FB0",
    tableBg: "171340",
    tableAlt: "1E1950",
    codeBg: "0D0A25",
    headingFont: "Arial Black",
    bodyFont: "Calibri",
  },
  sunset: {
    name: "Sunset",
    bg: "7C2D12",
    bgAlt: "9A3412",
    text: "FFFBEB",
    heading: "FEF3C7",
    accent: "F59E0B",
    accent2: "EF4444",
    muted: "D4A07A",
    tableBg: "6B2410",
    tableAlt: "7A2B12",
    codeBg: "5A1E0E",
    headingFont: "Trebuchet MS",
    bodyFont: "Calibri",
  },
  minimal: {
    name: "Minimal",
    bg: "FAFAFA",
    bgAlt: "F3F4F6",
    text: "1A1A1A",
    heading: "111827",
    accent: "2563EB",
    accent2: "3B82F6",
    muted: "6B7280",
    tableBg: "F9FAFB",
    tableAlt: "F3F4F6",
    codeBg: "1F2937",
    headingFont: "Cambria",
    bodyFont: "Calibri Light",
  },
  forest: {
    name: "Forest",
    bg: "052E16",
    bgAlt: "14532D",
    text: "ECFDF5",
    heading: "BBF7D0",
    accent: "4ADE80",
    accent2: "16A34A",
    muted: "6EAA8B",
    tableBg: "0A3D1F",
    tableAlt: "0F4A28",
    codeBg: "031A0D",
    headingFont: "Palatino",
    bodyFont: "Calibri",
  },
  brutalist: {
    name: "Brutalist",
    bg: "FEF08A",
    bgAlt: "FFFFFF",
    text: "000000",
    heading: "000000",
    accent: "DC2626",
    accent2: "1E293B",
    muted: "57534E",
    tableBg: "FEF9C3",
    tableAlt: "FEF08A",
    codeBg: "1E293B",
    headingFont: "Impact",
    bodyFont: "Arial",
  },
};

// ─── MARKDOWN PARSER ───────────────────────────────────────────────

function parseMarkdown(mdContent) {
  // Split by --- separator (must be on its own line)
  const rawSlides = mdContent.split(/\n---\n/);
  
  return rawSlides.map((block) => {
    const lines = block.trim().split("\n");
    const slide = {
      type: "content",
      title: "",
      subtitle: "",
      bullets: [],
      texts: [],
      quote: "",
      table: null,
      codeBlock: null,
      codeLanguage: "",
      image: null,
      imageAlt: "",
      notes: "",
    };

    let inCodeBlock = false;
    let codeLines = [];
    let codeLang = "";

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Speaker notes
      const notesMatch = line.match(/<!--\s*notes:\s*(.*?)\s*-->/);
      if (notesMatch) {
        slide.notes = notesMatch[1];
        continue;
      }

      // Code blocks
      if (line.startsWith("```")) {
        if (!inCodeBlock) {
          inCodeBlock = true;
          codeLang = line.replace("```", "").trim();
          codeLines = [];
        } else {
          inCodeBlock = false;
          slide.codeBlock = codeLines.join("\n");
          slide.codeLanguage = codeLang;
          slide.type = "code";
        }
        continue;
      }
      if (inCodeBlock) {
        codeLines.push(line);
        continue;
      }

      // Title (h1) — makes it a title slide
      if (line.startsWith("# ") && !line.startsWith("## ")) {
        slide.title = line.replace("# ", "");
        slide.type = "title";
        continue;
      }

      // Heading (h2)
      if (line.startsWith("## ")) {
        if (slide.type === "title") {
          slide.subtitle = line.replace("## ", "");
        } else {
          slide.title = line.replace("## ", "");
        }
        continue;
      }

      // Quote
      if (line.startsWith("> ")) {
        slide.quote += (slide.quote ? " " : "") + line.replace("> ", "");
        if (!slide.title) slide.type = "quote";
        continue;
      }

      // Image
      const imgMatch = line.match(/!\[([^\]]*)\]\(([^)]+)\)/);
      if (imgMatch) {
        slide.imageAlt = imgMatch[1];
        slide.image = imgMatch[2];
        slide.type = "image";
        continue;
      }

      // Table rows (skip separator rows)
      if (line.startsWith("|") && !line.match(/^\|\s*[-:]+/)) {
        if (!slide.table) slide.table = [];
        const cells = line.split("|").filter(Boolean).map(c => c.trim());
        slide.table.push(cells);
        slide.type = "table";
        continue;
      }

      // Table separator — skip
      if (line.match(/^\|\s*[-:]+/)) continue;

      // Bullets
      if (line.startsWith("- ") || line.startsWith("* ")) {
        slide.bullets.push(line.replace(/^[-*]\s+/, ""));
        continue;
      }

      // Regular text
      if (line.trim()) {
        slide.texts.push(line.trim());
      }
    }

    // Determine type if only quote + title
    if (slide.quote && slide.type === "content") {
      slide.type = "quote";
    }

    return slide;
  });
}

// ─── INLINE FORMATTING ─────────────────────────────────────────────

function parseInlineFormatting(text, defaultOpts = {}) {
  const segments = [];
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`|([^*`]+))/g;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match[2]) {
      // Bold
      segments.push({ text: match[2], options: { ...defaultOpts, bold: true } });
    } else if (match[3]) {
      // Italic
      segments.push({ text: match[3], options: { ...defaultOpts, italic: true } });
    } else if (match[4]) {
      // Code
      segments.push({
        text: match[4],
        options: {
          ...defaultOpts,
          fontFace: "Consolas",
          fontSize: (defaultOpts.fontSize || 16) - 1,
        },
      });
    } else if (match[5]) {
      segments.push({ text: match[5], options: { ...defaultOpts } });
    }
  }

  return segments.length > 0 ? segments : [{ text, options: defaultOpts }];
}

// ─── HELPER: Create fresh shadow object ────────────────────────────

function makeDecoShadow() {
  return { type: "outer", blur: 8, offset: 3, angle: 135, color: "000000", opacity: 0.1 };
}

// ─── SLIDE BUILDERS ────────────────────────────────────────────────

function addDecorations(slide, theme, slideType) {
  // Decorative accent shape — top right circle
  slide.addShape("ellipse", {
    x: 8.5, y: -0.8, w: 2.5, h: 2.5,
    fill: { color: theme.accent, transparency: 90 },
  });

  // Bottom left accent
  slide.addShape("ellipse", {
    x: -0.5, y: 4.2, w: 1.8, h: 1.8,
    fill: { color: theme.accent2, transparency: 92 },
  });

  // Slide number area — thin accent line at bottom
  slide.addShape("rect", {
    x: 0, y: 5.35, w: 10, h: 0.04,
    fill: { color: theme.accent, transparency: 70 },
  });
}

function buildTitleSlide(pres, slide, theme, index, total) {
  const s = pres.addSlide();
  s.background = { color: theme.bg };

  addDecorations(s, theme, "title");

  // Large decorative accent rectangle
  s.addShape("rect", {
    x: 0, y: 0, w: 0.12, h: 5.625,
    fill: { color: theme.accent },
  });

  // Title
  s.addText(slide.title, {
    x: 0.8, y: 1.4, w: 8.4, h: 1.6,
    fontSize: 42,
    fontFace: theme.headingFont,
    color: theme.heading,
    bold: true,
    align: "center",
    valign: "middle",
    margin: 0,
  });

  // Subtitle
  if (slide.subtitle) {
    s.addText(slide.subtitle, {
      x: 1.5, y: 3.0, w: 7, h: 0.8,
      fontSize: 20,
      fontFace: theme.bodyFont,
      color: theme.accent,
      align: "center",
      valign: "middle",
      margin: 0,
    });
  }

  // Any extra text below subtitle
  if (slide.texts.length > 0) {
    const textSegments = slide.texts.map((t, i) => {
      const segs = parseInlineFormatting(t, {
        fontSize: 16,
        fontFace: theme.bodyFont,
        color: theme.muted,
        breakLine: true,
      });
      return segs;
    }).flat();

    s.addText(textSegments, {
      x: 1.5, y: 3.8, w: 7, h: 1.0,
      align: "center",
      valign: "top",
    });
  }

  // Notes
  if (slide.notes) s.addNotes(slide.notes);

  return s;
}

function buildContentSlide(pres, slide, theme, index, total) {
  const s = pres.addSlide();
  s.background = { color: theme.bg };

  addDecorations(s, theme, "content");

  // Left accent bar
  s.addShape("rect", {
    x: 0, y: 0, w: 0.06, h: 5.625,
    fill: { color: theme.accent, transparency: 40 },
  });

  let yPos = 0.4;

  // Heading
  if (slide.title) {
    s.addText(slide.title, {
      x: 0.6, y: yPos, w: 8.8, h: 0.7,
      fontSize: 30,
      fontFace: theme.headingFont,
      color: theme.heading,
      bold: true,
      margin: 0,
    });
    yPos += 0.85;

    // Accent line under heading
    s.addShape("rect", {
      x: 0.6, y: yPos - 0.15, w: 1.2, h: 0.04,
      fill: { color: theme.accent },
    });
    yPos += 0.15;
  }

  // Quote (if present alongside other content)
  if (slide.quote) {
    s.addShape("rect", {
      x: 0.6, y: yPos, w: 0.06, h: 0.9,
      fill: { color: theme.accent },
    });
    s.addText(slide.quote, {
      x: 0.9, y: yPos, w: 8.2, h: 0.9,
      fontSize: 18,
      fontFace: theme.bodyFont,
      color: theme.text,
      italic: true,
      valign: "middle",
      margin: 0,
    });
    yPos += 1.1;
  }

  // Bullets
  if (slide.bullets.length > 0) {
    const bulletItems = slide.bullets.map((b, i) => {
      const isLast = i === slide.bullets.length - 1;
      const segments = parseInlineFormatting(b, {
        fontSize: 17,
        fontFace: theme.bodyFont,
        color: theme.text,
      });
      // Only the first segment gets the bullet; last segment gets breakLine
      segments[0].options.bullet = { code: "25CF", color: theme.accent };
      segments[0].options.paraSpaceAfter = 8;
      segments[segments.length - 1].options.breakLine = !isLast;
      return segments;
    }).flat();

    const bulletH = Math.min(slide.bullets.length * 0.48, 4.0);
    s.addText(bulletItems, {
      x: 0.6, y: yPos, w: 8.6, h: bulletH,
      valign: "top",
      margin: 0,
    });
    yPos += bulletH + 0.15;
  }

  // Regular text paragraphs
  if (slide.texts.length > 0) {
    const textSegments = slide.texts.map((t, i) => {
      const isLast = i === slide.texts.length - 1;
      return parseInlineFormatting(t, {
        fontSize: 17,
        fontFace: theme.bodyFont,
        color: theme.text,
        breakLine: !isLast,
        paraSpaceAfter: 6,
      });
    }).flat();

    s.addText(textSegments, {
      x: 0.6, y: yPos, w: 8.6, h: Math.min(slide.texts.length * 0.5, 3.0),
      valign: "top",
      margin: 0,
    });
  }

  // Slide number
  s.addText(`${index + 1}`, {
    x: 9.0, y: 5.1, w: 0.6, h: 0.3,
    fontSize: 10,
    fontFace: theme.bodyFont,
    color: theme.muted,
    align: "right",
    margin: 0,
  });

  if (slide.notes) s.addNotes(slide.notes);
  return s;
}

function buildQuoteSlide(pres, slide, theme, index, total) {
  const s = pres.addSlide();
  s.background = { color: theme.bg };

  addDecorations(s, theme, "quote");

  // Large accent bar on left
  const hasBullets = slide.bullets.length > 0;
  const quoteY = hasBullets ? 1.1 : 1.5;
  const quoteH = hasBullets ? 1.8 : 2.5;
  const barH = hasBullets ? 3.8 : 2.5;

  s.addShape("rect", {
    x: 0.8, y: quoteY, w: 0.1, h: barH,
    fill: { color: theme.accent },
  });

  // Heading if present
  if (slide.title) {
    s.addText(slide.title, {
      x: 0.6, y: 0.4, w: 8.8, h: 0.7,
      fontSize: 30,
      fontFace: theme.headingFont,
      color: theme.heading,
      bold: true,
      margin: 0,
    });
  }

  // Quote text
  s.addText(slide.quote, {
    x: 1.3, y: quoteY, w: 7.8, h: quoteH,
    fontSize: hasBullets ? 20 : 24,
    fontFace: theme.headingFont,
    color: theme.text,
    italic: true,
    valign: "middle",
    margin: 0,
    lineSpacingMultiple: 1.4,
  });

  // Bullets below quote (if present)
  if (hasBullets) {
    const bulletStartY = quoteY + quoteH + 0.15;
    const bulletItems = slide.bullets.map((b, i) => {
      const isLast = i === slide.bullets.length - 1;
      const segments = parseInlineFormatting(b, {
        fontSize: 15,
        fontFace: theme.bodyFont,
        color: theme.text,
      });
      segments[0].options.bullet = { code: "25CF", color: theme.accent };
      segments[0].options.paraSpaceAfter = 6;
      segments[segments.length - 1].options.breakLine = !isLast;
      return segments;
    }).flat();

    s.addText(bulletItems, {
      x: 1.3, y: bulletStartY, w: 7.8, h: Math.min(slide.bullets.length * 0.4, 1.8),
      valign: "top",
      margin: 0,
    });
  }

  // Slide number
  s.addText(`${index + 1}`, {
    x: 9.0, y: 5.1, w: 0.6, h: 0.3,
    fontSize: 10,
    fontFace: theme.bodyFont,
    color: theme.muted,
    align: "right",
    margin: 0,
  });

  if (slide.notes) s.addNotes(slide.notes);
  return s;
}

function buildTableSlide(pres, slide, theme, index, total) {
  const s = pres.addSlide();
  s.background = { color: theme.bg };

  addDecorations(s, theme, "table");

  let yPos = 0.4;

  // Heading
  if (slide.title) {
    s.addText(slide.title, {
      x: 0.6, y: yPos, w: 8.8, h: 0.7,
      fontSize: 30,
      fontFace: theme.headingFont,
      color: theme.heading,
      bold: true,
      margin: 0,
    });
    yPos += 1.0;
  }

  // Build table data
  if (slide.table && slide.table.length > 0) {
    const numCols = slide.table[0].length;
    const colW = Array(numCols).fill((8.6) / numCols);

    const tableRows = slide.table.map((row, ri) => {
      return row.map((cell) => ({
        text: cell,
        options: {
          fontSize: ri === 0 ? 14 : 13,
          fontFace: theme.bodyFont,
          color: ri === 0 ? "FFFFFF" : theme.text,
          bold: ri === 0,
          fill: { color: ri === 0 ? theme.accent : ri % 2 === 0 ? theme.tableAlt : theme.tableBg },
          border: { pt: 0.5, color: theme.bgAlt },
          valign: "middle",
          margin: [4, 8, 4, 8],
        },
      }));
    });

    s.addTable(tableRows, {
      x: 0.6, y: yPos,
      w: 8.6,
      colW: colW,
      rowH: Array(slide.table.length).fill(0.45),
      border: { pt: 0, color: theme.bg },
    });
  }

  // Slide number
  s.addText(`${index + 1}`, {
    x: 9.0, y: 5.1, w: 0.6, h: 0.3,
    fontSize: 10,
    fontFace: theme.bodyFont,
    color: theme.muted,
    align: "right",
    margin: 0,
  });

  if (slide.notes) s.addNotes(slide.notes);
  return s;
}

function buildCodeSlide(pres, slide, theme, index, total) {
  const s = pres.addSlide();
  s.background = { color: theme.bg };

  addDecorations(s, theme, "code");

  let yPos = 0.4;

  // Heading
  if (slide.title) {
    s.addText(slide.title, {
      x: 0.6, y: yPos, w: 8.8, h: 0.7,
      fontSize: 30,
      fontFace: theme.headingFont,
      color: theme.heading,
      bold: true,
      margin: 0,
    });
    yPos += 1.0;
  }

  // Code block background
  const codeHeight = Math.min(Math.max(slide.codeBlock.split("\n").length * 0.32, 1.5), 3.8);

  s.addShape("rect", {
    x: 0.5, y: yPos - 0.1, w: 9.0, h: codeHeight + 0.4,
    fill: { color: theme.codeBg },
    shadow: makeDecoShadow(),
    rectRadius: 0.08,
  });

  // Language label
  if (slide.codeLanguage) {
    s.addText(slide.codeLanguage.toUpperCase(), {
      x: 0.7, y: yPos - 0.05, w: 1.5, h: 0.3,
      fontSize: 9,
      fontFace: "Consolas",
      color: theme.accent,
      margin: 0,
    });
    yPos += 0.25;
  }

  // Code text
  const isLightTheme = theme.bg === "FAFAFA" || theme.bg === "FEF08A";
  s.addText(slide.codeBlock, {
    x: 0.7, y: yPos, w: 8.5, h: codeHeight,
    fontSize: 13,
    fontFace: "Consolas",
    color: isLightTheme ? "E8ECF1" : theme.text,
    valign: "top",
    margin: 0,
    lineSpacingMultiple: 1.3,
  });

  yPos += codeHeight + 0.5;

  // Text after code block
  if (slide.texts.length > 0) {
    const textSegments = slide.texts.map((t, i) => {
      const isLast = i === slide.texts.length - 1;
      return parseInlineFormatting(t, {
        fontSize: 16,
        fontFace: theme.bodyFont,
        color: theme.text,
        breakLine: !isLast,
        paraSpaceAfter: 6,
      });
    }).flat();

    s.addText(textSegments, {
      x: 0.6, y: yPos, w: 8.6, h: Math.min(slide.texts.length * 0.45, 1.5),
      valign: "top",
      margin: 0,
    });
  }

  // Slide number
  s.addText(`${index + 1}`, {
    x: 9.0, y: 5.1, w: 0.6, h: 0.3,
    fontSize: 10,
    fontFace: theme.bodyFont,
    color: theme.muted,
    align: "right",
    margin: 0,
  });

  if (slide.notes) s.addNotes(slide.notes);
  return s;
}

function buildImageSlide(pres, slide, theme, index, total) {
  const s = pres.addSlide();
  s.background = { color: theme.bg };

  let yPos = 0.4;

  // Heading
  if (slide.title) {
    s.addText(slide.title, {
      x: 0.6, y: yPos, w: 8.8, h: 0.7,
      fontSize: 30,
      fontFace: theme.headingFont,
      color: theme.heading,
      bold: true,
      margin: 0,
    });
    yPos += 1.0;
  }

  // Image — try to embed it
  try {
    if (slide.image.startsWith("http")) {
      s.addImage({
        path: slide.image,
        x: 1.0, y: yPos, w: 8.0, h: 3.5,
        sizing: { type: "contain", w: 8.0, h: 3.5 },
      });
    } else if (fs.existsSync(slide.image)) {
      s.addImage({
        path: slide.image,
        x: 1.0, y: yPos, w: 8.0, h: 3.5,
        sizing: { type: "contain", w: 8.0, h: 3.5 },
      });
    }
  } catch (err) {
    // If image fails, show placeholder text
    s.addText(`[Image: ${slide.imageAlt || slide.image}]`, {
      x: 1.0, y: yPos, w: 8.0, h: 3.5,
      fontSize: 16,
      fontFace: theme.bodyFont,
      color: theme.muted,
      align: "center",
      valign: "middle",
    });
  }

  // Caption
  if (slide.imageAlt) {
    s.addText(slide.imageAlt, {
      x: 1.0, y: yPos + 3.6, w: 8.0, h: 0.4,
      fontSize: 12,
      fontFace: theme.bodyFont,
      color: theme.muted,
      italic: true,
      align: "center",
      margin: 0,
    });
  }

  // Slide number
  s.addText(`${index + 1}`, {
    x: 9.0, y: 5.1, w: 0.6, h: 0.3,
    fontSize: 10,
    fontFace: theme.bodyFont,
    color: theme.muted,
    align: "right",
    margin: 0,
  });

  if (slide.notes) s.addNotes(slide.notes);
  return s;
}

// ─── MAIN CONVERSION ───────────────────────────────────────────────

async function convert(inputPath, outputPath, themeName) {
  const theme = THEMES[themeName] || THEMES.midnight;
  const mdContent = fs.readFileSync(inputPath, "utf-8");
  const slides = parseMarkdown(mdContent);

  console.log(`\n  SlideDown — Converting ${slides.length} slides`);
  console.log(`  Theme: ${theme.name}`);
  console.log(`  Output: ${outputPath}\n`);

  const pres = new pptxgen();
  pres.layout = "LAYOUT_16x9";
  pres.author = "SlideDown";
  pres.title = slides[0]?.title || "Presentation";

  const total = slides.length;

  for (let i = 0; i < slides.length; i++) {
    const slide = slides[i];
    console.log(`  [${i + 1}/${total}] ${slide.type}: ${slide.title || "(no title)"}`);

    switch (slide.type) {
      case "title":
        buildTitleSlide(pres, slide, theme, i, total);
        break;
      case "quote":
        buildQuoteSlide(pres, slide, theme, i, total);
        break;
      case "table":
        buildTableSlide(pres, slide, theme, i, total);
        break;
      case "code":
        buildCodeSlide(pres, slide, theme, i, total);
        break;
      case "image":
        buildImageSlide(pres, slide, theme, i, total);
        break;
      default:
        buildContentSlide(pres, slide, theme, i, total);
        break;
    }
  }

  await pres.writeFile({ fileName: outputPath });
  console.log(`\n  ✓ Done! ${total} slides saved to ${outputPath}\n`);
}

// ─── CLI ───────────────────────────────────────────────────────────

const args = process.argv.slice(2);

if (args.length < 2) {
  console.log(`
  SlideDown — Markdown to Beautiful PPTX

  Usage: node md2pptx.js <input.md> <output.pptx> [theme]

  Themes:
    midnight   Dark navy + indigo (default)
    aurora     Purple-teal gradient
    sunset     Warm orange-amber
    minimal    Clean light background
    forest     Deep green tones
    brutalist  Bold yellow + black

  Example:
    node md2pptx.js talk.md talk.pptx aurora
`);
  process.exit(1);
}

const [inputFile, outputFile, selectedTheme = "midnight"] = args;

if (!fs.existsSync(inputFile)) {
  console.error(`  ✗ File not found: ${inputFile}`);
  process.exit(1);
}

if (!THEMES[selectedTheme]) {
  console.error(`  ✗ Unknown theme: ${selectedTheme}`);
  console.error(`  Available: ${Object.keys(THEMES).join(", ")}`);
  process.exit(1);
}

convert(inputFile, outputFile, selectedTheme).catch((err) => {
  console.error("  ✗ Error:", err.message);
  process.exit(1);
});
