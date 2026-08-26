'use client';

import React, { useState, useEffect } from 'react';
import { Tag, Plus, CheckCircle2, Percent, DollarSign, ArrowRight } from 'lucide-react';
import { db } from '@/lib/db';
import { DiscountCode } from '@/types';
import { formatPrice, formatDateNorwegian } from '@/lib/utils';

export default function AdminDiscountCodesPage() {
  const [codes, setCodes] = useState<DiscountCode[]>([]);
  const [newCode, setNewCode] = useState('');
  const [newType, setNewType] = useState<'percentage' | 'fixed_amount'>('percentage');
  const [newValue, setNewValue] = useState(15);
  const [newMinSpend, setNewMinSpend] = useState(499);
  const [showAddModal, setShowAddModal] = useState(false);

  const loadData = () => {
    setCodes(db.getDiscountCodes());
  };

  useEffect(() => {
    loadData();
    window.addEventListener('hg_storage_updated', loadData);
    return () => window.removeEventListener('hg_storage_updated', loadData);
  }, []);

  const handleCreateCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim()) return;

    const created: DiscountCode = {
      id: `dc-${Date.now()}`,
      code: newCode.trim().toUpperCase(),
      type: newType,
      value: Number(newValue),
      minOrderAmountNok: Number(newMinSpend),
      maxUses: 500,
      currentUses: 0,
      onlyNewCustomers: false,
      oncePerCustomer: true,
      startDate: '2026-01-01T00:00:00Z',
      endDate: '2026-12-31T23:59:59Z',
      isActive: true,
      totalDiscountGivenNok: 0,
      totalOrderValueGeneratedNok: 0,
    };

    const currentCodes = db.getDiscountCodes();
    // save to local storage
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('hg_discounts_v1', JSON.stringify([created, ...currentCodes]));
      window.dispatchEvent(new CustomEvent('hg_storage_updated', { detail: { key: 'discounts' } }));
    }

    setShowAddModal(false);
    setNewCode('');
    loadData();
  };

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Rabattkoder ({codes.length})</h1>
          <p className="text-xs text-slate-400 mt-1">
            Administrer rabattkoder, bruksbegrensninger og ROI-statistikk.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-forest-700 hover:bg-forest-600 text-white rounded-xl text-xs font-bold transition-all shadow-warm flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Opprett ny rabattkode</span>
        </button>
      </div>

      {/* Codes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {codes.map((c) => (
          <div
            key={c.id}
            className="bg-slate-950/80 rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-forest-900/60 border border-forest-700 text-forest-300">
                  <Tag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-mono text-lg font-bold text-white tracking-wider">{c.code}</h3>
                  <p className="text-xs text-slate-400">
                    {c.type === 'percentage' ? `${c.value}% rabatt på hele ordren` : `${formatPrice(c.value)} fast avslag`}
                  </p>
                </div>
              </div>

              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                c.isActive ? 'bg-forest-900 text-forest-300 border border-forest-700' : 'bg-slate-800 text-slate-500'
              }`}>
                {c.isActive ? 'Aktiv' : 'Utløpt'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 p-3 bg-slate-900 rounded-2xl border border-slate-800 text-center text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block">Antall brukt</span>
                <strong className="text-white text-sm">{c.currentUses} ganger</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Minste kjøp</span>
                <strong className="text-white text-sm">{formatPrice(c.minOrderAmountNok)}</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Generert salg</span>
                <strong className="text-forest-400 text-sm">{formatPrice(c.totalOrderValueGeneratedNok)}</strong>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-2">
              <span>Gyldig til: {formatDateNorwegian(c.endDate)}</span>
              <span>{c.onlyNewCustomers ? 'Kun nye kunder' : 'Alle kunder'}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setShowAddModal(false)} className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" />
          <form
            onSubmit={handleCreateCode}
            className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-6 space-y-4 shadow-2xl z-10"
          >
            <h3 className="font-bold text-white text-lg">Opprett Rabattkode</h3>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">Kode (f.eks. SOMMER20) *</label>
              <input
                type="text"
                required
                placeholder="SOMMER20"
                value={newCode}
                onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white uppercase font-mono font-bold"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Type</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                >
                  <option value="percentage">Prosent (%)</option>
                  <option value="fixed_amount">Fast beløp (NOK)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Verdi</label>
                <input
                  type="number"
                  required
                  value={newValue}
                  onChange={(e) => setNewValue(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-bold"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">Minste ordreverdi (NOK)</label>
              <input
                type="number"
                value={newMinSpend}
                onChange={(e) => setNewMinSpend(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-2.5 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold"
              >
                Avbryt
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-forest-700 hover:bg-forest-600 text-white rounded-xl text-xs font-bold"
              >
                Opprett kode
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
