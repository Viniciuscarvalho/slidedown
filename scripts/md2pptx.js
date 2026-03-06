#!/usr/bin/env node
/**
 * SlideDown — Markdown to Beautiful PPTX Converter
 * 
 * Usage:
 *   node md2pptx.js input.md output.pptx [theme]
 *   node md2pptx.js input.md output.pptx --theme-file brand.json
 *   node md2pptx.js --list-themes
 * 
 * Built-in: midnight, aurora, sunset, minimal, forest, brutalist,
 *           corporate, rose, ocean, terracotta, lavender, noir,
 *           neon, paper, cherry, sage
 * 
 * Custom:   --theme-file path/to/theme.json
 * Extract:  node extract-theme.js company.pptx > brand.json
 */

const pptxgen = require("pptxgenjs");
const fs = require("fs");
const path = require("path");

// ─── THEME DEFINITIONS ────────────────────────────────────────────

const THEMES = {

  // ── DARK THEMES ────────────────────────────────────────────────

  midnight: {
    name: "Midnight",
    category: "dark",
    description: "Dark navy + indigo. Professional, modern.",
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
    category: "dark",
    description: "Purple-teal gradient. Creative, bold.",
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
    category: "dark",
    description: "Warm orange-amber. Energetic, startup-friendly.",
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
  forest: {
    name: "Forest",
    category: "dark",
    description: "Deep green tones. Calm, trustworthy.",
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
  noir: {
    name: "Noir",
    category: "dark",
    description: "True black + white. Cinematic, elegant.",
    bg: "0A0A0A",
    bgAlt: "171717",
    text: "E5E5E5",
    heading: "FFFFFF",
    accent: "A3A3A3",
    accent2: "737373",
    muted: "525252",
    tableBg: "141414",
    tableAlt: "1C1C1C",
    codeBg: "050505",
    headingFont: "Georgia",
    bodyFont: "Calibri",
  },
  neon: {
    name: "Neon",
    category: "dark",
    description: "Dark with neon cyan accents. Futuristic, tech.",
    bg: "0C0C1D",
    bgAlt: "12122B",
    text: "E0F2FE",
    heading: "67E8F9",
    accent: "06B6D4",
    accent2: "8B5CF6",
    muted: "5B7B8A",
    tableBg: "0E0E24",
    tableAlt: "141430",
    codeBg: "080818",
    headingFont: "Arial Black",
    bodyFont: "Calibri",
  },
  ocean: {
    name: "Ocean",
    category: "dark",
    description: "Deep blue to teal. Marine, trustworthy.",
    bg: "0C4A6E",
    bgAlt: "155E75",
    text: "E0F2FE",
    heading: "BAE6FD",
    accent: "38BDF8",
    accent2: "0EA5E9",
    muted: "7CA8C4",
    tableBg: "0A3F5F",
    tableAlt: "0D4D73",
    codeBg: "082F49",
    headingFont: "Trebuchet MS",
    bodyFont: "Calibri",
  },
  cherry: {
    name: "Cherry",
    category: "dark",
    description: "Deep cherry red. Bold, confident.",
    bg: "450A0A",
    bgAlt: "7F1D1D",
    text: "FEF2F2",
    heading: "FECACA",
    accent: "F87171",
    accent2: "EF4444",
    muted: "B07070",
    tableBg: "3B0808",
    tableAlt: "4C0E0E",
    codeBg: "2A0606",
    headingFont: "Georgia",
    bodyFont: "Calibri",
  },

  // ── LIGHT THEMES ───────────────────────────────────────────────

  minimal: {
    name: "Minimal",
    category: "light",
    description: "Clean off-white. Academic, corporate.",
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
  brutalist: {
    name: "Brutalist",
    category: "light",
    description: "Bold yellow + black. Striking, memorable.",
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
  corporate: {
    name: "Corporate",
    category: "light",
    description: "Classic navy on white. Professional, trustworthy.",
    bg: "FFFFFF",
    bgAlt: "F8FAFC",
    text: "334155",
    heading: "1E293B",
    accent: "1D4ED8",
    accent2: "2563EB",
    muted: "94A3B8",
    tableBg: "F8FAFC",
    tableAlt: "F1F5F9",
    codeBg: "1E293B",
    headingFont: "Calibri",
    bodyFont: "Calibri",
  },
  rose: {
    name: "Rosé",
    category: "light",
    description: "Soft pink + rose. Modern, elegant.",
    bg: "FFF1F2",
    bgAlt: "FFE4E6",
    text: "4C0519",
    heading: "881337",
    accent: "E11D48",
    accent2: "F43F5E",
    muted: "9F7080",
    tableBg: "FFF1F2",
    tableAlt: "FFE4E6",
    codeBg: "1C1917",
    headingFont: "Georgia",
    bodyFont: "Calibri",
  },
  terracotta: {
    name: "Terracotta",
    category: "light",
    description: "Warm earth tones. Organic, crafted.",
    bg: "FEFCE8",
    bgAlt: "FEF3C7",
    text: "451A03",
    heading: "78350F",
    accent: "B45309",
    accent2: "D97706",
    muted: "92753A",
    tableBg: "FFFBEB",
    tableAlt: "FEF3C7",
    codeBg: "292524",
    headingFont: "Palatino",
    bodyFont: "Calibri",
  },
  lavender: {
    name: "Lavender",
    category: "light",
    description: "Soft purple tones. Calm, creative.",
    bg: "FAF5FF",
    bgAlt: "F3E8FF",
    text: "3B0764",
    heading: "581C87",
    accent: "9333EA",
    accent2: "A855F7",
    muted: "8B70A0",
    tableBg: "FAF5FF",
    tableAlt: "F3E8FF",
    codeBg: "1E1B4B",
    headingFont: "Georgia",
    bodyFont: "Calibri Light",
  },
  paper: {
    name: "Paper",
    category: "light",
    description: "Warm parchment feel. Classic, literary.",
    bg: "FAF8F5",
    bgAlt: "F5F0EB",
    text: "292524",
    heading: "1C1917",
    accent: "B45309",
    accent2: "92400E",
    muted: "78716C",
    tableBg: "F5F0EB",
    tableAlt: "EFEBE5",
    codeBg: "292524",
    headingFont: "Palatino",
    bodyFont: "Calibri",
  },
  sage: {
    name: "Sage",
    category: "light",
    description: "Muted green. Calm, balanced, natural.",
    bg: "F0FDF4",
    bgAlt: "DCFCE7",
    text: "14532D",
    heading: "166534",
    accent: "16A34A",
    accent2: "22C55E",
    muted: "6B8E6B",
    tableBg: "F0FDF4",
    tableAlt: "DCFCE7",
    codeBg: "1A2E1A",
    headingFont: "Cambria",
    bodyFont: "Calibri",
  },
};

// ─── CUSTOM THEME LOADER ──────────────────────────────────────────

function loadCustomTheme(filePath) {
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    const custom = JSON.parse(raw);

    // Validate required fields
    const required = ["bg", "text", "heading", "accent"];
    for (const field of required) {
      if (!custom[field]) {
        console.error(`  ✗ Custom theme missing required field: ${field}`);
        console.error(`  Required: ${required.join(", ")}`);
        process.exit(1);
      }
    }

    // Fill defaults for optional fields
    return {
      name: custom.name || "Custom",
      category: custom.category || "custom",
      description: custom.description || "Custom theme",
      bg: custom.bg,
      bgAlt: custom.bgAlt || custom.bg,
      text: custom.text,
      heading: custom.heading,
      accent: custom.accent,
      accent2: custom.accent2 || custom.accent,
      muted: custom.muted || custom.text,
      tableBg: custom.tableBg || custom.bgAlt || custom.bg,
      tableAlt: custom.tableAlt || custom.bg,
      codeBg: custom.codeBg || "1E293B",
      headingFont: custom.headingFont || "Calibri",
      bodyFont: custom.bodyFont || "Calibri",
    };
  } catch (err) {
    console.error(`  ✗ Error loading theme file: ${err.message}`);
    process.exit(1);
  }
}

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

async function convert(inputPath, outputPath, themeName, themeObj) {
  const theme = themeObj || THEMES[themeName] || THEMES.midnight;
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

// --list-themes command
if (args.includes("--list-themes")) {
  console.log("\n  SlideDown — Available Themes\n");

  const dark = Object.entries(THEMES).filter(([, t]) => t.category === "dark");
  const light = Object.entries(THEMES).filter(([, t]) => t.category === "light");

  console.log("  ── Dark Themes ──────────────────────────────────────");
  for (const [key, t] of dark) {
    console.log(`    ${key.padEnd(14)} ${t.description}`);
  }
  console.log("\n  ── Light Themes ─────────────────────────────────────");
  for (const [key, t] of light) {
    console.log(`    ${key.padEnd(14)} ${t.description}`);
  }
  console.log("\n  ── Custom Theme ─────────────────────────────────────");
  console.log("    --theme-file brand.json    Load custom theme from JSON");
  console.log("    node extract-theme.js company.pptx   Extract from existing PPTX");
  console.log("");
  process.exit(0);
}

if (args.length < 2) {
  console.log(`
  SlideDown — Markdown to Beautiful PPTX

  Usage:
    node md2pptx.js <input.md> <output.pptx> [theme]
    node md2pptx.js <input.md> <output.pptx> --theme-file brand.json
    node md2pptx.js --list-themes

  Built-in Themes (16):
    midnight       Dark navy + indigo (default)
    aurora         Purple-teal gradient
    sunset         Warm orange-amber
    minimal        Clean light background
    forest         Deep green tones
    brutalist      Bold yellow + black
    corporate      Classic navy on white
    rose           Soft pink + rose
    ocean          Deep blue to teal
    terracotta     Warm earth tones
    lavender       Soft purple tones
    noir           True black + white
    neon           Dark with neon cyan
    paper          Warm parchment feel
    cherry         Deep cherry red
    sage           Muted green, calm

  Custom Theme:
    --theme-file brand.json    Use your own colors/fonts

  Extract from existing PPTX:
    node extract-theme.js company.pptx > brand.json

  Examples:
    node md2pptx.js talk.md talk.pptx aurora
    node md2pptx.js talk.md talk.pptx --theme-file brand.json
    node md2pptx.js --list-themes
`);
  process.exit(1);
}

// Parse args — support --theme-file flag
const inputFile = args[0];
const outputFile = args[1];
let theme = null;
let themeName = "midnight";

const themeFileIdx = args.indexOf("--theme-file");
if (themeFileIdx !== -1 && args[themeFileIdx + 1]) {
  const themeFilePath = args[themeFileIdx + 1];
  theme = loadCustomTheme(themeFilePath);
  themeName = theme.name;
} else {
  const selectedTheme = args[2] || "midnight";
  if (!THEMES[selectedTheme]) {
    console.error(`  ✗ Unknown theme: ${selectedTheme}`);
    console.error(`  Run --list-themes to see available options.`);
    process.exit(1);
  }
  theme = THEMES[selectedTheme];
  themeName = selectedTheme;
}

if (!fs.existsSync(inputFile)) {
  console.error(`  ✗ File not found: ${inputFile}`);
  process.exit(1);
}

convert(inputFile, outputFile, themeName, theme).catch((err) => {
  console.error("  ✗ Error:", err.message);
  process.exit(1);
});
