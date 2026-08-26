'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  Star,
  ShieldCheck,
  Truck,
  RotateCcw,
  Plus,
  Minus,
  Heart,
  Share2,
  CheckCircle2,
  AlertCircle,
  Calculator,
  ShoppingBag,
  Sparkles,
  ArrowRight,
  MessageSquare,
} from 'lucide-react';
import { db } from '@/lib/db';
import { Product, ProductVariant, Review } from '@/types';
import { formatPrice } from '@/lib/utils';
import { useCartStore } from '@/store/useCartStore';
import { useWishlistStore } from '@/store/useWishlistStore';
import { useDogStore } from '@/store/useDogStore';

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [bundleProduct, setBundleProduct] = useState<Product | null>(null);
  const [includeBundle, setIncludeBundle] = useState(true);

  // Feeding calculator state
  const { activeDog, hasAllergyWarning } = useDogStore();
  const [dogWeightKg, setDogWeightKg] = useState<number>(activeDog?.weightKg || 15);
  const [activityLevel, setActivityLevel] = useState<'normal' | 'active' | 'working'>('normal');

  // Review form
  const [reviewName, setReviewName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const addItem = useCartStore((state) => state.addItem);
  const { isInWishlist, toggleWishlist } = useWishlistStore();

  useEffect(() => {
    if (!slug) return;
    const found = db.getProductBySlug(slug);
    if (found) {
      setProduct(found);
      setSelectedVariant(found.variants[0] || null);

      // Find bundle complement
      const allProds = db.getProducts();
      const complement = allProds.find((p) => p.id !== found.id && p.categorySlug === 'godbiter') || allProds[1];
      setBundleProduct(complement);
    }
    setReviews(db.getReviews());
  }, [slug]);

  if (!product) {
    return (
      <div className="py-24 text-center space-y-4">
        <div className="w-8 h-8 border-4 border-midnight-ink border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-stone-mute font-sans text-sm">Laster produkt...</p>
      </div>
    );
  }

  const isFavorited = isInWishlist(product.id);
  const allergyWarning = hasAllergyWarning(product);
  const currentPrice = selectedVariant?.priceNok || product.basePriceNok;
  const inStock = selectedVariant ? selectedVariant.inventoryQuantity > 0 : true;

  const handleAddToCart = () => {
    if (!selectedVariant) return;
    addItem(product, selectedVariant, quantity);

    if (includeBundle && bundleProduct && bundleProduct.variants[0]) {
      addItem(bundleProduct, bundleProduct.variants[0], 1);
    }
    useCartStore.getState().openDrawer();
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName || !reviewTitle || !reviewComment) return;

    const newRev = db.addReview({
      productId: product.id,
      productName: product.name,
      customerId: 'cust-1',
      customerName: reviewName,
      rating: reviewRating,
      title: reviewTitle,
      comment: reviewComment,
      verifiedPurchase: true,
    });

    setReviews((prev) => [newRev, ...prev]);
    setReviewSubmitted(true);
    setReviewName('');
    setReviewTitle('');
    setReviewComment('');
  };

  // Feeding calculator math
  const variantWeightGrams = selectedVariant?.weightGrams || 2000;
  const gramsPerDay = Math.round(dogWeightKg * (activityLevel === 'normal' ? 14 : activityLevel === 'active' ? 18 : 22));
  const bagDays = Math.max(1, Math.round((variantWeightGrams / (gramsPerDay || 1))));

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-16">
      
      {/* 1. BREADCRUMBS */}
      <nav className="flex items-center gap-2 text-xs text-stone-mute font-sans">
        <Link href="/" className="hover:text-cocoa-bean transition-colors">Hjem</Link>
        <span className="text-stone-mute/50">›</span>
        <Link href={`/produkter?kategori=${product.categorySlug}`} className="hover:text-cocoa-bean transition-colors">
          {product.categoryName}
        </Link>
        <span className="text-stone-mute/50">›</span>
        <span className="text-cocoa-bean font-semibold truncate max-w-xs">{product.name}</span>
      </nav>

      {/* 2. MAIN PDP PRODUCT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
        
        {/* LEFT COLUMN: IMAGE GALLERY */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative aspect-square w-full rounded-[24px] overflow-hidden bg-fog-gray">
            <Image
              src={product.images[selectedImageIndex]?.url || product.images[0]?.url}
              alt={product.name}
              fill
              priority
              className="object-contain p-8"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            {product.compareAtPriceNok && (
              <span className="absolute top-4 left-4 bg-ember-orange text-cloud-white text-xs font-bold px-3 py-1 rounded-pill uppercase tracking-wider">
                Tilbud
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`w-20 h-20 rounded-[16px] overflow-hidden relative bg-fog-gray shrink-0 border-2 transition-colors ${
                    selectedImageIndex === idx ? 'border-midnight-ink' : 'border-transparent'
                  }`}
                >
                  <Image src={img.url} alt={img.altText} fill className="object-contain p-2" sizes="80px" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: PRODUCT INFO & PURCHASE */}
        <div className="lg:col-span-6 space-y-6">
          
          <div>
            <span className="text-xs font-bold text-stone-mute uppercase tracking-wider font-mono">
              {product.brandName}
            </span>
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-midnight-ink leading-[1.05] mt-1">
              {product.name}
            </h1>

            {/* Reviews summary */}
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center text-ember-orange">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <span className="text-xs font-bold text-cocoa-bean">{product.rating}</span>
              <span className="text-xs text-stone-mute">({product.reviewCount || 14} verifiserte vurderinger)</span>
            </div>
          </div>

          {/* Pricing */}
          <div className="flex items-baseline gap-3">
            <span className="font-display font-bold text-3xl sm:text-4xl text-midnight-ink">
              {formatPrice(currentPrice)}
            </span>
            {product.compareAtPriceNok && (
              <span className="text-lg text-stone-mute line-through font-sans">
                {formatPrice(product.compareAtPriceNok)}
              </span>
            )}
            <span className="text-xs text-stone-mute">inkl. 25% MVA</span>
          </div>

          {/* Allergen Warning Pill */}
          {allergyWarning && activeDog && (
            <div className="p-3.5 bg-ember-orange/15 border border-ember-orange/30 rounded-pill flex items-center gap-2.5 text-xs text-cocoa-bean font-semibold">
              <AlertCircle className="w-4 h-4 text-ember-orange shrink-0" />
              <span>Allergenvarsel for {activeDog.name}: Produktet inneholder råvarer hunden reagerer på.</span>
            </div>
          )}

          {/* Short Description */}
          <p className="font-sans text-sm sm:text-base text-cocoa-bean/85 leading-relaxed">
            {product.shortDescription}
          </p>

          {/* Variant Selector (60px Pill Buttons) */}
          {product.variants.length > 1 && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-cocoa-bean uppercase tracking-wider block font-mono">
                Velg Størrelse / Vekt
              </label>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setSelectedVariant(v)}
                    className={`px-5 py-2.5 rounded-pill text-xs font-semibold transition-all ${
                      selectedVariant?.id === v.id
                        ? 'bg-midnight-ink text-cloud-white ring-2 ring-midnight-ink ring-offset-2'
                        : 'bg-fog-gray text-cocoa-bean hover:bg-ash-border'
                    }`}
                  >
                    <span>{v.title}</span>
                    <span className="ml-2 opacity-80">({formatPrice(v.priceNok)})</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity & Add to Cart Button */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            
            {/* Quantity Selector */}
            <div className="flex items-center justify-between sm:justify-center gap-4 bg-fog-gray rounded-pill px-4 py-3 border border-ash-border shrink-0">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="text-stone-mute hover:text-cocoa-bean"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="font-sans font-bold text-sm text-cocoa-bean w-6 text-center">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                className="text-stone-mute hover:text-cocoa-bean"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Add to Cart CTA Pill */}
            <button
              type="button"
              disabled={!inStock}
              onClick={handleAddToCart}
              className="btn-finn-primary flex-1 !py-4 text-base font-semibold"
            >
              <ShoppingBag className="w-5 h-5" />
              <span>{inStock ? 'Legg i handlekurv' : 'Midlertidig utsolgt'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Wishlist Button */}
            <button
              type="button"
              onClick={() => toggleWishlist(product.id)}
              className={`p-4 rounded-pill border transition-colors shrink-0 ${
                isFavorited
                  ? 'bg-ember-orange text-cloud-white border-ember-orange'
                  : 'bg-fog-gray text-stone-mute border-ash-border hover:text-ember-orange'
              }`}
              title="Legg til favoritter"
            >
              <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
            </button>

          </div>

          {/* Stock Status Indicator */}
          <div className="flex items-center gap-2 text-xs font-semibold text-cocoa-bean">
            <span className={`w-2.5 h-2.5 rounded-full ${inStock ? 'bg-check-green' : 'bg-red-500'}`} />
            <span>
              {inStock
                ? `På lager (${selectedVariant?.inventoryQuantity || 48} stk) — Sendes innen 24t med Bring`
                : 'Utsolgt'}
            </span>
          </div>

          {/* Trust Guarantees */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-ash-border text-center text-xs text-stone-mute">
            <div className="p-3.5 bg-fog-gray rounded-[20px] space-y-1.5 flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-sky-powder flex items-center justify-center text-midnight-ink">
                <Truck className="w-4 h-4" />
              </div>
              <p className="font-bold text-cocoa-bean text-xs">Bring Levering</p>
              <p className="text-[11px]">1-3 virkedager</p>
            </div>
            <div className="p-3.5 bg-fog-gray rounded-[20px] space-y-1.5 flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-mint-tide/30 flex items-center justify-center text-midnight-ink">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <p className="font-bold text-cocoa-bean text-xs">Smaksgaranti</p>
              <p className="text-[11px]">100% fornøyd</p>
            </div>
            <div className="p-3.5 bg-fog-gray rounded-[20px] space-y-1.5 flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-blush-petal/40 flex items-center justify-center text-midnight-ink">
                <RotateCcw className="w-4 h-4" />
              </div>
              <p className="font-bold text-cocoa-bean text-xs">Bring QR-Retur</p>
              <p className="text-[11px]">30 dagers åpent kjøp</p>
            </div>
          </div>

        </div>

      </div>

      {/* 3. BUNDLE CROSS-SELL (Sky Powder wash) */}
      {bundleProduct && (
        <section className="bg-sky-powder/40 rounded-[20px] p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-ember-orange" />
            <h3 className="font-display font-bold text-xl text-midnight-ink">
              Kjøpes ofte sammen
            </h3>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-[16px] bg-cloud-white p-2 relative overflow-hidden shrink-0">
                <Image
                  src={bundleProduct.images[0]?.url}
                  alt={bundleProduct.name}
                  fill
                  className="object-contain p-1"
                  sizes="64px"
                />
              </div>
              <div>
                <p className="font-sans font-medium text-sm text-cocoa-bean">{bundleProduct.name}</p>
                <p className="text-xs text-stone-mute">{bundleProduct.shortDescription}</p>
                <p className="text-xs font-bold text-midnight-ink mt-0.5">{formatPrice(bundleProduct.basePriceNok)}</p>
              </div>
            </div>

            <label className="flex items-center gap-2 bg-cloud-white px-4 py-2.5 rounded-pill text-xs font-semibold text-cocoa-bean cursor-pointer">
              <input
                type="checkbox"
                checked={includeBundle}
                onChange={(e) => setIncludeBundle(e.target.checked)}
                className="rounded text-midnight-ink focus:ring-midnight-ink w-4 h-4"
              />
              <span>Legg til i bestilling (+{formatPrice(bundleProduct.basePriceNok)})</span>
            </label>
          </div>
        </section>
      )}

      {/* 4. FEEDING CALCULATOR (Fog Gray Card) */}
      <section className="card-finn space-y-6">
        <div className="flex items-center gap-2">
          <Calculator className="w-5 h-5 text-midnight-ink" />
          <h3 className="font-display font-bold text-2xl text-midnight-ink">
            Fôrkalkulator for {product.name}
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold text-cocoa-bean">
                <span>Hundens vekt:</span>
                <span className="text-midnight-ink font-bold text-base">{dogWeightKg} kg</span>
              </div>
              <input
                type="range"
                min={2}
                max={60}
                value={dogWeightKg}
                onChange={(e) => setDogWeightKg(Number(e.target.value))}
                className="w-full accent-midnight-ink"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-cocoa-bean uppercase font-mono block">Aktivitetsnivå</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'normal', label: 'Normal' },
                  { id: 'active', label: 'Aktiv' },
                  { id: 'working', label: 'Jakthund / Trekk' },
                ].map((act) => (
                  <button
                    key={act.id}
                    type="button"
                    onClick={() => setActivityLevel(act.id as any)}
                    className={`py-2 rounded-pill text-xs font-semibold transition-all ${
                      activityLevel === act.id
                        ? 'bg-midnight-ink text-cloud-white'
                        : 'bg-cloud-white text-cocoa-bean'
                    }`}
                  >
                    {act.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-cloud-white p-6 rounded-[20px] text-center space-y-2">
            <span className="text-xs font-bold text-stone-mute uppercase tracking-wider block font-mono">
              Anbefalt dagsmengde
            </span>
            <strong className="font-display text-4xl font-bold text-midnight-ink block">
              {gramsPerDay} g / dag
            </strong>
            <p className="text-xs text-stone-mute">
              En standard 2 kg forpakning varer i omtrent <strong>{bagDays} dager</strong>.
            </p>
          </div>
        </div>
      </section>

      {/* 5. REVIEWS SECTION */}
      <section className="space-y-8">
        <div className="border-b border-ash-border pb-4 flex items-center justify-between">
          <h3 className="font-display font-bold text-2xl sm:text-3xl text-midnight-ink">
            Kundeomtaler ({reviews.length})
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reviews.map((rev) => (
            <div key={rev.id} className="card-finn space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center text-ember-orange">
                  {Array.from({ length: rev.rating }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
                <span className="text-xs text-stone-mute">{rev.customerName}</span>
              </div>
              <h4 className="font-display font-bold text-base text-cocoa-bean">{rev.title}</h4>
              <p className="font-sans text-xs sm:text-sm text-cocoa-bean/80 leading-relaxed italic">
                «{rev.comment}»
              </p>
              {rev.adminResponse && (
                <div className="p-3 bg-sky-powder/40 rounded-[14px] text-xs text-midnight-ink">
                  <strong>Svar fra Hundegodt:</strong> {rev.adminResponse}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
