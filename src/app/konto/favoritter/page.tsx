'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, ArrowRight } from 'lucide-react';
import { db } from '@/lib/db';
import { Product } from '@/types';
import ProductCard from '@/components/products/ProductCard';
import { useWishlistStore } from '@/store/useWishlistStore';

export default function WishlistPage() {
  const { items: wishlistIds } = useWishlistStore();
  const [favoriteProducts, setFavoriteProducts] = useState<Product[]>([]);

  useEffect(() => {
    const all = db.getProducts();
    setFavoriteProducts(all.filter((p) => wishlistIds.includes(p.id)));
  }, [wishlistIds]);

  return (
    <div className="space-y-6">
      
      <div className="border-b border-ash-border pb-4">
        <h2 className="font-display font-bold text-2xl text-midnight-ink">Favoritter & Ønskeliste ({favoriteProducts.length})</h2>
        <p className="text-xs text-stone-mute mt-1">
          Produkter du har lagret til din hund. Synkronisert mellom alle dine enheter.
        </p>
      </div>

      {favoriteProducts.length === 0 ? (
        <div className="card-finn text-center py-16 space-y-4">
          <div className="w-12 h-12 rounded-pill bg-cloud-white flex items-center justify-center mx-auto text-stone-mute">
            <Heart className="w-6 h-6" />
          </div>
          <p className="font-display font-bold text-lg text-cocoa-bean">Ingen favoritter lagret ennå</p>
          <p className="text-xs text-stone-mute">Klikk på hjertet på et produkt for å lagre det her.</p>
          <Link href="/produkter" className="btn-finn-primary !py-3 !px-6 text-xs font-semibold">
            <span>Finn produkter</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {favoriteProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}

    </div>
  );
}
