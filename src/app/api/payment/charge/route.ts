import { NextResponse } from 'next/server';
import { chargeMobileMoney, generatePaymentReference } from '@/lib/paystack';
import { db } from '@/lib/db';

/**
 * Charge Mobile Money via Paystack
 *
 * POST /api/payment/charge
 * Body: { orderId, phone, network, email, amount }
 *
 * This endpoint initiates a mobile money charge through Paystack's charge API.
 * The customer will receive a prompt on their phone to authorize the payment.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderId, phone, network, email, amount } = body;

    if (!orderId || !phone || !network || !email || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields: orderId, phone, network, email, amount' },
        { status: 400 }
      );
    }

    // Validate the order exists
    const order = await db.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Generate a payment reference
    const reference = generatePaymentReference('MOMO');

    // Update order with payment reference
    await db.order.update({
      where: { id: orderId },
      data: {
        paymentReference: reference,
        paymentStatus: 'PENDING',
      },
    });

    // Initiate the mobile money charge via Paystack
    const result = await chargeMobileMoney({
      email,
      amount, // in GHS
      reference,
      phone,
      network,
      metadata: {
        orderId,
        orderNumber: order.orderNumber,
        custom_fields: [
          { display_name: 'Order Number', variable_name: 'order_number', value: order.orderNumber },
        ],
      },
    });

    return NextResponse.json({
      success: true,
      reference,
      status: result.status || result.data?.status || 'pending',
      message: 'Payment prompt sent to your phone. Please authorize the payment.',
      data: result.data,
    });
  } catch (error) {
    console.error('MoMo charge error:', error);
    const message = error instanceof Error ? error.message : 'Mobile Money charge failed';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
