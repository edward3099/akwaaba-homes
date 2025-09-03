import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');
  
  // Check for secret to confirm this is a valid request
  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ message: 'Invalid secret' }, { status: 401 });
  }

  try {
    // Revalidate the entire application
    revalidatePath('/', 'layout');
    
    return NextResponse.json({ 
      revalidated: true, 
      now: Date.now(),
      message: 'Cache invalidated successfully' 
    });
  } catch (err) {
    return NextResponse.json({ 
      message: 'Error revalidating', 
      error: err instanceof Error ? err.message : 'Unknown error' 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');
  
  // Check for secret to confirm this is a valid request
  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ message: 'Invalid secret' }, { status: 401 });
  }

  try {
    // Revalidate the entire application
    revalidatePath('/', 'layout');
    
    return NextResponse.json({ 
      revalidated: true, 
      now: Date.now(),
      message: 'Cache invalidated successfully' 
    });
  } catch (err) {
    return NextResponse.json({ 
      message: 'Error revalidating', 
      error: err instanceof Error ? err.message : 'Unknown error' 
    }, { status: 500 });
  }
}
