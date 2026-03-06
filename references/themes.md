# SlideDown Themes Reference

## Theme Definitions

Each theme defines: background colors, text colors, accent colors, font pairing, and visual motifs.

### Midnight
- **Vibe**: Professional, modern, premium
- **Background**: `1E2761` (navy) 
- **Text**: `E8ECF1` (ice white)
- **Heading**: `CADCFC` (light blue)
- **Accent**: `818CF8` (indigo)
- **Accent Secondary**: `6366F1` (violet)
- **Card/Shape BG**: `283572` (lighter navy)
- **Fonts**: Georgia (headings) + Calibri (body)
- **Motif**: Subtle rounded rectangle accents in corners, indigo left-border on quote blocks

### Aurora
- **Vibe**: Creative, bold, conference-worthy
- **Background**: `0F0B2E` (deep purple-black)
- **Text**: `E0E7FF` (lavender white)
- **Heading**: `C4B5FD` (light violet)
- **Accent**: `A78BFA` (purple)
- **Accent Secondary**: `06B6D4` (teal/cyan)
- **Card/Shape BG**: `1E1B4B` (dark indigo)
- **Fonts**: Arial Black (headings) + Calibri (body)
- **Motif**: Dual-color accent shapes (purple + teal), gradient-like feel via overlapping transparent shapes

### Sunset
- **Vibe**: Energetic, warm, startup-friendly
- **Background**: `7C2D12` (burnt orange-brown)
- **Text**: `FFFBEB` (warm white)
- **Heading**: `FEF3C7` (cream)
- **Accent**: `F59E0B` (amber/gold)
- **Accent Secondary**: `EF4444` (red-orange)
- **Card/Shape BG**: `9A3412` (rust)
- **Fonts**: Trebuchet MS (headings) + Calibri (body)
- **Motif**: Warm accent bars, amber highlights on key data, bold stat callouts

### Minimal
- **Vibe**: Clean, academic, corporate
- **Background**: `FAFAFA` (off-white)
- **Text**: `1A1A1A` (near-black)
- **Heading**: `111827` (dark gray)
- **Accent**: `2563EB` (blue)
- **Accent Secondary**: `3B82F6` (light blue)
- **Card/Shape BG**: `F3F4F6` (light gray)
- **Fonts**: Cambria (headings) + Calibri Light (body)
- **Motif**: Blue left-border accents, clean separation with subtle gray dividers, generous whitespace

### Forest
- **Vibe**: Calm, trustworthy, grounded
- **Background**: `052E16` (deep forest green)
- **Text**: `ECFDF5` (mint white)
- **Heading**: `BBF7D0` (light green)
- **Accent**: `4ADE80` (emerald)
- **Accent Secondary**: `16A34A` (mid-green)
- **Card/Shape BG**: `14532D` (dark green)
- **Fonts**: Palatino (headings) + Garamond (body)
- **Motif**: Organic rounded shapes, green accent dots, earth-tone feel

### Brutalist
- **Vibe**: Bold, striking, memorable
- **Background**: `FEF08A` (bright yellow)
- **Text**: `000000` (black)
- **Heading**: `000000` (black)
- **Accent**: `DC2626` (red)
- **Accent Secondary**: `1E293B` (dark slate)
- **Card/Shape BG**: `FFFFFF` (white)
- **Fonts**: Impact (headings) + Arial (body)
- **Motif**: Heavy borders, stark contrast, oversized typography, no gradients or subtlety

---

## Layout Types

The converter automatically detects content type and applies the appropriate layout:

### Title Slide (detected by `# Heading`)
- Content centered vertically and horizontally
- Title at 40-44pt, bold
- Subtitle at 20-24pt, accent color
- Decorative accent shape in corner
- Slide number hidden

### Content Slide (detected by `## Heading` + text/bullets)
- Heading top-left, 28-32pt
- Body content below, left-aligned
- Bullets with accent-colored dots
- 0.5" margins all around

### Quote Slide (detected by `> quote`)
- Large accent-colored left border (4px+)
- Quote text in italic, 22-24pt
- Attribution below if present
- Centered vertically

### Table Slide (detected by `| ... |` syntax)
- Heading at top
- Styled table with accent-colored header row
- Alternating row backgrounds
- Clean borders

### Code Slide (detected by ``` blocks)
- Dark background card for code
- Monospace font (Consolas/Courier)
- Subtle border
- Language label if specified

### Image Slide (detected by `![](url)`)
- Image sized to fit with proper aspect ratio
- Caption below if alt text provided
- Centered on slide

---

## Typography Scale

| Element | Size | Weight | Notes |
|---------|------|--------|-------|
| Title slide heading | 40-44pt | Bold | Centered |
| Title slide subtitle | 20-24pt | Regular | Accent color |
| Content heading | 28-32pt | Bold | Left-aligned |
| Body text | 16-18pt | Regular | Left-aligned |
| Bullet text | 16-18pt | Regular | With accent dot |
| Quote text | 22-24pt | Italic | With left border |
| Table header | 14pt | Bold | Accent bg + white text |
| Table cell | 13pt | Regular | Alternating bg |
| Code text | 13pt | Monospace | Dark bg card |
| Slide number | 10pt | Regular | Bottom-right, muted |
| Speaker notes | 12pt | Regular | Not visible on slide |
