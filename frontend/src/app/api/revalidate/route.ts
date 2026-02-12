import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const productId = body?.productId as string | undefined;

    // Revalidate homepage and preview page
    revalidatePath('/', 'page');
    revalidatePath('/preview', 'page');

    // If a specific productId is provided, revalidate its page directly
    if (productId) {
      revalidatePath(`/product/${productId}`, 'page');
    } else {
      // Fallback: revalidate the dynamic route template (may not catch specific params)
      revalidatePath('/product/[id]', 'page');
    }

    return NextResponse.json({ 
      success: true, 
      message: productId 
        ? `Frontend cache cleared for product ${productId}` 
        : 'Frontend cache cleared (generic)',
      revalidated: true,
      now: Date.now()
    });
  } catch (error: any) {
    console.error('Error revalidating:', error);
    return NextResponse.json({ 
      error: error.message,
      success: false 
    }, { status: 500 });
  }
}
