import json
import os

# Konfiguracja
JSON_PATH = "school_data.json"
LOG_PATH = "debug_log.txt"

def log(msg):
    with open(LOG_PATH, "a", encoding="utf-8") as f:
        f.write(msg + "\n")
    print(msg)

def update_school_data():
    if os.path.exists(LOG_PATH): os.remove(LOG_PATH)
    log(f"Rozpoczynam aktualizację: {JSON_PATH}")
    if not os.path.exists(JSON_PATH):
        log(f"Błąd: Plik nie istnieje w {os.getcwd()}")
        return

    try:
        with open(JSON_PATH, 'r', encoding='utf-8') as f:
            data = json.load(f)
        log("Wczytano JSON.")
    except Exception as e:
        log(f"Błąd odczytu: {e}")
        return

    nodes = data.get('nodes', [])
    edges = data.get('edges', [])
    
    # 1. Usuwanie starych krawędzi dla parteru (FLOOR_0)
    #    Zakładam, że krawędzie na parterze łączą węzły z floor_id="FLOOR_0".
    #    Aby być bezpiecznym, usunę tylko te krawędzie, które łączą dwa węzły z FLOOR_0.
    #    Przy okazji zbudujemy mapę id -> floor_id dla szybkiego sprawdzania.
    node_floor_map = {n['id']: n['floor_id'] for n in nodes}
    
    new_edges = []
    for edge in edges:
        u, v = edge['from'], edge['to']
        # Jeśli oba węzły są na FLOOR_0, pomijamy tę krawędź (zostanie zastąpiona nową logiką)
        # UWAGA: Musimy zachować krawędzie między piętrami (np. schody), więc sprawdzamy oba.
        if node_floor_map.get(u) == "FLOOR_0" and node_floor_map.get(v) == "FLOOR_0":
            continue
        new_edges.append(edge)
    
    # 2. Dodawanie nowych węzłów (punkty pośrednie)
    #    Współrzędne są przybliżone (np. przesunięcie o 10-20px względem "rodzica" lub interpolacja).
    #    Dla uproszczenia, w tym skrypcie dodamy je z przykładowymi współrzędnymi,
    #    zakładając, że użytkownik poprawi je wizualnie w edytorze lub JSONie.
    #    Będę starał się "strzelać" w pobliże na podstawie nazw logicznych.
    
    new_nodes_definitions = [
        {"id": "PUNKT_1A", "floor_id": "FLOOR_0", "x": 700, "y": 164, "type": "CORRIDOR", "name": "Punkt 1a"}, # Blisko 1 (779, 164) w stronę m1/m2
        {"id": "PUNKT_1B", "floor_id": "FLOOR_0", "x": 850, "y": 164, "type": "CORRIDOR", "name": "Punkt 1b"}, # Blisko 1
        {"id": "PUNKT_4A", "floor_id": "FLOOR_0", "x": 750, "y": 325, "type": "CORRIDOR", "name": "Punkt 4a"}, # Blisko 4
        {"id": "PUNKT_4B", "floor_id": "FLOOR_0", "x": 880, "y": 325, "type": "CORRIDOR", "name": "Punkt 4b"},
        {"id": "PUNKT_4C", "floor_id": "FLOOR_0", "x": 810, "y": 380, "type": "CORRIDOR", "name": "Punkt 4c"},
        {"id": "PUNKT_4D", "floor_id": "FLOOR_0", "x": 810, "y": 420, "type": "CORRIDOR", "name": "Punkt 4d"},
        {"id": "PUNKT_6A", "floor_id": "FLOOR_0", "x": 750, "y": 600, "type": "CORRIDOR", "name": "Punkt 6a"},
        {"id": "PUNKT_11A", "floor_id": "FLOOR_0", "x": 500, "y": 840, "type": "CORRIDOR", "name": "Punkt 11a"},
        {"id": "PUNKT_11B", "floor_id": "FLOOR_0", "x": 600, "y": 800, "type": "CORRIDOR", "name": "Punkt 11b"},
        {"id": "PUNKT_12A", "floor_id": "FLOOR_0", "x": 426, "y": 900, "type": "CORRIDOR", "name": "Punkt 12a"},
        {"id": "PUNKT_12B", "floor_id": "FLOOR_0", "x": 380, "y": 838, "type": "CORRIDOR", "name": "Punkt 12b"},
        {"id": "PUNKT_12C", "floor_id": "FLOOR_0", "x": 400, "y": 920, "type": "CORRIDOR", "name": "Punkt 12c"},
        {"id": "PUNKT_12E", "floor_id": "FLOOR_0", "x": 100, "y": 830, "type": "CORRIDOR", "name": "Punkt 12e"}, # Blisko 13
    ]
    
    existing_node_ids = {n['id'] for n in nodes}
    for new_node in new_nodes_definitions:
        if new_node['id'] not in existing_node_ids:
            nodes.append(new_node)
            existing_node_ids.add(new_node['id']) # Zapobiega duplikatom przy ponownym uruchomieniu
            
    # 3. Definiowanie nowych krawędzi (ścieżek)
    #    Format: (from, to, weight) - waga domyślna np. 50 (wymaga przeliczenia odległości euklidesowej, ale tu uproszczę).
    #    Lepiej byłoby liczyć odległość, ale dla uproszczenia damy stałą lub "1", bo A* i tak użyje wag.
    #    Tutaj użyjemy funkcji pomocniczej do dodania krawędzi w obu kierunkach (chyba że graf skierowany?).
    #    Zakładam graf nieskierowany -> dodajemy jedną krawędź, a aplikacja (Flutter) obsługuje to dwukierunkowo?
    #    W oryginalnym pliku są krawędzie PUNKT_1 -> PUNKT_2 (skierowane?).
    #    Zazwyczaj w nawigacji są dwukierunkowe, ale w JSONie są "from" i "to". 
    #    Jeśli system wymaga dwukierunkowości jawnie, dodam w obie strony.
    #    Sprawdzając oryginał: PUNKT_1->PUNKT_2 jest, a PUNKT_2->PUNKT_1 nie widzę na szybko w wycinku.
    #    Przyjmę konwencję dodawania krawędzi "w jedną stronę" zgodnie z opisem użytkownika, 
    #    ale dla bezpieczeństwa nawigacji dodam też powrotne, jeśli to standard.
    #    Jednak trzymając się sciśle instrukcji "Z A możemy przejść do B", zrobię directed graph zgodnie z opisem.
    #    Jeśli nawigacja ma działać w obie strony, algorytm w Flutterze (A*) pewnie traktuje krawędzie jako nieskierowane
    #    lub wymaga par. Bez widoku kodu Dart ciężko ocenić, ale bezpieczniej jest dodać krawędzie.
    #    Zrobię na razie zgodnie z "Z X do Y", czyli skierowane.
    
    # Lista połączeń (from, to)
    connections = [
        ("PUNKT_1", "PUNKT_1A"), ("PUNKT_1", "PUNKT_1B"), ("PUNKT_1", "PUNKT_2"),
        ("PUNKT_2", "PUNKT_3"),
        ("PUNKT_3", "PUNKT_4"),
        ("PUNKT_4", "PUNKT_4A"), ("PUNKT_4", "PUNKT_4B"), ("PUNKT_4", "PUNKT_4C"),
        ("PUNKT_4C", "PUNKT_4D"),
        ("PUNKT_4D", "PUNKT_5"),
        ("PUNKT_5", "PUNKT_6"),
        ("PUNKT_6", "PUNKT_6A"),
        ("PUNKT_6A", "PUNKT_7"),
        ("PUNKT_7", "PUNKT_8"),
        ("PUNKT_8", "PUNKT_9"),
        ("PUNKT_9", "PUNKT_10"), ("PUNKT_9", "PUNKT_11"),
        ("PUNKT_11", "PUNKT_11A"), ("PUNKT_11", "PUNKT_11B"),
        ("PUNKT_11A", "PUNKT_12"),
        ("PUNKT_12", "PUNKT_12A"), ("PUNKT_12", "PUNKT_12B"),
        ("PUNKT_12A", "PUNKT_12C"),
        ("PUNKT_12B", "PUNKT_12C"),
        ("PUNKT_12B", "PUNKT_12E"), # Z Punkt_12b możemy przejść do Punkt_12e (zgodnie z korektą użytkownika)
        ("PUNKT_12E", "PUNKT_13")
    ]
    
    # Połączenia do sal (from, to)
    room_connections = [
        ("PUNKT_1A", "m1"), ("PUNKT_1A", "m2"),
        ("PUNKT_1", "m3"),
        ("PUNKT_1B", "m4"), ("PUNKT_1B", "DEG"), ("PUNKT_1B", "KUCHNIA"), # Zakładam KUCHNIA jako Wejście_kuchnia
        ("PUNKT_4A", "7"),
        ("PUNKT_4B", "8"), ("PUNKT_4B", "9"),
        ("PUNKT_4C", "K4"),
        ("PUNKT_4D", "K3"), ("PUNKT_4D", "SZATNIA_1"), # SZATNIA_1 lub SZATNIA_2
        ("PUNKT_7", "K1"), ("PUNKT_7", "K2"),
        ("PUNKT_8", "6"),
        ("PUNKT_10", "5"), ("PUNKT_10", "CENTRUM"), ("PUNKT_10", "BIBLIOTEKA"), ("PUNKT_10", "PEDAGOG"),
        ("PUNKT_11", "4b"), ("PUNKT_11", "4a"),
        ("PUNKT_11B", "STAIR_A_DOWN"), # Schody pierwsze dół
        ("PUNKT_11A", "3"),
        ("PUNKT_12", "2"),
        ("PUNKT_12B", "1"),
        ("PUNKT_12A", "B1"),
        ("PUNKT_12C", "B2"), ("PUNKT_12C", "B3"),
        ("PUNKT_12E", "GYM"), # Sala gimnastyczna 1
        ("PUNKT_13", "GYM_2"), # Sala gimnastyczna 2
        ("PUNKT_13", "PSYCHOLOG"),
        ("PUNKT_13", "STAIR_B_DOWN"), # Schody drugie dół
    ]
    
    all_connections = connections + room_connections
    
    # Dodajemy krawędzie
    for u, v in all_connections:
        # Sprawdzenie czy węzły istnieją w 'nodes' (lub starych lub nowych)
        # Ignorujemy błędy "missing node" w tym prostym skrypcie, 
        # ale w produkcji warto by rzucić warning.
        
        # Obliczenie wagi (dystans)
        node_u = next((n for n in nodes if n["id"] == u), None)
        node_v = next((n for n in nodes if n["id"] == v), None)
        
        weight = 100 # Default
        if node_u and node_v:
             weight = int(((node_u["x"] - node_v["x"])**2 + (node_u["y"] - node_v["y"])**2)**0.5)
        
        new_edges.append({
            "from": u,
            "to": v,
            "weight": weight,
            "type": "WALK"
        })
        
        # Opcjonalnie: dodaj krawędź powrotną v->u ?
        # Jeśli nawigacja ma działać w obie strony (np. wyjście z sali), to tak.
        # Użytkownik napisał "Z Punktu X możemy wejść do Y".
        # Ale zazwyczaj wychodzi się tą samą drogą.
        # ZOSTAWIMY dwukierunkowość, bo to standard w pathfindingu.
        new_edges.append({
            "from": v,
            "to": u,
            "weight": weight,
            "type": "WALK"
        })

    data['nodes'] = nodes
    data['edges'] = new_edges
    
    output_path = "school_data_updated.json"
    log(f"Zapisywanie do {output_path} ({len(nodes)} węzłów, {len(new_edges)} krawędzi)...")
    try:
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=4, ensure_ascii=False)
        log(f"Zapisano {output_path} pomyślnie.")
    except Exception as e:
        log(f"Błąd zapisu: {e}")

if __name__ == "__main__":
    update_school_data()
