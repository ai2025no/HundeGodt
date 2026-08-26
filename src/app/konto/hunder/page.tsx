'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Smile, Plus, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { db } from '@/lib/db';
import { CustomerProfile, DogProfile } from '@/types';
import { useDogStore } from '@/store/useDogStore';

export default function CustomerDogsPage() {
  const [dogs, setDogs] = useState<DogProfile[]>([]);
  const { activeDog, setActiveDog } = useDogStore();

  useEffect(() => {
    const custs = db.getCustomers();
    if (custs.length > 0) {
      setDogs(custs[0].dogs);
    }
  }, []);

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-ash-border pb-4">
        <div>
          <h2 className="font-display font-bold text-2xl text-midnight-ink">Mine Hunder</h2>
          <p className="text-xs text-stone-mute mt-1">
            Lagre helseopplysninger, rase og fôrallergier for hver enkelt hund.
          </p>
        </div>

        <Link
          href="/konto/hunder/ny"
          className="btn-finn-primary !py-2.5 !px-5 text-xs font-semibold self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Registrer ny hund</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {dogs.map((dog) => {
          const isSelected = activeDog?.id === dog.id;

          return (
            <div
              key={dog.id}
              className={`p-6 rounded-[20px] border transition-all ${
                isSelected
                  ? 'bg-cloud-white border-midnight-ink ring-1 ring-midnight-ink'
                  : 'bg-fog-gray border-ash-border'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-pill bg-blush-petal flex items-center justify-center text-2xl shrink-0">
                    🐶
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-display font-bold text-xl text-cocoa-bean">{dog.name}</h3>
                      {isSelected && (
                        <span className="bg-midnight-ink text-cloud-white text-[11px] font-bold px-3 py-0.5 rounded-pill">
                          Aktiv Profil
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-stone-mute font-sans mt-0.5">
                      {dog.breed} • {dog.weightKg} kg • {dog.gender === 'male' ? 'Gutt' : 'Jente'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {!isSelected && (
                    <button
                      type="button"
                      onClick={() => setActiveDog(dog)}
                      className="btn-finn-outline !py-2 !px-4 text-xs font-semibold"
                    >
                      <span>Aktiver profil</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Allergies and Details */}
              <div className="mt-4 pt-4 border-t border-ash-border grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="font-bold text-cocoa-bean block uppercase font-mono text-[10px] mb-1">
                    Registrerte Fôrallergier:
                  </span>
                  {dog.allergies.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {dog.allergies.map((a) => (
                        <span key={a} className="bg-ember-orange/15 text-cocoa-bean px-2.5 py-0.5 rounded-pill font-semibold">
                          ⚠️ {a}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-stone-mute">Ingen kjente fôrallergier</span>
                  )}
                </div>

                <div>
                  <span className="font-bold text-cocoa-bean block uppercase font-mono text-[10px] mb-1">
                    Favorittsmaker:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {dog.favoriteFlavors.map((f) => (
                      <span key={f} className="bg-sky-powder text-midnight-ink px-2.5 py-0.5 rounded-pill font-semibold">
                        🍗 {f}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
