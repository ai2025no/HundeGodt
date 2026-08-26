'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Calculator,
  BookOpen,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Smile,
  Bone,
  CheckCircle2,
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { useDogStore } from '@/store/useDogStore';

const GUIDES_DATA = [
  {
    id: 'g-valp',
    title: 'Komplett guide: Den første tiden med valp i hus',
    readTime: '6 min lesetid',
    category: 'Valpestart',
    snippet: 'Alt du trenger å vite om fôringsrutiner, sosialisering, tannkløe og hvordan du unngår vanlige nybegynnerfeil.',
    imageUrl: 'https://images.unsplash.com/photo-1591160690555-5debfba289f0?auto=format&fit=crop&w=600&h=400&q=80',
  },
  {
    id: 'g-ernaring',
    title: 'Kornfritt eller ikke? Hva sier veterinærene om hundefôr?',
    readTime: '8 min lesetid',
    category: 'Ernæring & Helse',
    snippet: 'En grundig gjennomgang av råfôring, tørrfôr med høyt kjøttinnhold og hvordan du oppdager fôrallergier tidlig.',
    imageUrl: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?auto=format&fit=crop&w=600&h=400&q=80',
  },
  {
    id: 'g-tur',
    title: 'Hvordan velge riktig Y-sele for din hunds anatomi',
    readTime: '5 min lesetid',
    category: 'Tur & Utstyr',
    snippet: 'Hvorfor ergonomisk passform forhindrer rygg- og nakkeskader, og hvordan du måler hals- og brystomkrets nøyaktig.',
    imageUrl: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=600&h=400&q=80',
  },
];

export default function GuidesPage() {
  const activeDog = useDogStore((state) => state.activeDog);
  const [weightKg, setWeightKg] = useState(activeDog?.weightKg || 14);
  const [activityFactor, setActivityFactor] = useState<'normal' | 'high' | 'working'>('normal');

  const factorMultiplier = activityFactor === 'normal' ? 14 : activityFactor === 'high' ? 18 : 23;
  const recommendedGrams = Math.round(weightKg * factorMultiplier);
  const bagDuration12kg = Math.round(12000 / (recommendedGrams || 1));

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-16">
      
      {/* 1. HERO */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 bg-blush-petal px-4 py-1.5 rounded-pill text-xs font-semibold text-cocoa-bean">
          <BookOpen className="w-3.5 h-3.5 text-midnight-ink" />
          <span>Hundegodt Kunnskapsbase</span>
        </div>
        <h1 className="font-display text-4xl sm:text-5xl font-bold text-midnight-ink">
          Guider, Tips & Fôringsveiledning
        </h1>
        <p className="text-xs sm:text-sm text-stone-mute leading-relaxed font-sans">
          Skrevet av norske hundeeksperter og ernæringsfysiologer for å gi hunden din et langt, sunt og aktivt liv.
        </p>
      </div>

      {/* 2. INTERACTIVE STANDALONE FEEDING CALCULATOR */}
      <section className="bg-sky-powder/40 rounded-[24px] p-6 sm:p-10 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-ash-border pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-midnight-ink uppercase tracking-wider mb-1 font-mono">
              <Calculator className="w-4 h-4 text-ember-orange" />
              <span>Norsk Fôrkalkulator</span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-midnight-ink">
              Beregn hundens daglige fôrbehov
            </h2>
            {activeDog && (
              <p className="text-xs text-midnight-ink font-semibold mt-1">
                🐶 Forhåndsutfylt med vekten til <strong>{activeDog.name}</strong> ({activeDog.weightKg} kg)
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-bold text-cocoa-bean">
                <span>Hundens Nåværende Vekt:</span>
                <span className="font-display text-2xl text-midnight-ink">{weightKg} kg</span>
              </div>
              <input
                type="range"
                min={2}
                max={65}
                step={0.5}
                value={weightKg}
                onChange={(e) => setWeightKg(Number(e.target.value))}
                className="w-full accent-midnight-ink"
              />
              <div className="flex justify-between text-[11px] text-stone-mute font-semibold">
                <span>Liten (2 kg)</span>
                <span>Medium (20 kg)</span>
                <span>Gigant (60 kg+)</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-cocoa-bean uppercase font-mono block">Aktivitetsnivå:</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'normal', label: 'Normal (1-2t tur)' },
                  { id: 'high', label: 'Aktiv (3t+ tur / fjell)' },
                  { id: 'working', label: 'Trekk / Brukshund' },
                ].map((act) => (
                  <button
                    key={act.id}
                    type="button"
                    onClick={() => setActivityFactor(act.id as any)}
                    className={`p-2.5 rounded-pill text-xs font-semibold text-center transition-all ${
                      activityFactor === act.id
                        ? 'bg-midnight-ink text-cloud-white'
                        : 'bg-cloud-white text-cocoa-bean hover:bg-ash-border'
                    }`}
                  >
                    {act.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-cloud-white rounded-[20px] p-6 sm:p-8 space-y-4 text-center">
            <span className="text-xs font-bold text-stone-mute uppercase tracking-wider block font-mono">
              Anbefalt dagsmengde:
            </span>
            <strong className="text-4xl sm:text-5xl font-display font-bold text-midnight-ink block">
              {recommendedGrams} g / dag
            </strong>
            <p className="text-xs text-stone-mute max-w-xs mx-auto">
              Fordeles på 2 måltider (f.eks. {Math.round(recommendedGrams / 2)} g morgen og {Math.round(recommendedGrams / 2)} g kveld).
            </p>

            <div className="pt-4 border-t border-ash-border flex justify-around text-xs text-cocoa-bean">
              <div>
                <span className="text-stone-mute block">2 kg pose varer:</span>
                <strong className="font-bold">{Math.round(2000 / recommendedGrams)} dager</strong>
              </div>
              <div>
                <span className="text-stone-mute block">12 kg sekk varer:</span>
                <strong className="font-bold">{bagDuration12kg} dager</strong>
              </div>
            </div>

            <Link
              href="/produkter?kategori=mat"
              className="btn-finn-primary w-full !py-3 text-xs mt-2"
            >
              <span>Finn passende fôr i butikken</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

        </div>
      </section>

      {/* 3. ARTICLES LIST */}
      <section className="space-y-6">
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-midnight-ink">Nyeste Artikler & Råd</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {GUIDES_DATA.map((guide) => (
            <div
              key={guide.id}
              className="card-finn overflow-hidden flex flex-col justify-between group"
            >
              <div className="relative aspect-[16/10] w-full rounded-[16px] overflow-hidden bg-cloud-white mb-4">
                <Image
                  src={guide.imageUrl}
                  alt={guide.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="400px"
                />
                <span className="absolute top-3 left-3 bg-cloud-white/90 px-3 py-1 rounded-pill text-[11px] font-bold text-midnight-ink">
                  {guide.category}
                </span>
              </div>

              <div className="space-y-2 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[11px] text-stone-mute font-semibold">{guide.readTime}</span>
                  <h3 className="font-sans font-medium text-base text-cocoa-bean mt-1 leading-snug group-hover:text-midnight-ink transition-colors">
                    {guide.title}
                  </h3>
                  <p className="text-xs text-stone-mute mt-2 leading-relaxed">{guide.snippet}</p>
                </div>

                <div className="pt-4 flex items-center gap-1 text-xs font-semibold text-midnight-ink group-hover:underline">
                  <span>Les hele artikkelen</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
