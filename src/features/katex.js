// Feature 2: LaTeX/KaTeX Formulas
// Detecta fórmulas $latex$ (inline) e $$latex$$ (bloco)

function processKaTeXFormulas(markdown) {
  let processed = markdown;
  let formulaCount = 0;
  
  // Detectar fórmulas em bloco ($$...$$)
  const blockFormulaPattern = /\$\$\n?([\s\S]*?)\n?\$\$/g;
  processed = processed.replace(blockFormulaPattern, (match, content) => {
    formulaCount++;
    return `[FORMULA_BLOCK_${formulaCount}:${content.trim()}]`;
  });
  
  // Detectar fórmulas inline ($...$)
  const inlineFormulaPattern = /\$([^\$\n]+)\$/g;
  processed = processed.replace(inlineFormulaPattern, (match, content) => {
    formulaCount++;
    return `[FORMULA_INLINE_${formulaCount}:${content}]`;
  });
  
  return { processed, formulaCount };
}

module.exports = { processKaTeXFormulas };
