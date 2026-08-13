'use client';

import { Suspense } from 'react';

// Wrapper to provide Suspense boundary for useSearchParams
export default function MenuPageWrapper() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <div className="h-8 w-32 bg-muted rounded animate-pulse" />
          <div className="h-4 w-48 bg-muted rounded animate-pulse mt-2" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-muted rounded-lg animate-pulse aspect-[3/4]" />
          ))}
        </div>
      </div>
    }>
      <MenuContent />
    </Suspense>
  );
}

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { UtensilsCrossed, Search, Flame, Plus, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatPrice } from '@/lib/constants';
import { useCartStore } from '@/stores/cart-store';
import { toast } from 'sonner';

interface MenuItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  image: string | null;
  isPopular: boolean;
  isAvailable: boolean;
  preparationTime: number | null;
  category: { id: string; name: string; slug: string };
  extras: { id: string; name: string; price: number }[];
}

interface Category {
  id: string;
  name: string;
  slug: string;
  _count: { menuItems: number };
}

function MenuContent() {
  const searchParams = useSearchParams();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(searchParams.get('category') || 'all');
  const [search, setSearch] = useState('');
  const [showPopular, setShowPopular] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    Promise.all([
      fetch('/api/menu').then((r) => r.json()),
      fetch('/api/categories').then((r) => r.json()),
    ])
      .then(([items, cats]) => {
        setMenuItems(items);
        setCategories(cats);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const filteredItems = menuItems.filter((item) => {
    if (activeCategory !== 'all' && item.category.slug !== activeCategory) return false;
    if (search && !item.name.toLowerCase().includes(search.toLowerCase()) && !(item.description || '').toLowerCase().includes(search.toLowerCase())) return false;
    if (showPopular && !item.isPopular) return false;
    return true;
  });

  const handleQuickAdd = useCallback((item: MenuItem) => {
    addItem({
      menuItemId: item.id,
      name: item.name,
      slug: item.slug,
      price: item.price,
      image: item.image,
      quantity: 1,
      extras: [],
      specialInstructions: '',
    });
    toast.success(`${item.name} added to cart`);
  }, [addItem]);

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Our Menu</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'} available
        </p>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search dishes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          variant={showPopular ? 'default' : 'outline'}
          size="sm"
          className="gap-1.5 shrink-0"
          onClick={() => setShowPopular(!showPopular)}
        >
          <Flame className="h-4 w-4" />
          Popular Only
        </Button>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
        <button
          onClick={() => setActiveCategory('all')}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
            activeCategory === 'all'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'bg-secondary text-secondary-foreground hover:bg-primary/10'
          }`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.slug)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              activeCategory === cat.slug
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-secondary text-secondary-foreground hover:bg-primary/10'
            }`}
          >
            {cat.name} ({cat._count.menuItems})
          </button>
        ))}
      </div>

      {/* Food Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="aspect-[4/3]" />
              <CardContent className="p-3 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-4 w-1/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-16">
          <UtensilsCrossed className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-lg font-medium text-muted-foreground">No items found</p>
          <p className="text-sm text-muted-foreground mt-1">Try a different category or search</p>
        </div>
      ) : (
        <motion.div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" initial="hidden" animate="visible" variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06 } } }}>
          {filteredItems.map((item) => (
            <motion.div key={item.id} variants={{ hidden: { opacity: 0, y: 20, scale: 0.95 }, visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.35, ease: 'easeOut' } } }} whileHover={{ y: -4 }} whileTap={{ scale: 0.98 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
            <Card className="group overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
              <Link href={`/menu/${item.slug}`} className="flex-1 flex flex-col">
                <div className="aspect-[4/3] bg-muted relative overflow-hidden">
                  {item.image ? (
                    <Image src={item.image} alt={item.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw" />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <UtensilsCrossed className="h-10 w-10 text-muted-foreground/30" />
                    </div>
                  )}
                  {item.isPopular && (
                    <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground text-[10px]">
                      <Flame className="h-2.5 w-2.5 mr-0.5" /> Popular
                    </Badge>
                  )}
                  {!item.isAvailable && (
                    <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                      <span className="text-sm font-medium text-muted-foreground">Unavailable</span>
                    </div>
                  )}
                </div>
                <CardContent className="p-3 flex-1">
                  <p className="font-semibold text-sm line-clamp-1">{item.name}</p>
                  {item.description && (
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{item.description}</p>
                  )}
                  <p className="text-primary font-bold mt-2">{formatPrice(item.price)}</p>
                </CardContent>
              </Link>
              {item.isAvailable && (
                <div className="px-3 pb-3">
                  <Button
                    size="sm"
                    className="w-full gap-1 text-xs"
                    onClick={() => handleQuickAdd(item)}
                  >
                    <Plus className="h-3 w-3" /> Add to Cart
                  </Button>
                </div>
              )}
            </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
