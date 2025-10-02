import { getDatabase, type RxDBDatabase, type ExpenseDocument, type VaultDocument } from '$lib/db/rxdb-database';
import { syncManager } from '$lib/db/sync-manager';
import type { MangoQuery } from 'rxdb';

/**
 * Local database store using Svelte 5 runes
 */
class LocalDBStore {
	private db = $state<RxDBDatabase | null>(null);
	private initialized = $state(false);
	private syncing = $state(false);

	// Reactive state for data
	expenses = $state<ExpenseDocument[]>([]);
	vaults = $state<VaultDocument[]>([]);

	constructor() {
		if (typeof window !== 'undefined') {
			this.init();
		}
	}

	async init() {
		if (this.initialized) return;

		console.log('[LocalDB] Initializing...');

		try {
			this.db = await getDatabase();
			await syncManager.init();

			// Set up reactive subscriptions
			this.setupSubscriptions();

			// Start auto-sync (every 30 seconds)
			syncManager.startAutoSync(30000);

			this.initialized = true;
			console.log('[LocalDB] Initialized successfully');
		} catch (error) {
			console.error('[LocalDB] Initialization failed:', error);
		}
	}

	private setupSubscriptions() {
		if (!this.db) return;

		// Subscribe to vaults
		this.db.vaults.find().$.subscribe(vaults => {
			this.vaults = vaults.map(v => v.toJSON());
		});

		// Subscribe to expenses (all)
		this.db.expenses.find().$.subscribe(expenses => {
			this.expenses = expenses.map(e => e.toJSON());
		});
	}

	/**
	 * Get expenses for a specific vault
	 */
	async getExpensesByVault(vaultId: string): Promise<ExpenseDocument[]> {
		if (!this.db) await this.init();

		const expenses = await this.db!.expenses.find({
			selector: {
				vaultId: vaultId,
				deletedAt: { $exists: false }
			},
			sort: [{ date: 'desc' }]
		}).exec();

		return expenses.map(e => e.toJSON());
	}

	/**
	 * Create a new expense (local-first)
	 */
	async createExpense(data: {
		vaultId: string;
		userId: string;
		categoryId: string;
		amount: number;
		note?: string;
		date?: string;
	}) {
		if (!this.db) await this.init();

		const now = new Date().toISOString();
		const expenseId = `expense_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

		const expense: ExpenseDocument = {
			id: expenseId,
			vaultId: data.vaultId,
			userId: data.userId,
			categoryId: data.categoryId,
			amount: data.amount,
			note: data.note,
			date: data.date || now,
			createdAt: now,
			updatedAt: now,
			createdBy: data.userId,
			_pendingSync: true // Mark for sync
		};

		await this.db!.expenses.insert(expense);

		// Trigger background sync
		syncManager.pushPendingChanges();

		console.log('[LocalDB] Created expense:', expenseId);
		return expense;
	}

	/**
	 * Update an expense (local-first)
	 */
	async updateExpense(expenseId: string, data: {
		amount?: number;
		categoryId?: string;
		note?: string;
		date?: string;
	}) {
		if (!this.db) await this.init();

		const expense = await this.db!.expenses.findOne(expenseId).exec();
		if (!expense) {
			throw new Error('Expense not found');
		}

		await expense.update({
			$set: {
				...data,
				updatedAt: new Date().toISOString(),
				_pendingSync: true
			}
		});

		// Trigger background sync
		syncManager.pushPendingChanges();

		console.log('[LocalDB] Updated expense:', expenseId);
	}

	/**
	 * Delete an expense (soft delete, local-first)
	 */
	async deleteExpense(expenseId: string, userId: string) {
		if (!this.db) await this.init();

		const expense = await this.db!.expenses.findOne(expenseId).exec();
		if (!expense) {
			throw new Error('Expense not found');
		}

		await expense.update({
			$set: {
				deletedAt: new Date().toISOString(),
				deletedBy: userId,
				updatedAt: new Date().toISOString(),
				_pendingSync: true
			}
		});

		// Trigger background sync
		syncManager.pushPendingChanges();

		console.log('[LocalDB] Deleted expense:', expenseId);
	}

	/**
	 * Force sync with backend
	 */
	async sync() {
		if (this.syncing) return;

		this.syncing = true;
		try {
			await syncManager.syncAll();
		} finally {
			this.syncing = false;
		}
	}

	/**
	 * Query expenses with custom filters
	 */
	async queryExpenses(query: MangoQuery<ExpenseDocument>) {
		if (!this.db) await this.init();

		const expenses = await this.db!.expenses.find(query).exec();
		return expenses.map(e => e.toJSON());
	}

	/**
	 * Get vault by ID
	 */
	async getVault(vaultId: string) {
		if (!this.db) await this.init();

		const vault = await this.db!.vaults.findOne(vaultId).exec();
		return vault ? vault.toJSON() : null;
	}

	// Getters for reactive state
	get isInitialized() {
		return this.initialized;
	}

	get isSyncing() {
		return this.syncing;
	}

	get allVaults() {
		return this.vaults;
	}

	get allExpenses() {
		return this.expenses;
	}
}

// Export singleton instance
export const localDB = new LocalDBStore();
