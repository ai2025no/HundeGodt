'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Smile, Sparkles, ArrowRight } from 'lucide-react';
import { db } from '@/lib/db';
import { DogProfile, DogSize, ActivityLevel } from '@/types';
import { useDogStore } from '@/store/useDogStore';

export default function NewDogWizardPage() {
  const router = useRouter();
  const { setActiveDog } = useDogStore();

  const [name, setName] = useState('');
  const [breed, setBreed] = useState('');
  const [birthDate, setBirthDate] = useState('2023-05-15');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [weightKg, setWeightKg] = useState(14);
  const [size, setSize] = useState<DogSize>('medium');
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>('normal');
  const [allergiesInput, setAllergiesInput] = useState('');
  const [flavorInput, setFlavorInput] = useState('Oksekjøtt, Laks');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newDog: DogProfile = {
      id: `dog-${Date.now()}`,
      name: name.trim(),
      breed: breed.trim() || 'Blandingshund',
      birthDate,
      gender,
      weightKg: Number(weightKg),
      size,
      lifeStage: 'adult',
      activityLevel,
      allergies: allergiesInput ? allergiesInput.split(',').map((s) => s.trim()).filter(Boolean) : [],
      sensitivities: [],
      favoriteFlavors: flavorInput ? flavorInput.split(',').map((s) => s.trim()).filter(Boolean) : [],
      createdAt: new Date().toISOString(),
    };

    db.addDogToCustomer('cust-1', newDog);
    setActiveDog(newDog);
    router.push('/konto/hunder');
  };

  return (
    <div className="space-y-6 max-w-2xl">
      
      <div className="flex items-center justify-between border-b border-ash-border pb-4">
        <Link href="/konto/hunder" className="text-xs font-semibold text-cocoa-bean hover:text-midnight-ink flex items-center gap-1.5">
          <ArrowLeft className="w-4 h-4" />
          <span>Tilbake til mine hunder</span>
        </Link>
        <h2 className="font-display font-bold text-xl text-midnight-ink">Legg til ny hund</h2>
      </div>

      <form onSubmit={handleSubmit} className="card-finn space-y-6">
        
        <div className="space-y-4">
          <h3 className="font-display font-bold text-lg text-midnight-ink">1. Om hunden</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-cocoa-bean uppercase font-mono">Hundens Navn *</label>
              <input
                type="text"
                required
                placeholder="F.eks. Bella"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-finn w-full text-xs font-bold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-cocoa-bean uppercase font-mono">Rase</label>
              <input
                type="text"
                placeholder="F.eks. Cocker Spaniel"
                value={breed}
                onChange={(e) => setBreed(e.target.value)}
                className="input-finn w-full text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-cocoa-bean uppercase font-mono">Kjønn</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
                className="input-finn w-full text-xs cursor-pointer"
              >
                <option value="male">Gutt (Hannhund)</option>
                <option value="female">Jente (Tispe)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-cocoa-bean uppercase font-mono">Vekt (kg) *</label>
              <input
                type="number"
                step="0.5"
                required
                value={weightKg}
                onChange={(e) => setWeightKg(Number(e.target.value))}
                className="input-finn w-full text-xs font-bold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-cocoa-bean uppercase font-mono">Fødselsdato</label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="input-finn w-full text-xs cursor-pointer"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-ash-border">
          <h3 className="font-display font-bold text-lg text-midnight-ink">2. Helse & Allergier</h3>

          <div className="space-y-1">
            <label className="text-xs font-bold text-cocoa-bean uppercase font-mono">
              Fôrallergier (kommaseparert, f.eks: Kylling, Hvete, Soya)
            </label>
            <input
              type="text"
              placeholder="Kylling, Hvete..."
              value={allergiesInput}
              onChange={(e) => setAllergiesInput(e.target.value)}
              className="input-finn w-full text-xs"
            />
            <p className="text-[11px] text-stone-mute">
              Vi vil automatisk flagge produkter som inneholder disse ingrediensene.
            </p>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-cocoa-bean uppercase font-mono">
              Favorittsmaker (kommaseparert)
            </label>
            <input
              type="text"
              placeholder="Storfe, Laks, Hjort..."
              value={flavorInput}
              onChange={(e) => setFlavorInput(e.target.value)}
              className="input-finn w-full text-xs"
            />
          </div>
        </div>

        <button
          type="submit"
          className="btn-finn-primary w-full !py-4 text-base font-semibold"
        >
          <span>Lagre og aktiver hundeprofil</span>
          <ArrowRight className="w-4 h-4" />
        </button>

      </form>
    </div>
  );
}
