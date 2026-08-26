'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Users,
  ShoppingCart,
  AlertTriangle,
  RotateCcw,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle2,
  Package,
  Plus,
  BarChart2,
  Sparkles,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  CartesianGrid,
} from 'recharts';
import { db } from '@/lib/db';
import { AnalyticsSummary, Order, Product, Campaign } from '@/types';
import { formatPrice } from '@/lib/utils';

// Realistic 7-day revenue trend data
const REVENUE_CHART_DATA = [
  { day: 'Man', omsetning: 14200, ordre: 18 },
  { day: 'Tir', omsetning: 18900, ordre: 24 },
  { day: 'Ons', omsetning: 16400, ordre: 21 },
  { day: 'Tor', omsetning: 22100, ordre: 29 },
  { day: 'Fre', omsetning: 28400, ordre: 36 },
  { day: 'Lør', omsetning: 34200, ordre: 42 },
  { day: 'Søn', omsetning: 38900, ordre: 48 },
];

const FUNNEL_DATA = [
  { steg: 'Sidevisninger', verdi: 10420, fill: '#5E7A68' },
  { steg: 'Produktklikk', verdi: 3820, fill: '#418753' },
  { steg: 'Lagt i kurv', verdi: 860, fill: '#D9C3A5' },
  { steg: 'Checkout påbegynt', verdi: 510, fill: '#C27D56' },
  { steg: 'Gjennomført kjøp', verdi: 428, fill: '#224229' },
];

export default function AdminDashboardPage() {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  const loadData = () => {
    setSummary(db.getAnalyticsSummary());
    setOrders(db.getOrders());
    setProducts(db.getProducts());
    setCampaigns(db.getCampaigns());
  };

  useEffect(() => {
    loadData();
    window.addEventListener('hg_storage_updated', loadData);
    return () => window.removeEventListener('hg_storage_updated', loadData);
  }, []);

  if (!summary) return null;

  const pendingOrders = orders.filter((o) => o.status === 'processing' || o.status === 'paid' || o.status === 'pending');
  const lowStockProducts = products.filter((p) =>
    p.variants.some((v) => v.inventoryQuantity <= v.lowStockThreshold)
  );

  return (
    <div className="space-y-8">
      
      {/* 1. DASHBOARD HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Handelsoversikt</h1>
          <p className="text-xs text-slate-400 mt-1">
            Sanntidsstatus for Hundegodt.no • Siste oppdatering: akkurat nå
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/produkter/ny"
            className="px-4 py-2 bg-forest-700 hover:bg-forest-600 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nytt produkt</span>
          </Link>
          <Link
            href="/admin/ordrer"
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-colors border border-slate-700"
          >
            Behandle ordrer ({pendingOrders.length})
          </Link>
        </div>
      </div>

      {/* 2. TOP KPI CARDS GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Omsetning i dag / Måned */}
        <div className="bg-slate-950/80 p-5 rounded-3xl border border-slate-800 shadow-lg space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>Omsetning denne mnd</span>
            <span className="p-2 rounded-xl bg-forest-900/60 text-forest-400">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-bold text-white tracking-tight block">
              {formatPrice(summary.monthRevenueNok)}
            </span>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold mt-1">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>+{summary.revenueChangePercentVsLastMonth}% vs forrige mnd</span>
            </div>
          </div>
        </div>

        {/* KPI 2: Totalt antall ordre & AOV */}
        <div className="bg-slate-950/80 p-5 rounded-3xl border border-slate-800 shadow-lg space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>Ordre & Snittverdi</span>
            <span className="p-2 rounded-xl bg-blue-900/60 text-blue-400">
              <ShoppingBag className="w-4 h-4" />
            </span>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-bold text-white tracking-tight block">
              {summary.totalOrdersCount} <span className="text-sm font-normal text-slate-400">ordrer</span>
            </span>
            <p className="text-xs text-slate-400 mt-1">
              AOV: <strong className="text-white font-bold">{formatPrice(summary.averageOrderValueNok)}</strong>
            </p>
          </div>
        </div>

        {/* KPI 3: Konverteringsrate */}
        <div className="bg-slate-950/80 p-5 rounded-3xl border border-slate-800 shadow-lg space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>Konverteringsrate</span>
            <span className="p-2 rounded-xl bg-purple-900/60 text-purple-400">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-bold text-white tracking-tight block">
              {summary.conversionRatePercent}%
            </span>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold mt-1">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>+{summary.conversionRateChangePercent}% denne uken</span>
            </div>
          </div>
        </div>

        {/* KPI 4: Kunder & Gjenkjøp */}
        <div className="bg-slate-950/80 p-5 rounded-3xl border border-slate-800 shadow-lg space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>Registrerte Kunder</span>
            <span className="p-2 rounded-xl bg-amber-900/60 text-amber-400">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-bold text-white tracking-tight block">
              {summary.totalCustomersCount}
            </span>
            <p className="text-xs text-slate-400 mt-1">
              <strong className="text-white">{summary.newCustomersThisMonth} nye</strong> denne måneden
            </p>
          </div>
        </div>

      </div>

      {/* 3. CHARTS: REVENUE TREND & CONVERSION FUNNEL */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Chart: Revenue Trend */}
        <div className="lg:col-span-7 bg-slate-950/80 p-6 rounded-3xl border border-slate-800 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-white text-base">Omsetningsutvikling (Siste 7 dager)</h3>
              <p className="text-xs text-slate-400">Daglig salg i NOK mot ordretall</p>
            </div>
            <span className="text-xs font-bold bg-forest-900/80 text-forest-300 px-2.5 py-1 rounded-lg border border-forest-700">
              Uke 34
            </span>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={REVENUE_CHART_DATA}>
                <defs>
                  <linearGradient id="omsetningGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#418753" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#418753" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={(v) => `${v / 1000}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                  formatter={(value: any) => [`${Number(value).toLocaleString('nb-NO')} kr`, 'Omsetning']}
                />
                <Area type="monotone" dataKey="omsetning" stroke="#418753" strokeWidth={3} fillOpacity={1} fill="url(#omsetningGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Chart: Funnel */}
        <div className="lg:col-span-5 bg-slate-950/80 p-6 rounded-3xl border border-slate-800 shadow-lg space-y-4">
          <div>
            <h3 className="font-bold text-white text-base">Konverteringstrakt (Funnel)</h3>
            <p className="text-xs text-slate-400">Fra visning til gjennomført kjøp</p>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={FUNNEL_DATA}>
                <XAxis type="number" stroke="#94a3b8" fontSize={11} />
                <YAxis dataKey="steg" type="category" stroke="#94a3b8" fontSize={11} width={110} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                  formatter={(val: any) => [val, 'Brukere']}
                />
                <Bar dataKey="verdi" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* 4. ACTION QUEUE & LOW STOCK ALERTS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Pending Orders to Pack */}
        <div className="lg:col-span-7 bg-slate-950/80 p-6 rounded-3xl border border-slate-800 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-forest-400" />
              <h3 className="font-bold text-white text-base">Ordrer som krever pakking ({pendingOrders.length})</h3>
            </div>
            <Link href="/admin/ordrer" className="text-xs text-forest-400 hover:underline font-bold">
              Se alle →
            </Link>
          </div>

          <div className="space-y-3">
            {pendingOrders.map((ord) => (
              <div
                key={ord.id}
                className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-4"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white">{ord.orderNumber}</span>
                    <span className="text-[10px] bg-amber-900/60 text-amber-300 border border-amber-700 px-2 py-0.5 rounded-full font-bold">
                      {ord.status === 'processing' ? 'Må pakkes' : 'Ny betaling'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 truncate">
                    Kunde: <strong>{ord.customerName}</strong> • {ord.items.length} varer ({formatPrice(ord.totalNok)})
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      db.updateOrderStatus(ord.id, 'shipped', '370720124891999999NO', 'Admin Dashboard');
                    }}
                    className="px-3 py-1.5 bg-forest-700 hover:bg-forest-600 text-white rounded-xl text-xs font-bold transition-colors"
                  >
                    Merk sendt ✓
                  </button>
                  <Link
                    href={`/admin/ordrer/${ord.id}`}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 text-xs"
                  >
                    Detaljer
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="lg:col-span-5 bg-slate-950/80 p-6 rounded-3xl border border-slate-800 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-400">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="font-bold text-white text-base">Lav lagerbeholdning ({lowStockProducts.length})</h3>
            </div>
            <Link href="/admin/lager" className="text-xs text-amber-400 hover:underline font-bold">
              Lageroversikt →
            </Link>
          </div>

          <div className="space-y-3">
            {lowStockProducts.map((prod) => {
              const lowVar = prod.variants.find((v) => v.inventoryQuantity <= v.lowStockThreshold) || prod.variants[0];
              return (
                <div
                  key={prod.id}
                  className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl overflow-hidden relative bg-slate-800 shrink-0">
                      <Image src={prod.images[0]?.url} alt={prod.name} fill className="object-cover" sizes="40px" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate">{prod.name}</p>
                      <p className="text-[11px] text-amber-400 font-bold">
                        Kun {lowVar.inventoryQuantity} stk igjen (grense {lowVar.lowStockThreshold})
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      db.adjustInventory(prod.id, lowVar.id, 20, 'Hurtigpåfyll fra dashboard');
                    }}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold shrink-0 transition-colors"
                  >
                    +20 stk
                  </button>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
}
