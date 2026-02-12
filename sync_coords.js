const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, 'assets/data/school_data.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// Helper to parse transforms and get absolute coordinates from SVG content
function getCoordinates(svgContent, floorId) {
    const entries = [];

    // We are looking for "Wejscie_X" labels primarily
    // But also "Sala_nr_X" as fallback if needed, though Wejscie is better for navigation nodes.

    // Regex for image/rect/path with inkscape:label
    // This is a simplified parser. For complex SVGs, a real XML parser would be better but regex has worked so far.

    // Split content by tags to process one by one
    let pos = 0;
    const labelKeyword = 'inkscape:label="';

    while (true) {
        const idx = svgContent.indexOf(labelKeyword, pos);
        if (idx === -1) break;

        let tagStart = svgContent.lastIndexOf('<', idx);
        // Avoid '</'
        if (svgContent[tagStart + 1] === '/') {
            tagStart = svgContent.lastIndexOf('<', tagStart - 1);
        }
        const tagEnd = svgContent.indexOf('>', idx);

        if (tagStart > -1 && tagEnd > -1) {
            const tag = svgContent.substring(tagStart, tagEnd + 1);

            // Extract label
            const labelMatch = tag.match(/inkscape:label="([^"]+)"/);
            const label = labelMatch ? labelMatch[1] : '';

            // We are interested in 'Wejscie_...' labels
            if (label.startsWith('Wejscie_') || label.startsWith('Sala_nr_') || label.startsWith('Schody_')) {
                // Extract coordinates
                // Check if it's rect, image, or use transform matrix

                let x = 0, y = 0, w = 0, h = 0;

                const xMatch = tag.match(/\sx="([^"]+)"/);
                const yMatch = tag.match(/\sy="([^"]+)"/);
                const wMatch = tag.match(/\swidth="([^"]+)"/);
                const hMatch = tag.match(/\sheight="([^"]+)"/);

                if (xMatch) x = parseFloat(xMatch[1]);
                if (yMatch) y = parseFloat(yMatch[1]);
                if (wMatch) w = parseFloat(wMatch[1]);
                if (hMatch) h = parseFloat(hMatch[1]);

                // Get transforms
                let transforms = [];
                const tMatch = tag.match(/\stransform="([^"]+)"/);
                if (tMatch) {
                    transforms = parseTransform(tMatch[1]);
                }

                // Apply transforms
                const center = applyTransforms(x, y, w, h, transforms);

                entries.push({
                    floor_id: floorId,
                    raw_label: label,
                    x: center.x,
                    y: center.y
                });
            }
        }
        pos = idx + 1;
    }
    return entries;
}

function parseTransform(transformStr) {
    const transforms = [];
    if (!transformStr) return transforms;

    const rotateMatch = transformStr.match(/rotate\(([^)]+)\)/);
    if (rotateMatch) {
        const args = rotateMatch[1].replace(/,/g, ' ').trim().split(/\s+/).map(Number);
        transforms.push({ type: 'rotate', args });
    }
    const scaleMatch = transformStr.match(/scale\(([^)]+)\)/);
    if (scaleMatch) {
        const args = scaleMatch[1].replace(/,/g, ' ').trim().split(/\s+/).map(Number);
        transforms.push({ type: 'scale', args });
    }
    const matrixMatch = transformStr.match(/matrix\(([^)]+)\)/);
    if (matrixMatch) {
        const args = matrixMatch[1].replace(/,/g, ' ').trim().split(/\s+/).map(Number);
        transforms.push({ type: 'matrix', args });
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

            // Rotation is usually around 0,0 in SVG if origin not specified, 
            // but for simple 'rotate(90)' inkscape might imply element center or global.
            // Assuming simplified Inkscape standard behavior (usually global unless group)
            // But let's assume standard matrix math

            const ncx = cx * cos - cy * sin;
            const ncy = cx * sin + cy * cos;
            cx = ncx;
            cy = ncy;
        } else if (t.type === 'scale') {
            const sx = t.args[0];
            const sy = t.args.length > 1 ? t.args[1] : sx;
            cx *= sx;
            cy *= sy;
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

// Map Label to Node ID
// This mapping strategy needs to be smart
function mapLabelToId(label) {
    let clean = label.replace('Wejscie_', '').replace('Sala_nr_', '');

    // Manual overrides mapping known inconsistencies
    const mapping = {
        'k1': 'K1', 'k2': 'K2', 'k3': 'K3', 'k4': 'K4', 'k5': 'K5',
        'm1': 'm1', 'm2': 'm2', 'm3': 'm3', 'm4': 'm4',
        '1a': '1', '2a': '2', '3a': '3', '4a': '4a', '4b': '4b', '5': '5', '6': '6', '7': '7', '8': '8', '9': '9',
        '10': '10', '11': '11', '12': '12', '13': '13', '14': '14',
        'b1': 'B1', 'b2': 'B2', 'b3': 'B3', 'b4': 'B4', 'b5': 'B5', 'b6': 'B6',
        'centrum': 'CENTRUM',
        'biblioteka': 'BIBLIOTEKA',
        'pedagog': 'PEDAGOG',
        'administracja': 'ADMINISTRACJA',
        'sekretariat_k': 'SEKRETARIAT_K',
        'wc_k': 'WC_K',
        'kuchnia': 'KUCHNIA',
        'degustacja': 'SALA_GASTRO',
        'sekretariat_1': 'SEKRETARIAT_1',
        'dyrektor': 'DYREKTOR',
        'wc_1': 'WC_1',
        'pokoj_naucz_top': 'POKOJ_NAUCZ_TOP',
        'gym': 'GYM',
        'psycholog': 'PSYCHOLOG',
        'pielegniarka': 'PIELEGNIARKA',
        'szatnia_główna': 'SZATNIA_1', // Map "Szatnia Główna" to 1
        'szatnia_łącznik': 'SZATNIA_2',
        'Schody_pierwsze_góra': 'STAIR_1_RIGHT', // Check these
        'Schody_drugie_góra': 'STAIR_1_LEFT',
    };

    // Normalize clean label
    const lower = clean.toLowerCase();

    // Try explicit map
    if (mapping[lower]) return mapping[lower];

    // Try direct ID match (if 14, B4 etc)
    return clean;
}

// Process
const svg0 = fs.readFileSync(path.join(__dirname, 'assets/maps/floor_0.svg'), 'utf8');
const svg1 = fs.readFileSync(path.join(__dirname, 'assets/maps/floor_1.svg'), 'utf8');

const entries0 = getCoordinates(svg0, 'FLOOR_0');
const entries1 = getCoordinates(svg1, 'FLOOR_1');

const allEntries = [...entries0, ...entries1];

let updatedCount = 0;

allEntries.forEach(entry => {
    // Only process Entry points as they are the navigation targets
    // Assuming Wejscie_ labels are the most accurate for "door" location
    if (entry.raw_label.startsWith('Wejscie_')) {
        const nodeId = mapLabelToId(entry.raw_label);

        const node = data.nodes.find(n => n.id === nodeId && n.floor_id === entry.floor_id);

        if (node) {
            // Check shift
            const dx = Math.abs(node.x - entry.x);
            const dy = Math.abs(node.y - entry.y);

            if (dx > 1 || dy > 1) { // Threshold
                console.log(`Updating ${nodeId} (${node.floor_id}): ${node.x},${node.y} -> ${Math.round(entry.x)},${Math.round(entry.y)}`);
                node.x = Math.round(entry.x);
                node.y = Math.round(entry.y);
                updatedCount++;
            }
        } else {
            console.log(`Node not found for label: ${entry.raw_label} -> ID: ${nodeId} on ${entry.floor_id}`);
        }
    }
});

fs.writeFileSync(dataPath, JSON.stringify(data, null, 4), 'utf8');
console.log(`Synced ${updatedCount} nodes.`);
