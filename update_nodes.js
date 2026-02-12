const fs = require('fs');
const path = require('path');

const entries = [
    { "label": "Wejscie_K2", "id": "K2", "x": 792.93, "y": 628.29 },
    { "label": "Wejscie_SZATNIA_ŁĄCZNIK", "id": "SZATNIA_2", "x": 847.76, "y": 393.86 },
    { "label": "Wejscie_6", "id": "6", "x": 851.55, "y": 730.65 },
    { "label": "Wejscie_SZATNIA_GŁÓWNA", "id": "SZATNIA_1", "x": 847.52, "y": 478.03 },
    { "label": "Wejscie_PSYCHOLOG", "id": "PSYCHOLOG", "x": 77.51, "y": 756.61 },
    { "label": "Wejscie_B3", "id": "B3", "x": 441.78, "y": 943.96 },
    { "label": "Wejscie_PIELĘGNIARKA", "id": "PIELEGNIARKA", "x": 168.14, "y": 794.12 },
    { "label": "Wejscie_SALA_GIMNASTYCZNA_2", "id": "GYM_2", "x": 87.66, "y": 823.02 },
    { "label": "Wejscie_SALA_GIMNASTYCZNA_1", "id": "GYM", "x": 324.35, "y": 821.22 },
    { "label": "Wejscie_1", "id": "1", "x": 371.59, "y": 791.68 },
    { "label": "Wejscie_2", "id": "2", "x": 471.88, "y": 793.87 },
    { "label": "Wejscie_3", "id": "3", "x": 564.94, "y": 793.29 },
    { "label": "Wejscie_4A", "id": "4a", "x": 611.97, "y": 792.51 },
    { "label": "Wejscie_4B", "id": "4b", "x": 663.90, "y": 793.12 },
    { "label": "Wejscie_K1", "id": "K1", "x": 765.43, "y": 649.45 },
    { "label": "Wejscie_K3", "id": "K3", "x": 825.28, "y": 392.74 },
    { "label": "Wejscie_K4", "id": "K4", "x": 825.64, "y": 342.88 },
    { "label": "Wejscie_M1", "id": "m1", "x": 717.31, "y": 140.53 },
    { "label": "Wejscie_M2", "id": "m2", "x": 674.32, "y": 131.20 },
    { "label": "Wejscie_M4", "id": "m4", "x": 874.03, "y": 130.12 },
    { "label": "Wejscie_CENTRUM", "id": "CENTRUM", "x": 875.51, "y": 878.92 },
    { "label": "Wejscie_BIBLIOTEKA", "id": "BIBLIOTEKA", "x": 877.51, "y": 954.02 },
    { "label": "Wejscie_9", "id": "9", "x": 949.55, "y": 320.20 },
    { "label": "Wejscie_B1", "id": "B1", "x": 469.61, "y": 871.61 },
    { "label": "Wejscie_B2", "id": "B2", "x": 471.30, "y": 922.82 },
    { "label": "Wejscie_5", "id": "5", "x": 905.02, "y": 869.51 },
    { "label": "Wejscie_PEDAGOG", "id": "PEDAGOG", "x": 933.61, "y": 961.61 },
    { "label": "Wejscie_DEGUSTACYJNA", "id": "DEG", "x": 926.05, "y": 138.57 },
    { "label": "Wejscie_8", "id": "8", "x": 952.84, "y": 287.11 },
    { "label": "Wejscie_7", "id": "7", "x": 752.42, "y": 291.50 },
    { "label": "Wejscie_M3", "id": "m3", "x": 793.38, "y": 130.73 },
    { "label": "Wejscie_13", "id": "13", "x": 409.09, "y": 120.52 },
    { "label": "Wejscie_12", "id": "12", "x": 518.29, "y": 121.52 },
    { "label": "Wejscie_K5", "id": "K5", "x": 633.17, "y": 121.52 },
    { "label": "Wejscie_11", "id": "11", "x": 746.61, "y": 123.07 },
    { "label": "Wejscie_10", "id": "10", "x": 812.20, "y": 143.62 },
    { "label": "Wejscie_B4", "id": "B4", "x": 518.98, "y": 242.07 },
    { "label": "Wejscie_B5", "id": "B5", "x": 502.43, "y": 272.83 },
    { "label": "Wejscie_B6", "id": "B6", "x": 485.33, "y": 255.84 },
    { "label": "Wejscie_14", "id": "14", "x": 283.84, "y": 120.07 }
];

const dataPath = path.join(__dirname, 'assets/data/school_data.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

entries.forEach(entry => {
    const node = data.nodes.find(n => n.id === entry.id);
    if (node) {
        console.log(`Updating ${node.id} from (${node.x}, ${node.y}) to (${entry.x}, ${entry.y})`);
        node.x = Math.round(entry.x);
        node.y = Math.round(entry.y);
    } else {
        // If node doesn't exist, we might want to create it?
        // For now, just warn.
        // GYM_2 is likely new.
        if (entry.id === 'GYM_2') {
            console.log(`Creating new node GYM_2`);
            data.nodes.push({
                id: 'GYM_2',
                floor_id: 'FLOOR_0',
                x: Math.round(entry.x),
                y: Math.round(entry.y),
                type: 'ROOM',
                name: 'Sala gimnastyczna (Wejście 2)',
                qr_code: 'QR_GYM_2'
            });
        } else {
            console.warn(`Node not found for ${entry.label} (ID: ${entry.id})`);
        }
    }
});

// Write structure back
fs.writeFileSync(dataPath, JSON.stringify(data, null, 4), 'utf8');
console.log('Use formatted JSON output.');
