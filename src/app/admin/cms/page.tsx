'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  FileText,
  Save,
  ArrowUp,
  ArrowDown,
  Eye,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { db } from '@/lib/db';
import { CmsHeroBlock, CmsSectionBlock } from '@/types';
import { useAdminStore } from '@/store/useAdminStore';

export default function AdminCmsPage() {
  const [hero, setHero] = useState<CmsHeroBlock | null>(null);
  const [sections, setSections] = useState<CmsSectionBlock[]>([]);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const currentUser = useAdminStore((state) => state.currentUser);

  useEffect(() => {
    setHero(db.getHero());
    setSections(db.getCmsSections());
  }, []);

  const handleHeroSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hero) return;

    db.saveHero(hero);
    db.addAuditLog({
      adminName: currentUser.name,
      adminEmail: currentUser.email,
      adminRole: currentUser.role,
      action: 'Oppdaterte Hero Banner i CMS',
      entityType: 'cms',
      entityId: hero.id,
      entityName: 'Hovedbanner (Hero)',
      details: `Ny overskrift: ${hero.heading}`,
    });

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleToggleSection = (sectionId: string) => {
    const updated = sections.map((s) => (s.id === sectionId ? { ...s, isEnabled: !s.isEnabled } : s));
    setSections(updated);
    db.saveCmsSections(updated);
  };

  const handleMoveSection = (index: number, direction: 'up' | 'down') => {
    const copy = [...sections];
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= copy.length) return;

    const temp = copy[index];
    copy[index] = copy[target];
    copy[target] = temp;

    const updated = copy.map((s, i) => ({ ...s, sortOrder: i + 1 }));
    setSections(updated);
    db.saveCmsSections(updated);
  };

  if (!hero) return null;

  return (
    <div className="space-y-8 max-w-4xl">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Innholdsstyring (CMS)</h1>
          <p className="text-xs text-slate-400 mt-1">
            Rediger forside-tekster, bytt heltebanner og organiser seksjonsrekkefølge uten kode.
          </p>
        </div>

        {saveSuccess && (
          <span className="text-xs text-forest-400 font-bold flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4" /> Endringer er lagret og synlige i butikken!
          </span>
        )}
      </div>

      {/* 1. HERO BANNER EDITOR */}
      <form onSubmit={handleHeroSubmit} className="bg-slate-950/80 p-6 rounded-3xl border border-slate-800 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-sand-400" />
            <h3 className="font-bold text-white text-base">Hovedbanner (Hero)</h3>
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-forest-700 hover:bg-forest-600 text-white rounded-xl text-xs font-bold transition-all shadow-warm flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Lagre Hero</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300">Topp-tag / Badge</label>
            <input
              type="text"
              value={hero.badgeText}
              onChange={(e) => setHero({ ...hero, badgeText: e.target.value })}
              className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300">Hovedbilde URL</label>
            <input
              type="url"
              value={hero.imageUrl}
              onChange={(e) => setHero({ ...hero, imageUrl: e.target.value })}
              className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-mono"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-300">Hovedoverskrift</label>
          <input
            type="text"
            value={hero.heading}
            onChange={(e) => setHero({ ...hero, heading: e.target.value })}
            className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-bold"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-300">Undertekst / Budskap</label>
          <textarea
            rows={2}
            value={hero.subheading}
            onChange={(e) => setHero({ ...hero, subheading: e.target.value })}
            className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300">Hovedknapp Tekst & Lenke</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={hero.primaryCtaText}
                onChange={(e) => setHero({ ...hero, primaryCtaText: e.target.value })}
                className="w-1/2 p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
              />
              <input
                type="text"
                value={hero.primaryCtaLink}
                onChange={(e) => setHero({ ...hero, primaryCtaLink: e.target.value })}
                className="w-1/2 p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300">Sekundærknapp Tekst & Lenke</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={hero.secondaryCtaText}
                onChange={(e) => setHero({ ...hero, secondaryCtaText: e.target.value })}
                className="w-1/2 p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
              />
              <input
                type="text"
                value={hero.secondaryCtaLink}
                onChange={(e) => setHero({ ...hero, secondaryCtaLink: e.target.value })}
                className="w-1/2 p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
              />
            </div>
          </div>
        </div>
      </form>

      {/* 2. DYNAMIC HOMEPAGE SECTIONS MODULAR REORDERING */}
      <div className="bg-slate-950/80 p-6 rounded-3xl border border-slate-800 space-y-4">
        <h3 className="font-bold text-white text-base">Modulære Forsideseksjoner</h3>
        <p className="text-xs text-slate-400">Aktiver eller flytt rekkefølge på forsidens innholdsblokker.</p>

        <div className="space-y-2">
          {sections.map((sec, idx) => (
            <div
              key={sec.id}
              className="p-3.5 bg-slate-900 rounded-2xl border border-slate-800 flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <div className="flex flex-col">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => handleMoveSection(idx, 'up')}
                    className="text-slate-500 hover:text-white disabled:opacity-20"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={idx === sections.length - 1}
                    onClick={() => handleMoveSection(idx, 'down')}
                    className="text-slate-500 hover:text-white disabled:opacity-20"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div>
                  <p className="text-xs font-bold text-white">{sec.title}</p>
                  <p className="text-[11px] text-slate-400 font-mono">Modul: {sec.type}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleToggleSection(sec.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                    sec.isEnabled
                      ? 'bg-forest-900 text-forest-300 border border-forest-700'
                      : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  {sec.isEnabled ? 'Aktiv på forside ✓' : 'Deaktivert'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
