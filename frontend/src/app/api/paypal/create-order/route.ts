import { NextResponse } from 'next/server';

const PAYPAL_API_BASE = process.env.PAYPAL_MODE === 'live' 
  ? 'https://api-m.paypal.com' 
  : 'https://api-m.sandbox.paypal.com';

export async function POST(request: Request) {
  try {
    const { items } = await request.json();

    console.log('PayPal create-order called with items:', items);
    console.log('Environment check:', {
      hasClientId: !!process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID,
      hasClientSecret: !!process.env.PAYPAL_CLIENT_SECRET,
      mode: process.env.PAYPAL_MODE || 'sandbox (default)',
    });

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'No items in cart' }, { status: 400 });
    }

    if (!process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) {
      console.error('Missing PayPal credentials');
      return NextResponse.json({ error: 'PayPal configuration error' }, { status: 500 });
    }

    // Calculate total
    const total = items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
    console.log('Order total:', total);

    // Get PayPal access token
    const auth = Buffer.from(
      `${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
    ).toString('base64');

    const tokenResponse = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    const tokenData = await tokenResponse.json();
    
    if (!tokenResponse.ok) {
      console.error('PayPal auth failed:', tokenData);
      return NextResponse.json({ error: 'PayPal authentication failed', details: tokenData }, { status: 500 });
    }

    const { access_token } = tokenData;
    console.log('Got PayPal access token');

    // Create order
    const orderResponse = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: {
              currency_code: 'GBP',
              value: total.toFixed(2),
              breakdown: {
                item_total: {
                  currency_code: 'GBP',
                  value: total.toFixed(2),
                },
              },
            },
            items: items.map((item: any) => ({
              name: item.productName,
              description: item.variantName !== 'Standard' ? item.variantName : undefined,
              unit_amount: {
                currency_code: 'GBP',
                value: item.price.toFixed(2),
              },
              quantity: item.quantity.toString(),
              sku: item.variantId,
            })),
          },
        ],
      }),
    });

    const order = await orderResponse.json();

    if (!orderResponse.ok) {
      console.error('PayPal order creation failed:', order);
      return NextResponse.json({ 
        error: 'Failed to create order', 
        details: order,
        apiBase: PAYPAL_API_BASE 
      }, { status: 500 });
    }

    console.log('PayPal order created successfully:', order.id);
    return NextResponse.json({ orderID: order.id });
  } catch (error) {
    console.error('Error creating PayPal order:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
