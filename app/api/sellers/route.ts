import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await req.json();
    const { shopName, description, businessType, contactInfo } = body;

    const seller = await db.seller.create({
      data: {
        userId: session.user.id,
        shopName,
        description,
        businessType,
        contactInfo,
        status: 'PENDING',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(seller);
  } catch (error) {
    console.error('Error creating seller:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    const sellers = await db.seller.findMany({
      where: status ? { status: status.toUpperCase() } : {},
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(sellers);
  } catch (error) {
    console.error('Error fetching sellers:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await req.json();
    const { sellerId, status, shopName, description, businessType, contactInfo } = body;

    const seller = await db.seller.update({
      where: { id: sellerId },
      data: {
        status: status?.toUpperCase(),
        shopName,
        description,
        businessType,
        contactInfo,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(seller);
  } catch (error) {
    console.error('Error updating seller:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}