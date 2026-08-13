import { db } from '../src/lib/db';
import { hash, compare } from 'bcryptjs';
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
      name: "DidiPa",
      description: 'A modern restaurant serving delicious local and contemporary meals with convenient ordering and delivery. From the rich flavors of Jollof Rice to the comforting warmth of Light Soup, every dish tells the story of home. Taste the Difference.',
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
    db.category.create({ data: { name: 'Local Favorites', slug: 'local-favorites', description: 'Beloved Ghanaian classics', displayOrder: 0 } }),
    db.category.create({ data: { name: 'Rice Dishes', slug: 'rice-dishes', description: 'Fragrant rice meals', displayOrder: 1 } }),
    db.category.create({ data: { name: 'Soups & Stews', slug: 'soups-stews', description: 'Rich and hearty', displayOrder: 2 } }),
    db.category.create({ data: { name: 'Grills & Proteins', slug: 'grills-proteins', description: 'Fire-kissed perfection', displayOrder: 3 } }),
    db.category.create({ data: { name: 'Sides', slug: 'sides', description: 'Perfect accompaniments', displayOrder: 4 } }),
    db.category.create({ data: { name: 'Beverages', slug: 'beverages', description: 'Refreshing drinks', displayOrder: 5 } }),
    db.category.create({ data: { name: 'Desserts & Snacks', slug: 'desserts-snacks', description: 'Sweet treats', displayOrder: 6 } }),
  ]);

  // Food images - using real Ghanaian food photos from image search
  const img = (url: string) => url;

  // Menu items
  const menuItemsData = [
    // Local Favorites
    { name: 'Jollof Rice & Chicken', slug: 'jollof-rice-chicken', description: 'Smoky tomato-based rice paired with perfectly grilled chicken — Ghana\'s most iconic dish', price: 45, image: img('https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/396d3145e121.jpg'), isPopular: true, preparationTime: 25, ingredients: 'Rice, tomato, onion, pepper, chicken, vegetable oil, spices', categoryId: categories[0].id },
    { name: 'Banku & Okro Soup', slug: 'banku-okro-soup', description: 'Fermented corn and cassava dough served with slimy okro soup — a comfort food classic', price: 35, image: img('https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/d2b140dfa603.jpg'), isPopular: true, preparationTime: 20, ingredients: 'Corn dough, cassava dough, okro, palm oil, fish, pepper', categoryId: categories[0].id },
    { name: 'Waakye', slug: 'waakye', description: 'Rice and beans cooked with millet leaves, served with shito, salad and protein', price: 30, image: img('https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/c31ab27bb3a8.jpg'), isPopular: true, preparationTime: 30, ingredients: 'Rice, beans, millet leaves, shito, vegetable salad', categoryId: categories[0].id },
    { name: 'Fufu & Light Soup', slug: 'fufu-light-soup', description: 'Pounded cassava and plantain with aromatic goat light soup', price: 40, image: img('https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/2e13109d113e.jpg'), preparationTime: 25, ingredients: 'Cassava, plantain, goat meat, pepper, tomato, spices', categoryId: categories[0].id },
    { name: 'Kenkey & Fried Fish', slug: 'kenkey-fried-fish', description: 'Fermented corn dumpling wrapped in leaves with crispy fried fish and pepper sauce', price: 28, image: img('https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/9eb9af53d174.jpg'), preparationTime: 20, ingredients: 'Corn dough, fish, pepper, vegetable oil', categoryId: categories[0].id },

    // Rice Dishes
    { name: 'Fried Rice', slug: 'fried-rice', description: 'Wok-tossed rice with vegetables, egg, and your choice of protein', price: 35, image: img('https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/e646bffa0ef3.jpg'), isPopular: false, preparationTime: 15, ingredients: 'Rice, vegetables, egg, soy sauce, chicken', categoryId: categories[1].id },
    { name: 'Omotuo (Rice Balls)', slug: 'omotuo', description: 'Moulded rice balls served with groundnut or palm nut soup', price: 25, image: img('https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/b76d82b5cbcc.jpg'), preparationTime: 20, ingredients: 'Rice, groundnut soup, palm nut soup, meat', categoryId: categories[1].id },
    { name: 'Plain Rice & Stew', slug: 'plain-rice-stew', description: 'Fluffy long grain rice with rich tomato stew and grilled chicken', price: 30, image: img('https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/04ace3088a2d.jpg'), preparationTime: 15, ingredients: 'Rice, tomato, onion, pepper, chicken, vegetable oil', categoryId: categories[1].id },

    // Soups & Stews
    { name: 'Red Red', slug: 'red-red', description: 'Black-eyed peas stew in palm oil served with fried plantain — a vegetarian delight', price: 25, image: img('https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/2737c3518f7c.png'), isPopular: false, preparationTime: 20, ingredients: 'Black-eyed peas, palm oil, onion, pepper, plantain', categoryId: categories[2].id },
    { name: 'Palava Sauce', slug: 'palava-sauce', description: 'Spinach and egusi stew served with rice or yam — rich and nutritious', price: 30, image: img('https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/55c199cf2ee3.jpg'), preparationTime: 25, ingredients: 'Spinach, egusi, palm oil, fish, onion, pepper', categoryId: categories[2].id },
    { name: 'Egusi Soup', slug: 'egusi-soup', description: 'Melon seed soup with assorted meat and fish — thick, rich, and satisfying', price: 35, image: img('https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/f01793896b68.jpg'), preparationTime: 25, ingredients: 'Egusi, palm oil, assorted meat, fish, pepper', categoryId: categories[2].id },
    { name: 'Groundnut Soup', slug: 'groundnut-soup', description: 'Rich peanut soup with tender chicken — perfect with rice or fufu', price: 32, image: img('https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/bd6c78dc5ae2.jpg'), preparationTime: 25, ingredients: 'Groundnut paste, chicken, tomato, onion, pepper', categoryId: categories[2].id },

    // Grills & Proteins
    { name: 'Grilled Tilapia', slug: 'grilled-tilapia', description: 'Whole tilapia grilled to perfection with pepper sauce and lemon', price: 55, image: img('https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/58bb8bdf2c8a.jpg'), isPopular: true, preparationTime: 30, ingredients: 'Tilapia, pepper, lemon, vegetable oil, spices', categoryId: categories[3].id },
    { name: 'Suya', slug: 'suya', description: 'Spicy grilled beef skewers with groundnuts and onion — West African street food at its finest', price: 20, image: img('https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/f36dd9c8a73b.jpg'), isPopular: true, preparationTime: 15, ingredients: 'Beef, suya spice, groundnut oil, onion, groundnuts', categoryId: categories[3].id },
    { name: 'Fried Yam & Fish', slug: 'fried-yam-fish', description: 'Crispy fried yam slices with fried fish and shito pepper sauce', price: 25, image: img('https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/de070d06e1ae.jpg'), preparationTime: 15, ingredients: 'Yam, fish, shito, vegetable oil', categoryId: categories[3].id },

    // Sides
    { name: 'Kelewele', slug: 'kelewele', description: 'Spicy fried plantain cubes with ginger and pepper — Ghana\'s favorite snack', price: 15, image: img('https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/050ed9da0c73.jpg'), isPopular: true, preparationTime: 10, ingredients: 'Plantain, ginger, pepper, vegetable oil', categoryId: categories[4].id },
    { name: 'Fried Plantain', slug: 'fried-plantain', description: 'Sweet ripe plantain fried to golden perfection', price: 12, image: img('https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/2cc11a62f05f.jpg'), preparationTime: 8, ingredients: 'Plantain, vegetable oil', categoryId: categories[4].id },
    { name: 'Gari Foto', slug: 'gari-foto', description: 'Cassava flakes stir-fried with egg, onion, and pepper', price: 18, image: img('https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/5c356e3dcd32.jpg'), preparationTime: 10, ingredients: 'Gari, egg, onion, pepper, vegetable oil', categoryId: categories[4].id },
    { name: 'Ampesie', slug: 'ampesie', description: 'Boiled cassava and plantain served with kontomire stew', price: 22, image: img('https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/9eb9af53d174.jpg'), preparationTime: 20, ingredients: 'Cassava, plantain, kontomire, palm oil', categoryId: categories[4].id },
    { name: 'Tuo Zaafi', slug: 'tuo-zaafi', description: 'Corn and cassava meal with dawadawa soup — Northern Ghana specialty', price: 35, image: img('https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/3e0b24340d6f.jpg'), preparationTime: 25, ingredients: 'Corn flour, cassava flour, dawadawa, leaf, meat', categoryId: categories[4].id },

    // Beverages
    { name: 'Sobolo', slug: 'sobolo', description: 'Refreshing hibiscus drink with ginger and pineapple — naturally cooling', price: 8, image: img('https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/f429d63889d3.jpg'), isPopular: true, preparationTime: 2, ingredients: 'Hibiscus, ginger, pineapple, sugar', categoryId: categories[5].id },
    { name: 'Palm Wine', slug: 'palm-wine', description: 'Fresh palm wine served chilled — a traditional Ghanaian favorite', price: 10, image: img('https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/460c42a2ff4d.jpg'), preparationTime: 2, ingredients: 'Palm sap', categoryId: categories[5].id },
    { name: 'Asaana', slug: 'asaana', description: 'Fermented corn drink — sweet, tangy, and refreshing', price: 5, image: img('https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/3e0b24340d6f.jpg'), preparationTime: 2, ingredients: 'Fermented corn, sugar', categoryId: categories[5].id },
    { name: 'Bottled Water', slug: 'bottled-water', description: 'Pure refreshing water', price: 3, image: img('https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/460c42a2ff4d.jpg'), preparationTime: 0, ingredients: 'Water', categoryId: categories[5].id },

    // Desserts & Snacks
    { name: 'Meat Pie', slug: 'meat-pie', description: 'Flaky pastry filled with seasoned minced meat — a classic snack', price: 15, image: img('https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/fd635d75c331.jpg'), preparationTime: 10, ingredients: 'Flour, minced meat, egg, onion, spices', categoryId: categories[6].id },
    { name: 'Kelewele with Groundnuts', slug: 'kelewele-groundnuts', description: 'Spicy fried plantain served with roasted groundnuts — the perfect combo', price: 18, image: img('https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/af771a6c8856.jpg'), preparationTime: 10, ingredients: 'Plantain, groundnuts, ginger, pepper', categoryId: categories[6].id },
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
  const waakyeItem = menuItems.find(i => i.slug === 'waakye')!;
  const fufuItem = menuItems.find(i => i.slug === 'fufu-light-soup')!;
  const tilapiaItem = menuItems.find(i => i.slug === 'grilled-tilapia')!;

  const extrasData = [
    { name: 'Extra Chicken', price: 10, menuItemId: jollofItem.id },
    { name: 'Extra Egg', price: 5, menuItemId: jollofItem.id },
    { name: 'Extra Plantain', price: 5, menuItemId: jollofItem.id },
    { name: 'Extra Sauce', price: 3, menuItemId: jollofItem.id },
    { name: 'Large Portion', price: 15, menuItemId: jollofItem.id },
    { name: 'Extra Fish', price: 10, menuItemId: bankuItem.id },
    { name: 'Extra Okro', price: 3, menuItemId: bankuItem.id },
    { name: 'Large Portion', price: 15, menuItemId: bankuItem.id },
    { name: 'Extra Wele', price: 8, menuItemId: waakyeItem.id },
    { name: 'Extra Shito', price: 3, menuItemId: waakyeItem.id },
    { name: 'Extra Meat', price: 10, menuItemId: fufuItem.id },
    { name: 'Extra Soup', price: 5, menuItemId: fufuItem.id },
    { name: 'Extra Pepper', price: 3, menuItemId: tilapiaItem.id },
    { name: 'Extra Salad', price: 5, menuItemId: tilapiaItem.id },
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
      { name: 'Kwame A.', text: 'The Jollof Rice is absolutely incredible — smoky, flavorful, and the chicken is always perfectly grilled. This is my go-to spot!', rating: 5 },
      { name: 'Ama M.', text: 'Fast delivery and the food arrives hot every time. The Banku & Okro Soup reminds me of my mother\'s cooking.', rating: 5 },
      { name: 'Kofi B.', text: 'Best Waakye in Accra, hands down. The shito is on another level. I order at least twice a week!', rating: 5 },
      { name: 'Abena O.', text: 'Love the Grilled Tilapia — always fresh and perfectly seasoned. The Sobolo is refreshing too!', rating: 4 },
      { name: 'Yaw A.', text: 'Great variety of local dishes and the ordering process is so easy. Delivery is always on time.', rating: 4 },
      { name: 'Efua T.', text: 'The Kelewele is addictive! Perfect snack for any time of day. Will definitely keep ordering.', rating: 5 },
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
