import { execSync } from 'child_process';
import * as fs from 'fs';

interface SearchResult {
  original_url: string;
  caption: string;
  source: string;
  original_width: string;
  original_height: string;
}

interface SearchResponse {
  success: boolean;
  query: string;
  count: number;
  results: SearchResult[];
}

function searchImages(query: string, count = 2): SearchResult[] {
  try {
    const output = execSync(
      `z-ai image-search -q "${query}" --count ${count} --gl us --no-rank 2>/dev/null`,
      { encoding: 'utf-8', timeout: 120000 }
    );
    // Find the JSON in the output (after any emoji/prefix lines)
    const jsonStart = output.indexOf('{');
    if (jsonStart === -1) return [];
    const json = output.slice(jsonStart);
    const data: SearchResponse = JSON.parse(json);
    return data.success ? data.results : [];
  } catch (e) {
    console.error(`Search failed for "${query}":`, (e as Error).message);
    return [];
  }
}

// All searches to perform
const searches: { key: string; query: string }[] = [
  // Rice Meals
  { key: 'jollof-rice-chicken', query: 'Ghanaian jollof rice with grilled chicken on plate' },
  { key: 'fried-rice-chicken', query: 'Ghanaian fried rice with vegetables and chicken' },
  { key: 'plain-rice-stew', query: 'Ghanaian plain rice with tomato stew and chicken' },
  { key: 'jollof-rice-grilled', query: 'jollof rice with perfectly grilled chicken leg' },
  { key: 'vegetable-fried-rice', query: 'vegetable fried rice African style on plate' },

  // Ghanaian Favorites
  { key: 'waakye-special', query: 'Ghanaian waakye with shito gari and egg on plate' },
  { key: 'banku-grilled-tilapia', query: 'banku and grilled tilapia fish Ghanaian food' },
  { key: 'banku-okro-soup', query: 'Ghanaian banku and okro soup in bowl' },
  { key: 'fufu-light-soup', query: 'Ghanaian fufu and light soup with goat meat' },
  { key: 'fufu-groundnut-soup', query: 'fufu and groundnut soup Ghanaian food' },
  { key: 'ampesi-kontomire', query: 'Ghanaian ampesi with kontomire stew' },
  { key: 'red-red-plantain', query: 'Ghanaian red red black eyed peas with fried plantain' },

  // Chicken & Protein
  { key: 'grilled-chicken', query: 'Ghanaian grilled chicken quarter plated professionally' },
  { key: 'fried-chicken', query: 'crispy fried chicken pieces Ghanaian style' },
  { key: 'chicken-wings', query: 'spicy grilled chicken wings on plate' },
  { key: 'grilled-tilapia', query: 'whole grilled tilapia fish with pepper sauce' },
  { key: 'fried-gizzard', query: 'Ghanaian fried gizzard with pepper on plate' },
  { key: 'suya-skewers', query: 'Ghanaian suya spicy grilled beef skewers' },

  // Fast Meals
  { key: 'yam-chips-chicken', query: 'Ghanaian fried yam chips with chicken' },
  { key: 'fried-yam-gizzard', query: 'fried yam and gizzard Ghanaian food' },
  { key: 'chicken-burger', query: 'African style chicken burger with fries' },
  { key: 'chicken-sandwich', query: 'grilled chicken sandwich with vegetables' },
  { key: 'loaded-fries', query: 'loaded fries with chicken and cheese' },

  // Breakfast
  { key: 'tea-bread-egg', query: 'Ghanaian breakfast tea bread and fried egg' },
  { key: 'omelette-toast', query: 'omelette with toast bread breakfast' },
  { key: 'hausa-koko-koose', query: 'Ghanaian hausa koko with koose breakfast' },
  { key: 'pancakes-breakfast', query: 'fluffy pancakes with syrup and butter breakfast' },
  { key: 'oats-fruit', query: 'oatmeal porridge with fresh fruit breakfast' },
  { key: 'english-breakfast', query: 'full English breakfast plate with eggs sausage beans' },

  // Drinks
  { key: 'sobolo', query: 'Ghanaian sobolo hibiscus drink in glass' },
  { key: 'asaana', query: 'Ghanaian asaana fermented corn drink' },
  { key: 'lamugin', query: 'Ghanaian lamugin drink in glass' },
  { key: 'pineapple-juice', query: 'fresh pineapple juice in glass with ice' },
  { key: 'mango-juice', query: 'fresh mango juice in glass' },
  { key: 'watermelon-juice', query: 'fresh watermelon juice in glass' },
  { key: 'fruit-cocktail', query: 'mixed fruit cocktail juice in glass' },
  { key: 'bottled-water', query: 'bottled water mineral water on table' },
  { key: 'malt-drink', query: 'malt beverage drink bottle cold' },
  { key: 'coke-drink', query: 'coca cola drink glass with ice' },

  // Desserts
  { key: 'chocolate-cake', query: 'chocolate cake slice plated dessert' },
  { key: 'cheesecake', query: 'cheesecake slice with berries dessert' },
  { key: 'brownie', query: 'chocolate brownie with ice cream dessert' },
  { key: 'vanilla-ice-cream', query: 'vanilla ice cream in bowl dessert' },
  { key: 'chocolate-ice-cream', query: 'chocolate ice cream cone dessert' },
  { key: 'fruit-parfait', query: 'fruit yogurt parfait in glass dessert' },
  { key: 'fruit-salad', query: 'fresh fruit salad in bowl dessert' },

  // Sides/Extras
  { key: 'kelewele', query: 'Ghanaian kelewele spicy fried plantain cubes' },
  { key: 'fried-plantain', query: 'sweet fried plantain slices on plate' },
  { key: 'gari-foto', query: 'Ghanaian gari foto with egg' },
  { key: 'shito', query: 'Ghanaian shito black pepper sauce' },
  { key: 'coleslaw', query: 'coleslaw salad side dish' },
  { key: 'fried-egg', query: 'fried egg on plate side dish' },
  { key: 'salad-side', query: 'fresh vegetable salad side dish' },

  // Restaurant Experience
  { key: 'restaurant-interior', query: 'modern African restaurant interior dining room' },
  { key: 'restaurant-exterior', query: 'modern restaurant exterior entrance evening' },
  { key: 'chef-cooking', query: 'African chef cooking in professional kitchen' },
  { key: 'food-delivery', query: 'food delivery rider with bag on motorcycle' },
  { key: 'food-plating', query: 'chef plating food in restaurant kitchen' },
  { key: 'table-setting', query: 'restaurant table setting with cutlery and napkin' },

  // Kenkey
  { key: 'kenkey-fish', query: 'Ghanaian kenkey with fried fish and pepper' },
  // Tuo Zaafi
  { key: 'tuo-zaafi', query: 'Ghanaian tuo zaafi with dawadawa soup' },
  // Meat pie
  { key: 'meat-pie', query: 'Ghanaian meat pie pastry snack' },
  // Palava sauce
  { key: 'palava-sauce', query: 'Ghanaian palava sauce with rice' },
  // Egusi
  { key: 'egusi-soup', query: 'Ghanaian egusi soup with fufu' },
  // Groundnut soup
  { key: 'groundnut-soup', query: 'Ghanaian groundnut soup with rice' },
];

const imageMap: Record<string, string> = {};

console.log(`\n🔍 Searching for ${searches.length} image categories...\n`);

for (const search of searches) {
  console.log(`Searching: ${search.key}...`);
  const results = searchImages(search.query, 2);
  if (results.length > 0) {
    imageMap[search.key] = results[0].original_url;
    console.log(`  ✅ Found: ${results[0].original_url.slice(0, 80)}...`);
  } else {
    console.log(`  ❌ No results`);
  }
}

// Write results
fs.writeFileSync(
  '/home/z/my-project/scripts/image-results.json',
  JSON.stringify(imageMap, null, 2)
);

console.log(`\n✅ Found ${Object.keys(imageMap).length}/${searches.length} images`);
console.log('Results saved to /home/z/my-project/scripts/image-results.json');
