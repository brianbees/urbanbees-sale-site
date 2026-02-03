import './globals.css';
import { Inter } from 'next/font/google';
import Header from '@/components/Header';
import Script from 'next/script';
import type { Metadata } from 'next';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: "Urban Bees | Premium Beekeeping Supplies",
  description: "Premium beekeeping supplies and local honey from our urban hives. Support local beekeepers and help our pollinators thrive.",
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Header />
        {children}
        {/* PayPal SDK */}
        <Script
          src={`https://www.paypal.com/sdk/js?client-id=${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}&currency=GBP`}
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}
