import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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
    const { product_id, sku, price, stock_qty } = body;

    // Fetch product name
    const { data: product, error: productError } = await supabaseAdmin
      .from('products')
      .select('name')
      .eq('id', product_id)
      .single();

    if (productError) {
      console.error('Error fetching product:', productError);
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const { data, error } = await supabaseAdmin
      .from('variants')
      .insert({
        product_id,
        product_name: product.name,
        sku,
        price,
        stock_qty,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      console.error('Error creating variant:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, variant: data?.[0] });
  } catch (error: any) {
    console.error('Error in create-variant API:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
