import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { rateLimit } from "@/lib/rate-limit"
import { Redis } from "@upstash/redis"

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || "https://fake-redis-url.upstash.io",
  token: process.env.UPSTASH_REDIS_REST_TOKEN || "development"
})
import { getUser } from "@/lib/auth"

export async function middleware(request: NextRequest) {
  // Security Headers
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64")

  // Format CSP header with proper string concatenation
  const cspHeader = [
    `default-src 'self';`,
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic';`,
    `style-src 'self' 'nonce-${nonce}';`,
    `img-src 'self' blob: data: https:;`,
    `font-src 'self';`,
    `object-src 'none';`,
    `base-uri 'self';`,
    `form-action 'self';`,
    `frame-ancestors 'none';`,
    `block-all-mixed-content;`,
    `upgrade-insecure-requests;`,
  ].join(" ")

  // Rate limiting
  const ip = request.ip ?? "127.0.0.1"
  const { success, limit, remaining, reset } = await rateLimit(ip, {
    customKey: "global-middleware",
    limit: process.env.RATE_LIMIT_MAX ? parseInt(process.env.RATE_LIMIT_MAX) : 100,
    window: process.env.RATE_LIMIT_WINDOW_MS ? parseInt(process.env.RATE_LIMIT_WINDOW_MS) : 60000
  })

  if (!success) {
    return new NextResponse("Too Many Requests", {
      status: 429,
      headers: {
        "Retry-After": reset.toString(),
        "X-RateLimit-Limit": limit.toString(),
        "X-RateLimit-Remaining": remaining.toString(),
        "X-RateLimit-Reset": reset.toString(),
      },
    })
  }

  // Auth check
  const authRoutes = ["/login", "/create-account", "/forgot-password"]
  const protectedRoutes = ["/profile", "/checkout", "/orders"]
  const path = request.nextUrl.pathname

  try {
    const user = await getUser()
    const isAuthRoute = authRoutes.some((route) => path.startsWith(route))
    const isProtectedRoute = protectedRoutes.some((route) => path.startsWith(route))

    if (user && isAuthRoute) {
      return NextResponse.redirect(new URL("/home", request.url))
    }

    if (!user && isProtectedRoute) {
      const searchParams = new URLSearchParams({ redirect: path })
      return NextResponse.redirect(new URL(`/login?${searchParams}`, request.url))
    }

    // Continue with enhanced security headers
    const response = NextResponse.next()

    // Set security headers with null checks
    if (cspHeader) {
      response.headers.set("Content-Security-Policy", cspHeader)
    }
    response.headers.set("X-Content-Type-Options", "nosniff")
    response.headers.set("X-Frame-Options", "DENY")
    response.headers.set("X-XSS-Protection", "1; mode=block")
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
    response.headers.set(
      "Permissions-Policy",
      "accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()",
    )
    response.headers.set("X-DNS-Prefetch-Control", "on")

    // Cache control with path check
    const pathname = request.nextUrl.pathname
    if (pathname && pathname.startsWith("/api/")) {
      response.headers.set("Cache-Control", "no-store")
    } else if (pathname && pathname.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg)$/)) {
      response.headers.set("Cache-Control", "public, max-age=31536000, immutable")
    }

    return response
  } catch (error) {
    console.error("Auth error:", error)
    return NextResponse.redirect(new URL("/login", request.url))
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}

