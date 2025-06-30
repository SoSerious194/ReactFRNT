import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'
import { getUserRole } from '@/lib/roles'
import { USER_ROLES } from '@/lib/constant'
import { logout } from '@/app/login/actions'

export async function middleware(request: NextRequest) {

  const {user, supabaseResponse} = await updateSession(request)


  const userRole = await getUserRole()
  console.log("🚀 ~ middleware ~ userRole:", userRole)


  if (user && userRole === USER_ROLES.CLIENT) {
      await logout();
      return NextResponse.redirect(new URL("/login", request.url));
  }

  if(!user ){
    return NextResponse.redirect(new URL("/login", request.url));
  }
  
  return supabaseResponse
  
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