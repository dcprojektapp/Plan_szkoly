const fs = require('fs');
const path = require('path');

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

    // Matrix handling if needed
    const matrixMatch = transformStr.match(/matrix\(([^)]+)\)/);
    if (matrixMatch) {
        const args = matrixMatch[1].replace(/,/g, ' ').trim().split(/\s+/).map(Number);
        transforms.push({ type: 'matrix', args });
    }

    return transforms;
}

function applyTransforms(x, y, w, h, transforms) {
    // Initial center
    let cx = x + w / 2;
    let cy = y + h / 2;

    for (const t of transforms) {
        if (t.type === 'rotate') {
            const angle = t.args[0];
            const rad = angle * Math.PI / 180;
            const cos = Math.cos(rad);
            const sin = Math.sin(rad);

            // Rotation around (0,0) standard
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
            // matrix(a b c d e f)
            // x' = ax + cy + e
            // y' = bx + dy + f
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

function extractEntries(filePath, floorId) {
    const content = fs.readFileSync(filePath, 'utf8');
    const entries = [];

    // Regex filtering for image tags with Wejscie label. 
    // We capture the whole tag content
    const tagRegex = /<image([^>]+)inkscape:label="Wejscie([^"]+)"([^>]*)\/>/gi;
    // Actually the label might be before or after other attributes, so let's match generic image tag first

    // Split by <image to be robust against multiline
    const chunks = content.split('<image');

    chunks.forEach(chunk => {
        // We only care about the part before the closing /> or >
        const endIdx = chunk.indexOf('/>');
        if (endIdx === -1) return; // Simplified: assumes self-closing for images which is standard

        const tagContent = chunk.substring(0, endIdx);

        if (tagContent.includes('inkscape:label="Wejscie')) {
            // Check label
            const labelMatch = tagContent.match(/inkscape:label="([^"]+)"/);
            if (!labelMatch) return;
            const label = labelMatch[1];
            if (!label.toLowerCase().startsWith('wejscie')) return;

            // Extract coords
            const xMatch = tagContent.match(/\sx="([^"]+)"/);
            const yMatch = tagContent.match(/\sy="([^"]+)"/);
            const wMatch = tagContent.match(/\swidth="([^"]+)"/);
            const hMatch = tagContent.match(/\sheight="([^"]+)"/);
            const tMatch = tagContent.match(/\stransform="([^"]+)"/);

            const x = xMatch ? parseFloat(xMatch[1]) : 0;
            const y = yMatch ? parseFloat(yMatch[1]) : 0;
            const w = wMatch ? parseFloat(wMatch[1]) : 0;
            const h = hMatch ? parseFloat(hMatch[1]) : 0;
            const transform = tMatch ? tMatch[1] : '';

            const transforms = parseTransform(transform);
            const finalPos = applyTransforms(x, y, w, h, transforms);

            entries.push({
                floor_id: floorId,
                label: label,
                room_name: label.replace(/^Wejscie_/i, ''),
                x: finalPos.x,
                y: finalPos.y
            });
        }
    });

    return entries;
}

const entries0 = extractEntries('assets/maps/floor_0.svg', 'FLOOR_0');
const entries1 = extractEntries('assets/maps/floor_1.svg', 'FLOOR_1');

console.log(JSON.stringify([...entries0, ...entries1], null, 2));
