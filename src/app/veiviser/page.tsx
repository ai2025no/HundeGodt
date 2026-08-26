'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, ArrowLeft, ShieldCheck, Truck, Heart } from 'lucide-react';
import TreatWizard from '@/components/wizard/TreatWizard';

export default function VeiviserPage() {
  return (
    <div className="w-full bg-fog-gray py-12 sm:py-16 min-h-[85vh]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Header Breadcrumb & Introduction */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 bg-cloud-white px-4 py-1.5 rounded-pill text-xs font-semibold text-midnight-ink border border-ash-border">
            <Sparkles className="w-3.5 h-3.5 text-ember-orange" />
            <span>Skreddersydd Hundegodt-Guide</span>
          </div>

          <h1 className="font-display text-3xl sm:text-5xl font-bold text-midnight-ink leading-[1.05]">
            Finn det perfekte godt til hunden din
          </h1>

          <p className="font-sans text-sm sm:text-base text-cocoa-bean/80 leading-relaxed">
            Svar på 3 enkle spørsmål om din hund, så matcher vi de reneste norske godbitene og tyggebeinene med 100% smaksgaranti.
          </p>
        </div>

        {/* The Wizard Component */}
        <TreatWizard />

        {/* Trust Points */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto pt-6 text-center text-xs text-cocoa-bean font-medium">
          <div className="p-4 bg-cloud-white rounded-[20px] border border-ash-border flex items-center justify-center gap-3">
            <ShieldCheck className="w-5 h-5 text-check-green shrink-0" />
            <span>100% Smaksgaranti</span>
          </div>
          <div className="p-4 bg-cloud-white rounded-[20px] border border-ash-border flex items-center justify-center gap-3">
            <Truck className="w-5 h-5 text-midnight-ink shrink-0" />
            <span>Sendes innen 24t med Bring</span>
          </div>
          <div className="p-4 bg-cloud-white rounded-[20px] border border-ash-border flex items-center justify-center gap-3">
            <Heart className="w-5 h-5 text-ember-orange shrink-0" />
            <span>100% Norske rene råvarer</span>
          </div>
        </div>

      </div>
    </div>
  );
}
