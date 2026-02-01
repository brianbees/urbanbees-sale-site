// frontend/src/app/api/deploy-products/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import fs from 'fs';
import path from 'path';

export async function POST() {
  try {
    // Fetch all products and variants
    const { data: dbProducts, error: productsError } = await supabase
      .from('products')
      .select('*')
      .order('name');

    if (productsError) throw productsError;

    const { data: dbVariants, error: variantsError } = await supabase
      .from('variants')
      .select('*');

    if (variantsError) throw variantsError;

    // Transform to frontend format
    const products = (dbProducts || []).map((dbProduct: any) => {
      const productVariants = (dbVariants || [])
        .filter((v: any) => v.product_id === dbProduct.id)
        .map((v: any) => ({
          id: v.id,
          sku: v.sku || undefined,
          optionValues: v.option_values || {},
          price: v.price,
          msrp: null,
          stockQty: v.stock_qty,
        }));

      return {
        id: dbProduct.id,
        name: dbProduct.name,
        slug: dbProduct.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        category: dbProduct.category,
        description: dbProduct.description || undefined,
        features: [],
        currency: 'GBP',
        options: [],
        variants: productVariants.length > 0 ? productVariants : [
          {
            id: 'default',
            optionValues: {},
            price: null,
            msrp: null,
            stockQty: null,
          },
        ],
        images: (dbProduct.images || []).map((src: string) => ({
          src,
          alt: dbProduct.name,
        })),
      };
    });

    // Generate TypeScript file content
    const fileContent = `// Auto-generated from Supabase database
// Last updated: ${new Date().toISOString()}

export type Currency = 'GBP' | 'USD' | 'EUR';

export type ProductCategory =
  | 'Brood Boxes'
  | 'Supers'
  | 'Nucs & Travel'
  | 'Floors & Stands'
  | 'Lids & Roofs'
  | 'Boards & Excluders'
  | 'Accessories'
  | 'Frames & Foundation'
  | 'Extraction & Honey'
  | 'Queen Rearing'
  | 'Apparel'
  | 'Footwear'
  | 'Misc';

export interface ProductImage {
  src: string;
  alt: string;
}

export interface ProductOption {
  name: string;
  values: string[];
}

export interface ProductVariant {
  id: string;
  sku?: string;
  optionValues: Record<string, string>;
  price: number | null;
  msrp?: number | null;
  stockQty: number | null;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  category: ProductCategory;
  description?: string;
  features?: string[];
  currency: Currency;
  options?: ProductOption[];
  variants: ProductVariant[];
  images: ProductImage[];
}

export const products: Product[] = ${JSON.stringify(products, null, 2)};
`;

    // Write to products.ts file
    const productsPath = path.join(process.cwd(), 'src', 'data', 'products.ts');
    fs.writeFileSync(productsPath, fileContent, 'utf-8');

    return NextResponse.json({
      success: true,
      message: `Exported ${products.length} products to products.ts`,
      count: products.length,
    });
  } catch (error: any) {
    console.error('Deploy error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to deploy products' },
      { status: 500 }
    );
  }
}
