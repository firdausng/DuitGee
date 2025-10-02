import { drizzle } from 'drizzle-orm/d1';
import * as schema from './schema';
import { paymentTypes, paymentProviders } from './schema';
import { createId } from '@paralleldrive/cuid2';
import { formatISO } from 'date-fns';

const SYSTEM_USER_ID = 'system';

export async function seedPaymentData(db: D1Database) {
	const client = drizzle(db, { schema });

	console.log('🌱 Seeding payment types...');

	// Check if payment types already exist
	const existingTypes = await client.select().from(paymentTypes).limit(1);

	if (existingTypes.length > 0) {
		console.log('✅ Payment types already seeded, skipping...');
	} else {
		const publicPaymentTypes = [
			{
				id: createId(),
				code: 'cash',
				name: 'Cash',
				icon: '💵',
				iconType: 'emoji',
				isPublic: true,
				vaultId: null,
				createdAt: formatISO(new Date()),
				createdBy: SYSTEM_USER_ID,
				updatedAt: formatISO(new Date()),
				updatedBy: null,
				deletedAt: null,
				deletedBy: null,
			},
			{
				id: createId(),
				code: 'e_wallet',
				name: 'E-Wallet',
				icon: '📱',
				iconType: 'emoji',
				isPublic: true,
				vaultId: null,
				createdAt: formatISO(new Date()),
				createdBy: SYSTEM_USER_ID,
				updatedAt: formatISO(new Date()),
				updatedBy: null,
				deletedAt: null,
				deletedBy: null,
			},
			{
				id: createId(),
				code: 'credit_card',
				name: 'Credit Card',
				icon: '💳',
				iconType: 'emoji',
				isPublic: true,
				vaultId: null,
				createdAt: formatISO(new Date()),
				createdBy: SYSTEM_USER_ID,
				updatedAt: formatISO(new Date()),
				updatedBy: null,
				deletedAt: null,
				deletedBy: null,
			},
			{
				id: createId(),
				code: 'debit_card',
				name: 'Debit Card',
				icon: '💳',
				iconType: 'emoji',
				isPublic: true,
				vaultId: null,
				createdAt: formatISO(new Date()),
				createdBy: SYSTEM_USER_ID,
				updatedAt: formatISO(new Date()),
				updatedBy: null,
				deletedAt: null,
				deletedBy: null,
			},
			{
				id: createId(),
				code: 'bank_transfer',
				name: 'Bank Transfer',
				icon: '🏦',
				iconType: 'emoji',
				isPublic: true,
				vaultId: null,
				createdAt: formatISO(new Date()),
				createdBy: SYSTEM_USER_ID,
				updatedAt: formatISO(new Date()),
				updatedBy: null,
				deletedAt: null,
				deletedBy: null,
			},
		];

		await client.insert(paymentTypes).values(publicPaymentTypes);
		console.log(`✅ Seeded ${publicPaymentTypes.length} payment types`);
	}

	console.log('🌱 Seeding payment providers...');

	// Check if payment providers already exist
	const existingProviders = await client.select().from(paymentProviders).limit(1);

	if (existingProviders.length > 0) {
		console.log('✅ Payment providers already seeded, skipping...');
	} else {
		const publicPaymentProviders = [
			// E-Wallet Providers (Indonesia)
			{
				id: createId(),
				name: 'GoPay',
				type: 'e_wallet',
				icon: '📱',
				iconType: 'emoji',
				color: '#00AA13',
				isPublic: true,
				vaultId: null,
				userId: null,
				createdAt: formatISO(new Date()),
				createdBy: SYSTEM_USER_ID,
				updatedAt: formatISO(new Date()),
				updatedBy: null,
				deletedAt: null,
				deletedBy: null,
			},
			{
				id: createId(),
				name: 'OVO',
				type: 'e_wallet',
				icon: '📱',
				iconType: 'emoji',
				color: '#4C3494',
				isPublic: true,
				vaultId: null,
				userId: null,
				createdAt: formatISO(new Date()),
				createdBy: SYSTEM_USER_ID,
				updatedAt: formatISO(new Date()),
				updatedBy: null,
				deletedAt: null,
				deletedBy: null,
			},
			{
				id: createId(),
				name: 'Dana',
				type: 'e_wallet',
				icon: '📱',
				iconType: 'emoji',
				color: '#118EEA',
				isPublic: true,
				vaultId: null,
				userId: null,
				createdAt: formatISO(new Date()),
				createdBy: SYSTEM_USER_ID,
				updatedAt: formatISO(new Date()),
				updatedBy: null,
				deletedAt: null,
				deletedBy: null,
			},
			{
				id: createId(),
				name: 'ShopeePay',
				type: 'e_wallet',
				icon: '📱',
				iconType: 'emoji',
				color: '#EE4D2D',
				isPublic: true,
				vaultId: null,
				userId: null,
				createdAt: formatISO(new Date()),
				createdBy: SYSTEM_USER_ID,
				updatedAt: formatISO(new Date()),
				updatedBy: null,
				deletedAt: null,
				deletedBy: null,
			},
			{
				id: createId(),
				name: 'LinkAja',
				type: 'e_wallet',
				icon: '📱',
				iconType: 'emoji',
				color: '#E11E27',
				isPublic: true,
				vaultId: null,
				userId: null,
				createdAt: formatISO(new Date()),
				createdBy: SYSTEM_USER_ID,
				updatedAt: formatISO(new Date()),
				updatedBy: null,
				deletedAt: null,
				deletedBy: null,
			},
			// Banks (Indonesia)
			{
				id: createId(),
				name: 'BCA',
				type: 'bank',
				icon: '🏦',
				iconType: 'emoji',
				color: '#003D79',
				isPublic: true,
				vaultId: null,
				userId: null,
				createdAt: formatISO(new Date()),
				createdBy: SYSTEM_USER_ID,
				updatedAt: formatISO(new Date()),
				updatedBy: null,
				deletedAt: null,
				deletedBy: null,
			},
			{
				id: createId(),
				name: 'Mandiri',
				type: 'bank',
				icon: '🏦',
				iconType: 'emoji',
				color: '#003D79',
				isPublic: true,
				vaultId: null,
				userId: null,
				createdAt: formatISO(new Date()),
				createdBy: SYSTEM_USER_ID,
				updatedAt: formatISO(new Date()),
				updatedBy: null,
				deletedAt: null,
				deletedBy: null,
			},
			{
				id: createId(),
				name: 'BNI',
				type: 'bank',
				icon: '🏦',
				iconType: 'emoji',
				color: '#ED7D31',
				isPublic: true,
				vaultId: null,
				userId: null,
				createdAt: formatISO(new Date()),
				createdBy: SYSTEM_USER_ID,
				updatedAt: formatISO(new Date()),
				updatedBy: null,
				deletedAt: null,
				deletedBy: null,
			},
			{
				id: createId(),
				name: 'BRI',
				type: 'bank',
				icon: '🏦',
				iconType: 'emoji',
				color: '#00529C',
				isPublic: true,
				vaultId: null,
				userId: null,
				createdAt: formatISO(new Date()),
				createdBy: SYSTEM_USER_ID,
				updatedAt: formatISO(new Date()),
				updatedBy: null,
				deletedAt: null,
				deletedBy: null,
			},
			{
				id: createId(),
				name: 'Permata',
				type: 'bank',
				icon: '🏦',
				iconType: 'emoji',
				color: '#7CB342',
				isPublic: true,
				vaultId: null,
				userId: null,
				createdAt: formatISO(new Date()),
				createdBy: SYSTEM_USER_ID,
				updatedAt: formatISO(new Date()),
				updatedBy: null,
				deletedAt: null,
				deletedBy: null,
			},
			{
				id: createId(),
				name: 'CIMB',
				type: 'bank',
				icon: '🏦',
				iconType: 'emoji',
				color: '#C8102E',
				isPublic: true,
				vaultId: null,
				userId: null,
				createdAt: formatISO(new Date()),
				createdBy: SYSTEM_USER_ID,
				updatedAt: formatISO(new Date()),
				updatedBy: null,
				deletedAt: null,
				deletedBy: null,
			},
		];

		await client.insert(paymentProviders).values(publicPaymentProviders);
		console.log(`✅ Seeded ${publicPaymentProviders.length} payment providers`);
	}

	console.log('✅ Payment data seeding complete!');
}
