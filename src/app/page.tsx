'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { db } from '@/lib/db';
import {
  Product,
  Category,
  Brand,
  Review,
  CmsHeroBlock,
  CmsSectionBlock,
} from '@/types';
import HeroSection from '@/components/home/HeroSection';
import DogPersonalizationBanner from '@/components/dogs/DogPersonalizationBanner';
import HomeDynamicSections from '@/components/home/HomeDynamicSections';

export default function HomePage() {
  const [hero, setHero] = useState<CmsHeroBlock>(() => db.getHero());
  const [sections, setSections] = useState<CmsSectionBlock[]>(() => db.getCmsSections());
  const [products, setProducts] = useState<Product[]>(() => db.getProducts());
  const [categories, setCategories] = useState<Category[]>(() => db.getCategories());
  const [brands, setBrands] = useState<Brand[]>(() => db.getBrands());
  const [reviews, setReviews] = useState<Review[]>(() => db.getReviews());

  const loadData = () => {
    setHero(db.getHero());
    setSections(db.getCmsSections());
    setProducts(db.getProducts());
    setCategories(db.getCategories());
    setBrands(db.getBrands());
    setReviews(db.getReviews());
  };

  useEffect(() => {
    loadData();

    // Listen to storage update events so edits in Admin reflect immediately!
    const handleStorageUpdate = () => loadData();
    window.addEventListener('hg_storage_updated', handleStorageUpdate);

    return () => {
      window.removeEventListener('hg_storage_updated', handleStorageUpdate);
    };
  }, []);

  return (
    <div className="w-full flex flex-col">
      {/* 1. HERO SECTION (Full-bleed Blush Petal #ffcfdb) */}
      <HeroSection hero={hero} />

      {/* 2. DOG PERSONALIZATION BANNER (Full-bleed Sky Powder #d7ecff) */}
      <DogPersonalizationBanner />

      {/* 3. DYNAMIC MODULAR SECTIONS (Press strip, bestsellers, Y-sele feature, dark vet section) */}
      <HomeDynamicSections
        products={products}
        categories={categories}
        brands={brands}
      />
    </div>
  );
}
