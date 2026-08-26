'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  ArrowUp,
  ArrowDown,
  ExternalLink,
} from 'lucide-react';
import { db } from '@/lib/db';
import { Category, Brand } from '@/types';
import { useAdminStore } from '@/store/useAdminStore';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const currentUser = useAdminStore((state) => state.currentUser);

  const loadData = () => {
    setCategories(db.getCategories());
    setBrands(db.getBrands());
  };

  useEffect(() => {
    loadData();
    window.addEventListener('hg_storage_updated', loadData);
    return () => window.removeEventListener('hg_storage_updated', loadData);
  }, []);

  const handleMoveOrder = (index: number, direction: 'up' | 'down') => {
    const copy = [...categories];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= copy.length) return;

    const temp = copy[index];
    copy[index] = copy[targetIndex];
    copy[targetIndex] = temp;

    // re-assign sortOrder
    const updated = copy.map((c, i) => ({ ...c, sortOrder: i + 1 }));
    db.saveCategories(updated);
    setCategories(updated);
  };

  return (
    <div className="space-y-8">
      
      {/* 1. CATEGORIES */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Kategoristruktur ({categories.length})</h1>
            <p className="text-xs text-slate-400 mt-1">
              Endre visningsrekkefølge, beskrivelser og kategoribilder.
            </p>
          </div>
        </div>

        <div className="bg-slate-950/80 rounded-3xl border border-slate-800 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-4">Rekkefølge</th>
                  <th className="p-4">Kategori</th>
                  <th className="p-4">Slug</th>
                  <th className="p-4">Beskrivelse</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Handlinger</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {categories.map((cat, idx) => (
                  <tr key={cat.id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-1 font-mono font-bold text-slate-400">
                        <span>#{cat.sortOrder}</span>
                        <div className="flex flex-col ml-1">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => handleMoveOrder(idx, 'up')}
                            className="text-slate-500 hover:text-white disabled:opacity-30"
                          >
                            <ArrowUp className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === categories.length - 1}
                            onClick={() => handleMoveOrder(idx, 'down')}
                            className="text-slate-500 hover:text-white disabled:opacity-30"
                          >
                            <ArrowDown className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl overflow-hidden relative bg-slate-900 shrink-0 border border-slate-800">
                          <Image src={cat.imageUrl} alt={cat.name} fill className="object-cover" sizes="40px" />
                        </div>
                        <span className="font-bold text-white text-sm">{cat.name}</span>
                      </div>
                    </td>

                    <td className="p-4 font-mono text-slate-400">
                      /kategori/{cat.slug}
                    </td>

                    <td className="p-4 text-slate-400 max-w-xs truncate">
                      {cat.description}
                    </td>

                    <td className="p-4">
                      <span className="bg-forest-900/60 text-forest-300 border border-forest-700 px-2 py-0.5 rounded-full text-[10px] font-bold">
                        Aktiv
                      </span>
                    </td>

                    <td className="p-4 text-right">
                      <a
                        href={`/produkter?kategori=${cat.slug}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 text-slate-400 hover:text-white"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 2. BRANDS REGISTER */}
      <div className="space-y-4 pt-6 border-t border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white">Merkevareregister ({brands.length})</h2>
          <p className="text-xs text-slate-400">Oversikt over godkjente leverandører og produsenter.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {brands.map((b) => (
            <div key={b.id} className="bg-slate-950/80 p-5 rounded-3xl border border-slate-800 shadow-subtle flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl overflow-hidden relative shrink-0 bg-slate-900 border border-slate-800">
                <Image src={b.logoUrl} alt={b.name} fill className="object-cover" sizes="48px" />
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white text-sm truncate">{b.name}</h3>
                  <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">{b.countryOfOrigin}</span>
                </div>
                <p className="text-xs text-slate-400 line-clamp-2">{b.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
