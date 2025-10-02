import { createRxDatabase, addRxPlugin } from 'rxdb';
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie';
import { RxDBDevModePlugin } from 'rxdb/plugins/dev-mode';
import { RxDBQueryBuilderPlugin } from 'rxdb/plugins/query-builder';
import { RxDBUpdatePlugin } from 'rxdb/plugins/update';
import { expenseSchema, vaultSchema, vaultMemberSchema } from './rxdb-schema';
import type { RxDatabase, RxCollection } from 'rxdb';

// Add plugins
if (import.meta.env.DEV) {
	addRxPlugin(RxDBDevModePlugin);
}
addRxPlugin(RxDBQueryBuilderPlugin);
addRxPlugin(RxDBUpdatePlugin);

// Type definitions for collections
export type ExpenseDocument = {
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
	_syncedAt?: string;
	_pendingSync?: boolean;
};

export type VaultDocument = {
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
};

export type VaultMemberDocument = {
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
};

// Database collections
export type ExpenseCollection = RxCollection<ExpenseDocument>;
export type VaultCollection = RxCollection<VaultDocument>;
export type VaultMemberCollection = RxCollection<VaultMemberDocument>;

export type DatabaseCollections = {
	expenses: ExpenseCollection;
	vaults: VaultCollection;
	vault_members: VaultMemberCollection;
};

export type RxDBDatabase = RxDatabase<DatabaseCollections>;

let dbPromise: Promise<RxDBDatabase> | null = null;

/**
 * Initialize RxDB database
 */
export async function initDatabase(): Promise<RxDBDatabase> {
	if (dbPromise) {
		return dbPromise;
	}

	dbPromise = (async () => {
		console.log('[RxDB] Initializing database...');

		const db = await createRxDatabase<DatabaseCollections>({
			name: 'duitgee_db',
			storage: getRxStorageDexie(),
			multiInstance: false,
			eventReduce: true,
			ignoreDuplicate: true
		});

		console.log('[RxDB] Database created, adding collections...');

		// Add collections
		await db.addCollections({
			expenses: {
				schema: expenseSchema
			},
			vaults: {
				schema: vaultSchema
			},
			vault_members: {
				schema: vaultMemberSchema
			}
		});

		console.log('[RxDB] Database initialized successfully');

		// Set up cleanup on window unload
		if (typeof window !== 'undefined') {
			window.addEventListener('beforeunload', async () => {
				await db.destroy();
			});
		}

		return db;
	})();

	return dbPromise;
}

/**
 * Get database instance (lazy initialization)
 */
export async function getDatabase(): Promise<RxDBDatabase> {
	return initDatabase();
}

/**
 * Destroy database (for cleanup)
 */
export async function destroyDatabase(): Promise<void> {
	if (dbPromise) {
		const db = await dbPromise;
		await db.destroy();
		dbPromise = null;
	}
}
