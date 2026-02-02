import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Revalidate homepage and preview page
    revalidatePath('/', 'page');
    revalidatePath('/preview', 'page');
    
    // Revalidate all product pages
    revalidatePath('/product/[id]', 'page');

    return NextResponse.json({ 
      success: true, 
      message: 'Frontend cache cleared successfully',
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
