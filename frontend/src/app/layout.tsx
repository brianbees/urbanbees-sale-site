import './globals.css';
import { Inter } from 'next/font/google';
import HeaderWrapper from '@/components/HeaderWrapper';
import type { Metadata } from 'next';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: "Urban Bees | Premium Beekeeping Supplies",
  description: "Premium beekeeping supplies and local honey from our urban hives. Support local beekeepers and help our pollinators thrive.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <HeaderWrapper>{children}</HeaderWrapper>
      </body>
    </html>
  );
}
