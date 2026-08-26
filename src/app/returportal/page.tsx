'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  RotateCcw,
  Search,
  CheckCircle2,
  QrCode,
  Package,
  ArrowRight,
  ShieldCheck,
  Truck,
} from 'lucide-react';
import { db } from '@/lib/db';
import { Order } from '@/types';
import { formatPrice } from '@/lib/utils';

export default function ReturnPortalPage() {
  const [orderNumber, setOrderNumber] = useState('HG-10482');
  const [email, setEmail] = useState('emma.johansen@example.no');
  const [foundOrder, setFoundOrder] = useState<Order | null>(null);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [returnReason, setReturnReason] = useState('Feil størrelse');
  const [qrGenerated, setQrGenerated] = useState(false);

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    const ord = db.getOrderById(orderNumber.trim());
    if (ord) {
      setFoundOrder(ord);
      setSelectedItems([ord.items[0]?.id || '']);
    } else {
      alert('Fant ingen ordre med dette ordrenummeret.');
    }
  };

  const handleGenerateReturn = (e: React.FormEvent) => {
    e.preventDefault();
    setQrGenerated(true);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12 space-y-8">
      
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 bg-blush-petal px-4 py-1.5 rounded-pill text-xs font-semibold text-cocoa-bean">
          <RotateCcw className="w-3.5 h-3.5 text-midnight-ink" />
          <span>Selvbetjent Returportal</span>
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-midnight-ink">
          Enkel Retur med Bring QR-kode
        </h1>
        <p className="text-xs sm:text-sm text-stone-mute font-sans">
          Du trenger ingen egen printer. Vis QR-koden direkte på Posten for å få skrevet ut returseddel gratis.
        </p>
      </div>

      {!foundOrder ? (
        <form onSubmit={handleLookup} className="card-finn space-y-4">
          <h3 className="font-display font-bold text-lg text-midnight-ink">1. Finn din bestilling</h3>

          <div className="space-y-1">
            <label className="text-xs font-bold text-cocoa-bean uppercase font-mono">Ordrenummer (f.eks. HG-10482) *</label>
            <input
              type="text"
              required
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              className="input-finn w-full text-xs font-bold"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-cocoa-bean uppercase font-mono">E-postadresse brukt ved kjøp *</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-finn w-full text-xs"
            />
          </div>

          <button
            type="submit"
            className="btn-finn-primary w-full !py-3.5 text-xs font-semibold"
          >
            <span>Søk etter ordre</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      ) : !qrGenerated ? (
        <form onSubmit={handleGenerateReturn} className="card-finn space-y-6">
          <div className="flex justify-between items-center border-b border-ash-border pb-3">
            <div>
              <h3 className="font-display font-bold text-lg text-midnight-ink">2. Velg varer du vil returnere</h3>
              <p className="text-xs text-stone-mute">Ordre: {foundOrder.orderNumber}</p>
            </div>
            <button
              type="button"
              onClick={() => setFoundOrder(null)}
              className="text-xs text-ember-orange font-bold hover:underline"
            >
              Søk annen ordre
            </button>
          </div>

          <div className="space-y-2">
            {foundOrder.items.map((item) => (
              <label
                key={item.id}
                className="flex items-center justify-between p-3.5 bg-cloud-white border border-ash-border rounded-[16px] cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(item.id)}
                    onChange={() => {
                      if (selectedItems.includes(item.id)) {
                        setSelectedItems(selectedItems.filter((x) => x !== item.id));
                      } else {
                        setSelectedItems([...selectedItems, item.id]);
                      }
                    }}
                    className="rounded text-midnight-ink focus:ring-midnight-ink w-4 h-4"
                  />
                  <div>
                    <p className="text-xs font-bold text-cocoa-bean">{item.productName}</p>
                    <p className="text-[11px] text-stone-mute">{item.variantTitle} × {item.quantity}</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-cocoa-bean">{formatPrice(item.totalPriceNok)}</span>
              </label>
            ))}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-cocoa-bean uppercase font-mono">Årsak til retur</label>
            <select
              value={returnReason}
              onChange={(e) => setReturnReason(e.target.value)}
              className="input-finn w-full text-xs font-semibold cursor-pointer"
            >
              <option value="Feil størrelse">Feil størrelse på sele/dekken</option>
              <option value="Hunden likte ikke smaken">Hunden likte ikke smaken (Smaksgaranti)</option>
              <option value="Angrerett">Benytter 30 dagers angrerett</option>
              <option value="Skadet under transport">Vare skadet under transport</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={selectedItems.length === 0}
            className="btn-finn-primary w-full !py-4 text-xs font-semibold"
          >
            <span>Generer digital Bring retur-QR-kode</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      ) : (
        <div className="card-finn text-center space-y-6">
          <div className="w-14 h-14 rounded-pill bg-midnight-ink text-cloud-white flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8 text-check-green" />
          </div>

          <div>
            <h2 className="font-display font-bold text-2xl text-midnight-ink">Retur registrert!</h2>
            <p className="text-xs text-stone-mute mt-1">
              Returkode er sendt på e-post til <strong>{foundOrder.customerEmail}</strong>.
            </p>
          </div>

          {/* QR CODE BOX */}
          <div className="p-6 bg-cloud-white rounded-[20px] border border-ash-border inline-block space-y-3">
            <div className="w-48 h-48 bg-fog-gray rounded-[16px] p-3 mx-auto flex items-center justify-center">
              <div className="text-center space-y-2">
                <QrCode className="w-28 h-28 mx-auto text-midnight-ink" />
                <span className="font-mono text-xs font-bold text-cocoa-bean block">
                  BRING-RETUR-{foundOrder.orderNumber}
                </span>
              </div>
            </div>
            <p className="text-[11px] text-stone-mute max-w-xs">
              Vis denne skjermen på Posten / Post i Butikk. De skanner koden og klistrer på returlapp for deg.
            </p>
          </div>

          <div className="pt-4 flex justify-center gap-3">
            <Link
              href="/"
              className="btn-finn-primary !py-3 !px-6 text-xs"
            >
              <span>Tilbake til forsiden</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

    </div>
  );
}
