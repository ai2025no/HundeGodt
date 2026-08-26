'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Megaphone, Sparkles } from 'lucide-react';
import { db } from '@/lib/db';
import { Campaign } from '@/types';

export default function NewCampaignPage() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'percentage' | 'bogo_3_for_2' | 'fixed_amount'>('percentage');
  const [value, setValue] = useState(20);
  const [categoryTarget, setCategoryTarget] = useState('cat-godbiter');
  const [startDate, setStartDate] = useState('2026-08-01T00:00:00Z');
  const [endDate, setEndDate] = useState('2026-09-30T23:59:59Z');
  const [bannerHeadline, setBannerHeadline] = useState('');
  const [bannerSubline, setBannerSubline] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newCamp: Campaign = {
      id: `camp-${Date.now()}`,
      name: name.trim(),
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description,
      type,
      value: Number(value),
      appliesTo: 'category',
      targetIds: [categoryTarget],
      startDate,
      endDate,
      isActive: true,
      priority: 1,
      timesUsed: 0,
      revenueGeneratedNok: 0,
      bannerHeadline: bannerHeadline || undefined,
      bannerSubline: bannerSubline || undefined,
    };

    db.saveCampaign(newCamp);
    router.push('/admin/kampanjer');
  };

  return (
    <div className="space-y-6 max-w-2xl">
      
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <Link href="/admin/kampanjer" className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" />
          Tilbake til kampanjer
        </Link>
        <h1 className="text-xl font-bold text-white">Opprett Ny Kampanje</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-slate-950/80 p-6 rounded-3xl border border-slate-800 space-y-6">
        
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-300">Kampanjenavn *</label>
          <input
            type="text"
            required
            placeholder="F.eks. Høstkampanje: 25% på alle seler"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-bold"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-300">Beskrivelse</label>
          <input
            type="text"
            placeholder="Kort forklaring til kunden..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300">Kampanjetype</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
            >
              <option value="percentage">Prosentvis rabatt (%)</option>
              <option value="bogo_3_for_2">3 for 2 (Billigste gratis)</option>
              <option value="fixed_amount">Fast beløp i rabatt (NOK)</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300">Rabattverdi ({type === 'percentage' ? '%' : 'kr'})</label>
            <input
              type="number"
              required
              value={value}
              onChange={(e) => setValue(Number(e.target.value))}
              className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-bold"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-300">Gjelder for kategori</label>
          <select
            value={categoryTarget}
            onChange={(e) => setCategoryTarget(e.target.value)}
            className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
          >
            {db.getCategories().map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300">Startdato</label>
            <input
              type="date"
              required
              value={startDate.slice(0, 10)}
              onChange={(e) => setStartDate(`${e.target.value}T00:00:00Z`)}
              className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300">Sluttdato</label>
            <input
              type="date"
              required
              value={endDate.slice(0, 10)}
              onChange={(e) => setEndDate(`${e.target.value}T23:59:59Z`)}
              className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
            />
          </div>
        </div>

        <div className="space-y-3 pt-3 border-t border-slate-800">
          <label className="text-xs font-bold text-white uppercase tracking-wider block">
            Forside Banner (Valgfritt)
          </label>
          <input
            type="text"
            placeholder="Overskrift på banner, f.eks: Gjør hunden klar for høstfjellet 🌲"
            value={bannerHeadline}
            onChange={(e) => setBannerHeadline(e.target.value)}
            className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
          />
          <input
            type="text"
            placeholder="Undertekst på banner..."
            value={bannerSubline}
            onChange={(e) => setBannerSubline(e.target.value)}
            className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-forest-700 hover:bg-forest-600 text-white font-bold py-3.5 px-6 rounded-2xl text-xs transition-all shadow-warm flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>Lagre og aktiver kampanje</span>
        </button>

      </form>
    </div>
  );
}
