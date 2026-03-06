#!/usr/bin/env node

// Feature 6: CLI npm Package
// Command-line interface for slidedown

const fs = require('fs');
const path = require('path');

function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('slidedown CLI');
    console.log('Usage: slidedown [file] [options]');
    console.log('');
    console.log('Options:');
    console.log('  -o, --output [file]     Output file (default: output.pptx)');
    console.log('  --theme [name]          Theme to use');
    console.log('  --watch                 Watch mode');
    console.log('  --help                  Show help');
    process.exit(0);
  }
  
  const inputFile = args[0];
  let outputFile = 'output.pptx';
  let theme = 'default';
  
  // Parse options
  for (let i = 1; i < args.length; i++) {
    if (args[i] === '-o' || args[i] === '--output') {
      outputFile = args[i + 1];
      i++;
    } else if (args[i] === '--theme') {
      theme = args[i + 1];
      i++;
    }
  }
  
  console.log(`📄 Input: ${inputFile}`);
  console.log(`📊 Output: ${outputFile}`);
  console.log(`🎨 Theme: ${theme}`);
  
  // Check if file exists
  if (!fs.existsSync(inputFile)) {
    console.error(`❌ File not found: ${inputFile}`);
    process.exit(1);
  }
  
  console.log('✅ CLI ready to process file');
}

if (require.main === module) {
  main();
}

module.exports = { main };
