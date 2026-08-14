'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { UtensilsCrossed, Clock, ChevronLeft, Minus, Plus, ShoppingCart, Check } from 'lucide-react';
import { ImageWithFallback } from '@/components/customer/image-fallback';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { formatPrice } from '@/lib/constants';
import { useCartStore, type CartExtra } from '@/stores/cart-store';
import { toast } from 'sonner';
import Link from 'next/link';

interface MenuItemDetail {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  image: string | null;
  isPopular: boolean;
  isAvailable: boolean;
  preparationTime: number | null;
  ingredients: string | null;
  category: { id: string; name: string; slug: string };
  extras: { id: string; name: string; price: number }[];
}

export default function FoodDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [item, setItem] = useState<MenuItemDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedExtras, setSelectedExtras] = useState<CartExtra[]>([]);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [added, setAdded] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    fetch(`/api/menu/${params.slug}`)
      .then((r) => r.json())
      .then(setItem)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [params.slug]);

  const toggleExtra = (extra: { id: string; name: string; price: number }) => {
    setSelectedExtras((prev) =>
      prev.find((e) => e.id === extra.id)
        ? prev.filter((e) => e.id !== extra.id)
        : [...prev, extra]
    );
  };

  const extrasTotal = selectedExtras.reduce((sum, e) => sum + e.price, 0);
  const runningTotal = (item ? item.price : 0) + extrasTotal;
  const lineTotal = runningTotal * quantity;

  const handleAddToCart = () => {
    if (!item) return;
    addItem({
      menuItemId: item.id,
      name: item.name,
      slug: item.slug,
      price: item.price,
      image: item.image,
      quantity,
      extras: selectedExtras,
      specialInstructions,
    });
    toast.success(`${item.name} added to cart`);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <Skeleton className="h-6 w-24 mb-6" />
        <div className="grid md:grid-cols-2 gap-6">
          <Skeleton className="aspect-square rounded-lg" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-20 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="container mx-auto px-4 py-16 text-center max-w-4xl">
        <UtensilsCrossed className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
        <p className="text-lg font-medium">Item not found</p>
        <Button variant="outline" className="mt-4" asChild>
          <Link href="/menu">Back to Menu</Link>
        </Button>
      </div>
    );
  }

  const ingredients = item.ingredients ? item.ingredients.split(',').map((i) => i.trim()) : [];

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      {/* Back Button */}
      <Link href="/menu" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ChevronLeft className="h-4 w-4" /> Back to Menu
      </Link>

      <motion.div className="grid md:grid-cols-2 gap-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        {/* Image */}
        <motion.div className="aspect-square bg-muted rounded-xl overflow-hidden relative" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
          {item.image ? (
            <ImageWithFallback src={item.image} alt={item.name} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" priority />
          ) : (
            <div className="flex items-center justify-center h-full">
              <UtensilsCrossed className="h-20 w-20 text-muted-foreground/20" />
            </div>
          )}
          {item.isPopular && (
            <Badge className="absolute top-4 left-4 bg-primary text-primary-foreground">
              Popular
            </Badge>
          )}
        </motion.div>

        {/* Details */}
        <motion.div className="space-y-6" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
          <div>
            <p className="text-sm text-muted-foreground">{item.category.name}</p>
            <h1 className="text-2xl md:text-3xl font-bold mt-1">{item.name}</h1>
          </div>

          <div className="flex items-center gap-4">
            <p className="text-2xl font-bold text-primary">{formatPrice(item.price)}</p>
            {item.preparationTime && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                {item.preparationTime} min
              </div>
            )}
          </div>

          {item.description && (
            <p className="text-muted-foreground">{item.description}</p>
          )}

          {/* Ingredients */}
          {ingredients.length > 0 && (
            <div>
              <h3 className="font-semibold text-sm mb-2">Ingredients</h3>
              <div className="flex flex-wrap gap-2">
                {ingredients.map((ing, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    {ing}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Extras */}
          {item.extras.length > 0 && (
            <div>
              <h3 className="font-semibold text-sm mb-3">Add Extras</h3>
              <div className="space-y-2">
                {item.extras.map((extra) => (
                  <label
                    key={extra.id}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={selectedExtras.some((e) => e.id === extra.id)}
                        onCheckedChange={() => toggleExtra(extra)}
                      />
                      <span className="text-sm font-medium">{extra.name}</span>
                    </div>
                    <span className="text-sm font-medium text-primary">+{formatPrice(extra.price)}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div>
            <h3 className="font-semibold text-sm mb-3">Quantity</h3>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="text-lg font-bold w-8 text-center">{quantity}</span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(quantity + 1)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Special Instructions */}
          <div>
            <Label htmlFor="instructions" className="font-semibold text-sm">Special Instructions</Label>
            <Textarea
              id="instructions"
              placeholder="Any special requests? (e.g., less spice, no onion...)"
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              className="mt-2"
              rows={2}
            />
          </div>

          <Separator />

          {/* Add to Cart */}
          <div className="sticky bottom-4 bg-background pt-2">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
              <Button
                size="lg"
                className="w-full gap-2"
                onClick={handleAddToCart}
                disabled={!item.isAvailable || added}
              >
                <motion.span
                  key={added ? 'added' : 'add'}
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-2"
                >
                  {added ? (
                    <>
                      <Check className="h-5 w-5" /> Added to Cart!
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="h-5 w-5" /> Add to Cart — {formatPrice(lineTotal)}
                    </>
                  )}
                </motion.span>
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
