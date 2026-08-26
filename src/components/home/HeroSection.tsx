'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Check, Sparkles } from 'lucide-react';
import { CmsHeroBlock } from '@/types';
import { useDogStore } from '@/store/useDogStore';

interface HeroSectionProps {
  hero: CmsHeroBlock;
}

export default function HeroSection({ hero }: HeroSectionProps) {
  const activeDog = useDogStore((state) => state.activeDog);

  return (
    <section className="relative w-full bg-blush-petal overflow-hidden">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* LEFT COLUMN: EDITORIAL STATEMENT & PILL ACTIONS */}
          <div className="lg:col-span-6 space-y-6 sm:space-y-8">
            
            {/* Top pill tag */}
            <div className="inline-flex items-center gap-2 bg-cloud-white px-4 py-1.5 rounded-pill text-xs font-semibold text-midnight-ink">
              <Sparkles className="w-3.5 h-3.5 text-ember-orange" />
              <span>{hero.badgeText || 'Naturlig Norsk Hundepleie & Ernæring'}</span>
            </div>

            {/* Headline in Athletics display font */}
            <h1 className="font-display text-4xl sm:text-6xl lg:text-[72px] font-bold text-cocoa-bean tracking-tight leading-[1.05]">
              {activeDog ? (
                <>
                  Skreddersydd for <span className="underline decoration-ember-orange decoration-4 underline-offset-4">{activeDog.name}</span>
                </>
              ) : (
                hero.heading || 'Kjærlighet servert i hver eneste skål.'
              )}
            </h1>

            <p className="font-sans text-base sm:text-lg text-cocoa-bean/85 leading-relaxed max-w-lg">
              {hero.subheading || 'Kvalitetsfôr, naturlige godbiter og ergonomisk turutstyr. Nøye utvalgt av norske hundeeksperter og veterinærer.'}
            </p>

            {/* Two 60px Pill Buttons */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-2">
              <Link
                href={hero.primaryCtaLink || '/produkter'}
                className="btn-finn-primary !py-4 !px-8 text-base font-semibold"
              >
                <span>{hero.primaryCtaText || 'Kjøp nå'}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href={hero.secondaryCtaLink || '/guider'}
                className="btn-finn-outline hover:!bg-midnight-ink hover:!text-cloud-white !py-4 !px-8 text-base font-semibold transition-all"
              >
                <span>{hero.secondaryCtaText || 'Finn riktig fôr'}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Benefit Bullet Row */}
            <div className="pt-4 border-t border-cocoa-bean/10 flex flex-wrap gap-y-2 gap-x-6 text-xs sm:text-sm font-medium text-cocoa-bean">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-check-green text-cloud-white flex items-center justify-center">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
                <span>100% Naturlige råvarer</span>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-check-green text-cloud-white flex items-center justify-center">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
                <span>Veterinærgodkjent</span>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-check-green text-cloud-white flex items-center justify-center">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
                <span>Rask levering med Bring</span>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: FULL-BLEED LIFESTYLE PHOTO */}
          <div className="lg:col-span-6 relative">
            <div className="relative aspect-[4/3] sm:aspect-square w-full rounded-[24px] overflow-hidden bg-cloud-white/40">
              <Image
                src={hero.imageUrl || 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=1200&h=1200&q=85'}
                alt="Glad hund med sunn pels"
                fill
                priority
                className="object-cover object-center"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
