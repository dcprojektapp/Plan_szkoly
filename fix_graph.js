const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, 'assets/data/school_data.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// Helper to remove edges for a specific node
function removeEdgesFor(nodeId) {
    data.edges = data.edges.filter(e => e.from !== nodeId && e.to !== nodeId);
}

// Helper to add edge
function addEdge(u, v, weight = 10) {
    // Check if distinct
    if (u === v) return;
    // Check duplicates
    if (data.edges.some(e => (e.from === u && e.to === v) || (e.from === v && e.to === u))) return;

    data.edges.push({
        from: u,
        to: v,
        weight: weight,
        type: 'WALK'
    });
}

// 1. Define new Corridor Hubs
const newHubs = [
    // Floor 1 Top Row
    { id: 'HALL_1_TOP_LEFT', floor_id: 'FLOOR_1', x: 283, y: 180, type: 'CORRIDOR', name: 'Korytarz Górny (Lewy)' },
    { id: 'HALL_1_TOP_MID', floor_id: 'FLOOR_1', x: 575, y: 180, type: 'CORRIDOR', name: 'Korytarz Górny (Środek)' },
    { id: 'HALL_1_TOP_RIGHT', floor_id: 'FLOOR_1', x: 780, y: 180, type: 'CORRIDOR', name: 'Korytarz Górny (Prawy)' },
    { id: 'HALL_1_VERT_CONN', floor_id: 'FLOOR_1', x: 722, y: 180, type: 'CORRIDOR', name: 'Łącznik' }, // Above STAIR_1_RIGHT

    // Floor 0 Top Row (m1-m4)
    { id: 'HALL_0_TOP_M', floor_id: 'FLOOR_0', x: 800, y: 180, type: 'CORRIDOR', name: 'Korytarz M' },

    // Floor 0 K Row
    { id: 'HALL_0_K_ROW', floor_id: 'FLOOR_0', x: 825, y: 500, type: 'CORRIDOR', name: 'Korytarz K' },
];

// Add hubs if they don't exist
newHubs.forEach(hub => {
    if (!data.nodes.find(n => n.id === hub.id)) {
        data.nodes.push(hub);
    }
});

// 2. Wiring Floor 1 Top Row
const roomsF1Top = ['14', '13', '12', 'K5', '11', '10', 'B4', 'B5', 'B6']; // B rooms are lower, handle separately

// 2a. Top Row
const topRooms = ['14', '13', '12', 'K5', '11', '10'];
topRooms.forEach(id => removeEdgesFor(id));

// Connect to nearest Hub
addEdge('14', 'HALL_1_TOP_LEFT');
addEdge('13', 'HALL_1_TOP_LEFT');
addEdge('12', 'HALL_1_TOP_MID');
addEdge('K5', 'HALL_1_TOP_MID');
addEdge('11', 'HALL_1_TOP_RIGHT');
addEdge('10', 'HALL_1_TOP_RIGHT');

// Chain Hubs
addEdge('HALL_1_TOP_LEFT', 'HALL_1_TOP_MID', 30);
addEdge('HALL_1_TOP_MID', 'HALL_1_VERT_CONN', 15);
addEdge('HALL_1_VERT_CONN', 'HALL_1_TOP_RIGHT', 6);

// Vertical Connection to Main
addEdge('HALL_1_VERT_CONN', 'HALL_1_MID', 25); // (722, 180) -> (722, 436)

// 3. Wiring Floor 0 Top (m1-m4, Deg)
const mRooms = ['m1', 'm2', 'm3', 'm4', 'DEG'];
mRooms.forEach(id => removeEdgesFor(id));

// Connect to HALL_0_TOP_M
mRooms.forEach(id => addEdge(id, 'HALL_0_TOP_M'));

// Connect HALL_0_TOP_M to HALL_TOP_CORNER (960, 190)
// Need to find HALL_TOP_CORNER ID if it changed or ensure it exists
// Assuming HALL_TOP_CORNER exists at (960, 190)
addEdge('HALL_0_TOP_M', 'HALL_TOP_CORNER', 16);

// 4. Wiring Floor 0 K Row (K3, K4, Szatnie)
const kRooms = ['K3', 'K4', 'SZATNIA_1', 'SZATNIA_2']; // 7, 8, 9 are right side
kRooms.forEach(id => removeEdgesFor(id));
kRooms.forEach(id => addEdge(id, 'HALL_0_K_ROW'));

// Connect HALL_0_K_ROW to HALL_MAIN_H_MID (596, 765)?
// K row is X~825, Y~500.
// HALL_MAIN_H_MID is Y=765.
// HALL_TOP_CORNER is Y=190.
// We need a vertical connection.
// K1, K2 are at Y=649, 628.
// K3, K4 at 392, 342.
// It effectively forms a vertical corridor.
// Let's create `HALL_0_VERT_K` at (825, 650) to bridge.
if (!data.nodes.find(n => n.id === 'HALL_0_VERT_K')) {
    data.nodes.push({ id: 'HALL_0_VERT_K', floor_id: 'FLOOR_0', x: 825, y: 650, type: 'CORRIDOR', name: 'Korytarz K (Pion)' });
}

addEdge('HALL_0_K_ROW', 'HALL_0_VERT_K', 15);
addEdge('HALL_0_VERT_K', 'HALL_MAIN_CORNER', 20); // (825, 650) -> (702, 765) is diagonal but okay-ish
// Better: HALL_0_VERT_K -> HALL_MAIN_V_MID? (960, 800).
// Or HALL_MAIN_H_MID (596, 765).
// 702, 765 is closer.

// Rewire K1, K2 to HALL_0_VERT_K
removeEdgesFor('K1');
removeEdgesFor('K2');
addEdge('K1', 'HALL_0_VERT_K');
addEdge('K2', 'HALL_0_VERT_K');

// Connect 7, 8, 9, 10... (Floor 0 Right Side)
// 7 (752, 291), 8 (952, 287), 9 (949, 320).
// 7 is near K3/K4.
removeEdgesFor('7');
addEdge('7', 'HALL_0_K_ROW');

// 8 and 9 are far right.
removeEdgesFor('8');
removeEdgesFor('9');
// HALL_TOP_CORNER is (960, 190).
// 8 is (952, 287).
// 9 is (949, 320).
// Create HALL_0_RIGHT_SIDE (950, 300).
if (!data.nodes.find(n => n.id === 'HALL_0_RIGHT_SIDE')) {
    data.nodes.push({ id: 'HALL_0_RIGHT_SIDE', floor_id: 'FLOOR_0', x: 950, y: 300, type: 'CORRIDOR', name: 'Korytarz Prawy' });
}
addEdge('8', 'HALL_0_RIGHT_SIDE');
addEdge('9', 'HALL_0_RIGHT_SIDE');
addEdge('HALL_0_RIGHT_SIDE', 'HALL_TOP_CORNER', 11);

// Write back
fs.writeFileSync(dataPath, JSON.stringify(data, null, 4), 'utf8');
console.log('Graph structure fixed.');
