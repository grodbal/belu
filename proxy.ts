import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const protectedRoutes = ["/app/cliente", "/app/beluer", "/app/admin"];

const routeRoleMap: Record<string, string> = {
  "/app/cliente": "cliente",
  "/app/beluer": "beluer",
  "/app/admin": "admin",
};

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  let response = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });

          response = NextResponse.next({
            request,
          });

          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("redirectTo", pathname);

    return NextResponse.redirect(loginUrl);
  }

  const userRole = user.app_metadata?.role ?? "cliente";

  const requiredRole = Object.entries(routeRoleMap).find(([route]) =>
    pathname.startsWith(route)
  )?.[1];

  if (requiredRole && userRole !== requiredRole) {
    const fallbackUrl = request.nextUrl.clone();

    if (userRole === "admin") {
      fallbackUrl.pathname = "/app/admin";
      return NextResponse.redirect(fallbackUrl);
    }

    if (userRole === "beluer") {
      fallbackUrl.pathname = "/app/beluer";
      return NextResponse.redirect(fallbackUrl);
    }

    fallbackUrl.pathname = "/app/cliente";
    return NextResponse.redirect(fallbackUrl);
  }

  return response;
}

export const config = {
  matcher: ["/app/cliente/:path*", "/app/beluer/:path*", "/app/admin/:path*"],
};