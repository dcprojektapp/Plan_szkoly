const fs = require('fs');
const content = fs.readFileSync('assets/maps/dół.svg', 'utf8');

const regex = /inkscape:label="([^"]+)"/g;
let match;
let labels = new Set();
while ((match = regex.exec(content)) !== null) {
  labels.add(match[1]);
}
console.log('Labels:', Array.from(labels));

// Let's also find all text and rectangles that might represent rooms.
const rectRegex = /<rect[^>]+id="([^"]+)"[^>]*x="([^"]+)"[^>]*y="([^"]+)"[^>]*>/g;
console.log('--- Coordinates of rects ---');
let c=0;
while ((match = rectRegex.exec(content)) !== null) {
    if(c<10) console.log(match[1], match[2], match[3]);
    c++;
}

console.log('Total rects:', c);

const textRegex = /<tspan[^>]+x="([^"]+)"[^>]*y="([^"]+)"[^>]*>(.*?)<\/tspan>/g;
let texts = [];
while ((match = textRegex.exec(content)) !== null) {
    texts.push({text: match[3].replace(/<[^>]+>/g, '').trim(), x: parseFloat(match[1]), y: parseFloat(match[2])});
}
console.log('Texts:', texts);
