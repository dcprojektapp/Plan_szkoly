const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, 'assets/data/school_data.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// Helper to remove edges for a specific node
function removeEdgesFor(nodeId) {
    data.edges = data.edges.filter(e => e.from !== nodeId && e.to !== nodeId);
}

function removeEdgeBetween(u, v) {
    data.edges = data.edges.filter(e =>
        !((e.from === u && e.to === v) || (e.from === v && e.to === u))
    );
}

function addEdge(u, v, weight = null) {
    if (u === v) return;
    // Check duplicates
    if (data.edges.some(e => (e.from === u && e.to === v) || (e.from === v && e.to === u))) return;

    // Calculate weight if not provided (Euclidean distance)
    if (weight === null) {
        const n1 = data.nodes.find(n => n.id === u);
        const n2 = data.nodes.find(n => n.id === v);
        if (n1 && n2) {
            const dx = n1.x - n2.x;
            const dy = n1.y - n2.y;
            weight = Math.round(Math.sqrt(dx * dx + dy * dy));
        } else {
            weight = 10;
        }
    }

    data.edges.push({
        from: u,
        to: v,
        weight: weight,
        type: 'WALK'
    });
}

// 1. Define New Nodes for Better Corridor Definition (Floor 1)
const newHubs = [
    // B-Wing Hubs (North B-Wing)
    { id: 'HALL_1_TOP_B_ENTRY', floor_id: 'FLOOR_1', x: 515, y: 180, type: 'CORRIDOR', name: 'Korytarz Górny (Wejście B)' },
    { id: 'HALL_1_B_HUB', floor_id: 'FLOOR_1', x: 515, y: 250, type: 'CORRIDOR', name: 'Korytarz B (Hub)' },

    // South/Gym Hubs (Main Corridor)
    // HALL_1_LEFT is 86, HALL_1_MID is 722. Y=436.
    { id: 'HALL_1_SILOWNIA_ENTRY', floor_id: 'FLOOR_1', x: 540, y: 436, type: 'CORRIDOR', name: 'Korytarz Główny (Siłownia)' },
    { id: 'HALL_1_B4_BIG_ENTRY', floor_id: 'FLOOR_1', x: 658, y: 436, type: 'CORRIDOR', name: 'Korytarz Główny (B4 Duża)' }
];

newHubs.forEach(hub => {
    if (!data.nodes.find(n => n.id === hub.id)) {
        console.log(`Adding node ${hub.id}`);
        data.nodes.push(hub);
    }
});

// 2. Rewire Top Corridor
// Remove old direct edge HALL_1_TOP_LEFT <-> HALL_1_TOP_MID
removeEdgeBetween('HALL_1_TOP_LEFT', 'HALL_1_TOP_MID');

// Chain: LEFT -> B_ENTRY -> MID
addEdge('HALL_1_TOP_LEFT', 'HALL_1_TOP_B_ENTRY');
addEdge('HALL_1_TOP_B_ENTRY', 'HALL_1_TOP_MID');

// 3. Wire B-Wing (B4, B5, B6)
// Remove old connections (likely direct diagonal to HALL_1_MID)
['B4', 'B5', 'B6'].forEach(id => removeEdgesFor(id));

// Connect Top Hub to B Hub
addEdge('HALL_1_TOP_B_ENTRY', 'HALL_1_B_HUB');

// Connect Rooms to B Hub
addEdge('HALL_1_B_HUB', 'B4');
addEdge('HALL_1_B_HUB', 'B5');
addEdge('HALL_1_B_HUB', 'B6');

// 4. Rewire Main Corridor (Left <-> Mid)
// Remove old long edge
removeEdgeBetween('HALL_1_LEFT', 'HALL_1_MID');

// Chain: LEFT -> SILOWNIA_ENTRY -> B4_BIG_ENTRY -> MID
addEdge('HALL_1_LEFT', 'HALL_1_SILOWNIA_ENTRY');
addEdge('HALL_1_SILOWNIA_ENTRY', 'HALL_1_B4_BIG_ENTRY');
addEdge('HALL_1_B4_BIG_ENTRY', 'HALL_1_MID');

// 5. Wire Gym Stairs and Big B4
removeEdgesFor('STAIR_1_SILOWNIA');
removeEdgesFor('B4_WC'); // "Sala B4 (duża)"

addEdge('HALL_1_SILOWNIA_ENTRY', 'STAIR_1_SILOWNIA');
addEdge('HALL_1_B4_BIG_ENTRY', 'B4_WC');

// Write back
fs.writeFileSync(dataPath, JSON.stringify(data, null, 4), 'utf8');
console.log('Improved corridor definitions.');
