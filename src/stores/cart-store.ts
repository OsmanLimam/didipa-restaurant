'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartExtra {
  id: string;
  name: string;
  price: number;
}

export interface CartItem {
  menuItemId: string;
  name: string;
  slug: string;
  price: number;
  image: string | null;
  quantity: number;
  extras: CartExtra[];
  specialInstructions: string;
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (menuItemId: string) => void;
  updateQuantity: (menuItemId: string, quantity: number) => void;
  updateExtras: (menuItemId: string, extras: CartExtra[]) => void;
  updateSpecialInstructions: (menuItemId: string, instructions: string) => void;
  clearCart: () => void;
  getItemCount: () => number;
  getSubtotal: () => number;
  getExtrasTotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        set((state) => {
          const existingIndex = state.items.findIndex(
            (i) => i.menuItemId === item.menuItemId
          );

          if (existingIndex >= 0) {
            const updated = [...state.items];
            updated[existingIndex] = {
              ...updated[existingIndex],
              quantity: updated[existingIndex].quantity + item.quantity,
              extras: item.extras,
              specialInstructions: item.specialInstructions,
            };
            return { items: updated };
          }

          return { items: [...state.items, item] };
        });
      },

      removeItem: (menuItemId) => {
        set((state) => ({
          items: state.items.filter((i) => i.menuItemId !== menuItemId),
        }));
      },

      updateQuantity: (menuItemId, quantity) => {
        if (quantity < 1) return;
        set((state) => ({
          items: state.items.map((i) =>
            i.menuItemId === menuItemId ? { ...i, quantity } : i
          ),
        }));
      },

      updateExtras: (menuItemId, extras) => {
        set((state) => ({
          items: state.items.map((i) =>
            i.menuItemId === menuItemId ? { ...i, extras } : i
          ),
        }));
      },

      updateSpecialInstructions: (menuItemId, instructions) => {
        set((state) => ({
          items: state.items.map((i) =>
            i.menuItemId === menuItemId ? { ...i, specialInstructions: instructions } : i
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      getItemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },

      getSubtotal: () => {
        return get().items.reduce((sum, item) => {
          const extrasTotal = item.extras.reduce((eSum, e) => eSum + e.price, 0);
          return sum + (item.price + extrasTotal) * item.quantity;
        }, 0);
      },

      getExtrasTotal: () => {
        return get().items.reduce((sum, item) => {
          return sum + item.extras.reduce((eSum, e) => eSum + e.price, 0) * item.quantity;
        }, 0);
      },
    }),
    {
      name: 'didipa-cart',
    }
  )
);
