// Vault-related type definitions

export interface VaultDetails {
	id: string;
	name: string;
	description: string | null;
	color: string;
	icon: string | null;
	iconType: string | null;
	isPersonal: boolean;
	ownerId: string;
	createdAt: string | null;
}

export interface VaultOwner {
	id: string;
	firstName: string | null;
	lastName: string | null;
	email: string;
}

export interface VaultMembership {
	role: string | null;
	permissions: string | null;
	status: string | null;
	joinedAt: string | null;
}

export interface UserVault {
	vault: VaultDetails;
	owner: VaultOwner;
	membership: VaultMembership;
}

// Statistics for vaults (if needed)
export interface VaultStats {
	totalExpenses: number;
	totalAmount: number;
	avgAmount: number;
}

// Extended vault with stats
export interface UserVaultWithStats extends UserVault {
	stats?: VaultStats;
}

// For vault creation/updates
export interface CreateVaultData {
	name: string;
	description?: string;
	color: string;
	icon?: string;
	iconType?: 'emoji' | 'phosphor';
	isPersonal: boolean;
}

export interface UpdateVaultData extends Partial<CreateVaultData> {
	// All fields are optional for updates
}

// Vault member management
export interface VaultMember {
	id: string;
	vaultId: string;
	userId: string;
	role: 'owner' | 'admin' | 'member';
	permissions: 'owner' | 'admin' | 'member';
	invitedBy?: string;
	status: 'pending' | 'active' | 'declined' | 'removed';
	invitedAt?: string;
	joinedAt?: string;
	user?: {
		id: string;
		firstName?: string;
		lastName?: string;
		email: string;
	};
}

// Vault access permissions
export type VaultPermission =
	| 'canRead'
	| 'canCreateExpenses'
	| 'canEditExpenses'
	| 'canDeleteExpenses'
	| 'canManageCategories'
	| 'canManageMembers'
	| 'canEditVault'
	| 'canDeleteVault';

// Vault invitation
export interface VaultInvitation {
	email: string;
	role: 'admin' | 'member';
}