import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const hostname = request.headers.get('host') || '';
  
  // Subdomain routing kontrolü
  const subdomain = hostname.split('.')[0];
  
  // Ana domain'ler (subdomain routing yapılmayacak)  
  const mainDomains = ['localhost', 'www'];
  
  // Query parameter'dan subdomain bilgisi al (geçici çözüm)
  const querySubdomain = searchParams.get('subdomain');
  
  // Debug - geçici
  if (pathname.startsWith('/menu/masa/')) {
    console.log('Menu Debug:', { 
      pathname, 
      hostname, 
      subdomain, 
      mainDomainsCheck: mainDomains.includes(subdomain),
      hasSubdomain: !mainDomains.includes(subdomain) && hostname.includes('.'),
      querySubdomain 
    });
  }
  
  // Eğer subdomain varsa ve ana domain değilse VEYA query parameter varsa
  if ((!mainDomains.includes(subdomain) && hostname.includes('.')) || querySubdomain) {
    // Subdomain-based routing
    if (pathname === '/login') {
      return NextResponse.rewrite(new URL('/business/login', request.url));
    }
    if (pathname === '/mutfak') {
      return NextResponse.rewrite(new URL('/business/kitchen', request.url));
    }
    if (pathname === '/garson') {
      return NextResponse.rewrite(new URL('/business/waiter', request.url));
    }
    if (pathname === '/kasa') {
      return NextResponse.rewrite(new URL('/business/cashier', request.url));
    }
    
    // Menu routing - /menu/masa/[table] → /menu?restaurant=subdomain&table=[table]
    if (pathname.startsWith('/menu/masa/')) {
      const tableNumber = pathname.split('/')[3];
      const url = new URL('/menu', request.url);
      url.searchParams.set('restaurant', subdomain || querySubdomain || 'demo');
      url.searchParams.set('table', tableNumber !== undefined ? tableNumber : '1');
      
      // Mevcut token'ı koru
      const token = searchParams.get('token');
      if (token) {
        url.searchParams.set('token', token);
      }
      
      return NextResponse.rewrite(url);
    }
    
    // Subdomain ana sayfası menüye yönlendir (müşteri deneyimi için)
    if (pathname === '/') {
      const url = new URL('/menu', request.url);
      url.searchParams.set('restaurant', subdomain || querySubdomain || 'demo');
      
      // Token oluştur (genel menü için)
      const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      url.searchParams.set('token', token);
      
      return NextResponse.rewrite(url);
    }
  }
  
  // Business sayfalarını koru
  if (pathname.startsWith('/business')) {
    // Login sayfası hariç
    if (pathname === '/business/login') {
      return NextResponse.next();
    }
    
    // Demo token kontrolü (business paneli için)
    const accessToken = request.cookies.get('accessToken')?.value;
    
    if (!accessToken || accessToken !== 'demo-access-token') {
      return NextResponse.redirect(new URL('/business/login', request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/business/:path*',
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};