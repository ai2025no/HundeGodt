'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  Truck,
  CheckCircle2,
  Printer,
  RotateCcw,
  MapPin,
  Clock,
  Shield,
  FileText,
  Save,
} from 'lucide-react';
import { db } from '@/lib/db';
import { Order, OrderStatus } from '@/types';
import { formatPrice, formatDateTimeNorwegian } from '@/lib/utils';
import { useAdminStore } from '@/store/useAdminStore';

export default function AdminOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const currentUser = useAdminStore((state) => state.currentUser);

  const [order, setOrder] = useState<Order | null>(null);
  const [trackingInput, setTrackingInput] = useState('');
  const [internalNoteInput, setInternalNoteInput] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (!id) return;
    const found = db.getOrderById(id);
    if (found) {
      setOrder(found);
      setTrackingInput(found.trackingNumber || '');
      setInternalNoteInput(found.internalNotes || '');
    }
  }, [id]);

  if (!order) {
    return (
      <div className="py-20 text-center text-slate-400">
        <p>Laster inn ordre...</p>
      </div>
    );
  }

  const handleStatusChange = (newStatus: OrderStatus) => {
    const updated = db.updateOrderStatus(order.id, newStatus, trackingInput || undefined, currentUser.name);
    if (updated) {
      setOrder({ ...updated });
    }
  };

  const handleSaveTrackingAndNotes = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = db.updateOrderStatus(order.id, order.status, trackingInput || undefined, currentUser.name);
    if (updated) {
      updated.internalNotes = internalNoteInput;
      db.addAuditLog({
        adminName: currentUser.name,
        adminEmail: currentUser.email,
        adminRole: currentUser.role,
        action: 'Oppdaterte interne notater/sporing',
        entityType: 'order',
        entityId: order.id,
        entityName: `Ordre ${order.orderNumber}`,
        details: `Oppdaterte sporing til ${trackingInput || 'ingen'} og notat.`,
      });
      setOrder({ ...updated });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Back button & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <Link href="/admin/ordrer" className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-white font-mono">{order.orderNumber}</h1>
              <span className="bg-forest-900 text-forest-300 border border-forest-700 text-xs px-2.5 py-0.5 rounded-full font-bold uppercase">
                {order.status}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Opprettet: {formatDateTimeNorwegian(order.createdAt)} • Betalt med {order.paymentProvider.toUpperCase()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 border border-slate-700"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Skriv ut pakkseddel</span>
          </button>

          {order.status !== 'refunded' && (
            <button
              type="button"
              onClick={() => {
                if (confirm(`Er du sikker på at du vil refundere ordre ${order.orderNumber}?`)) {
                  handleStatusChange('refunded');
                }
              }}
              className="px-3.5 py-2 bg-red-950 hover:bg-red-900 text-red-300 rounded-xl text-xs font-bold transition-colors border border-red-800"
            >
              Refunder ordre
            </button>
          )}
        </div>
      </div>

      {/* Quick Status Bar */}
      <div className="bg-slate-950/80 p-4 rounded-3xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <span className="text-xs font-bold text-slate-400">Endre ordrestatus:</span>
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'processing', label: 'Behandles / Pakkes' },
            { id: 'shipped', label: 'Sendt med Bring' },
            { id: 'delivered', label: 'Levert til kunde' },
            { id: 'cancelled', label: 'Kanseller' },
          ].map((st) => (
            <button
              key={st.id}
              type="button"
              onClick={() => handleStatusChange(st.id as OrderStatus)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                order.status === st.id
                  ? 'bg-forest-700 text-white shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-800'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT: ORDER ITEMS TABLE */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-slate-950/80 rounded-3xl border border-slate-800 p-6 space-y-4">
            <h3 className="font-bold text-white text-base">Bestilte varer ({order.items.length})</h3>

            <div className="divide-y divide-slate-800/80">
              {order.items.map((item) => (
                <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-xl overflow-hidden relative bg-slate-900 shrink-0 border border-slate-800">
                      <Image src={item.imageUrl} alt={item.productName} fill className="object-cover" sizes="56px" />
                    </div>
                    <div>
                      <p className="font-bold text-white text-xs sm:text-sm">{item.productName}</p>
                      <p className="text-xs text-slate-400">{item.variantTitle} • SKU: {item.sku}</p>
                      <p className="text-xs text-slate-500">{formatPrice(item.unitPriceNok)} × {item.quantity} stk</p>
                    </div>
                  </div>

                  <span className="font-mono font-bold text-sm text-white">
                    {formatPrice(item.totalPriceNok)}
                  </span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="pt-4 border-t border-slate-800 space-y-1.5 text-xs text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Delsum</span>
                <span>{formatPrice(order.subtotalNok)}</span>
              </div>
              {order.discountNok > 0 && (
                <div className="flex justify-between text-red-400">
                  <span>Rabatt ({order.discountCode || 'Kampanje'})</span>
                  <span>-{formatPrice(order.discountNok)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-400">Frakt ({order.shippingCarrier.toUpperCase()})</span>
                <span>{order.shippingNok === 0 ? 'GRATIS' : formatPrice(order.shippingNok)}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-white pt-2 border-t border-slate-800">
                <span>Totalsum (inkl. 25% MVA)</span>
                <span>{formatPrice(order.totalNok)}</span>
              </div>
            </div>
          </div>

          {/* INTERNAL NOTES & LOGS */}
          <form onSubmit={handleSaveTrackingAndNotes} className="bg-slate-950/80 rounded-3xl border border-slate-800 p-6 space-y-4">
            <h3 className="font-bold text-white text-base">Forsendelsessporing og Interne notater</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Sporingsnummer (Bring / PostNord)</label>
                <input
                  type="text"
                  placeholder="370720124891230000NO"
                  value={trackingInput}
                  onChange={(e) => setTrackingInput(e.target.value)}
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Intern kommentar</label>
                <input
                  type="text"
                  placeholder="F.eks. Pakket av Lars, lagt ved godbit-prøve"
                  value={internalNoteInput}
                  onChange={(e) => setInternalNoteInput(e.target.value)}
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="submit"
                className="px-4 py-2 bg-forest-700 hover:bg-forest-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Lagre endringer</span>
              </button>

              {saveSuccess && (
                <span className="text-xs text-forest-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Endringer er lagret i systemet!
                </span>
              )}
            </div>
          </form>
        </div>

        {/* RIGHT: CUSTOMER & DELIVERY INFO */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Customer */}
          <div className="bg-slate-950/80 rounded-3xl border border-slate-800 p-6 space-y-3 text-xs">
            <h4 className="font-bold text-white text-sm">Kundeopplysninger</h4>
            <div className="space-y-1 text-slate-300">
              <p className="font-bold text-white text-sm">{order.customerName}</p>
              <p>E-post: <a href={`mailto:${order.customerEmail}`} className="text-forest-400 hover:underline">{order.customerEmail}</a></p>
              <p>Tlf: {order.customerPhone}</p>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-slate-950/80 rounded-3xl border border-slate-800 p-6 space-y-3 text-xs">
            <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-forest-400" />
              Leveringsadresse
            </h4>
            <div className="space-y-1 text-slate-300 leading-relaxed">
              <p>{order.shippingAddress.streetAddress}</p>
              <p>{order.shippingAddress.postalCode} {order.shippingAddress.city}</p>
              <p>{order.shippingAddress.country}</p>
            </div>
            {order.customerNotes && (
              <div className="mt-3 p-3 bg-slate-900 rounded-xl border border-slate-800 text-slate-300">
                <strong className="text-white block mb-1">Beskjed fra kunden:</strong>
                «{order.customerNotes}»
              </div>
            )}
          </div>

          {/* Payment metadata */}
          <div className="bg-slate-950/80 rounded-3xl border border-slate-800 p-6 space-y-3 text-xs text-slate-300">
            <h4 className="font-bold text-white text-sm">Betalingsinformasjon</h4>
            <p>Tilbyder: <strong className="text-white">{order.paymentProvider.toUpperCase()}</strong></p>
            <p>Status: <span className="text-emerald-400 font-bold">{order.paymentStatus}</span></p>
          </div>

        </div>

      </div>

    </div>
  );
}
