import { Redis } from "@upstash/redis"

// Default Redis configuration
const defaultConfig = {
  url: "https://fake-redis-url.upstash.io",
  token: "development"
}

// Create Redis client with environment variables or fallback values
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || defaultConfig.url,
  token: process.env.UPSTASH_REDIS_REST_TOKEN || defaultConfig.token,
})

// Get Redis client with fallback for development
export async function getRedisClient() {
  try {
    await redis.ping()
    return redis
  } catch (error) {
    console.warn('Redis connection failed, using fallback:', error)
    return new Redis(defaultConfig)
  }
}

// Export default config for other modules
export { defaultConfig }