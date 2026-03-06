#!/bin/bash
# SlideDown — GitHub Setup Script
#
# Run this after creating the repo on GitHub:
#   1. Go to https://github.com/new
#   2. Create repo named "slidedown" (don't add README)
#   3. Run this script
#
# Usage: ./setup.sh YOUR_GITHUB_USERNAME

USERNAME=${1:-"YOUR_USERNAME"}
REPO_NAME="slidedown"

echo ""
echo "  ◆ SlideDown — GitHub Setup"
echo ""

# Initialize git
git init
git add .
git commit -m "feat: initial release — Markdown to Beautiful PPTX

- 6 professional themes (midnight, aurora, sunset, minimal, forest, brutalist)
- Smart layout detection (title, content, quote, table, code, image)
- Inline formatting (bold, italic, code)
- Speaker notes support
- Claude Skill compatible
- Keynote, PowerPoint, Google Slides compatible"

# Set main branch
git branch -M main

# Add remote and push
git remote add origin "https://github.com/${USERNAME}/${REPO_NAME}.git"
git push -u origin main

echo ""
echo "  ✓ Pushed to https://github.com/${USERNAME}/${REPO_NAME}"
echo ""
echo "  Next steps:"
echo "    1. Add repo description on GitHub"
echo "    2. Add topics: markdown, presentation, slides, pptx, keynote, claude-skill"
echo "    3. Create a Release with the slidedown.skill file"
echo ""
