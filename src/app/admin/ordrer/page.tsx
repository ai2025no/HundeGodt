'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Package,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Truck,
  RotateCcw,
  Eye,
  FileText,
  Printer,
  ChevronRight,
} from 'lucide-react';
import { db } from '@/lib/db';
import { Order, OrderStatus } from '@/types';
import { formatPrice, formatDateTimeNorwegian } from '@/lib/utils';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('alle');
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = () => {
    setOrders(db.getOrders());
  };

  useEffect(() => {
    loadData();
    window.addEventListener('hg_storage_updated', loadData);
    return () => window.removeEventListener('hg_storage_updated', loadData);
  }, []);

  const filteredOrders = orders.filter((o) => {
    if (statusFilter !== 'alle' && o.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchNum = o.orderNumber.toLowerCase().includes(q);
      const matchName = o.customerName.toLowerCase().includes(q);
      const matchEmail = o.customerEmail.toLowerCase().includes(q);
      if (!matchNum && !matchName && !matchEmail) return false;
    }
    return true;
  });

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'paid':
        return <span className="bg-blue-900/60 text-blue-300 border border-blue-700 px-2.5 py-0.5 rounded-full text-xs font-bold">Betalt</span>;
      case 'processing':
        return <span className="bg-amber-900/60 text-amber-300 border border-amber-700 px-2.5 py-0.5 rounded-full text-xs font-bold">Behandles / Pakkes</span>;
      case 'shipped':
        return <span className="bg-forest-900/60 text-forest-300 border border-forest-700 px-2.5 py-0.5 rounded-full text-xs font-bold">Sendt</span>;
      case 'delivered':
        return <span className="bg-emerald-900/60 text-emerald-300 border border-emerald-700 px-2.5 py-0.5 rounded-full text-xs font-bold">Levert</span>;
      case 'refunded':
        return <span className="bg-red-900/60 text-red-300 border border-red-700 px-2.5 py-0.5 rounded-full text-xs font-bold">Refundert</span>;
      default:
        return <span className="bg-slate-800 text-slate-300 px-2.5 py-0.5 rounded-full text-xs font-bold">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Ordreadministrasjon</h1>
          <p className="text-xs text-slate-400 mt-1">
            Behandle, plukk, send og refunder bestillinger.
          </p>
        </div>

        <button
          type="button"
          onClick={() => window.print()}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Skriv ut felles plukkliste</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
        
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Søk på ordrenummer, navn, e-post..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-forest-500"
          />
        </div>

        {/* Status Filters */}
        <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
          {[
            { id: 'alle', label: 'Alle' },
            { id: 'processing', label: 'Må pakkes' },
            { id: 'paid', label: 'Betalt' },
            { id: 'shipped', label: 'Sendt' },
            { id: 'delivered', label: 'Levert' },
          ].map((st) => (
            <button
              key={st.id}
              type="button"
              onClick={() => setStatusFilter(st.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                statusFilter === st.id
                  ? 'bg-forest-700 text-white'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>

      </div>

      {/* Orders Table */}
      <div className="bg-slate-950/80 rounded-3xl border border-slate-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-4">Ordre #</th>
                <th className="p-4">Kunde</th>
                <th className="p-4">Dato</th>
                <th className="p-4">Status</th>
                <th className="p-4">Frakt / Sporing</th>
                <th className="p-4">Sum (NOK)</th>
                <th className="p-4 text-right">Handling</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    Ingen bestillinger funnet for valgt filter.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="p-4 font-mono font-bold text-white">
                      <Link href={`/admin/ordrer/${ord.id}`} className="hover:underline text-forest-400">
                        {ord.orderNumber}
                      </Link>
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-white">{ord.customerName}</p>
                      <p className="text-[11px] text-slate-400">{ord.customerEmail}</p>
                    </td>
                    <td className="p-4 text-slate-400">
                      {formatDateTimeNorwegian(ord.createdAt)}
                    </td>
                    <td className="p-4">
                      {getStatusBadge(ord.status)}
                    </td>
                    <td className="p-4">
                      <p className="text-slate-300 font-semibold">{ord.shippingCarrier.toUpperCase()}</p>
                      {ord.trackingNumber ? (
                        <span className="text-[11px] text-forest-400 font-mono">{ord.trackingNumber}</span>
                      ) : (
                        <span className="text-[11px] text-slate-500">Ikke sendt</span>
                      )}
                    </td>
                    <td className="p-4 font-bold text-white">
                      {formatPrice(ord.totalNok)}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {ord.status === 'processing' && (
                          <button
                            type="button"
                            onClick={() => db.updateOrderStatus(ord.id, 'shipped', '370720124891999999NO', 'Admin Ordrer')}
                            className="px-2.5 py-1 bg-forest-800 hover:bg-forest-700 text-white rounded-lg text-xs font-bold"
                          >
                            Send
                          </button>
                        )}
                        <Link
                          href={`/admin/ordrer/${ord.id}`}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg"
                          title="Åpne ordredetaljer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
