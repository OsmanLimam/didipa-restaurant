/**
 * Structured Data (JSON-LD) for Mama's Kitchen Restaurant
 * Improves SEO and social media previews
 */

export function getRestaurantStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: "Mama's Kitchen",
    description: "Order delicious Ghanaian food from Mama's Kitchen at KNUST Campus, Kumasi. Jollof rice, banku & okro, waakye, grilled tilapia, kelewele and more.",
    url: 'https://mamaskitchen.com',
    telephone: '+233536828150',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'KNUST Campus',
      addressLocality: 'Kumasi',
      addressRegion: 'Ashanti',
      addressCountry: 'GH',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 6.6745,
      longitude: -1.5715,
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: 'Sunday',
        opens: '10:00',
        closes: '20:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        opens: '09:00',
        closes: '21:00',
      },
    ],
    servesCuisine: ['Ghanaian', 'African', 'West African'],
    priceRange: 'GH₵',
    paymentAccepted: 'Cash, MTN Mobile Money, Vodafone Cash, AirtelTigo Money, Paystack',
    currenciesAccepted: 'GHS',
    image: 'https://mamaskitchen.com/images/hero-food.png',
    logo: 'https://mamaskitchen.com/logo.png',
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      reviewCount: '150',
    },
    hasMenu: {
      '@type': 'Menu',
      name: "Mama's Kitchen Menu",
      url: 'https://mamaskitchen.com/menu',
    },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Ghanaian Food Delivery',
      itemListElement: [
        { '@type': 'Offer', itemOffered: { '@type': 'MenuItem', name: 'Jollof Rice & Chicken' } },
        { '@type': 'Offer', itemOffered: { '@type': 'MenuItem', name: 'Banku & Okro Soup' } },
        { '@type': 'Offer', itemOffered: { '@type': 'MenuItem', name: 'Waakye' } },
        { '@type': 'Offer', itemOffered: { '@type': 'MenuItem', name: 'Fufu & Light Soup' } },
        { '@type': 'Offer', itemOffered: { '@type': 'MenuItem', name: 'Grilled Tilapia' } },
        { '@type': 'Offer', itemOffered: { '@type': 'MenuItem', name: 'Kelewele' } },
      ],
    },
  };
}

export function getOrderStructuredData(orderNumber: string, status: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Order',
    orderNumber,
    orderStatus: `https://schema.org/OrderStatus/${getSchemaOrderStatus(status)}`,
    seller: {
      '@type': 'Restaurant',
      name: "Mama's Kitchen",
    },
  };
}

function getSchemaOrderStatus(status: string): string {
  const map: Record<string, string> = {
    PENDING: 'OrderProcessing',
    CONFIRMED: 'OrderProcessing',
    PREPARING: 'OrderProcessing',
    READY: 'OrderInTransit',
    OUT_FOR_DELIVERY: 'OrderInTransit',
    DELIVERED: 'OrderDelivered',
    CANCELLED: 'OrderCancelled',
  };
  return map[status] || 'OrderProcessing';
}
