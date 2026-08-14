import { db } from '../src/lib/db';
import { hash } from 'bcryptjs';
import { randomUUID } from 'crypto';

async function main() {
  console.log('🌱 Seeding database...');

  // Clean existing data
  await db.orderItemExtra.deleteMany();
  await db.orderItem.deleteMany();
  await db.orderStatusHistory.deleteMany();
  await db.order.deleteMany();
  await db.customer.deleteMany();
  await db.menuItemExtra.deleteMany();
  await db.menuItem.deleteMany();
  await db.category.deleteMany();
  await db.restaurantHours.deleteMany();
  await db.restaurant.deleteMany();
  await db.testimonial.deleteMany();
  await db.user.deleteMany();

  // Create admin user
  const hashedPassword = await hash('admin123', 12);
  const admin = await db.user.create({
    data: {
      email: 'admin@didipa.com',
      name: 'Admin',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });
  console.log('✅ Admin user created');

  // Create restaurant
  const restaurant = await db.restaurant.create({
    data: {
      name: 'DidiPa',
      description: 'Authentic Ghanaian cuisine made with love and tradition. From smoky jollof rice to comforting banku & okro soup — every dish tells a story of home.',
      phone: '+233 53 682 8150',
      whatsappNumber: '233536828150',
      address: 'KNUST Campus, Kumasi, Ghana',
      deliveryFee: 10.0,
      minimumOrder: 20.0,
      preparationTime: 30,
      freeDeliveryMin: 100.0,
      status: 'OPEN',
    },
  });

  // Restaurant hours
  const hoursData = [
    { dayOfWeek: 0, openTime: '10:00', closeTime: '20:00', isClosed: false, restaurantId: restaurant.id },
    { dayOfWeek: 1, openTime: '07:00', closeTime: '21:00', isClosed: false, restaurantId: restaurant.id },
    { dayOfWeek: 2, openTime: '07:00', closeTime: '21:00', isClosed: false, restaurantId: restaurant.id },
    { dayOfWeek: 3, openTime: '07:00', closeTime: '21:00', isClosed: false, restaurantId: restaurant.id },
    { dayOfWeek: 4, openTime: '07:00', closeTime: '21:00', isClosed: false, restaurantId: restaurant.id },
    { dayOfWeek: 5, openTime: '07:00', closeTime: '21:00', isClosed: false, restaurantId: restaurant.id },
    { dayOfWeek: 6, openTime: '08:00', closeTime: '21:00', isClosed: false, restaurantId: restaurant.id },
  ];
  await db.restaurantHours.createMany({ data: hoursData });
  console.log('✅ Restaurant hours created');

  // Categories
  const categories = await Promise.all([
    db.category.create({ data: { name: 'Breakfast', slug: 'breakfast', description: 'Start your day right with classic Ghanaian morning meals', displayOrder: 0 } }),
    db.category.create({ data: { name: 'Rice Meals', slug: 'rice-meals', description: 'Fragrant, flavorful rice dishes cooked to perfection', displayOrder: 1 } }),
    db.category.create({ data: { name: 'Ghanaian Favorites', slug: 'ghanaian-favorites', description: 'Beloved local classics that taste like home', displayOrder: 2 } }),
    db.category.create({ data: { name: 'Chicken & Protein', slug: 'chicken-protein', description: 'Grilled, fried and smoked perfection', displayOrder: 3 } }),
    db.category.create({ data: { name: 'Fast Meals', slug: 'fast-meals', description: 'Quick, satisfying bites when you\'re on the go', displayOrder: 4 } }),
    db.category.create({ data: { name: 'Sides', slug: 'sides', description: 'Perfect accompaniments to complete your meal', displayOrder: 5 } }),
    db.category.create({ data: { name: 'Drinks', slug: 'drinks', description: 'Refreshing beverages from local to classic', displayOrder: 6 } }),
    db.category.create({ data: { name: 'Desserts', slug: 'desserts', description: 'Sweet endings to every great meal', displayOrder: 7 } }),
  ]);

  // Image path helper - uses local public/images/ paths
  const img = (path: string) => path;

  // ==========================================
  // MENU ITEMS - 48+ items across 8 categories
  // ==========================================
  const menuItemsData = [
    // === BREAKFAST (7 items) ===
    { name: 'Tea, Bread & Egg', slug: 'tea-bread-egg', description: 'The classic Ghanaian breakfast — hot Lipton tea, fresh soft bread and golden fried eggs. Simple, satisfying, and exactly how Grandma made it.', price: 15, image: img('/images/breakfast/tea-bread-egg.png'), isPopular: true, preparationTime: 10, ingredients: 'Tea, bread, eggs, vegetable oil', categoryId: categories[0].id },
    { name: 'Omelette & Toast', slug: 'omelette-toast', description: 'Fluffy three-egg omelette loaded with onion, tomato and green pepper, served with buttered toast. A hearty morning boost.', price: 20, image: img('/images/breakfast/omelette-toast.jpg'), isPopular: false, preparationTime: 12, ingredients: 'Eggs, bread, butter, onion, tomato, green pepper', categoryId: categories[0].id },
    { name: 'Hausa Koko & Koose', slug: 'hausa-koko-koose', description: 'Traditional spiced millet porridge paired with crispy bean fritters — a Northern Ghana breakfast staple that\'s filling and full of flavor.', price: 12, image: img('/images/breakfast/hausa-koko-koose.jpg'), isPopular: true, preparationTime: 5, ingredients: 'Millet, beans, pepper, onion, ginger, spices', categoryId: categories[0].id },
    { name: 'Rice Water', slug: 'rice-water', description: 'Creamy rice porridge simmered with milk and sugar — light, comforting, and perfect for a gentle start to the day.', price: 10, image: img('/images/breakfast/rice-water.jpg'), isPopular: false, preparationTime: 8, ingredients: 'Rice, milk, sugar, nutmeg', categoryId: categories[0].id },
    { name: 'Pancakes', slug: 'pancakes', description: 'Fluffy golden buttermilk pancakes stacked high and drizzled with syrup. A sweet morning treat.', price: 25, image: img('/images/breakfast/pancakes.png'), isPopular: false, preparationTime: 15, ingredients: 'Flour, eggs, milk, sugar, butter, syrup', categoryId: categories[0].id },
    { name: 'Oats & Fruit', slug: 'oats-fruit', description: 'Warm oatmeal topped with fresh banana, apple slices and a drizzle of honey. Healthy and delicious.', price: 22, image: img('/images/breakfast/oats-fruit.jpg'), isPopular: false, preparationTime: 10, ingredients: 'Oats, milk, banana, apple, honey', categoryId: categories[0].id },
    { name: 'English Breakfast', slug: 'english-breakfast', description: 'A full plate: fried eggs, sausages, bacon, baked beans, grilled tomato and toast. When you\'re serious about breakfast.', price: 45, image: img('/images/breakfast/english-breakfast.jpg'), isPopular: true, preparationTime: 20, ingredients: 'Eggs, sausage, bacon, baked beans, toast, tomato', categoryId: categories[0].id },

    // === RICE MEALS (6 items) ===
    { name: 'Jollof Rice & Chicken', slug: 'jollof-rice-chicken', description: 'Smoky tomato-based rice with perfectly seasoned fried chicken — Ghana\'s most iconic dish, and the one we do best.', price: 45, image: img('/images/meals/jollof-rice-chicken.png'), isPopular: true, preparationTime: 25, ingredients: 'Rice, tomato, onion, pepper, chicken, vegetable oil, spices', categoryId: categories[1].id },
    { name: 'Fried Rice & Chicken', slug: 'fried-rice-chicken', description: 'Wok-tossed rice with mixed vegetables, egg and crispy fried chicken. Light, savory, and always satisfying.', price: 40, image: img('/images/meals/fried-rice-chicken.png'), isPopular: true, preparationTime: 20, ingredients: 'Rice, vegetables, egg, chicken, soy sauce, vegetable oil', categoryId: categories[1].id },
    { name: 'Plain Rice & Stew', slug: 'plain-rice-stew', description: 'Fluffy long-grain rice drenched in rich, slow-cooked tomato stew. Simple, honest, delicious.', price: 30, image: img('/images/meals/plain-rice-stew.png'), isPopular: false, preparationTime: 15, ingredients: 'Rice, tomato, onion, pepper, vegetable oil', categoryId: categories[1].id },
    { name: 'Jollof Rice & Grilled Chicken', slug: 'jollof-rice-grilled', description: 'Premium smoky jollof rice with succulent charcoal-grilled chicken — our most popular upgrade for good reason.', price: 55, image: img('/images/meals/jollof-rice-grilled.png'), isPopular: true, preparationTime: 30, ingredients: 'Rice, tomato, onion, pepper, chicken, vegetable oil, spices', categoryId: categories[1].id },
    { name: 'Vegetable Fried Rice', slug: 'vegetable-fried-rice', description: 'Colorful fried rice loaded with fresh carrots, green beans, sweet corn and bell pepper. Light, healthy, and packed with veggies.', price: 35, image: img('/images/meals/vegetable-fried-rice.png'), isPopular: false, preparationTime: 18, ingredients: 'Rice, carrots, green beans, corn, bell pepper, egg', categoryId: categories[1].id },
    { name: 'Rice & Grilled Tilapia', slug: 'rice-grilled-tilapia', description: 'Steamed rice with a whole grilled tilapia fish and spicy pepper sauce. Fresh from the grill to your plate.', price: 55, image: img('/images/meals/grilled-tilapia.png'), isPopular: false, preparationTime: 30, ingredients: 'Rice, tilapia, pepper, lemon, vegetable oil, spices', categoryId: categories[1].id },

    // === GHANAIAN FAVORITES (11 items) ===
    { name: 'Waakye Special', slug: 'waakye-special', description: 'Rice and beans cooked with millet leaves, served with shito, salad and your choice of protein. The ultimate campus lunch.', price: 30, image: img('/images/meals/waakye-special.png'), isPopular: true, preparationTime: 30, ingredients: 'Rice, beans, millet leaves, shito, vegetable salad', categoryId: categories[2].id },
    { name: 'Banku & Grilled Tilapia', slug: 'banku-grilled-tilapia', description: 'Smooth fermented corn and cassava dough paired with whole grilled tilapia and hot pepper sauce. A weekend favorite.', price: 55, image: img('/images/meals/banku-grilled-tilapia.png'), isPopular: true, preparationTime: 30, ingredients: 'Corn dough, cassava dough, tilapia, pepper, vegetable oil', categoryId: categories[2].id },
    { name: 'Banku & Okro Soup', slug: 'banku-okro-soup', description: 'Soft banku served with slimy okro soup and smoked fish — the comfort food that reminds you of home.', price: 35, image: img('/images/meals/banku-okro-soup.png'), isPopular: true, preparationTime: 20, ingredients: 'Corn dough, cassava dough, okro, palm oil, fish, pepper', categoryId: categories[2].id },
    { name: 'Fufu & Light Soup', slug: 'fufu-light-soup', description: 'Pounded cassava and plantain with aromatic goat light soup — rich, hearty, and deeply satisfying.', price: 40, image: img('/images/meals/fufu-light-soup.png'), isPopular: false, preparationTime: 25, ingredients: 'Cassava, plantain, goat meat, pepper, tomato, spices', categoryId: categories[2].id },
    { name: 'Fufu & Groundnut Soup', slug: 'fufu-groundnut-soup', description: 'Smooth pounded fufu with thick groundnut (peanut) soup loaded with tender chicken. Rich and nutty perfection.', price: 42, image: img('/images/meals/fufu-groundnut-soup.png'), isPopular: false, preparationTime: 25, ingredients: 'Cassava, plantain, groundnut paste, chicken, tomato', categoryId: categories[2].id },
    { name: 'Ampesi & Kontomire', slug: 'ampesi-kontomire', description: 'Boiled cassava and plantain with kontomire (cocoyam leaves) stew in palm oil. Traditional, nutritious, and deeply Ghanaian.', price: 28, image: img('/images/meals/ampesi-kontomire.png'), isPopular: false, preparationTime: 20, ingredients: 'Cassava, plantain, kontomire, palm oil, fish', categoryId: categories[2].id },
    { name: 'Red Red & Fried Plantain', slug: 'red-red-plantain', description: 'Black-eyed pea stew in palm oil with sweet fried plantain — a match made in Ghanaian food heaven.', price: 25, image: img('/images/meals/red-red-plantain.png'), isPopular: false, preparationTime: 20, ingredients: 'Black-eyed peas, palm oil, onion, pepper, plantain', categoryId: categories[2].id },
    { name: 'Kenkey & Fried Fish', slug: 'kenkey-fried-fish', description: 'Fermented corn dumpling wrapped in corn husk leaves with crispy fried fish and shito pepper sauce. A coastal classic.', price: 28, image: img('/images/meals/kenkey-fish.png'), isPopular: false, preparationTime: 20, ingredients: 'Corn dough, fish, pepper, vegetable oil', categoryId: categories[2].id },
    { name: 'Tuo Zaafi (TZ)', slug: 'tuo-zaafi', description: 'Corn and cassava meal served with dawadawa soup — a hearty Northern Ghana specialty that fills you up right.', price: 35, image: img('/images/meals/tuo-zaafi.png'), isPopular: false, preparationTime: 25, ingredients: 'Corn flour, cassava flour, dawadawa, leaf, meat', categoryId: categories[2].id },
    { name: 'Palava Sauce & Rice', slug: 'palava-sauce', description: 'Spinach and egusi (melon seed) stew served with fluffy rice — rich, green, and packed with nutrition.', price: 30, image: img('/images/meals/palava-sauce.png'), isPopular: false, preparationTime: 25, ingredients: 'Spinach, egusi, palm oil, fish, onion, pepper, rice', categoryId: categories[2].id },
    { name: 'Egusi Soup & Fufu', slug: 'egusi-soup', description: 'Thick, creamy melon seed soup with assorted meat and fish — the kind of soup that makes you close your eyes with every bite.', price: 35, image: img('/images/meals/egusi-soup.png'), isPopular: false, preparationTime: 25, ingredients: 'Egusi, palm oil, assorted meat, fish, pepper, cassava, plantain', categoryId: categories[2].id },

    // === CHICKEN & PROTEIN (6 items) ===
    { name: 'Grilled Chicken', slug: 'grilled-chicken', description: 'Succulent charcoal-grilled chicken marinated in ginger, garlic and Ghanaian spices. Smoky, juicy, and perfectly seasoned.', price: 50, image: img('/images/meals/grilled-chicken.png'), isPopular: true, preparationTime: 30, ingredients: 'Chicken, ginger, garlic, pepper, spices, vegetable oil', categoryId: categories[3].id },
    { name: 'Fried Chicken', slug: 'fried-chicken', description: 'Crispy golden fried chicken with our signature spicy seasoning. Crunchy on the outside, juicy on the inside.', price: 45, image: img('/images/meals/fried-chicken.png'), isPopular: false, preparationTime: 20, ingredients: 'Chicken, flour, pepper, spices, vegetable oil', categoryId: categories[3].id },
    { name: 'Chicken Wings', slug: 'chicken-wings', description: 'Crispy chicken wings tossed in spicy pepper sauce — the perfect shareable snack for friends.', price: 35, image: img('/images/meals/chicken-wings.png'), isPopular: true, preparationTime: 20, ingredients: 'Chicken wings, pepper sauce, flour, spices', categoryId: categories[3].id },
    { name: 'Grilled Tilapia', slug: 'grilled-tilapia', description: 'Whole tilapia grilled over charcoal with pepper sauce and a squeeze of lemon. Fresh, smoky, and irresistible.', price: 55, image: img('/images/meals/grilled-tilapia.png'), isPopular: false, preparationTime: 30, ingredients: 'Tilapia, pepper, lemon, vegetable oil, spices', categoryId: categories[3].id },
    { name: 'Suya Skewers', slug: 'suya-skewers', description: 'Spicy grilled beef skewers rolled in groundnut spice powder with sliced onion — West African street food at its finest.', price: 20, image: img('/images/meals/suya-skewers.png'), isPopular: true, preparationTime: 15, ingredients: 'Beef, suya spice, groundnut oil, onion, groundnuts', categoryId: categories[3].id },
    { name: 'Chichinga Kebab', slug: 'chichinga-kebab', description: 'Ghanaian-style grilled meat kebabs seasoned with suya spice and served with hot shito. The ultimate street food experience.', price: 18, image: img('/images/meals/chichinga.jpg'), isPopular: true, preparationTime: 15, ingredients: 'Beef, suya spice, onion, pepper, groundnut oil', categoryId: categories[3].id },

    // === FAST MEALS (5 items) ===
    { name: 'Yam Chips & Chicken', slug: 'yam-chips-chicken', description: 'Crispy fried yam chips with golden fried chicken — the Ghanaian answer to chips and chicken, and way better.', price: 30, image: img('/images/meals/yam-chips-chicken.png'), isPopular: false, preparationTime: 15, ingredients: 'Yam, chicken, vegetable oil, pepper', categoryId: categories[4].id },
    { name: 'Chicken Burger', slug: 'chicken-burger', description: 'Juicy grilled chicken breast in a soft bun with fresh lettuce, tomato and our special sauce. A campus favorite.', price: 35, image: img('/images/meals/chicken-burger.png'), isPopular: false, preparationTime: 15, ingredients: 'Chicken breast, bread, lettuce, tomato, sauce', categoryId: categories[4].id },
    { name: 'Kelewele', slug: 'kelewele', description: 'Spicy fried plantain cubes with ginger and pepper — Ghana\'s most addictive snack. You can\'t stop at one piece.', price: 15, image: img('/images/meals/kelewele.png'), isPopular: true, preparationTime: 10, ingredients: 'Plantain, ginger, pepper, vegetable oil', categoryId: categories[4].id },
    { name: 'Meat Pie', slug: 'meat-pie', description: 'Flaky golden pastry stuffed with seasoned minced meat — a classic on-the-go snack that never gets old.', price: 15, image: img('/images/extras/meat-pie.png'), isPopular: false, preparationTime: 10, ingredients: 'Flour, minced meat, egg, onion, spices', categoryId: categories[4].id },
    { name: 'Gari Foto on the Go', slug: 'gari-foto-go', description: 'Cassava flakes stir-fried with egg, onion and pepper — quick, filling, and uniquely Ghanaian.', price: 18, image: img('/images/extras/gari-foto.png'), isPopular: false, preparationTime: 10, ingredients: 'Gari, egg, onion, pepper, vegetable oil', categoryId: categories[4].id },

    // === SIDES (6 items) ===
    { name: 'Fried Plantain', slug: 'fried-plantain', description: 'Sweet ripe plantain fried to golden perfection — the perfect side to any Ghanaian meal.', price: 12, image: img('/images/extras/fried-plantain.png'), isPopular: false, preparationTime: 8, ingredients: 'Plantain, vegetable oil', categoryId: categories[5].id },
    { name: 'Shito', slug: 'shito', description: 'Ghanaian black pepper sauce with dried shrimp and onion — fiery, savory, and essential with every rice dish.', price: 5, image: img('/images/extras/shito.png'), isPopular: false, preparationTime: 0, ingredients: 'Pepper, dried shrimp, onion, vegetable oil', categoryId: categories[5].id },
    { name: 'Fried Egg', slug: 'fried-egg', description: 'Golden fried egg, cooked just right — a simple but essential addition to any meal.', price: 5, image: img('/images/extras/fried-egg.png'), isPopular: false, preparationTime: 5, ingredients: 'Egg, vegetable oil', categoryId: categories[5].id },
    { name: 'Gari Foto', slug: 'gari-foto', description: 'Cassava flakes stir-fried with egg, onion, and pepper — a satisfying side that doubles as a light meal.', price: 18, image: img('/images/extras/gari-foto.png'), isPopular: false, preparationTime: 10, ingredients: 'Gari, egg, onion, pepper, vegetable oil', categoryId: categories[5].id },
    { name: 'Coleslaw', slug: 'coleslaw', description: 'Fresh creamy coleslaw with shredded cabbage and carrots — a cool, crunchy contrast to spicy mains.', price: 8, image: img('/images/extras/coleslaw.jpg'), isPopular: false, preparationTime: 2, ingredients: 'Cabbage, carrot, mayonnaise', categoryId: categories[5].id },
    { name: 'Salad', slug: 'salad', description: 'Fresh mixed vegetable salad with lettuce, tomato, onion and cucumber. Light and refreshing.', price: 10, image: img('/images/extras/coleslaw.jpg'), isPopular: false, preparationTime: 2, ingredients: 'Lettuce, tomato, onion, cucumber, salad dressing', categoryId: categories[5].id },

    // === DRINKS (10 items) ===
    { name: 'Sobolo', slug: 'sobolo', description: 'Refreshing hibiscus drink infused with ginger and pineapple — naturally cooling, beautifully ruby-red, and packed with vitamin C.', price: 8, image: img('/images/drinks/sobolo.png'), isPopular: true, preparationTime: 2, ingredients: 'Hibiscus, ginger, pineapple, sugar', categoryId: categories[6].id },
    { name: 'Pineapple Juice', slug: 'pineapple-juice', description: 'Freshly squeezed pineapple juice — sweet, tangy, and tropical. Pure sunshine in a glass.', price: 15, image: img('/images/drinks/pineapple-juice.png'), isPopular: false, preparationTime: 5, ingredients: 'Pineapple, sugar, water', categoryId: categories[6].id },
    { name: 'Mango Juice', slug: 'mango-juice', description: 'Fresh mango juice blended smooth — thick, creamy, and bursting with tropical flavor.', price: 15, image: img('/images/drinks/mango-juice.png'), isPopular: false, preparationTime: 5, ingredients: 'Mango, sugar, water', categoryId: categories[6].id },
    { name: 'Bottled Water', slug: 'bottled-water', description: 'Pure refreshing water — because staying hydrated matters, even when the jollof is spicy.', price: 5, image: img('/images/drinks/bottled-water.png'), isPopular: false, preparationTime: 0, ingredients: 'Water', categoryId: categories[6].id },
    { name: 'Malt', slug: 'malt', description: 'Chilled malt drink — rich, smooth and refreshing. The perfect non-alcoholic companion to any meal.', price: 10, image: img('/images/drinks/malt-drink.png'), isPopular: false, preparationTime: 0, ingredients: 'Malt, sugar, water', categoryId: categories[6].id },
    { name: 'Palm Wine', slug: 'palm-wine', description: 'Traditional palm wine tapped fresh from the palm tree — a mildly sweet, naturally fermented Ghanaian classic.', price: 12, image: img('/images/drinks/palm-wine.jpg'), isPopular: false, preparationTime: 0, ingredients: 'Palm sap', categoryId: categories[6].id },
    { name: 'Asaana', slug: 'asaana', description: 'Sweet fermented corn drink served chilled — a traditional Ghanaian beverage with a unique tangy twist.', price: 8, image: img('/images/drinks/asaana.jpg'), isPopular: false, preparationTime: 0, ingredients: 'Fermented corn, sugar, water', categoryId: categories[6].id },
    { name: 'Fan Yogo', slug: 'fan-yogo', description: 'Frozen yogurt drink in strawberry or vanilla flavor — creamy, cold, and perfect for a hot Kumasi afternoon.', price: 10, image: img('/images/drinks/fan-yogo.jpg'), isPopular: false, preparationTime: 0, ingredients: 'Yogurt, sugar, fruit flavor', categoryId: categories[6].id },
    { name: 'Fan Choco', slug: 'fan-choco', description: 'Chocolate milk drink — rich, creamy, and loved by every Ghanaian since childhood. The ultimate comfort drink.', price: 8, image: img('/images/drinks/fan-choco.png'), isPopular: false, preparationTime: 0, ingredients: 'Milk, cocoa, sugar', categoryId: categories[6].id },
    { name: 'Iced Coffee', slug: 'iced-coffee', description: 'Cold brewed coffee served over ice — strong, smooth, and the perfect pick-me-up for early lectures.', price: 15, image: img('/images/drinks/iced-coffee.jpg'), isPopular: false, preparationTime: 3, ingredients: 'Coffee, milk, sugar, ice', categoryId: categories[6].id },

    // === DESSERTS (4 items) ===
    { name: 'Chocolate Cake', slug: 'chocolate-cake', description: 'Rich, moist chocolate cake slice with velvety chocolate frosting — indulgence you deserve after a good meal.', price: 30, image: img('/images/desserts/chocolate-cake.png'), isPopular: false, preparationTime: 5, ingredients: 'Flour, cocoa, sugar, eggs, butter', categoryId: categories[7].id },
    { name: 'Brownie', slug: 'brownie', description: 'Fudgy chocolate brownie with a crackly top — dense, chocolatey, and dangerously addictive.', price: 25, image: img('/images/desserts/brownie.png'), isPopular: false, preparationTime: 5, ingredients: 'Flour, cocoa, sugar, eggs, butter', categoryId: categories[7].id },
    { name: 'Fruit Salad', slug: 'fruit-salad', description: 'Fresh seasonal fruits — watermelon, pineapple, banana, apple and mango. Light, healthy, and naturally sweet.', price: 20, image: img('/images/desserts/fruit-salad.png'), isPopular: false, preparationTime: 5, ingredients: 'Watermelon, pineapple, banana, apple, mango', categoryId: categories[7].id },
    { name: 'Ice Cream', slug: 'ice-cream', description: 'Creamy scoops of vanilla and chocolate ice cream — the cool finish every Ghanaian meal deserves on a hot day.', price: 18, image: img('/images/desserts/ice-cream.jpg'), isPopular: false, preparationTime: 2, ingredients: 'Milk, cream, sugar, vanilla, cocoa', categoryId: categories[7].id },
  ];

  const menuItems = [];
  for (const item of menuItemsData) {
    const created = await db.menuItem.create({ data: item });
    menuItems.push(created);
  }
  console.log(`✅ ${menuItems.length} menu items created`);

  // Add extras to popular items
  const jollofItem = menuItems.find(i => i.slug === 'jollof-rice-chicken')!;
  const bankuItem = menuItems.find(i => i.slug === 'banku-okro-soup')!;
  const waakyeItem = menuItems.find(i => i.slug === 'waakye-special')!;
  const grilledChickenItem = menuItems.find(i => i.slug === 'grilled-chicken')!;

  const extrasData = [
    // Jollof extras
    { name: 'Extra Chicken', price: 10, menuItemId: jollofItem.id },
    { name: 'Extra Egg', price: 5, menuItemId: jollofItem.id },
    { name: 'Extra Plantain', price: 5, menuItemId: jollofItem.id },
    { name: 'Extra Sauce', price: 3, menuItemId: jollofItem.id },
    { name: 'Large Portion', price: 15, menuItemId: jollofItem.id },
    // Banku extras
    { name: 'Extra Fish', price: 10, menuItemId: bankuItem.id },
    { name: 'Extra Okro', price: 3, menuItemId: bankuItem.id },
    { name: 'Large Portion', price: 15, menuItemId: bankuItem.id },
    // Waakye extras
    { name: 'Extra Protein', price: 10, menuItemId: waakyeItem.id },
    { name: 'Extra Shito', price: 3, menuItemId: waakyeItem.id },
    { name: 'Large Portion', price: 15, menuItemId: waakyeItem.id },
    // Grilled Chicken extras
    { name: 'Extra Wing', price: 8, menuItemId: grilledChickenItem.id },
    { name: 'Side Salad', price: 5, menuItemId: grilledChickenItem.id },
  ];
  await db.menuItemExtra.createMany({ data: extrasData });
  console.log('✅ Menu item extras created');

  // Sample customers
  const customers = await Promise.all([
    db.customer.create({ data: { name: 'Kwame Asante', phone: '0244567890', email: 'kwame@email.com' } }),
    db.customer.create({ data: { name: 'Ama Mensah', phone: '0201234567', email: 'ama@email.com' } }),
    db.customer.create({ data: { name: 'Kofi Boateng', phone: '0277890123' } }),
    db.customer.create({ data: { name: 'Abena Osei', phone: '0503456789', email: 'abena@email.com' } }),
    db.customer.create({ data: { name: 'Yaw Adjei', phone: '0567890123' } }),
  ]);

  // Sample orders
  const statuses = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'];
  const types = ['DELIVERY', 'PICKUP'];
  const paymentMethods = ['CASH_ON_DELIVERY', 'PAY_ON_PICKUP'];

  const now = new Date();
  const orders = [];
  for (let i = 0; i < 25; i++) {
    const customer = customers[i % customers.length];
    const status = statuses[i < 2 ? 0 : i < 5 ? 1 : i < 8 ? 2 : i < 12 ? 3 : i < 16 ? 4 : i < 20 ? 5 : i < 24 ? 6 : 6];
    const type = types[i % 2];
    const item1 = menuItems[i % menuItems.length];
    const item2 = menuItems[(i + 5) % menuItems.length];
    const qty1 = (i % 3) + 1;
    const qty2 = (i % 2) + 1;
    const subtotal = (item1.price * qty1) + (item2.price * qty2);
    const deliveryFee = type === 'DELIVERY' ? (subtotal >= 100 ? 0 : 10) : 0;
    const total = subtotal + deliveryFee;
    const daysAgo = Math.floor(i / 2);
    const orderDate = new Date(now.getTime() - daysAgo * 86400000);
    const orderNumber = `DP-${1001 + i}`;
    const orderToken = randomUUID();

    const order = await db.order.create({
      data: {
        orderNumber,
        customerId: customer.id,
        type,
        status,
        subtotal,
        deliveryFee,
        discount: 0,
        total,
        deliveryAddress: type === 'DELIVERY' ? 'KNUST Campus, Kumasi' : null,
        deliveryNotes: type === 'DELIVERY' ? 'Call on arrival' : null,
        paymentMethod: paymentMethods[i % 2],
        orderToken,
        createdAt: orderDate,
        updatedAt: orderDate,
        items: {
          create: [
            { menuItemId: item1.id, name: item1.name, price: item1.price, quantity: qty1 },
            { menuItemId: item2.id, name: item2.name, price: item2.price, quantity: qty2 },
          ],
        },
        statusHistory: {
          create: [
            { status: 'PENDING', createdAt: orderDate },
            ...(status !== 'PENDING' && status !== 'CANCELLED' ? [{ status: 'CONFIRMED', createdAt: new Date(orderDate.getTime() + 300000), changedBy: admin.name }] : []),
            ...(status !== 'PENDING' && status !== 'CONFIRMED' && status !== 'CANCELLED' ? [{ status: 'PREPARING', createdAt: new Date(orderDate.getTime() + 600000), changedBy: admin.name }] : []),
            ...(status === 'READY' || status === 'OUT_FOR_DELIVERY' || status === 'DELIVERED' ? [{ status: 'READY', createdAt: new Date(orderDate.getTime() + 1800000), changedBy: admin.name }] : []),
            ...(status === 'OUT_FOR_DELIVERY' || status === 'DELIVERED' ? [{ status: 'OUT_FOR_DELIVERY', createdAt: new Date(orderDate.getTime() + 2100000), changedBy: admin.name }] : []),
            ...(status === 'DELIVERED' ? [{ status: 'DELIVERED', createdAt: new Date(orderDate.getTime() + 3600000), changedBy: admin.name }] : []),
          ],
        },
      },
    });
    orders.push(order);
  }
  console.log(`✅ ${orders.length} orders created`);

  // Testimonials
  await db.testimonial.createMany({
    data: [
      { name: 'Adwoa Prempeh', text: "The jollof rice here is unbeatable — smoky, perfectly spiced, and the chicken is always tender. DidiPa is my go-to spot on campus!", rating: 5 },
      { name: 'Kwabena Owusu', text: "Banku and okro soup tastes just like my mother's cooking. Always hot, always fresh. I order every single weekend!", rating: 5 },
      { name: 'Akua Boateng', text: 'Waakye special is loaded and the shito is fiery perfection. Best waakye on KNUST campus, no debate — DidiPa wins hands down!', rating: 5 },
      { name: 'Emmanuel Agyeman', text: 'The grilled tilapia is always fresh and perfectly seasoned. Delivery is quick too — usually under 30 minutes to my hostel.', rating: 4 },
      { name: 'Serwaa Mensah', text: 'Love the variety! From kelewele to suya, everything hits the spot. The sobolo is amazing too — so refreshing after a long day of lectures.', rating: 4 },
      { name: 'Kojo Asante', text: "DidiPa never disappoints. The Hausa Koko in the morning is the perfect start to my day. Great portions and always affordable!", rating: 5 },
      { name: 'Efua Darkwa', text: 'I tried the English breakfast and it was huge — worth every cedi. The pancakes are fluffy perfection too. Highly recommend for breakfast!', rating: 4 },
      { name: 'Nana Kwame', text: 'The chichinga kebabs are dangerously good — I always order extra. DidiPa knows how to do street food right!', rating: 5 },
    ],
  });
  console.log('✅ Testimonials created');

  console.log('🎉 Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
