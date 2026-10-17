"""Append illegal-construction holdings to public/data/punjab_parcels.json.

Adds 20 holdings per district (200 total, matching every other violation
category), placed on an extra row of each district's parcel grid. Each record
carries the satellite evidence the construction desk shows: built-up index
(NDBI), built-up share of the plot, structure height from the surface model,
and how many monthly passes the structure persisted.

Re-running replaces previously generated construction holdings.
Usage: python3 scripts/generate_construction_cases.py
"""

import json
import math
import random
import statistics
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PARCELS = ROOT / "public" / "data" / "punjab_parcels.json"
MODEL = ROOT / "public" / "data" / "risk_model.json"

PER_DISTRICT = 20
MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
CROPS = ["Wheat-Paddy", "Basmati", "Cotton", "Maize", "Potato", "Mustard", "Fodder"]
SQM_PER_ACRE = 4046.86

STRUCTURES = [
    ("Farmhouse", (3.5, 8.5), (0.06, 0.18)),
    ("Warehouse / godown", (5.0, 9.5), (0.10, 0.30)),
    ("Commercial shed", (3.0, 6.0), (0.08, 0.25)),
    ("Marriage palace", (6.0, 11.0), (0.15, 0.40)),
    ("Plotted colony (walls and roads)", (2.6, 4.0), (0.20, 0.45)),
    ("Brick kiln", (4.0, 9.0), (0.12, 0.30)),
]

THRESHOLDS = {"ndbi": 0.08, "builtUpPct": 5.0, "heightM": 2.5, "persistMonths": 3}


def load_model():
    model = json.loads(MODEL.read_text())

    def tree_value(tree, x):
        node = 0
        while tree["l"][node] != -1:
            node = tree["l"][node] if x[tree["i"][node]] < tree["t"][node] else tree["r"][node]
        return tree["w"][node]

    def evaluate(part, x):
        total = part["base"] + sum(tree_value(t, x) for t in part["trees"])
        return 1 / (1 + math.exp(-total)) if part["logistic"] else total

    return lambda x: (evaluate(model["loan"], x), evaluate(model["risk"], x))


def grid_for(farms):
    """Fit lat/lng = origin + row*step for the district's 20-column grid."""
    rows = [(int(f["id"][-4:]) - 1) // 20 for f in farms]
    cols = [(int(f["id"][-4:]) - 1) % 20 for f in farms]

    def fit(xs, ys):
        mx, my = statistics.mean(xs), statistics.mean(ys)
        slope = sum((x - mx) * (y - my) for x, y in zip(xs, ys)) / sum((x - mx) ** 2 for x in xs)
        return my - slope * mx, slope

    lat0, dlat = fit(rows, [f["lat"] for f in farms])
    lng0, dlng = fit(cols, [f["lng"] for f in farms])
    return lat0, dlat, lng0, dlng


def make_case(rng, template, number, lat, lng, names, villages, predict):
    kind, height_range, share_range = rng.choice(STRUCTURES)
    acres = round(rng.uniform(1.5, 22.0), 2)
    share = rng.uniform(*share_range)
    first_seen = rng.randint(1, 9)
    partial = rng.random() < 0.2
    persist = 12 - first_seen + 1
    height = rng.uniform(*height_range)
    ndbi = rng.uniform(0.11, 0.34)
    if partial:
        weak = rng.choice(["height", "persistence"])
        if weak == "height":
            height = rng.uniform(0.8, 2.3)
        else:
            first_seen = rng.randint(11, 12)
            persist = 12 - first_seen + 1

    crop = template["crop"]
    ndvi, months, farmed = [], [], 0
    for i, m in enumerate(template["months"]):
        base = m["ndvi"]
        value = base if i + 1 < first_seen else max(0.04, base * (1 - share) * 0.55 + rng.uniform(0.0, 0.04))
        value = round(value, 3)
        farming = i + 1 < first_seen and m["farming"]
        farmed += farming
        ndvi.append(value)
        months.append({**m, "ndvi": value, "farming": farming})

    mean = statistics.mean(ndvi)
    std = statistics.pstdev(ndvi)
    spectral = round(rng.uniform(0.25, 0.6), 3)
    bare = round(rng.uniform(0.55, 0.85), 3)
    harvests = 0 if first_seen <= 4 else 1
    overlap = round(rng.uniform(0.01, 0.08), 3)
    offseason = round(rng.uniform(0.05, 0.15), 3)
    gli = round(mean + rng.uniform(-0.02, 0.02), 3)
    features = ndvi + [
        acres,
        template["altitude"],
        template["fertility"],
        round(statistics.mean(m["temp"] for m in months), 2),
        template["humidity"],
        round(sum(m["rain"] for m in months), 1),
        template["soilMoisture"],
        round(mean, 3),
        round(std, 3),
        float(farmed),
        spectral,
        bare,
        round(height, 2),
        float(harvests),
        overlap,
        offseason,
        gli,
    ] + [1.0 if c == crop else 0.0 for c in CROPS]

    loan_p, risk = predict(features)
    risk = round(min(98.0, max(2.0, risk)), 2)
    score = int(round(300 + (100 - risk) * 2.4))

    footprint = round(share * acres * SQM_PER_ACRE)
    box_w = round(min(0.7, math.sqrt(share) * rng.uniform(0.85, 1.15)), 3)
    box_h = round(min(0.7, share / box_w), 3)
    signals = {
        "ndbi": ndbi >= THRESHOLDS["ndbi"],
        "builtUp": share * 100 >= THRESHOLDS["builtUpPct"],
        "height": height >= THRESHOLDS["heightM"],
        "persistence": persist >= THRESHOLDS["persistMonths"],
    }
    confidence = round(0.62 + 0.09 * sum(signals.values()) + rng.uniform(0.0, 0.05), 2)

    half = 0.00105
    offsets = [[-half + rng.uniform(-1e-4, 1e-4), -half + rng.uniform(-1e-4, 1e-4)],
               [half + rng.uniform(-1e-4, 1e-4), -half + rng.uniform(-1e-4, 1e-4)],
               [half + rng.uniform(-1e-4, 1e-4), half + rng.uniform(-1e-4, 1e-4)],
               [-half + rng.uniform(-1e-4, 1e-4), half + rng.uniform(-1e-4, 1e-4)]]
    bbox = f"{lng - 0.0026:.6f},{lat - 0.0026:.6f},{lng + 0.0026:.6f},{lat + 0.0026:.6f}"

    return {
        "id": f"PB-{template['id'][3:6]}-{number:04d}",
        "name": f"{rng.choice(names[0])} {rng.choice(names[1])}",
        "district": template["district"],
        "village": rng.choice(villages),
        "crop": crop,
        "detectedCrop": "Built-up structure",
        "acres": acres,
        "lat": round(lat, 6),
        "lng": round(lng, 6),
        "offsets": offsets,
        "loan": "no",
        "risk": risk,
        "violation": "illegal_construction",
        "farming": farmed > 0,
        "fertility": template["fertility"],
        "humidity": template["humidity"],
        "altitude": template["altitude"],
        "soilMoisture": template["soilMoisture"],
        "gli": gli,
        "harvestConsistency": rng.randint(20, 45),
        "neighborhoodBenchmark": round(rng.uniform(-38.0, -24.0), 1),
        "ndvi": ndvi,
        "satellite": (
            "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/export"
            f"?bbox={bbox}&bboxSR=4326&imageSR=4326&size=256,256&format=png&f=image"
        ),
        "score": score,
        "months": months,
        "features": features,
        "loanReasons": [
            {"feature": "spectral_match", "label": "Crop calendar match", "value": spectral, "impact": -3.6, "direction": "down"},
            {"feature": "bare_soil_fraction", "label": "Bare or built surface", "value": bare, "impact": -1.4, "direction": "down"},
            {"feature": "months_farming", "label": "Months farmed", "value": float(farmed), "impact": -0.6, "direction": "down"},
        ],
        "riskReasons": [
            {"feature": "elevation_change_m", "label": "Structure height gain", "value": round(height, 2), "impact": 9.8, "direction": "up"},
            {"feature": "spectral_match", "label": "Crop calendar match", "value": spectral, "impact": 9.1, "direction": "up"},
            {"feature": "bare_soil_fraction", "label": "Bare or built surface", "value": bare, "impact": 4.2, "direction": "up"},
        ],
        "construction": {
            "type": kind,
            "footprintSqm": footprint,
            "builtUpPct": round(share * 100, 1),
            "heightM": round(height, 1),
            "ndbi": round(ndbi, 3),
            "firstSeen": MONTHS[first_seen - 1],
            "persistMonths": persist,
            "confidence": min(0.99, confidence),
            "signals": signals,
            "satelliteVerified": all(signals.values()),
            "cluPermit": False,
            "box": [round(rng.uniform(0.15, 0.85 - box_w), 3), round(rng.uniform(0.15, 0.85 - box_h), 3), box_w, box_h],
            "modelLoanProbability": round(loan_p, 4),
        },
    }


def main():
    rng = random.Random(20251014)
    predict = load_model()
    parcels = [p for p in json.loads(PARCELS.read_text()) if p["violation"] != "illegal_construction"]
    names = (sorted({p["name"].split()[0] for p in parcels}), sorted({p["name"].split()[1] for p in parcels}))

    added = []
    for district in sorted({p["district"] for p in parcels}):
        farms = [p for p in parcels if p["district"] == district]
        lat0, dlat, lng0, dlng = grid_for(farms)
        row = max((int(f["id"][-4:]) - 1) // 20 for f in farms) + 1
        templates = [p for p in farms if p["violation"] == "none" and p["farming"]]
        villages = sorted({p["village"] for p in farms})
        start = max(int(f["id"][-4:]) for f in farms) + 1
        for col in range(PER_DISTRICT):
            lat = lat0 + row * dlat + rng.uniform(-0.002, 0.002)
            lng = lng0 + col * dlng + rng.uniform(-0.002, 0.002)
            added.append(make_case(rng, rng.choice(templates), start + col, lat, lng, names, villages, predict))

    PARCELS.write_text(json.dumps(parcels + added, separators=(",", ":")))
    loans = sum(1 for c in added if c["construction"]["modelLoanProbability"] >= 0.5)
    verified = sum(1 for c in added if c["construction"]["satelliteVerified"])
    print(f"added {len(added)} construction holdings ({verified} satellite-verified); model approves {loans}")
    print(f"risk range {min(c['risk'] for c in added)}-{max(c['risk'] for c in added)}, total {len(parcels) + len(added)} holdings")


if __name__ == "__main__":
    main()
