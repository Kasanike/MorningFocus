import { NextResponse, type NextRequest } from "next/server";

// Auth is handled client-side via AuthGuard to avoid Edge runtime issues with Supabase
export function middleware(request: NextRequest) {
  return NextResponse.next({
    request: { headers: request.headers },
  });
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|favicon.svg|icon.svg|manifest.json|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
