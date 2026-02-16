import { NextResponse, type NextRequest } from "next/server";

// Auth handled client-side via AuthGuard. Minimal middleware to avoid Edge serialization issues.
export function middleware(_request: NextRequest) {
  return NextResponse.next();
}
