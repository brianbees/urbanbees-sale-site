"use client";
import { usePathname } from 'next/navigation';
import Header from './Header';
import Script from 'next/script';

export default function HeaderWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isForPrintPage = pathname === '/for_print';

  return <>
    {!isForPrintPage && <Header />}
    {!isForPrintPage && (
      <Script
        src={`https://www.paypal.com/sdk/js?client-id=${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}&currency=GBP`}
        strategy="lazyOnload"
      />
    )}
    {children}
  </>;
}
