import { headers } from "next/headers"
import { redis } from "./redis"

interface RateLimitConfig {
  limit?: number
  window?: number
  customKey?: string
  strictMode?: boolean
}

export async function rateLimit(key: string, config?: RateLimitConfig) {
  const {
    limit = Number(process.env.RATE_LIMIT_MAX) || 100,
    window = Number(process.env.RATE_LIMIT_WINDOW_MS) || 60000,
    customKey,
    strictMode = false
  } = config || {}

  const ip = headers().get("x-forwarded-for") || "127.0.0.1"
  const userAgent = headers().get("user-agent") || "unknown"
  
  // Enhanced key generation for better security
  const rateLimitKey = customKey
    ? `rate-limit:${customKey}:${ip}:${strictMode ? userAgent : ''}`
    : `rate-limit:${key}:${ip}`

  const now = Date.now()

  try {
    const multi = redis.multi()
    multi.incr(rateLimitKey)
    multi.pttl(rateLimitKey)

    const [count, ttl] = await multi.exec()
    const currentCount = count as number

    if (currentCount === 1) {
      await redis.expire(rateLimitKey, Math.floor(window / 1000))
    }

    const remaining = Math.max(0, limit - currentCount)
    const reset = ttl < 0 ? now + window : now + ttl

    // Add burst protection
    if (strictMode && currentCount > limit * 1.5) {
      const penaltyWindow = window * 2
      await redis.expire(rateLimitKey, Math.floor(penaltyWindow / 1000))
    }

    return {
      success: currentCount <= limit,
      limit,
      remaining,
      reset,
      retryAfter: Math.ceil((reset - now) / 1000)
    }
  } catch (error) {
    console.error('Rate limiting error:', error)
    // Fail open with a warning
    return {
      success: true,
      limit,
      remaining: 1,
      reset: now + window,
      retryAfter: 0,
      warning: 'Rate limiting temporarily unavailable'
    }
  }
}

