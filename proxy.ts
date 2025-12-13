// proxy.ts (root)
import { getToken } from "next-auth/jwt";
import { appLog } from "./utils/app-log";
import { createRequestId } from "./lib/uuidj";
import { NextRequest, NextResponse } from "next/server";
console.log("proxy hit");
export async function proxy(request: NextRequest) {
  const token = await getToken({ req: request });

  const { pathname } = request.nextUrl;
  const requestId = createRequestId();
  appLog({
    source: "proxy",
    message: "do we have token",
    requestId,
    metadata: { action: "mount", token: token, pathname: pathname },
  });
  console.log("proxy just tried log", request.nextUrl.pathname);
  const protectedRoutes = ["/notes"];
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route),
  );

  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL("/api/auth/signin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/notes/:path*"],
};
