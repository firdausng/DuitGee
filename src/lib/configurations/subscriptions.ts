export type SubscriptionTier = 'free' | 'premium';

export interface SubscriptionLimits {
	maxVaults: number;
	maxBudgets: number;
}

export interface SubscriptionConfig {
	tier: SubscriptionTier;
	name: string;
	limits: SubscriptionLimits;
}

export const SUBSCRIPTION_CONFIGS: Record<SubscriptionTier, SubscriptionConfig> = {
	free: {
		tier: 'free',
		name: 'Free',
		limits: {
			maxVaults: 1,
			maxBudgets: 1
		}
	},
	premium: {
		tier: 'premium',
		name: 'Premium',
		limits: {
			maxVaults: -1, // -1 indicates unlimited
			maxBudgets: -1
		}
	}
};

/**
 * Get subscription configuration for a tier
 */
export function getSubscriptionConfig(tier: SubscriptionTier): SubscriptionConfig {
	return SUBSCRIPTION_CONFIGS[tier];
}

/**
 * Check if user has reached vault limit
 */
export function canCreateVault(tier: SubscriptionTier, currentVaultCount: number): boolean {
	const config = getSubscriptionConfig(tier);
	if (config.limits.maxVaults === -1) return true; // Unlimited
	return currentVaultCount < config.limits.maxVaults;
}

/**
 * Check if user has reached budget limit
 */
export function canCreateBudget(tier: SubscriptionTier, currentBudgetCount: number): boolean {
	const config = getSubscriptionConfig(tier);
	if (config.limits.maxBudgets === -1) return true; // Unlimited
	return currentBudgetCount < config.limits.maxBudgets;
}

/**
 * Get remaining vault slots for a user
 */
export function getRemainingVaults(tier: SubscriptionTier, currentVaultCount: number): number {
	const config = getSubscriptionConfig(tier);
	if (config.limits.maxVaults === -1) return -1; // Unlimited
	return Math.max(0, config.limits.maxVaults - currentVaultCount);
}

/**
 * Get remaining budget slots for a user
 */
export function getRemainingBudgets(tier: SubscriptionTier, currentBudgetCount: number): number {
	const config = getSubscriptionConfig(tier);
	if (config.limits.maxBudgets === -1) return -1; // Unlimited
	return Math.max(0, config.limits.maxBudgets - currentBudgetCount);
}
