import Link from 'next/link';
import Image from 'next/image';
import { db } from '@/lib/db';
import { formatPrice, DAYS_OF_WEEK } from '@/lib/constants';
import { UtensilsCrossed, Star, Clock, MapPin, Truck, ChevronRight, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
              src="/images/hero-food.png"
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
                    From jollof rice to banku & okro soup — order your favorite Ghanaian dishes for delivery or pickup.
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
                        <Image src={item.image} alt={item.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw" />
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
                <SocialShare title="DidiPa - Taste the Difference" description="Order delicious Ghanaian food from DidiPa at KNUST Campus!" />
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
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3954.5!2d-1.56!3d6.68!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNsKwNDAnNDguMCJOIDHCsDMzJzM2LjAiVw!5e0!3m2!1sen!2sgh!4v1"
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
      </div>
    </HomeAnimations>
  );
}
