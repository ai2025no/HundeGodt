'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ShoppingBag,
  Heart,
  Search,
  User,
  Menu,
  X,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  PawPrint,
} from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { useWishlistStore } from '@/store/useWishlistStore';
import { useDogStore } from '@/store/useDogStore';

export default function Header() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { items, openDrawer } = useCartStore();
  const { items: wishlistItems } = useWishlistStore();
  const { activeDog } = useDogStore();

  const totalCartCount = items.reduce((sum, i) => sum + i.quantity, 0);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (pathname.startsWith('/admin')) {
    return null;
  }

  const openSearch = () => {
    window.dispatchEvent(new CustomEvent('hg_open_search'));
  };

  const navLinks = [
    { label: 'Alle Godbiter & Tygg', href: '/produkter' },
    { label: 'Tørket Kjøtt', href: '/produkter?kategori=torket-kjott' },
    { label: 'Treningsbiter', href: '/produkter?kategori=trening-og-belonning' },
    { label: 'Tyggebein', href: '/produkter?kategori=tyggebein-og-kos' },
    { label: 'Gaveesker', href: '/produkter?kategori=gaveesker-og-mix' },
    { label: 'Godbit-Veiviser 🪄', href: '/veiviser' },
    { label: 'Guider & Fôrråd', href: '/guider' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-cloud-white transition-colors duration-200">
      
      {/* 1. TOP ANNOUNCEMENT BAR (Full width Midnight Ink) */}
      <div className="bg-midnight-ink text-cloud-white py-2 px-4 text-center text-xs sm:text-[13px] font-medium tracking-normal">
        <div className="max-w-[1280px] mx-auto flex items-center justify-center gap-2">
          <span>🐾 GRATIS FRAKT OVER 699 KR • RASK LEVERING MED BRING • 100% SMAKSGARANTI</span>
        </div>
      </div>

      {/* 2. MAIN NAVIGATION (White canvas, 3-zone layout) */}
      <div className="border-b border-ash-border">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 h-18 sm:h-20 flex items-center justify-between gap-4">
          
          {/* LEFT CLUSTER: NAV LINKS */}
          <nav className="hidden lg:flex items-center gap-1.5">
            <Link
              href="/produkter"
              className={`px-4 py-2 rounded-pill text-[14px] font-medium transition-all ${
                pathname === '/produkter'
                  ? 'bg-midnight-ink text-cloud-white'
                  : 'text-cocoa-bean hover:bg-fog-gray'
              }`}
            >
              Shop →
            </Link>

            <Link
              href="/guider"
              className={`px-4 py-2 rounded-pill text-[14px] font-medium transition-all ${
                pathname === '/guider'
                  ? 'bg-midnight-ink text-cloud-white'
                  : 'text-cocoa-bean hover:bg-fog-gray'
              }`}
            >
              Fôrkalkulator & Guider
            </Link>

            <Link
              href="/konto/hunder"
              className="px-4 py-2 rounded-pill text-[14px] font-medium text-cocoa-bean hover:bg-fog-gray transition-all flex items-center gap-1.5"
            >
              <span>Min Hund</span>
              {activeDog && (
                <span className="w-2 h-2 rounded-full bg-check-green" />
              )}
            </Link>
          </nav>

          {/* MOBILE MENU TOGGLE */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-pill text-cocoa-bean hover:bg-fog-gray"
            aria-label="Meny"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* CENTER: BRAND WORDMARK */}
          <div className="text-center">
            <Link href="/" className="inline-flex items-center gap-1 group">
              <span className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-midnight-ink">
                Hundegodt<span className="text-ember-orange">.</span>
              </span>
            </Link>
          </div>

          {/* RIGHT CLUSTER: SEARCH, ACCOUNT, WISHLIST, CART */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Active Dog Context Pill */}
            {activeDog && (
              <Link
                href="/konto/hunder"
                className="hidden sm:inline-flex items-center gap-2 bg-sky-powder px-3.5 py-1.5 rounded-pill text-xs font-semibold text-cocoa-bean hover:bg-blush-petal transition-colors"
                title="Aktiv hundeprofil"
              >
                <span>🐶 {activeDog.name}</span>
                <span className="text-[11px] text-midnight-ink/70">({activeDog.weightKg}kg)</span>
              </Link>
            )}

            {/* Global Search Pill */}
            <button
              type="button"
              onClick={openSearch}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-pill bg-fog-gray hover:bg-ash-border/80 text-cocoa-bean text-xs font-medium transition-colors"
              title="Søk produkter (Ctrl+K)"
            >
              <Search className="w-4 h-4 text-cocoa-bean" />
              <span className="hidden md:inline">Søk...</span>
              <kbd className="hidden lg:inline text-[10px] bg-cloud-white px-1.5 py-0.5 rounded-md text-stone-mute font-mono">
                ⌘K
              </kbd>
            </button>

            {/* Account */}
            <Link
              href="/konto/oversikt"
              className="p-2.5 rounded-pill hover:bg-fog-gray text-cocoa-bean transition-colors"
              title="Min konto"
            >
              <User className="w-5 h-5" />
            </Link>

            {/* Wishlist */}
            <Link
              href="/konto/favoritter"
              className="relative p-2.5 rounded-pill hover:bg-fog-gray text-cocoa-bean transition-colors"
              title="Favoritter"
            >
              <Heart className="w-5 h-5" />
              {wishlistItems.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-ember-orange text-cloud-white text-[10px] font-bold flex items-center justify-center">
                  {wishlistItems.length}
                </span>
              )}
            </Link>

            {/* Cart Pill Button (Filled Midnight Ink) */}
            <button
              type="button"
              onClick={openDrawer}
              className="btn-finn-primary !py-2.5 !px-4 text-xs sm:text-[14px]"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="font-semibold">{totalCartCount}</span>
            </button>

          </div>

        </div>
      </div>

      {/* MOBILE DRAWER */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-ash-border bg-cloud-white p-4 space-y-3">
          <div className="space-y-1">
            {navLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2.5 rounded-pill text-sm font-medium text-cocoa-bean hover:bg-fog-gray transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="pt-3 border-t border-ash-border flex items-center justify-between text-xs text-stone-mute">
            <Link href="/returportal" className="hover:underline">
              Returportal (Bring QR)
            </Link>
            <Link href="/admin" className="text-midnight-ink font-semibold hover:underline">
              Commerce OS (Admin) →
            </Link>
          </div>
        </div>
      )}

    </header>
  );
}
