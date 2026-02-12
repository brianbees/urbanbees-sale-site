// src\app\page.tsx
// 

import { supabase } from '@/lib/supabase';
import ProductsGrid from '@/components/ProductsGrid';
import type { DatabaseProduct, DatabaseVariant } from '@/types/database';
import type { Product } from '@/data/products';

// Revalidate every 5 minutes for better performance
export const revalidate = 300;

async function getProducts() {
  try {
    // Fetch products and their variants
    const { data: dbProducts, error: productsError } = await supabase
      .from('products')
      .select('*')
      .order('name');

    if (productsError) throw productsError;

    const { data: dbVariants, error: variantsError } = await supabase
      .from('variants')
      .select('*');

    if (variantsError) throw variantsError;

    // Transform database products to frontend format
    const products: Product[] = (dbProducts || []).map((dbProduct: DatabaseProduct) => {
      const productVariants = (dbVariants || [])
        .filter((v: DatabaseVariant) => v.product_id === dbProduct.id)
        .map((v: DatabaseVariant) => ({
          id: v.id,
          sku: v.sku,
          optionValues: v.option_values || {},
          price: v.price,
          msrp: null,
          stockQty: v.stock_qty,
        }));

      return {
        id: dbProduct.id,
        name: dbProduct.name,
        slug: dbProduct.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        category: dbProduct.category as any,
        description: dbProduct.description,
        features: [],
        currency: 'GBP' as const,
        options: [],
        variants: productVariants.length > 0 ? productVariants : [{
          id: 'default',
          optionValues: {},
          price: null,
          msrp: null,
          stockQty: null,
        }],
        images: (dbProduct.images || []).map((src: string) => ({
          src,
          alt: dbProduct.name,
        })).concat(
          // Add placeholder if no images
          (dbProduct.images || []).length === 0
            ? [{ src: '/images/placeholder.jpg', alt: 'No image' }]
            : []
        ),
        created_at: dbProduct.created_at,
        updated_at: dbProduct.updated_at,
      };
    });

    return products;
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

export default async function Home() {
  const products = await getProducts();

  return (
    <main className="min-h-screen bg-stone-100">
      <div className="container mx-auto px-3 md:px-4 py-6 md:py-12">
        <div className="text-center mb-4 md:mb-8">
          <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-zinc-800 mb-2 md:mb-3">
            Beekeeping items for sale
          </h1>
          <p className="text-sm md:text-lg text-zinc-600 max-w-2xl mx-auto px-4 mb-2 md:mb-4">
            End of business sale. 
            
          </p>
        </div>

        <ProductsGrid initialProducts={products} />
      </div>
    </main>
  );
}
