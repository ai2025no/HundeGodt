'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Package,
  Truck,
  RotateCcw,
  Eye,
  FileText,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { db } from '@/lib/db';
import { Order } from '@/types';
import { formatPrice, formatDateTimeNorwegian } from '@/lib/utils';
import { useCartStore } from '@/store/useCartStore';

export default function CustomerOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    setOrders(db.getOrders());
  }, []);

  const handleReorder = (order: Order) => {
    order.items.forEach((item) => {
      const prod = db.getProductById(item.productId);
      if (prod) {
        const variant = prod.variants.find((v) => v.id === item.variantId) || prod.variants[0];
        addItem(prod, variant, item.quantity);
      }
    });
    useCartStore.getState().openDrawer();
  };

  return (
    <div className="space-y-6">
      
      <div className="border-b border-ash-border pb-4">
        <h2 className="font-display font-bold text-2xl text-midnight-ink">Mine Bestillinger ({orders.length})</h2>
        <p className="text-xs text-stone-mute mt-1">
          Full historikk, sporing med Bring og enkel gjenbestilling.
        </p>
      </div>

      <div className="space-y-4">
        {orders.map((ord) => (
          <div
            key={ord.id}
            className="card-finn space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-ash-border pb-3">
              <div>
                <span className="font-mono font-bold text-base text-midnight-ink">{ord.orderNumber}</span>
                <p className="text-xs text-stone-mute">{formatDateTimeNorwegian(ord.createdAt)}</p>
              </div>

              <div className="flex items-center gap-3">
                <span className="bg-sky-powder text-midnight-ink text-xs font-bold px-3 py-1 rounded-pill uppercase">
                  {ord.status}
                </span>
                <span className="font-display font-bold text-base text-cocoa-bean">{formatPrice(ord.totalNok)}</span>
              </div>
            </div>

            {/* Items */}
            <div className="space-y-2">
              {ord.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between text-xs text-cocoa-bean">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-midnight-ink" />
                    <span className="font-medium">{item.productName} ({item.variantTitle}) × {item.quantity}</span>
                  </div>
                  <span className="font-semibold">{formatPrice(item.totalPriceNok)}</span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-ash-border flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs text-stone-mute">
                Levering med <strong>{ord.shippingCarrier.toUpperCase()}</strong>
                {ord.trackingNumber && ` • Sporing: ${ord.trackingNumber}`}
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleReorder(ord)}
                  className="btn-finn-outline !py-2 !px-4 text-xs font-semibold"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Kjøp igjen</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <Link
                  href={`/ordre-bekreftelse/${ord.id}`}
                  className="btn-finn-primary !py-2 !px-4 text-xs font-semibold"
                >
                  <span>Vis kvittering</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}
