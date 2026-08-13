#!/usr/bin/env bash
# Fetch real food images for Mama's Kitchen
set -e

OUT="/home/z/my-project/scripts/image-urls.txt"
> "$OUT"

search_and_save() {
  local slug="$1"
  local query="$2"
  echo "  🔍 $slug..."
  
  # Run search, capture JSON from stdout (after the emoji lines)
  result=$(z-ai image-search -q "$query" --count 1 --gl us --no-rank 2>/dev/null | sed -n '/^{/,$p')
  
  # Extract URL using python
  url=$(echo "$result" | python3 -c "
import json, sys
try:
    d = json.load(sys.stdin)
    if d.get('results') and len(d['results']) > 0:
        print(d['results'][0]['original_url'])
    else:
        print('')
except:
    print('')
" 2>/dev/null)
  
  if [ -n "$url" ] && [ "$url" != "" ]; then
    echo "$slug|$url" >> "$OUT"
    echo "  ✅ $slug → ${url:0:60}..."
  else
    echo "  ❌ $slug - no result"
  fi
}

echo "🍽️  Searching for real food images..."

search_and_save "jollof-rice-chicken" "Ghanaian jollof rice with grilled chicken on plate"
search_and_save "banku-okro-soup" "Ghanaian banku and okro soup traditional food"
search_and_save "waakye" "waakye rice and beans Ghanaian food"
search_and_save "fufu-light-soup" "fufu and light soup Ghanaian food"
search_and_save "kenkey-fried-fish" "kenkey fried fish Ghanaian food"
search_and_save "fried-rice" "African fried rice with chicken vegetables"
search_and_save "omotuo" "rice balls with groundnut soup Ghanaian"
search_and_save "plain-rice-stew" "rice with tomato stew grilled chicken African"
search_and_save "red-red" "red red beans stew fried plantain Ghanaian"
search_and_save "palava-sauce" "palava sauce spinach egusi Ghanaian"
search_and_save "egusi-soup" "egusi melon seed soup African food"
search_and_save "groundnut-soup" "groundnut peanut soup chicken African"
search_and_save "grilled-tilapia" "grilled tilapia fish pepper sauce African"
search_and_save "suya" "suya grilled beef skewers West African"
search_and_save "fried-yam-fish" "fried yam fish pepper Ghanaian"
search_and_save "kelewele" "kelewele spicy fried plantain Ghanaian snack"
search_and_save "fried-plantain" "fried ripe plantain African side dish"
search_and_save "gari-foto" "gari foto cassava flakes egg Ghanaian"
search_and_save "ampesie" "ampesie boiled cassava plantain Ghanaian"
search_and_save "tuo-zaafi" "tuo zaafi TZ Northern Ghana food"
search_and_save "sobolo" "sobolo hibiscus drink Ghanaian beverage red"
search_and_save "palm-wine" "palm wine traditional African drink"
search_and_save "asaana" "fermented corn drink asaana Ghanaian"
search_and_save "bottled-water" "bottled mineral water product photography"
search_and_save "meat-pie" "African meat pie snack pastry"
search_and_save "kelewele-groundnuts" "kelewele with groundnuts Ghanaian snack"

echo ""
total=$(wc -l < "$OUT")
echo "📊 Found $total images. Saved to $OUT"
