// Feature 3: Two-Column Split Layout
// Detecta <!-- layout: split --> e marca slide para layout de 2 colunas

function processSplitLayout(markdown) {
  const splitPattern = /<!--\s*layout:\s*split\s*-->/i;
  
  const isSplitLayout = splitPattern.test(markdown);
  
  if (isSplitLayout) {
    // Remover o comentário e marcar slide
    const processed = markdown.replace(splitPattern, '[SPLIT_LAYOUT_START]');
    return {
      isSplit: true,
      processed,
      layout: 'split'
    };
  }
  
  return {
    isSplit: false,
    processed: markdown,
    layout: 'single'
  };
}

module.exports = { processSplitLayout };
