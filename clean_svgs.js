const fs = require('fs');
const path = require('path');

function cleanSvg(inputFile, outputFile) {
    let content = fs.readFileSync(inputFile, 'utf8');

    // Remove all <image ... /> and <image ...></image> tags
    // Simple regex
    content = content.replace(/<image[^>]*\/>/gi, '');
    content = content.replace(/<image[^>]*>([\s\S]*?)<\/image>/gi, '');

    fs.writeFileSync(outputFile, content, 'utf8');
    console.log(`Cleaned ${inputFile} -> ${outputFile}`);
}

cleanSvg('assets/maps/floor_0.svg', 'assets/maps/floor_0_clean.svg');
cleanSvg('assets/maps/floor_1.svg', 'assets/maps/floor_1_clean.svg');
