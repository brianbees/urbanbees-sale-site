import './globals.css';
import { Inter } from 'next/font/google';
import HeaderWrapper from '@/components/HeaderWrapper';
import Script from 'next/script';
import type { Metadata } from 'next';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: "Beekeeping items for sale",
  description: "End of business sale",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Google Analytics 4 */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-8BMV22MY3X"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-8BMV22MY3X');
          `}
        </Script>

        <HeaderWrapper>{children}</HeaderWrapper>
      </body>
    </html>
  );
}
