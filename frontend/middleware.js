// middleware.js
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(req) {
  const token = req.cookies.get("token")?.value;
   console.log("token",token)
  // No token: block access to protected routes
  if (!token) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  // Validate JWT using Edge-compatible library
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    await jwtVerify(token, secret);
    return NextResponse.next();
  } catch (_) {
    // Invalid or expired token → redirect to login
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }
}

// Apply middleware only to protected routes
export const config = {
    matcher: [
      "/farmer/:path*",
      "/consumer/:path*",
      "/admin/:path*"
    ],
  };
  
