import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Paths that don't require authentication
const publicPaths = ['/login', '/register', '/forgot-password', '/reset-password'];

// Middleware function to check authentication
export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  const pathname = request.nextUrl.pathname;
  
  // If not authenticated and accessing protected route, redirect to login
  if (!token && !publicPaths.some(path => pathname.startsWith(path)) && 
      !pathname.startsWith('/booking') && // Public booking pages remain accessible
      !pathname.startsWith('/api/booking-forms') // Public booking API remains accessible
     ) {
    const url = new URL('/login', request.url);
    return NextResponse.redirect(url);
  }
  
  // If authenticated and accessing auth routes, redirect to dashboard
  if (token && publicPaths.some(path => pathname.startsWith(path))) {
    const url = new URL('/dashboard', request.url);
    return NextResponse.redirect(url);
  }
  
  return NextResponse.next();
}

// Paths to run the middleware on
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.ico|.*\\.svg).*)',
  ],
};