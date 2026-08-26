'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  X,
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  Sparkles,
  Tag,
  CheckCircle2,
  Truck,
} from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { formatPrice } from '@/lib/utils';

export default function CartDrawer() {
  const {
    items,
    isDrawerOpen,
    closeDrawer,
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

  if (!isDrawerOpen) return null;

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
      setCouponError('Ugyldig eller utløpt rabattkode.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-midnight-ink/40 backdrop-blur-sm transition-opacity"
        onClick={closeDrawer}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-cloud-white border-l border-ash-border flex flex-col justify-between">
          
          {/* 1. DRAWER HEADER */}
          <div className="p-5 border-b border-ash-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-midnight-ink" />
              <h2 className="font-display font-bold text-lg text-cocoa-bean">
                Handlekurv ({items.reduce((s, i) => s + i.quantity, 0)})
              </h2>
            </div>
            <button
              type="button"
              onClick={closeDrawer}
              className="p-2 rounded-pill hover:bg-fog-gray text-cocoa-bean transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 2. FREE SHIPPING BAR */}
          <div className="p-4 bg-sky-powder/40 border-b border-ash-border space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-cocoa-bean">
              <span className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-midnight-ink" />
                {remainingForFreeShipping > 0
                  ? `Kun ${formatPrice(remainingForFreeShipping)} igjen til FRI FRAKT!`
                  : '🎉 Du har kvalifisert til GRATIS FRAKT!'}
              </span>
              <span>{progressPercent}%</span>
            </div>

            <div className="w-full h-2.5 bg-midnight-ink/10 rounded-pill overflow-hidden">
              <div
                className={`h-full rounded-pill transition-all duration-500 ${
                  progressPercent >= 100 ? 'bg-check-green' : 'bg-midnight-ink'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* 3. ITEMS LIST */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {items.length === 0 ? (
              <div className="py-16 text-center space-y-4">
                <div className="w-16 h-16 rounded-pill bg-fog-gray flex items-center justify-center mx-auto text-stone-mute">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div>
                  <p className="font-display font-bold text-lg text-cocoa-bean">Handlekurven din er tom</p>
                  <p className="text-xs text-stone-mute mt-1">Legg til noen herlige godbiter eller fôr!</p>
                </div>
                <Link
                  href="/produkter"
                  onClick={closeDrawer}
                  className="btn-finn-primary !py-3 !px-6 text-sm"
                >
                  <span>Utforsk butikken</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.variantId}
                  className="p-3.5 bg-fog-gray rounded-[20px] flex items-center gap-3.5"
                >
                  <div className="w-16 h-16 rounded-[14px] overflow-hidden relative bg-cloud-white shrink-0">
                    <Image
                      src={item.imageUrl}
                      alt={item.productName}
                      fill
                      className="object-contain p-2"
                      sizes="64px"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="font-sans font-medium text-xs sm:text-sm text-cocoa-bean truncate">
                      {item.productName}
                    </h4>
                    <p className="text-[11px] text-stone-mute mt-0.5">
                      {item.variantTitle}
                    </p>
                    <p className="text-xs font-semibold text-cocoa-bean mt-1">
                      {formatPrice(item.priceNok)}
                    </p>
                  </div>

                  {/* Quantity adjustment */}
                  <div className="flex flex-col items-end gap-2">
                    <button
                      type="button"
                      onClick={() => removeItem(item.variantId)}
                      className="text-stone-mute hover:text-ember-orange transition-colors"
                      title="Fjern vare"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <div className="flex items-center gap-1.5 bg-cloud-white border border-ash-border rounded-pill px-2 py-0.5 text-xs font-semibold">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                        className="text-stone-mute hover:text-cocoa-bean"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-5 text-center text-cocoa-bean">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                        className="text-stone-mute hover:text-cocoa-bean"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* 4. COUPON & FOOTER CHECKOUT */}
          {items.length > 0 && (
            <div className="p-5 border-t border-ash-border bg-cloud-white space-y-4">
              
              {/* Discount Code */}
              {discountCode ? (
                <div className="p-3 bg-mint-tide/20 border border-mint-tide/40 rounded-pill flex items-center justify-between text-xs text-cocoa-bean font-semibold">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-check-green" />
                    Rabattkode <strong>{discountCode.code}</strong> (-{formatPrice(discountAmount)})
                  </span>
                  <button
                    type="button"
                    onClick={removeDiscountCode}
                    className="text-stone-mute hover:text-cocoa-bean text-[11px]"
                  >
                    Fjern
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Rabattkode (f.eks. VELKOMMEN15)"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    className="input-finn flex-1 text-xs py-2 px-4"
                  />
                  <button
                    type="submit"
                    className="btn-finn-outline !py-2 !px-4 text-xs font-semibold shrink-0"
                  >
                    Bruk
                  </button>
                </form>
              )}
              {couponError && <p className="text-[11px] text-ember-orange font-semibold">{couponError}</p>}

              {/* Totals */}
              <div className="space-y-1.5 text-xs text-cocoa-bean">
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
                  <span className="text-stone-mute">Frakt (Bring)</span>
                  <span>{remainingForFreeShipping === 0 ? 'GRATIS' : formatPrice(69)}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-cocoa-bean pt-2 border-t border-ash-border">
                  <span>Totalsum</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>

              {/* CTA Checkout Pill */}
              <Link
                href="/checkout"
                onClick={closeDrawer}
                className="btn-finn-primary w-full !py-4 text-base font-semibold"
              >
                <span>Gå til kassen</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}
