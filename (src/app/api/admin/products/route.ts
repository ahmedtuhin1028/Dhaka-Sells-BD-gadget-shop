import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await req.json();
    // In production, validate data with Zod here
    const product = await prisma.product.create({
      data: {
        name: data.name,
        slug: data.name.toLowerCase().replace(/ /g, '-'),
        sku: data.sku,
        description: data.description,
        price: parseFloat(data.price),
        salePrice: data.salePrice ? parseFloat(data.salePrice) : null,
        stock: parseInt(data.stock),
        categoryId: data.categoryId,
        images: {
          create: data.imageUrls.map((url: string) => ({ url }))
        }
      }
    });

    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
