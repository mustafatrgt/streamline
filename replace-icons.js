const fs = require('fs');
const path = require('path');

const projectDir = '/Users/mustafaturgut/Downloads/streamline';
const imgDir = path.join(projectDir, 'img');
const htmlFile = path.join(projectDir, 'streamline.html');

let html = fs.readFileSync(htmlFile, 'utf-8');
const svgFiles = fs.readdirSync(imgDir).filter(f => f.endsWith('.svg')).map(f => f.replace('.svg', ''));

const regex = /<span\s+class="material-symbols-outlined\s*([^"]*)">\s*([^<]+)\s*<\/span>/g;

let replacedCount = 0;
html = html.replace(regex, (match, classes, iconName) => {
    const icon = iconName.trim();
    if (svgFiles.includes(icon)) {
        replacedCount++;
        const cls = classes.trim() ? classes.trim() + ' ' : '';
        return `<svg class="${cls}w-[1em] h-[1em] inline-block fill-current"><use href="img/sprite.svg#${icon}"></use></svg>`;
    }
    return match;
});

fs.writeFileSync(htmlFile, html);
console.log('Replaced ' + replacedCount + ' icons successfully.');
