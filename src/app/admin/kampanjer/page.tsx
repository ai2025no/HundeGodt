'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Megaphone,
  Plus,
  Calendar,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  Tag,
  Sparkles,
} from 'lucide-react';
import { db } from '@/lib/db';
import { Campaign } from '@/types';
import { formatPrice, formatDateNorwegian } from '@/lib/utils';

export default function AdminCampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  const loadData = () => {
    setCampaigns(db.getCampaigns());
  };

  useEffect(() => {
    loadData();
    window.addEventListener('hg_storage_updated', loadData);
    return () => window.removeEventListener('hg_storage_updated', loadData);
  }, []);

  const totalGeneratedRevenue = campaigns.reduce((s, c) => s + c.revenueGeneratedNok, 0);

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Kampanjemotor</h1>
          <p className="text-xs text-slate-400 mt-1">
            Opprett 3-for-2 tilbud, prosentavslag på kategorier og tidsstyrte salg.
          </p>
        </div>

        <Link
          href="/admin/kampanjer/ny"
          className="px-4 py-2.5 bg-forest-700 hover:bg-forest-600 text-white rounded-xl text-xs font-bold transition-all shadow-warm flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Opprett ny kampanje</span>
        </Link>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-950/80 p-5 rounded-3xl border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 font-semibold">Aktive kampanjer</span>
          <span className="text-2xl font-bold text-white block">
            {campaigns.filter((c) => c.isActive).length} stk
          </span>
        </div>

        <div className="bg-slate-950/80 p-5 rounded-3xl border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 font-semibold">Generert omsetning</span>
          <span className="text-2xl font-bold text-forest-400 block">
            {formatPrice(totalGeneratedRevenue)}
          </span>
        </div>

        <div className="bg-slate-950/80 p-5 rounded-3xl border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 font-semibold">Antall ganger utløst</span>
          <span className="text-2xl font-bold text-white block">
            {campaigns.reduce((s, c) => s + c.timesUsed, 0)} ordre
          </span>
        </div>
      </div>

      {/* Campaign List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {campaigns.map((camp) => (
          <div
            key={camp.id}
            className="bg-slate-950/80 rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4 relative"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-forest-400 bg-forest-950 border border-forest-800 px-2.5 py-0.5 rounded-full">
                  {camp.type === 'bogo_3_for_2'
                    ? '3 FOR 2 TILBUD'
                    : `${camp.value}% RABATT PÅ KATEGORI`}
                </span>
                <h3 className="font-bold text-white text-lg mt-2">{camp.name}</h3>
                <p className="text-xs text-slate-400 mt-1">{camp.description}</p>
              </div>

              <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                camp.isActive ? 'bg-forest-900 text-forest-300 border border-forest-700' : 'bg-slate-800 text-slate-400'
              }`}>
                {camp.isActive ? 'Aktiv' : 'Avsluttet'}
              </span>
            </div>

            <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block">Tidsperiode:</span>
                <strong className="text-white">
                  {formatDateNorwegian(camp.startDate)} – {formatDateNorwegian(camp.endDate)}
                </strong>
              </div>

              <div>
                <span className="text-slate-400 block">Generert salg:</span>
                <strong className="text-forest-400 text-sm">{formatPrice(camp.revenueGeneratedNok)}</strong>
              </div>
            </div>

            {camp.bannerHeadline && (
              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-1">
                <strong className="text-white block text-[11px] uppercase tracking-wider">Forsidebanner:</strong>
                <p className="font-bold">{camp.bannerHeadline}</p>
                <p className="text-slate-400 text-[11px]">{camp.bannerSubline}</p>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 text-xs">
              <span className="text-slate-400">Utløst <strong>{camp.timesUsed} ganger</strong></span>
              <button
                type="button"
                onClick={() => {
                  db.saveCampaign({ ...camp, isActive: !camp.isActive });
                  loadData();
                }}
                className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
                  camp.isActive
                    ? 'bg-red-950 text-red-300 border border-red-800'
                    : 'bg-forest-800 text-white'
                }`}
              >
                {camp.isActive ? 'Pause kampanje' : 'Aktiver kampanje'}
              </button>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}
