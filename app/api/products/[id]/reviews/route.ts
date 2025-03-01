import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth-service";
import { z } from "zod";

const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().min(3).max(500),
});

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { rating, comment } = reviewSchema.parse(body);

    const productId = params.id;

    // Check if product exists
    const product = await db.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return new NextResponse("Product not found", { status: 404 });
    }

    // Check if user has already reviewed this product
    const existingReview = await db.review.findFirst({
      where: {
        userId: user.id,
        productId,
      },
    });

    if (existingReview) {
      return new NextResponse("You have already reviewed this product", {
        status: 400,
      });
    }

    // Create review
    const review = await db.review.create({
      data: {
        rating,
        comment,
        userId: user.id,
        productId,
      },
    });

    // Update product average rating
    const reviews = await db.review.findMany({
      where: { productId },
      select: { rating: true },
    });

    const averageRating =
      reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

    await db.product.update({
      where: { id: productId },
      data: { averageRating },
    });

    return NextResponse.json(review);
  } catch (error) {
    console.error("[PRODUCT_REVIEW_ERROR]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const productId = params.id;

    const reviews = await db.review.findMany({
      where: { productId },
      include: {
        user: {
          select: {
            name: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(reviews);
  } catch (error) {
    console.error("[PRODUCT_REVIEWS_GET_ERROR]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}