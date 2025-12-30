import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const authToken = request.cookies.get("auth_token");
  const isLoginPage = request.nextUrl.pathname === "/login";

  // Se está na página de login e já está autenticado, redireciona para home
  if (isLoginPage && authToken?.value === "authenticated") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Se não está na página de login e não está autenticado, redireciona para login
  if (!isLoginPage && authToken?.value !== "authenticated") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

// Configura quais rotas o middleware deve executar
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (rotas de autenticação)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
};


