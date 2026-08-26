'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Boxes,
  AlertTriangle,
  Plus,
  Minus,
  CheckCircle2,
  RefreshCw,
  Search,
} from 'lucide-react';
import { db } from '@/lib/db';
import { Product } from '@/types';
import { formatPrice } from '@/lib/utils';
import { useAdminStore } from '@/store/useAdminStore';

export default function AdminInventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLowStockOnly, setFilterLowStockOnly] = useState(false);
  const currentUser = useAdminStore((state) => state.currentUser);

  const loadData = () => {
    setProducts(db.getProducts());
  };

  useEffect(() => {
    loadData();
    window.addEventListener('hg_storage_updated', loadData);
    return () => window.removeEventListener('hg_storage_updated', loadData);
  }, []);

  const handleAdjust = (productId: string, variantId: string, delta: number) => {
    db.adjustInventory(productId, variantId, delta, 'Manuell justering fra lagerpanel');
    loadData();
  };

  // Flatten all variants with their parent product info
  const variantRows = products.flatMap((p) =>
    p.variants.map((v) => ({
      productId: p.id,
      productName: p.name,
      productSlug: p.slug,
      brandName: p.brandName,
      imageUrl: p.images[0]?.url,
      variantId: v.id,
      variantTitle: v.title,
      sku: v.sku,
      barcode: v.barcode,
      quantity: v.inventoryQuantity,
      threshold: v.lowStockThreshold,
      priceNok: v.priceNok,
      isLow: v.inventoryQuantity <= v.lowStockThreshold,
    }))
  );

  const filteredRows = variantRows.filter((r) => {
    if (filterLowStockOnly && !r.isLow) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = r.productName.toLowerCase().includes(q);
      const matchSku = r.sku.toLowerCase().includes(q);
      if (!matchName && !matchSku) return false;
    }
    return true;
  });

  const totalUnits = variantRows.reduce((s, r) => s + r.quantity, 0);
  const lowStockCount = variantRows.filter((r) => r.isLow).length;
  const totalInventoryValueNok = variantRows.reduce((s, r) => s + r.quantity * (r.priceNok * 0.5), 0);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Lagerstyring & Beholdning</h1>
          <p className="text-xs text-slate-400 mt-1">
            Overvåk lagerstatus, sett innkjøpsgrenser og juster beholdning i sanntid.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            variantRows.filter((r) => r.isLow).forEach((r) => {
              db.adjustInventory(r.productId, r.variantId, 25, 'Automatisk bestilling av varer under grense');
            });
            loadData();
          }}
          className="px-4 py-2.5 bg-forest-700 hover:bg-forest-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Etterfyll alle med lav beholdning (+25 stk)</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-950/80 p-5 rounded-3xl border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 font-semibold">Totalt på lager</span>
          <span className="text-2xl font-bold text-white block">{totalUnits} enheter</span>
        </div>

        <div className="bg-slate-950/80 p-5 rounded-3xl border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 font-semibold">Varer under kritisk grense</span>
          <span className="text-2xl font-bold text-amber-400 block">{lowStockCount} varianter</span>
        </div>

        <div className="bg-slate-950/80 p-5 rounded-3xl border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 font-semibold">Estimert lagerverdi (kost)</span>
          <span className="text-2xl font-bold text-white block">{formatPrice(totalInventoryValueNok)}</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Søk produkt eller SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-forest-500"
          />
        </div>

        <label className="flex items-center gap-2 text-xs font-bold text-slate-300 cursor-pointer self-start sm:self-auto">
          <input
            type="checkbox"
            checked={filterLowStockOnly}
            onChange={(e) => setFilterLowStockOnly(e.target.checked)}
            className="rounded text-forest-600 focus:ring-forest-500 w-4 h-4"
          />
          <span>Vis kun lav beholdning ({lowStockCount})</span>
        </label>
      </div>

      {/* Inventory Table */}
      <div className="bg-slate-950/80 rounded-3xl border border-slate-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-4">Produkt / Variant</th>
                <th className="p-4">SKU / Strekkode</th>
                <th className="p-4">Status</th>
                <th className="p-4">På lager</th>
                <th className="p-4">Grenseverdi</th>
                <th className="p-4 text-right">Rask justering</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredRows.map((row) => (
                <tr key={row.variantId} className="hover:bg-slate-900/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl overflow-hidden relative bg-slate-900 shrink-0 border border-slate-800">
                        <Image src={row.imageUrl} alt={row.productName} fill className="object-cover" sizes="40px" />
                      </div>
                      <div>
                        <p className="font-bold text-white text-xs">{row.productName}</p>
                        <p className="text-[11px] text-slate-400">{row.variantTitle}</p>
                      </div>
                    </div>
                  </td>

                  <td className="p-4 font-mono text-slate-400">
                    <p>{row.sku}</p>
                    <p className="text-[10px] text-slate-500">{row.barcode}</p>
                  </td>

                  <td className="p-4">
                    {row.isLow ? (
                      <span className="bg-amber-900/60 text-amber-300 border border-amber-700 px-2 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Lav
                      </span>
                    ) : (
                      <span className="bg-forest-900/60 text-forest-300 border border-forest-700 px-2 py-0.5 rounded-full text-[10px] font-bold">
                        OK
                      </span>
                    )}
                  </td>

                  <td className="p-4 font-bold text-sm text-white">
                    {row.quantity} stk
                  </td>

                  <td className="p-4 text-slate-400">
                    ≤ {row.threshold} stk
                  </td>

                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleAdjust(row.productId, row.variantId, -1)}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-200"
                        title="-1 stk"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAdjust(row.productId, row.variantId, 1)}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-200"
                        title="+1 stk"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAdjust(row.productId, row.variantId, 10)}
                        className="px-2 py-1 bg-forest-800 hover:bg-forest-700 text-white rounded-lg text-[10px] font-bold"
                        title="+10 stk"
                      >
                        +10
                      </button>
                    </div>
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
