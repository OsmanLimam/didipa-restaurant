import { NextRequest, NextResponse } from 'next/server';

// Store push subscriptions (in production, use a database)
// For now, we acknowledge the subscription
export async function POST(request: NextRequest) {
  try {
    const subscription = await request.json();

    // In production: save subscription to database
    // await db.pushSubscription.create({ data: { ...subscription } })

    console.log('Push subscription received:', subscription.endpoint);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to save subscription' },
      { status: 500 }
    );
  }
}
