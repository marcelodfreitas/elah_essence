import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  console.log("🔥 MIDDLEWARE EXECUTOU:", request.nextUrl.pathname);

  if (request.nextUrl.pathname === "/") {
    return NextResponse.redirect(
      new URL("/admin/login", request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/"],
};