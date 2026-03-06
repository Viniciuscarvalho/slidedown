# Contributing to SlideDown

Thanks for your interest in contributing! Here's how to get started.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/slidedown.git`
3. Install dependencies: `npm install -g pptxgenjs`
4. Make your changes
5. Test with the demo: `node scripts/md2pptx.js examples/demo.md test.pptx midnight`
6. Submit a Pull Request

## What to Contribute

### New Themes

Add a new theme to the `THEMES` object in `scripts/md2pptx.js`. Each theme needs:

- `bg` — Background color (6-char hex, no `#`)
- `bgAlt` — Secondary background for cards/shapes
- `text` — Primary text color
- `heading` — Heading text color
- `accent` — Primary accent color
- `accent2` — Secondary accent color
- `muted` — Muted/secondary text color
- `tableBg` / `tableAlt` — Table background colors
- `codeBg` — Code block background
- `headingFont` / `bodyFont` — Font pair

Also add the theme to `references/themes.md` and update the README.

### Layout Improvements

Improve how content is rendered on slides. Check the `build*Slide` functions in `md2pptx.js`.

### Markdown Syntax Extensions

Add support for new Markdown features. Some ideas:

- `<!-- layout: split -->` for two-column layouts
- Mermaid diagram rendering
- LaTeX/KaTeX math formulas
- Numbered lists

### Bug Fixes

If you find a visual glitch, broken layout, or edge case — please open an issue or fix it directly.

## Code Style

- Use clear variable names
- Comment non-obvious logic
- Test all 6 themes before submitting
- Follow PptxGenJS best practices (see SKILL.md)

## Reporting Issues

Include:
- The Markdown content that caused the issue
- The theme used
- A screenshot if visual

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
