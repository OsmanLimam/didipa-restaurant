import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyPaystackTransaction } from '@/lib/paystack';

/**
 * Paystack callback endpoint (GET)
 *
 * When Paystack completes a payment, it redirects the customer to this URL
 * with the transaction reference as a query parameter.
 * We verify the transaction and update the order status accordingly.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const reference = searchParams.get('reference') || searchParams.get('trxref');

    if (!reference) {
      return NextResponse.redirect(
        new URL('/checkout?error=no_reference', request.url)
      );
    }

    // Verify the transaction with Paystack
    const verification = await verifyPaystackTransaction(reference);

    if (verification.status === 'success') {
      // Find the order by payment reference
      const order = await db.order.findFirst({
        where: { paymentReference: reference },
      });

      if (order) {
        // Verify amount matches (Paystack returns in pesewas)
        const expectedAmountInPesewas = Math.round(order.total * 100);

        if (verification.amount === expectedAmountInPesewas) {
          // Update order to paid
          await db.order.update({
            where: { id: order.id },
            data: {
              paymentStatus: 'PAID',
              status: order.status === 'PENDING' ? 'CONFIRMED' : order.status,
            },
          });

          // Add status history entries
          if (order.status === 'PENDING') {
            await db.orderStatusHistory.create({
              data: {
                orderId: order.id,
                status: 'CONFIRMED',
                changedBy: 'PAYSTACK',
              },
            });
          }

          await db.orderStatusHistory.create({
            data: {
              orderId: order.id,
              status: 'PAYMENT_CONFIRMED',
              changedBy: 'PAYSTACK',
            },
          });

          // Redirect to order confirmation page
          return NextResponse.redirect(
            new URL(`/order/${order.orderToken}?payment=success`, request.url)
          );
        } else {
          // Amount mismatch
          await db.order.update({
            where: { id: order.id },
            data: { paymentStatus: 'FAILED' },
          });

          return NextResponse.redirect(
            new URL(`/order/${order.orderToken}?payment=failed`, request.url)
          );
        }
      }

      // Order not found by reference - redirect to home
      return NextResponse.redirect(
        new URL('/?payment=success', request.url)
      );
    } else {
      // Payment was not successful
      const order = await db.order.findFirst({
        where: { paymentReference: reference },
      });

      if (order) {
        await db.order.update({
          where: { id: order.id },
          data: {
            paymentStatus: verification.status === 'pending' ? 'PENDING' : 'FAILED',
          },
        });

        return NextResponse.redirect(
          new URL(`/order/${order.orderToken}?payment=failed`, request.url)
        );
      }

      return NextResponse.redirect(
        new URL('/checkout?payment=failed', request.url)
      );
    }
  } catch (error) {
    console.error('Paystack callback error:', error);
    return NextResponse.redirect(
      new URL('/checkout?error=verification_failed', request.url)
    );
  }
}

/**
 * Paystack webhook endpoint (POST)
 *
 * Handles webhook events from Paystack for server-to-server notifications.
 * This provides a reliable way to confirm payments even if the callback
 * redirect fails.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const event = body.event;
    const data = body.data;

    // We primarily handle charge.success events
    if (event === 'charge.success' && data?.reference) {
      const reference = data.reference as string;

      // Verify again with Paystack for security (don't trust webhooks blindly)
      const verification = await verifyPaystackTransaction(reference);

      if (verification.status === 'success') {
        const order = await db.order.findFirst({
          where: { paymentReference: reference },
        });

        if (order && order.paymentStatus !== 'PAID') {
          // Verify amount
          const expectedAmountInPesewas = Math.round(order.total * 100);

          if (verification.amount === expectedAmountInPesewas) {
            await db.order.update({
              where: { id: order.id },
              data: {
                paymentStatus: 'PAID',
                status: order.status === 'PENDING' ? 'CONFIRMED' : order.status,
              },
            });

            if (order.status === 'PENDING') {
              await db.orderStatusHistory.create({
                data: {
                  orderId: order.id,
                  status: 'CONFIRMED',
                  changedBy: 'PAYSTACK_WEBHOOK',
                },
              });
            }

            await db.orderStatusHistory.create({
              data: {
                orderId: order.id,
                status: 'PAYMENT_CONFIRMED',
                changedBy: 'PAYSTACK_WEBHOOK',
              },
            });
          }
        }
      }
    }

    // Always return 200 to acknowledge webhook
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Paystack webhook error:', error);
    return NextResponse.json({ received: true });
  }
}
