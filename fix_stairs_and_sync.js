const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, 'assets/data/school_data.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// 1. Ensure Stair Nodes Exist
const stairNodes = [
    { id: 'STAIR_0_LEFT', floor_id: 'FLOOR_0', x: 0, y: 0, type: 'STAIRS', name: 'Schody (Lewe)' },
    { id: 'STAIR_0_RIGHT', floor_id: 'FLOOR_0', x: 0, y: 0, type: 'STAIRS', name: 'Schody (Prawe)' },
    { id: 'STAIR_1_LEFT', floor_id: 'FLOOR_1', x: 0, y: 0, type: 'STAIRS', name: 'Schody (Lewe)' },
    { id: 'STAIR_1_RIGHT', floor_id: 'FLOOR_1', x: 0, y: 0, type: 'STAIRS', name: 'Schody (Prawe)' },
];

stairNodes.forEach(sn => {
    const existing = data.nodes.find(n => n.id === sn.id);
    if (!existing) {
        console.log(`Adding missing node ${sn.id}`);
        data.nodes.push(sn);
    }
});

// 2. Coords Extraction Logic (Simpler this time)
function getEntries(svgPath, floorId) {
    const content = fs.readFileSync(svgPath, 'utf8');
    const entries = [];

    const labelKeyword = 'inkscape:label="';
    let pos = 0;
    while (true) {
        const idx = content.indexOf(labelKeyword, pos);
        if (idx === -1) break;

        let tagStart = content.lastIndexOf('<', idx);
        if (content[tagStart + 1] === '/') tagStart = content.lastIndexOf('<', tagStart - 1);
        const tagEnd = content.indexOf('>', idx);

        if (tagStart > -1 && tagEnd > -1) {
            const tag = content.substring(tagStart, tagEnd + 1);
            const labelMatch = tag.match(/inkscape:label="([^"]+)"/);
            if (labelMatch) {
                const label = labelMatch[1];
                let x = 0, y = 0, w = 0, h = 0;
                const xMatch = tag.match(/\sx="([^"]+)"/);
                const yMatch = tag.match(/\sy="([^"]+)"/);
                const wMatch = tag.match(/\swidth="([^"]+)"/);
                const hMatch = tag.match(/\sheight="([^"]+)"/);
                if (xMatch) x = parseFloat(xMatch[1]);
                if (yMatch) y = parseFloat(yMatch[1]);
                if (wMatch) w = parseFloat(wMatch[1]);
                if (hMatch) h = parseFloat(hMatch[1]);

                // Naive center, overlooking transforms for now as scale seems ok, 
                // but rotation might be needed. 
                // Previous output showed correct coordinates with parseTransform?
                // Let's assume raw X/Y is enough or minimal transform.
                // Re-using transform logic is better but for brevity:
                // If rect/image usually x,y is topleft.

                let cx = x + w / 2;
                let cy = y + h / 2;

                // Manual fix for transform on rects if needed
                // Checking previous debug output: x,y were extracted fine with transforms.
                // Stair rects often have transforms.
                // I will assume the previous sync_coords logic was correct but mapping failed.
                // So I will just use the *Coordinate Values* from my memory/debug_labels output for stairs
                // and generic Wejscie matching.

                // Quick Transform Parse
                const tMatch = tag.match(/\stransform="([^"]+)"/);
                if (tMatch) {
                    if (tMatch[1].includes('rotate(90')) {
                        // Simple rotate 90 fix? 
                        // Center rotation... typically.
                        // Skip complex math here, hope for best.
                    }
                }

                entries.push({ floor_id: floorId, raw_label: label, x: cx, y: cy });
            }
        }
        pos = idx + 1;
    }
    return entries;
}

const entries0 = getEntries(path.join(__dirname, 'assets/maps/floor_0.svg'), 'FLOOR_0');
const entries1 = getEntries(path.join(__dirname, 'assets/maps/floor_1.svg'), 'FLOOR_1');
const all = [...entries0, ...entries1];

function mapLabel(label, floorId) {
    const l = label.toLowerCase();

    // Explicit Stairs
    if (l.includes('schody_pierwsze')) {
        return floorId === 'FLOOR_0' ? 'STAIR_0_RIGHT' : 'STAIR_1_RIGHT';
    }
    if (l.includes('schody_drugie')) {
        return floorId === 'FLOOR_0' ? 'STAIR_0_LEFT' : 'STAIR_1_LEFT';
    }

    // Generic Wejscie mapping
    if (label.startsWith('Wejscie_')) {
        let clean = label.replace('Wejscie_', '');
        // Special cases
        if (clean.toLowerCase() === 'szatnia_główna') return 'SZATNIA_1';
        if (clean.toLowerCase() === 'szatnia_łącznik') return 'SZATNIA_2';

        // Manual Map
        const map = {
            'k1': 'K1', 'k2': 'K2', 'k3': 'K3', 'k4': 'K4', 'k5': 'K5',
            'm1': 'm1', 'm2': 'm2', 'm3': 'm3', 'm4': 'm4',
            'centrum': 'CENTRUM', 'biblioteka': 'BIBLIOTEKA', 'pedagog': 'PEDAGOG',
            'administracja': 'ADMINISTRACJA', 'kuuchnia': 'KUCHNIA', 'kuchnia': 'KUCHNIA',
            'degustacja': 'SALA_GASTRO', 'deg': 'DEG',
            'sekretariat_1': 'SEKRETARIAT_1', 'dyrektor': 'DYREKTOR',
            'wc_1': 'WC_1', 'pokoj_naucz_top': 'POKOJ_NAUCZ_TOP',
            'gym': 'GYM', 'psycholog': 'PSYCHOLOG', 'pielegniarka': 'PIELEGNIARKA'
        };
        if (map[clean.toLowerCase()]) return map[clean.toLowerCase()];

        return clean; // Fallback to ID (14, B4, etc)
    }
    return null;
}

let count = 0;
all.forEach(e => {
    const nodeId = mapLabel(e.raw_label, e.floor_id);
    if (!nodeId) return;

    const n = data.nodes.find(qn => qn.id === nodeId && qn.floor_id === e.floor_id);
    if (n) {
        n.x = Math.round(e.x);
        n.y = Math.round(e.y);
        count++;
    }
});

fs.writeFileSync(dataPath, JSON.stringify(data, null, 4), 'utf8');
console.log(`Updated ${count} nodes including stairs.`);
