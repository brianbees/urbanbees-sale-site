'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface CartItem {
  variantId: string;
  productId: string;
  name: string;
  variantName?: string;
  price: number;
  quantity: number;
  image?: string;
}

interface PayPalButtonProps {
  items: CartItem[];
  disabled: boolean;
}

declare global {
  interface Window {
    paypal?: any;
  }
}

export default function PayPalButton({ items, disabled }: PayPalButtonProps) {
  const paypalRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (disabled || !items.length) return;

    // Wait for PayPal SDK to load
    const interval = setInterval(() => {
      if (window.paypal && paypalRef.current) {
        clearInterval(interval);
        
        window.paypal.Buttons({
          // Create order on the server
          createOrder: async () => {
            try {
              console.log('Creating PayPal order with items:', items);
              const response = await fetch('/api/paypal/create-order', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ items }),
              });

              const data = await response.json();
              console.log('Create order response:', data);
              
              if (!response.ok) {
                console.error('Failed to create order:', data);
                throw new Error(data.error || 'Failed to create order');
              }

              return data.orderID;
            } catch (error) {
              console.error('Error creating order:', error);
              alert(`Failed to create PayPal order: ${error instanceof Error ? error.message : 'Unknown error'}`);
              throw error;
            }
          },

          // Capture order on the server after approval
          onApprove: async (data: any) => {
            try {
              const response = await fetch('/api/paypal/capture-order', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  orderID: data.orderID,
                  items,
                }),
              });

              const result = await response.json();

              if (!response.ok) {
                throw new Error(result.error || 'Failed to capture order');
              }

              // Redirect to success page
              router.push(`/success?orderId=${data.orderID}`);
            } catch (error) {
              console.error('Error capturing order:', error);
              alert('Payment was approved but there was an error processing it. Please contact support.');
            }
          },

          onError: (err: any) => {
            console.error('PayPal error:', err);
            alert('An error occurred with PayPal. Please try again.');
          },

          onCancel: () => {
            console.log('Payment cancelled by user');
          },

          style: {
            layout: 'vertical',
            color: 'gold',
            shape: 'rect',
            label: 'paypal',
          },
        }).render(paypalRef.current);
      }
    }, 100);

    return () => {
      clearInterval(interval);
      // Clean up PayPal buttons
      if (paypalRef.current) {
        paypalRef.current.innerHTML = '';
      }
    };
  }, [items, disabled, router]);

  if (disabled || !items.length) {
    return (
      <button
        disabled
        className="w-full py-4 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed"
      >
        Please resolve stock issues to proceed
      </button>
    );
  }

  return <div ref={paypalRef} className="w-full"></div>;
}
