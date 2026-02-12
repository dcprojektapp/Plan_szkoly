
import json
import os

file_path = r"e:\Aplikacje _DC_AI\Plan szkoły\assets\data\school_data.json"

new_edges = [
        {
            "from": "HALL_MAIN_H_LEFT",
            "to": "HALL_MAIN_H_MID",
            "weight": 467,
            "type": "WALK"
        },
        {
            "from": "HALL_MAIN_H_MID",
            "to": "HALL_MAIN_CORNER",
            "weight": 106,
            "type": "WALK"
        },
        {
            "from": "HALL_MAIN_H_LEFT",
            "to": "STAIR_0_LEFT",
            "weight": 0,
            "type": "WALK"
        },
        {
            "from": "HALL_MAIN_H_MID",
            "to": "STAIR_0_RIGHT",
            "weight": 0,
            "type": "WALK"
        },
        {
            "from": "HALL_1_LEFT",
            "to": "HALL_1_MID",
            "weight": 636,
            "type": "WALK"
        },
        {
            "from": "HALL_1_MID",
            "to": "HALL_1_RIGHT",
            "weight": 126,
            "type": "WALK"
        },
        {
            "from": "HALL_1_LEFT",
            "to": "STAIR_1_LEFT",
            "weight": 0,
            "type": "WALK"
        },
        {
            "from": "HALL_1_MID",
            "to": "STAIR_1_RIGHT",
            "weight": 0,
            "type": "WALK"
        },
        {
            "from": "STAIR_0_LEFT",
            "to": "STAIR_1_LEFT",
            "weight": 300,
            "type": "WALK"
        },
        {
            "from": "STAIR_0_RIGHT",
            "to": "STAIR_1_RIGHT",
            "weight": 300,
            "type": "WALK"
        },
        {
            "from": "HALL_MAIN_H_LEFT",
            "to": "GYM",
            "weight": 800,
            "type": "WALK"
        },
        {
            "from": "HALL_MAIN_H_LEFT",
            "to": "PSYCHOLOG",
            "weight": 600,
            "type": "WALK"
        },
        {
            "from": "HALL_MAIN_H_LEFT",
            "to": "PIELEGNIARKA",
            "weight": 600,
            "type": "WALK"
        },
        {
            "from": "HALL_MAIN_H_LEFT",
            "to": "1",
            "weight": 600,
            "type": "WALK"
        },
        {
            "from": "HALL_MAIN_H_LEFT",
            "to": "2",
            "weight": 600,
            "type": "WALK"
        },
        {
            "from": "HALL_MAIN_H_MID",
            "to": "3",
            "weight": 600,
            "type": "WALK"
        },
        {
            "from": "HALL_MAIN_H_MID",
            "to": "4a",
            "weight": 50,
            "type": "WALK"
        },
        {
            "from": "HALL_MAIN_H_MID",
            "to": "4b",
            "weight": 50,
            "type": "WALK"
        },
        {
            "from": "HALL_MAIN_H_MID",
            "to": "6",
            "weight": 600,
            "type": "WALK"
        },
        {
            "from": "HALL_MAIN_H_MID",
            "to": "B1",
            "weight": 800,
            "type": "WALK"
        },
        {
            "from": "HALL_MAIN_H_MID",
            "to": "B2",
            "weight": 800,
            "type": "WALK"
        },
        {
            "from": "HALL_MAIN_H_MID",
            "to": "B3",
            "weight": 800,
            "type": "WALK"
        },
        {
            "from": "HALL_MAIN_CORNER",
            "to": "HALL_MAIN_V_MID",
            "weight": 250,
            "type": "WALK"
        },
        {
            "from": "HALL_MAIN_V_MID",
            "to": "CENTRUM",
            "weight": 20,
            "type": "WALK"
        },
        {
            "from": "HALL_MAIN_V_MID",
            "to": "BIBLIOTEKA",
            "weight": 20,
            "type": "WALK"
        },
        {
            "from": "HALL_MAIN_V_MID",
            "to": "PEDAGOG",
            "weight": 20,
            "type": "WALK"
        },
        {
            "from": "HALL_MAIN_V_MID",
            "to": "7",
            "weight": 20,
            "type": "WALK"
        },
        {
            "from": "HALL_MAIN_V_MID",
            "to": "8",
            "weight": 20,
            "type": "WALK"
        },
        {
            "from": "HALL_MAIN_V_MID",
            "to": "9",
            "weight": 20,
            "type": "WALK"
        },
        {
            "from": "HALL_MAIN_V_MID",
            "to": "ADMINISTRACJA",
            "weight": 10,
            "type": "WALK"
        },
        {
            "from": "HALL_MAIN_V_MID",
            "to": "K2",
            "weight": 10,
            "type": "WALK"
        },
        {
            "from": "HALL_MAIN_V_MID",
            "to": "SEKRETARIAT_K",
            "weight": 10,
            "type": "WALK"
        },
        {
            "from": "HALL_MAIN_V_MID",
            "to": "K1",
            "weight": 10,
            "type": "WALK"
        },
        {
            "from": "HALL_MAIN_V_MID",
            "to": "WC_K",
            "weight": 10,
            "type": "WALK"
        },
        {
            "from": "HALL_MAIN_V_MID",
            "to": "K3",
            "weight": 10,
            "type": "WALK"
        },
        {
            "from": "HALL_MAIN_V_MID",
            "to": "K4",
            "weight": 10,
            "type": "WALK"
        },
        {
            "from": "HALL_MAIN_V_MID",
            "to": "HALL_TOP_CORNER",
            "weight": 100,
            "type": "WALK"
        },
        {
            "from": "HALL_TOP_CORNER",
            "to": "m1",
            "weight": 27,
            "type": "WALK"
        },
        {
            "from": "HALL_TOP_CORNER",
            "to": "m2",
            "weight": 19,
            "type": "WALK"
        },
        {
            "from": "HALL_TOP_CORNER",
            "to": "m3",
            "weight": 11,
            "type": "WALK"
        },
        {
            "from": "HALL_TOP_CORNER",
            "to": "m4",
            "weight": 5,
            "type": "WALK"
        },
        {
            "from": "HALL_TOP_CORNER",
            "to": "KUCHNIA",
            "weight": 6,
            "type": "WALK"
        },
        {
            "from": "HALL_TOP_CORNER",
            "to": "DEG",
            "weight": 20,
            "type": "WALK"
        },
        {
            "from": "HALL_TOP_CORNER",
            "to": "SALA_GASTRO",
            "weight": 20,
            "type": "WALK"
        },
        {
            "from": "HALL_1_LEFT",
            "to": "SEKRETARIAT_1",
            "weight": 15,
            "type": "WALK"
        },
        {
            "from": "HALL_1_LEFT",
            "to": "DYREKTOR",
            "weight": 10,
            "type": "WALK"
        },
        {
            "from": "HALL_1_LEFT",
            "to": "WC_1",
            "weight": 10,
            "type": "WALK"
        },
        {
            "from": "HALL_1_LEFT",
            "to": "POKOJ_NAUCZ_TOP",
            "weight": 5,
            "type": "WALK"
        },
        {
            "from": "HALL_1_LEFT",
            "to": "14",
            "weight": 5,
            "type": "WALK"
        },
        {
            "from": "HALL_1_LEFT",
            "to": "13",
            "weight": 15,
            "type": "WALK"
        },
        {
            "from": "HALL_1_LEFT",
            "to": "B4",
            "weight": 9,
            "type": "WALK"
        },
        {
            "from": "HALL_1_MID",
            "to": "12",
            "weight": 5,
            "type": "WALK"
        },
        {
            "from": "HALL_1_MID",
            "to": "K5",
            "weight": 8,
            "type": "WALK"
        },
        {
            "from": "HALL_1_MID",
            "to": "11",
            "weight": 20,
            "type": "WALK"
        },
        {
            "from": "HALL_1_MID",
            "to": "WC_1_TOP",
            "weight": 27,
            "type": "WALK"
        },
        {
            "from": "HALL_1_MID",
            "to": "WC_1_BOT",
            "weight": 8,
            "type": "WALK"
        },
        {
            "from": "HALL_1_MID",
            "to": "B6",
            "weight": 12,
            "type": "WALK"
        },
        {
            "from": "HALL_1_MID",
            "to": "B5",
            "weight": 14,
            "type": "WALK"
        },
        {
            "from": "HALL_1_MID",
            "to": "B4_WC",
            "weight": 10,
            "type": "WALK"
        },
        {
            "from": "HALL_1_RIGHT",
            "to": "10",
            "weight": 10,
            "type": "WALK"
        }
]

try:
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    data['edges'] = new_edges
    
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=4, ensure_ascii=False)
        
    print("Successfully updated edges.")
except Exception as e:
    print(f"Error: {e}")
