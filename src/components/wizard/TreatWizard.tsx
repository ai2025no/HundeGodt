'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  ShoppingBag,
  RotateCcw,
  Heart,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Zap,
} from 'lucide-react';
import { db } from '@/lib/db';
import { Product, DogSize, DogLifeStage } from '@/types';
import { formatPrice } from '@/lib/utils';
import { useCartStore } from '@/store/useCartStore';
import { useDogStore } from '@/store/useDogStore';

// Step 1: Dog Size / Life Stage Options
const SIZE_OPTIONS = [
  {
    id: 'valp',
    label: 'Valp (under 1 år)',
    sublabel: 'Tannfelling & skånsom mage',
    lifeStage: 'puppy',
    size: 'small',
    image: 'https://images.unsplash.com/photo-1591160690555-5debfba289f0?auto=format&fit=crop&w=400&h=400&q=80',
    color: 'bg-blush-petal/40',
  },
  {
    id: 'liten',
    label: 'Liten hund (< 10 kg)',
    sublabel: 'Dachs, Chihuahua, Pom, Terrier',
    lifeStage: 'adult',
    size: 'small',
    image: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=400&h=400&q=80',
    color: 'bg-sky-powder/40',
  },
  {
    id: 'mellomstor',
    label: 'Mellomstor hund (10–25 kg)',
    sublabel: 'Border Collie, Spaniel, Toller',
    lifeStage: 'adult',
    size: 'medium',
    image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=400&h=400&q=80',
    color: 'bg-mint-tide/30',
  },
  {
    id: 'stor',
    label: 'Stor hund (25+ kg)',
    sublabel: 'Golden, Retriever, Schæfer, Husky',
    lifeStage: 'adult',
    size: 'large',
    image: 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=400&h=400&q=80',
    color: 'bg-amber-100/50',
  },
  {
    id: 'senior',
    label: 'Seniorhund (7+ år)',
    sublabel: 'Mindre leddbelastning & lett-tygd',
    lifeStage: 'senior',
    size: 'medium',
    image: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=400&h=400&q=80',
    color: 'bg-purple-100/40',
  },
];

// Step 2: Goal / Need Options
const GOAL_OPTIONS = [
  {
    id: 'trening',
    title: 'Trening & Hurtig Belønning',
    desc: 'Små, halvmyke biter som ikke smuler i lomma og gir 100% fokus.',
    icon: '⚡',
    categorySlug: 'trening-og-belonning',
    badge: 'Mest Valgt',
  },
  {
    id: 'langvarig-tygg',
    title: 'Langvarig Tygg & Alene-hjemme Kos',
    desc: 'Holdbare tygg som beroliger hunden, fjerner kjedsomhet og styrker kjeven.',
    icon: '🦴',
    categorySlug: 'tyggebein-og-kos',
    badge: 'Stressdempende',
  },
  {
    id: 'sensitiv-mage',
    title: 'Sensitiv Mage & Allergivennlig',
    desc: 'Single-protein råvarer (lam, elg, kanin) uten korn, kylling eller kunstige stoffer.',
    icon: '🌿',
    categorySlug: 'torket-kjott',
    badge: 'Skånsom',
  },
  {
    id: 'tannhelse',
    title: 'Tannrens & Frisk Pust',
    desc: 'Naturlig mekanisk tannrens og tang som motvirker plakk og tannstein.',
    icon: '✨',
    categorySlug: 'tannhelse-og-funksjonelt',
    badge: 'Frisk Pust',
  },
  {
    id: 'luksus-kos',
    title: 'Helgekos, Bursdag & Gave',
    desc: 'Det lille ekstra med variasjon av Norges beste tørkede snacks og godbiter.',
    icon: '🎁',
    categorySlug: 'gaveesker-og-mix',
    badge: 'Gavefavoritt',
  },
];

// Step 3: Flavor Preference
const FLAVOR_OPTIONS = [
  { id: 'okse', label: 'Norsk Storfe / Okse', desc: 'Kraftig og klassisk kjøttsmak', icon: '🥩' },
  { id: 'lam', label: 'Norsk Lam (Hypoallergen)', desc: 'Ekstremt skånsomt for magen', icon: '🐑' },
  { id: 'elg', label: 'Norsk Vilt & Elg', desc: 'Villmarkssmak med bær', icon: '🌲' },
  { id: 'kylling', label: 'Norsk Kylling', desc: 'Mager og sprø favoritt', icon: '🍗' },
  { id: 'laks', label: 'Villaks & Fisk', desc: 'Rik på Omega-3 for pels & poter', icon: '🐟' },
  { id: 'alle', label: 'Hunden min elsker alt!', desc: 'Blandede smaker og variasjon', icon: '🐾' },
];

export default function TreatWizard() {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [dogName, setDogName] = useState('Bestevennen');
  const [selectedSize, setSelectedSize] = useState<string>('mellomstor');
  const [selectedGoal, setSelectedGoal] = useState<string>('trening');
  const [selectedFlavor, setSelectedFlavor] = useState<string>('alle');
  const [addedAll, setAddedAll] = useState(false);

  const { addItem, openDrawer } = useCartStore();
  const { setActiveDog } = useDogStore();

  const allProducts = useMemo(() => db.getProducts(), []);

  // Compute matched products
  const matchedProducts = useMemo(() => {
    let filtered = [...allProducts];

    // Priority filter by Goal
    if (selectedGoal === 'trening') {
      filtered = filtered.filter((p) => p.categorySlug === 'trening-og-belonning' || p.categorySlug === 'torket-kjott');
    } else if (selectedGoal === 'langvarig-tygg') {
      filtered = filtered.filter((p) => p.categorySlug === 'tyggebein-og-kos');
    } else if (selectedGoal === 'sensitiv-mage') {
      filtered = filtered.filter((p) => p.tags.includes('Hypoallergen') || p.tags.includes('Single Protein') || p.categorySlug === 'torket-kjott');
    } else if (selectedGoal === 'tannhelse') {
      filtered = filtered.filter((p) => p.categorySlug === 'tannhelse-og-funksjonelt' || p.tags.includes('Naturlig tannrens'));
    } else if (selectedGoal === 'luksus-kos') {
      filtered = filtered.filter((p) => p.categorySlug === 'gaveesker-og-mix' || p.isBestseller);
    }

    // Size adjustment: For puppy, prioritize puppy tag
    if (selectedSize === 'valp') {
      const puppyFirst = [...allProducts.filter((p) => p.categorySlug === 'valpegodbiter' || p.tags.includes('Valp'))];
      filtered = Array.from(new Set([...puppyFirst, ...filtered]));
    }

    // Flavor filter if specific
    if (selectedFlavor !== 'alle') {
      const flavorMatches = filtered.filter((p) =>
        p.name.toLowerCase().includes(selectedFlavor) ||
        p.ingredients?.toLowerCase().includes(selectedFlavor) ||
        p.tags.some((t) => t.toLowerCase().includes(selectedFlavor))
      );
      if (flavorMatches.length > 0) {
        filtered = Array.from(new Set([...flavorMatches, ...filtered]));
      }
    }

    return filtered.slice(0, 3);
  }, [allProducts, selectedGoal, selectedSize, selectedFlavor]);

  const bundleTotal = matchedProducts.reduce((sum, p) => sum + p.basePriceNok, 0);
  const bundleDiscountPrice = Math.round(bundleTotal * 0.85); // 15% wizard discount

  const handleAddBundleToCart = () => {
    matchedProducts.forEach((p) => {
      if (p.variants.length > 0) {
        addItem(p, p.variants[0], 1);
      }
    });
    setAddedAll(true);
    openDrawer();
  };

  const handleSaveDogProfile = () => {
    const sizeConfig = SIZE_OPTIONS.find((s) => s.id === selectedSize);
    setActiveDog({
      id: `dog-wiz-${Date.now()}`,
      name: dogName.trim() || 'Hunden min',
      breed: sizeConfig?.label || 'Blandingsrase',
      gender: 'male',
      birthDate: selectedSize === 'valp' ? '2025-10-01' : '2023-01-01',
      weightKg: selectedSize === 'liten' ? 7 : selectedSize === 'mellomstor' ? 18 : 32,
      size: (sizeConfig?.size as DogSize) || 'medium',
      lifeStage: (sizeConfig?.lifeStage as DogLifeStage) || 'adult',
      activityLevel: 'high',
      allergies: selectedGoal === 'sensitiv-mage' ? ['Kylling', 'Korn'] : [],
      sensitivities: selectedGoal === 'sensitiv-mage' ? ['Sensitiv mage'] : [],
      favoriteFlavors: [selectedFlavor],
      createdAt: new Date().toISOString(),
    });
  };

  return (
    <div className="w-full bg-cloud-white rounded-[24px] border border-ash-border p-6 sm:p-10 shadow-sm max-w-4xl mx-auto">
      
      {/* Progress Bar & Header */}
      <div className="space-y-4 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-midnight-ink text-cloud-white text-xs font-bold flex items-center justify-center font-mono">
              {step < 4 ? `${step}/3` : '✓'}
            </span>
            <div>
              <span className="text-xs font-bold text-ember-orange uppercase tracking-wider font-mono block">
                Godbit-Veiviser 🪄
              </span>
              <h2 className="font-display text-xl sm:text-2xl font-bold text-midnight-ink">
                {step === 1 && 'Hvem skal vi finne godbiter til?'}
                {step === 2 && `Hva er målet for ${dogName}?`}
                {step === 3 && `Hvilke smaker elsker ${dogName}?`}
                {step === 4 && `Skreddersydd godbit-pakke for ${dogName}! 🎉`}
              </h2>
            </div>
          </div>

          {step > 1 && step < 4 && (
            <button
              type="button"
              onClick={() => setStep((step - 1) as any)}
              className="text-xs font-semibold text-stone-mute hover:text-cocoa-bean flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Tilbake</span>
            </button>
          )}
        </div>

        {/* 4 Step Progress Strip */}
        <div className="grid grid-cols-4 gap-2">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`h-1.5 rounded-pill transition-all duration-300 ${
                s <= step ? 'bg-midnight-ink' : 'bg-ash-border'
              }`}
            />
          ))}
        </div>
      </div>

      {/* ========================================== */}
      {/* STEG 1: STØRRELSE / ALDER + NAVN */}
      {/* ========================================== */}
      {step === 1 && (
        <div className="space-y-8 animate-fadeIn">
          {/* Dog Name Input */}
          <div className="bg-fog-gray p-5 rounded-[20px] space-y-2">
            <label className="text-xs font-bold text-cocoa-bean uppercase tracking-wider font-mono block">
              Hva heter hunden din? (Valgfritt)
            </label>
            <input
              type="text"
              placeholder="F.eks. Milo, Bella, Atlas..."
              value={dogName === 'Bestevennen' ? '' : dogName}
              onChange={(e) => setDogName(e.target.value || 'Bestevennen')}
              className="input-finn w-full max-w-sm text-sm"
            />
          </div>

          <div className="space-y-3">
            <label className="text-xs font-bold text-cocoa-bean uppercase tracking-wider font-mono block">
              Velg hundens type / livsfase:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {SIZE_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setSelectedSize(opt.id)}
                  className={`p-4 rounded-[20px] text-left transition-all border-2 flex items-center gap-4 ${
                    selectedSize === opt.id
                      ? 'border-midnight-ink bg-sky-powder/20 ring-2 ring-midnight-ink'
                      : 'border-ash-border bg-cloud-white hover:bg-fog-gray'
                  }`}
                >
                  <div className={`w-14 h-14 rounded-full overflow-hidden relative shrink-0 ${opt.color} p-1`}>
                    <Image
                      src={opt.image}
                      alt={opt.label}
                      fill
                      className="object-cover rounded-full"
                      sizes="60px"
                    />
                  </div>
                  <div>
                    <p className="font-display font-bold text-sm text-midnight-ink">{opt.label}</p>
                    <p className="text-[11px] text-stone-mute mt-0.5">{opt.sublabel}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-ash-border">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="btn-finn-primary !py-3.5 !px-8 text-sm font-semibold"
            >
              <span>Neste: Velg formål</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* STEG 2: FORMÅL / ANLEDNING */}
      {/* ========================================== */}
      {step === 2 && (
        <div className="space-y-6 animate-fadeIn">
          <p className="text-xs text-stone-mute">
            Velg hva du ønsker mest akkurat nå for <strong>{dogName}</strong>:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {GOAL_OPTIONS.map((goal) => (
              <button
                key={goal.id}
                type="button"
                onClick={() => setSelectedGoal(goal.id)}
                className={`p-5 rounded-[20px] text-left transition-all border-2 space-y-2 ${
                  selectedGoal === goal.id
                    ? 'border-midnight-ink bg-sky-powder/20 ring-2 ring-midnight-ink'
                    : 'border-ash-border bg-cloud-white hover:bg-fog-gray'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{goal.icon}</span>
                  <span className="bg-fog-gray text-cocoa-bean text-[10px] font-bold px-2.5 py-1 rounded-pill font-mono">
                    {goal.badge}
                  </span>
                </div>
                <h3 className="font-display font-bold text-base text-midnight-ink">{goal.title}</h3>
                <p className="text-xs text-cocoa-bean/80 leading-relaxed font-sans">{goal.desc}</p>
              </button>
            ))}
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-ash-border">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="btn-finn-ghost text-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Tilbake</span>
            </button>

            <button
              type="button"
              onClick={() => setStep(3)}
              className="btn-finn-primary !py-3.5 !px-8 text-sm font-semibold"
            >
              <span>Neste: Velg smak</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* STEG 3: SMAKSPREFERANSER */}
      {/* ========================================== */}
      {step === 3 && (
        <div className="space-y-6 animate-fadeIn">
          <p className="text-xs text-stone-mute">
            Hvilken proteinkilde og råvare får <strong>{dogName}</strong> til å logre mest?
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FLAVOR_OPTIONS.map((flavor) => (
              <button
                key={flavor.id}
                type="button"
                onClick={() => setSelectedFlavor(flavor.id)}
                className={`p-4 rounded-[20px] text-left transition-all border-2 flex items-center gap-3.5 ${
                  selectedFlavor === flavor.id
                    ? 'border-midnight-ink bg-sky-powder/20 ring-2 ring-midnight-ink'
                    : 'border-ash-border bg-cloud-white hover:bg-fog-gray'
                }`}
              >
                <span className="text-2xl">{flavor.icon}</span>
                <div>
                  <p className="font-display font-bold text-sm text-midnight-ink">{flavor.label}</p>
                  <p className="text-[11px] text-stone-mute">{flavor.desc}</p>
                </div>
              </button>
            ))}
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-ash-border">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="btn-finn-ghost text-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Tilbake</span>
            </button>

            <button
              type="button"
              onClick={() => {
                handleSaveDogProfile();
                setStep(4);
              }}
              className="btn-finn-primary !py-3.5 !px-8 text-sm font-semibold"
            >
              <span>Se anbefalinger 🎉</span>
              <Sparkles className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* STEG 4: SKREDDERSYDD RESULTATPAKKE */}
      {/* ========================================== */}
      {step === 4 && (
        <div className="space-y-8 animate-fadeIn">
          
          {/* Success Banner */}
          <div className="bg-sky-powder/50 p-6 rounded-[20px] border border-sky-powder flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <span className="inline-flex items-center gap-1.5 bg-cloud-white px-3 py-1 rounded-pill text-[11px] font-bold text-midnight-ink">
                <CheckCircle2 className="w-3.5 h-3.5 text-check-green" />
                <span>Perfekt match funnet for {dogName}!</span>
              </span>
              <h3 className="font-display text-xl sm:text-2xl font-bold text-midnight-ink">
                Skreddersydd 3-Pack Godbitpakke
              </h3>
              <p className="text-xs text-cocoa-bean/80">
                Kombinasjon av rene norske råvarer, tilpasset {selectedSize} og fokusert på {selectedGoal}.
              </p>
            </div>

            <div className="text-center sm:text-right shrink-0">
              <span className="text-xs text-stone-mute line-through block">{formatPrice(bundleTotal)}</span>
              <span className="font-display text-2xl font-bold text-midnight-ink block text-ember-orange">
                {formatPrice(bundleDiscountPrice)}
              </span>
              <span className="text-[11px] font-semibold text-check-green">Spar 15% som veiviser-pakke</span>
            </div>
          </div>

          {/* Recommended Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {matchedProducts.map((p, idx) => (
              <div key={p.id} className="bg-fog-gray rounded-[20px] p-4 flex flex-col justify-between border border-ash-border">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="bg-midnight-ink text-cloud-white text-[10px] font-bold px-2 py-0.5 rounded-pill font-mono">
                      Valg #{idx + 1}
                    </span>
                    <span className="text-[10px] font-bold text-ember-orange uppercase">100% Norsk</span>
                  </div>

                  <div className="relative aspect-square w-full rounded-[14px] bg-cloud-white overflow-hidden mb-3">
                    <Image
                      src={p.images[0]?.url || 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=400&h=400&q=80'}
                      alt={p.name}
                      fill
                      className="object-contain p-3"
                      sizes="200px"
                    />
                  </div>

                  <Link href={`/produkt/${p.slug}`} className="hover:text-midnight-ink transition-colors">
                    <h4 className="font-sans font-medium text-xs sm:text-sm text-cocoa-bean line-clamp-2 min-h-[36px]">
                      {p.name}
                    </h4>
                  </Link>
                </div>

                <div className="pt-3 mt-2 border-t border-ash-border flex items-center justify-between">
                  <span className="font-sans font-bold text-xs text-midnight-ink">{formatPrice(p.basePriceNok)}</span>
                  <button
                    type="button"
                    onClick={() => {
                      if (p.variants.length > 0) addItem(p, p.variants[0], 1);
                      openDrawer();
                    }}
                    className="btn-finn-ghost !py-1 !px-3 text-xs"
                  >
                    <span>+ Legg til</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-ash-border">
            <button
              type="button"
              onClick={() => {
                setStep(1);
                setAddedAll(false);
              }}
              className="text-xs font-semibold text-stone-mute hover:text-cocoa-bean flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Start veiviser på nytt</span>
            </button>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleAddBundleToCart}
                className="btn-finn-primary w-full sm:w-auto !py-4 !px-8 text-base font-semibold"
              >
                <ShoppingBag className="w-5 h-5" />
                <span>{addedAll ? 'Lagt i kurv! Åpne kasse' : `Kjøp hele pakken for ${formatPrice(bundleDiscountPrice)}`}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
