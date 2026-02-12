const fs = require('fs');
const path = require('path');

const JSON_PATH = path.join(__dirname, 'school_data.json');
const OUTPUT_PATH = path.join(__dirname, 'school_data.json'); // Overwrite directly

// GLOBAL OFFSET CONFIGURATION
const OFFSET_X = 0;
const OFFSET_Y = 0;

const NEW_NODES_RAW = [
    // --- GÓRNY KORYTARZ (Y=160) ---
    { id: "PUNKT_1A", x: 640, y: 160 },   // M2 (643) - OK
    { id: "PUNKT_M1", x: 686, y: 160 },   // [NEW] M1 (686)
    { id: "PUNKT_1", x: 765, y: 160 },    // M3 (762) - OK
    { id: "PUNKT_M4", x: 843, y: 160 },   // [MOVED] M4 (843)
    { id: "PUNKT_1B", x: 900, y: 160 },   // Kuchnia/Deg

    // --- PIONOWY ŁĄCZNIK ---
    { id: "PUNKT_2", x: 779, y: 219 },
    { id: "PUNKT_3", x: 805, y: 219 },
    { id: "PUNKT_4", x: 805, y: 325 },
    { id: "PUNKT_4A", x: 720, y: 325 },
    { id: "PUNKT_4B", x: 890, y: 325 },
    { id: "PUNKT_4C", x: 805, y: 367 },
    { id: "PUNKT_4D", x: 805, y: 415 },
    { id: "PUNKT_5", x: 805, y: 451 },
    { id: "PUNKT_6", x: 805, y: 544 },
    { id: "PUNKT_6A", x: 750, y: 544 },
    { id: "PUNKT_7", x: 750, y: 649 },
    { id: "PUNKT_8", x: 750, y: 753 },
    { id: "PUNKT_9", x: 750, y: 828 }, // Skrzyżowanie T
    { id: "PUNKT_10", x: 845, y: 845 },

    // --- DOLNY KORYTARZ (Y=828) ---
    // Kolejność od prawej (PUNKT_9) do lewej
    { id: "PUNKT_11", x: 632, y: 828 },    // [MOVED] Sala 4b (632)
    { id: "PUNKT_11B", x: 580, y: 828 },   // Sala 4a (581) / Schody A
    { id: "PUNKT_SAL3", x: 534, y: 828 },  // [NEW] Sala 3 (534)
    { id: "PUNKT_11A", x: 506, y: 828 },   // Punkt pomocniczy

    { id: "PUNKT_12", x: 440, y: 828 },      // Sala 2 (440) + Rozgałęzienie B
    { id: "PUNKT_SAL1", x: 340, y: 828 },    // [NEW] Sala 1 (340)
    { id: "PUNKT_12B", x: 319, y: 828 },     // Sala Gimnastyczna (Prawe)
    { id: "PUNKT_12E", x: 170, y: 828 },     // Długi odcinek
    { id: "PUNKT_13", x: 27, y: 828 },       // Sala Gimnastyczna (Lewe) / Schody / Psycholog

    // --- SEKCJA B (Y rośnie w dół, X=440) ---
    { id: "PUNKT_12A", x: 440, y: 880 },
    { id: "PUNKT_12C", x: 440, y: 940 },
];

// Apply offset
const NEW_NODES = NEW_NODES_RAW.map(n => ({
    ...n,
    x: n.x + OFFSET_X,
    y: n.y + OFFSET_Y
}));

const EDGES = [
    // Górny korytarz: 1A <-> M1 <-> 1 <-> M4 <-> 1B
    { from: "PUNKT_1A", to: "PUNKT_M1" },
    { from: "PUNKT_M1", to: "PUNKT_1" },
    { from: "PUNKT_1", to: "PUNKT_M4" },
    { from: "PUNKT_M4", to: "PUNKT_1B" },

    // Łącznik do głównego pionu
    { from: "PUNKT_1", to: "PUNKT_2" },

    // Pion
    { from: "PUNKT_2", to: "PUNKT_3" },
    { from: "PUNKT_3", to: "PUNKT_4" },
    { from: "PUNKT_4", to: "PUNKT_4A" },
    { from: "PUNKT_4", to: "PUNKT_4B" },
    { from: "PUNKT_4", to: "PUNKT_4C" },
    { from: "PUNKT_4C", to: "PUNKT_4D" },
    { from: "PUNKT_4D", to: "PUNKT_5" },
    { from: "PUNKT_5", to: "PUNKT_6" },
    { from: "PUNKT_6", to: "PUNKT_6A" },
    { from: "PUNKT_6A", to: "PUNKT_7" },
    { from: "PUNKT_7", to: "PUNKT_8" },
    { from: "PUNKT_8", to: "PUNKT_9" },
    { from: "PUNKT_9", to: "PUNKT_10" },

    // Dolny korytarz: 9 -> 11 -> 11B -> SAL3 -> 11A -> 12 -> SAL1 -> 12B -> 12E -> 13
    { from: "PUNKT_9", to: "PUNKT_11" },
    { from: "PUNKT_11", to: "PUNKT_11B" },
    { from: "PUNKT_11B", to: "PUNKT_SAL3" },
    { from: "PUNKT_SAL3", to: "PUNKT_11A" },
    { from: "PUNKT_11A", to: "PUNKT_12" },
    { from: "PUNKT_12", to: "PUNKT_SAL1" },
    { from: "PUNKT_SAL1", to: "PUNKT_12B" },
    { from: "PUNKT_12B", to: "PUNKT_12E" },
    { from: "PUNKT_12E", to: "PUNKT_13" },

    // Sekcja B
    { from: "PUNKT_12", to: "PUNKT_12A" },
    { from: "PUNKT_12A", to: "PUNKT_12C" },

    // Skrzyżowanie T na dole (Punkt 11 w pionie?)
    // Note: W oryginalnym grafie PUNKT_9 łączył się z 11. Teraz mamy łańcuch.
];

const ROOM_CONNECTIONS = [
    { room: "M1", node: "PUNKT_M1" }, // [NEW] Prostopadłe
    { room: "M2", node: "PUNKT_1A" }, // Blisko
    { room: "M3", node: "PUNKT_1" },  // Blisko
    { room: "M4", node: "PUNKT_M4" }, // [NEW] Prostopadłe

    { room: "Kuchnia", node: "PUNKT_1B" },
    { room: "Deg.", node: "PUNKT_1B" },
    { room: "7", node: "PUNKT_4A" },
    { room: "8", node: "PUNKT_4B" },
    { room: "9", node: "PUNKT_4B" },
    { room: "K4", node: "PUNKT_4C" },
    { room: "K3", node: "PUNKT_4D" },
    { room: "Szatnia", node: "PUNKT_4D" },
    { room: "K1", node: "PUNKT_7" },
    { room: "K2", node: "PUNKT_7" },
    { room: "6", node: "PUNKT_8" },
    { room: "5", node: "PUNKT_10" },
    { room: "Centrum", node: "PUNKT_10" },
    { room: "Biblioteka", node: "PUNKT_10" },
    { room: "Pedagog", node: "PUNKT_10" },

    { room: "4b", node: "PUNKT_11" },   // [NEW] Przesunięty węzeł
    { room: "4a", node: "PUNKT_11B" },
    { room: "Schody_pierwsz_dół", node: "PUNKT_11B" },
    { room: "3", node: "PUNKT_SAL3" },  // [NEW] Prostopadłe
    { room: "2", node: "PUNKT_12" },    // Idealnie (440)
    { room: "1", node: "PUNKT_SAL1" },  // [NEW] Prostopadłe

    { room: "B1", node: "PUNKT_12A" },
    { room: "B2", node: "PUNKT_12C" },
    { room: "B3", node: "PUNKT_12C" },

    { room: "Sala gimnastyczna", node: "PUNKT_12E" }, // Prawe wejście (W2 - przy Pielęgniarce)
    { room: "Sala gimnastyczna", node: "PUNKT_13" },
    { room: "Psycholog", node: "PUNKT_13" },
    { room: "Schody_drugie_dół", node: "PUNKT_13" }
];

function updateGraph() {
    try {
        const data = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'));

        // 1. Update/Add Nodes
        NEW_NODES.forEach(newNode => {
            const existingNodeIndex = data.nodes.findIndex(n => n.id === newNode.id);
            const nodeEntry = {
                id: newNode.id,
                floor_id: "FLOOR_0",
                x: newNode.x,
                y: newNode.y,
                type: "PATH_POINT",
                name: newNode.id.replace("PUNKT_", "Punkt ")
            };

            if (existingNodeIndex !== -1) {
                data.nodes[existingNodeIndex] = nodeEntry;
            } else {
                data.nodes.push(nodeEntry);
            }
        });

        // 2. Remove old edges for FLOOR_0 to rebuild them
        data.edges = data.edges.filter(e => {
            const n1 = data.nodes.find(n => n.id === e.from);
            const n2 = data.nodes.find(n => n.id === e.to);
            if ((n1 && n1.floor_id === 'FLOOR_0') || (n2 && n2.floor_id === 'FLOOR_0')) {
                return false;
            }
            return true;
        });

        // 3. Add new edges
        EDGES.forEach(edge => {
            const n1 = data.nodes.find(n => n.id === edge.from);
            const n2 = data.nodes.find(n => n.id === edge.to);
            if (n1 && n2) {
                const dist = Math.sqrt(Math.pow(n1.x - n2.x, 2) + Math.pow(n1.y - n2.y, 2));
                data.edges.push({
                    from: edge.from,
                    to: edge.to,
                    weight: Math.round(dist),
                    type: "WALK"
                });
            } else {
                console.warn(`Missing node for edge: ${edge.from} -> ${edge.to}`);
            }
        });

        // 4. Update Room Connections (Edges from Room to Node)
        ROOM_CONNECTIONS.forEach(conn => {
            let roomNode = data.nodes.find(n => n.name === conn.room || n.id === conn.room || (n.label && n.label.includes(conn.room)));

            if (!roomNode) {
                roomNode = data.nodes.find(n => n.name && n.name.toLowerCase().includes(conn.room.toLowerCase()) && n.floor_id === 'FLOOR_0');
            }

            if (roomNode) {
                const pathNode = data.nodes.find(n => n.id === conn.node);
                if (pathNode) {
                    const dist = Math.sqrt(Math.pow(roomNode.x - pathNode.x, 2) + Math.pow(roomNode.y - pathNode.y, 2));
                    data.edges.push({
                        from: roomNode.id,
                        to: pathNode.id,
                        weight: Math.round(dist),
                        type: "WALK"
                    });
                }
            } else {
                // Ignore missing rooms for now to keep it clean
            }
        });

        fs.writeFileSync(OUTPUT_PATH, JSON.stringify(data, null, 4));
        console.log(`Graph updated successfully with OFFSET X:${OFFSET_X} Y:${OFFSET_Y}`);

    } catch (e) {
        console.error("Error:", e);
    }
}

updateGraph();
