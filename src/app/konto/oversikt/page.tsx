'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Package,
  Smile,
  Heart,
  ArrowRight,
  Sparkles,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';
import { db } from '@/lib/db';
import { CustomerProfile, Order, DogProfile } from '@/types';
import { formatPrice, formatDateTimeNorwegian } from '@/lib/utils';
import { useDogStore } from '@/store/useDogStore';
import { useCartStore } from '@/store/useCartStore';

export default function AccountOverviewPage() {
  const [customer, setCustomer] = useState<CustomerProfile | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const { activeDog, setActiveDog } = useDogStore();
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    const custs = db.getCustomers();
    if (custs.length > 0) setCustomer(custs[0]);
    const ords = db.getOrders();
    setRecentOrders(ords.slice(0, 3));
  }, []);

  if (!customer) return null;

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
    <div className="space-y-8">
      
      {/* DOGS SUMMARY ROW */}
      <div className="card-finn space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display font-bold text-xl text-midnight-ink">
              Registrerte Hunder ({customer.dogs.length})
            </h2>
            <p className="text-xs text-stone-mute">Klikk for å aktivere personalisering</p>
          </div>
          <Link href="/konto/hunder/ny" className="btn-finn-outline !py-2 !px-4 text-xs font-semibold">
            <span>+ Legg til hund</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {customer.dogs.map((dog) => {
            const isSelected = activeDog?.id === dog.id;

            return (
              <div
                key={dog.id}
                onClick={() => setActiveDog(dog)}
                className={`p-5 rounded-[18px] border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                  isSelected
                    ? 'bg-cloud-white border-midnight-ink ring-1 ring-midnight-ink'
                    : 'bg-cloud-white border-ash-border hover:border-midnight-ink/50'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-pill bg-blush-petal flex items-center justify-center text-xl shrink-0">
                    🐾
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-display font-bold text-base text-cocoa-bean">{dog.name}</h3>
                      {isSelected && (
                        <span className="bg-midnight-ink text-cloud-white text-[10px] font-bold px-2 py-0.5 rounded-pill">
                          Aktiv
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-stone-mute">{dog.breed} • {dog.weightKg} kg</p>
                  </div>
                </div>

                <span className="text-xs font-bold text-midnight-ink">
                  {isSelected ? '✓ Valgt' : 'Velg'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* RECENT ORDERS */}
      <div className="card-finn space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-bold text-xl text-midnight-ink">
            Siste Bestillinger
          </h2>
          <Link href="/konto/ordrer" className="btn-finn-ghost text-xs">
            <span>Se alle</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="space-y-3">
          {recentOrders.map((ord) => (
            <div
              key={ord.id}
              className="p-4 bg-cloud-white rounded-[16px] border border-ash-border flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-sm text-midnight-ink">{ord.orderNumber}</span>
                  <span className="bg-sky-powder text-midnight-ink text-[11px] font-bold px-2.5 py-0.5 rounded-pill uppercase">
                    {ord.status}
                  </span>
                </div>
                <p className="text-xs text-stone-mute mt-1">
                  {formatDateTimeNorwegian(ord.createdAt)} • {ord.items.length} varer • {formatPrice(ord.totalNok)}
                </p>
              </div>

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
                  <span>Sporing</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
