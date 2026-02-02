import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create admin client server-side (not exposed to browser)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { variantId, sku, price, stock_qty } = body;

    // Update variant
    const { error: variantError } = await supabaseAdmin
      .from('variants')
      .update({
        sku,
        price,
        stock_qty,
        updated_at: new Date().toISOString(),
      })
      .eq('id', variantId);

    if (variantError) {
      console.error('Error updating variant:', variantError);
      return NextResponse.json({ error: variantError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error in update-variant API:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
