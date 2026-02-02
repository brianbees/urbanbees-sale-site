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
    const { product, variants } = body;

    // Insert product
    const { data: newProduct, error: productError } = await supabaseAdmin
      .from('products')
      .insert(product)
      .select()
      .single();

    if (productError) {
      console.error('Error creating product:', productError);
      return NextResponse.json({ error: productError.message }, { status: 500 });
    }

    // Insert variants
    if (variants && variants.length > 0) {
      const variantsWithProductId = variants.map((v: any) => ({
        ...v,
        product_id: newProduct.id
      }));

      const { error: variantsError } = await supabaseAdmin
        .from('variants')
        .insert(variantsWithProductId);

      if (variantsError) {
        console.error('Error creating variants:', variantsError);
        return NextResponse.json({ error: variantsError.message }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true, product: newProduct });
  } catch (error: any) {
    console.error('Error in create-product API:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
