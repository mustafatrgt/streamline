const fs = require('fs');
const path = require('path');

const imgDir = path.join(__dirname, 'img');
const files = fs.readdirSync(imgDir).filter(f => f.endsWith('.svg') && f !== 'sprite.svg');

let symbols = '';

for (const file of files) {
    const content = fs.readFileSync(path.join(imgDir, file), 'utf-8');
    const id = path.basename(file, '.svg');
    
    const viewBoxMatch = content.match(/viewBox="([^"]+)"/);
    const viewBox = viewBoxMatch ? ` viewBox="${viewBoxMatch[1]}"` : ' viewBox="0 0 24 24"';
    
    const innerMatch = content.match(/<svg[^>]*>([\s\S]*?)<\/svg>/i);
    let inner = innerMatch ? innerMatch[1] : '';
    
    // Ensure the icon inherits colors
    if (!inner.includes('fill="')) {
        inner = inner.replace(/<path\s/g, '<path fill="currentColor" ');
    }
    
    symbols += `  <symbol id="${id}"${viewBox}>\n    ${inner.trim()}\n  </symbol>\n`;
}

const spriteXml = `<svg xmlns="http://www.w3.org/2000/svg" style="display: none;">\n${symbols}</svg>`;
fs.writeFileSync(path.join(imgDir, 'sprite.svg'), spriteXml);
console.log('Sprite generated successfully at img/sprite.svg');
