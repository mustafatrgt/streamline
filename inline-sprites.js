const fs = require('fs');
const path = require('path');

const projectDir = '/Users/mustafaturgut/Downloads/streamline';
const htmlFile = path.join(projectDir, 'streamline.html');
const spriteFile = path.join(projectDir, 'img', 'sprite.svg');

let html = fs.readFileSync(htmlFile, 'utf-8');
const spriteContent = fs.readFileSync(spriteFile, 'utf-8');

// 1. Inject the SVG sprite right after the opening <body> tag if not already there
if (!html.includes('id="svg-sprite-container"')) {
    const spriteWrapper = `\n    <!-- Embed SVG Sprite inline to avoid CORS issues on local file:// -->\n    <div id="svg-sprite-container" style="display: none;">\n        ${spriteContent}\n    </div>\n`;
    html = html.replace(/<body[^>]*>/i, (match) => match + spriteWrapper);
} else {
    // If it's already there, replace the existing one
    const replaceRegex = /<div id="svg-sprite-container"[^>]*>[\s\S]*?<\/div>/i;
    const spriteWrapper = `<div id="svg-sprite-container" style="display: none;">\n        ${spriteContent}\n    </div>`;
    html = html.replace(replaceRegex, spriteWrapper);
}

// 2. Update the references
// Find `<use href="img/sprite.svg#icon"></use>` and change to `<use href="#icon"></use>`
const oldUseRegex = /<use\s+href="img\/sprite\.svg#([^"]+)"\s*><\/use>/g;
let replaceCount = 0;
html = html.replace(oldUseRegex, (match, iconName) => {
    replaceCount++;
    return `<use href="#${iconName}"></use>`;
});

fs.writeFileSync(htmlFile, html);
console.log(`Sprite injected inline. Replaced ${replaceCount} references.`);
