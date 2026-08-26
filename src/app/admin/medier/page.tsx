'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Image as ImageIcon, UploadCloud, Trash2, Copy, CheckCircle2, ExternalLink } from 'lucide-react';

const INITIAL_MEDIA_ASSETS = [
  {
    id: 'med-1',
    title: 'Okselever Produktbilde',
    url: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=800&h=800&q=80',
    dimensions: '800 x 800',
    size: '142 KB (WebP)',
    usedIn: 'Naturlig Tørket Okselever',
  },
  {
    id: 'med-2',
    title: 'Non-stop Y-Sele Action',
    url: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&h=800&q=80',
    dimensions: '800 x 800',
    size: '188 KB (WebP)',
    usedIn: 'Line Harness Y-Sele',
  },
  {
    id: 'med-3',
    title: 'Acana Puppy Hundemat',
    url: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?auto=format&fit=crop&w=800&h=800&q=80',
    dimensions: '800 x 800',
    size: '160 KB (WebP)',
    usedIn: 'Acana Puppy & Junior',
  },
  {
    id: 'med-4',
    title: 'Ortopedisk Hundeseng',
    url: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=800&h=800&q=80',
    dimensions: '800 x 800',
    size: '210 KB (WebP)',
    usedIn: 'Nordic Dream Hundeseng',
  },
  {
    id: 'med-5',
    title: 'KONG Classic Leke',
    url: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=800&h=800&q=80',
    dimensions: '800 x 800',
    size: '125 KB (WebP)',
    usedIn: 'KONG Classic',
  },
];

export default function AdminMediaPage() {
  const [mediaList, setMediaList] = useState(INITIAL_MEDIA_ASSETS);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyUrl = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSimulateUpload = () => {
    const newMedia = {
      id: `med-${Date.now()}`,
      title: 'Nytt opplastet bilde',
      url: 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=800&h=800&q=80',
      dimensions: '800 x 800',
      size: '154 KB (WebP)',
      usedIn: 'Ikke i bruk ennå',
    };
    setMediaList([newMedia, ...mediaList]);
  };

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Mediebibliotek ({mediaList.length})</h1>
          <p className="text-xs text-slate-400 mt-1">
            Automatisk WebP-optimalisering, beskjæring og bruksreferanser.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSimulateUpload}
          className="px-4 py-2.5 bg-forest-700 hover:bg-forest-600 text-white rounded-xl text-xs font-bold transition-all shadow-warm flex items-center gap-1.5 self-start sm:self-auto"
        >
          <UploadCloud className="w-4 h-4" />
          <span>Last opp bilde</span>
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
        {mediaList.map((m) => (
          <div
            key={m.id}
            className="bg-slate-950/80 rounded-3xl border border-slate-800 shadow-xl overflow-hidden group space-y-3 p-3.5"
          >
            <div className="w-full aspect-square rounded-2xl overflow-hidden relative bg-slate-900 border border-slate-800">
              <Image src={m.url} alt={m.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="250px" />
            </div>

            <div className="space-y-1">
              <p className="font-bold text-white text-xs truncate">{m.title}</p>
              <p className="text-[11px] text-slate-400">{m.dimensions} • {m.size}</p>
              <p className="text-[10px] text-forest-400 truncate">Brukt i: {m.usedIn}</p>
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
              <button
                type="button"
                onClick={() => handleCopyUrl(m.id, m.url)}
                className="text-[11px] font-bold text-slate-300 hover:text-white flex items-center gap-1"
              >
                {copiedId === m.id ? (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Kopiert!
                  </span>
                ) : (
                  <>
                    <Copy className="w-3 h-3" /> Kopier URL
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setMediaList(mediaList.filter((x) => x.id !== m.id))}
                className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                title="Slett fil"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
