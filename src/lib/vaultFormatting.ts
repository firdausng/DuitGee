/**
 * Vault-specific formatting utilities
 *
 * This module provides helper functions that automatically use a vault's
 * locale and currency settings for formatting operations.
 */

import { formatCurrency, formatDate, formatDateTime } from './utils';
import type { Vault } from './schemas/vaults';

/**
 * Creates formatting functions bound to a specific vault's locale settings
 *
 * @param vault - The vault object containing locale and currency settings
 * @returns Object with formatting functions pre-configured for the vault
 *
 * @example
 * const { currency, date, dateTime } = createVaultFormatters(vault);
 * currency(1234.56) // Uses vault's locale and currency
 * date("2025-12-08T10:30:00.000Z") // Uses vault's locale
 */
export function createVaultFormatters(vault: Pick<Vault, 'locale' | 'currency'>) {
	const locale = vault.locale || 'en-US';
	const currency = vault.currency || 'USD';

	return {
		/**
		 * Format amount using vault's locale and currency
		 * @param amount - Amount to format
		 * @param decimals - Number of decimal places (default: 2)
		 */
		currency: (amount: number, decimals = 2) =>
			formatCurrency(amount, decimals, locale, currency),

		/**
		 * Format date using vault's locale
		 * @param dateString - ISO date string
		 */
		date: (dateString: string) =>
			formatDate(dateString, locale),

		/**
		 * Format date and time using vault's locale
		 * @param dateString - ISO date string
		 */
		dateTime: (dateString: string) =>
			formatDateTime(dateString, locale),

		/**
		 * Get vault's locale
		 */
		getLocale: () => locale,

		/**
		 * Get vault's currency code
		 */
		getCurrency: () => currency,
	};
}

/**
 * Format currency with vault context
 * Convenience function for one-off formatting without creating formatter object
 *
 * @param amount - Amount to format
 * @param vault - Vault object or locale/currency object
 * @param decimals - Number of decimal places (default: 2)
 *
 * @example
 * formatVaultCurrency(1234.56, vault) // "Rp 1.234.567" (if vault uses id-ID/IDR)
 */
export function formatVaultCurrency(
	amount: number,
	vault: Pick<Vault, 'locale' | 'currency'>,
	decimals = 2
): string {
	return formatCurrency(
		amount,
		decimals,
		vault.locale || 'en-US',
		vault.currency || 'USD'
	);
}

/**
 * Format date with vault context
 * Convenience function for one-off formatting without creating formatter object
 *
 * @param dateString - ISO date string
 * @param vault - Vault object or locale object
 *
 * @example
 * formatVaultDate("2025-12-08T10:30:00.000Z", vault) // "8 Des 2025" (if vault uses id-ID)
 */
export function formatVaultDate(
	dateString: string,
	vault: Pick<Vault, 'locale'>
): string {
	return formatDate(dateString, vault.locale || 'en-US');
}

/**
 * Format date and time with vault context
 * Convenience function for one-off formatting without creating formatter object
 *
 * @param dateString - ISO date string
 * @param vault - Vault object or locale object
 *
 * @example
 * formatVaultDateTime("2025-12-08T10:30:00.000Z", vault) // "8 Des 2025 10.30" (if vault uses id-ID)
 */
export function formatVaultDateTime(
	dateString: string,
	vault: Pick<Vault, 'locale'>
): string {
	return formatDateTime(dateString, vault.locale || 'en-US');
}
