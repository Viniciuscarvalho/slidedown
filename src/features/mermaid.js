// Feature 1: Mermaid Diagram Support
// Detecta blocos ```mermaid e converte para imagem SVG

function processMermaidDiagrams(markdown) {
  // Detectar blocos mermaid
  const mermaidPattern = /```mermaid\n([\s\S]*?)\n```/g;
  
  // Substituir blocos com placeholder
  let processed = markdown;
  let mermaidCount = 0;
  
  processed = processed.replace(mermaidPattern, (match, content) => {
    mermaidCount++;
    // Placeholder para renderização posterior
    return `[MERMAID_${mermaidCount}:${content.trim()}]`;
  });
  
  return { processed, mermaidCount };
}

module.exports = { processMermaidDiagrams };
