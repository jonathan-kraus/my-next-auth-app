// proxy.ts (in root of project, NOT in app folder)
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import { appLog } from "@/utils/app-log";
export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  console.log("proxy /notes token", {
    pathname: request.nextUrl.pathname,
    hasToken: !!token,
  });
  await appLog({
    source: "proxy.ts",
    message: "---proxy /notes token---",
    metadata: { action: "check" },
  });
}
export async function proxy(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const { pathname } = request.nextUrl;

  // Routes that require authentication
  const protectedRoutes = ["/notes"];

  // Check if current route is protected
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route),
  );

  // If accessing protected route without token, redirect to signin
  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL("/api/auth/signin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Protect these routes
    "/notes/:path*",
    // Add more routes here as needed
  ],
};
