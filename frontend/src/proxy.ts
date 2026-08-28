import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  // Pass through all requests - authentication is managed client-side via AuthContext & SessionExpiredModal
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/cohort/:path*",
    "/profile/:path*",
    "/settings/:path*",
  ],
};

