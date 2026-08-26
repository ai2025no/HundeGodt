'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ArrowLeft,
  Truck,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { formatPrice } from '@/lib/utils';
import ProductCard from '@/components/products/ProductCard';
import { db } from '@/lib/db';

export default function CartPage() {
  const {
    items,
    updateQuantity,
    removeItem,
    getSubtotalNok,
    getTotalNok,
    getDiscountAmountNok,
    discountCode,
    applyDiscountCode,
    removeDiscountCode,
  } = useCartStore();

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');

  const subtotal = getSubtotalNok();
  const total = getTotalNok();
  const discountAmount = getDiscountAmountNok();
  const freeShippingThreshold = 699;
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const progressPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const success = applyDiscountCode(couponInput.trim());
    if (success) {
      setCouponInput('');
      setCouponError('');
    } else {
      setCouponError('Ugyldig rabattkode.');
    }
  };

  const recommendations = db.getProducts().slice(0, 3);

  if (items.length === 0) {
    return (
      <div className="max-w-[1280px] mx-auto px-4 py-24 text-center space-y-4">
        <div className="w-16 h-16 rounded-pill bg-fog-gray flex items-center justify-center mx-auto text-stone-mute">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h1 className="font-display text-3xl font-bold text-midnight-ink">Handlekurven din er tom</h1>
        <p className="text-xs sm:text-sm text-stone-mute max-w-sm mx-auto font-sans">
          Du har ikke lagt til noen produkter i handlekurven ennå.
        </p>
        <Link href="/produkter" className="btn-finn-primary !py-3.5 !px-8 text-sm">
          <span>Utforsk butikken</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
      
      <div className="border-b border-ash-border pb-4">
        <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-midnight-ink">
          Handlekurv ({items.reduce((s, i) => s + i.quantity, 0)})
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* LEFT COLUMN: ITEMS */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* FREE SHIPPING BAR */}
          <div className="p-4 bg-sky-powder/40 rounded-[20px] space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-cocoa-bean">
              <span className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-midnight-ink" />
                {remainingForFreeShipping > 0
                  ? `Kun ${formatPrice(remainingForFreeShipping)} igjen til FRI FRAKT!`
                  : '🎉 Du har kvalifisert til GRATIS FRAKT!'}
              </span>
              <span>{progressPercent}%</span>
            </div>

            <div className="w-full h-2 bg-cloud-white rounded-pill overflow-hidden">
              <div
                className="h-full bg-midnight-ink rounded-pill transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* TABLE OF ITEMS */}
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item.variantId}
                className="card-finn flex flex-col sm:flex-row items-center justify-between gap-6"
              >
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <div className="w-20 h-20 rounded-[16px] overflow-hidden relative bg-cloud-white shrink-0">
                    <Image
                      src={item.imageUrl}
                      alt={item.productName}
                      fill
                      className="object-contain p-2"
                      sizes="80px"
                    />
                  </div>
                  <div>
                    <h3 className="font-sans font-medium text-base text-cocoa-bean">{item.productName}</h3>
                    <p className="text-xs text-stone-mute">{item.variantTitle}</p>
                    <p className="text-xs font-bold text-midnight-ink mt-1">{formatPrice(item.priceNok)}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-ash-border">
                  <div className="flex items-center gap-2 bg-cloud-white border border-ash-border rounded-pill px-3 py-1 text-xs font-semibold">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                      className="text-stone-mute hover:text-cocoa-bean"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-6 text-center text-cocoa-bean">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                      className="text-stone-mute hover:text-cocoa-bean"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <span className="font-sans font-semibold text-base text-cocoa-bean w-24 text-right">
                    {formatPrice(item.priceNok * item.quantity)}
                  </span>

                  <button
                    type="button"
                    onClick={() => removeItem(item.variantId)}
                    className="p-2 text-stone-mute hover:text-ember-orange transition-colors"
                    title="Fjern"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <Link href="/produkter" className="inline-flex items-center gap-2 text-xs font-semibold text-cocoa-bean hover:text-midnight-ink">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Fortsett å handle</span>
          </Link>
        </div>

        {/* RIGHT COLUMN: SUMMARY */}
        <div className="lg:col-span-4 space-y-6">
          <div className="card-finn space-y-4">
            <h3 className="font-display font-bold text-xl text-midnight-ink border-b border-ash-border pb-3">
              Totalsum
            </h3>

            {/* Discount Code */}
            {discountCode ? (
              <div className="p-3 bg-mint-tide/20 border border-mint-tide/40 rounded-pill flex items-center justify-between text-xs text-cocoa-bean font-semibold">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-check-green" />
                  Kode: {discountCode.code} (-{formatPrice(discountAmount)})
                </span>
                <button type="button" onClick={removeDiscountCode} className="text-stone-mute hover:text-cocoa-bean">
                  Fjern
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Rabattkode"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  className="input-finn flex-1 text-xs py-2 px-4"
                />
                <button type="submit" className="btn-finn-outline !py-2 !px-4 text-xs font-semibold shrink-0">
                  Bruk
                </button>
              </form>
            )}
            {couponError && <p className="text-[11px] text-ember-orange font-semibold">{couponError}</p>}

            <div className="space-y-2 text-xs text-cocoa-bean pt-2">
              <div className="flex justify-between">
                <span className="text-stone-mute">Delsum</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-ember-orange font-semibold">
                  <span>Rabatt</span>
                  <span>-{formatPrice(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-stone-mute">Frakt</span>
                <span>{subtotal >= 699 ? 'GRATIS' : formatPrice(69)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-cocoa-bean pt-3 border-t border-ash-border">
                <span>Totalsum</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>

            <Link href="/checkout" className="btn-finn-primary w-full !py-4 text-base font-semibold">
              <span>Gå til kassen</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

      </div>

      {/* Cross sell */}
      <section className="space-y-6 pt-12 border-t border-ash-border">
        <h2 className="font-display text-2xl font-bold text-midnight-ink">
          Andre har også lagt til
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {recommendations.map((prod) => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
      </section>

    </div>
  );
}
