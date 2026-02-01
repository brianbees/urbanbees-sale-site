import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  productId: string;
  productName: string;
  variant: Record<string, string>;
  variantName: string;
  price: number;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (productId: string, variantName: string) => void;
  updateQuantity: (productId: string, variantName: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (item) => {
        const items = get().items;
        const existingItemIndex = items.findIndex(
          (i) => i.productId === item.productId && i.variantName === item.variantName
        );

        if (existingItemIndex > -1) {
          const newItems = [...items];
          newItems[existingItemIndex].quantity += 1;
          set({ items: newItems });
        } else {
          set({ items: [...items, { ...item, quantity: 1 }] });
        }
      },

      removeItem: (productId, variantName) => {
        set({
          items: get().items.filter(
            (item) => !(item.productId === productId && item.variantName === variantName)
          ),
        });
      },

      updateQuantity: (productId, variantName, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId, variantName);
          return;
        }

        const items = get().items;
        const itemIndex = items.findIndex(
          (i) => i.productId === productId && i.variantName === variantName
        );

        if (itemIndex > -1) {
          const newItems = [...items];
          newItems[itemIndex].quantity = quantity;
          set({ items: newItems });
        }
      },

      clearCart: () => set({ items: [] }),

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set({ isOpen: !get().isOpen }),

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getTotalPrice: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
      },
    }),
    {
      name: 'urban-bees-cart',
      partialize: (state) => ({ items: state.items }),
    }
  )
);
