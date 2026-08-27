const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'frontend/src');

function fixTemplateLiterals(content) {
  let inBackticks = false;
  let result = '';
  
  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    const nextChar = content[i + 1];
    const prevChar = content[i - 1];

    if (char === '`' && prevChar !== '\\') {
      inBackticks = !inBackticks;
      result += char;
    } else if (char === '₹' && nextChar === '{') {
      if (inBackticks) {
        // Inside backticks, ₹{ should be ${
        result += '$';
      } else {
        // Outside backticks, it's likely JSX, leave it as ₹
        result += '₹';
      }
    } else {
      result += char;
    }
  }

  return result;
}

function processDirectory(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      processDirectory(filePath);
    } else if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
      const content = fs.readFileSync(filePath, 'utf8');
      if (content.includes('₹{')) {
        const fixedContent = fixTemplateLiterals(content);
        if (content !== fixedContent) {
          fs.writeFileSync(filePath, fixedContent, 'utf8');
          console.log(`Fixed literals in: ${filePath}`);
        }
      }
    }
  }
}

console.log('Starting template literal fix...');
processDirectory(directoryPath);
console.log('Done.');
