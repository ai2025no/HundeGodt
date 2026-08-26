'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Boxes,
  Plus,
  Search,
  Edit2,
  Trash2,
  Copy,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
} from 'lucide-react';
import { db } from '@/lib/db';
import { Product } from '@/types';
import { formatPrice } from '@/lib/utils';
import { useAdminStore } from '@/store/useAdminStore';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('alle');
  const currentUser = useAdminStore((state) => state.currentUser);

  const loadData = () => {
    setProducts(db.getProducts());
  };

  useEffect(() => {
    loadData();
    window.addEventListener('hg_storage_updated', loadData);
    return () => window.removeEventListener('hg_storage_updated', loadData);
  }, []);

  const handleDelete = (productId: string, name: string) => {
    if (confirm(`Er du sikker på at du vil slette «${name}»?`)) {
      db.deleteProduct(productId, currentUser.name);
      loadData();
    }
  };

  const handleDuplicate = (prod: Product) => {
    const duplicated: Product = {
      ...prod,
      id: `prod-${Date.now()}`,
      name: `${prod.name} (Kopi)`,
      slug: `${prod.slug}-kopi-${Date.now().toString().slice(-4)}`,
      sku: `${prod.sku}-KOPI`,
    };
    db.saveProduct(duplicated, currentUser.name);
    loadData();
  };

  const filteredProducts = products.filter((p) => {
    if (selectedCategory !== 'alle' && p.categorySlug !== selectedCategory) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = p.name.toLowerCase().includes(q);
      const matchSku = p.sku.toLowerCase().includes(q);
      const matchBrand = p.brandName.toLowerCase().includes(q);
      if (!matchName && !matchSku && !matchBrand) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Produkter ({products.length})
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Opprett, rediger priser, administrer varianter og bilder.
          </p>
        </div>

        <Link
          href="/admin/produkter/ny"
          className="px-4 py-2.5 bg-forest-700 hover:bg-forest-600 text-white rounded-xl text-xs font-bold transition-all shadow-warm flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Opprett nytt produkt</span>
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Søk produkt, SKU, merke..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-forest-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-slate-200 text-xs font-semibold py-2 px-3 rounded-xl focus:outline-none"
          >
            <option value="alle">Alle kategorier</option>
            <option value="mat">Hundefôr & Mat</option>
            <option value="godbiter">Snacks & Godbiter</option>
            <option value="tur-og-trening">Tur & Trening</option>
            <option value="leker">Leker & Aktivering</option>
            <option value="seng-og-hjem">Senger & Hjem</option>
            <option value="pleie-og-helse">Pleie & Helse</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-slate-950/80 rounded-3xl border border-slate-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-4">Produkt</th>
                <th className="p-4">Kategori & Merke</th>
                <th className="p-4">Utsalgspris</th>
                <th className="p-4">Kostpris</th>
                <th className="p-4">Lagerbeholdning</th>
                <th className="p-4">Varianter</th>
                <th className="p-4 text-right">Handlinger</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredProducts.map((p) => {
                const totalStock = p.variants.reduce((sum, v) => sum + v.inventoryQuantity, 0);
                const isLowStock = p.variants.some((v) => v.inventoryQuantity <= v.lowStockThreshold);

                return (
                  <tr key={p.id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl overflow-hidden relative bg-slate-900 shrink-0 border border-slate-800">
                          <Image src={p.images[0]?.url} alt={p.name} fill className="object-cover" sizes="48px" />
                        </div>
                        <div>
                          <p className="font-bold text-white text-xs sm:text-sm">{p.name}</p>
                          <p className="text-[11px] text-slate-400 font-mono">SKU: {p.sku}</p>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <p className="font-bold text-white">{p.categoryName}</p>
                      <p className="text-[11px] text-slate-400">{p.brandName}</p>
                    </td>

                    <td className="p-4 font-bold text-white">
                      {formatPrice(p.basePriceNok)}
                      {p.compareAtPriceNok && (
                        <span className="block text-[11px] text-slate-500 line-through">
                          {formatPrice(p.compareAtPriceNok)}
                        </span>
                      )}
                    </td>

                    <td className="p-4 text-slate-400">
                      {formatPrice(p.costPriceNok)}
                      <span className="block text-[10px] text-emerald-400">
                        Margin: {Math.round(((p.basePriceNok - p.costPriceNok) / p.basePriceNok) * 100)}%
                      </span>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            totalStock > 10 ? 'bg-emerald-400' : totalStock > 0 ? 'bg-amber-400' : 'bg-red-500'
                          }`}
                        />
                        <span className="font-bold text-white">{totalStock} stk</span>
                      </div>
                      {isLowStock && (
                        <span className="text-[10px] text-amber-400 font-semibold block">Lav beholdning!</span>
                      )}
                    </td>

                    <td className="p-4 text-slate-300">
                      {p.variants.length} variant{p.variants.length > 1 ? 'er' : ''}
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/produkt/${p.slug}`}
                          target="_blank"
                          className="p-1.5 text-slate-400 hover:text-white rounded-lg"
                          title="Se i butikk"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDuplicate(p)}
                          className="p-1.5 text-slate-400 hover:text-white rounded-lg"
                          title="Dupliser produkt"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(p.id, p.name)}
                          className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg"
                          title="Slett produkt"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
