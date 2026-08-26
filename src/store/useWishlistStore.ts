import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { trackEvent } from '@/lib/analytics';

interface WishlistState {
  productIds: string[];
  items: string[];
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      productIds: ['prod-okselever', 'prod-adventure-sele'],
      items: ['prod-okselever', 'prod-adventure-sele'],

      toggleWishlist: (productId: string) => {
        const current = get().productIds;
        const exists = current.includes(productId);
        const updated = exists ? current.filter((id) => id !== productId) : [...current, productId];

        set({ productIds: updated, items: updated });
        trackEvent('wishlist_toggled', { productId, isAdded: !exists });
      },

      isInWishlist: (productId: string) => {
        return get().productIds.includes(productId);
      },

      clearWishlist: () => {
        set({ productIds: [], items: [] });
      },
    }),
    {
      name: 'hg_wishlist_storage',
    }
  )
);
