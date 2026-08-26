'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Search, X, ArrowRight, Sparkles, TrendingUp } from 'lucide-react';
import { db } from '@/lib/db';
import { Product } from '@/types';
import { formatPrice } from '@/lib/utils';

export default function GlobalSearchModal() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape') setIsOpen(false);
    };

    window.addEventListener('hg_open_search', handleOpen);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('hg_open_search', handleOpen);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      setProducts(db.getProducts());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const normalizedQuery = query.toLowerCase().trim();
  const correctedQuery =
    normalizedQuery === 'hund selle' ? 'hundesele' :
    normalizedQuery === 'valpe for' ? 'valpefôr' :
    normalizedQuery;

  const results = products.filter((p) => {
    if (!correctedQuery) return false;
    const matchName = p.name.toLowerCase().includes(correctedQuery);
    const matchBrand = p.brandName.toLowerCase().includes(correctedQuery);
    const matchCat = p.categoryName.toLowerCase().includes(correctedQuery);
    const matchTag = p.tags.some((t) => t.toLowerCase().includes(correctedQuery));
    return matchName || matchBrand || matchCat || matchTag;
  });

  const handleSelectProduct = (slug: string) => {
    setIsOpen(false);
    setQuery('');
    router.push(`/produkt/${slug}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4">
      <div
        className="fixed inset-0 bg-midnight-ink/50 backdrop-blur-sm transition-opacity"
        onClick={() => setIsOpen(false)}
      />

      <div className="relative w-full max-w-2xl bg-cloud-white rounded-[20px] shadow-2xl overflow-hidden z-10 border border-ash-border">
        
        {/* Search Input Bar */}
        <div className="p-4 border-b border-ash-border flex items-center gap-3">
          <Search className="w-5 h-5 text-midnight-ink" />
          <input
            type="text"
            autoFocus
            placeholder="Søk etter fôr, godbiter, seler, merker..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm sm:text-base text-cocoa-bean placeholder:text-stone-mute outline-none font-sans"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="p-1 rounded-pill hover:bg-fog-gray text-stone-mute"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="text-xs font-semibold text-stone-mute hover:text-cocoa-bean px-2 py-1"
          >
            Lukk
          </button>
        </div>

        {/* Results / Suggestions Area */}
        <div className="p-4 max-h-[60vh] overflow-y-auto space-y-4">
          {query && (
            <div>
              <p className="text-xs font-bold text-stone-mute uppercase tracking-wider font-mono mb-2">
                Treff ({results.length})
              </p>

              {results.length === 0 ? (
                <div className="py-8 text-center space-y-2">
                  <p className="font-display font-bold text-base text-cocoa-bean">Ingen treff for «{query}»</p>
                  <p className="text-xs text-stone-mute">Prøv å søke på «okselever», «sele», eller «valpefôr».</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {results.slice(0, 5).map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleSelectProduct(p.slug)}
                      className="w-full text-left p-3 rounded-[16px] bg-fog-gray hover:bg-ash-border/50 flex items-center justify-between gap-4 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-[12px] bg-cloud-white overflow-hidden relative shrink-0">
                          <Image
                            src={p.images[0]?.url}
                            alt={p.name}
                            fill
                            className="object-contain p-1"
                            sizes="48px"
                          />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-stone-mute uppercase">{p.brandName}</p>
                          <h4 className="font-sans font-medium text-sm text-cocoa-bean group-hover:text-midnight-ink">
                            {p.name}
                          </h4>
                        </div>
                      </div>
                      <span className="font-sans font-semibold text-sm text-cocoa-bean shrink-0">
                        {formatPrice(p.basePriceNok)}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Quick Suggestions */}
          {!query && (
            <div className="space-y-3 py-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-stone-mute uppercase font-mono">
                <TrendingUp className="w-3.5 h-3.5 text-ember-orange" />
                <span>Populære søk akkurat nå</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {['Tørket Okselever', 'Y-Sele', 'Valpefôr', 'Ortopedisk Seng', 'Kornfritt'].map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => setQuery(term)}
                    className="px-3.5 py-1.5 rounded-pill bg-fog-gray hover:bg-ash-border text-xs font-medium text-cocoa-bean transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
