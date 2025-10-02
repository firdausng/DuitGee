import { getDatabase } from './rxdb-database';
import type { RxDBDatabase, ExpenseDocument, VaultDocument } from './rxdb-database';
import { authManager } from '$lib/stores/current-session.svelte';

/**
 * Sync Manager for RxDB <-> Backend synchronization
 */
export class SyncManager {
	private db: RxDBDatabase | null = null;
	private syncInterval: ReturnType<typeof setInterval> | null = null;
	private isSyncing = false;

	async init() {
		this.db = await getDatabase();
		console.log('[SyncManager] Initialized');
	}

	/**
	 * Start automatic background sync
	 */
	startAutoSync(intervalMs: number = 30000) {
		if (this.syncInterval) {
			return;
		}

		console.log(`[SyncManager] Starting auto-sync every ${intervalMs}ms`);
		this.syncInterval = setInterval(() => {
			this.syncAll();
		}, intervalMs);

		// Initial sync
		this.syncAll();
	}

	/**
	 * Stop automatic sync
	 */
	stopAutoSync() {
		if (this.syncInterval) {
			clearInterval(this.syncInterval);
			this.syncInterval = null;
			console.log('[SyncManager] Auto-sync stopped');
		}
	}

	/**
	 * Sync all collections
	 */
	async syncAll() {
		if (this.isSyncing) {
			console.log('[SyncManager] Sync already in progress, skipping');
			return;
		}

		this.isSyncing = true;
		console.log('[SyncManager] Starting full sync...');

		try {
			await Promise.all([this.syncVaults(), this.syncExpenses()]);
			console.log('[SyncManager] Full sync completed');
		} catch (error) {
			console.error('[SyncManager] Sync failed:', error);
		} finally {
			this.isSyncing = false;
		}
	}

	/**
	 * Sync vaults from backend to local DB
	 */
	async syncVaults() {
		if (!this.db) await this.init();

		const token = authManager.authState?.accessToken;
		if (!token) {
			console.warn('[SyncManager] No auth token, skipping vault sync');
			return;
		}

		try {
			console.log('[SyncManager] Syncing vaults...');

			const response = await fetch('/api/vaults', {
				headers: {
					Authorization: `Bearer ${token}`
				}
			});

			if (!response.ok) {
				throw new Error(`Failed to fetch vaults: ${response.statusText}`);
			}

			const result = await response.json();
			const vaults = result.data || [];

			// Upsert vaults into local DB
			for (const userVault of vaults) {
				const vault = userVault.vault;
				const vaultDoc: VaultDocument = {
					id: vault.id,
					name: vault.name,
					description: vault.description,
					color: vault.color,
					icon: vault.icon,
					iconType: vault.iconType,
					isPersonal: vault.isPersonal,
					ownerId: vault.ownerId,
					createdAt: vault.createdAt,
					updatedAt: vault.updatedAt || vault.createdAt,
					createdBy: vault.createdBy || vault.ownerId,
					_syncedAt: new Date().toISOString(),
					_pendingSync: false
				};

				await this.db!.vaults.upsert(vaultDoc);

				// Sync vault members
				if (userVault.membership) {
					await this.db!.vault_members.upsert({
						id: `${vault.id}_${userVault.owner.id}`,
						vaultId: vault.id,
						userId: userVault.owner.id,
						role: userVault.membership.role,
						permissions: userVault.membership.permissions,
						status: userVault.membership.status,
						joinedAt: userVault.membership.joinedAt,
						updatedAt: new Date().toISOString(),
						_syncedAt: new Date().toISOString(),
						_pendingSync: false
					});
				}
			}

			console.log(`[SyncManager] Synced ${vaults.length} vaults`);
		} catch (error) {
			console.error('[SyncManager] Vault sync error:', error);
		}
	}

	/**
	 * Sync expenses for a specific vault
	 */
	async syncExpenses(vaultId?: string) {
		if (!this.db) await this.init();

		const token = authManager.authState?.accessToken;
		if (!token) {
			console.warn('[SyncManager] No auth token, skipping expense sync');
			return;
		}

		try {
			console.log(`[SyncManager] Syncing expenses${vaultId ? ` for vault ${vaultId}` : ''}...`);

			// If no vaultId specified, sync all vaults
			if (!vaultId) {
				const vaults = await this.db!.vaults.find().exec();
				for (const vault of vaults) {
					await this.syncExpenses(vault.id);
				}
				return;
			}

			const response = await fetch(`/api/expenses/vaults/${vaultId}/expenses?limit=1000`, {
				headers: {
					Authorization: `Bearer ${token}`
				}
			});

			if (!response.ok) {
				throw new Error(`Failed to fetch expenses: ${response.statusText}`);
			}

			const result = await response.json();
			const expenses = result.data || [];

			// Upsert expenses into local DB
			for (const expense of expenses) {
				const expenseDoc: ExpenseDocument = {
					id: expense.id,
					vaultId: expense.vaultId,
					userId: expense.userId,
					categoryId: expense.categoryId,
					amount: expense.amount,
					note: expense.note,
					date: expense.date,
					createdAt: expense.createdAt,
					updatedAt: expense.updatedAt,
					createdBy: expense.createdBy,
					updatedBy: expense.updatedBy,
					deletedAt: expense.deletedAt,
					deletedBy: expense.deletedBy,
					_syncedAt: new Date().toISOString(),
					_pendingSync: false
				};

				await this.db!.expenses.upsert(expenseDoc);
			}

			console.log(`[SyncManager] Synced ${expenses.length} expenses for vault ${vaultId}`);
		} catch (error) {
			console.error('[SyncManager] Expense sync error:', error);
		}
	}

	/**
	 * Push local changes to backend
	 */
	async pushPendingChanges() {
		if (!this.db) await this.init();

		const token = authManager.authState?.accessToken;
		if (!token) {
			console.warn('[SyncManager] No auth token, skipping push');
			return;
		}

		try {
			// Find all pending expenses
			const pendingExpenses = await this.db!.expenses
				.find({
					selector: {
						_pendingSync: true
					}
				})
				.exec();

			console.log(`[SyncManager] Pushing ${pendingExpenses.length} pending expenses...`);

			for (const expense of pendingExpenses) {
				try {
					const expenseData = expense.toJSON();

					// Determine if this is a new expense or update
					const isNew = !expenseData._syncedAt;

					const endpoint = isNew
						? `/api/expenses/vaults/${expenseData.vaultId}/expenses`
						: `/api/expenses/vaults/${expenseData.vaultId}/expenses/${expenseData.id}`;

					const method = isNew ? 'POST' : 'PUT';

					const response = await fetch(endpoint, {
						method,
						headers: {
							Authorization: `Bearer ${token}`,
							'Content-Type': 'application/json'
						},
						body: JSON.stringify({
							amount: expenseData.amount,
							categoryId: expenseData.categoryId,
							note: expenseData.note,
							date: expenseData.date
						})
					});

					if (response.ok) {
						// Mark as synced
						await expense.update({
							$set: {
								_syncedAt: new Date().toISOString(),
								_pendingSync: false
							}
						});
						console.log(`[SyncManager] Pushed expense ${expenseData.id}`);
					} else {
						console.error(`[SyncManager] Failed to push expense ${expenseData.id}:`, response.statusText);
					}
				} catch (error) {
					console.error(`[SyncManager] Error pushing expense:`, error);
				}
			}
		} catch (error) {
			console.error('[SyncManager] Push error:', error);
		}
	}
}

// Export singleton instance
export const syncManager = new SyncManager();
