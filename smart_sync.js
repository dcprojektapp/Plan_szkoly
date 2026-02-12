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

// 2. Extraction Functions (Robust)
function parseTransform(transformStr) {
    const transforms = [];
    if (!transformStr) return transforms;

    // Rotate
    const rotateMatch = transformStr.match(/rotate\(([^)]+)\)/);
    if (rotateMatch) {
        const args = rotateMatch[1].replace(/,/g, ' ').trim().split(/\s+/).map(Number);
        transforms.push({ type: 'rotate', args });
    }
    // Scale
    const scaleMatch = transformStr.match(/scale\(([^)]+)\)/);
    if (scaleMatch) {
        const args = scaleMatch[1].replace(/,/g, ' ').trim().split(/\s+/).map(Number);
        transforms.push({ type: 'scale', args });
    }
    // Matrix
    const matrixMatch = transformStr.match(/matrix\(([^)]+)\)/);
    if (matrixMatch) {
        const args = matrixMatch[1].replace(/,/g, ' ').trim().split(/\s+/).map(Number);
        transforms.push({ type: 'matrix', args });
    }
    // Translate
    const transMatch = transformStr.match(/translate\(([^)]+)\)/);
    if (transMatch) {
        const args = transMatch[1].replace(/,/g, ' ').trim().split(/\s+/).map(Number);
        transforms.push({ type: 'translate', args });
    }
    return transforms;
}

function applyTransforms(x, y, w, h, transforms) {
    let cx = x + w / 2;
    let cy = y + h / 2;

    for (const t of transforms) {
        if (t.type === 'rotate') {
            const angle = t.args[0];
            const rad = angle * Math.PI / 180;
            const cos = Math.cos(rad);
            const sin = Math.sin(rad);
            const ncx = cx * cos - cy * sin;
            const ncy = cx * sin + cy * cos;
            // Simple rotation assumption around origin. Ideally around center if implied.
            // But usually SVG transform="..." is origin-based unless CSS transform-origin.
            cx = ncx;
            cy = ncy;
        } else if (t.type === 'scale') {
            const sx = t.args[0];
            const sy = t.args.length > 1 ? t.args[1] : sx;
            cx *= sx;
            cy *= sy;
        } else if (t.type === 'translate') {
            cx += t.args[0];
            cy += t.args.length > 1 ? t.args[1] : 0;
        } else if (t.type === 'matrix') {
            if (t.args.length === 6) {
                const [a, b, c, d, e, f] = t.args;
                const ncx = a * cx + c * cy + e;
                const ncy = b * cx + d * cy + f;
                cx = ncx;
                cy = ncy;
            }
        }
    }
    return { x: cx, y: cy };
}

function getEntries(svgPath, floorId) {
    const content = fs.readFileSync(svgPath, 'utf8');
    const entries = [];

    // Chunking by tags
    let pos = 0;
    const labelKeyword = 'inkscape:label="';
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
                const tMatch = tag.match(/\stransform="([^"]+)"/);

                if (xMatch) x = parseFloat(xMatch[1]);
                if (yMatch) y = parseFloat(yMatch[1]);
                if (wMatch) w = parseFloat(wMatch[1]);
                if (hMatch) h = parseFloat(hMatch[1]);

                const transforms = tMatch ? parseTransform(tMatch[1]) : [];
                const finalPos = applyTransforms(x, y, w, h, transforms);

                entries.push({ floor_id: floorId, raw_label: label, x: finalPos.x, y: finalPos.y });
            }
        }
        pos = idx + 1;
    }
    return entries;
}

// 3. Mapping
const entries0 = getEntries(path.join(__dirname, 'assets/maps/floor_0.svg'), 'FLOOR_0');
const entries1 = getEntries(path.join(__dirname, 'assets/maps/floor_1.svg'), 'FLOOR_1');
const all = [...entries0, ...entries1];

function mapLabel(label, floorId) {
    const l = label.toLowerCase();

    // Stairs
    if (l.includes('schody_pierwsze')) return floorId === 'FLOOR_0' ? 'STAIR_0_RIGHT' : 'STAIR_1_RIGHT';
    if (l.includes('schody_drugie')) return floorId === 'FLOOR_0' ? 'STAIR_0_LEFT' : 'STAIR_1_LEFT';

    // Prefix
    if (label.startsWith('Wejscie_')) {
        let clean = label.replace('Wejscie_', '');
        if (clean.toLowerCase() === 'szatnia_główna') return 'SZATNIA_1';
        if (clean.toLowerCase() === 'szatnia_łącznik') return 'SZATNIA_2';

        const map = {
            'k1': 'K1', 'k2': 'K2', 'k3': 'K3', 'k4': 'K4', 'k5': 'K5',
            'm1': 'm1', 'm2': 'm2', 'm3': 'm3', 'm4': 'm4',
            'centrum': 'CENTRUM', 'biblioteka': 'BIBLIOTEKA', 'pedagog': 'PEDAGOG',
            'administracja': 'ADMINISTRACJA', 'kuuchnia': 'KUCHNIA', 'kuchnia': 'KUCHNIA',
            'degustacja': 'SALA_GASTRO', 'deg': 'DEG', 'sala_gastro': 'SALA_GASTRO',
            'sekretariat_1': 'SEKRETARIAT_1', 'dyrektor': 'DYREKTOR',
            'wc_1': 'WC_1', 'pokoj_naucz_top': 'POKOJ_NAUCZ_TOP',
            'gym': 'GYM', 'psycholog': 'PSYCHOLOG', 'pienegniarka': 'PIELEGNIARKA', 'pielegniarka': 'PIELEGNIARKA',
            'szatnia_1': 'SZATNIA_1', 'szatnia_2': 'SZATNIA_2',
            '1a': '1', '2a': '2', '3a': '3', '4a': '4a', '4b': '4b',
            'b4': 'B4', 'b5': 'B5', 'b6': 'B6'
        };
        if (map[clean.toLowerCase()]) return map[clean.toLowerCase()];
        return clean.toUpperCase().replace(/\s/g, '_'); // Fallback
    }
    return null;
}

let count = 0;
all.forEach(e => {
    // Try mapping as Wejscie (prioritized)
    let nodeId = mapLabel(e.raw_label, e.floor_id);
    if (!nodeId) return; // Skip non-wejscie labels unless stairs

    // Normalize fuzzy naming if mapLabel return '1' but it's '1' Node
    // Try exact match in nodes
    let n = data.nodes.find(qn => qn.id === nodeId && qn.floor_id === e.floor_id);
    if (!n) {
        // Try loose match
        n = data.nodes.find(qn => qn.id.toLowerCase() === nodeId.toLowerCase() && qn.floor_id === e.floor_id);
    }

    if (n) {
        if (Math.abs(n.x - e.x) > 1 || Math.abs(n.y - e.y) > 1) {
            console.log(`Syncing ${n.id} (${e.raw_label}): ${n.x},${n.y} -> ${Math.round(e.x)},${Math.round(e.y)}`);
            n.x = Math.round(e.x);
            n.y = Math.round(e.y);
            count++;
        }
    }
});

fs.writeFileSync(dataPath, JSON.stringify(data, null, 4), 'utf8');
console.log(`Smart synced ${count} nodes.`);
