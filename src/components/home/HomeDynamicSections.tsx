'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  Sparkles,
  Check,
  Star,
  ShieldCheck,
  Heart,
  Award,
} from 'lucide-react';
import { Product, Category, Brand } from '@/types';
import ProductCard from '@/components/products/ProductCard';
import TreatWizard from '@/components/wizard/TreatWizard';

interface HomeDynamicSectionsProps {
  products: Product[];
  categories: Category[];
  brands: Brand[];
}

export default function HomeDynamicSections({
  products,
  categories,
  brands,
}: HomeDynamicSectionsProps) {
  const bestsellers = products.filter((p) => p.isBestseller).slice(0, 6);
  const puppyProducts = products.filter((p) => p.tags.includes('Valp') || p.categorySlug === 'valpegodbiter').slice(0, 3);

  return (
    <div className="w-full flex flex-col">
      
      {/* 1. PRESS & PARTNER LOGO STRIP (Full-width Sky Powder band) */}
      <section className="w-full bg-sky-powder py-8 sm:py-10 border-y border-ash-border">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <span className="text-[12px] font-bold text-midnight-ink/80 uppercase tracking-widest font-mono block">
            Omtalt og anbefalt av norske fagmiljøer & presse
          </span>

          <div className="flex flex-wrap items-center justify-around gap-8 sm:gap-12">
            {['Norsk Kennel Klub (NKK)', 'Hund & Fritid', 'Veterinærinstituttet', 'Dagens Næringsliv', 'VG Familie'].map((name) => (
              <span key={name} className="font-display font-bold text-lg sm:text-xl text-midnight-ink tracking-wide">
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* 2. CATEGORIES BUBBLE SECTION (Cloud White Canvas) */}
      <section className="w-full bg-cloud-white py-16 sm:py-24">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-ember-orange uppercase tracking-widest font-mono block mb-1">
                Utforsk Godbitene
              </span>
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-midnight-ink">
                Kategorier for enhver hund
              </h2>
            </div>

            <Link href="/produkter" className="btn-finn-ghost self-start sm:self-auto">
              <span>Se alle kategorier</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat, idx) => {
              const tints = ['bg-blush-petal/40', 'bg-sky-powder/50', 'bg-mint-tide/30', 'bg-blush-petal/30', 'bg-sky-powder/40', 'bg-fog-gray'];
              const bgTint = tints[idx % tints.length];

              return (
                <Link
                  key={cat.id}
                  href={`/produkter?kategori=${cat.slug}`}
                  className="group bg-fog-gray rounded-[20px] p-5 text-center transition-all duration-200 hover:bg-ash-border/50 flex flex-col items-center justify-between"
                >
                  <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden relative mb-3 ${bgTint} p-2`}>
                    <Image
                      src={cat.imageUrl}
                      alt={cat.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300 rounded-full"
                      sizes="100px"
                    />
                  </div>
                  <div>
                    <h3 className="font-sans font-medium text-xs sm:text-sm text-cocoa-bean group-hover:text-midnight-ink transition-colors">
                      {cat.name}
                    </h3>
                    <span className="text-[11px] text-stone-mute font-medium">
                      {products.filter((p) => p.categorySlug === cat.slug || p.categoryId === cat.id).length || 10} varer
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. BESTSELLERS PRODUCT GRID (Cloud White Canvas with Fog Gray cards) */}
      <section className="w-full bg-cloud-white py-12 sm:py-16 border-t border-ash-border">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-ember-orange uppercase tracking-widest font-mono block mb-1">
                Nordiske Godbiter
              </span>
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-midnight-ink">
                Mest populære godbiter akkurat nå
              </h2>
            </div>

            <Link href="/produkter" className="btn-finn-ghost self-start sm:self-auto">
              <span>Shop alle godbiter</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {bestsellers.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        </div>
      </section>

      {/* 4. GODBIT-VEIVISER INTERACTIVE SECTION (Full-bleed Blush/Sky Wash) */}
      <section className="w-full bg-sky-powder/35 py-16 sm:py-24 border-y border-ash-border">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold text-ember-orange uppercase tracking-widest font-mono block">
              Interaktiv Godbit-Veiviser 🪄
            </span>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-midnight-ink">
              Usikker på hva du skal velge?
            </h2>
            <p className="font-sans text-sm sm:text-base text-cocoa-bean/80">
              Svar på 3 raske spørsmål, så finner vi godbitene som passer hundens alder, størrelse og favorittsmak.
            </p>
          </div>

          <TreatWizard />
        </div>
      </section>

      {/* 4. FEATURE SPOTLIGHT: 2-COLUMN 100% TØRKET KJØTT (Full-bleed Mint Tide Wash) */}
      <section className="w-full bg-mint-tide/25 py-20 sm:py-24">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            
            {/* Left Photo */}
            <div className="lg:col-span-6 relative aspect-square sm:aspect-[4/3] rounded-[24px] overflow-hidden bg-cloud-white">
              <Image
                src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=1000&h=800&q=80"
                alt="Glad hund som spiser naturlig tørket godbit"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>

            {/* Right Text Block with Green Checkmark Bullets */}
            <div className="lg:col-span-6 space-y-6">
              <span className="text-xs font-bold text-midnight-ink uppercase tracking-widest font-mono block">
                100% Rent Norsk Kjøtt
              </span>
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-midnight-ink leading-[1.05]">
                Hvorfor velge skånsomt lufttørkede godbiter?
              </h2>
              <p className="font-sans text-sm sm:text-base text-cocoa-bean leading-relaxed">
                I motsetning til industrielle godbiter fulle av stivelse, sukker og biprodukter, lages våre godbiter av 100% ferskt norsk kjøtt. Langtidstørking ved lav temperatur bevarer den uimotståelige smaken og alle naturlige vitaminer.
              </p>

              {/* Benefit Bullets */}
              <div className="space-y-3 pt-2">
                {[
                  '100% rent kjøtt fra norske gårder og skoger',
                  'Helt kornfritt, uten sukker, salt eller kunstige farger',
                  'Hypoallergene proteinkilder for sensitive mager (lam, elg, kanin)',
                  'Kladdfrie biter som ikke smuler eller fettlegger lommene',
                ].map((text) => (
                  <div key={text} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-check-green text-cloud-white flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <span className="font-sans text-sm sm:text-base text-cocoa-bean font-medium">
                      {text}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <Link href="/produkter?kategori=torket-kjott" className="btn-finn-primary !py-4 !px-8 text-base font-semibold">
                  <span>Utforsk tørket kjøtt</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 5. DARK INVERTED ENDORSEMENT / VET TESTIMONIAL (Full-bleed Midnight Ink) */}
      <section className="w-full bg-midnight-ink py-20 sm:py-28 text-cloud-white">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-bold text-ember-orange uppercase tracking-widest font-mono">
              Faglig Kvalitetssikring
            </span>
            <h2 className="font-display text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-cloud-white leading-[1.05]">
              Elsket av firbente, anbefalt av veterinærer<span className="text-ember-orange">.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center pt-4">
            
            {/* Testimonial 1 */}
            <div className="bg-white/5 p-8 rounded-[20px] border border-white/10 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden relative shrink-0">
                  <Image
                    src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=200&h=200&q=80"
                    alt="Dr. Sofie Lindqvist"
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg text-cloud-white">Dr. Sofie Lindqvist</h3>
                  <p className="text-xs text-cloud-white/70 uppercase tracking-wider font-mono">
                    Smådyrveterinær & Ernæringsspesialist
                  </p>
                </div>
              </div>

              <blockquote className="font-sans text-sm sm:text-base text-cloud-white/95 italic leading-relaxed">
                «Hundegodt skiller seg ut ved å ha 100% transparens på ingredienser. Når pasienter med sensitiv mage spør meg om trygge godbiter, anbefaler jeg alltid tørket rent norsk kjøtt uten fyllstoffer.»
              </blockquote>

              <div className="flex items-center gap-1 text-ember-orange">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-white/5 p-8 rounded-[20px] border border-white/10 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden relative shrink-0">
                  <Image
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200&q=80"
                    alt="Martine & Golden Retrieveren Atlas"
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg text-cloud-white">Martine E.</h3>
                  <p className="text-xs text-cloud-white/70 uppercase tracking-wider font-mono">
                    Hundeeier til Golden Retrieveren Atlas (3 år)
                  </p>
                </div>
              </div>

              <blockquote className="font-sans text-sm sm:text-base text-cloud-white/95 italic leading-relaxed">
                «Atlas er ekstremt kresen på mat, men tørket okselever og lammekjøtt fra Hundegodt går ned på sekundet. I tillegg kom pakken levert på døren under 24 timer etter at jeg bestilte!»
              </blockquote>

              <div className="flex items-center gap-1 text-ember-orange">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 6. BRANDS LOGO GRID (Cloud White Canvas) */}
      <section className="w-full bg-cloud-white py-16 sm:py-24 text-center">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <span className="text-xs font-bold text-stone-mute uppercase tracking-widest font-mono block">
            Anerkjente Produsenter
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {brands.map((b) => (
              <div key={b.id} className="bg-fog-gray p-6 rounded-[20px] flex items-center justify-center hover:bg-ash-border/40 transition-colors">
                <span className="font-display font-bold text-sm sm:text-base text-midnight-ink">
                  {b.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
