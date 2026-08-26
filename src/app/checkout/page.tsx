'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import confetti from 'canvas-confetti';
import {
  ShieldCheck,
  Truck,
  CreditCard,
  CheckCircle2,
  Lock,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  MapPin,
  Mail,
  Phone,
  User,
  ShoppingBag,
} from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { db } from '@/lib/db';
import { ShippingCarrier, PaymentProvider, Order } from '@/types';
import { formatPrice } from '@/lib/utils';
import { useDogStore } from '@/store/useDogStore';

const POSTAL_CITY_MAPPING: Record<string, string> = {
  '0167': 'Oslo',
  '0350': 'Oslo',
  '0484': 'Oslo',
  '1337': 'Sandvika',
  '3015': 'Drammen',
  '4005': 'Stavanger',
  '4610': 'Kristiansand',
  '5014': 'Bergen',
  '7011': 'Trondheim',
  '9008': 'Tromsø',
};

export default function CheckoutPage() {
  const router = useRouter();
  const {
    items,
    getSubtotal,
    getTotal,
    getDiscountAmount,
    discountCode,
    clearCart,
  } = useCartStore();
  const { activeDog } = useDogStore();

  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Form states
  const [email, setEmail] = useState('emma.johansen@example.no');
  const [phone, setPhone] = useState('987 65 432');
  const [firstName, setFirstName] = useState('Emma');
  const [lastName, setLastName] = useState('Johansen');
  const [streetAddress, setStreetAddress] = useState('Ullevålsveien 42');
  const [postalCode, setPostalCode] = useState('0167');
  const [city, setCity] = useState('Oslo');
  const [customerNotes, setCustomerNotes] = useState('');

  // Choices
  const [carrier, setCarrier] = useState<ShippingCarrier>('bring');
  const [paymentProvider, setPaymentProvider] = useState<PaymentProvider>('vipps');
  const [isProcessing, setIsProcessing] = useState(false);
  const [stepError, setStepError] = useState<string | null>(null);

  useEffect(() => {
    if (postalCode.length === 4 && POSTAL_CITY_MAPPING[postalCode]) {
      setCity(POSTAL_CITY_MAPPING[postalCode]);
    }
  }, [postalCode]);

  const subtotal = getSubtotal();
  const total = getTotal();
  const discountAmount = getDiscountAmount();

  const handleStep1Next = () => {
    if (!email.includes('@') || phone.trim().length < 8) {
      setStepError('Vennligst fyll ut gyldig e-postadresse og telefonnummer.');
      return;
    }
    setStepError(null);
    setStep(2);
  };

  const handleStep2Next = () => {
    if (!firstName.trim() || !lastName.trim() || !streetAddress.trim() || postalCode.trim().length < 4 || !city.trim()) {
      setStepError('Vennligst fyll ut alle påkrevde adressefelter.');
      return;
    }
    setStepError(null);
    setStep(3);
  };

  const handleCompleteOrder = () => {
    setIsProcessing(true);

    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#161345', '#ffcfdb', '#60c4bf', '#ff7f00'],
      });
    } catch (e) {}

    setTimeout(() => {
      const newOrderNumber = `HG-${Math.floor(10000 + Math.random() * 90000)}`;

      const newOrder: Order = {
        id: `ord-${Date.now()}`,
        orderNumber: newOrderNumber,
        customerId: 'cust-1',
        customerName: `${firstName} ${lastName}`,
        customerEmail: email,
        customerPhone: phone,
        shippingAddress: {
          id: `addr-${Date.now()}`,
          type: 'shipping',
          fullName: `${firstName} ${lastName}`,
          streetAddress,
          postalCode,
          city,
          country: 'Norge',
          phone,
          isDefault: true,
        },
        items: items.map((item) => ({
          id: `item-${Date.now()}-${Math.random()}`,
          productId: item.productId,
          variantId: item.variantId,
          productName: item.productName,
          variantTitle: item.variantTitle,
          sku: item.variantId,
          unitPriceNok: item.priceNok,
          quantity: item.quantity,
          totalPriceNok: item.priceNok * item.quantity,
          imageUrl: item.imageUrl,
          vatAmountNok: Math.round(item.priceNok * item.quantity * 0.2),
        })),
        subtotalNok: subtotal,
        discountCode: discountCode ? discountCode.code : undefined,
        discountNok: discountAmount,
        shippingNok: subtotal >= 699 ? 0 : 69,
        vatNok: Math.round(total * 0.2),
        totalNok: total,
        status: 'processing',
        paymentProvider,
        paymentStatus: 'captured',
        shippingCarrier: carrier,
        shippingMethodName: carrier === 'bring' ? 'Bring — Pakke til Hentested' : carrier === 'postnord' ? 'PostNord — Hjemlevering' : 'Helthjem — Dørmatten',
        trackingNumber: '370720124891230000NO',
        customerNotes: customerNotes || undefined,
        dogId: activeDog?.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      db.createOrder(newOrder);

      // Decrement inventory
      items.forEach((item) => {
        db.adjustInventory(item.productId, item.variantId, -item.quantity, `Bestilling ${newOrderNumber}`);
      });

      clearCart();
      setIsProcessing(false);
      router.push(`/ordre-bekreftelse/${newOrder.id}`);
    }, 1500);
  };

  if (items.length === 0 && !isProcessing) {
    return (
      <div className="py-24 text-center space-y-4 max-w-md mx-auto">
        <h1 className="font-display text-2xl font-bold text-cocoa-bean">Handlekurven er tom</h1>
        <p className="text-xs text-stone-mute">Legg til varer før du går til kassen.</p>
        <Link href="/produkter" className="btn-finn-primary">
          <span>Se produkter</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-ash-border pb-6">
        <Link href="/handlekurv" className="text-xs font-semibold text-cocoa-bean hover:text-midnight-ink flex items-center gap-1.5">
          <ArrowLeft className="w-4 h-4" />
          <span>Tilbake til handlekurv</span>
        </Link>
        <div className="flex items-center gap-2 text-xs font-semibold text-midnight-ink">
          <Lock className="w-4 h-4" />
          <span>Sikker 256-bit SSL Norsk Utsjekk</span>
        </div>
      </div>

      {/* Main Grid: Form Steps + Order Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* LEFT COLUMN: 5 STEPS */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* STEP 1: CONTACT */}
          <div className="card-finn space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="font-display text-xl font-bold text-midnight-ink">
                  1. Kontaktinformasjon
                </h2>
                {step > 1 && <CheckCircle2 className="w-4 h-4 text-check-green" />}
              </div>
              {step > 1 && (
                <button type="button" onClick={() => setStep(1)} className="text-xs font-bold text-ember-orange">
                  Endre
                </button>
              )}
            </div>

            {step === 1 ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-cocoa-bean uppercase font-mono">E-post *</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="input-finn w-full text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-cocoa-bean uppercase font-mono">Mobiltelefon *</label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="input-finn w-full text-xs"
                    />
                  </div>
                </div>

                {stepError && step === 1 && (
                  <p className="text-xs text-ember-orange font-semibold">{stepError}</p>
                )}

                <button
                  type="button"
                  onClick={handleStep1Next}
                  className="btn-finn-primary !py-3 !px-6 text-sm font-semibold"
                >
                  <span>Fortsett til leveringsadresse</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <p className="text-xs text-stone-mute">{email} • {phone}</p>
            )}
          </div>

          {/* STEP 2: ADDRESS */}
          <div className="card-finn space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="font-display text-xl font-bold text-midnight-ink">
                  2. Leveringsadresse
                </h2>
                {step > 2 && <CheckCircle2 className="w-4 h-4 text-check-green" />}
              </div>
              {step > 2 && (
                <button type="button" onClick={() => setStep(2)} className="text-xs font-bold text-ember-orange">
                  Endre
                </button>
              )}
            </div>

            {step === 2 ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-cocoa-bean uppercase font-mono">Fornavn *</label>
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="input-finn w-full text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-cocoa-bean uppercase font-mono">Etternavn *</label>
                    <input
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="input-finn w-full text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-cocoa-bean uppercase font-mono">Gateadresse *</label>
                  <input
                    type="text"
                    required
                    value={streetAddress}
                    onChange={(e) => setStreetAddress(e.target.value)}
                    className="input-finn w-full text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-cocoa-bean uppercase font-mono">Postnummer *</label>
                    <input
                      type="text"
                      required
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      className="input-finn w-full text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-cocoa-bean uppercase font-mono">Poststed *</label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="input-finn w-full text-xs"
                    />
                  </div>
                </div>

                {stepError && step === 2 && (
                  <p className="text-xs text-ember-orange font-semibold">{stepError}</p>
                )}

                <button
                  type="button"
                  onClick={handleStep2Next}
                  className="btn-finn-primary !py-3 !px-6 text-sm font-semibold"
                >
                  <span>Fortsett til fraktmetode</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              step > 2 && <p className="text-xs text-stone-mute">{firstName} {lastName}, {streetAddress}, {postalCode} {city}</p>
            )}
          </div>

          {/* STEP 3: SHIPPING */}
          <div className="card-finn space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="font-display text-xl font-bold text-midnight-ink">
                  3. Frakt & Levering
                </h2>
                {step > 3 && <CheckCircle2 className="w-4 h-4 text-check-green" />}
              </div>
              {step > 3 && (
                <button type="button" onClick={() => setStep(3)} className="text-xs font-bold text-ember-orange">
                  Endre
                </button>
              )}
            </div>

            {step === 3 ? (
              <div className="space-y-3">
                {[
                  { id: 'bring', name: 'Bring — Pakke til Hentested', price: 'Gratis over 699,-', desc: '1-3 dager til nærmeste Post i Butikk' },
                  { id: 'postnord', name: 'PostNord — Hjemlevering', price: '59,-', desc: 'Kveldslevering rett på døren' },
                  { id: 'helthjem', name: 'Helthjem — Dørmatten', price: '49,-', desc: 'Levert før kl. 07:00 i morgen tidlig' },
                ].map((s) => (
                  <label
                    key={s.id}
                    onClick={() => setCarrier(s.id as any)}
                    className={`flex items-center justify-between p-4 rounded-[16px] border cursor-pointer transition-all ${
                      carrier === s.id
                        ? 'bg-sky-powder/20 border-midnight-ink ring-2 ring-midnight-ink'
                        : 'bg-cloud-white border-ash-border hover:bg-fog-gray'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="carrier"
                        checked={carrier === s.id}
                        onChange={() => setCarrier(s.id as any)}
                        className="text-midnight-ink focus:ring-midnight-ink"
                      />
                      <div>
                        <p className="font-sans font-medium text-xs sm:text-sm text-cocoa-bean">{s.name}</p>
                        <p className="text-[11px] text-stone-mute">{s.desc}</p>
                      </div>
                    </div>
                    <span className="font-sans font-semibold text-xs text-midnight-ink">{s.price}</span>
                  </label>
                ))}

                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="btn-finn-primary !py-3 !px-6 text-sm font-semibold mt-2"
                >
                  <span>Fortsett til betaling</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              step > 3 && <p className="text-xs text-stone-mute">{carrier.toUpperCase()}</p>
            )}
          </div>

          {/* STEP 4: PAYMENT */}
          <div className="card-finn space-y-4">
            <h2 className="font-display text-xl font-bold text-midnight-ink">
              4. Betaling
            </h2>

            {step === 4 && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'vipps', name: 'Vipps', desc: 'Rask & enkel' },
                    { id: 'klarna', name: 'Klarna', desc: 'Få først, betal senere' },
                    { id: 'stripe', name: 'Kort', desc: 'Visa / Mastercard' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPaymentProvider(p.id as any)}
                      className={`p-4 rounded-[16px] border text-center transition-all ${
                        paymentProvider === p.id
                          ? 'bg-sky-powder/20 border-midnight-ink ring-2 ring-midnight-ink'
                          : 'bg-cloud-white border-ash-border hover:bg-fog-gray'
                      }`}
                    >
                      <p className="font-display font-bold text-sm text-midnight-ink">{p.name}</p>
                      <p className="text-[10px] text-stone-mute mt-0.5">{p.desc}</p>
                    </button>
                  ))}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-cocoa-bean uppercase font-mono">
                    Beskjed til pakkeriet / sjåføren (valgfritt)
                  </label>
                  <input
                    type="text"
                    placeholder="F.eks. Ring på døren, sett pakken bak leveggen"
                    value={customerNotes}
                    onChange={(e) => setCustomerNotes(e.target.value)}
                    className="input-finn w-full text-xs"
                  />
                </div>

                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleCompleteOrder}
                  className="btn-finn-primary w-full !py-4 text-base font-semibold mt-4"
                >
                  <Lock className="w-4 h-4" />
                  <span>{isProcessing ? 'Behandler ordre...' : `Fullfør bestilling (${formatPrice(total)})`}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN: STICKY ORDER SUMMARY */}
        <div className="lg:col-span-5 space-y-4 sticky top-24">
          <div className="card-finn space-y-4">
            <h3 className="font-display font-bold text-lg text-midnight-ink border-b border-ash-border pb-3">
              Ordreoversikt ({items.length} varer)
            </h3>

            <div className="divide-y divide-ash-border max-h-80 overflow-y-auto">
              {items.map((item) => (
                <div key={item.variantId} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-[12px] bg-cloud-white overflow-hidden relative shrink-0">
                      <Image
                        src={item.imageUrl}
                        alt={item.productName}
                        fill
                        className="object-contain p-1.5"
                        sizes="48px"
                      />
                    </div>
                    <div>
                      <p className="font-sans font-medium text-xs text-cocoa-bean">{item.productName}</p>
                      <p className="text-[11px] text-stone-mute">{item.variantTitle} × {item.quantity}</p>
                    </div>
                  </div>
                  <span className="font-sans font-semibold text-xs text-cocoa-bean">
                    {formatPrice(item.priceNok * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-ash-border space-y-1.5 text-xs text-cocoa-bean">
              <div className="flex justify-between">
                <span className="text-stone-mute">Delsum</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-ember-orange font-semibold">
                  <span>Rabatt ({discountCode?.code || 'Kupong'})</span>
                  <span>-{formatPrice(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-stone-mute">Frakt</span>
                <span>{subtotal >= 699 ? 'GRATIS' : formatPrice(69)}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-cocoa-bean pt-2 border-t border-ash-border">
                <span>Totalsum (inkl. 25% MVA)</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
