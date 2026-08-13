import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyPaystackTransaction } from '@/lib/paystack';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { reference, orderId } = body;

    if (!reference) {
      return NextResponse.json(
        { error: 'Payment reference is required' },
        { status: 400 }
      );
    }

    // Verify the transaction with Paystack
    const verification = await verifyPaystackTransaction(reference);

    if (verification.status === 'success') {
      // Find the order by payment reference or order ID
      let order;
      if (orderId) {
        order = await db.order.findUnique({
          where: { id: orderId },
        });
      } else {
        order = await db.order.findFirst({
          where: { paymentReference: reference },
        });
      }

      if (!order) {
        return NextResponse.json(
          { error: 'Order not found' },
          { status: 404 }
        );
      }

      // Verify the amount matches (Paystack returns amount in pesewas)
      const expectedAmountInPesewas = Math.round(order.total * 100);
      if (verification.amount !== expectedAmountInPesewas) {
        return NextResponse.json(
          { error: 'Amount mismatch. Payment verification failed.' },
          { status: 400 }
        );
      }

      // Update order payment status
      const updatedOrder = await db.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: 'PAID',
          paymentReference: reference,
          status: order.status === 'PENDING' ? 'CONFIRMED' : order.status,
        },
      });

      // Add status history entry if status changed
      if (order.status === 'PENDING') {
        await db.orderStatusHistory.create({
          data: {
            orderId: order.id,
            status: 'CONFIRMED',
            changedBy: 'PAYSTACK',
          },
        });
      }

      // Add payment confirmation to status history
      await db.orderStatusHistory.create({
        data: {
          orderId: order.id,
          status: 'PAYMENT_CONFIRMED',
          changedBy: 'PAYSTACK',
        },
      });

      return NextResponse.json({
        verified: true,
        status: 'success',
        amount: verification.amount / 100, // Convert pesewas back to GHS
        channel: verification.channel,
        reference: verification.reference,
        order: updatedOrder,
      });
    } else {
      // Payment failed or pending
      if (orderId) {
        await db.order.update({
          where: { id: orderId },
          data: {
            paymentStatus: verification.status === 'pending' ? 'PENDING' : 'FAILED',
            paymentReference: reference,
          },
        });
      }

      return NextResponse.json({
        verified: false,
        status: verification.status,
        message: `Payment ${verification.status}`,
        reference: verification.reference,
      });
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { error: 'Payment verification failed. Please contact support.' },
      { status: 500 }
    );
  }
}
