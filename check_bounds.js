const fs = require('fs');

function parseMinMax(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');

    let minX = Infinity, minY = Infinity;
    let maxX = -Infinity, maxY = -Infinity;

    // Simple regex for x, y, width, height attributes in basic shapes
    // This is approximate but helps identify if things are huge or negative

    const xMatches = [...content.matchAll(/\sx="([-\d\.]+)"/g)].map(m => parseFloat(m[1]));
    const yMatches = [...content.matchAll(/\sy="([-\d\.]+)"/g)].map(m => parseFloat(m[1]));

    if (xMatches.length) {
        minX = Math.min(...xMatches);
        maxX = Math.max(...xMatches);
    }
    if (yMatches.length) {
        minY = Math.min(...yMatches);
        maxY = Math.max(...yMatches);
    }

    // Check paths for M x,y or L x,y
    // Regex for d="M 123,456 ..."
    const pathMatches = [...content.matchAll(/\sd="([^"]+)"/g)];
    pathMatches.forEach(m => {
        const d = m[1];
        const nums = d.match(/[-]?\d*\.?\d+/g);
        if (nums) {
            for (let i = 0; i < nums.length - 1; i += 2) {
                const x = parseFloat(nums[i]);
                const y = parseFloat(nums[i + 1]);
                if (!isNaN(x)) {
                    if (x < minX) minX = x;
                    if (x > maxX) maxX = x;
                }
                if (!isNaN(y)) {
                    if (y < minY) minY = y;
                    if (y > maxY) maxY = y;
                }
            }
        }
    });

    return { minX, minY, maxX, maxY };
}

console.log("Floor 0:", parseMinMax('assets/maps/floor_0.svg'));
console.log("Floor 1:", parseMinMax('assets/maps/floor_1.svg'));
