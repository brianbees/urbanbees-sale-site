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
    const { productId, name, category, description, images } = body;

    // Update product
    const { error: updateError } = await supabaseAdmin
      .from('products')
      .update({
        name,
        category,
        description,
        images,
        updated_at: new Date().toISOString(),
      })
      .eq('id', productId);

    if (updateError) {
      console.error('Error updating product:', updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // Update product_name in all variants for this product
    const { error: variantsUpdateError } = await supabaseAdmin
      .from('variants')
      .update({
        product_name: name,
        updated_at: new Date().toISOString(),
      })
      .eq('product_id', productId);

    if (variantsUpdateError) {
      console.error('Error updating variant product names:', variantsUpdateError);
      // Don't fail the request, just log the error
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error in update-product API:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
