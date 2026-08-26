'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Compass, ShoppingBag, Heart, User, Search } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { useWishlistStore } from '@/store/useWishlistStore';

export default function MobileNav() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const itemCount = useCartStore((state) => state.getItemCount());
  const openCart = useCartStore((state) => state.openDrawer);
  const wishlistCount = useWishlistStore((state) => state.items.length);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Hide on admin routes
  if (pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <div className="lg:hidden fixed bottom-0 inset-x-0 bg-cloud-white/95 backdrop-blur-lg border-t border-ash-border py-2 px-4 z-40">
      <div className="flex items-center justify-around">
        
        <Link
          href="/"
          className={`flex flex-col items-center gap-1 text-[11px] font-medium transition-colors ${
            pathname === '/' ? 'text-midnight-ink font-bold' : 'text-stone-mute hover:text-cocoa-bean'
          }`}
        >
          <Home className="w-5 h-5" />
          <span>Hjem</span>
        </Link>

        <Link
          href="/produkter"
          className={`flex flex-col items-center gap-1 text-[11px] font-medium transition-colors ${
            pathname.startsWith('/produkter') ? 'text-midnight-ink font-bold' : 'text-stone-mute hover:text-cocoa-bean'
          }`}
        >
          <Compass className="w-5 h-5" />
          <span>Shop</span>
        </Link>

        <button
          type="button"
          onClick={() => window.dispatchEvent(new CustomEvent('hg_open_search'))}
          className="flex flex-col items-center gap-1 text-[11px] font-medium text-stone-mute hover:text-cocoa-bean transition-colors"
        >
          <Search className="w-5 h-5" />
          <span>Søk</span>
        </button>

        <Link
          href="/konto/favoritter"
          className={`flex flex-col items-center gap-1 text-[11px] font-medium relative transition-colors ${
            pathname === '/konto/favoritter' ? 'text-midnight-ink font-bold' : 'text-stone-mute hover:text-cocoa-bean'
          }`}
        >
          <Heart className="w-5 h-5" />
          <span>Favoritter</span>
          {mounted && wishlistCount > 0 && (
            <span className="absolute -top-1 right-2 w-3.5 h-3.5 bg-ember-orange text-cloud-white rounded-full text-[9px] font-bold flex items-center justify-center">
              {wishlistCount}
            </span>
          )}
        </Link>

        <button
          type="button"
          onClick={openCart}
          className="flex flex-col items-center gap-1 text-[11px] font-medium text-stone-mute hover:text-cocoa-bean transition-colors relative"
        >
          <ShoppingBag className="w-5 h-5" />
          <span>Kurv</span>
          {mounted && itemCount > 0 && (
            <span className="absolute -top-1 right-1 w-3.5 h-3.5 bg-midnight-ink text-cloud-white rounded-full text-[9px] font-bold flex items-center justify-center">
              {itemCount}
            </span>
          )}
        </button>

      </div>
    </div>
  );
}
