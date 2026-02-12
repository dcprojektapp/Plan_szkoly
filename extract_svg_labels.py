
import xml.etree.ElementTree as ET
import re

file_path = r'e:\Aplikacje _DC_AI\Plan szkoły\assets\maps\floor_0.svg'

try:
    # Namespace map
    namespaces = {
        'svg': 'http://www.w3.org/2000/svg',
        'inkscape': 'http://www.inkscape.org/namespaces/inkscape',
        'xlink': 'http://www.w3.org/1999/xlink'
    }

    # Register namespaces
    for prefix, uri in namespaces.items():
        ET.register_namespace(prefix, uri)

    tree = ET.parse(file_path)
    root = tree.getroot()

    print(f"Successfully parsed {file_path}")

    # Find all elements with inkscape:label
    # Since ElementTree doesn't support searching by namespaced attributes easily in findall for generic parsing without registering,
    # we'll iterate.
    
    found_labels = []

    for elem in root.iter():
        label = elem.get('{http://www.inkscape.org/namespaces/inkscape}label')
        if label:
            # Get coordinates
            x = elem.get('x')
            y = elem.get('y')
            width = elem.get('width')
            height = elem.get('height')
            transform = elem.get('transform')
            
            # Simple centroid calculation if rect or image
            cx = "N/A"
            cy = "N/A"
            
            if x and y:
                try:
                    fx = float(x)
                    fy = float(y)
                    fw = float(width) if width else 0
                    fh = float(height) if height else 0
                    
                    # Basic transform handling (very limited, just for logging)
                    cx = fx + fw / 2
                    cy = fy + fh / 2
                except:
                    pass

            found_labels.append(f"Label: {label}, Tag: {elem.tag}, X: {x}, Y: {y}, CX: {cx}, CY: {cy}, Transform: {transform}")

    if not found_labels:
        print("No elements with inkscape:label found.")
    else:
        print(f"Found {len(found_labels)} labeled elements:")
        for l in found_labels:
            print(l)
            
except Exception as e:
    print(f"Error: {e}")
