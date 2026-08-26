'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Heart,
  ShoppingBag,
  Star,
  AlertCircle,
  Check,
  ArrowRight,
} from 'lucide-react';
import { Product } from '@/types';
import { formatPrice } from '@/lib/utils';
import { useCartStore } from '@/store/useCartStore';
import { useWishlistStore } from '@/store/useWishlistStore';
import { useDogStore } from '@/store/useDogStore';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const addItem = useCartStore((state) => state.addItem);
  const { isInWishlist, toggleWishlist } = useWishlistStore();
  const { activeDog, hasAllergyWarning } = useDogStore();

  const isFavorited = isInWishlist(product.id);
  const allergyWarning = hasAllergyWarning(product);

  const primaryImage = product.images[0]?.url || 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=800&h=800&q=80';
  const secondaryImage = product.images[1]?.url || primaryImage;

  const defaultVariant = product.variants[0];
  const isOutOfStock = product.variants.every((v) => v.inventoryQuantity <= 0);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock || !defaultVariant) return;

    addItem(product, defaultVariant, 1);
    useCartStore.getState().openDrawer();
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1800);
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  // Assign SKU background tint based on category for distinct product room feel
  const getProductBackdropTint = (categorySlug: string) => {
    switch (categorySlug) {
      case 'mat':
        return 'bg-blush-petal/30';
      case 'godbiter':
        return 'bg-sky-powder/40';
      case 'tur-og-trening':
        return 'bg-mint-tide/25';
      case 'leker':
        return 'bg-amber-100/50';
      default:
        return 'bg-fog-gray';
    }
  };

  return (
    <div
      className="group relative bg-fog-gray rounded-[20px] p-5 sm:p-6 transition-all duration-200 flex flex-col justify-between"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div>
        {/* Top Badges & Wishlist */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex flex-wrap gap-1.5 z-10">
            {product.compareAtPriceNok && (
              <span className="bg-ember-orange text-cloud-white text-[11px] font-bold px-3 py-1 rounded-pill uppercase tracking-wider">
                Tilbud
              </span>
            )}
            {product.isBestseller && (
              <span className="bg-midnight-ink text-cloud-white text-[11px] font-bold px-3 py-1 rounded-pill">
                Bestselger
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleWishlistClick}
            className={`p-2 rounded-pill transition-colors z-10 ${
              isFavorited
                ? 'bg-ember-orange text-cloud-white'
                : 'bg-cloud-white text-stone-mute hover:text-ember-orange'
            }`}
            aria-label="Legg til favoritter"
          >
            <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Product Image Area with Tinted Background */}
        <Link href={`/produkt/${product.slug}`} className="block relative aspect-square w-full rounded-[16px] overflow-hidden mb-4 bg-cloud-white">
          <div className={`absolute inset-0 ${getProductBackdropTint(product.categorySlug)} transition-colors`} />
          <Image
            src={isHovered ? secondaryImage : primaryImage}
            alt={product.name}
            fill
            className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          />

          {isOutOfStock && (
            <div className="absolute inset-0 bg-cloud-white/80 backdrop-blur-[2px] flex items-center justify-center">
              <span className="bg-cocoa-bean text-cloud-white text-xs font-bold px-3 py-1 rounded-pill">
                Midlertidig utsolgt
              </span>
            </div>
          )}
        </Link>

        {/* Dog Allergy Alert Pill */}
        {allergyWarning && activeDog && (
          <div className="mb-2 bg-ember-orange/15 border border-ember-orange/30 text-cocoa-bean text-[11px] font-semibold px-2.5 py-1 rounded-pill flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-ember-orange shrink-0" />
            <span className="truncate">OBS: Inneholder råvare {activeDog.name} reagerer på</span>
          </div>
        )}

        {/* Brand & Title */}
        <p className="text-[11px] font-semibold text-stone-mute uppercase tracking-wider mb-1">
          {product.brandName}
        </p>

        <Link href={`/produkt/${product.slug}`} className="block group-hover:text-midnight-ink transition-colors min-h-[44px]">
          <h3 className="font-sans font-medium text-base sm:text-lg text-cocoa-bean leading-snug line-clamp-2">
            {product.name}
          </h3>
        </Link>
      </div>

      {/* Price & Pill Action */}
      <div className="pt-4 mt-2 border-t border-ash-border flex items-center justify-between gap-2">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="font-sans font-semibold text-base sm:text-lg text-cocoa-bean">
              {formatPrice(product.basePriceNok)}
            </span>
            {product.compareAtPriceNok && (
              <span className="text-xs text-stone-mute line-through">
                {formatPrice(product.compareAtPriceNok)}
              </span>
            )}
          </div>
          <span className="text-[10px] text-stone-mute block">Inkl. 25% MVA</span>
        </div>

        {/* Quick Add Pill Button */}
        <button
          type="button"
          disabled={isOutOfStock}
          onClick={handleQuickAdd}
          className={`btn-finn-primary !py-2 !px-4 text-xs font-medium ${
            justAdded ? '!bg-check-green text-cloud-white' : ''
          }`}
          title="Legg i handlekurv"
        >
          {justAdded ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>Lagt til!</span>
            </>
          ) : (
            <>
              <span>Kjøp</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
