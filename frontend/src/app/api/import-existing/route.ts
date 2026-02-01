// frontend/src/app/api/import-existing/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { products } from '@/data/products';

export async function POST() {
  try {
    console.log(`Starting import of ${products.length} products...`);

    const results = {
      success: 0,
      skipped: 0,
      errors: 0,
      details: [] as string[],
    };

    for (const product of products) {
      try {
        // Check if product already exists by name
        const { data: existing } = await supabase
          .from('products')
          .select('id')
          .eq('name', product.name)
          .single();

        if (existing) {
          results.skipped++;
          results.details.push(`⏭️  Skipped: ${product.name} (already exists)`);
          continue;
        }

        // Insert product
        const { data: insertedProduct, error: productError } = await supabase
          .from('products')
          .insert({
            name: product.name,
            category: product.category,
            description: product.description || null,
            images: (product.images && product.images.length > 0) ? product.images.map(img => img.src) : [],
          })
          .select()
          .single();

        if (productError) throw productError;

        // Insert variants
        const validVariants = product.variants.filter(v => v.price !== null);
        
        if (validVariants.length > 0) {
          const variantInserts = validVariants.map(variant => ({
            product_id: insertedProduct.id,
            sku: variant.sku || null,
            price: variant.price,
            stock_qty: variant.stockQty || 0,
            option_values: variant.optionValues || {},
          }));

          const { error: variantError } = await supabase
            .from('variants')
            .insert(variantInserts);

          if (variantError) throw variantError;
        }

        results.success++;
        results.details.push(`✅ Imported: ${product.name} (${validVariants.length} variants)`);

      } catch (error: any) {
        results.errors++;
        results.details.push(`❌ Error with ${product.name}: ${error.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Import complete: ${results.success} imported, ${results.skipped} skipped, ${results.errors} errors`,
      results,
    });
  } catch (error: any) {
    console.error('Import error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to import products' },
      { status: 500 }
    );
  }
}
