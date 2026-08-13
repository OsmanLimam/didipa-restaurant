/**
 * Payment Gateway Integration for DidiPa
 * Supports: Paystack (Ghana), MTN MoMo, Vodafone Cash, AirtelTigo Money
 * 
 * Paystack is the primary gateway - it handles Mobile Money (MoMo) 
 * and card payments for Ghana.
 */

// Payment method types
export type PaymentProvider = 'paystack' | 'cash_on_delivery' | 'pay_on_pickup';
export type MobileMoneyNetwork = 'mtn' | 'vodafone' | 'airteltigo';

export interface PaystackConfig {
  publicKey: string;
  secretKey: string;
  callbackUrl: string;
}

export interface MoMoPaymentParams {
  network: MobileMoneyNetwork;
  phone: string;
  amount: number; // in GHS
  email: string;
  reference: string;
  metadata?: Record<string, unknown>;
}

export interface PaymentResult {
  success: boolean;
  reference: string;
  message: string;
  provider: PaymentProvider;
  redirectUrl?: string;
}

// Get Paystack config from environment
export function getPaystackConfig(): PaystackConfig | null {
  const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  const callbackUrl = process.env.NEXT_PUBLIC_PAYSTACK_CALLBACK_URL || '';

  if (!publicKey || !secretKey) return null;

  return { publicKey, secretKey, callbackUrl };
}

// Generate a unique payment reference
export function generatePaymentReference(prefix = 'DP'): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

// Initialize Paystack transaction (server-side)
export async function initializePaystackTransaction(params: {
  email: string;
  amount: number; // in GHS (Paystack expects kobo/cents, so we multiply by 100)
  reference: string;
  callbackUrl: string;
  metadata?: Record<string, unknown>;
  channels?: string[]; // e.g., ['mobile_money_ghana'] for MoMo only
}) {
  const config = getPaystackConfig();
  if (!config) throw new Error('Paystack not configured');

  const response = await fetch('https://api.paystack.co/transaction/initialize', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.secretKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: params.email,
      amount: Math.round(params.amount * 100), // Convert GHS to pesewas (Ghana cents)
      reference: params.reference,
      callback_url: params.callbackUrl,
      metadata: params.metadata,
      channels: params.channels,
      currency: 'GHS',
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Paystack initialization failed');
  }

  return response.json();
}

// Verify Paystack transaction (server-side)
export async function verifyPaystackTransaction(reference: string): Promise<{
  status: string;
  amount: number;
  channel: string;
  authorization: {
    channel: string;
    bank: string;
    brand: string;
  };
}> {
  const config = getPaystackConfig();
  if (!config) throw new Error('Paystack not configured');

  const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
    headers: {
      Authorization: `Bearer ${config.secretKey}`,
    },
  });

  if (!response.ok) {
    throw new Error('Transaction verification failed');
  }

  const data = await response.json();
  return data.data;
}

// Get payment channels for MoMo
export function getMoMoChannels(): { id: MobileMoneyNetwork; name: string; icon: string; color: string }[] {
  return [
    {
      id: 'mtn',
      name: 'MTN Mobile Money',
      icon: '📱',
      color: '#FFC300', // MTN Yellow
    },
    {
      id: 'vodafone',
      name: 'Vodafone Cash',
      icon: '📱',
      color: '#E60000', // Vodafone Red
    },
    {
      id: 'airteltigo',
      name: 'AirtelTigo Money',
      icon: '📱',
      color: '#ED1C24', // AirtelTigo Red
    },
  ];
}

// Paystack popup script loader (client-side)
export function loadPaystackScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') { resolve(); return; }
    if ((window as any).PaystackPop) { resolve(); return; }

    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v2/inline.js';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Paystack script'));
    document.head.appendChild(script);
  });
}

// Open Paystack payment popup (client-side)
export async function openPaystackPopup(params: {
  email: string;
  amount: number;
  reference: string;
  metadata?: Record<string, unknown>;
  channels?: string[];
  onSuccess: (reference: string) => void;
  onClose: () => void;
}) {
  await loadPaystackScript();

  const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;
  if (!publicKey) throw new Error('Paystack public key not configured');

  const handler = (window as any).PaystackPop.setup({
    key: publicKey,
    email: params.email,
    amount: Math.round(params.amount * 100), // GHS to pesewas
    ref: params.reference,
    currency: 'GHS',
    channels: params.channels || ['card', 'mobile_money_ghana'],
    metadata: params.metadata,
    callback: (response: { reference: string }) => {
      params.onSuccess(response.reference);
    },
    onClose: () => {
      params.onClose();
    },
  });

  handler.openIframe();
}
