import { db } from '@/lib/db';

interface ProductView {
  userId: string;
  productId: string;
  timestamp: Date;
}

interface ProductPurchase {
  userId: string;
  productId: string;
  timestamp: Date;
  quantity: number;
}

interface SimilarityScore {
  productId: string;
  score: number;
}

export class RecommendationEngine {
  private static instance: RecommendationEngine;
  private viewHistory: Map<string, ProductView[]> = new Map();
  private purchaseHistory: Map<string, ProductPurchase[]> = new Map();
  private cache: Map<string, SimilarityScore[]> = new Map();
  private cacheTimeout: number = 1000 * 60 * 30; // 30 minutes cache timeout
  private maxCacheSize: number = 1000; // Maximum number of cached recommendations
  private highTrafficThreshold: number = 100; // Requests per minute threshold for high traffic mode
  private highTrafficCacheTimeout: number = 1000 * 60 * 15; // 15 minutes cache timeout for high traffic
  private requestCount: number = 0;
  private lastRequestTime: number = Date.now();
  private performanceMetrics: {
    cacheHits: number;
    cacheMisses: number;
    averageResponseTime: number;
    totalRequests: number;
  } = {
    cacheHits: 0,
    cacheMisses: 0,
    averageResponseTime: 0,
    totalRequests: 0
  };

  private constructor() {}

  public static getInstance(): RecommendationEngine {
    if (!RecommendationEngine.instance) {
      RecommendationEngine.instance = new RecommendationEngine();
    }
    return RecommendationEngine.instance;
  }

  public async trackProductView(userId: string, productId: string): Promise<void> {
    const view: ProductView = {
      userId,
      productId,
      timestamp: new Date(),
    };

    const userViews = this.viewHistory.get(userId) || [];
    userViews.push(view);
    this.viewHistory.set(userId, userViews);

    // Persist to database
    await db.productView.create({
      data: {
        userId,
        productId,
      },
    });
  }

  public async trackPurchase(userId: string, productId: string, quantity: number): Promise<void> {
    const purchase: ProductPurchase = {
      userId,
      productId,
      quantity,
      timestamp: new Date(),
    };

    const userPurchases = this.purchaseHistory.get(userId) || [];
    userPurchases.push(purchase);
    this.purchaseHistory.set(userId, userPurchases);

    // Persist to database
    await db.purchase.create({
      data: {
        userId,
        productId,
        quantity,
      },
    });
  }

  public async getPersonalizedRecommendations(userId: string, limit: number = 5): Promise<string[]> {
    // Get user's view and purchase history
    const userViews = await db.productView.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const userPurchases = await db.purchase.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    // Get similar products based on user behavior
    const similarityScores = new Map<string, number>();

    // Analyze view patterns
    for (const view of userViews) {
      const similarProducts = await this.findSimilarProducts(view.productId);
      for (const { productId, score } of similarProducts) {
        const currentScore = similarityScores.get(productId) || 0;
        similarityScores.set(productId, currentScore + score * 0.5); // Views have less weight than purchases
      }
    }

    // Analyze purchase patterns
    for (const purchase of userPurchases) {
      const similarProducts = await this.findSimilarProducts(purchase.productId);
      for (const { productId, score } of similarProducts) {
        const currentScore = similarityScores.get(productId) || 0;
        similarityScores.set(productId, currentScore + score);
      }
    }

    // Sort products by similarity score and return top N
    const recommendations = Array.from(similarityScores.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([productId]) => productId);

    return recommendations;
  }

  private async findSimilarProducts(productId: string): Promise<SimilarityScore[]> {
    const startTime = Date.now();
    this.requestCount++;
    this.performanceMetrics.totalRequests++;

    // Check cache first
    const cached = this.cache.get(productId);
    if (cached) {
      this.performanceMetrics.cacheHits++;
      return cached;
    }
    this.performanceMetrics.cacheMisses++;

    // Get users who viewed/purchased this product
    const productViews = await db.productView.findMany({
      where: { productId },
      select: { userId: true }
    });
    const productPurchases = await db.purchase.findMany({
      where: { productId },
      select: { userId: true }
    });

    // Get other products these users interacted with
    const userIds = new Set([...productViews, ...productPurchases].map(x => x.userId));
    const userInteractions = await db.productView.findMany({
      where: {
        userId: { in: Array.from(userIds) },
        productId: { not: productId }
      },
      select: { productId: true },
      distinct: ['productId']
    });

    // Get product category and attributes
    const product = await db.product.findUnique({
      where: { id: productId },
      include: { 
        category: true,
        attributes: true,
        tags: true
      },
    });

    if (!product) return [];

    // Combine collaborative filtering results with content-based filtering
    const collaborativeProducts = userInteractions.map(x => x.productId);
    const similarProducts = await db.product.findMany({
      where: {
        OR: [
          {
            id: { in: collaborativeProducts }
          },
          {
            categoryId: product.categoryId,
            id: { not: productId },
            price: {
              gte: product.price * 0.7,
              lte: product.price * 1.3
            }
          }
        ]
      },
      include: {
        attributes: true,
        tags: true,
        _count: {
          select: {
            views: true,
            purchases: true
          }
        }
      },
      take: 20,
    });

    // Calculate hybrid similarity scores (collaborative + content-based)
    const scores = similarProducts.map((similar) => {
      // Add popularity score based on views and purchases
      const popularityScore = 
        (similar._count.views * 0.3 + similar._count.purchases * 0.7) / 
        (Math.max(...similarProducts.map(p => p._count.views)) + Math.max(...similarProducts.map(p => p._count.purchases)));
      
      return ({
      productId: similar.id,
      score: this.calculateSimilarityScore(product, similar),
    }));

    // Cache the results
    this.cache.set(productId, scores);
    setTimeout(() => this.cache.delete(productId), this.cacheTimeout);

    return scores;
  }

  private calculateSimilarityScore(product1: any, product2: any): number {
    let score = 0;

    // Price similarity (25% weight)
    const priceDiff = Math.abs(product1.price - product2.price);
    const maxPrice = Math.max(product1.price, product2.price);
    score += (1 - (priceDiff / maxPrice)) * 0.25;

    // Brand similarity (20% weight)
    if (product1.brand === product2.brand) score += 0.2;

    // Category similarity (15% weight)
    if (product1.categoryId === product2.categoryId) score += 0.15;

    // Attributes similarity (25% weight)
    const attr1 = new Set(product1.attributes.map((a: any) => a.id));
    const attr2 = new Set(product2.attributes.map((a: any) => a.id));
    const attrIntersection = new Set([...attr1].filter(x => attr2.has(x)));
    const attrUnion = new Set([...attr1, ...attr2]);
    score += (attrIntersection.size / attrUnion.size) * 0.25;

    // Tags similarity (15% weight)
    const tags1 = new Set(product1.tags.map((t: any) => t.id));
    const tags2 = new Set(product2.tags.map((t: any) => t.id));
    const tagsIntersection = new Set([...tags1].filter(x => tags2.has(x)));
    const tagsUnion = new Set([...tags1, ...tags2]);
    score += (tagsIntersection.size / tagsUnion.size) * 0.15;

    return score;
  }
}

export const recommendationEngine = RecommendationEngine.getInstance();