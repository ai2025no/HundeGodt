'use client';

import React, { useState } from 'react';
import {
  Settings,
  Shield,
  CreditCard,
  Truck,
  RotateCcw,
  CheckCircle2,
  Users,
  Key,
} from 'lucide-react';
import { db } from '@/lib/db';
import { useAdminStore } from '@/store/useAdminStore';

export default function AdminSettingsPage() {
  const [resetDone, setResetDone] = useState(false);
  const { currentRole, currentUser } = useAdminStore();

  const handleResetData = () => {
    if (confirm('Er du sikker på at du vil tilbakestille alle produkter, ordrer og seed-data til fabrikkinnstilling?')) {
      db.resetToSeed();
      setResetDone(true);
      setTimeout(() => setResetDone(false), 3000);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Systeminnstillinger & RBAC</h1>
        <p className="text-xs text-slate-400 mt-1">
          Fraktintegrasjoner, betalingsløsninger, MVA og tilgangskontroll.
        </p>
      </div>

      {/* 1. CARRIER INTEGRATIONS */}
      <div className="bg-slate-950/80 p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex items-center gap-2.5">
          <Truck className="w-5 h-5 text-forest-400" />
          <h3 className="font-bold text-white text-base">Fraktintegrasjoner (Carrier APIs)</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex justify-between items-center">
              <strong className="text-white text-xs">Bring / Posten Norge</strong>
              <span className="text-[10px] bg-forest-900 text-forest-300 px-2 py-0.5 rounded-full font-bold">Aktiv</span>
            </div>
            <p className="text-[11px] text-slate-400">MyPack / Pakke i postkassen & automatisk QR-etikett.</p>
          </div>

          <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex justify-between items-center">
              <strong className="text-white text-xs">PostNord Norge</strong>
              <span className="text-[10px] bg-forest-900 text-forest-300 px-2 py-0.5 rounded-full font-bold">Aktiv</span>
            </div>
            <p className="text-[11px] text-slate-400">Hjemlevering på kveldstid og pakkeautomater.</p>
          </div>

          <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex justify-between items-center">
              <strong className="text-white text-xs">Helthjem</strong>
              <span className="text-[10px] bg-forest-900 text-forest-300 px-2 py-0.5 rounded-full font-bold">Aktiv</span>
            </div>
            <p className="text-[11px] text-slate-400">Morgenlevering på dørmatten før kl 07:00.</p>
          </div>
        </div>
      </div>

      {/* 2. PAYMENT GATEWAYS */}
      <div className="bg-slate-950/80 p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex items-center gap-2.5">
          <CreditCard className="w-5 h-5 text-forest-400" />
          <h3 className="font-bold text-white text-base">Betalingsløsninger (Payment Gateways)</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex justify-between items-center">
              <strong className="text-white text-xs">Vipps Hurtigkasse</strong>
              <span className="text-[10px] bg-forest-900 text-forest-300 px-2 py-0.5 rounded-full font-bold">Tilkoblet</span>
            </div>
            <p className="text-[11px] text-slate-400">Vipps e-Commerce API v2.</p>
          </div>

          <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex justify-between items-center">
              <strong className="text-white text-xs">Klarna Payments</strong>
              <span className="text-[10px] bg-forest-900 text-forest-300 px-2 py-0.5 rounded-full font-bold">Tilkoblet</span>
            </div>
            <p className="text-[11px] text-slate-400">Klarna Checkout KCO v3.</p>
          </div>

          <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex justify-between items-center">
              <strong className="text-white text-xs">Stripe / Bankkort</strong>
              <span className="text-[10px] bg-forest-900 text-forest-300 px-2 py-0.5 rounded-full font-bold">Tilkoblet</span>
            </div>
            <p className="text-[11px] text-slate-400">Visa, Mastercard og BankAxept.</p>
          </div>
        </div>
      </div>

      {/* 3. DATABASE RESET TO CLEAN SEED */}
      <div className="bg-slate-950/80 p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex items-center gap-2.5 text-red-400">
          <RotateCcw className="w-5 h-5" />
          <h3 className="font-bold text-white text-base">Demodata og Nullstilling</h3>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          Ønsker du å tilbakestille butikken til de opprinnelige 30+ produktene, ordrene, kundene og CMS-blokkene?
        </p>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleResetData}
            className="px-4 py-2.5 bg-red-950 hover:bg-red-900 text-red-200 border border-red-800 rounded-xl text-xs font-bold transition-colors"
          >
            Tilbakestill til fabrikkinnstillinger (Seed Data)
          </button>

          {resetDone && (
            <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Butikkdata er nå nullstilt til seed!
            </span>
          )}
        </div>
      </div>

    </div>
  );
}
