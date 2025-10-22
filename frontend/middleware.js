// middleware.js
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(req) {
  const token = req.cookies.get("token")?.value;
  
  // No token: block access to protected routes
  if (!token) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  // Validate JWT using Edge-compatible library
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    
    // Extract user role from token
    const userRole = payload.role;
    const pathname = req.nextUrl.pathname;
    
    // Role-based access control
    if (pathname.startsWith('/consumer') && userRole !== 'consumer') {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }
    
    if (pathname.startsWith('/farmer') && userRole !== 'farmer') {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }
    
    if (pathname.startsWith('/admin') && userRole !== 'super_admin') {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }
    
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
  
