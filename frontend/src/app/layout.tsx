import './globals.css';
import { Inter } from 'next/font/google';
import HeaderWrapper from '@/components/HeaderWrapper';
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
        <HeaderWrapper>{children}</HeaderWrapper>
      </body>
    </html>
  );
}
