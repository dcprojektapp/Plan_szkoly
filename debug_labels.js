const fs = require('fs');

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

function debugEntries(filePath, floorId) {
    const content = fs.readFileSync(filePath, 'utf8');
    const entries = [];

    // Iterate over substring matches for 'inkscape:label="'
    const labelKeyword = 'inkscape:label="';
    let pos = 0;
    while (true) {
        const idx = content.indexOf(labelKeyword, pos);
        if (idx === -1) break;

        // Find the start of the tag (backwards <)
        let tagStart = content.lastIndexOf('<', idx);
        // Ensure it's not a closing tag </
        if (content[tagStart + 1] === '/') {
            tagStart = content.lastIndexOf('<', tagStart - 1);
        }

        // Find end of tag
        const tagEnd = content.indexOf('>', idx);

        if (tagStart > -1 && tagEnd > -1) {
            const tagContent = content.substring(tagStart, tagEnd);

            // Extract label
            const labelMatch = tagContent.match(/inkscape:label="([^"]+)"/);
            const label = labelMatch ? labelMatch[1] : '???';

            // Extract coords
            const xMatch = tagContent.match(/\sx="([^"]+)"/);
            const yMatch = tagContent.match(/\sy="([^"]+)"/);
            const wMatch = tagContent.match(/\swidth="([^"]+)"/);
            const hMatch = tagContent.match(/\sheight="([^"]+)"/);
            const tMatch = tagContent.match(/\stransform="([^"]+)"/);

            // Only process if it has coordinates (rect/image/text with x/y)
            if (xMatch && yMatch && wMatch && hMatch) {
                const x = parseFloat(xMatch[1]);
                const y = parseFloat(yMatch[1]);
                const w = parseFloat(wMatch[1]);
                const h = parseFloat(hMatch[1]);
                const transform = tMatch ? tMatch[1] : '';

                const finalPos = applyTransforms(x, y, w, h, parseTransform(transform));

                entries.push({ label, x: finalPos.x, y: finalPos.y, type: tagContent.split(' ')[0] });
            }
        }

        pos = idx + 1;
    }
    return entries;
}

const allLabels = debugEntries('assets/maps/floor_1.svg', 'FLOOR_1');
console.log(JSON.stringify(allLabels, null, 2));
