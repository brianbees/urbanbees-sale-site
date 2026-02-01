import { products } from "@/data/products";
import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ProductDisplay from "@/components/ProductDisplay";

interface ProductPageProps {
  params: Promise<{
    id: string;
  }>;
}

async function getProduct(id: string) {
  // First try static products
  let product = products.find((p) => p.id === id);
  
  if (product) {
    return product;
  }

  // If not found, try database (for preview products)
  try {
    const { data: dbProduct, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (productError) {
      console.error('Database error fetching product:', productError);
      return null;
    }

    if (!dbProduct) {
      return null;
    }

    // Get variants for this product
    const { data: dbVariants, error: variantsError } = await supabase
      .from('variants')
      .select('*')
      .eq('product_id', id);

    if (variantsError) {
      console.error('Database error fetching variants:', variantsError);
    }

    // Transform database product to frontend format
    const transformedVariants = (dbVariants || []).map((v: any) => ({
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
      category: dbProduct.category,
      description: dbProduct.description,
      features: [],
      currency: 'GBP' as const,
      options: [],
      variants: transformedVariants.length > 0 ? transformedVariants : [{
        id: 'default',
        optionValues: {},
        price: null,
        msrp: null,
        stockQty: null,
      }],
      images: (dbProduct.images || []).map((src: string) => ({
        src,
        alt: dbProduct.name,
      })),
    };
  } catch (error) {
    console.error('Error in getProduct:', error);
    return null;
  }
}

interface ProductPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateStaticParams() {
  return products.map((product) => ({
    id: product.id,
  }));
}

// Allow dynamic rendering for database products not in static list
export const dynamicParams = true;

// Revalidate every 60 seconds to show updated product data
export const revalidate = 60;

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);
  
  if (!product) {
    return {
      title: 'Product Not Found',
    };
  }

  return {
    title: `${product.name} | Urban Bees`,
    description: product.description || `Buy ${product.name} from Urban Bees`,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    notFound();
  }

  return <ProductDisplay product={product} />;
}
