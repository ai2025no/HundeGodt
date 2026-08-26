'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  CheckCircle2,
  Package,
  Truck,
  MapPin,
  Clock,
  ArrowRight,
  Sparkles,
  RotateCcw,
} from 'lucide-react';
import { db } from '@/lib/db';
import { Order } from '@/types';
import { formatPrice, formatDateTimeNorwegian } from '@/lib/utils';

export default function OrderConfirmationPage() {
  const params = useParams();
  const id = params.id as string;
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (!id) return;
    const found = db.getOrderById(id);
    if (found) setOrder(found);
  }, [id]);

  if (!order) {
    return (
      <div className="py-24 text-center space-y-4">
        <div className="w-8 h-8 border-4 border-midnight-ink border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-stone-mute font-sans text-sm">Henter ordrebekreftelse...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12 space-y-8">
      
      {/* 1. HERO SUCCESS BANNER */}
      <div className="bg-blush-petal/50 rounded-[24px] p-8 sm:p-10 text-center space-y-4 border border-blush-petal">
        <div className="w-16 h-16 rounded-pill bg-midnight-ink text-cloud-white flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-9 h-9 text-check-green" />
        </div>

        <div>
          <span className="text-xs font-bold text-midnight-ink uppercase tracking-wider font-mono">
            Bestilling fullført
          </span>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-midnight-ink mt-1">
            Tusen takk for din bestilling!
          </h1>
          <p className="text-xs sm:text-sm text-cocoa-bean/80 mt-2">
            En ordrebekreftelse er sendt til <strong>{order.customerEmail}</strong>.
          </p>
        </div>

        <div className="inline-block bg-cloud-white px-5 py-2.5 rounded-pill border border-ash-border">
          <span className="text-xs font-bold text-cocoa-bean font-mono">
            Ordrenummer: <strong className="text-midnight-ink text-sm">{order.orderNumber}</strong>
          </span>
        </div>
      </div>

      {/* 2. ORDER TRACKING TIMELINE */}
      <div className="card-finn space-y-4">
        <h3 className="font-display font-bold text-lg text-midnight-ink flex items-center gap-2">
          <Truck className="w-5 h-5 text-midnight-ink" />
          <span>Forsendelse & Sporing</span>
        </h3>

        <div className="grid grid-cols-4 gap-2 text-center text-xs pt-2">
          {[
            { step: '1', title: 'Mottatt', active: true },
            { step: '2', title: 'Betalt', active: true },
            { step: '3', title: 'Pakkes', active: order.status === 'processing' || order.status === 'shipped' || order.status === 'delivered' },
            { step: '4', title: 'Sendt (Bring)', active: order.status === 'shipped' || order.status === 'delivered' },
          ].map((st) => (
            <div key={st.step} className="space-y-1.5">
              <div
                className={`w-8 h-8 rounded-pill mx-auto flex items-center justify-center font-bold text-xs ${
                  st.active
                    ? 'bg-midnight-ink text-cloud-white'
                    : 'bg-cloud-white text-stone-mute border border-ash-border'
                }`}
              >
                {st.step}
              </div>
              <p className={`font-sans font-medium text-[11px] ${st.active ? 'text-midnight-ink font-semibold' : 'text-stone-mute'}`}>
                {st.title}
              </p>
            </div>
          ))}
        </div>

        {order.trackingNumber && (
          <div className="p-3.5 bg-cloud-white rounded-[16px] border border-ash-border flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <span className="text-stone-mute">
              Bring Sporingsnummer: <strong className="text-cocoa-bean font-mono">{order.trackingNumber}</strong>
            </span>
            <span className="text-midnight-ink font-semibold">Estimert levering: 1-3 virkedager</span>
          </div>
        )}
      </div>

      {/* 3. ORDER ITEMS TABLE */}
      <div className="card-finn space-y-4">
        <h3 className="font-display font-bold text-lg text-midnight-ink border-b border-ash-border pb-3">
          Bestilte varer ({order.items.length})
        </h3>

        <div className="divide-y divide-ash-border">
          {order.items.map((item) => (
            <div key={item.id} className="py-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-[14px] bg-cloud-white overflow-hidden relative shrink-0">
                  <Image
                    src={item.imageUrl}
                    alt={item.productName}
                    fill
                    className="object-contain p-1"
                    sizes="56px"
                  />
                </div>
                <div>
                  <p className="font-sans font-medium text-xs sm:text-sm text-cocoa-bean">{item.productName}</p>
                  <p className="text-[11px] text-stone-mute">{item.variantTitle} × {item.quantity}</p>
                </div>
              </div>
              <span className="font-sans font-semibold text-sm text-cocoa-bean">
                {formatPrice(item.totalPriceNok)}
              </span>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="pt-3 border-t border-ash-border space-y-1.5 text-xs text-cocoa-bean">
          <div className="flex justify-between">
            <span className="text-stone-mute">Delsum</span>
            <span>{formatPrice(order.subtotalNok)}</span>
          </div>
          {order.discountNok > 0 && (
            <div className="flex justify-between text-ember-orange font-semibold">
              <span>Rabatt ({order.discountCode || 'Kampanje'})</span>
              <span>-{formatPrice(order.discountNok)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-stone-mute">Frakt ({order.shippingCarrier.toUpperCase()})</span>
            <span>{order.shippingNok === 0 ? 'GRATIS' : formatPrice(order.shippingNok)}</span>
          </div>
          <div className="flex justify-between text-base font-bold text-cocoa-bean pt-2 border-t border-ash-border">
            <span>Totalsum (inkl. MVA)</span>
            <span>{formatPrice(order.totalNok)}</span>
          </div>
        </div>
      </div>

      {/* 4. ACTIONS */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4 justify-center">
        <Link href="/produkter" className="btn-finn-primary !py-3.5 !px-8 text-sm">
          <span>Fortsett å handle</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
        <Link href="/konto/ordrer" className="btn-finn-outline !py-3.5 !px-8 text-sm">
          <span>Se ordre under Min Side</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

    </div>
  );
}
