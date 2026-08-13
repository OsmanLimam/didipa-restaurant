#!/usr/bin/env python3
"""Fetch real food images for DidiPa using z-ai image-search CLI"""
import subprocess
import json
import sys
import os

SEARCHES = {
    "jollof-rice-chicken": "Ghanaian jollof rice with grilled chicken on plate",
    "banku-okro-soup": "Ghanaian banku and okro soup traditional food",
    "waakye": "waakye rice and beans Ghanaian food shito",
    "fufu-light-soup": "fufu and light soup Ghanaian food",
    "kenkey-fried-fish": "kenkey fried fish Ghanaian food",
    "fried-rice": "African fried rice with chicken vegetables",
    "omotuo": "rice balls with soup Ghanaian omotuo",
    "plain-rice-stew": "rice with tomato stew grilled chicken African",
    "red-red": "red red beans stew fried plantain Ghanaian",
    "palava-sauce": "palava sauce spinach egusi Ghanaian",
    "egusi-soup": "egusi melon seed soup African food",
    "groundnut-soup": "groundnut peanut soup chicken African",
    "grilled-tilapia": "grilled tilapia fish pepper sauce African",
    "suya": "suya grilled beef skewers West African",
    "fried-yam-fish": "fried yam fish pepper Ghanaian",
    "kelewele": "kelewele spicy fried plantain Ghanaian snack",
    "fried-plantain": "fried ripe plantain African side dish",
    "gari-foto": "gari foto cassava flakes egg Ghanaian",
    "ampesie": "ampesie boiled cassava plantain Ghanaian",
    "tuo-zaafi": "tuo zaafi TZ Northern Ghana food",
    "sobolo": "sobolo hibiscus drink Ghanaian beverage red",
    "palm-wine": "palm wine traditional African drink",
    "asaana": "fermented corn drink asaana Ghanaian",
    "bottled-water": "bottled mineral water product photography",
    "meat-pie": "African meat pie snack pastry",
    "kelewele-groundnuts": "kelewele with groundnuts Ghanaian snack",
}

out_file = "/home/z/my-project/scripts/image-urls.txt"

with open(out_file, "w") as f:
    f.write("")

results = {}
for slug, query in SEARCHES.items():
    print(f"  Searching: {slug} → {query}")
    try:
        proc = subprocess.run(
            ["z-ai", "image-search", "-q", query, "--count", "1", "--gl", "us", "--no-rank"],
            capture_output=True, text=True, timeout=120
        )
        data = json.loads(proc.stdout)
        if data.get("results") and len(data["results"]) > 0:
            url = data["results"][0]["original_url"]
            results[slug] = url
            print(f"  ✅ {url[:80]}...")
        else:
            print(f"  ❌ No result")
    except Exception as e:
        print(f"  ❌ Error: {e}")

# Write results
with open(out_file, "w") as f:
    for slug, url in results.items():
        f.write(f"{slug}|{url}\n")

print(f"\n📊 Found {len(results)}/{len(SEARCHES)} images. Saved to {out_file}")

# Also output as JSON for easy reading
json_file = "/home/z/my-project/scripts/image-urls.json"
with open(json_file, "w") as f:
    json.dump(results, f, indent=2)
print(f"JSON saved to {json_file}")
