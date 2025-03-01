import prisma from './db/prisma';
import { redis } from './redis';

interface RecommendationScore {
  productId: string;
  score: number;
}

export class RecommendationService {
  private static instance: RecommendationService;
  private readonly cacheTimeout = 1000 * 60 * 30; // 30 minutes
  private readonly maxCacheSize = 1000;

  private constructor() {}

  public static getInstance(): RecommendationService {
    if (!RecommendationService.instance) {
      RecommendationService.instance = new RecommendationService();
    }
    return RecommendationService.instance;
  }

  public async getPersonalizedRecommendations(userId: string, limit: number = 5): Promise<string[]> {
    const cacheKey = `recommendations:${userId}`;
    const cached = await redis.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    const userHistory = await this.getUserHistory(userId);
    const recommendations = await this.generateRecommendations(userHistory, limit);

    await redis.set(cacheKey, JSON.stringify(recommendations), {
      ex: 1800 // 30 minutes
    });

    return recommendations;
  }

  private async getUserHistory(userId: string) {
    const [views, purchases] = await Promise.all([
      prisma.productView.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 50,
        select: { productId: true }
      }),
      prisma.purchase.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 20,
        select: { productId: true }
      })
    ]);

    return {
      viewedProducts: views.map(v => v.productId),
      purchasedProducts: purchases.map(p => p.productId)
    };
  }

  private async generateRecommendations(
    history: { viewedProducts: string[]; purchasedProducts: string[] },
    limit: number
  ): Promise<string[]> {
    const scores = new Map<string, number>();

    // Get similar products based on user's viewed items
    for (const productId of history.viewedProducts) {
      const similar = await this.getSimilarProducts(productId);
      for (const { productId: similarId, score } of similar) {
        scores.set(similarId, (scores.get(similarId) || 0) + score * 0.5);
      }
    }

    // Get similar products based on user's purchases
    for (const productId of history.purchasedProducts) {
      const similar = await this.getSimilarProducts(productId);
      for (const { productId: similarId, score } of similar) {
        scores.set(similarId, (scores.get(similarId) || 0) + score);
      }
    }

    // Remove products the user has already interacted with
    const interactedProducts = new Set([...history.viewedProducts, ...history.purchasedProducts]);
    interactedProducts.forEach(id => scores.delete(id));

    // Sort by score and return top N recommendations
    return Array.from(scores.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([productId]) => productId);
  }

  private async getSimilarProducts(productId: string): Promise<RecommendationScore[]> {
    const cacheKey = `similar:${productId}`;
    const cached = await redis.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { category: true, tags: true }
    });

    if (!product) {
      return [];
    }

    const similarProducts = await prisma.product.findMany({
      where: {
        AND: [
          { id: { not: productId } },
          { category: product.category },
          { tags: { hasSome: product.tags } }
        ]
      },
      select: { id: true, tags: true },
      take: 20
    });

    const scores: RecommendationScore[] = similarProducts.map(similar => ({
      productId: similar.id,
      score: this.calculateSimilarityScore(product.tags, similar.tags)
    }));

    await redis.set(cacheKey, JSON.stringify(scores), {
      ex: 3600 // 1 hour
    });

    return scores;
  }

  private calculateSimilarityScore(tags1: string[], tags2: string[]): number {
    const set1 = new Set(tags1);
    const set2 = new Set(tags2);
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    return intersection.size / union.size;
  }
}

export const recommendationService = RecommendationService.getInstance();