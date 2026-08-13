"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Flame, Clock } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { formatPriceShort } from "@/lib/constants";
import { toast } from "sonner";

interface FoodCardProps {
  item: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    price: number;
    image: string | null;
    isPopular: boolean;
    isAvailable: boolean;
    preparationTime: number | null;
    category: {
      name: string;
      slug: string;
    };
  };
}

export function FoodCard({ item }: FoodCardProps) {
  const addItem = useCartStore((s) => s.addItem);

  const handleAddToCart = () => {
    addItem({
      menuItemId: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      quantity: 1,
      extras: [],
      categoryName: item.category.name,
    });
    toast.success(`${item.name} added to cart`);
  };

  return (
    <div className="group relative bg-card rounded-xl border overflow-hidden transition-all hover:shadow-lg">
      <Link href={`/menu/${item.slug}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          {item.image ? (
            <Image
              src={item.image}
              alt={item.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-4xl">
              🍽️
            </div>
          )}
          {item.isPopular && (
            <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground gap-1">
              <Flame className="h-3 w-3" />
              Popular
            </Badge>
          )}
          {!item.isAvailable && (
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
              <span className="text-sm font-medium text-muted-foreground">Unavailable</span>
            </div>
          )}
        </div>
      </Link>

      <div className="p-4">
        <Link href={`/menu/${item.slug}`}>
          <h3 className="font-semibold text-base leading-tight mb-1 group-hover:text-primary transition-colors">
            {item.name}
          </h3>
        </Link>
        {item.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
            {item.description}
          </p>
        )}
        <div className="flex items-center justify-between mt-3">
          <div>
            <span className="text-lg font-bold text-primary">
              {formatPriceShort(item.price)}
            </span>
            {item.preparationTime && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                <Clock className="h-3 w-3" />
                {item.preparationTime} min
              </span>
            )}
          </div>
          <Button
            size="sm"
            onClick={handleAddToCart}
            disabled={!item.isAvailable}
            className="gap-1"
          >
            <Plus className="h-4 w-4" />
            Add
          </Button>
        </div>
      </div>
    </div>
  );
}
