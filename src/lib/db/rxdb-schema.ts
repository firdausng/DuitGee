import type { RxJsonSchema } from 'rxdb';

/**
 * RxDB Schema for Expenses
 */
export const expenseSchema: RxJsonSchema<{
	id: string;
	vaultId: string;
	userId: string;
	categoryId: string;
	amount: number;
	note?: string;
	date: string;
	createdAt: string;
	updatedAt: string;
	createdBy: string;
	updatedBy?: string;
	deletedAt?: string;
	deletedBy?: string;
	_syncedAt?: string; // Last sync timestamp
	_pendingSync?: boolean; // Whether this needs to be synced
}> = {
	version: 0,
	primaryKey: 'id',
	type: 'object',
	properties: {
		id: {
			type: 'string',
			maxLength: 100
		},
		vaultId: {
			type: 'string',
			maxLength: 100
		},
		userId: {
			type: 'string',
			maxLength: 100
		},
		categoryId: {
			type: 'string',
			maxLength: 100
		},
		amount: {
			type: 'number',
			minimum: 0
		},
		note: {
			type: 'string'
		},
		date: {
			type: 'string',
			format: 'date-time'
		},
		createdAt: {
			type: 'string',
			format: 'date-time'
		},
		updatedAt: {
			type: 'string',
			format: 'date-time'
		},
		createdBy: {
			type: 'string',
			maxLength: 100
		},
		updatedBy: {
			type: 'string',
			maxLength: 100
		},
		deletedAt: {
			type: 'string',
			format: 'date-time'
		},
		deletedBy: {
			type: 'string',
			maxLength: 100
		},
		_syncedAt: {
			type: 'string',
			format: 'date-time'
		},
		_pendingSync: {
			type: 'boolean'
		}
	},
	required: ['id', 'vaultId', 'userId', 'categoryId', 'amount', 'date', 'createdAt', 'updatedAt', 'createdBy'],
	indexes: ['vaultId', 'userId', 'categoryId', 'date', '_pendingSync']
};

/**
 * RxDB Schema for Vaults
 */
export const vaultSchema: RxJsonSchema<{
	id: string;
	name: string;
	description?: string;
	color: string;
	icon: string;
	iconType: string;
	isPersonal: boolean;
	ownerId: string;
	createdAt: string;
	updatedAt: string;
	createdBy: string;
	updatedBy?: string;
	_syncedAt?: string;
	_pendingSync?: boolean;
}> = {
	version: 0,
	primaryKey: 'id',
	type: 'object',
	properties: {
		id: {
			type: 'string',
			maxLength: 100
		},
		name: {
			type: 'string',
			maxLength: 255
		},
		description: {
			type: 'string'
		},
		color: {
			type: 'string',
			maxLength: 50
		},
		icon: {
			type: 'string',
			maxLength: 100
		},
		iconType: {
			type: 'string',
			maxLength: 50
		},
		isPersonal: {
			type: 'boolean'
		},
		ownerId: {
			type: 'string',
			maxLength: 100
		},
		createdAt: {
			type: 'string',
			format: 'date-time'
		},
		updatedAt: {
			type: 'string',
			format: 'date-time'
		},
		createdBy: {
			type: 'string',
			maxLength: 100
		},
		updatedBy: {
			type: 'string',
			maxLength: 100
		},
		_syncedAt: {
			type: 'string',
			format: 'date-time'
		},
		_pendingSync: {
			type: 'boolean'
		}
	},
	required: ['id', 'name', 'color', 'icon', 'iconType', 'isPersonal', 'ownerId', 'createdAt', 'updatedAt', 'createdBy'],
	indexes: ['ownerId', 'isPersonal', '_pendingSync']
};

/**
 * RxDB Schema for Vault Members
 */
export const vaultMemberSchema: RxJsonSchema<{
	id: string;
	vaultId: string;
	userId: string;
	role: string;
	permissions: string;
	status: string;
	invitedAt?: string;
	joinedAt?: string;
	updatedAt: string;
	_syncedAt?: string;
	_pendingSync?: boolean;
}> = {
	version: 0,
	primaryKey: 'id',
	type: 'object',
	properties: {
		id: {
			type: 'string',
			maxLength: 100
		},
		vaultId: {
			type: 'string',
			maxLength: 100
		},
		userId: {
			type: 'string',
			maxLength: 100
		},
		role: {
			type: 'string',
			maxLength: 50
		},
		permissions: {
			type: 'string',
			maxLength: 50
		},
		status: {
			type: 'string',
			maxLength: 50
		},
		invitedAt: {
			type: 'string',
			format: 'date-time'
		},
		joinedAt: {
			type: 'string',
			format: 'date-time'
		},
		updatedAt: {
			type: 'string',
			format: 'date-time'
		},
		_syncedAt: {
			type: 'string',
			format: 'date-time'
		},
		_pendingSync: {
			type: 'boolean'
		}
	},
	required: ['id', 'vaultId', 'userId', 'role', 'permissions', 'status', 'updatedAt'],
	indexes: ['vaultId', 'userId', 'status', '_pendingSync']
};
