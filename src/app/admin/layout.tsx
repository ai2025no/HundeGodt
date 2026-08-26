'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Boxes,
  Layers,
  Users,
  Megaphone,
  Tag,
  ShoppingCart,
  FileText,
  Image as ImageIcon,
  Star,
  BarChart3,
  History,
  Settings,
  Search,
  Bell,
  ExternalLink,
  Shield,
  Menu,
  X,
  ChevronDown,
} from 'lucide-react';
import { useAdminStore } from '@/store/useAdminStore';
import { AdminRole } from '@/types';
import { db } from '@/lib/db';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { currentRole, currentUser, setRole, isCommandOpen, toggleCommand, closeCommand } = useAdminStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [commandQuery, setCommandQuery] = useState('');

  const loadAlerts = () => {
    const summary = db.getAnalyticsSummary();
    setPendingOrdersCount(summary.pendingOrdersCount);
    setLowStockCount(summary.lowStockItemsCount);
  };

  useEffect(() => {
    loadAlerts();
    window.addEventListener('hg_storage_updated', loadAlerts);
    return () => window.removeEventListener('hg_storage_updated', loadAlerts);
  }, []);

  const navLinks = [
    { href: '/admin', label: 'Oversikt / Dashboard', icon: LayoutDashboard, exact: true },
    { href: '/admin/ordrer', label: 'Ordrer & Logistikk', icon: Package, badge: pendingOrdersCount > 0 ? `${pendingOrdersCount}` : undefined },
    { href: '/admin/produkter', label: 'Produkter & Varianter', icon: Boxes },
    { href: '/admin/kategorier', label: 'Kategorier & Merker', icon: Layers },
    { href: '/admin/lager', label: 'Lagerstyring', icon: Boxes, badge: lowStockCount > 0 ? `${lowStockCount} lav` : undefined, badgeColor: 'bg-amber-500' },
    { href: '/admin/kunder', label: 'Kunder & CRM', icon: Users },
    { href: '/admin/kampanjer', label: 'Kampanjemotor', icon: Megaphone },
    { href: '/admin/rabattkoder', label: 'Rabattkoder', icon: Tag },
    { href: '/admin/forlatte-kurver', label: 'Forlatte Handlekurver', icon: ShoppingCart },
    { href: '/admin/cms', label: 'Forside & CMS', icon: FileText },
    { href: '/admin/medier', label: 'Mediebibliotek', icon: ImageIcon },
    { href: '/admin/anmeldelser', label: 'Omtaler & Moderering', icon: Star },
    { href: '/admin/analyse', label: 'Analyse & BI', icon: BarChart3 },
    { href: '/admin/systemlogg', label: 'Systemlogg (Audit)', icon: History },
    { href: '/admin/innstillinger', label: 'Innstillinger & RBAC', icon: Settings },
  ];

  // RBAC permissions helper
  const roleNames: Record<AdminRole, string> = {
    owner: 'Eier (Full tilgang)',
    administrator: 'Administrator',
    warehouse: 'Lagersjef',
    support: 'Kundeservice',
    marketing: 'Markedsføring',
    analyst: 'Dataanalytiker (Read-only)',
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      
      {/* 1. TOP ADMIN BAR */}
      <header className="h-16 bg-slate-950 border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between gap-4 sticky top-0 z-40">
        
        {/* Left: Brand & Mobile Toggle */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link href="/admin" className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-forest-700 flex items-center justify-center text-sand-200 text-base font-bold shadow-md">
              🐾
            </span>
            <div className="flex flex-col">
              <span className="font-bold text-sm tracking-tight text-white">
                Hundegodt <span className="text-sand-400 font-mono text-xs bg-slate-800 px-1.5 py-0.5 rounded">COMMERCE OS</span>
              </span>
            </div>
          </Link>
        </div>

        {/* Middle: Command Search Trigger */}
        <button
          type="button"
          onClick={toggleCommand}
          className="hidden md:flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 px-4 py-2 rounded-xl text-xs border border-slate-700 w-72 justify-between transition-colors shadow-inner"
        >
          <span className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span>Søk ordrer, SKU, kunder...</span>
          </span>
          <kbd className="bg-slate-800 text-slate-400 text-[10px] px-1.5 py-0.5 rounded font-mono border border-slate-700">
            Ctrl+K
          </kbd>
        </button>

        {/* Right: RBAC Role Selector + Notifications + Open Store */}
        <div className="flex items-center gap-3 sm:gap-4">
          
          {/* RBAC Role Switcher */}
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1 text-xs">
            <Shield className="w-3.5 h-3.5 text-forest-400" />
            <select
              value={currentRole}
              onChange={(e) => setRole(e.target.value as AdminRole)}
              className="bg-transparent text-slate-200 text-xs font-semibold focus:outline-none cursor-pointer"
            >
              <option value="owner" className="bg-slate-900 text-white">Rolle: Eier (Full)</option>
              <option value="administrator" className="bg-slate-900 text-white">Rolle: Administrator</option>
              <option value="warehouse" className="bg-slate-900 text-white">Rolle: Lager</option>
              <option value="support" className="bg-slate-900 text-white">Rolle: Kundeservice</option>
              <option value="marketing" className="bg-slate-900 text-white">Rolle: Markedsføring</option>
              <option value="analyst" className="bg-slate-900 text-white">Rolle: Analyse (Read-only)</option>
            </select>
          </div>

          {/* Action Alerts Bell */}
          <div className="relative">
            <button
              type="button"
              onClick={() => alert(`Varselsenter:\n• ${pendingOrdersCount} nye ordrer krever pakking\n• ${lowStockCount} produkter under kritisk lagernivå`)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors relative"
              title="Varsler"
            >
              <Bell className="w-4 h-4" />
              {(pendingOrdersCount > 0 || lowStockCount > 0) && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              )}
            </button>
          </div>

          {/* Storefront Link */}
          <Link
            href="/"
            target="_blank"
            className="hidden sm:flex items-center gap-1.5 bg-forest-800 hover:bg-forest-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            <span>Se Butikk</span>
            <ExternalLink className="w-3.5 h-3.5 text-sand-300" />
          </Link>
        </div>

      </header>

      <div className="flex-1 flex overflow-hidden">
        
        {/* 2. SIDEBAR NAVIGATION */}
        <aside
          className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-slate-950 border-r border-slate-800 p-4 space-y-1.5 overflow-y-auto transform transition-transform duration-200 lg:translate-x-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-3 py-1">
            Handelsdrift & Styring
          </div>

          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-forest-800 text-white shadow-sm font-bold'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full text-white ${
                      item.badgeColor || 'bg-red-500'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}

          <div className="pt-6 mt-6 border-t border-slate-800 px-3 space-y-2">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              <span>Sanntidsmotor: <strong>Tilkoblet</strong></span>
            </div>
            <p className="text-[10px] text-slate-400">
              Innlogget som: <strong>{currentUser.name}</strong>
            </p>
          </div>
        </aside>

        {/* 3. MAIN ADMIN CONTENT CONTAINER */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-900">
          <div className="max-w-7xl mx-auto space-y-8">
            {children}
          </div>
        </main>

      </div>

      {/* 4. GLOBAL ADMIN COMMAND PALETTE (CTRL+K) */}
      {isCommandOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
          <div onClick={closeCommand} className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" />
          <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700 rounded-3xl p-4 shadow-2xl z-10 space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
              <Search className="w-5 h-5 text-forest-400" />
              <input
                type="text"
                autoFocus
                placeholder="Hurtigsøk i hele butikken (ordrenr, kunde, SKU, produkt)..."
                value={commandQuery}
                onChange={(e) => setCommandQuery(e.target.value)}
                className="w-full bg-transparent text-sm text-white focus:outline-none placeholder-slate-500"
              />
              <button
                type="button"
                onClick={closeCommand}
                className="text-xs text-slate-400 hover:text-white px-2 py-1 bg-slate-800 rounded-lg"
              >
                ESC
              </button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto text-xs">
              <p className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Hurtighandlinger</p>
              <Link
                href="/admin/ordrer"
                onClick={closeCommand}
                className="block p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-white font-semibold"
              >
                📦 Se alle ordrer ({pendingOrdersCount} venter)
              </Link>
              <Link
                href="/admin/produkter/ny"
                onClick={closeCommand}
                className="block p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-white font-semibold"
              >
                ➕ Opprett nytt produkt
              </Link>
              <Link
                href="/admin/kampanjer/ny"
                onClick={closeCommand}
                className="block p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-white font-semibold"
              >
                🎯 Opprett ny kampanje
              </Link>
              <Link
                href="/admin/lager"
                onClick={closeCommand}
                className="block p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-white font-semibold"
              >
                📊 Se lav lagerbeholdning
              </Link>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
