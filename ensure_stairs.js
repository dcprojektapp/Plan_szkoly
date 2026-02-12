const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, 'assets/data/school_data.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// Define Stairs
const stairs = [
    { id: 'STAIR_0_LEFT', floor_id: 'FLOOR_0', x: 25, y: 717, type: 'STAIRS', name: 'Schody (Lewe)' },
    { id: 'STAIR_0_RIGHT', floor_id: 'FLOOR_0', x: 586, y: 853, type: 'STAIRS', name: 'Schody (Prawe)' },
    // STAIR_1_LEFT/RIGHT should already exist but let's ensure coordinates
];

let changed = false;
stairs.forEach(s => {
    let node = data.nodes.find(n => n.id === s.id);
    if (!node) {
        console.log(`Adding ${s.id}`);
        data.nodes.push(s);
        changed = true;
    } else {
        // Enforce coordinates from our "Ground Truth" if they are 0,0 or wildly off?
        // Let's just trust smart_sync done earlier for existing nodes.
        // But STAIR_0_RIGHT was "missing" so smart_sync output implied it mapped STAIR_1_RIGHT.

        // Wait, if I want to be 100% sure they are correct:
        if (s.x > 0) {
            node.x = s.x;
            node.y = s.y;
            console.log(`Forced coord for ${s.id}`);
            changed = true;
        }
    }
});

if (changed) {
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 4), 'utf8');
    console.log('Saved data with stairs.');
} else {
    console.log('No changes needed.');
}
