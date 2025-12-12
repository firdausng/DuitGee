/**
 * Payment types configuration
 * Defines the available payment methods for expense tracking
 */

export interface PaymentType {
	value: string;
	label: string;
	icon: string;
	description: string;
}

export const paymentTypes: PaymentType[] = [
	{
		value: 'cash',
		label: 'Cash',
		icon: '💵',
		description: 'Physical cash payment'
	},
	{
		value: 'debit',
		label: 'Debit Card',
		icon: '💳',
		description: 'Payment using debit card'
	},
	{
		value: 'credit',
		label: 'Credit Card',
		icon: '💳',
		description: 'Payment using credit card'
	},
	{
		value: 'transfer',
		label: 'Bank Transfer',
		icon: '🏦',
		description: 'Direct bank transfer or wire transfer'
	},
	{
		value: 'ewallet',
		label: 'E-Wallet',
		icon: '📱',
		description: 'Digital wallet (GoPay, OVO, Dana, PayPal, etc.)'
	},
	{
		value: 'qris',
		label: 'QRIS',
		icon: '📲',
		description: 'QR Code Indonesian Standard'
	},
	{
		value: 'check',
		label: 'Check',
		icon: '📝',
		description: 'Payment by check'
	},
	{
		value: 'other',
		label: 'Other',
		icon: '💰',
		description: 'Other payment methods'
	}
];

export const defaultPaymentType = 'cash';

/**
 * Get payment type by value
 */
export function getPaymentType(value: string): PaymentType | undefined {
	return paymentTypes.find(type => type.value === value);
}

/**
 * Get payment type label
 */
export function getPaymentTypeLabel(value: string): string {
	const type = getPaymentType(value);
	return type?.label || value;
}

/**
 * Get payment type icon
 */
export function getPaymentTypeIcon(value: string): string {
	const type = getPaymentType(value);
	return type?.icon || '💰';
}
