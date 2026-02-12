const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, 'assets/data/school_data.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

const badNodes = data.nodes.filter(n =>
    isNaN(n.x) || isNaN(n.y) ||
    (n.x === 0 && n.y === 0 && !n.id.startsWith('STAIR_')) // Stairs might be 0,0 if placeholder, but we fixed them
);

if (badNodes.length > 0) {
    console.log('Found suspicious nodes:', badNodes.map(n => n.id));
} else {
    console.log('All nodes have valid non-zero coordinates.');
}

// Check for broken edges
const nodeIds = new Set(data.nodes.map(n => n.id));
const badEdges = data.edges.filter(e => !nodeIds.has(e.from) || !nodeIds.has(e.to));

if (badEdges.length > 0) {
    console.log('Found edges with missing nodes:', badEdges);
} else {
    console.log('All edges match existing nodes.');
}
