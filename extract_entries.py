import xml.etree.ElementTree as ET
import math
import json
import re

def parse_svg_transform(transform_str):
    """Simple parser for rotate and scale transforms."""
    transforms = []
    if not transform_str:
        return transforms
    
    # Matches rotate(angle, [cx, cy]) or scale(sx, [sy]) or matrix(...)
    # We only handle rotate(-90) and scale(-1) as observed
    
    # Check for rotate
    rotate_match = re.search(r'rotate\(([^)]+)\)', transform_str)
    if rotate_match:
        args = [float(x) for x in rotate_match.group(1).replace(',', ' ').split()]
        transforms.append(('rotate', args))
        
    # Check for scale
    scale_match = re.search(r'scale\(([^)]+)\)', transform_str)
    if scale_match:
        args = [float(x) for x in scale_match.group(1).replace(',', ' ').split()]
        transforms.append(('scale', args))
        
    # Check for translate
    translate_match = re.search(r'translate\(([^)]+)\)', transform_str)
    if translate_match:
        args = [float(x) for x in translate_match.group(1).replace(',', ' ').split()]
        transforms.append(('translate', args))

    # Check for matrix
    matrix_match = re.search(r'matrix\(([^)]+)\)', transform_str)
    if matrix_match:
        args = [float(x) for x in matrix_match.group(1).replace(',', ' ').split()]
        transforms.append(('matrix', args))
        
    return transforms

def apply_transforms(x, y, w, h, transforms):
    # Calculate initial center
    cx = x + w / 2
    cy = y + h / 2
    
    for t_type, args in transforms:
        if t_type == 'rotate':
            angle = args[0]
            # Assumes rotation around (0,0) if no cx, cy provided
            # Standard SVG rotation
            rad = math.radians(angle)
            cos_a = math.cos(rad)
            sin_a = math.sin(rad)
            
            ncx = cx * cos_a - cy * sin_a
            ncy = cx * sin_a + cy * cos_a
            cx, cy = ncx, ncy
            
        elif t_type == 'scale':
            sx = args[0]
            sy = args[1] if len(args) > 1 else sx
            cx = cx * sx
            cy = cy * sy
            
        elif t_type == 'translate':
            tx = args[0]
            ty = args[1] if len(args) > 1 else 0
            cx = cx + tx
            cy = cy + ty
            
        elif t_type == 'matrix':
            # matrix(a b c d e f)
            # x' = ax + cy + e
            # y' = bx + dy + f
            if len(args) == 6:
                a, b, c, d, e, f = args
                ncx = a * cx + c * cy + e
                ncy = b * cx + d * cy + f
                cx, cy = ncx, ncy

    return cx, cy

def extract_entries(svg_path, floor_id):
    tree = ET.parse(svg_path)
    root = tree.getroot()
    
    # Namespaces
    ns = {
        'svg': 'http://www.w3.org/2000/svg',
        'inkscape': 'http://www.inkscape.org/namespaces/inkscape',
        'xlink': 'http://www.w3.org/1999/xlink'
    }
    
    entries = []
    
    # Find all elements with inkscape:label starting with "Wejscie"
    # We iterate all elements because they might be nested
    for elem in root.iter():
        label = elem.get('{http://www.inkscape.org/namespaces/inkscape}label')
        if label and label.lower().startswith('wejscie'):
            # It's an entry point
            x = float(elem.get('x', 0))
            y = float(elem.get('y', 0))
            width = float(elem.get('width', 0))
            height = float(elem.get('height', 0))
            transform = elem.get('transform')
            
            transforms = parse_svg_transform(transform)
            
            # Calculate visual center
            final_x, final_y = apply_transforms(x, y, width, height, transforms)
            
            entries.append({
                'floor_id': floor_id,
                'label': label,
                'room_name': label.replace('Wejscie_', '').replace('wejscie_', ''),
                'x': final_x,
                'y': final_y
            })
            
    return entries

floor_0_entries = extract_entries(r'assets\maps\floor_0.svg', 'FLOOR_0')
floor_1_entries = extract_entries(r'assets\maps\floor_1.svg', 'FLOOR_1')

all_entries = floor_0_entries + floor_1_entries

print(json.dumps(all_entries, indent=4))
