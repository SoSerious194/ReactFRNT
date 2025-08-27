import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

export async function middleware(request: NextRequest) {
  const response = await updateSession(request)
  
  // Get the pathname
  const path = request.nextUrl.pathname
  
  // Protected routes that require authentication
  const protectedRoutes = ['/inbox', '/private', '/training-hub', '/clients-groups']
  
  // Auth routes
  const authRoutes = ['/login']
  const isAuthRoute = authRoutes.some(route => path.startsWith(route))
  
  // If accessing auth routes while authenticated, redirect to inbox
  if (isAuthRoute && response.status !== 302) {
    return NextResponse.redirect(new URL('/inbox', request.url))
  }
  
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}