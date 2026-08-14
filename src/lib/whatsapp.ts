/**
 * WhatsApp integration for DidiPa
 */

const WHATSAPP_NUMBER = process.env.WHATSAPP_NUMBER || '233241234567';

interface WhatsAppOrderData {
  orderNumber: string;
  customerName: string;
  items: { name: string; quantity: number; extras?: string[]; price: number }[];
  total: number;
  type: 'DELIVERY' | 'PICKUP';
  deliveryAddress?: string;
  orderNotes?: string;
}

export function generateWhatsAppLink(data: WhatsAppOrderData): string {
  const lines: string[] = [];

  lines.push(`🍽️ *New Order - ${data.orderNumber}*`);
  lines.push('');
  lines.push(`👤 ${data.customerName}`);
  lines.push('');

  lines.push('📋 *Items:*');
  for (const item of data.items) {
    lines.push(`• ${item.quantity}x ${item.name} - GH₵ ${item.price.toFixed(2)}`);
    if (item.extras?.length) {
      lines.push(`  Extras: ${item.extras.join(', ')}`);
    }
  }

  lines.push('');
  lines.push(`💰 *Total: GH₵ ${data.total.toFixed(2)}*`);
  lines.push(`📦 ${data.type === 'DELIVERY' ? '🚗 Delivery' : '🏪 Pickup'}`);

  if (data.deliveryAddress) {
    lines.push(`📍 ${data.deliveryAddress}`);
  }

  if (data.orderNotes) {
    lines.push(`📝 ${data.orderNotes}`);
  }

  const message = encodeURIComponent(lines.join('\n'));
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
}

export function generateWhatsAppOrderMessage(data: WhatsAppOrderData): string {
  const lines: string[] = [];
  lines.push(`New Order - ${data.orderNumber}`);
  lines.push(`Customer: ${data.customerName}`);
  lines.push('Items:');
  for (const item of data.items) {
    lines.push(`  ${item.quantity}x ${item.name} - GH₵ ${item.price.toFixed(2)}`);
  }
  lines.push(`Total: GH₵ ${data.total.toFixed(2)}`);
  lines.push(`Type: ${data.type}`);
  if (data.deliveryAddress) lines.push(`Address: ${data.deliveryAddress}`);
  return lines.join('\n');
}
