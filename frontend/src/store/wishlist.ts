import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface WishlistItem {
  productId: string;
  productName: string;
  price: number | null;
  image?: string;
  category: string;
}

interface WishlistState {
  items: WishlistItem[];
  addItem: (item: WishlistItem) => void;
  removeItem: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  getTotalItems: () => number;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        const items = get().items;
        const existingItem = items.find((i) => i.productId === item.productId);

        if (!existingItem) {
          set({ items: [...items, item] });
        }
      },

      removeItem: (productId) => {
        set({
          items: get().items.filter((item) => item.productId !== productId),
        });
      },

      isInWishlist: (productId) => {
        return get().items.some((item) => item.productId === productId);
      },

      getTotalItems: () => {
        return get().items.length;
      },
    }),
    {
      name: 'urban-bees-wishlist',
      partialize: (state) => ({ items: state.items }),
    }
  )
);
