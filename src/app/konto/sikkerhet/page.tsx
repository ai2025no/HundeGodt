'use client';

import React, { useState } from 'react';
import { Shield, Download, Trash2, CheckCircle2, Lock, ArrowRight } from 'lucide-react';
import { db } from '@/lib/db';

export default function SecurityPage() {
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleExportData = () => {
    const cust = db.getCustomers()[0];
    const ords = db.getOrders();
    const exportObject = {
      profile: cust,
      orders: ords,
      exportedAt: new Date().toISOString(),
      formatVersion: 'GDPR_JSON_v1',
    };

    const blob = new Blob([JSON.stringify(exportObject, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hundegodt-personopplysninger-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      
      <div className="border-b border-ash-border pb-4">
        <h2 className="font-display font-bold text-2xl text-midnight-ink">Personvern & GDPR Sikkerhet</h2>
        <p className="text-xs text-stone-mute mt-1">
          Last ned alle dine lagrede personopplysninger eller administrer samtykker.
        </p>
      </div>

      <div className="card-finn space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-pill bg-sky-powder flex items-center justify-center text-midnight-ink shrink-0">
            <Download className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-bold text-lg text-cocoa-bean">Eksporter Mine Data (JSON)</h3>
            <p className="text-xs text-stone-mute">
              I henhold til GDPR Artikkel 20 har du rett til dataportabilitet.
            </p>
          </div>
        </div>

        <p className="text-xs text-cocoa-bean/80 leading-relaxed font-sans">
          Filen inneholder dine lagrede kontaktopplysninger, adresser, registrerte hunder, allergier og full kjøpshistorikk.
        </p>

        <div className="flex items-center gap-4 pt-2">
          <button
            type="button"
            onClick={handleExportData}
            className="btn-finn-primary !py-3 !px-6 text-xs font-semibold"
          >
            <Download className="w-4 h-4" />
            <span>Last ned personopplysninger (.json)</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {downloadSuccess && (
            <span className="text-xs text-check-green font-bold flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Data lastet ned!
            </span>
          )}
        </div>
      </div>

      <div className="card-finn space-y-4">
        <div className="flex items-center gap-3 text-ember-orange">
          <Trash2 className="w-5 h-5" />
          <h3 className="font-display font-bold text-lg text-cocoa-bean">Sletting av Brukerkonto</h3>
        </div>

        <p className="text-xs text-cocoa-bean/80 leading-relaxed font-sans">
          Du kan når som helst be om full sletting av din profil og tilknyttede hundeprofiler. Regnskapsrelevante ordredata anonymiseres etter 5 år i henhold til norsk bokføringslov.
        </p>

        <button
          type="button"
          onClick={() => alert('Forespørsel om sletting er mottatt. Vi vil behandle denne innen 48 timer.')}
          className="btn-finn-outline !border-ember-orange !text-ember-orange hover:!bg-ember-orange/10 !py-3 !px-6 text-xs font-semibold"
        >
          <span>Be om sletting av personopplysninger</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
}
