'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Search,
  Eye,
  ShoppingBag,
  DollarSign,
  Globe,
  PieChart,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart as RePieChart,
  Pie,
  Cell,
} from 'recharts';
import { db } from '@/lib/db';
import { formatPrice } from '@/lib/utils';

const CATEGORY_SALES_DATA = [
  { name: 'Snacks & Godbiter', salg: 48500, color: '#418753' },
  { name: 'Tur & Trening', salg: 36200, color: '#224229' },
  { name: 'Hundefôr & Mat', salg: 52400, color: '#D9C3A5' },
  { name: 'Senger & Hjem', salg: 28900, color: '#C27D56' },
  { name: 'Leker & Aktivering', salg: 19800, color: '#5E7A68' },
  { name: 'Pleie & Helse', salg: 14300, color: '#829D8D' },
];

const TRAFFIC_SOURCES_DATA = [
  { kilde: 'Organisk Google', andel: 42 },
  { kilde: 'Direktetrafikk', andel: 28 },
  { kilde: 'Instagram / Meta', andel: 18 },
  { kilde: 'Nyhetsbrev', andel: 8 },
  { kilde: 'Annet', andel: 4 },
];

const POPULAR_SEARCH_LOGS = [
  { query: 'okselever', count: 412, convRate: '18.4%', convertedSales: 48900 },
  { query: 'y-sele', count: 289, convRate: '14.2%', convertedSales: 38200 },
  { query: 'valpefôr', count: 210, convRate: '16.8%', convertedSales: 31400 },
  { query: 'ortopedisk seng', count: 184, convRate: '11.5%', convertedSales: 29800 },
  { query: 'flåttmiddel', count: 94, convRate: '0.0%', convertedSales: 0 }, // zero search results example
  { query: 'kong leke', count: 142, convRate: '21.0%', convertedSales: 18900 },
];

export default function AdminAnalyticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('siste30');

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Business Intelligence & Analyse</h1>
          <p className="text-xs text-slate-400 mt-1">
            Salgsrapportering, søkeordsanalyse, traktomsetning og trafikkfordeling.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {['i_dag', 'siste7', 'siste30', 'dette_aret'].map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setSelectedPeriod(p)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                selectedPeriod === p ? 'bg-forest-700 text-white' : 'bg-slate-950 text-slate-400 hover:text-white'
              }`}
            >
              {p === 'i_dag' ? 'I dag' : p === 'siste7' ? 'Siste 7 dager' : p === 'siste30' ? 'Siste 30 dager' : '2026 Hittil'}
            </button>
          ))}
        </div>
      </div>

      {/* 1. SALES BY CATEGORY CHART */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        <div className="lg:col-span-8 bg-slate-950/80 p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4">
          <div>
            <h3 className="font-bold text-white text-base">Omsetning per Kategori (NOK)</h3>
            <p className="text-xs text-slate-400">Total salgsvolum fordelt på hovedkategorier</p>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={CATEGORY_SALES_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(v) => `${v / 1000}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                  formatter={(v: any) => [`${Number(v).toLocaleString('nb-NO')} kr`, 'Salgsomsetning']}
                />
                <Bar dataKey="salg" fill="#418753" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. TRAFFIC SOURCES */}
        <div className="lg:col-span-4 bg-slate-950/80 p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4">
          <div>
            <h3 className="font-bold text-white text-base">Trafikkanalyse</h3>
            <p className="text-xs text-slate-400">Hvor kommer kundene fra?</p>
          </div>

          <div className="space-y-3 pt-2">
            {TRAFFIC_SOURCES_DATA.map((t) => (
              <div key={t.kilde} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-300">{t.kilde}</span>
                  <span className="text-white">{t.andel}%</span>
                </div>
                <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                  <div className="h-full bg-forest-600 rounded-full" style={{ width: `${t.andel}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 3. SEARCH KEYWORDS INTELLIGENCE TABLE */}
      <div className="bg-slate-950/80 rounded-3xl border border-slate-800 shadow-xl overflow-hidden space-y-4 p-6">
        <div>
          <h3 className="font-bold text-white text-base">Søkeordsinnsikt & Konvertering</h3>
          <p className="text-xs text-slate-400">Hva søker brukerne etter, og hvilke søk fører til kjøp?</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-3">Søkeord</th>
                <th className="p-3">Antall søk</th>
                <th className="p-3">Konverteringsrate</th>
                <th className="p-3">Generert Omsetning</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {POPULAR_SEARCH_LOGS.map((log) => (
                <tr key={log.query} className="hover:bg-slate-900/50">
                  <td className="p-3 font-mono font-bold text-white">«{log.query}»</td>
                  <td className="p-3 font-bold">{log.count} søk</td>
                  <td className="p-3 text-forest-400 font-bold">{log.convRate}</td>
                  <td className="p-3 font-bold text-white">{formatPrice(log.convertedSales)}</td>
                  <td className="p-3">
                    {log.convertedSales === 0 ? (
                      <span className="bg-amber-900/60 text-amber-300 border border-amber-700 px-2 py-0.5 rounded-full text-[10px] font-bold">
                        ⚠️ Nulltreff - vurder innkjøp
                      </span>
                    ) : (
                      <span className="bg-forest-900/60 text-forest-300 border border-forest-700 px-2 py-0.5 rounded-full text-[10px] font-bold">
                        Høy konvertering
                      </span>
                    )}
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
