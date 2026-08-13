import { NextRequest, NextResponse } from 'next/server';

// Remove push subscription
export async function POST(request: NextRequest) {
  try {
    const subscription = await request.json();

    // In production: remove subscription from database
    // await db.pushSubscription.deleteMany({ where: { endpoint: subscription.endpoint } })

    console.log('Push subscription removed:', subscription.endpoint);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to remove subscription' },
      { status: 500 }
    );
  }
}
