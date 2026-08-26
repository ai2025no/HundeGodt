'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Users,
  Search,
  Mail,
  Phone,
  Smile,
  DollarSign,
  ShoppingBag,
  ExternalLink,
} from 'lucide-react';
import { db } from '@/lib/db';
import { CustomerProfile } from '@/types';
import { formatPrice, formatDateNorwegian } from '@/lib/utils';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<CustomerProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = () => {
    setCustomers(db.getCustomers());
  };

  useEffect(() => {
    loadData();
    window.addEventListener('hg_storage_updated', loadData);
    return () => window.removeEventListener('hg_storage_updated', loadData);
  }, []);

  const filteredCustomers = customers.filter((c) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = `${c.firstName} ${c.lastName}`.toLowerCase().includes(q);
      const matchEmail = c.email.toLowerCase().includes(q);
      const matchDog = c.dogs.some((d) => d.name.toLowerCase().includes(q) || d.breed.toLowerCase().includes(q));
      if (!matchName && !matchEmail && !matchDog) return false;
    }
    return true;
  });

  const totalLtv = customers.reduce((s, c) => s + c.totalSpendNok, 0);

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Kunder & CRM ({customers.length})</h1>
          <p className="text-xs text-slate-400 mt-1">
            Kundeprofiler, livstidsverdi (LTV), registrerte hunder og kjøpsmønstre.
          </p>
        </div>

        <div className="bg-slate-950 px-4 py-2 rounded-2xl border border-slate-800 text-xs">
          <span className="text-slate-400">Total Kundeverdi: </span>
          <strong className="text-forest-400 font-bold text-sm">{formatPrice(totalLtv)}</strong>
        </div>
      </div>

      {/* Search */}
      <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Søk kunde, e-post, hundens navn..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-forest-500"
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-slate-950/80 rounded-3xl border border-slate-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-4">Kunde</th>
                <th className="p-4">Kontaktinfo</th>
                <th className="p-4">Registrerte Hunder</th>
                <th className="p-4">Antall Ordre</th>
                <th className="p-4">Livstidsverdi (LTV)</th>
                <th className="p-4">Kunde Siden</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredCustomers.map((cust) => (
                <tr key={cust.id} className="hover:bg-slate-900/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-forest-800 text-sand-200 font-bold flex items-center justify-center text-xs shrink-0">
                        {cust.firstName[0]}{cust.lastName[0]}
                      </div>
                      <div>
                        <p className="font-bold text-white text-xs sm:text-sm">{cust.firstName} {cust.lastName}</p>
                        <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-md font-mono">
                          ID: {cust.id}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="p-4 space-y-0.5">
                    <p className="text-white flex items-center gap-1">
                      <Mail className="w-3 h-3 text-slate-400" /> {cust.email}
                    </p>
                    <p className="text-slate-400 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-500" /> {cust.phone}
                    </p>
                  </td>

                  <td className="p-4">
                    <div className="flex flex-wrap gap-1.5">
                      {cust.dogs.map((dog) => (
                        <span key={dog.id} className="bg-slate-900 border border-slate-700 text-slate-200 px-2 py-1 rounded-xl text-[11px] font-semibold flex items-center gap-1">
                          <span>🐾 {dog.name}</span>
                          <span className="text-[10px] text-slate-400">({dog.breed})</span>
                        </span>
                      ))}
                    </div>
                  </td>

                  <td className="p-4 font-bold text-white">
                    {cust.orderCount} bestillinger
                  </td>

                  <td className="p-4 font-bold text-forest-400 text-sm">
                    {formatPrice(cust.totalSpendNok)}
                  </td>

                  <td className="p-4 text-slate-400">
                    {formatDateNorwegian(cust.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
