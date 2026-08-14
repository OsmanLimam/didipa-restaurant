/**
 * Payment Gateway Integration for Mama's Kitchen
 * Supports: Paystack (Ghana), MTN MoMo, Vodafone Cash, AirtelTigo Money
 *
 * Paystack is the primary gateway - it handles Mobile Money (MoMo)
 * and card payments for Ghana.
 *
 * Currency: GHS (Ghanaian Cedis)
 * Amount format: Paystack expects amount in pesewas (multiply by 100)
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

// Paystack inline popup configuration
export interface PaystackPopupConfig {
  email: string;
  amount: number; // in GHS
  reference: string;
  metadata?: Record<string, unknown>;
  channels?: PaystackChannel[];
  onSuccess: (response: PaystackSuccessResponse) => void;
  onClose: () => void;
}

export type PaystackChannel = 'card' | 'bank' | 'ussd' | 'qr' | 'mobile_money' | 'mobile_money_ghana' | 'bank_transfer';

export interface PaystackSuccessResponse {
  reference: string;
  trans?: string;
  status?: string;
  message?: string;
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
  amount: number; // in GHS (Paystack expects pesewas, so we multiply by 100)
  reference: string;
  callbackUrl: string;
  metadata?: Record<string, unknown>;
  channels?: PaystackChannel[];
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

// Charge Mobile Money via Paystack (server-side)
export async function chargeMobileMoney(params: {
  email: string;
  amount: number; // in GHS
  reference: string;
  phone: string;
  network: MobileMoneyNetwork;
  metadata?: Record<string, unknown>;
}) {
  const config = getPaystackConfig();
  if (!config) throw new Error('Paystack not configured');

  // Map network names to Paystack's expected format
  const networkMap: Record<MobileMoneyNetwork, string> = {
    mtn: 'MTN',
    vodafone: 'VODAFONE',
    airteltigo: 'AIRTELTIGO',
  };

  const response = await fetch('https://api.paystack.co/charge', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.secretKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: params.email,
      amount: Math.round(params.amount * 100), // Convert GHS to pesewas
      reference: params.reference,
      currency: 'GHS',
      metadata: params.metadata,
      mobile_money: {
        phone: params.phone,
        provider: networkMap[params.network],
      },
      channels: ['mobile_money_ghana'],
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Mobile Money charge failed');
  }

  return response.json();
}

// Verify Paystack transaction (server-side)
export async function verifyPaystackTransaction(reference: string): Promise<{
  status: string;
  amount: number;
  channel: string;
  currency: string;
  reference: string;
  authorization: {
    channel: string;
    bank: string;
    brand: string;
  };
}> {
  const config = getPaystackConfig();
  if (!config) throw new Error('Paystack not configured');

  const response = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
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

// Map payment method constant to Paystack channel
export function getPaystackChannelsForMethod(method: string): PaystackChannel[] {
  switch (method) {
    case 'MTN_MOMO':
    case 'VODAFONE_CASH':
    case 'AIRTELTIGO_MONEY':
      return ['mobile_money_ghana'];
    case 'PAYSTACK':
      return ['card', 'mobile_money_ghana'];
    default:
      return ['card', 'mobile_money_ghana'];
  }
}

// Map payment method constant to MoMo network
export function getMoMoNetwork(method: string): MobileMoneyNetwork | null {
  switch (method) {
    case 'MTN_MOMO':
      return 'mtn';
    case 'VODAFONE_CASH':
      return 'vodafone';
    case 'AIRTELTIGO_MONEY':
      return 'airteltigo';
    default:
      return null;
  }
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

/**
 * Initialize Paystack inline popup (client-side)
 *
 * This is the main function for opening the Paystack payment popup.
 * It loads the Paystack SDK if not already loaded, then opens the popup.
 *
 * @param config - Paystack popup configuration
 * @example
 * ```ts
 * await initializePaystackPopup({
 *   email: 'customer@example.com',
 *   amount: 50.00, // GHS
 *   reference: 'DP-ABC123',
 *   channels: ['card', 'mobile_money_ghana'],
 *   onSuccess: (response) => {
 *     console.log('Payment successful:', response.reference);
 *   },
 *   onClose: () => {
 *     console.log('Payment popup closed');
 *   },
 * });
 * ```
 */
export async function initializePaystackPopup(config: PaystackPopupConfig): Promise<void> {
  try {
    await loadPaystackScript();
  } catch (error) {
    throw new Error('Failed to load Paystack payment gateway. Please check your internet connection.');
  }

  const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;
  if (!publicKey) {
    throw new Error('Paystack public key not configured. Please contact support.');
  }

  const handler = (window as any).PaystackPop.setup({
    key: publicKey,
    email: config.email,
    amount: Math.round(config.amount * 100), // GHS to pesewas
    ref: config.reference,
    currency: 'GHS',
    channels: config.channels || ['card', 'mobile_money_ghana'],
    metadata: config.metadata || {},
    callback: (response: PaystackSuccessResponse) => {
      config.onSuccess(response);
    },
    onClose: () => {
      config.onClose();
    },
  });

  handler.openIframe();
}

/**
 * Open Paystack payment popup (client-side)
 * Backward-compatible wrapper around initializePaystackPopup
 */
export async function openPaystackPopup(params: {
  email: string;
  amount: number;
  reference: string;
  metadata?: Record<string, unknown>;
  channels?: PaystackChannel[];
  onSuccess: (reference: string) => void;
  onClose: () => void;
}) {
  await initializePaystackPopup({
    email: params.email,
    amount: params.amount,
    reference: params.reference,
    metadata: params.metadata,
    channels: params.channels,
    onSuccess: (response) => {
      params.onSuccess(response.reference);
    },
    onClose: params.onClose,
  });
}

// Check if a payment method requires online payment
export function isOnlinePaymentMethod(method: string): boolean {
  return ['MTN_MOMO', 'VODAFONE_CASH', 'AIRTELTIGO_MONEY', 'PAYSTACK'].includes(method);
}

// Check if a payment method is MoMo
export function isMoMoPaymentMethod(method: string): boolean {
  return ['MTN_MOMO', 'VODAFONE_CASH', 'AIRTELTIGO_MONEY'].includes(method);
}
