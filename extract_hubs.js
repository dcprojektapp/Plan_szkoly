const fs = require('fs');

function extractHubs(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const hubs = [];

    // Szukamy elementów <ellipse ... inkscape:label="Punkt_X" ... />
    // Użyjemy regexa, który złapie label oraz cx i cy.
    // Uwaga: kolejność atrybutów może być różna, więc lepiej iterować po tagach.

    const ellipseRegex = /<ellipse[^>]*inkscape:label="([^"]+)"[^>]*>/g;
    let match;

    while ((match = ellipseRegex.exec(content)) !== null) {
        const label = match[1];
        const tagContent = match[0];

        // Jeśli label zaczyna się od "Punkt", to nas interesuje
        if (label.startsWith("Punkt")) {
            const cxMatch = tagContent.match(/cx="([^"]+)"/);
            const cyMatch = tagContent.match(/cy="([^"]+)"/);

            if (cxMatch && cyMatch) {
                hubs.push({
                    id: label.toUpperCase().replace(" ", "_"), // standaryzacja ID np. PUNKT_1
                    x: Math.round(parseFloat(cxMatch[1])),
                    y: Math.round(parseFloat(cyMatch[1])),
                    label: label
                });
            }
        }
    }

    return hubs;
}

const hubs0 = extractHubs('assets/maps/floor_0.svg');
console.log(JSON.stringify(hubs0, null, 2));
