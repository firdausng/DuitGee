/**
 * Supported locales and currencies configuration
 * BCP 47 language tags: https://en.wikipedia.org/wiki/IETF_language_tag
 * ISO 4217 currency codes: https://en.wikipedia.org/wiki/ISO_4217
 */

export interface LocaleOption {
	value: string; // BCP 47 language tag
	label: string; // Display name
	currency: string; // Default ISO 4217 currency code
}

export const localeOptions: LocaleOption[] = [
	// English locales
	{ value: 'en-US', label: 'English (United States)', currency: 'USD' },
	{ value: 'en-GB', label: 'English (United Kingdom)', currency: 'GBP' },
	{ value: 'en-AU', label: 'English (Australia)', currency: 'AUD' },
	{ value: 'en-CA', label: 'English (Canada)', currency: 'CAD' },
	{ value: 'en-SG', label: 'English (Singapore)', currency: 'SGD' },

	// Asian locales
	{ value: 'id-ID', label: 'Bahasa Indonesia', currency: 'IDR' },
	{ value: 'ms-MY', label: 'Bahasa Melayu', currency: 'MYR' },
	{ value: 'ja-JP', label: '日本語 (Japanese)', currency: 'JPY' },
	{ value: 'ko-KR', label: '한국어 (Korean)', currency: 'KRW' },
	{ value: 'zh-CN', label: '简体中文 (Simplified Chinese)', currency: 'CNY' },
	{ value: 'zh-TW', label: '繁體中文 (Traditional Chinese)', currency: 'TWD' },
	{ value: 'th-TH', label: 'ไทย (Thai)', currency: 'THB' },
	{ value: 'vi-VN', label: 'Tiếng Việt (Vietnamese)', currency: 'VND' },
	{ value: 'fil-PH', label: 'Filipino', currency: 'PHP' },

	// European locales
	{ value: 'de-DE', label: 'Deutsch (German)', currency: 'EUR' },
	{ value: 'fr-FR', label: 'Français (French)', currency: 'EUR' },
	{ value: 'es-ES', label: 'Español (Spanish)', currency: 'EUR' },
	{ value: 'it-IT', label: 'Italiano (Italian)', currency: 'EUR' },
	{ value: 'nl-NL', label: 'Nederlands (Dutch)', currency: 'EUR' },
	{ value: 'pt-PT', label: 'Português (Portuguese)', currency: 'EUR' },
	{ value: 'pt-BR', label: 'Português (Brasil)', currency: 'BRL' },
	{ value: 'ru-RU', label: 'Русский (Russian)', currency: 'RUB' },
	{ value: 'pl-PL', label: 'Polski (Polish)', currency: 'PLN' },
	{ value: 'tr-TR', label: 'Türkçe (Turkish)', currency: 'TRY' },

	// Middle East & Africa
	{ value: 'ar-SA', label: 'العربية (Arabic)', currency: 'SAR' },
	{ value: 'he-IL', label: 'עברית (Hebrew)', currency: 'ILS' },
	{ value: 'sw-KE', label: 'Kiswahili', currency: 'KES' },

	// Other
	{ value: 'hi-IN', label: 'हिन्दी (Hindi)', currency: 'INR' },
];

export const currencyOptions = [
	// Major currencies
	{ value: 'USD', label: 'USD - US Dollar', symbol: '$' },
	{ value: 'EUR', label: 'EUR - Euro', symbol: '€' },
	{ value: 'GBP', label: 'GBP - British Pound', symbol: '£' },
	{ value: 'JPY', label: 'JPY - Japanese Yen', symbol: '¥' },

	// Asian currencies
	{ value: 'IDR', label: 'IDR - Indonesian Rupiah', symbol: 'Rp' },
	{ value: 'MYR', label: 'MYR - Malaysian Ringgit', symbol: 'RM' },
	{ value: 'SGD', label: 'SGD - Singapore Dollar', symbol: 'S$' },
	{ value: 'THB', label: 'THB - Thai Baht', symbol: '฿' },
	{ value: 'PHP', label: 'PHP - Philippine Peso', symbol: '₱' },
	{ value: 'VND', label: 'VND - Vietnamese Dong', symbol: '₫' },
	{ value: 'KRW', label: 'KRW - South Korean Won', symbol: '₩' },
	{ value: 'CNY', label: 'CNY - Chinese Yuan', symbol: '¥' },
	{ value: 'HKD', label: 'HKD - Hong Kong Dollar', symbol: 'HK$' },
	{ value: 'TWD', label: 'TWD - Taiwan Dollar', symbol: 'NT$' },
	{ value: 'INR', label: 'INR - Indian Rupee', symbol: '₹' },

	// Other currencies
	{ value: 'AUD', label: 'AUD - Australian Dollar', symbol: 'A$' },
	{ value: 'CAD', label: 'CAD - Canadian Dollar', symbol: 'C$' },
	{ value: 'CHF', label: 'CHF - Swiss Franc', symbol: 'CHF' },
	{ value: 'BRL', label: 'BRL - Brazilian Real', symbol: 'R$' },
	{ value: 'RUB', label: 'RUB - Russian Ruble', symbol: '₽' },
	{ value: 'ZAR', label: 'ZAR - South African Rand', symbol: 'R' },
	{ value: 'NZD', label: 'NZD - New Zealand Dollar', symbol: 'NZ$' },
	{ value: 'MXN', label: 'MXN - Mexican Peso', symbol: 'MX$' },
	{ value: 'AED', label: 'AED - UAE Dirham', symbol: 'د.إ' },
	{ value: 'SAR', label: 'SAR - Saudi Riyal', symbol: '﷼' },
	{ value: 'PLN', label: 'PLN - Polish Zloty', symbol: 'zł' },
	{ value: 'TRY', label: 'TRY - Turkish Lira', symbol: '₺' },
	{ value: 'KES', label: 'KES - Kenyan Shilling', symbol: 'KSh' },
	{ value: 'ILS', label: 'ILS - Israeli Shekel', symbol: '₪' },
];

// Helper function to get currency for a locale
export function getDefaultCurrency(locale: string): string {
	const found = localeOptions.find(opt => opt.value === locale);
	return found?.currency || 'USD';
}

// Helper function to get locale label
export function getLocaleLabel(locale: string): string {
	const found = localeOptions.find(opt => opt.value === locale);
	return found?.label || locale;
}

// Helper function to get currency label
export function getCurrencyLabel(currency: string): string {
	const found = currencyOptions.find(opt => opt.value === currency);
	return found?.label || currency;
}
