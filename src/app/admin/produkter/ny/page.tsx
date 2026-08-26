'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { db } from '@/lib/db';
import { Product, ProductVariant } from '@/types';
import { useAdminStore } from '@/store/useAdminStore';

export default function NewProductAdminPage() {
  const router = useRouter();
  const currentUser = useAdminStore((state) => state.currentUser);

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [brandId, setBrandId] = useState('b-hundegodt');
  const [brandName, setBrandName] = useState('Hundegodt Originals');
  const [categorySlug, setCategorySlug] = useState('godbiter');
  const [categoryName, setCategoryName] = useState('Snacks & Godbiter');
  const [sku, setSku] = useState('HG-NEW-01');
  const [barcode, setBarcode] = useState('7090038100999');
  const [basePriceNok, setBasePriceNok] = useState(149);
  const [compareAtPriceNok, setCompareAtPriceNok] = useState<number | undefined>(179);
  const [costPriceNok, setCostPriceNok] = useState(55);
  const [shortDescription, setShortDescription] = useState('100% naturlig norsk hundeprodukt.');
  const [fullDescription, setFullDescription] = useState('Nøye utvalgt kvalitet for din firbente bestevenn.');
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=800&h=800&q=80');
  const [tagsInput, setTagsInput] = useState('Kornfri, Naturlig, Norsk');
  const [ingredients, setIngredients] = useState('100% naturlige råvarer fra Norge.');

  // Variants state
  const [variants, setVariants] = useState<ProductVariant[]>([
    {
      id: `var-${Date.now()}-1`,
      productId: '',
      title: 'Standard pose (200g)',
      sku: 'HG-NEW-01-200G',
      barcode: '7090038100999',
      priceNok: 149,
      costPriceNok: 55,
      inventoryQuantity: 40,
      lowStockThreshold: 10,
      isActive: true,
    },
  ]);

  const handleNameChange = (val: string) => {
    setName(val);
    const generatedSlug = val
      .toLowerCase()
      .replace(/æ/g, 'ae')
      .replace(/ø/g, 'o')
      .replace(/å/g, 'a')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    setSlug(generatedSlug);
  };

  const handleAddVariant = () => {
    setVariants([
      ...variants,
      {
        id: `var-${Date.now()}-${variants.length + 1}`,
        productId: '',
        title: 'Storpakke (500g)',
        sku: `${sku}-500G`,
        barcode: `${barcode}2`,
        priceNok: basePriceNok * 2,
        costPriceNok: costPriceNok * 2,
        inventoryQuantity: 20,
        lowStockThreshold: 5,
        isActive: true,
      },
    ]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) return;

    const newProd: Product = {
      id: `prod-${Date.now()}`,
      brandId,
      brandName,
      name: name.trim(),
      slug: slug.trim(),
      sku,
      barcode,
      shortDescription,
      fullDescription,
      categoryId: `cat-${categorySlug}`,
      categorySlug,
      categoryName,
      images: [
        {
          id: `img-${Date.now()}`,
          url: imageUrl,
          altText: name,
          sortOrder: 1,
          isPrimary: true,
        },
      ],
      variants: variants.map((v) => ({ ...v, productId: `prod-${Date.now()}` })),
      basePriceNok: Number(basePriceNok),
      compareAtPriceNok: compareAtPriceNok ? Number(compareAtPriceNok) : undefined,
      costPriceNok: Number(costPriceNok),
      vatRate: 0.25,
      isActive: true,
      isFeatured: false,
      isNew: true,
      isBestseller: false,
      tags: tagsInput.split(',').map((t) => t.trim()).filter(Boolean),
      dogSizes: ['mini', 'small', 'medium', 'large', 'giant'],
      dogLifeStages: ['puppy', 'adult', 'senior', 'all'],
      ingredients,
      rating: 5.0,
      reviewCount: 0,
      viewsCount: 1,
      cartAddsCount: 0,
      purchaseCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.saveProduct(newProd, currentUser.name);
    router.push('/admin/produkter');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <Link href="/admin/produkter" className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" />
          Tilbake til produkter
        </Link>
        <h1 className="text-xl font-bold text-white">Opprett Nytt Produkt</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* 1. Basic Info */}
        <div className="bg-slate-950/80 p-6 rounded-3xl border border-slate-800 space-y-4">
          <h3 className="font-bold text-white text-base">1. Grunninformasjon</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">Produktnavn *</label>
              <input
                type="text"
                required
                placeholder="F.eks. Tørket Hjortekjøtt Godbiter"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-forest-500 font-bold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">URL Slug *</label>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-400 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">Merkevare</label>
              <select
                value={brandId}
                onChange={(e) => {
                  setBrandId(e.target.value);
                  const br = db.getBrands().find((b) => b.id === e.target.value);
                  if (br) setBrandName(br.name);
                }}
                className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
              >
                {db.getBrands().map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">Kategori</label>
              <select
                value={categorySlug}
                onChange={(e) => {
                  setCategorySlug(e.target.value);
                  const cat = db.getCategories().find((c) => c.slug === e.target.value);
                  if (cat) setCategoryName(cat.name);
                }}
                className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
              >
                {db.getCategories().map((c) => (
                  <option key={c.id} value={c.slug}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300">Kort produktbeskrivelse</label>
            <input
              type="text"
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300">Full produktbeskrivelse</label>
            <textarea
              rows={3}
              value={fullDescription}
              onChange={(e) => setFullDescription(e.target.value)}
              className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
            />
          </div>
        </div>

        {/* 2. Pricing & Cost */}
        <div className="bg-slate-950/80 p-6 rounded-3xl border border-slate-800 space-y-4">
          <h3 className="font-bold text-white text-base">2. Prissetting & Økonomi</h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">Utsalgspris (NOK inkl. MVA) *</label>
              <input
                type="number"
                required
                value={basePriceNok}
                onChange={(e) => setBasePriceNok(Number(e.target.value))}
                className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-bold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">Førpris / Sammenligningspris (NOK)</label>
              <input
                type="number"
                value={compareAtPriceNok || ''}
                onChange={(e) => setCompareAtPriceNok(e.target.value ? Number(e.target.value) : undefined)}
                className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">Innkjøpspris / Kostpris (NOK)</label>
              <input
                type="number"
                required
                value={costPriceNok}
                onChange={(e) => setCostPriceNok(Number(e.target.value))}
                className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
              />
            </div>
          </div>
        </div>

        {/* 3. Media & Tags */}
        <div className="bg-slate-950/80 p-6 rounded-3xl border border-slate-800 space-y-4">
          <h3 className="font-bold text-white text-base">3. Bilde & Tagger</h3>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300">Hovedbilde URL</label>
            <input
              type="url"
              required
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300">Tagger (kommaseparert)</label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300">Ingredienser & Råvarer</label>
            <input
              type="text"
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
              className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
            />
          </div>
        </div>

        {/* 4. Variants & Stock */}
        <div className="bg-slate-950/80 p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-base">4. Varianter & Lagerbeholdning</h3>
            <button
              type="button"
              onClick={handleAddVariant}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Legg til variant</span>
            </button>
          </div>

          <div className="space-y-3">
            {variants.map((v, idx) => (
              <div key={v.id} className="p-4 bg-slate-900 rounded-2xl border border-slate-800 grid grid-cols-1 sm:grid-cols-4 gap-3 items-center">
                <div>
                  <label className="text-[10px] text-slate-400 block font-bold">Tittel</label>
                  <input
                    type="text"
                    value={v.title}
                    onChange={(e) => {
                      const copy = [...variants];
                      copy[idx].title = e.target.value;
                      setVariants(copy);
                    }}
                    className="w-full p-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block font-bold">Pris (NOK)</label>
                  <input
                    type="number"
                    value={v.priceNok}
                    onChange={(e) => {
                      const copy = [...variants];
                      copy[idx].priceNok = Number(e.target.value);
                      setVariants(copy);
                    }}
                    className="w-full p-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block font-bold">Lager (stk)</label>
                  <input
                    type="number"
                    value={v.inventoryQuantity}
                    onChange={(e) => {
                      const copy = [...variants];
                      copy[idx].inventoryQuantity = Number(e.target.value);
                      setVariants(copy);
                    }}
                    className="w-full p-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
                  />
                </div>
                <div className="text-right">
                  {variants.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setVariants(variants.filter((_, i) => i !== idx))}
                      className="p-2 text-slate-400 hover:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="pt-2">
          <button
            type="submit"
            className="w-full bg-forest-700 hover:bg-forest-600 text-white font-bold py-4 px-6 rounded-2xl shadow-warm text-sm transition-all flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Lagre og publiser produkt 🐾</span>
          </button>
        </div>

      </form>
    </div>
  );
}
