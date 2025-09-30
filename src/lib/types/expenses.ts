// Type definitions for expense-related objects

export interface CategoryGroup {
	id: string;
	name: string;
	icon?: string;
	iconType?: 'emoji' | 'phosphor';
	color: string;
}

export interface Category {
	id: string;
	name: string;
	color: string;
	icon?: string;
	iconType?: 'emoji' | 'phosphor';
	group?: CategoryGroup | null;
}

export interface Vault {
	id: string;
	name: string;
	color: string;
	icon?: string;
	iconType?: 'emoji' | 'phosphor';
	isPersonal: boolean;
}

export interface Expense {
	id: string;
    note: string|null;
	amount: number;
	date: string; // ISO string format like other audit fields
	createdAt: string | null;
	vaultId?: string;
	vault?: Vault | null;
	category?: Category | null;
	creator?: {
		id: string;
		firstName?: string;
		lastName?: string;
		email: string;
	} | null;
}

export interface ExpensesResponse {
	expenses: Expense[];
	pagination: {
		page: number;
		limit: number;
		total: number;
		pages: number;
	};
}

export interface ExpenseSummaryItem {
	categoryName: string | null;
	categoryColor: string | null;
	total: number;
}

export interface ExpensesSummary {
	summary: ExpenseSummaryItem[];
	totalAmount: number;
}

export interface GetExpensesOptions {
	page?: number;
	limit?: number;
	categoryId?: string;
	startDate?: string;
	endDate?: string;
	vaultId?: string;
}

export interface GetExpensesSummaryOptions {
	startDate?: string;
	endDate?: string;
}