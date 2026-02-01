import './globals.css';
import { Inter } from 'next/font/google';
import Cart from '@/components/Cart';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: "Urban Bees | Premium Beekeeping Supplies",
  description: "Premium beekeeping supplies and local honey from our urban hives. Support local beekeepers and help our pollinators thrive.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Cart />
      </body>
    </html>
  );
}
