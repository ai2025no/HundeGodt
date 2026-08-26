'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ShieldCheck,
  Truck,
  RotateCcw,
  Heart,
  ArrowRight,
  CheckCircle2,
  Mail,
} from 'lucide-react';

export default function Footer() {
  const pathname = usePathname();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  if (pathname.startsWith('/admin')) {
    return null;
  }

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setEmail('');
  };

  return (
    <footer className="bg-midnight-ink text-cloud-white pt-16 sm:pt-20 pb-12 border-t border-midnight-ink">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* TOP SECTION: BRAND PROMISE & NEWSLETTER */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start border-b border-white/10 pb-16">
          
          <div className="lg:col-span-6 space-y-4">
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-cloud-white">
              Alt det beste for din firbente bestevenn<span className="text-ember-orange">.</span>
            </h2>
            <p className="text-sm sm:text-base text-cloud-white/80 max-w-lg leading-relaxed font-sans">
              Hundegodt er en moderne norsk kvalitetsbutikk for hundeeiere. Vi velger kun naturlige råvarer, godkjent ernæring og ergonomisk turutstyr.
            </p>
          </div>

          <div className="lg:col-span-6 space-y-3">
            <h3 className="font-display font-bold text-lg text-cloud-white">
              Få 10% rabatt på første bestilling
            </h3>
            <p className="text-xs sm:text-sm text-cloud-white/70">
              Meld deg på vårt nyhetsbrev for fôringsråd, eksklusive tilbud og nye produktlanseringer.
            </p>

            {subscribed ? (
              <div className="p-4 rounded-pill bg-mint-tide/20 border border-mint-tide/40 text-xs font-semibold text-mint-tide flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-check-green" />
                <span>Takk for påmeldingen! Sjekk innboksen for din rabattkode: <strong>VELKOMMEN10</strong></span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2 max-w-md">
                <div className="relative flex-1">
                  <Mail className="w-4 h-4 text-stone-mute absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="Din e-postadresse..."
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-white/10 border border-white/20 rounded-pill text-xs sm:text-sm text-cloud-white placeholder:text-white/50 focus:outline-none focus:border-cloud-white transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-3 bg-cloud-white text-midnight-ink hover:bg-fog-gray rounded-pill text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-1.5 shrink-0"
                >
                  <span>Meld på</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            )}

            <p className="text-[11px] text-white/50">
              Ingen spam. Du kan melde deg av når som helst. Les vår <Link href="/personvern" className="underline hover:text-cloud-white">personvernerklæring</Link>.
            </p>
          </div>

        </div>

        {/* MIDDLE SECTION: 4 COLUMNS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-xs">
          
          <div className="space-y-3">
            <h4 className="font-display font-bold text-sm tracking-wider uppercase text-cloud-white">Godbiter & Snacks</h4>
            <ul className="space-y-2 text-white/70 font-sans">
              <li><Link href="/produkter?kategori=torket-kjott" className="hover:text-cloud-white transition-colors">Tørket Rent Kjøtt</Link></li>
              <li><Link href="/produkter?kategori=trening-og-belonning" className="hover:text-cloud-white transition-colors">Treningsbiter & Belønning</Link></li>
              <li><Link href="/produkter?kategori=tyggebein-og-kos" className="hover:text-cloud-white transition-colors">Tyggebein & Langvarig Kos</Link></li>
              <li><Link href="/produkter?kategori=valpegodbiter" className="hover:text-cloud-white transition-colors">Valpegodbiter</Link></li>
              <li><Link href="/produkter?kategori=tannhelse-og-funksjonelt" className="hover:text-cloud-white transition-colors">Tannhelse & Funksjonelt Tygg</Link></li>
              <li><Link href="/produkter?kategori=gaveesker-og-mix" className="hover:text-cloud-white transition-colors">Gaveesker & Godbit-Mix</Link></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-display font-bold text-sm tracking-wider uppercase text-cloud-white">Kundeservice</h4>
            <ul className="space-y-2 text-white/70 font-sans">
              <li><Link href="/returportal" className="hover:text-cloud-white transition-colors">Selvbetjent Returportal (Bring QR)</Link></li>
              <li><Link href="/guider" className="hover:text-cloud-white transition-colors">Fôrkalkulator & Veiledning</Link></li>
              <li><Link href="/konto/ordrer" className="hover:text-cloud-white transition-colors">Sporing av forsendelse</Link></li>
              <li><Link href="/returportal" className="hover:text-cloud-white transition-colors">Smaksgaranti på tørrfôr</Link></li>
              <li><Link href="/personvern" className="hover:text-cloud-white transition-colors">Kjøpsbetingelser & Angrerett</Link></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-display font-bold text-sm tracking-wider uppercase text-cloud-white">Om Hundegodt</h4>
            <ul className="space-y-2 text-white/70 font-sans">
              <li><span className="text-white/90">Hundegodt AS</span></li>
              <li><span className="text-white/70">Org.nr: 934 123 456 MVA</span></li>
              <li><span className="text-white/70">Norsk lager: Oslo Logistikkpark</span></li>
              <li><span className="text-white/70">E-post: hei@hundegodt.no</span></li>
              <li><span className="text-white/70">Tlf: +47 22 00 11 22 (09-16)</span></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-display font-bold text-sm tracking-wider uppercase text-cloud-white">Trygghet & Kvalitet</h4>
            <div className="space-y-2 text-xs text-white/80">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-sky-powder" />
                <span>Fri frakt over 699 kr (Bring)</span>
              </div>
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-blush-petal" />
                <span>30 dagers åpent kjøp</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-mint-tide" />
                <span>Klarna, Vipps & Sikker Kortbetaling</span>
              </div>
            </div>
          </div>

        </div>

        {/* BOTTOM LEGAL & COPYRIGHT */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/60">
          <p>© {new Date().getFullYear()} Hundegodt AS. Alle rettigheter reservert. Utviklet for moderne hundeeiere i Norge.</p>
          <div className="flex items-center gap-4">
            <Link href="/personvern" className="hover:text-cloud-white transition-colors">Personvernerklæring & Cookies</Link>
            <span>•</span>
            <Link href="/admin" className="hover:text-cloud-white transition-colors">Commerce OS Admin</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
