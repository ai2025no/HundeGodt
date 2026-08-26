'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { useDogStore } from '@/store/useDogStore';

export default function DogPersonalizationBanner() {
  const { activeDog } = useDogStore();

  return (
    <div className="w-full bg-sky-powder py-3.5 px-4 border-b border-ash-border">
      <div className="max-w-[1280px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-midnight-ink text-cloud-white flex items-center justify-center text-xs shrink-0">
            🐾
          </div>
          <div>
            {activeDog ? (
              <p className="text-xs sm:text-sm font-sans font-medium text-cocoa-bean">
                Viser skreddersydde anbefalinger for <strong className="text-midnight-ink font-bold">{activeDog.name}</strong> ({activeDog.breed}, {activeDog.weightKg} kg)
              </p>
            ) : (
              <p className="text-xs sm:text-sm font-sans font-medium text-cocoa-bean">
                Legg til din hund for å få automatiske fôrmengder og allergen-varsler
              </p>
            )}
          </div>
        </div>

        <Link
          href={activeDog ? '/konto/hunder' : '/konto/hunder/ny'}
          className="btn-finn-primary !py-1.5 !px-4 text-xs shrink-0"
        >
          <span>{activeDog ? 'Bytt hundeprofil' : 'Opprett hundeprofil'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>

      </div>
    </div>
  );
}
