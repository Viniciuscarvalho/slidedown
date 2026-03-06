// Feature 5: Chart Generation from Table Data
// Detecta <!-- chart: TYPE --> antes de tabelas e marca para renderização

function processCharts(markdown) {
  const chartPattern = /<!--\s*chart:\s*(bar|line|pie|scatter|area)\s*-->\n((?:\|.*\n)+)/gi;
  
  let processed = markdown;
  let chartCount = 0;
  const charts = [];
  
  processed = processed.replace(chartPattern, (match, type, tableData) => {
    chartCount++;
    charts.push({
      id: chartCount,
      type,
      table: tableData.trim()
    });
    return `[CHART_${type.toUpperCase()}_${chartCount}:${tableData.trim()}]`;
  });
  
  return {
    processed,
    charts,
    chartCount
  };
}

module.exports = { processCharts };
