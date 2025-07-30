import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Solo permitir en desarrollo o con un token secreto
  const debugToken = request.nextUrl.searchParams.get('token');
  if (debugToken !== 'debug123') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const envDebug = {
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL_exists: !!process.env.DATABASE_URL,
    DATABASE_URL_length: process.env.DATABASE_URL?.length || 0,
    DATABASE_URL_preview: process.env.DATABASE_URL?.substring(0, 50) + '...',
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET_exists: !!process.env.NEXTAUTH_SECRET,
    NEXTAUTH_SECRET_length: process.env.NEXTAUTH_SECRET?.length || 0,
    VERCEL: process.env.VERCEL,
    VERCEL_ENV: process.env.VERCEL_ENV,
    VERCEL_URL: process.env.VERCEL_URL,
    // Todas las variables que empiecen con NEXT_PUBLIC_
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY_exists: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  };

  return NextResponse.json(envDebug);
}