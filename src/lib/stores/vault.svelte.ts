interface VaultInfo {
	id: string;
	name: string;
	description?: string;
	color: string;
	icon: string;
	iconType: 'emoji' | 'phosphor';
	isPersonal: boolean;
	role?: 'owner' | 'admin' | 'member';
}

interface VaultStore {
	currentVault: VaultInfo | null;
	availableVaults: VaultInfo[];
	isLoading: boolean;
}

let vaultStore = $state<VaultStore>({
	currentVault: null,
	availableVaults: [],
	isLoading: false
});

export function useVaultStore() {
	return {
		get currentVault() { return vaultStore.currentVault; },
		get availableVaults() { return vaultStore.availableVaults; },
		get isLoading() { return vaultStore.isLoading; },

		setCurrentVault(vault: VaultInfo | null) {
			vaultStore.currentVault = vault;
		},

		setAvailableVaults(vaults: VaultInfo[]) {
			vaultStore.availableVaults = vaults;
		},

		setLoading(loading: boolean) {
			vaultStore.isLoading = loading;
		},

		updateVault(vault: VaultInfo) {
			const index = vaultStore.availableVaults.findIndex(v => v.id === vault.id);
			if (index !== -1) {
				vaultStore.availableVaults[index] = vault;
			}
			if (vaultStore.currentVault?.id === vault.id) {
				vaultStore.currentVault = vault;
			}
		}
	};
}