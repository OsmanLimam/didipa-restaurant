import Link from 'next/link';
import Image from 'next/image';
import { UtensilsCrossed, Phone, MapPin, Clock } from 'lucide-react';
import { DAYS_OF_WEEK } from '@/lib/constants';

async function getRestaurantData() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/restaurant`, { cache: 'no-store' });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function CustomerFooter() {
  const restaurant = await getRestaurantData();

  const hours = restaurant?.hours || [];
  const today = new Date().getDay();

  return (
    <footer className="bg-card border-t mt-auto">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="DidiPa" width={32} height={32} className="rounded-lg" />
              <p className="text-lg font-bold">DidiPa</p>
            </div>
            <p className="text-sm text-muted-foreground">
              Serving authentic Ghanaian dishes made with love and tradition. From our kitchen to your home.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-3 text-sm uppercase tracking-wider text-muted-foreground">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-sm hover:text-primary transition-colors">Home</Link>
              </li>
              <li>
                <Link href="/menu" className="text-sm hover:text-primary transition-colors">Menu</Link>
              </li>
              <li>
                <Link href="/cart" className="text-sm hover:text-primary transition-colors">Cart</Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-3 text-sm uppercase tracking-wider text-muted-foreground">Contact</h3>
            <ul className="space-y-2">
              {restaurant?.phone && (
                <li className="flex items-center gap-2 text-sm">
                  <Phone className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span>{restaurant.phone}</span>
                </li>
              )}
              {restaurant?.address && (
                <li className="flex items-start gap-2 text-sm">
                  <MapPin className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                  <span>{restaurant.address}</span>
                </li>
              )}
            </ul>
          </div>

          {/* Hours */}
          <div>
            <h3 className="font-semibold mb-3 text-sm uppercase tracking-wider text-muted-foreground">Hours</h3>
            <ul className="space-y-1.5">
              {hours.length > 0 ? hours.map((h: { id: string; dayOfWeek: number; openTime: string; closeTime: string; isClosed: boolean }) => (
                <li key={h.id} className={`flex items-center gap-2 text-sm ${h.dayOfWeek === today ? 'font-medium text-primary' : 'text-muted-foreground'}`}>
                  <Clock className="h-3 w-3 shrink-0" />
                  <span className="w-20">{DAYS_OF_WEEK[h.dayOfWeek]?.slice(0, 3)}</span>
                  <span>{h.isClosed ? 'Closed' : `${h.openTime} - ${h.closeTime}`}</span>
                </li>
              )) : (
                <li className="text-sm text-muted-foreground">Mon-Sat: 8AM - 10PM</li>
              )}
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} DidiPa. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Made with ❤️ in Kumasi, Ghana
          </p>
        </div>
      </div>
    </footer>
  );
}
