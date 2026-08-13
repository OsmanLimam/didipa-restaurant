import Link from 'next/link';
import { db } from '@/lib/db';
import { formatPrice, DAYS_OF_WEEK } from '@/lib/constants';
import { UtensilsCrossed, Star, Clock, MapPin, Truck, ChevronRight, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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

  return (
    <div className="space-y-0">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-primary/70">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        <div className="relative container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-2xl space-y-6">
            <Badge variant="secondary" className="bg-white/20 text-white border-0 backdrop-blur-sm">
              <Flame className="h-3 w-3 mr-1" /> Authentic Ghanaian Cuisine
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-primary-foreground leading-tight">
              Delicious Food, <br />
              <span className="text-primary-foreground/80">Made with Love</span>
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/70 max-w-lg">
              From jollof rice to banku & okro soup — order your favorite Ghanaian dishes for delivery or pickup.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Button size="lg" variant="secondary" className="text-base" asChild>
                <Link href="/menu">
                  <UtensilsCrossed className="mr-2 h-5 w-5" />
                  Explore Menu
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-base border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10" asChild>
                <Link href="/cart">
                  Order Now
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
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
      <section className="container mx-auto px-4 py-12">
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
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {popularItems.map((item) => (
            <Link key={item.id} href={`/menu/${item.slug}`}>
              <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 h-full">
                <div className="aspect-[4/3] bg-muted relative overflow-hidden">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300" />
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
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="bg-muted/30">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold">Browse by Category</h2>
            <p className="text-muted-foreground text-sm mt-1">Find what you&apos;re craving</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <Link key={cat.id} href={`/menu?category=${cat.slug}`}>
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
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <section className="container mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold">What Our Customers Say</h2>
            <p className="text-muted-foreground text-sm mt-1">Real reviews from real food lovers</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {testimonials.map((t) => (
              <Card key={t.id} className="h-full">
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
            ))}
          </div>
        </section>
      )}

      {/* Opening Hours & Location */}
      <section className="bg-muted/30">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Hours */}
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

            {/* Location */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-bold">Find Us</h3>
                </div>
                <div className="space-y-3">
                  <p className="text-sm">
                    {restaurant?.address || 'Accra, Ghana'}
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
                  <div className="bg-muted rounded-lg h-48 flex items-center justify-center">
                    <MapPin className="h-10 w-10 text-muted-foreground/30" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
