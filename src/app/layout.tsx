import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/cart/CartDrawer';
import GlobalSearchModal from '@/components/search/GlobalSearchModal';
import MobileNav from '@/components/layout/MobileNav';

export const metadata: Metadata = {
  title: 'Hundegodt.no — Norsk nettbutikk for hundeprodukter & ernæring',
  description:
    'Hundegodt tilbyr naturlige tørkede godbiter, biologisk tilpasset hundefôr, ergonomiske seler og leker. Rask levering i hele Norge.',
  keywords: [
    'hundemat',
    'hundegodbiter',
    'okselever',
    'hundesele',
    'non-stop dogwear',
    'vom og hundemat',
    'hundeseng',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="nb">
      <body className="min-h-screen flex flex-col antialiased bg-cloud-white text-cocoa-bean selection:bg-blush-petal selection:text-midnight-ink pb-16 lg:pb-0">
        <Header />
        <main className="flex-1 w-full">
          {children}
        </main>
        <Footer />
        <CartDrawer />
        <GlobalSearchModal />
        <MobileNav />
      </body>
    </html>
  );
}
