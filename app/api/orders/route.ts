import { NextResponse } from "next/server"
import { type NextRequest } from "next/server"
import { getCurrentUser } from "@/lib/auth-service"
import prisma from "@/lib/db/prisma"

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const orders = await prisma.order.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        createdAt: true,
        status: true,
        amount: true,
        items: true
      }
    })

    return NextResponse.json(orders)
  } catch (error) {
    console.error("Error fetching orders:", error)
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { items, amount, address } = await request.json()

    const order = await prisma.order.create({
      data: {
        userId: user.id,
        items,
        amount,
        status: "pending",
        shippingAddress: address
      }
    })

    return NextResponse.json(order)
  } catch (error) {
    console.error("Error creating order:", error)
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    )
  }
}

// GET /api/orders - Get all orders for the current user
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ip = headers().get("x-forwarded-for") || "127.0.0.1";
    const rateLimitOk = await checkRateLimit(ip);
    
    if (!rateLimitOk) {
      return NextResponse.json(
        { error: "Rate limit exceeded" },
        { status: 429 }
      );
    }

    const orders = await db.order.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        items: true,
      },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH /api/orders/:id - Update order status
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ip = headers().get("x-forwarded-for") || "127.0.0.1";
    const { success, retryAfter } = await rateLimit(ip, {
      customKey: "order-update",
      limit: 50, // Reasonable limit for order updates
      window: 300000 // 5 minute window
    });
    
    if (!success) {
      return NextResponse.json(
        { error: `Rate limit exceeded. Please try again in ${retryAfter} seconds.` },
        { status: 429 }
      );
    }

    const body = await request.json();
    const validatedData = OrderUpdateSchema.parse(body);

    const order = await db.order.findUnique({
      where: { id: params.id },
      include: {
        items: true,
        user: {
          select: {
            email: true
          }
        }
      }
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.userId !== user.id && user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Validate status transition
    if (validatedData.status) {
      const isValidTransition = validateStatusTransition(
        order.status,
        validatedData.status
      );
      if (!isValidTransition) {
        return NextResponse.json(
          { error: "Invalid status transition" },
          { status: 400 }
        );
      }
    }

    const updatedOrder = await db.order.update({
      where: { id: params.id },
      data: validatedData,
      include: {
        items: true,
      },
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error updating order:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Helper function to validate status transitions
function validateStatusTransition(
  currentStatus: string,
  newStatus: string
): boolean {
  const validTransitions: { [key: string]: string[] } = {
    pending: ["processing", "cancelled"],
    processing: ["shipped", "cancelled"],
    shipped: ["delivered", "cancelled"],
    delivered: [],
    cancelled: [],
  };

  return validTransitions[currentStatus]?.includes(newStatus) ?? false;
}