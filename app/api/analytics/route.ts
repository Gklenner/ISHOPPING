import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { redis } from "@/lib/redis"

export async function POST(request: Request) {
  try {
    const headersList = headers()
    const metric = await request.json()
    const userAgent = headersList.get("user-agent")
    const ip = headersList.get("x-forwarded-for")

    // Store metric with metadata
    await redis.lpush(
      "analytics:metrics",
      JSON.stringify({
        ...metric,
        userAgent,
        ip,
        timestamp: Date.now(),
      }),
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error storing analytics:", error)
    return NextResponse.json({ error: "Failed to store analytics" }, { status: 500 })
  }
}

