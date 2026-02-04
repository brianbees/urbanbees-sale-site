"use client";
import Header from './Header';
import Script from 'next/script';

export default function HeaderWrapper({ children }: { children: React.ReactNode }) {
  if (typeof window !== 'undefined' && window.location.pathname === '/for_print') {
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
