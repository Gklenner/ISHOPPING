import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { redis } from "@/lib/redis"
import { db } from "@/lib/db"

export async function GET() {
  const headersList = headers()
  const userAgent = headersList.get("user-agent")

  try {
    // Check database connection
    await db.$queryRaw`SELECT 1`

    // Check Redis connection
    await redis.ping()

    return NextResponse.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      userAgent,
      environment: process.env.NODE_ENV,
    })
  } catch (error) {
    console.error("Health check failed:", error)

    return NextResponse.json(
      {
        status: "unhealthy",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 503 },
    )
  }
}

