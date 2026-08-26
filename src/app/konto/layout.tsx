'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  User,
  Heart,
  Package,
  Shield,
  Smile,
  LogOut,
  ChevronRight,
} from 'lucide-react';
import { useDogStore } from '@/store/useDogStore';

const KONTO_NAV_ITEMS = [
  { label: 'Oversikt', href: '/konto/oversikt', icon: User },
  { label: 'Mine Hunder (Personalisering)', href: '/konto/hunder', icon: Smile },
  { label: 'Mine Bestillinger', href: '/konto/ordrer', icon: Package },
  { label: 'Favoritter & Ønskeliste', href: '/konto/favoritter', icon: Heart },
  { label: 'GDPR & Sikkerhet', href: '/konto/sikkerhet', icon: Shield },
];

export default function CustomerAccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { activeDog } = useDogStore();

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      
      {/* Account Header */}
      <div className="border-b border-ash-border pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-stone-mute uppercase tracking-wider font-mono">
            Min Side
          </span>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-midnight-ink mt-0.5">
            Velkommen tilbake, Emma!
          </h1>
          <p className="text-xs sm:text-sm text-stone-mute mt-1 font-sans">
            Administrer dine hundeprofiler, se forsendelsessporing og gjenta tidligere ordre.
          </p>
        </div>

        {activeDog && (
          <div className="inline-flex items-center gap-2 bg-sky-powder px-4 py-2 rounded-pill text-xs font-semibold text-cocoa-bean self-start sm:self-auto">
            <span>🐾 Aktiv hund:</span>
            <strong className="text-midnight-ink">{activeDog.name}</strong>
            <span className="text-midnight-ink/70">({activeDog.weightKg} kg)</span>
          </div>
        )}
      </div>

      {/* Grid: Left Navigation Pill Sidebar + Right Content View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Navigation Sidebar */}
        <aside className="lg:col-span-4 card-finn space-y-1">
          {KONTO_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href === '/konto/hunder' && pathname.startsWith('/konto/hunder'));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-pill text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-midnight-ink text-cloud-white'
                    : 'text-cocoa-bean hover:bg-cloud-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                <ChevronRight className={`w-3.5 h-3.5 ${isActive ? 'text-cloud-white' : 'text-stone-mute'}`} />
              </Link>
            );
          })}
        </aside>

        {/* Content Area */}
        <div className="lg:col-span-8">
          {children}
        </div>

      </div>

    </div>
  );
}
