import { NextResponse, type NextRequest } from "next/server";

const protectedRoutes = ["/app/cliente", "/app/beluer", "/app/admin"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  // Protección real pendiente hasta conectar Supabase Auth.
  // Por ahora dejamos pasar para no romper los paneles existentes.
  return NextResponse.next();
}

export const config = {
  matcher: ["/app/cliente/:path*", "/app/beluer/:path*", "/app/admin/:path*"],
};