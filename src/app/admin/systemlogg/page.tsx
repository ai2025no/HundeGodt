'use client';

import React, { useState, useEffect } from 'react';
import { History, Shield, Search, ArrowRight, User } from 'lucide-react';
import { db } from '@/lib/db';
import { AuditLog } from '@/types';
import { formatDateTimeNorwegian } from '@/lib/utils';

export default function AdminAuditLogPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = () => {
    setLogs(db.getAuditLogs());
  };

  useEffect(() => {
    loadData();
    window.addEventListener('hg_storage_updated', loadData);
    return () => window.removeEventListener('hg_storage_updated', loadData);
  }, []);

  const filteredLogs = logs.filter((l) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = l.adminName.toLowerCase().includes(q);
      const matchAction = l.action.toLowerCase().includes(q);
      const matchEntity = l.entityName.toLowerCase().includes(q);
      if (!matchName && !matchAction && !matchEntity) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Systemlogg & Audit Log ({logs.length})</h1>
          <p className="text-xs text-slate-400 mt-1">
            Uforanderlig revisjonslogg over alle prisendringer, ordrestatusendringer og administratorhandlinger.
          </p>
        </div>

        <div className="bg-slate-950 px-3.5 py-1.5 rounded-xl border border-slate-800 text-xs text-forest-400 font-mono flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5" />
          <span>Sikkerhetsstatus: Uforanderlig</span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Søk i revisjonslogg..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-forest-500"
          />
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-slate-950/80 rounded-3xl border border-slate-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-4">Tidspunkt</th>
                <th className="p-4">Bruker / Rolle</th>
                <th className="p-4">Handling</th>
                <th className="p-4">Objekt</th>
                <th className="p-4">Detaljer & Endring (Diff)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-900/50 transition-colors">
                  <td className="p-4 text-slate-400 font-mono whitespace-nowrap">
                    {formatDateTimeNorwegian(log.timestamp)}
                  </td>

                  <td className="p-4">
                    <p className="font-bold text-white">{log.adminName}</p>
                    <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full uppercase font-mono">
                      {log.adminRole}
                    </span>
                  </td>

                  <td className="p-4">
                    <span className="font-bold text-forest-300">{log.action}</span>
                  </td>

                  <td className="p-4 font-bold text-white">
                    {log.entityName}
                  </td>

                  <td className="p-4">
                    <p className="text-slate-300">{log.details}</p>
                    {log.oldValue && log.newValue && (
                      <div className="flex items-center gap-2 mt-1 text-[11px] font-mono">
                        <span className="bg-red-950 text-red-300 px-1.5 py-0.5 rounded line-through">
                          {log.oldValue}
                        </span>
                        <ArrowRight className="w-3 h-3 text-slate-500" />
                        <span className="bg-forest-950 text-forest-300 px-1.5 py-0.5 rounded font-bold">
                          {log.newValue}
                        </span>
                      </div>
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
