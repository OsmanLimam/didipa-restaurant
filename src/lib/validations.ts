import { defineSchema, defineTable } from 'zod';

// Checkout validation
import { z } from 'zod';

export const checkoutSchema = z.object({
  customerName: z.string().min(2, 'Name must be at least 2 characters'),
  customerPhone: z.string().min(10, 'Enter a valid phone number').max(15, 'Phone number too long'),
  customerEmail: z.string().email('Enter a valid email').optional().or(z.literal('')),
  orderType: z.enum(['DELIVERY', 'PICKUP'], { required_error: 'Choose delivery or pickup' }),
  deliveryAddress: z.string().optional(),
  deliveryNotes: z.string().optional(),
  orderNotes: z.string().optional(),
  paymentMethod: z.enum([
    'MTN_MOMO',
    'VODAFONE_CASH',
    'AIRTELTIGO_MONEY',
    'PAYSTACK',
    'CASH_ON_DELIVERY',
    'PAY_ON_PICKUP',
  ], { required_error: 'Choose a payment method' }),
  momoPhone: z.string().optional(),
}).refine(
  (data) => {
    if (data.orderType === 'DELIVERY') {
      return !!data.deliveryAddress && data.deliveryAddress.length >= 5;
    }
    return true;
  },
  { message: 'Delivery address is required for delivery orders', path: ['deliveryAddress'] }
).refine(
  (data) => {
    // MoMo payment methods require a phone number
    const momoMethods = ['MTN_MOMO', 'VODAFONE_CASH', 'AIRTELTIGO_MONEY'];
    if (momoMethods.includes(data.paymentMethod)) {
      return !!data.momoPhone && data.momoPhone.length >= 10;
    }
    return true;
  },
  { message: 'Phone number is required for Mobile Money payments', path: ['momoPhone'] }
).refine(
  (data) => {
    // Paystack and MoMo require an email
    const onlineMethods = ['MTN_MOMO', 'VODAFONE_CASH', 'AIRTELTIGO_MONEY', 'PAYSTACK'];
    if (onlineMethods.includes(data.paymentMethod)) {
      return !!data.customerEmail && data.customerEmail.length > 0;
    }
    return true;
  },
  { message: 'Email is required for online payments', path: ['customerEmail'] }
);

export type CheckoutInput = z.infer<typeof checkoutSchema>;

export const menuItemSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  price: z.number().min(0.01, 'Price must be positive'),
  categoryId: z.string().min(1, 'Category is required'),
  isAvailable: z.boolean().default(true),
  isPopular: z.boolean().default(false),
  preparationTime: z.number().min(0).optional(),
  ingredients: z.string().optional(),
});

export const categorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  displayOrder: z.number().min(0).default(0),
  isActive: z.boolean().default(true),
});

export const settingsSchema = z.object({
  name: z.string().min(1, 'Restaurant name is required'),
  description: z.string().optional(),
  phone: z.string().optional(),
  whatsappNumber: z.string().optional(),
  address: z.string().optional(),
  deliveryFee: z.number().min(0),
  minimumOrder: z.number().min(0),
  preparationTime: z.number().min(1),
  freeDeliveryMin: z.number().min(0),
  status: z.enum(['OPEN', 'CLOSED', 'BUSY']),
});

export const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});
