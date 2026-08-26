'use client';

import React, { useState, useEffect } from 'react';
import { ShoppingCart, Mail, ArrowRight, CheckCircle2, DollarSign, Clock } from 'lucide-react';
import { db } from '@/lib/db';
import { AbandonedCart } from '@/types';
import { formatPrice, formatDateTimeNorwegian } from '@/lib/utils';

export default function AdminAbandonedCartsPage() {
  const [carts, setCarts] = useState<AbandonedCart[]>([]);
  const [sentReminders, setSentReminders] = useState<string[]>([]);

  useEffect(() => {
    setCarts(db.getAbandonedCarts());
  }, []);

  const handleSendReminder = (cartId: string) => {
    setSentReminders([...sentReminders, cartId]);
    alert('E-postpåminnelse med 10% gjenopprettingsrabatt er sendt til kunden!');
  };

  const totalLostValue = carts.reduce((s, c) => s + c.totalValueNok, 0);

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Forlatte Handlekurver</h1>
          <p className="text-xs text-slate-400 mt-1">
            Overvåk påbegynte kjøp som ikke ble fullført, og send automatiserte påminnelser.
          </p>
        </div>

        <div className="bg-slate-950 px-4 py-2 rounded-2xl border border-slate-800 text-xs">
          <span className="text-slate-400">Tapt potensiell omsetning: </span>
          <strong className="text-amber-400 font-bold text-sm">{formatPrice(totalLostValue)}</strong>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {carts.map((cart) => {
          const isSent = cart.reminderSent || sentReminders.includes(cart.id);

          return (
            <div
              key={cart.id}
              className="bg-slate-950/80 rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-white text-base">{cart.customerName}</h3>
                  <p className="text-xs text-slate-400">{cart.customerEmail}</p>
                </div>
                <span className="bg-slate-900 text-amber-400 border border-amber-800/60 px-2.5 py-0.5 rounded-full text-xs font-bold font-mono">
                  {formatPrice(cart.totalValueNok)}
                </span>
              </div>

              <div className="p-3.5 bg-slate-900 rounded-2xl border border-slate-800 space-y-2 text-xs">
                <span className="text-slate-400 block font-bold">Varer i handlekurven:</span>
                {cart.items.map((i) => (
                  <div key={i.variantId} className="flex justify-between text-slate-300">
                    <span>{i.productName} ({i.quantity}x)</span>
                    <span className="font-bold">{formatPrice(i.priceNok * i.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                <span>Forlatt ved: <strong>{cart.stepReached.toUpperCase()}</strong></span>
                <span>Sist aktiv: {formatDateTimeNorwegian(cart.lastActiveAt)}</span>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end">
                <button
                  type="button"
                  disabled={isSent}
                  onClick={() => handleSendReminder(cart.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
                    isSent
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      : 'bg-forest-700 hover:bg-forest-600 text-white shadow-sm'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>{isSent ? 'Påminnelse sendt ✓' : 'Send e-post påminnelse'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
