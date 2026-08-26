'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Lock, Eye, CheckCircle2 } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="py-8 sm:py-12 max-w-3xl mx-auto space-y-8">
      
      <div className="border-b border-sand-200 pb-4">
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-bark-900">
          Personvernerklæring & Salgsvilkår
        </h1>
        <p className="text-xs sm:text-sm text-sage-600 mt-1">
          Sist oppdatert: 26. august 2026 • Gjelder for Hundegodt AS (Org.nr: 928 412 882 MVA)
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-sand-200 shadow-subtle space-y-6 text-xs sm:text-sm text-sage-800 leading-relaxed">
        
        <section className="space-y-2">
          <h2 className="font-serif text-lg font-bold text-bark-900">1. Behandling av Personopplysninger (GDPR)</h2>
          <p>
            Hundegodt AS behandler personopplysninger i henhold til den norske personopplysningsloven og EUs personvernforordning (GDPR).
            Vi samler kun inn opplysninger som er nødvendige for å levere dine bestilte varer, opprettholde hundeprofiler for personalisert fôringsveiledning, og sende deg sporingsinformasjon.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-lg font-bold text-bark-900">2. Hvilke opplysninger samles inn?</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Kontaktinformasjon (navn, adresse, e-post, telefonnummer)</li>
            <li>Hundeprofiler (hundenavn, rase, fødselsdato, vekt, fôrallergier) for skreddersydde råd</li>
            <li>Ordrehistorikk og betalingsstatus via Vipps, Klarna eller Stripe</li>
            <li>Teknisk bruksdata (informasjonskapsler / cookies) for handlekurv og søk</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-lg font-bold text-bark-900">3. Dine Rettigheter</h2>
          <p>
            Du har rett til innsyn, retting, dataportabilitet (eksport i JSON) og sletting av dine personopplysninger.
            Du kan når som helst laste ned dine data eller be om sletting direkte under <Link href="/konto/sikkerhet" className="text-forest-800 font-bold underline">Min Side → Sikkerhet</Link>.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-lg font-bold text-bark-900">4. 30 Dagers Åpent Kjøp & Angrerett</h2>
          <p>
            Du har 30 dagers full angrerett fra du mottar varen. Varen må returneres i opprinnelig stand.
            Bruk vår <Link href="/returportal" className="text-forest-800 font-bold underline">selvbetjente returportal</Link> for å hente ut gratis digital Bring returkode.
          </p>
        </section>

      </div>

    </div>
  );
}
