import prisma from './db/prisma'
import { z } from 'zod'
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

const CACHE_SETTINGS = {
  defaultTTL: 60 * 5, // 5 minutes
  highTrafficTTL: 60 * 2, // 2 minutes for popular searches
  maxCacheSize: 1000, // Maximum number of cached queries
  popularThreshold: 10 // Number of times a query needs to be made to be considered popular
}

const searchParamsSchema = z.object({
  query: z.string().optional(),
  category: z.string().optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  sortBy: z.enum(['price_asc', 'price_desc', 'newest', 'popular']).optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().default(20),
  brand: z.string().optional(),
  inStock: z.boolean().optional(),
  rating: z.number().min(0).max(5).optional()
})

export type SearchParams = z.infer<typeof searchParamsSchema>

export async function searchProducts(params: SearchParams) {
  try {
    const validated = searchParamsSchema.parse(params)
    
    // Generate cache key based on search parameters
    const cacheKey = `search:${JSON.stringify(validated)}`
    const queryCountKey = `query-count:${validated.query || '*'}`
    
    // Check cache first
    const cachedResult = await redis.get(cacheKey)
    if (cachedResult) {
      return JSON.parse(cachedResult)
    }

    // Increment query count for popularity tracking
    await redis.incr(queryCountKey)
    const queryCount = await redis.get(queryCountKey) as number

    const skip = (validated.page - 1) * validated.limit

    const where: any = {}
    if (validated.query) {
      const searchTerms = validated.query.toLowerCase().split(/\s+/);
      where.OR = [
        {
          OR: searchTerms.map(term => ({
            name: {
              contains: term,
              mode: 'insensitive'
            }
          }))
        },
        {
          OR: searchTerms.map(term => ({
            description: {
              contains: term,
              mode: 'insensitive'
            }
          }))
        },
        { tags: { hasSome: searchTerms } },
        {
          OR: searchTerms.map(term => ({
            OR: [
              { name: { startsWith: term, mode: 'insensitive' } },
              { name: { endsWith: term, mode: 'insensitive' } }
            ]
          }))
        }
      ];
      
      // Store search term for suggestions
      if (validated.query.length >= 3) {
        await redis.zadd('search:suggestions', {
          score: Date.now(),
          member: validated.query.toLowerCase()
        });
        await redis.zremrangebyrank('search:suggestions', 0, -101); // Keep only top 100 recent searches
      }
    }
    if (validated.category) {
      where.category = validated.category
    }
    if (validated.minPrice !== undefined) {
      where.price = { ...where.price, gte: validated.minPrice }
    }
    if (validated.maxPrice !== undefined) {
      where.price = { ...where.price, lte: validated.maxPrice }
    }
    if (validated.brand) {
      where.brand = validated.brand
    }
    if (validated.inStock) {
      where.stock = { gt: 0 }
    }
    if (validated.rating) {
      where.averageRating = { gte: validated.rating }
    }

    const orderBy: any = {}
    switch (validated.sortBy) {
      case 'price_asc':
        orderBy.price = 'asc'
        break
      case 'price_desc':
        orderBy.price = 'desc'
        break
      case 'newest':
        orderBy.createdAt = 'desc'
        break
      case 'popular':
        orderBy.viewCount = 'desc'
        break
      default:
        orderBy.createdAt = 'desc'
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: validated.limit,
        select: {
          id: true,
          name: true,
          description: true,
          price: true,
          category: true,
          images: true,
          stock: true,
          brand: true,
          averageRating: true,
          createdAt: true,
          viewCount: true
        }
      }),
      prisma.product.count({ where })
    ])

    const result = {
      products,
      pagination: {
        total,
        pages: Math.ceil(total / validated.limit),
        page: validated.page,
        limit: validated.limit
      }
    }

    // Cache the results with appropriate TTL
    const ttl = queryCount >= CACHE_SETTINGS.popularThreshold
      ? CACHE_SETTINGS.highTrafficTTL
      : CACHE_SETTINGS.defaultTTL

    await redis.setex(cacheKey, ttl, JSON.stringify(result))

    return result
  } catch (error) {
    console.error('Search error:', error)
    throw error
  }
}

export async function getProductRecommendations(productId: string, limit: number = 5) {
  try {
    const cacheKey = `recommendations:${productId}:${limit}`
    
    // Check cache
    const cachedResult = await redis.get(cacheKey)
    if (cachedResult) {
      return JSON.parse(cachedResult)
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { category: true, tags: true }
    })

    if (!product) throw new Error('Product not found')

    const recommendations = await prisma.product.findMany({
      where: {
        OR: [
          { category: product.category },
          { tags: { hasSome: product.tags } }
        ],
        NOT: { id: productId }
      },
      orderBy: [
        { viewCount: 'desc' },
        { averageRating: 'desc' }
      ],
      take: limit,
      select: {
        id: true,
        name: true,
        price: true,
        images: true,
        averageRating: true
      }
    })

    await redis.setex(cacheKey, CACHE_SETTINGS.defaultTTL, JSON.stringify(recommendations))

    return recommendations
  } catch (error) {
    console.error('Recommendations error:', error)
    throw error
  }
}