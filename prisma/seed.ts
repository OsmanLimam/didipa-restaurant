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
      email: 'admin@mamaskitchen.com',
      name: 'Admin',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });
  console.log('✅ Admin user created');

  // Create restaurant
  const restaurant = await db.restaurant.create({
    data: {
      name: "Mama's Kitchen",
      description: 'Fresh Ghanaian food, made to order. From smoky jollof rice to comforting banku & okro soup, every dish is prepared with love and tradition.',
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
    { dayOfWeek: 1, openTime: '09:00', closeTime: '21:00', isClosed: false, restaurantId: restaurant.id },
    { dayOfWeek: 2, openTime: '09:00', closeTime: '21:00', isClosed: false, restaurantId: restaurant.id },
    { dayOfWeek: 3, openTime: '09:00', closeTime: '21:00', isClosed: false, restaurantId: restaurant.id },
    { dayOfWeek: 4, openTime: '09:00', closeTime: '21:00', isClosed: false, restaurantId: restaurant.id },
    { dayOfWeek: 5, openTime: '09:00', closeTime: '21:00', isClosed: false, restaurantId: restaurant.id },
    { dayOfWeek: 6, openTime: '09:00', closeTime: '21:00', isClosed: false, restaurantId: restaurant.id },
  ];
  await db.restaurantHours.createMany({ data: hoursData });
  console.log('✅ Restaurant hours created');

  // Categories
  const categories = await Promise.all([
    db.category.create({ data: { name: 'Breakfast', slug: 'breakfast', description: 'Start your day right', displayOrder: 0 } }),
    db.category.create({ data: { name: 'Rice Meals', slug: 'rice-meals', description: 'Fragrant and flavorful', displayOrder: 1 } }),
    db.category.create({ data: { name: 'Ghanaian Favorites', slug: 'ghanaian-favorites', description: 'Beloved local classics', displayOrder: 2 } }),
    db.category.create({ data: { name: 'Chicken & Protein', slug: 'chicken-protein', description: 'Grilled and fried perfection', displayOrder: 3 } }),
    db.category.create({ data: { name: 'Fast Meals', slug: 'fast-meals', description: 'Quick and satisfying', displayOrder: 4 } }),
    db.category.create({ data: { name: 'Sides', slug: 'sides', description: 'Perfect accompaniments', displayOrder: 5 } }),
    db.category.create({ data: { name: 'Drinks', slug: 'drinks', description: 'Refreshing beverages', displayOrder: 6 } }),
    db.category.create({ data: { name: 'Desserts', slug: 'desserts', description: 'Sweet endings', displayOrder: 7 } }),
  ]);

  // Local image paths
  const img = (path: string) => path;

  // Menu items
  const menuItemsData = [
    // === BREAKFAST ===
    { name: 'Tea, Bread & Egg', slug: 'tea-bread-egg', description: 'Classic Ghanaian breakfast with hot tea, fresh bread and fried eggs', price: 15, image: img('/images/breakfast/tea-bread-egg.png'), isPopular: false, preparationTime: 10, ingredients: 'Tea, bread, eggs', categoryId: categories[0].id },
    { name: 'Omelette & Toast', slug: 'omelette-toast', description: 'Fluffy omelette with toasted bread and butter', price: 20, image: img('/images/breakfast/tea-bread-egg.png'), isPopular: false, preparationTime: 12, ingredients: 'Eggs, bread, butter, onion, pepper', categoryId: categories[0].id },
    { name: 'Hausa Koko & Koose', slug: 'hausa-koko-koose', description: 'Traditional millet porridge with spicy bean fritters — a Northern Ghana breakfast staple', price: 12, image: img('/images/breakfast/tea-bread-egg.png'), isPopular: true, preparationTime: 5, ingredients: 'Millet, beans, pepper, onion, spices', categoryId: categories[0].id },
    { name: 'Pancakes', slug: 'pancakes', description: 'Fluffy golden pancakes served with syrup and butter', price: 25, image: img('/images/breakfast/pancakes.png'), isPopular: false, preparationTime: 15, ingredients: 'Flour, eggs, milk, sugar, butter', categoryId: categories[0].id },
    { name: 'Oats & Fruit', slug: 'oats-fruit', description: 'Warm oatmeal topped with fresh seasonal fruits and honey', price: 22, image: img('/images/breakfast/pancakes.png'), isPopular: false, preparationTime: 10, ingredients: 'Oats, milk, banana, apple, honey', categoryId: categories[0].id },
    { name: 'English Breakfast', slug: 'english-breakfast', description: 'Full breakfast with eggs, sausage, bacon, beans, toast and grilled tomato', price: 45, image: img('/images/breakfast/pancakes.png'), isPopular: true, preparationTime: 20, ingredients: 'Eggs, sausage, bacon, baked beans, toast, tomato', categoryId: categories[0].id },

    // === RICE MEALS ===
    { name: 'Jollof Rice & Chicken', slug: 'jollof-rice-chicken', description: "Smoky tomato-based rice paired with perfectly grilled chicken — Ghana's most iconic dish", price: 45, image: img('/images/meals/jollof-rice-chicken.png'), isPopular: true, preparationTime: 25, ingredients: 'Rice, tomato, onion, pepper, chicken, vegetable oil, spices', categoryId: categories[1].id },
    { name: 'Fried Rice & Chicken', slug: 'fried-rice-chicken', description: 'Wok-tossed rice with mixed vegetables, egg and crispy fried chicken', price: 40, image: img('/images/meals/fried-rice-chicken.png'), isPopular: true, preparationTime: 20, ingredients: 'Rice, vegetables, egg, chicken, soy sauce, vegetable oil', categoryId: categories[1].id },
    { name: 'Plain Rice & Stew', slug: 'plain-rice-stew', description: 'Fluffy long grain rice with rich tomato stew', price: 30, image: img('/images/meals/plain-rice-stew.png'), isPopular: false, preparationTime: 15, ingredients: 'Rice, tomato, onion, pepper, vegetable oil', categoryId: categories[1].id },
    { name: 'Jollof Rice & Grilled Chicken', slug: 'jollof-rice-grilled', description: 'Premium smoky jollof rice with succulent charcoal-grilled chicken', price: 55, image: img('/images/meals/jollof-rice-grilled.png'), isPopular: true, preparationTime: 30, ingredients: 'Rice, tomato, onion, pepper, chicken, vegetable oil, spices', categoryId: categories[1].id },
    { name: 'Vegetable Fried Rice', slug: 'vegetable-fried-rice', description: 'Light and healthy fried rice loaded with fresh mixed vegetables', price: 35, image: img('/images/meals/vegetable-fried-rice.png'), isPopular: false, preparationTime: 18, ingredients: 'Rice, carrots, green beans, corn, bell pepper, egg', categoryId: categories[1].id },

    // === GHANAIAN FAVORITES ===
    { name: 'Waakye Special', slug: 'waakye-special', description: 'Rice and beans cooked with millet leaves, served with shito, salad and your choice of protein', price: 30, image: img('/images/meals/waakye-special.png'), isPopular: true, preparationTime: 30, ingredients: 'Rice, beans, millet leaves, shito, vegetable salad', categoryId: categories[2].id },
    { name: 'Banku & Grilled Tilapia', slug: 'banku-grilled-tilapia', description: 'Fermented corn and cassava dough with whole grilled tilapia and pepper sauce', price: 55, image: img('/images/meals/banku-grilled-tilapia.png'), isPopular: true, preparationTime: 30, ingredients: 'Corn dough, cassava dough, tilapia, pepper, vegetable oil', categoryId: categories[2].id },
    { name: 'Banku & Okro Soup', slug: 'banku-okro-soup', description: 'Fermented corn and cassava dough served with slimy okro soup — a comfort food classic', price: 35, image: img('/images/meals/banku-okro-soup.png'), isPopular: true, preparationTime: 20, ingredients: 'Corn dough, cassava dough, okro, palm oil, fish, pepper', categoryId: categories[2].id },
    { name: 'Fufu & Light Soup', slug: 'fufu-light-soup', description: 'Pounded cassava and plantain with aromatic goat light soup', price: 40, image: img('/images/meals/fufu-light-soup.png'), isPopular: false, preparationTime: 25, ingredients: 'Cassava, plantain, goat meat, pepper, tomato, spices', categoryId: categories[2].id },
    { name: 'Fufu & Groundnut Soup', slug: 'fufu-groundnut-soup', description: 'Pounded cassava and plantain with rich groundnut (peanut) soup', price: 42, image: img('/images/meals/fufu-groundnut-soup.png'), isPopular: false, preparationTime: 25, ingredients: 'Cassava, plantain, groundnut paste, chicken, tomato', categoryId: categories[2].id },
    { name: 'Ampesi & Kontomire', slug: 'ampesi-kontomire', description: 'Boiled cassava and plantain served with kontomire (cocoyam leaves) stew', price: 28, image: img('/images/meals/ampesi-kontomire.png'), isPopular: false, preparationTime: 20, ingredients: 'Cassava, plantain, kontomire, palm oil, fish', categoryId: categories[2].id },
    { name: 'Red Red & Fried Plantain', slug: 'red-red-plantain', description: 'Black-eyed peas stew in palm oil served with sweet fried plantain', price: 25, image: img('/images/meals/red-red-plantain.png'), isPopular: false, preparationTime: 20, ingredients: 'Black-eyed peas, palm oil, onion, pepper, plantain', categoryId: categories[2].id },
    { name: 'Kenkey & Fried Fish', slug: 'kenkey-fried-fish', description: 'Fermented corn dumpling wrapped in leaves with crispy fried fish and pepper sauce', price: 28, image: img('/images/meals/kenkey-fish.png'), isPopular: false, preparationTime: 20, ingredients: 'Corn dough, fish, pepper, vegetable oil', categoryId: categories[2].id },
    { name: 'Tuo Zaafi', slug: 'tuo-zaafi', description: 'Corn and cassava meal with dawadawa soup — Northern Ghana specialty', price: 35, image: img('/images/meals/tuo-zaafi.png'), isPopular: false, preparationTime: 25, ingredients: 'Corn flour, cassava flour, dawadawa, leaf, meat', categoryId: categories[2].id },
    { name: 'Palava Sauce & Rice', slug: 'palava-sauce', description: 'Spinach and egusi stew served with fluffy rice — rich and nutritious', price: 30, image: img('/images/meals/palava-sauce.png'), isPopular: false, preparationTime: 25, ingredients: 'Spinach, egusi, palm oil, fish, onion, pepper, rice', categoryId: categories[2].id },
    { name: 'Egusi Soup', slug: 'egusi-soup', description: 'Melon seed soup with assorted meat and fish — thick, rich, and satisfying', price: 35, image: img('/images/meals/egusi-soup.png'), isPopular: false, preparationTime: 25, ingredients: 'Egusi, palm oil, assorted meat, fish, pepper', categoryId: categories[2].id },
    { name: 'Groundnut Soup', slug: 'groundnut-soup', description: 'Rich peanut soup with tender chicken — perfect with rice or fufu', price: 32, image: img('/images/meals/groundnut-soup.png'), isPopular: false, preparationTime: 25, ingredients: 'Groundnut paste, chicken, tomato, onion, pepper', categoryId: categories[2].id },

    // === CHICKEN & PROTEIN ===
    { name: 'Grilled Chicken', slug: 'grilled-chicken', description: 'Succulent charcoal-grilled chicken seasoned with Ghanaian spices', price: 50, image: img('/images/meals/grilled-chicken.png'), isPopular: true, preparationTime: 30, ingredients: 'Chicken, ginger, garlic, pepper, spices, vegetable oil', categoryId: categories[3].id },
    { name: 'Fried Chicken', slug: 'fried-chicken', description: 'Crispy golden fried chicken with spicy seasoning', price: 45, image: img('/images/meals/fried-chicken.png'), isPopular: false, preparationTime: 20, ingredients: 'Chicken, flour, pepper, spices, vegetable oil', categoryId: categories[3].id },
    { name: 'Chicken Wings', slug: 'chicken-wings', description: 'Crispy chicken wings tossed in spicy pepper sauce', price: 35, image: img('/images/meals/chicken-wings.png'), isPopular: true, preparationTime: 20, ingredients: 'Chicken wings, pepper sauce, flour, spices', categoryId: categories[3].id },
    { name: 'Grilled Tilapia', slug: 'grilled-tilapia', description: 'Whole tilapia grilled to perfection with pepper sauce and lemon', price: 55, image: img('/images/meals/grilled-tilapia.png'), isPopular: false, preparationTime: 30, ingredients: 'Tilapia, pepper, lemon, vegetable oil, spices', categoryId: categories[3].id },
    { name: 'Suya Skewers', slug: 'suya-skewers', description: 'Spicy grilled beef skewers with groundnut spice and onion — West African street food at its finest', price: 20, image: img('/images/meals/suya-skewers.png'), isPopular: true, preparationTime: 15, ingredients: 'Beef, suya spice, groundnut oil, onion, groundnuts', categoryId: categories[3].id },

    // === FAST MEALS ===
    { name: 'Yam Chips & Chicken', slug: 'yam-chips-chicken', description: 'Crispy fried yam chips with golden fried chicken', price: 30, image: img('/images/meals/yam-chips-chicken.png'), isPopular: false, preparationTime: 15, ingredients: 'Yam, chicken, vegetable oil, pepper', categoryId: categories[4].id },
    { name: 'Chicken Burger', slug: 'chicken-burger', description: 'Juicy grilled chicken breast in a soft bun with lettuce, tomato and special sauce', price: 35, image: img('/images/meals/chicken-burger.png'), isPopular: false, preparationTime: 15, ingredients: 'Chicken breast, bread, lettuce, tomato, sauce', categoryId: categories[4].id },
    { name: 'Kelewele', slug: 'kelewele', description: "Spicy fried plantain cubes with ginger and pepper — Ghana's favorite snack", price: 15, image: img('/images/meals/kelewele.png'), isPopular: true, preparationTime: 10, ingredients: 'Plantain, ginger, pepper, vegetable oil', categoryId: categories[4].id },
    { name: 'Meat Pie', slug: 'meat-pie', description: 'Flaky pastry filled with seasoned minced meat — a classic snack', price: 15, image: img('/images/extras/meat-pie.png'), isPopular: false, preparationTime: 10, ingredients: 'Flour, minced meat, egg, onion, spices', categoryId: categories[4].id },

    // === SIDES ===
    { name: 'Fried Plantain', slug: 'fried-plantain', description: 'Sweet ripe plantain fried to golden perfection', price: 12, image: img('/images/extras/fried-plantain.png'), isPopular: false, preparationTime: 8, ingredients: 'Plantain, vegetable oil', categoryId: categories[5].id },
    { name: 'Shito', slug: 'shito', description: 'Ghanaian black pepper sauce with dried shrimp — spicy and flavorful', price: 5, image: img('/images/extras/shito.png'), isPopular: false, preparationTime: 0, ingredients: 'Pepper, dried shrimp, onion, vegetable oil', categoryId: categories[5].id },
    { name: 'Fried Egg', slug: 'fried-egg', description: 'Golden fried egg, cooked just right', price: 5, image: img('/images/extras/fried-egg.png'), isPopular: false, preparationTime: 5, ingredients: 'Egg, vegetable oil', categoryId: categories[5].id },
    { name: 'Gari Foto', slug: 'gari-foto', description: 'Cassava flakes stir-fried with egg, onion, and pepper', price: 18, image: img('/images/extras/gari-foto.png'), isPopular: false, preparationTime: 10, ingredients: 'Gari, egg, onion, pepper, vegetable oil', categoryId: categories[5].id },
    { name: 'Coleslaw', slug: 'coleslaw', description: 'Fresh creamy coleslaw with shredded cabbage and carrots', price: 8, image: img('/images/extras/shito.png'), isPopular: false, preparationTime: 2, ingredients: 'Cabbage, carrot, mayonnaise', categoryId: categories[5].id },

    // === DRINKS ===
    { name: 'Sobolo', slug: 'sobolo', description: 'Refreshing hibiscus drink with ginger and pineapple — naturally cooling', price: 8, image: img('/images/drinks/sobolo.png'), isPopular: true, preparationTime: 2, ingredients: 'Hibiscus, ginger, pineapple, sugar', categoryId: categories[6].id },
    { name: 'Pineapple Juice', slug: 'pineapple-juice', description: 'Freshly squeezed pineapple juice — sweet and tangy', price: 15, image: img('/images/drinks/pineapple-juice.png'), isPopular: false, preparationTime: 5, ingredients: 'Pineapple, sugar, water', categoryId: categories[6].id },
    { name: 'Mango Juice', slug: 'mango-juice', description: 'Fresh mango juice — tropical and refreshing', price: 15, image: img('/images/drinks/mango-juice.png'), isPopular: false, preparationTime: 5, ingredients: 'Mango, sugar, water', categoryId: categories[6].id },
    { name: 'Bottled Water', slug: 'bottled-water', description: 'Pure refreshing water', price: 5, image: img('/images/drinks/bottled-water.png'), isPopular: false, preparationTime: 0, ingredients: 'Water', categoryId: categories[6].id },
    { name: 'Malt', slug: 'malt', description: 'Chilled malt drink — rich, smooth and refreshing', price: 10, image: img('/images/drinks/malt-drink.png'), isPopular: false, preparationTime: 0, ingredients: 'Malt, sugar, water', categoryId: categories[6].id },

    // === DESSERTS ===
    { name: 'Chocolate Cake', slug: 'chocolate-cake', description: 'Rich moist chocolate cake slice with chocolate frosting', price: 30, image: img('/images/desserts/chocolate-cake.png'), isPopular: false, preparationTime: 5, ingredients: 'Flour, cocoa, sugar, eggs, butter', categoryId: categories[7].id },
    { name: 'Brownie', slug: 'brownie', description: 'Fudgy chocolate brownie with a crackly top', price: 25, image: img('/images/desserts/brownie.png'), isPopular: false, preparationTime: 5, ingredients: 'Flour, cocoa, sugar, eggs, butter', categoryId: categories[7].id },
    { name: 'Fruit Salad', slug: 'fruit-salad', description: 'Fresh seasonal fruits — healthy and refreshing', price: 20, image: img('/images/desserts/fruit-salad.png'), isPopular: false, preparationTime: 5, ingredients: 'Watermelon, pineapple, banana, apple, mango', categoryId: categories[7].id },
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

  const extrasData = [
    { name: 'Extra Chicken', price: 10, menuItemId: jollofItem.id },
    { name: 'Extra Egg', price: 5, menuItemId: jollofItem.id },
    { name: 'Extra Plantain', price: 5, menuItemId: jollofItem.id },
    { name: 'Extra Sauce', price: 3, menuItemId: jollofItem.id },
    { name: 'Large Portion', price: 15, menuItemId: jollofItem.id },
    { name: 'Extra Fish', price: 10, menuItemId: bankuItem.id },
    { name: 'Extra Okro', price: 3, menuItemId: bankuItem.id },
    { name: 'Large Portion', price: 15, menuItemId: bankuItem.id },
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
    const orderNumber = `MK-${1001 + i}`;
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
      { name: 'Adwoa Prempeh', text: "The jollof rice here is unbeatable — smoky, perfectly spiced, and the chicken is always tender. Mama's Kitchen is my go-to!", rating: 5 },
      { name: 'Kwabena Owusu', text: "Banku and okro soup tastes just like my mother's cooking. Always hot, always fresh. I order every weekend!", rating: 5 },
      { name: 'Akua Boateng', text: 'Waakye special is loaded and the shito is fiery perfection. Best waakye on KNUST campus, no debate!', rating: 5 },
      { name: 'Emmanuel Agyeman', text: 'The grilled tilapia is always fresh and perfectly seasoned. Delivery is quick too — usually under 30 minutes.', rating: 4 },
      { name: 'Serwaa Mensah', text: 'Love the variety! From kelewele to suya, everything hits the spot. The sobolo is amazing too.', rating: 4 },
      { name: 'Kojo Asante', text: "Mama's Kitchen never disappoints. The Hausa Koko in the morning is the perfect start to my day. Great portions!", rating: 5 },
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
