import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";
import { getUserRole } from "@/lib/roles";
import { USER_ROLES } from "@/lib/constant";

export async function middleware(request: NextRequest) {
  try {
    const { user, supabaseResponse, supabase } = await updateSession(request);
    const { pathname } = request.nextUrl;

    if (!user) {
      if (pathname !== "/login") {
        return createRedirect("/login", request);
      }
      return supabaseResponse;
    }

    if (user && pathname === "/login") {
      return createRedirect("/dashboard", request);
    }

    const userRole = await getUserRole();

    if (user && userRole === USER_ROLES.COACH && pathname === "/") {
      return createRedirect("/dashboard", request);
    }

    if (!userRole) {
      await supabase.auth.signOut();
      return createRedirect("/login", request);
    }

    if (userRole === USER_ROLES.CLIENT) {
      await supabase.auth.signOut();
      return createRedirect("/login", request);
    }

    return supabaseResponse;
  } catch (error) {
    console.error("Middleware error:", error);
    return createRedirect("/login", request);
  }
}

const createRedirect = (path: string, request: NextRequest): NextResponse => {
  const url = request.nextUrl.clone();
  url.pathname = path;
  url.searchParams.set("returnUrl", request.nextUrl.pathname);
  return NextResponse.redirect(url);
};

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
