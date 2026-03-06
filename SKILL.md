---
name: slidedown
description: "Convert Markdown files into beautiful, professionally-designed PowerPoint presentations (.pptx) that open natively in Keynote, PowerPoint, and Google Slides. Use this skill whenever the user wants to turn a .md file into slides, create a presentation from markdown content, generate a deck from text/notes, or mentions 'slidedown', 'md to slides', 'markdown to presentation', 'markdown to pptx', or 'markdown to keynote'. Also trigger when the user has a .md file and wants it as a slide deck, or asks to 'make slides from' any text content. This skill handles the full pipeline: parsing markdown, selecting themes, applying professional layouts, and exporting a polished .pptx file."
---

# SlideDown Skill

Convert Markdown → Beautiful PPTX (Keynote/PowerPoint compatible)

## Quick Start

```bash
# 1. Install dependencies (first time only)
npm install -g pptxgenjs react-icons react react-dom sharp

# 2. Run the converter
node /path/to/skill/scripts/md2pptx.js input.md output.pptx [theme]
```

Available themes: `midnight`, `aurora`, `sunset`, `minimal`, `forest`, `brutalist`

Default theme: `midnight`

---

## Markdown Syntax for Slides

The converter uses these conventions to parse markdown into slides:

| Markdown | Slide Behavior |
|----------|---------------|
| `# Title` | Title/hero slide (centered, large) |
| `---` | New slide separator |
| `## Heading` | Slide heading |
| `> Quote text` | Highlighted quote block with accent border |
| `- List item` | Styled bullet point |
| `**bold**` | Bold emphasis |
| `*italic*` | Italic text |
| `` `code` `` | Inline code styling |
| ```` ```lang ... ``` ```` | Code block with dark background |
| `![alt](url)` | Image (downloaded and embedded) |
| `<!-- notes: text -->` | Speaker notes (not visible on slide) |
| Tables (`\| ... \|`) | Auto-styled data table |

### Example Markdown

```markdown
# My Presentation
## A subtitle here

---

## The Problem

> Most presentations are forgettable.

- Death by bullet points
- Ugly default themes  
- Hours wasted on formatting

---

## The Solution

**SlideDown** converts your markdown into 
beautiful presentations — instantly.

<!-- notes: Emphasize the speed advantage here -->

---

## Metrics

| Quarter | Revenue | Growth |
|---------|---------|--------|
| Q1 | $2M | 15% |
| Q2 | $3M | 50% |
| Q3 | $4.5M | 50% |
```

---

## Workflow

### Step 1: Prepare the Markdown

If the user provides a `.md` file, use it directly. If they provide raw text or content in the chat, save it as a `.md` file first.

Ensure the markdown follows the syntax conventions above. If the content doesn't have `---` separators, intelligently split it into slides based on `##` headings.

### Step 2: Choose a Theme

If the user hasn't specified a theme, ask them or pick one that matches the content:

- **midnight** — Dark navy with indigo accents. Professional, modern. Good for tech talks, product launches.
- **aurora** — Dark with purple-to-teal gradient. Creative, bold. Good for design talks, conferences.  
- **sunset** — Warm orange-amber tones. Energetic, friendly. Good for startups, pitches.
- **minimal** — Light background, clean typography. Classic, readable. Good for academic, corporate.
- **forest** — Deep green tones. Calm, trustworthy. Good for sustainability, health, finance.
- **brutalist** — Yellow background, bold black text. Striking, memorable. Good for manifestos, bold statements.

See [references/themes.md](references/themes.md) for full color/typography details.

### Step 3: Generate the Presentation

```bash
node scripts/md2pptx.js input.md output.pptx midnight
```

### Step 4: QA

Convert to images and verify:

```bash
python scripts/office/soffice.py --headless --convert-to pdf output.pptx
pdftoppm -jpeg -r 150 output.pdf slide
```

Visually inspect each slide for:
- Text overflow or cutoff
- Proper theme application
- Readable contrast
- Correct content from the markdown

### Step 5: Deliver

Copy the final `.pptx` to `/mnt/user-data/outputs/` and present to the user.

The `.pptx` format opens natively in:
- **Apple Keynote** (Mac/iPad/iPhone)
- **Microsoft PowerPoint** (Windows/Mac/Web)
- **Google Slides** (import)
- **LibreOffice Impress** (Linux)

---

## Design Principles

Each theme follows these principles for professional-quality output:

1. **No boring slides** — Every slide has visual elements (shapes, accent colors, icons), never just text on white.
2. **Typography hierarchy** — Title slides use 36-44pt, headings 28-32pt, body 16-18pt, with contrasting font weights.
3. **Color discipline** — 60/30/10 rule: dominant background, secondary for content areas, accent for highlights.
4. **Layout variety** — Title slides are centered, content slides left-aligned, quotes have accent borders, tables have styled headers.
5. **Breathing room** — Minimum 0.5" margins, generous spacing between elements.
6. **Consistent motif** — Each theme has a signature visual element (accent shapes, borders, overlays) repeated across slides.

---

## Dependencies

- `pptxgenjs` — PPTX generation
- `react-icons`, `react`, `react-dom`, `sharp` — Icon rendering (optional, for icon-enhanced slides)
- LibreOffice (`soffice`) — PDF conversion for QA
- Poppler (`pdftoppm`) — PDF to images for QA
