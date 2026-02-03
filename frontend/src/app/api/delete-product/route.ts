// frontend/src/app/api/delete-product/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { productId } = await request.json();

    console.log('Delete product request for ID:', productId);

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    // Delete product (variants will be deleted automatically via CASCADE)
    const { data, error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId)
      .select();

    console.log('Delete result:', { data, error });

    if (error) {
      console.error('Supabase delete error:', error);
      throw error;
    }

    if (!data || data.length === 0) {
      console.warn('No rows deleted for product ID:', productId);
      return NextResponse.json(
        { error: 'Product not found or already deleted' },
        { status: 404 }
      );
    }

    console.log('Successfully deleted product:', productId);
    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully',
      deletedProduct: data[0],
    });
  } catch (error: any) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete product' },
      { status: 500 }
    );
  }
}
