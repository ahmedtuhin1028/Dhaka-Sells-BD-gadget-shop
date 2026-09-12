import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const body = await req.json();
    const { items, customerInfo, paymentMethod } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    // 1. SECURELY RECALCULATE TOTALS FROM DATABASE (Do not trust client prices)
    let subTotal = 0;
    const orderItemsData = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({ where: { id: item.id } });
      if (!product || !product.isActive || product.stock < item.quantity) {
        return NextResponse.json({ error: `Product ${item.name} is unavailable or out of stock.` }, { status: 400 });
      }
      
      const priceToCharge = product.salePrice ? product.salePrice : product.price;
      subTotal += priceToCharge * item.quantity;
      
      orderItemsData.push({
        productId: product.id,
        quantity: item.quantity,
        price: priceToCharge,
      });
    }

    const deliveryFee = customerInfo.city.toLowerCase() === 'dhaka' ? 60 : 120;
    const total = subTotal + deliveryFee;

    // 2. CREATE ORDER
    const orderNumber = `DSBD-${Date.now().toString().slice(-6)}`;
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: session?.user?.id || null,
        customerName: customerInfo.name,
        customerPhone: customerInfo.phone,
        shippingAddress: customerInfo.address,
        city: customerInfo.city,
        deliveryNotes: customerInfo.notes,
        subTotal,
        deliveryFee,
        total,
        paymentMethod,
        items: { create: orderItemsData }
      }
    });

    // 3. PAYMENT GATEWAY ROUTING
    if (paymentMethod === 'COD') {
      // Deduct stock for COD immediately
      for (const item of items) {
        await prisma.product.update({
          where: { id: item.id },
          data: { stock: { decrement: item.quantity } }
        });
      }
      return NextResponse.json({ success: true, orderId: order.orderNumber, message: 'Order Placed Successfully' });
    }

    if (paymentMethod === 'SSLCOMMERZ') {
      // Architecture Stub for SSLCommerz
      // const sslcz = new SSLCommerzPayment(process.env.SSLCOMMERZ_STORE_ID, process.env.SSLCOMMERZ_STORE_PASSWORD, isLive)
      // const gatewayUrl = await sslcz.init(paymentData)
      return NextResponse.json({ 
        success: true, 
        paymentUrl: "https://sandbox.sslcommerz.com/gwprocess/v4/api.php" // Replace with actual SSL URL
      });
    }

    if (paymentMethod === 'BKASH') {
      // Architecture Stub for bKash Tokenized API
      return NextResponse.json({ success: true, paymentUrl: "/api/bkash/create-payment" });
    }

    return NextResponse.json({ error: 'Invalid payment method' }, { status: 400 });

  } catch (error) {
    console.error("Checkout Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
