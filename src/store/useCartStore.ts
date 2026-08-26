import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, Product, ProductVariant, DiscountCode } from '@/types';
import { db } from '@/lib/db';
import { trackEvent } from '@/lib/analytics';

interface CartState {
  items: CartItem[];
  isDrawerOpen: boolean;
  discountCode: DiscountCode | null;
  discountErrorMessage: string | null;
  freeShippingThresholdNok: number;
  standardShippingFeeNok: number;

  // Actions
  addItem: {
    (product: Product, variant: ProductVariant, quantity?: number): void;
    (item: Omit<CartItem, 'quantity'>, quantity?: number): void;
  };
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
  applyDiscountCode: (code: string) => boolean;
  removeDiscountCode: () => void;

  // Convenient aliases
  applyDiscount: (code: string) => boolean;
  removeDiscount: () => void;

  // Computed helpers
  getSubtotalNok: () => number;
  getDiscountAmountNok: () => number;
  getShippingFeeNok: () => number;
  getTotalNok: () => number;
  getItemCount: () => number;
  getAmountUntilFreeShipping: () => number;

  // Aliases for convenience
  getSubtotal: () => number;
  getTotal: () => number;
  getDiscountAmount: () => number;
  getShippingFee: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isDrawerOpen: false,
      discountCode: null,
      discountErrorMessage: null,
      freeShippingThresholdNok: 699,
      standardShippingFeeNok: 69,

      addItem: (arg1: any, arg2?: any, arg3: number = 1) => {
        let cartItem: Omit<CartItem, 'quantity'>;
        let qty = 1;

        if (arg1 && arg1.id && arg2 && arg2.id) {
          // Passed (product, variant, quantity)
          const product = arg1 as Product;
          const variant = arg2 as ProductVariant;
          qty = typeof arg3 === 'number' ? arg3 : 1;

          cartItem = {
            productId: product.id,
            variantId: variant.id,
            productName: product.name,
            variantTitle: variant.title,
            brandName: product.brandName,
            imageUrl: product.images[0]?.url || '',
            priceNok: variant.priceNok,
            compareAtPriceNok: product.compareAtPriceNok,
            maxInventory: variant.inventoryQuantity || 99,
            slug: product.slug,
          };
        } else {
          // Passed (cartItemObject, quantity)
          cartItem = arg1;
          qty = typeof arg2 === 'number' ? arg2 : 1;
        }

        const currentItems = get().items;
        const existingIndex = currentItems.findIndex((i) => i.variantId === cartItem.variantId);

        let newItems: CartItem[];
        if (existingIndex >= 0) {
          newItems = [...currentItems];
          const newQty = Math.min(
            newItems[existingIndex].quantity + qty,
            newItems[existingIndex].maxInventory || 99
          );
          newItems[existingIndex] = {
            ...newItems[existingIndex],
            quantity: newQty,
          };
        } else {
          newItems = [
            ...currentItems,
            { ...cartItem, quantity: Math.min(qty, cartItem.maxInventory || 99) },
          ];
        }

        set({ items: newItems, isDrawerOpen: true });

        trackEvent('add_to_cart', {
          productId: cartItem.productId,
          productName: cartItem.productName,
          variantSku: cartItem.variantId,
          priceNok: cartItem.priceNok,
        });
      },

      removeItem: (variantId: string) => {
        const currentItems = get().items;
        const target = currentItems.find((i) => i.variantId === variantId);
        set({ items: currentItems.filter((i) => i.variantId !== variantId) });

        if (target) {
          trackEvent('remove_from_cart', {
            productId: target.productId,
            productName: target.productName,
          });
        }
      },

      updateQuantity: (variantId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(variantId);
          return;
        }
        const currentItems = get().items;
        const newItems = currentItems.map((item) => {
          if (item.variantId === variantId) {
            return {
              ...item,
              quantity: Math.min(quantity, item.maxInventory || 99),
            };
          }
          return item;
        });
        set({ items: newItems });
      },

      clearCart: () => {
        set({ items: [], discountCode: null, discountErrorMessage: null });
      },

      openDrawer: () => set({ isDrawerOpen: true }),
      closeDrawer: () => set({ isDrawerOpen: false }),
      toggleDrawer: () => set((state) => ({ isDrawerOpen: !state.isDrawerOpen })),

      applyDiscountCode: (codeStr: string) => {
        const subtotal = get().getSubtotalNok();
        const result = db.validateDiscountCode(codeStr, subtotal);
        if (result.valid && result.discount) {
          set({ discountCode: result.discount, discountErrorMessage: null });
          trackEvent('coupon_applied', { discountCode: codeStr });
          return true;
        } else {
          set({ discountErrorMessage: result.message || 'Ugyldig rabattkode' });
          return false;
        }
      },

      removeDiscountCode: () => {
        set({ discountCode: null, discountErrorMessage: null });
      },

      applyDiscount: (codeStr: string) => get().applyDiscountCode(codeStr),
      removeDiscount: () => get().removeDiscountCode(),

      getSubtotalNok: () => {
        return get().items.reduce((sum, item) => sum + item.priceNok * item.quantity, 0);
      },

      getDiscountAmountNok: () => {
        const subtotal = get().getSubtotalNok();
        const code = get().discountCode;
        if (!code) return 0;

        if (code.type === 'percentage') {
          return Math.round((subtotal * code.value) / 100);
        }
        if (code.type === 'fixed_amount') {
          return Math.min(code.value, subtotal);
        }
        return 0;
      },

      getShippingFeeNok: () => {
        const subtotal = get().getSubtotalNok();
        const threshold = get().freeShippingThresholdNok;
        const code = get().discountCode;
        if (code && code.type === 'free_shipping') return 0;
        if (subtotal >= threshold || subtotal === 0) return 0;
        return get().standardShippingFeeNok;
      },

      getTotalNok: () => {
        const subtotal = get().getSubtotalNok();
        const discount = get().getDiscountAmountNok();
        const shipping = get().getShippingFeeNok();
        return Math.max(0, subtotal - discount + shipping);
      },

      getItemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },

      getAmountUntilFreeShipping: () => {
        const subtotal = get().getSubtotalNok();
        const threshold = get().freeShippingThresholdNok;
        return Math.max(0, threshold - subtotal);
      },

      getSubtotal: () => get().getSubtotalNok(),
      getTotal: () => get().getTotalNok(),
      getDiscountAmount: () => get().getDiscountAmountNok(),
      getShippingFee: () => get().getShippingFeeNok(),
    }),
    {
      name: 'hg_cart_storage_v1',
    }
  )
);
