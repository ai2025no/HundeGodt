'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Filter,
  SlidersHorizontal,
  LayoutGrid,
  List,
  X,
  Sparkles,
  ArrowUpDown,
  Search,
  Check,
  ChevronDown,
  ArrowRight,
} from 'lucide-react';
import { db } from '@/lib/db';
import { Product, Category, Brand, DogSize, DogLifeStage } from '@/types';
import ProductCard from '@/components/products/ProductCard';
import { formatPrice } from '@/lib/utils';
import { useDogStore } from '@/store/useDogStore';

function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeDog = useDogStore((state) => state.activeDog);

  const [products, setProducts] = useState<Product[]>(() => db.getProducts());
  const [categories, setCategories] = useState<Category[]>(() => db.getCategories());
  const [brands, setBrands] = useState<Brand[]>(() => db.getBrands());

  // Filter States
  const [selectedCategory, setSelectedCategory] = useState<string>(searchParams.get('kategori') || 'alle');
  const [selectedBrand, setSelectedBrand] = useState<string>(searchParams.get('merke') || 'alle');
  const [selectedLifeStage, setSelectedLifeStage] = useState<string>(searchParams.get('alder') || 'alle');
  const [selectedSize, setSelectedSize] = useState<string>(searchParams.get('storrelse') || 'alle');
  const [onlyOffers, setOnlyOffers] = useState<boolean>(searchParams.get('tilbud') === 'true');
  const [onlyInStock, setOnlyInStock] = useState<boolean>(false);
  const [selectedTag, setSelectedTag] = useState<string>('alle');
  const [maxPrice, setMaxPrice] = useState<number>(3000);
  const [sortBy, setSortBy] = useState<string>('popularitet');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [mobileFilterOpen, setMobileFilterOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>(searchParams.get('sok') || '');

  useEffect(() => {
    setProducts(db.getProducts());
    setCategories(db.getCategories());
    setBrands(db.getBrands());

    const handleStorageUpdate = () => {
      setProducts(db.getProducts());
      setCategories(db.getCategories());
      setBrands(db.getBrands());
    };
    window.addEventListener('hg_storage_updated', handleStorageUpdate);
    return () => window.removeEventListener('hg_storage_updated', handleStorageUpdate);
  }, []);

  // Update filter when query param changes
  useEffect(() => {
    const cat = searchParams.get('kategori');
    if (cat) setSelectedCategory(cat);
    const br = searchParams.get('merke');
    if (br) setSelectedBrand(br);
    const sok = searchParams.get('sok');
    if (sok) setSearchQuery(sok);
    const tilbud = searchParams.get('tilbud');
    if (tilbud === 'true') setOnlyOffers(true);
  }, [searchParams]);

  // Extract all unique tags
  const allTags = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => p.tags.forEach((t) => set.add(t)));
    return Array.from(set);
  }, [products]);

  // Filtered and sorted products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Search
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          const matchName = p.name.toLowerCase().includes(q);
          const matchBrand = p.brandName.toLowerCase().includes(q);
          const matchCat = p.categoryName.toLowerCase().includes(q);
          const matchTag = p.tags.some((t) => t.toLowerCase().includes(q));
          if (!matchName && !matchBrand && !matchCat && !matchTag) return false;
        }

        // Category
        if (selectedCategory !== 'alle' && p.categorySlug !== selectedCategory) {
          return false;
        }

        // Brand
        if (selectedBrand !== 'alle') {
          const brandObj = brands.find((b) => b.slug === selectedBrand);
          if (p.brandId !== brandObj?.id && p.brandName.toLowerCase() !== selectedBrand.toLowerCase()) {
            return false;
          }
        }

        // Life stage
        if (selectedLifeStage !== 'alle' && !p.dogLifeStages.includes(selectedLifeStage as DogLifeStage) && !p.dogLifeStages.includes('all')) {
          return false;
        }

        // Dog size
        if (selectedSize !== 'alle' && !p.dogSizes.includes(selectedSize as DogSize)) {
          return false;
        }

        // Offers
        if (onlyOffers && (!p.compareAtPriceNok || p.compareAtPriceNok <= p.basePriceNok)) {
          return false;
        }

        // In stock
        if (onlyInStock) {
          const totalStock = p.variants.reduce((sum, v) => sum + v.inventoryQuantity, 0);
          if (totalStock <= 0) return false;
        }

        // Tag
        if (selectedTag !== 'alle' && !p.tags.includes(selectedTag)) {
          return false;
        }

        // Price
        if (p.basePriceNok > maxPrice) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'pris-lav-hoy') return a.basePriceNok - b.basePriceNok;
        if (sortBy === 'pris-hoy-lav') return b.basePriceNok - a.basePriceNok;
        if (sortBy === 'rabatt') {
          const discA = a.compareAtPriceNok ? a.compareAtPriceNok - a.basePriceNok : 0;
          const discB = b.compareAtPriceNok ? b.compareAtPriceNok - b.basePriceNok : 0;
          return discB - discA;
        }
        if (sortBy === 'vurdering') return b.rating - a.rating;
        if (sortBy === 'nyheter') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        return b.purchaseCount - a.purchaseCount;
      });
  }, [
    products,
    searchQuery,
    selectedCategory,
    selectedBrand,
    selectedLifeStage,
    selectedSize,
    onlyOffers,
    onlyInStock,
    selectedTag,
    maxPrice,
    sortBy,
    brands,
  ]);

  const resetAllFilters = () => {
    setSelectedCategory('alle');
    setSelectedBrand('alle');
    setSelectedLifeStage('alle');
    setSelectedSize('alle');
    setOnlyOffers(false);
    setOnlyInStock(false);
    setSelectedTag('alle');
    setMaxPrice(3000);
    setSearchQuery('');
    router.push('/produkter');
  };

  const hasActiveFilters =
    selectedCategory !== 'alle' ||
    selectedBrand !== 'alle' ||
    selectedLifeStage !== 'alle' ||
    selectedSize !== 'alle' ||
    onlyOffers ||
    onlyInStock ||
    selectedTag !== 'alle' ||
    maxPrice < 3000 ||
    searchQuery !== '';

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      
      {/* 1. PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-ash-border pb-6">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-midnight-ink">
            {selectedCategory !== 'alle'
              ? categories.find((c) => c.slug === selectedCategory)?.name || 'Produkter'
              : onlyOffers
              ? 'Ukens Tilbud & Rabatter'
              : 'Alle Produkter til Hund'}
          </h1>
          <p className="text-xs sm:text-sm text-stone-mute mt-1 font-sans">
            Viser {filteredProducts.length} av {products.length} produkter
            {activeDog && <span> • Tilpasset <strong>{activeDog.name}</strong></span>}
          </p>
        </div>

        {/* View Mode & Sorting */}
        <div className="flex items-center gap-3">
          
          {/* Mobile filter button */}
          <button
            type="button"
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden flex items-center gap-2 bg-fog-gray text-cocoa-bean px-4 py-2.5 rounded-pill text-xs font-semibold"
          >
            <SlidersHorizontal className="w-4 h-4 text-midnight-ink" />
            <span>Filtre</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-ember-orange" />
            )}
          </button>

          {/* Sort selector */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-fog-gray text-cocoa-bean text-xs font-semibold py-2.5 pl-4 pr-9 rounded-pill appearance-none focus:outline-none focus:ring-1 focus:ring-midnight-ink cursor-pointer"
            >
              <option value="popularitet">Mest populære</option>
              <option value="pris-lav-hoy">Pris: Lav → Høy</option>
              <option value="pris-hoy-lav">Pris: Høy → Lav</option>
              <option value="rabatt">Størst rabatt</option>
              <option value="vurdering">Best vurdert</option>
              <option value="nyheter">Nyeste produkter</option>
            </select>
            <ArrowUpDown className="w-3.5 h-3.5 text-stone-mute absolute right-3 top-3.5 pointer-events-none" />
          </div>

          {/* Grid / List toggle */}
          <div className="hidden sm:flex items-center bg-fog-gray rounded-pill p-1">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-pill transition-colors ${
                viewMode === 'grid' ? 'bg-midnight-ink text-cloud-white' : 'text-stone-mute hover:text-cocoa-bean'
              }`}
              title="Rutenett-visning"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-pill transition-colors ${
                viewMode === 'list' ? 'bg-midnight-ink text-cloud-white' : 'text-stone-mute hover:text-cocoa-bean'
              }`}
              title="Liste-visning"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>

      {/* 2. MAIN LAYOUT: SIDEBAR FILTER + PRODUCT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* DESKTOP SIDEBAR FILTERS */}
        <aside className="hidden lg:block lg:col-span-3 space-y-6 bg-fog-gray p-6 rounded-[20px]">
          
          <div className="flex items-center justify-between border-b border-ash-border pb-3">
            <span className="font-display font-bold text-sm text-cocoa-bean uppercase tracking-wider">Filtre</span>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetAllFilters}
                className="text-xs text-ember-orange hover:underline font-semibold"
              >
                Nullstill alle
              </button>
            )}
          </div>

          {/* Categories */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-cocoa-bean uppercase tracking-wider block font-mono">
              Kategori
            </label>
            <div className="space-y-1 text-xs">
              <button
                type="button"
                onClick={() => setSelectedCategory('alle')}
                className={`w-full text-left px-3 py-1.5 rounded-pill transition-colors ${
                  selectedCategory === 'alle'
                    ? 'bg-midnight-ink text-cloud-white font-semibold'
                    : 'text-cocoa-bean hover:bg-cloud-white'
                }`}
              >
                Alle kategorier
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedCategory(c.slug)}
                  className={`w-full text-left px-3 py-1.5 rounded-pill transition-colors ${
                    selectedCategory === c.slug
                      ? 'bg-midnight-ink text-cloud-white font-semibold'
                      : 'text-cocoa-bean hover:bg-cloud-white'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* Dog Life Stage */}
          <div className="space-y-2 pt-2 border-t border-ash-border">
            <label className="text-xs font-bold text-cocoa-bean uppercase tracking-wider block font-mono">
              Hundens Alder
            </label>
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: 'alle', label: 'Alle' },
                { id: 'puppy', label: 'Valp' },
                { id: 'adult', label: 'Voksen' },
                { id: 'senior', label: 'Senior' },
              ].map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setSelectedLifeStage(st.id)}
                  className={`px-3 py-1.5 rounded-pill text-xs font-medium transition-colors ${
                    selectedLifeStage === st.id
                      ? 'bg-midnight-ink text-cloud-white'
                      : 'bg-cloud-white text-cocoa-bean hover:bg-ash-border'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Flags */}
          <div className="space-y-2 pt-2 border-t border-ash-border">
            <label className="text-xs font-bold text-cocoa-bean uppercase tracking-wider block font-mono">
              Status & Tilbud
            </label>
            <div className="space-y-2 text-xs text-cocoa-bean">
              <label className="flex items-center gap-2 cursor-pointer font-medium">
                <input
                  type="checkbox"
                  checked={onlyOffers}
                  onChange={(e) => setOnlyOffers(e.target.checked)}
                  className="rounded text-midnight-ink focus:ring-midnight-ink w-4 h-4"
                />
                <span>Kun varer på tilbud 🔥</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer font-medium">
                <input
                  type="checkbox"
                  checked={onlyInStock}
                  onChange={(e) => setOnlyInStock(e.target.checked)}
                  className="rounded text-midnight-ink focus:ring-midnight-ink w-4 h-4"
                />
                <span>Kun varer på lager</span>
              </label>
            </div>
          </div>

          {/* Max Price Slider */}
          <div className="space-y-2 pt-2 border-t border-ash-border">
            <div className="flex justify-between text-xs font-bold text-cocoa-bean">
              <span>Makspris:</span>
              <span className="text-midnight-ink">{formatPrice(maxPrice)}</span>
            </div>
            <input
              type="range"
              min={50}
              max={3000}
              step={50}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-midnight-ink"
            />
          </div>

        </aside>

        {/* PRODUCT RESULTS */}
        <div className="lg:col-span-9 space-y-6">
          {filteredProducts.length === 0 ? (
            <div className="card-finn text-center py-20 space-y-4">
              <p className="font-display font-bold text-xl text-cocoa-bean">
                Ingen produkter matchet dine valgte filtre
              </p>
              <p className="text-xs text-stone-mute">
                Prøv å fjerne noen filtre eller søk etter noe annet.
              </p>
              <button
                type="button"
                onClick={resetAllFilters}
                className="btn-finn-primary"
              >
                <span>Nullstill filtre</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((prod) => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </div>
          ) : (
            /* List View Mode */
            <div className="space-y-4">
              {filteredProducts.map((prod) => (
                <div
                  key={prod.id}
                  className="bg-fog-gray rounded-[20px] p-5 flex flex-col sm:flex-row items-center justify-between gap-6"
                >
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className="w-20 h-20 rounded-[16px] overflow-hidden relative bg-cloud-white shrink-0">
                      <Image
                        src={prod.images[0]?.url}
                        alt={prod.name}
                        fill
                        className="object-contain p-2"
                        sizes="80px"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-stone-mute font-semibold uppercase">{prod.brandName}</span>
                      <h3 className="font-sans font-medium text-base text-cocoa-bean">{prod.name}</h3>
                      <p className="text-xs text-stone-mute line-clamp-1">{prod.shortDescription}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-ash-border">
                    <div className="text-right">
                      <span className="font-sans font-semibold text-lg text-cocoa-bean block">
                        {formatPrice(prod.basePriceNok)}
                      </span>
                      {prod.compareAtPriceNok && (
                        <span className="text-xs text-stone-mute line-through block">
                          {formatPrice(prod.compareAtPriceNok)}
                        </span>
                      )}
                    </div>

                    <Link
                      href={`/produkt/${prod.slug}`}
                      className="btn-finn-primary !py-2.5 !px-5 text-xs"
                    >
                      <span>Se produkt</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* MOBILE FILTER MODAL */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-midnight-ink/40 backdrop-blur-sm"
            onClick={() => setMobileFilterOpen(false)}
          />
          <div className="relative w-full max-w-md bg-cloud-white rounded-[20px] p-6 space-y-6 z-10 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-ash-border pb-3">
              <h3 className="font-display font-bold text-lg text-cocoa-bean">Filtre</h3>
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className="p-1 text-stone-mute hover:text-cocoa-bean"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Categories */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-cocoa-bean uppercase font-mono">Kategori</label>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setSelectedCategory('alle')}
                  className={`px-3 py-1.5 rounded-pill text-xs font-medium ${
                    selectedCategory === 'alle' ? 'bg-midnight-ink text-cloud-white' : 'bg-fog-gray text-cocoa-bean'
                  }`}
                >
                  Alle
                </button>
                {categories.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedCategory(c.slug)}
                    className={`px-3 py-1.5 rounded-pill text-xs font-medium ${
                      selectedCategory === c.slug ? 'bg-midnight-ink text-cloud-white' : 'bg-fog-gray text-cocoa-bean'
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-ash-border flex gap-2">
              <button
                type="button"
                onClick={resetAllFilters}
                className="btn-finn-outline flex-1 !py-3 text-xs"
              >
                Nullstill
              </button>
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className="btn-finn-primary flex-1 !py-3 text-xs"
              >
                Vis {filteredProducts.length} treff
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="py-20 text-center text-stone-mute">
          <div className="w-8 h-8 border-4 border-midnight-ink border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs">Laster produkter...</p>
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}
