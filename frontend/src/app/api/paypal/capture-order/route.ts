import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const PAYPAL_API_BASE = process.env.PAYPAL_MODE === 'live' 
  ? 'https://api-m.paypal.com' 
  : 'https://api-m.sandbox.paypal.com';

export async function POST(request: Request) {
  try {
    const { orderID, items } = await request.json();

    if (!orderID) {
      return NextResponse.json({ error: 'Order ID required' }, { status: 400 });
    }

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

    const { access_token } = await tokenResponse.json();

    // Capture payment
    const captureResponse = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders/${orderID}/capture`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json',
      },
    });

    const captureData = await captureResponse.json();

    if (!captureResponse.ok || captureData.status !== 'COMPLETED') {
      console.error('PayPal capture failed:', captureData);
      return NextResponse.json({ error: 'Payment capture failed' }, { status: 500 });
    }

    // Payment successful - decrease stock for each item
    const stockUpdates = [];
    for (const item of items) {
      try {
        // Get current stock
        const { data: variant, error: fetchError } = await supabase
          .from('variants')
          .select('stock_qty')
          .eq('id', item.variantId)
          .single();

        if (fetchError) {
          console.error('Error fetching variant:', fetchError);
          continue;
        }

        // Calculate new stock
        const newStock = Math.max(0, (variant.stock_qty || 0) - item.quantity);

        // Update stock
        const { error: updateError } = await supabase
          .from('variants')
          .update({ stock_qty: newStock })
          .eq('id', item.variantId);

        if (updateError) {
          console.error('Error updating stock:', updateError);
        } else {
          stockUpdates.push({
            variantId: item.variantId,
            productName: item.productName,
            oldStock: variant.stock_qty,
            newStock: newStock,
            quantitySold: item.quantity,
          });
        }
      } catch (error) {
        console.error('Error processing stock update:', error);
      }
    }

    return NextResponse.json({
      success: true,
      orderID: captureData.id,
      status: captureData.status,
      stockUpdates,
    });
  } catch (error) {
    console.error('Error capturing PayPal payment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
