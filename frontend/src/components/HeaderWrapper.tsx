"use client";
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Header from './Header';
import Script from 'next/script';

export default function HeaderWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isForPrintPage = mounted && pathname === '/for_print';

  if (isForPrintPage) {
    return <>{children}</>;
  }

  return <>
    <Header />
    <Script
      src={`https://www.paypal.com/sdk/js?client-id=${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}&currency=GBP`}
      strategy="lazyOnload"
    />
    {children}
  </>;
}
