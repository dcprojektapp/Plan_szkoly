const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, 'assets/data/school_data.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

function getNode(id) {
    return data.nodes.find(n => n.id === id);
}

function updateNode(id, x, y) {
    const node = getNode(id);
    if (node) {
        node.x = Math.round(x);
        node.y = Math.round(y);
        console.log(`Moved ${id} to ${node.x}, ${node.y}`);
    } else {
        // Optional: Create if missing, but better to warn
        console.warn(`Node ${id} not found for update.`);
    }
}

function getAverageCoords(ids) {
    let sumX = 0, sumY = 0, count = 0;
    ids.forEach(id => {
        const n = getNode(id);
        if (n) {
            sumX += n.x;
            sumY += n.y;
            count++;
        }
    });
    if (count === 0) return null;
    return { x: sumX / count, y: sumY / count };
}

// --- Floor 1 Alignment ---

// Top Row: 14 -> 10. Horizontal.
// Align HALL_1_TOP_LEFT near 14
const p14 = getNode('14');
if (p14) {
    updateNode('HALL_1_TOP_LEFT', p14.x, p14.y + 40); // Offset down slightly?
    // Actually, looking at previous SVG, text was above rect...
    // Let's assume the "Wejscie" point is ON the wall.
    // If we want a nice path, we push it out a bit.
    // Let's verify direction.
    // Floor 1 Top Row Y is ~785.
    // B4 (South of it) is ~888.
    // So "Down" in Y is "South".
    // 14 is North. Doors are likely South-facing or on a corridor on the South side.
    // So HALL should be Y + offset.
}

// Align HALL_1_TOP_RIGHT near 10
const p10 = getNode('10');
if (p10) updateNode('HALL_1_TOP_RIGHT', p10.x, p10.y + 40);

// Align HALL_1_TOP_MID near 12/K5
const midAvg = getAverageCoords(['12', 'K5']);
if (midAvg) updateNode('HALL_1_TOP_MID', midAvg.x, midAvg.y + 40);

// B-Wing Hub
const bHub = getAverageCoords(['B4', 'B5', 'B6']);
if (bHub) {
    // Determine B-Wing corridor axis.
    // B4(442,888), B5(428,914), B6(413,900)...
    // B4 X=442, B6 X=413. They are close horizontally?
    // Wait, B4(442, 888), B5(428, 914), B6(413, 900).
    // X is decreasing. Y is increasing.. varying.
    // Let's put a hub in the centroid.
    updateNode('HALL_1_B_HUB', bHub.x + 40, bHub.y); // Shift right?
}

// Vertical Connector (Stairs?)
const stair1Right = getNode('STAIR_1_RIGHT'); // Verify this node exists/name
// In SVG 1 extract: "Schody_pierwsze_góra" -> mapped to STAIR_1_RIGHT?
// If I didn't map it in sync_coords, it might be at 0,0 or old position.
// My sync_coords had 'Schody_pierwsze_góra': 'STAIR_1_RIGHT'
// If it updated, we are good.

// --- Floor 0 Alignment ---

// Main Hall Left (near Psycholog, Nurse)
// Psycholog (X=46), Nurse (X=168).
// Main Hall Left roughly between them but "out" in the corridor.
// They are Y~780.
// Let's assume Main Corridor is Y~850?
const hallLeftAvg = getAverageCoords(['PSYCHOLOG', 'PIELEGNIARKA']);
if (hallLeftAvg) updateNode('HALL_MAIN_H_LEFT', hallLeftAvg.x, hallLeftAvg.y + 60);

// Main Hall Mid (Classes 1, 2, 3, 4a)
// 1(340,814), 2(440,816)... Y~815.
// Corridor should be Y~860?
const hallMidAvg = getAverageCoords(['2', '3']);
if (hallMidAvg) updateNode('HALL_MAIN_H_MID', hallMidAvg.x, hallMidAvg.y + 60);

// Main Hall Corner (near 4b?)
const p4b = getNode('4b');
if (p4b) updateNode('HALL_MAIN_CORNER', p4b.x + 50, p4b.y + 50);

// Top M Row (m1...m4)
// m1(686,163)??? Wait.
// Floor 0: m1 Y is 163?
// sync_coords said: Updating m1 (FLOOR_0): 717,141 -> 686,163
// But 14 (Floor 1) is Y=785.
// Floor 0 Main is Y=815.
// So M-row is at Y=163 (Top of Floor 0?)
// This implies Floor 0 is huge? Or M inputs are far away.
// Let's trust the coordinates.
const mAvg = getAverageCoords(['m2', 'm3']);
if (mAvg) updateNode('HALL_0_TOP_M', mAvg.x, mAvg.y + 60);

// K Row (K1...K4)
// K1(734,672), K2(762,651).
// K3(794,415), K4(794,365).
// K3/K4 are much higher (Y ~400). K1/K2 are lower (Y ~660).
// Vertical corridor?
// Align HALL_0_K_ROW near K3/K4
const kTopAvg = getAverageCoords(['K3', 'K4']);
if (kTopAvg) updateNode('HALL_0_K_ROW', kTopAvg.x - 40, kTopAvg.y);

// Vertical K Connection
// Between K1/K2 and K3/K4
const kBotAvg = getAverageCoords(['K1', 'K2']);
if (kBotAvg) updateNode('HALL_0_VERT_K', kBotAvg.x - 40, kBotAvg.y);

// Final save
fs.writeFileSync(dataPath, JSON.stringify(data, null, 4), 'utf8');
console.log('Aligned corridor hubs.');
