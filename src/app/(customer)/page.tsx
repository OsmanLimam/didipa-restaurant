import Link from 'next/link';
import Image from 'next/image';
import { db } from '@/lib/db';
import { formatPrice, DAYS_OF_WEEK } from '@/lib/constants';
import { UtensilsCrossed, Star, Clock, MapPin, Truck, ChevronRight, Flame, ClipboardList, MessageCircle } from 'lucide-react';
import { ImageWithFallback } from '@/components/customer/image-fallback';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { HomeAnimations, HeroAnimations, HeroItem, StaggerGrid, StaggerItem, FadeIn } from './home-animations';
import { SocialShare } from '@/components/customer/social-share';
import { getRestaurantStructuredData } from '@/lib/structured-data';

export default async function HomePage() {
  const [popularItems, categories, testimonials, restaurant] = await Promise.all([
    db.menuItem.findMany({
      where: { isPopular: true, isAvailable: true },
      include: { category: { select: { name: true } } },
      take: 8,
      orderBy: { name: 'asc' },
    }),
    db.category.findMany({
      where: { isActive: true },
      include: { _count: { select: { menuItems: { where: { isAvailable: true } } } } },
      orderBy: { displayOrder: 'asc' },
    }),
    db.testimonial.findMany({
      take: 4,
      orderBy: { createdAt: 'desc' },
    }),
    db.restaurant.findFirst({
      include: { hours: { orderBy: { dayOfWeek: 'asc' } } },
    }),
  ]);

  const today = new Date().getDay();
  const structuredData = getRestaurantStructuredData();

  return (
    <HomeAnimations>
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className="space-y-0">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-primary/70 min-h-[420px]">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
          {/* Hero food image on right for desktop */}
          <div className="absolute right-0 top-0 bottom-0 w-1/2 hidden lg:block">
            <Image
              src="/images/hero/hero-food.png"
              alt="Ghanaian food spread"
              fill
              className="object-cover object-center opacity-40 mix-blend-overlay"
              priority
            />
          </div>
          <div className="relative container mx-auto px-4 py-16 md:py-24">
            <HeroAnimations>
              <div className="max-w-2xl space-y-6">
                <HeroItem>
                  <Badge variant="secondary" className="bg-white/20 text-white border-0 backdrop-blur-sm">
                    <Flame className="h-3 w-3 mr-1" /> Authentic Ghanaian Cuisine
                  </Badge>
                </HeroItem>
                <HeroItem>
                  <h1 className="text-4xl md:text-6xl font-bold text-primary-foreground leading-tight">
                    Delicious Food, <br />
                    <span className="text-primary-foreground/80">Made with Love</span>
                  </h1>
                </HeroItem>
                <HeroItem>
                  <p className="text-lg md:text-xl text-primary-foreground/70 max-w-lg">
                    From jollof rice to banku & okro soup — order your favorite Ghanaian dishes from DidiPa for delivery or pickup.
                  </p>
                </HeroItem>
                <HeroItem>
                  <div className="flex flex-wrap gap-3 pt-2">
                    <Button size="lg" variant="secondary" className="text-base" asChild>
                      <Link href="/menu">
                        <UtensilsCrossed className="mr-2 h-5 w-5" />
                        Explore Menu
                      </Link>
                    </Button>
                    <Button size="lg" variant="outline" className="text-base border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10" asChild>
                      <Link href="/menu">
                        Order Now
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </HeroItem>
              </div>
            </HeroAnimations>
          </div>
        </section>

        {/* Free Delivery Banner */}
        <section className="bg-primary/5 border-y border-primary/10">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-center gap-2 text-sm font-medium text-primary">
              <Truck className="h-4 w-4" />
              <span>Free delivery on orders over {formatPrice(100)}!</span>
            </div>
          </div>
        </section>

        {/* Popular Meals */}
        <FadeIn className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">Popular Meals</h2>
              <p className="text-muted-foreground text-sm mt-1">Our customers&apos; favorites</p>
            </div>
            <Button variant="ghost" size="sm" className="gap-1" asChild>
              <Link href="/menu">
                View All <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          <StaggerGrid className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {popularItems.map((item) => (
              <StaggerItem key={item.id}>
                <Link href={`/menu/${item.slug}`}>
                  <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 h-full">
                    <div className="aspect-[4/3] bg-muted relative overflow-hidden">
                      {item.image ? (
                        <ImageWithFallback src={item.image} alt={item.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw" />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <UtensilsCrossed className="h-10 w-10 text-muted-foreground/30" />
                        </div>
                      )}
                      <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground text-[10px]">
                        <Flame className="h-2.5 w-2.5 mr-0.5" /> Popular
                      </Badge>
                    </div>
                    <CardContent className="p-3">
                      <p className="font-semibold text-sm line-clamp-1">{item.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.category.name}</p>
                      <p className="text-primary font-bold mt-1">{formatPrice(item.price)}</p>
                    </CardContent>
                  </Card>
                </Link>
              </StaggerItem>
            ))}
          </StaggerGrid>
        </FadeIn>

        {/* How Ordering Works */}
        <FadeIn className="bg-muted/30">
          <div className="container mx-auto px-4 py-12">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold">How Ordering Works</h2>
              <p className="text-muted-foreground text-sm mt-1">Getting your favorite food is easy</p>
            </div>
            <StaggerGrid className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StaggerItem>
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4 text-lg font-bold">
                    1
                  </div>
                  <UtensilsCrossed className="h-8 w-8 text-primary mx-auto mb-3" />
                  <h3 className="font-semibold text-lg mb-2">Choose Your Meal</h3>
                  <p className="text-sm text-muted-foreground">Browse our menu and pick your favorite Ghanaian dishes</p>
                </div>
              </StaggerItem>
              <StaggerItem>
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4 text-lg font-bold">
                    2
                  </div>
                  <ClipboardList className="h-8 w-8 text-primary mx-auto mb-3" />
                  <h3 className="font-semibold text-lg mb-2">Customize Your Order</h3>
                  <p className="text-sm text-muted-foreground">Add extras, special instructions, and choose delivery or pickup</p>
                </div>
              </StaggerItem>
              <StaggerItem>
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4 text-lg font-bold">
                    3
                  </div>
                  <Truck className="h-8 w-8 text-primary mx-auto mb-3" />
                  <h3 className="font-semibold text-lg mb-2">Get It Delivered</h3>
                  <p className="text-sm text-muted-foreground">Sit back and enjoy fresh food delivered to your door, or pick it up hot</p>
                </div>
              </StaggerItem>
            </StaggerGrid>
          </div>
        </FadeIn>

        {/* Delivery & Pickup */}
        <FadeIn className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Delivery & Pickup</h2>
              <p className="text-muted-foreground">
                Enjoy DidiPa wherever you are on campus. We make it easy to get your favorite Ghanaian meals fresh and hot.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-2 text-sm">
                  <Truck className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <span>Fast delivery across KNUST campus</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <UtensilsCrossed className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <span>Freshly prepared meals</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <MessageCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <span>WhatsApp support for orders</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Star className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <span>Free delivery on orders over GH₵100</span>
                </li>
              </ul>
              <Button variant="outline" className="gap-2" asChild>
                <a href="https://wa.me/233536828150" target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="h-4 w-4" />
                  Order via WhatsApp
                </a>
              </Button>
            </div>
            <Card className="overflow-hidden">
              <div className="aspect-[4/3] bg-muted relative">
                <Image
                  src="/images/restaurant/food-delivery.png"
                  alt="DidiPa food delivery"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </Card>
          </div>
        </FadeIn>

        {/* Categories */}
        <FadeIn className="bg-muted/30">
          <div className="container mx-auto px-4 py-12">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold">Browse by Category</h2>
              <p className="text-muted-foreground text-sm mt-1">Find what you&apos;re craving</p>
            </div>
            <StaggerGrid className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {categories.map((cat) => (
                <StaggerItem key={cat.id}>
                  <Link href={`/menu?category=${cat.slug}`}>
                    <Card className="group hover:shadow-md transition-all duration-200 hover:border-primary/30">
                      <CardContent className="p-6 text-center">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3 group-hover:bg-primary/20 transition-colors">
                          <UtensilsCrossed className="h-6 w-6 text-primary" />
                        </div>
                        <p className="font-semibold">{cat.name}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {cat._count.menuItems} {cat._count.menuItems === 1 ? 'item' : 'items'}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                </StaggerItem>
              ))}
            </StaggerGrid>
          </div>
        </FadeIn>

        {/* Testimonials */}
        {testimonials.length > 0 && (
          <FadeIn className="container mx-auto px-4 py-12">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold">What Our Customers Say</h2>
              <p className="text-muted-foreground text-sm mt-1">Real reviews from real food lovers</p>
              <div className="mt-3 flex justify-center">
                <SocialShare title="DidiPa - Authentic Ghanaian Food" description="Order delicious Ghanaian food from DidiPa at KNUST Campus, Kumasi!" />
              </div>
            </div>
            <StaggerGrid className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {testimonials.map((t) => (
                <StaggerItem key={t.id}>
                  <Card className="h-full">
                    <CardContent className="p-6">
                      <div className="flex gap-0.5 mb-3">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${i < t.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'}`}
                          />
                        ))}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-4 italic">&quot;{t.text}&quot;</p>
                      <p className="font-semibold text-sm mt-4">— {t.name}</p>
                    </CardContent>
                  </Card>
                </StaggerItem>
              ))}
            </StaggerGrid>
          </FadeIn>
        )}

        {/* Opening Hours & Location */}
        <FadeIn className="bg-muted/30">
          <div className="container mx-auto px-4 py-12">
            <div className="grid md:grid-cols-2 gap-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Clock className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-bold">Opening Hours</h3>
                  </div>
                  <div className="space-y-2">
                    {(restaurant?.hours || []).map((h) => (
                      <div
                        key={h.id}
                        className={`flex items-center justify-between py-1.5 px-2 rounded text-sm ${
                          h.dayOfWeek === today ? 'bg-primary/10 font-medium' : ''
                        }`}
                      >
                        <span>{DAYS_OF_WEEK[h.dayOfWeek]}</span>
                        <span className={h.isClosed ? 'text-red-500' : ''}>
                          {h.isClosed ? 'Closed' : `${h.openTime} - ${h.closeTime}`}
                        </span>
                      </div>
                    ))}
                  </div>
                  {restaurant?.status && (
                    <div className="mt-4 flex items-center gap-2">
                      <div className={`h-2.5 w-2.5 rounded-full ${restaurant.status === 'OPEN' ? 'bg-green-500' : restaurant.status === 'BUSY' ? 'bg-yellow-500' : 'bg-red-500'}`} />
                      <span className="text-sm font-medium">
                        {restaurant.status === 'OPEN' ? 'Currently Open' : restaurant.status === 'BUSY' ? 'Currently Busy' : 'Currently Closed'}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <MapPin className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-bold">Find Us</h3>
                  </div>
                  <div className="space-y-3">
                    <p className="text-sm">
                      {restaurant?.address || 'Kumasi, Ghana'}
                    </p>
                    {restaurant?.phone && (
                      <p className="text-sm flex items-center gap-2">
                        <span className="text-muted-foreground">Phone:</span>
                        {restaurant.phone}
                      </p>
                    )}
                    {restaurant?.whatsappNumber && (
                      <Button variant="outline" size="sm" className="gap-2" asChild>
                        <a href={`https://wa.me/${restaurant.whatsappNumber}`} target="_blank" rel="noopener noreferrer">
                          WhatsApp Us
                        </a>
                      </Button>
                    )}
                    <div className="bg-muted rounded-lg h-48 overflow-hidden relative">
                      <iframe
                        src="https://maps.google.com/maps?q=KNUST+Campus,+Kumasi,+Ghana&t=&z=15&ie=UTF8&iwloc=&output=embed"
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title="DidiPa at KNUST Campus"
                        className="absolute inset-0"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </FadeIn>

        {/* FAQ Section */}
        <FadeIn className="container mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold">Frequently Asked Questions</h2>
              <p className="text-muted-foreground text-sm mt-1">Everything you need to know</p>
            </div>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="faq-1">
                <AccordionTrigger>Do you deliver?</AccordionTrigger>
                <AccordionContent>
                  Yes! We deliver across KNUST campus and surrounding areas. Orders over GH₵100 qualify for free delivery.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="faq-2">
                <AccordionTrigger>Can I order for pickup?</AccordionTrigger>
                <AccordionContent>
                  Absolutely! Select &quot;Pickup&quot; at checkout and we&apos;ll have your order ready for you at our KNUST Campus location.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="faq-3">
                <AccordionTrigger>How long does delivery take?</AccordionTrigger>
                <AccordionContent>
                  Typical delivery time is 30-45 minutes depending on your location and order size.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="faq-4">
                <AccordionTrigger>What payment methods do you accept?</AccordionTrigger>
                <AccordionContent>
                  We accept Cash on Delivery, MTN Mobile Money, Vodafone Cash, AirtelTigo Money, and card payments via Paystack.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="faq-5">
                <AccordionTrigger>Can I order through WhatsApp?</AccordionTrigger>
                <AccordionContent>
                  Yes! Tap the WhatsApp button to place your order directly with us.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="faq-6">
                <AccordionTrigger>Can I customize my meal?</AccordionTrigger>
                <AccordionContent>
                  Of course! You can add extras and special instructions to any item in your cart.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </FadeIn>
        {/* Final CTA */}
        <FadeIn className="bg-primary text-white">
          <div className="container mx-auto px-4 py-16 text-center">
            <h2 className="text-3xl font-bold mb-3">Ready to Order?</h2>
            <p className="text-white/80 mb-6 max-w-lg mx-auto">
              Explore our menu and get your favorite Ghanaian dishes delivered fresh.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button size="lg" variant="secondary" className="text-base" asChild>
                <Link href="/menu">
                  <UtensilsCrossed className="mr-2 h-5 w-5" />
                  View Menu
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-base border-white/30 text-white hover:bg-white/10" asChild>
                <a href="https://wa.me/233536828150" target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="mr-2 h-5 w-5" />
                  WhatsApp Us
                </a>
              </Button>
            </div>
          </div>
        </FadeIn>
      </div>
    </HomeAnimations>
  );
}
