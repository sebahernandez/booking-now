import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const isAdminRoute = req.nextUrl.pathname.startsWith("/admin")
    const isTenantRoute = req.nextUrl.pathname.startsWith("/tenant")

    // Redirect tenants trying to access admin routes to their tenant dashboard
    if (isAdminRoute && token?.isTenant) {
      return NextResponse.redirect(new URL("/tenant", req.url))
    }

    // Redirect non-tenant users trying to access tenant routes to admin
    if (isTenantRoute && !token?.isTenant) {
      return NextResponse.redirect(new URL("/admin", req.url))
    }

    // Protect admin routes - only allow ADMIN users (not tenants)
    if (isAdminRoute && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.url))
    }

    // Protect tenant routes - only allow tenant users
    if (isTenantRoute && !token?.isTenant) {
      return NextResponse.redirect(new URL("/", req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow access to public routes (/ is now the login page)
        if (req.nextUrl.pathname === "/" ||
            req.nextUrl.pathname.startsWith("/api/auth")) {
          return true
        }
        
        // Require authentication for admin and tenant routes
        if (req.nextUrl.pathname.startsWith("/admin") || 
            req.nextUrl.pathname.startsWith("/tenant")) {
          return !!token
        }
        
        return true
      },
    },
  }
)

export const config = {
  matcher: ["/admin/:path*", "/tenant/:path*"]
}