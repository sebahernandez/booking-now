import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const isAdminRoute = req.nextUrl.pathname.startsWith("/admin")

    // Protect admin routes
    if (isAdminRoute && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/login", req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow access to public routes
        if (req.nextUrl.pathname.startsWith("/login") || 
            req.nextUrl.pathname === "/" ||
            req.nextUrl.pathname.startsWith("/api/auth")) {
          return true
        }
        
        // Require authentication for admin routes
        if (req.nextUrl.pathname.startsWith("/admin")) {
          return !!token
        }
        
        return true
      },
    },
  }
)

export const config = {
  matcher: ["/admin/:path*", "/login"]
}