import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { variantId } = await request.json();

    if (!variantId) {
      return NextResponse.json(
        { error: 'Variant ID is required' },
        { status: 400 }
      );
    }

    // Fetch current stock from database
    const { data: variant, error } = await supabase
      .from('variants')
      .select('stock_qty')
      .eq('id', variantId)
      .single();

    if (error) {
      console.error('Error fetching stock:', error);
      return NextResponse.json(
        { error: 'Failed to check stock' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      stockQty: variant?.stock_qty ?? null,
      available: variant?.stock_qty ? variant.stock_qty > 0 : false,
    });
  } catch (error) {
    console.error('Error in check-stock API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
