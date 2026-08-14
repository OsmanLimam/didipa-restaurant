import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
import path from 'path';

const base = '/home/z/my-project/public/images';

// Ensure directories exist
const dirs = ['hero', 'meals', 'drinks', 'desserts', 'breakfast', 'extras', 'restaurant', 'branding'];
for (const d of dirs) {
  fs.mkdirSync(path.join(base, d), { recursive: true });
}

const zai = await ZAI.create();

// Food photography style prompt prefix
const style = 'professional food photography, natural lighting, warm tones, clean white plate, dark wood table background, high resolution, appetizing presentation, restaurant quality plating';

// All images to generate
const images: { key: string; prompt: string; size: string; dir: string }[] = [
  // Hero
  { key: 'hero-food', prompt: 'Beautiful spread of Ghanaian food on a table, jollof rice, grilled chicken, banku, kelewele, professional food photography, warm lighting, appetizing, restaurant quality, overhead shot', size: '1344x768', dir: 'hero' },

  // Rice Meals
  { key: 'jollof-rice-chicken', prompt: `${style}, Ghanaian jollof rice with smoky tomato base served with perfectly grilled chicken leg, fresh salad garnish`, size: '1024x1024', dir: 'meals' },
  { key: 'fried-rice-chicken', prompt: `${style}, fried rice with mixed vegetables egg and grilled chicken, Asian-African fusion style`, size: '1024x1024', dir: 'meals' },
  { key: 'plain-rice-stew', prompt: `${style}, fluffy long grain rice with rich tomato stew and grilled chicken pieces`, size: '1024x1024', dir: 'meals' },
  { key: 'jollof-rice-grilled', prompt: `${style}, smoky Ghanaian jollof rice with charred grilled chicken, fresh lettuce and tomato garnish`, size: '1024x1024', dir: 'meals' },
  { key: 'vegetable-fried-rice', prompt: `${style}, colorful vegetable fried rice with carrots peas corn and bell peppers, no meat`, size: '1024x1024', dir: 'meals' },

  // Ghanaian Favorites
  { key: 'waakye-special', prompt: `${style}, Ghanaian waakye rice and beans with millet leaves, served with gari shito spaghetti boiled egg fried plantain`, size: '1024x1024', dir: 'meals' },
  { key: 'banku-grilled-tilapia', prompt: `${style}, smooth banku fermented corn and cassava dough served with whole grilled tilapia fish and pepper sauce`, size: '1024x1024', dir: 'meals' },
  { key: 'banku-okro-soup', prompt: `${style}, soft banku served with green okro soup with fish and palm oil, traditional Ghanaian meal`, size: '1024x1024', dir: 'meals' },
  { key: 'fufu-light-soup', prompt: `${style}, smooth fufu pounded cassava and plantain served with golden goat meat light soup, Ghanaian comfort food`, size: '1024x1024', dir: 'meals' },
  { key: 'fufu-groundnut-soup', prompt: `${style}, fufu served with rich groundnut peanut soup with tender chicken pieces`, size: '1024x1024', dir: 'meals' },
  { key: 'ampesi-kontomire', prompt: `${style}, boiled yam and plantain ampesi served with kontomire cocoyam leaf stew with palm oil`, size: '1024x1024', dir: 'meals' },
  { key: 'red-red-plantain', prompt: `${style}, Ghanaian red red black-eyed beans in palm oil stew served with sweet fried plantain slices`, size: '1024x1024', dir: 'meals' },

  // Chicken & Protein
  { key: 'grilled-chicken', prompt: `${style}, perfectly grilled chicken quarter with crispy golden skin, served with salad and pepper sauce`, size: '1024x1024', dir: 'meals' },
  { key: 'fried-chicken', prompt: `${style}, crispy deep fried chicken pieces golden brown, served with fries and coleslaw`, size: '1024x1024', dir: 'meals' },
  { key: 'chicken-wings', prompt: `${style}, spicy grilled chicken wings with char marks, served with dipping sauce and celery`, size: '1024x1024', dir: 'meals' },
  { key: 'grilled-tilapia', prompt: `${style}, whole grilled tilapia fish with crispy skin, served with pepper sauce and lemon wedges`, size: '1024x1024', dir: 'meals' },
  { key: 'fried-gizzard', prompt: `${style}, crispy fried chicken gizzard pieces with pepper sauce, Ghanaian street food style`, size: '1024x1024', dir: 'meals' },
  { key: 'suya-skewers', prompt: `${style}, spicy suya grilled beef skewers with groundnut powder and sliced onion, West African street food`, size: '1024x1024', dir: 'meals' },

  // Fast Meals
  { key: 'yam-chips-chicken', prompt: `${style}, crispy fried yam chips served with fried chicken pieces and pepper sauce`, size: '1024x1024', dir: 'meals' },
  { key: 'fried-yam-gizzard', prompt: `${style}, crispy fried yam slices served with fried gizzard and shito pepper sauce`, size: '1024x1024', dir: 'meals' },
  { key: 'chicken-burger', prompt: `${style}, juicy grilled chicken burger with lettuce tomato and mayo, served with fries`, size: '1024x1024', dir: 'meals' },
  { key: 'chicken-sandwich', prompt: `${style}, grilled chicken sandwich with avocado and vegetables on toasted bread`, size: '1024x1024', dir: 'meals' },
  { key: 'loaded-fries', prompt: `${style}, loaded french fries with grilled chicken pieces cheese sauce and green onions`, size: '1024x1024', dir: 'meals' },

  // Breakfast
  { key: 'tea-bread-egg', prompt: `${style}, Ghanaian breakfast with tea, sliced bread and fried eggs on plate`, size: '1024x1024', dir: 'breakfast' },
  { key: 'omelette-toast', prompt: `${style}, fluffy omelette with vegetables served with toast bread and tea`, size: '1024x1024', dir: 'breakfast' },
  { key: 'hausa-koko-koose', prompt: `${style}, Ghanaian hausa koko millet porridge served with koose bean fritters, traditional breakfast`, size: '1024x1024', dir: 'breakfast' },
  { key: 'pancakes-breakfast', prompt: `${style}, fluffy pancakes with maple syrup butter and fresh berries, morning breakfast`, size: '1024x1024', dir: 'breakfast' },
  { key: 'oats-fruit', prompt: `${style}, warm oatmeal porridge with fresh banana slices berries and honey`, size: '1024x1024', dir: 'breakfast' },
  { key: 'english-breakfast', prompt: `${style}, full breakfast plate with fried eggs sausage beans toast hash browns and grilled tomato`, size: '1024x1024', dir: 'breakfast' },

  // Drinks
  { key: 'sobolo', prompt: `${style}, refreshing dark red sobolo hibiscus drink in tall glass with ice, Ghanaian traditional beverage`, size: '1024x1024', dir: 'drinks' },
  { key: 'asaana', prompt: `${style}, Ghanaian asaana fermented corn drink in glass, sweet and refreshing traditional beverage`, size: '1024x1024', dir: 'drinks' },
  { key: 'lamugin', prompt: `${style}, Ghanaian lamugin ginger drink in glass with ice, refreshing traditional beverage`, size: '1024x1024', dir: 'drinks' },
  { key: 'pineapple-juice', prompt: `${style}, fresh pineapple juice in glass with ice and pineapple wedge garnish`, size: '1024x1024', dir: 'drinks' },
  { key: 'mango-juice', prompt: `${style}, fresh mango juice in tall glass with ice, vibrant orange color`, size: '1024x1024', dir: 'drinks' },
  { key: 'watermelon-juice', prompt: `${style}, fresh watermelon juice in glass with ice, bright red color and refreshing`, size: '1024x1024', dir: 'drinks' },
  { key: 'fruit-cocktail', prompt: `${style}, mixed fruit cocktail juice with orange mango and pineapple, in tall glass with ice`, size: '1024x1024', dir: 'drinks' },
  { key: 'bottled-water', prompt: `${style}, crystal clear bottled mineral water on table, simple and refreshing`, size: '1024x1024', dir: 'drinks' },
  { key: 'malt-drink', prompt: `${style}, cold malt beverage in bottle with glass, non-alcoholic refreshing drink`, size: '1024x1024', dir: 'drinks' },

  // Desserts
  { key: 'chocolate-cake', prompt: `${style}, rich chocolate cake slice with ganache frosting and chocolate shavings`, size: '1024x1024', dir: 'desserts' },
  { key: 'cheesecake', prompt: `${style}, creamy cheesecake slice with strawberry sauce and fresh berries on top`, size: '1024x1024', dir: 'desserts' },
  { key: 'brownie', prompt: `${style}, warm chocolate brownie with vanilla ice cream and chocolate drizzle`, size: '1024x1024', dir: 'desserts' },
  { key: 'vanilla-ice-cream', prompt: `${style}, scoop of vanilla ice cream in bowl with wafer cookie, simple and elegant`, size: '1024x1024', dir: 'desserts' },
  { key: 'fruit-parfait', prompt: `${style}, layered fruit yogurt parfait in tall glass with granola and fresh berries`, size: '1024x1024', dir: 'desserts' },
  { key: 'fruit-salad', prompt: `${style}, colorful fresh fruit salad with mango pineapple watermelon and berries in bowl`, size: '1024x1024', dir: 'desserts' },

  // Sides/Extras
  { key: 'kelewele', prompt: `${style}, Ghanaian kelewele spicy fried plantain cubes with ginger, golden and crispy`, size: '1024x1024', dir: 'extras' },
  { key: 'fried-plantain', prompt: `${style}, sweet ripe fried plantain slices golden brown and caramelized`, size: '1024x1024', dir: 'extras' },
  { key: 'shito', prompt: `${style}, Ghanaian shito hot black pepper sauce with dried shrimp, in small bowl`, size: '1024x1024', dir: 'extras' },
  { key: 'coleslaw', prompt: `${style}, fresh creamy coleslaw with shredded cabbage and carrots in small bowl`, size: '1024x1024', dir: 'extras' },
  { key: 'fried-egg', prompt: `${style}, perfectly fried egg sunny side up on white plate, golden yolk`, size: '1024x1024', dir: 'extras' },
  { key: 'extra-chicken', prompt: `${style}, extra grilled chicken piece on plate, juicy and well-seasoned`, size: '1024x1024', dir: 'extras' },
  { key: 'gari-foto', prompt: `${style}, Ghanaian gari foto cassava flakes stir-fried with egg and onion`, size: '1024x1024', dir: 'extras' },
  { key: 'meat-pie', prompt: `${style}, golden flaky Ghanaian meat pie pastry filled with seasoned minced meat`, size: '1024x1024', dir: 'extras' },

  // More Ghanaian dishes
  { key: 'kenkey-fish', prompt: `${style}, Ghanaian kenkey fermented corn dumpling with fried fish and pepper sauce`, size: '1024x1024', dir: 'meals' },
  { key: 'tuo-zaafi', prompt: `${style}, Ghanaian tuo zaafi corn meal served with dawadawa soup from Northern Ghana`, size: '1024x1024', dir: 'meals' },
  { key: 'egusi-soup', prompt: `${style}, rich egusi melon seed soup with assorted meat and fish, served in bowl`, size: '1024x1024', dir: 'meals' },
  { key: 'groundnut-soup', prompt: `${style}, rich groundnut peanut soup with tender chicken pieces in bowl`, size: '1024x1024', dir: 'meals' },
  { key: 'palava-sauce', prompt: `${style}, Ghanaian palava sauce with spinach and egusi, served with rice`, size: '1024x1024', dir: 'meals' },

  // Restaurant Experience
  { key: 'restaurant-interior', prompt: 'Modern African restaurant interior with warm lighting, wooden tables, comfortable seating, and elegant decor, welcoming atmosphere', size: '1344x768', dir: 'restaurant' },
  { key: 'chef-cooking', prompt: 'Professional African chef cooking in modern restaurant kitchen, focused expression, steam rising from pan, warm lighting', size: '1344x768', dir: 'restaurant' },
  { key: 'food-delivery', prompt: 'Food delivery rider on motorcycle with insulated delivery bag, urban African setting, professional delivery service', size: '1344x768', dir: 'restaurant' },
  { key: 'table-setting', prompt: 'Elegant restaurant table setting with cutlery napkin and menu, warm lighting, sophisticated dining atmosphere', size: '1344x768', dir: 'restaurant' },
];

console.log(`\n🎨 Generating ${images.length} images...\n`);

const results: Record<string, string> = {};
let successCount = 0;

for (let i = 0; i < images.length; i++) {
  const img = images[i];
  const outputPath = path.join(base, img.dir, `${img.key}.png`);

  // Skip if already exists
  if (fs.existsSync(outputPath) && fs.statSync(outputPath).size > 10000) {
    console.log(`⏭️  [${i + 1}/${images.length}] ${img.key} - already exists, skipping`);
    results[img.key] = `/images/${img.dir}/${img.key}.png`;
    successCount++;
    continue;
  }

  console.log(`🎨 [${i + 1}/${images.length}] Generating: ${img.key}...`);

  try {
    const response = await zai.images.generations.create({
      prompt: img.prompt,
      size: img.size as any,
    });

    const imageBase64 = response.data[0].base64;
    const buffer = Buffer.from(imageBase64, 'base64');
    fs.writeFileSync(outputPath, buffer);

    results[img.key] = `/images/${img.dir}/${img.key}.png`;
    successCount++;
    console.log(`  ✅ Saved: ${outputPath} (${(buffer.length / 1024).toFixed(0)}KB)`);
  } catch (e: any) {
    console.error(`  ❌ Failed: ${e.message}`);
    results[img.key] = '';  // Will use fallback
  }

  // Small delay to avoid rate limiting
  if (i < images.length - 1) {
    await new Promise(r => setTimeout(r, 1000));
  }
}

// Save results mapping
fs.writeFileSync(
  '/home/z/my-project/scripts/image-results.json',
  JSON.stringify(results, null, 2)
);

console.log(`\n✅ Generated ${successCount}/${images.length} images`);
console.log('Results saved to /home/z/my-project/scripts/image-results.json');
