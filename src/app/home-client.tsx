"use client";

import { FoodCard } from "@/components/customer/food-card";

interface HomePageClientProps {
  popularItems: {
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
  }[];
}

export function HomePageClient({ popularItems }: HomePageClientProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {popularItems.map((item) => (
        <FoodCard key={item.id} item={item} />
      ))}
    </div>
  );
}
