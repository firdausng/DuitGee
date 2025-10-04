<script lang="ts">
	import { formatCurrency } from '$lib/utils';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Select from '$lib/components/ui/Select.svelte';
	import { goto } from '$app/navigation';
	import MagnifyingGlass from 'phosphor-svelte/lib/MagnifyingGlass';
	import ChartBar from 'phosphor-svelte/lib/ChartBar';
	import X from 'phosphor-svelte/lib/X';
	import Faders from 'phosphor-svelte/lib/Faders';
	import ArrowsLeftRight from 'phosphor-svelte/lib/ArrowsLeftRight';
	import TrendUp from 'phosphor-svelte/lib/TrendUp';
	import TrendDown from 'phosphor-svelte/lib/TrendDown';

	let { data } = $props();

	// FAB dropdown state
	let showFabDropdown = $state(false);
	let activeFabTab = $state<'filters' | 'compare'>('filters');

	// Main page tab state
	let activePageTab = $state<'filters' | 'compare'>('filters');

	// Filter state - all reactive
	let filterTag = $state('');
	let filterCategory = $state('');
	let filterNote = $state('');
	let filterMember = $state('');
	let timePeriod = $state('all');

	// Comparison state
	let showComparison = $state(false);
	let comparisonMode = $state<'period' | 'date'>('period');
	let comparePeriod1 = $state('monthly');
	let comparePeriod2 = $state('monthly');
	let compareDate1Start = $state('');
	let compareDate1End = $state('');
	let compareDate2Start = $state('');
	let compareDate2End = $state('');

	// Reactive filtered expenses
	const filteredExpenses = $derived.by(() => {
		let result = data.expenses;

		if (filterCategory) {
			result = result.filter(expense =>
				expense.category?.id === filterCategory
			);
		}

		if (filterNote) {
			result = result.filter(expense =>
				expense.note?.toLowerCase().includes(filterNote.toLowerCase())
			);
		}

		if (filterMember) {
			result = result.filter(expense => {
				if (filterMember === 'vault') {
					return !expense.creator;
				}
				return expense.creator?.id === filterMember;
			});
		}

		// Apply time period filter
		if (timePeriod !== 'all') {
			const now = new Date();
			const startDate = new Date();

			switch (timePeriod) {
				case 'daily':
					startDate.setHours(0, 0, 0, 0);
					break;
				case 'weekly':
					startDate.setDate(now.getDate() - 7);
					break;
				case 'monthly':
					startDate.setMonth(now.getMonth() - 1);
					break;
				case 'yearly':
					startDate.setFullYear(now.getFullYear() - 1);
					break;
			}

			if (timePeriod !== 'all') {
				result = result.filter(expense => {
					const expenseDate = new Date(expense.date);
					return expenseDate >= startDate;
				});
			}
		}

		return result;
	});

	// Available filter options based on current filters and data
	const availableCategories = $derived.by(() => {
		let expenses = data.expenses;

		// Apply other filters first
		if (filterNote) {
			expenses = expenses.filter(expense =>
				expense.note?.toLowerCase().includes(filterNote.toLowerCase())
			);
		}
		if (filterMember) {
			expenses = expenses.filter(expense =>
				expense.creator?.id === filterMember
			);
		}

		// Get unique category IDs
		const categoryIds = new Set(
			expenses
				.filter(e => e.category?.id)
				.map(e => e.category!.id)
		);

		return data.categories.filter(cat => categoryIds.has(cat.id));
	});

	const availableTags = $derived.by(() => {
		let expenses = data.expenses;

		// Apply other filters first
		if (filterCategory) {
			expenses = expenses.filter(expense =>
				expense.category?.id === filterCategory
			);
		}
		if (filterNote) {
			expenses = expenses.filter(expense =>
				expense.note?.toLowerCase().includes(filterNote.toLowerCase())
			);
		}
		if (filterMember) {
			expenses = expenses.filter(expense =>
				expense.creator?.id === filterMember
			);
		}

		// Get unique tag names
		const tagNames = new Set<string>();
		expenses.forEach(expense => {
			expense.tags?.forEach(tag => tagNames.add(tag.name));
		});

		return data.tags.filter(tag => tagNames.has(tag.name));
	});

	const availableMembers = $derived.by(() => {
		let expenses = data.expenses;

		// Apply other filters first
		if (filterCategory) {
			expenses = expenses.filter(expense =>
				expense.category?.id === filterCategory
			);
		}
		if (filterTag) {
			expenses = expenses.filter(expense =>
				expense.tags?.some(tag => tag.name === filterTag)
			);
		}
		if (filterNote) {
			expenses = expenses.filter(expense =>
				expense.note?.toLowerCase().includes(filterNote.toLowerCase())
			);
		}

		// Get unique member IDs
		const memberIds = new Set(
			expenses
				.filter(e => e.creator?.id)
				.map(e => e.creator!.id)
		);

		// Check if there are vault expenses (no creator)
		const hasVaultExpenses = expenses.some(e => !e.creator);

		const members = data.members.filter(member => memberIds.has(member.userId));

		// Add vault option if there are vault expenses
		if (hasVaultExpenses) {
			return [
				{ userId: 'vault', firstName: 'Vault', lastName: undefined, email: '', role: 'vault', status: 'active' },
				...members
			];
		}

		return members;
	});

	// Calculate statistics reactively
	const statistics = $derived.by(() => {
		const totalAmount = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
		const totalExpenses = filteredExpenses.length;
		const averageAmount = totalExpenses > 0 ? totalAmount / totalExpenses : 0;

		// Group by category
		const categoryStats = new Map<string, { name: string; color: string; icon?: string; iconType?: string; amount: number; count: number }>();
		filteredExpenses.forEach(expense => {
			if (expense.category) {
				const existing = categoryStats.get(expense.category.id) || {
					name: expense.category.name,
					color: expense.category.color,
					icon: expense.category.icon,
					iconType: expense.category.iconType,
					amount: 0,
					count: 0
				};
				existing.amount += expense.amount;
				existing.count += 1;
				categoryStats.set(expense.category.id, existing);
			}
		});

		// Group by tag
		const tagStats = new Map<string, { name: string; amount: number; count: number }>();
		filteredExpenses.forEach(expense => {
			if (expense.tags && expense.tags.length > 0) {
				expense.tags.forEach(tag => {
					const existing = tagStats.get(tag.name) || {
						name: tag.name,
						amount: 0,
						count: 0
					};
					existing.amount += expense.amount;
					existing.count += 1;
					tagStats.set(tag.name, existing);
				});
			}
		});

		// Group by note to find duplicates
		const noteStats = new Map<string, Array<typeof filteredExpenses[0]>>();
		filteredExpenses.forEach(expense => {
			if (expense.note && expense.note.trim()) {
				const note = expense.note.trim();
				if (!noteStats.has(note)) {
					noteStats.set(note, []);
				}
				noteStats.get(note)!.push(expense);
			}
		});

		// Filter to only duplicates (notes with 2+ expenses)
		const duplicateNotes = Array.from(noteStats.entries())
			.filter(([_, expenses]) => expenses.length > 1)
			.map(([note, expenses]) => ({
				note,
				count: expenses.length,
				amount: expenses.reduce((sum, e) => sum + e.amount, 0),
				expenses
			}))
			.sort((a, b) => b.count - a.count);

		// Group by time period
		const timeStats = new Map<string, { amount: number; count: number }>();
		filteredExpenses.forEach(expense => {
			const date = new Date(expense.date);
			let key: string;

			switch (timePeriod) {
				case 'daily':
					key = date.toISOString().split('T')[0];
					break;
				case 'weekly':
					const weekStart = new Date(date);
					weekStart.setDate(date.getDate() - date.getDay());
					key = weekStart.toISOString().split('T')[0];
					break;
				case 'monthly':
					key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
					break;
				case 'yearly':
					key = `${date.getFullYear()}`;
					break;
				default:
					key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
			}

			const existing = timeStats.get(key) || { amount: 0, count: 0 };
			existing.amount += expense.amount;
			existing.count += 1;
			timeStats.set(key, existing);
		});

		return {
			total: totalAmount,
			count: totalExpenses,
			average: averageAmount,
			byCategory: Array.from(categoryStats.entries())
				.map(([id, stats]) => ({ id, ...stats }))
				.sort((a, b) => b.amount - a.amount),
			byTag: Array.from(tagStats.entries())
				.map(([name, stats]) => stats)
				.sort((a, b) => b.amount - a.amount),
			byTime: Array.from(timeStats.entries())
				.map(([period, stats]) => ({ period, ...stats }))
				.sort((a, b) => a.period.localeCompare(b.period)),
			duplicateNotes
		};
	});

	// Calculate percentages for category distribution
	const categoryChartData = $derived(
		statistics.byCategory.map(cat => ({
			...cat,
			percentage: statistics.total > 0 ? (cat.amount / statistics.total) * 100 : 0
		}))
	);

	// Calculate percentages for tag distribution
	const tagChartData = $derived(
		statistics.byTag.map(tag => ({
			...tag,
			percentage: statistics.total > 0 ? (tag.amount / statistics.total) * 100 : 0
		}))
	);

	// Generate colors for pie chart
	function generateColor(index: number, total: number): string {
		const hue = (index * 360) / total;
		return `hsl(${hue}, 70%, 60%)`;
	}

	// Calculate SVG pie chart path
	function getPieSlicePath(
		centerX: number,
		centerY: number,
		radius: number,
		startAngle: number,
		endAngle: number
	): string {
		const start = polarToCartesian(centerX, centerY, radius, endAngle);
		const end = polarToCartesian(centerX, centerY, radius, startAngle);
		const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

		return [
			'M', centerX, centerY,
			'L', start.x, start.y,
			'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y,
			'Z'
		].join(' ');
	}

	function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
		const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
		return {
			x: centerX + radius * Math.cos(angleInRadians),
			y: centerY + radius * Math.sin(angleInRadians)
		};
	}

	function clearFilters() {
		filterTag = '';
		filterCategory = '';
		filterNote = '';
		filterMember = '';
		timePeriod = 'all';
	}

	const hasActiveFilters = $derived(filterTag || filterCategory || filterNote || filterMember || timePeriod !== 'all');

	// Time period options
	const timePeriods = [
		{ value: 'all', label: 'All Time' },
		{ value: 'daily', label: 'Today' },
		{ value: 'weekly', label: 'Last 7 Days' },
		{ value: 'monthly', label: 'Last 30 Days' },
		{ value: 'yearly', label: 'Last Year' }
	];

	function formatTimePeriod(period: string, type: string): string {
		if (type === 'daily') {
			return new Date(period).toLocaleDateString();
		} else if (type === 'weekly') {
			return `Week of ${new Date(period).toLocaleDateString()}`;
		} else if (type === 'monthly') {
			const [year, month] = period.split('-');
			return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
		} else if (type === 'yearly') {
			return period;
		}
		return period;
	}

	// Comparison period calculations
	const comparisonData = $derived.by(() => {
		if (!showComparison) return null;

		const filterByDateRange = (expenses: typeof data.expenses, startDate: Date, endDate: Date) => {
			return expenses.filter(expense => {
				const expenseDate = new Date(expense.date);
				return expenseDate >= startDate && expenseDate <= endDate;
			});
		};

		const getDateRangeForPeriod = (periodType: string, offset: number = 0) => {
			const now = new Date();
			const start = new Date();
			const end = new Date();

			switch (periodType) {
				case 'daily':
					start.setDate(now.getDate() + offset);
					start.setHours(0, 0, 0, 0);
					end.setDate(now.getDate() + offset);
					end.setHours(23, 59, 59, 999);
					break;
				case 'weekly':
					start.setDate(now.getDate() - now.getDay() + (offset * 7));
					start.setHours(0, 0, 0, 0);
					end.setDate(start.getDate() + 6);
					end.setHours(23, 59, 59, 999);
					break;
				case 'monthly':
					start.setMonth(now.getMonth() + offset, 1);
					start.setHours(0, 0, 0, 0);
					end.setMonth(start.getMonth() + 1, 0);
					end.setHours(23, 59, 59, 999);
					break;
				case 'yearly':
					start.setFullYear(now.getFullYear() + offset, 0, 1);
					start.setHours(0, 0, 0, 0);
					end.setFullYear(start.getFullYear(), 11, 31);
					end.setHours(23, 59, 59, 999);
					break;
			}

			return { start, end };
		};

		let period1Expenses, period2Expenses;
		let period1Label, period2Label;

		if (comparisonMode === 'period') {
			const period1Range = getDateRangeForPeriod(comparePeriod1, 0);
			const period2Range = getDateRangeForPeriod(comparePeriod2, -1);

			period1Expenses = filterByDateRange(filteredExpenses, period1Range.start, period1Range.end);
			period2Expenses = filterByDateRange(filteredExpenses, period2Range.start, period2Range.end);

			const periodLabels = {
				daily: 'Today',
				weekly: 'This Week',
				monthly: 'This Month',
				yearly: 'This Year'
			};
			const prevPeriodLabels = {
				daily: 'Yesterday',
				weekly: 'Last Week',
				monthly: 'Last Month',
				yearly: 'Last Year'
			};

			period1Label = periodLabels[comparePeriod1 as keyof typeof periodLabels] || comparePeriod1;
			period2Label = prevPeriodLabels[comparePeriod2 as keyof typeof prevPeriodLabels] || comparePeriod2;
		} else {
			// Custom date range comparison
			if (compareDate1Start && compareDate1End && compareDate2Start && compareDate2End) {
				period1Expenses = filterByDateRange(
					filteredExpenses,
					new Date(compareDate1Start),
					new Date(compareDate1End)
				);
				period2Expenses = filterByDateRange(
					filteredExpenses,
					new Date(compareDate2Start),
					new Date(compareDate2End)
				);
				period1Label = `${new Date(compareDate1Start).toLocaleDateString()} - ${new Date(compareDate1End).toLocaleDateString()}`;
				period2Label = `${new Date(compareDate2Start).toLocaleDateString()} - ${new Date(compareDate2End).toLocaleDateString()}`;
			} else {
				return null;
			}
		}

		const calculateStats = (expenses: typeof filteredExpenses) => {
			const total = expenses.reduce((sum, e) => sum + e.amount, 0);
			const count = expenses.length;

			// Category breakdown
			const categoryMap = new Map<string, { name: string; color: string; amount: number; count: number }>();
			expenses.forEach(expense => {
				if (expense.category) {
					const existing = categoryMap.get(expense.category.id) || {
						name: expense.category.name,
						color: expense.category.color,
						amount: 0,
						count: 0
					};
					existing.amount += expense.amount;
					existing.count += 1;
					categoryMap.set(expense.category.id, existing);
				}
			});
			const categories = Array.from(categoryMap.entries()).map(([id, stats]) => ({ id, ...stats }));

			// Member breakdown
			const memberMap = new Map<string, { name: string; amount: number; count: number }>();
			expenses.forEach(expense => {
				const memberId = expense.creator?.id || 'vault';
				const existing = memberMap.get(memberId) || {
					name: expense.creator
						? (expense.creator.firstName && expense.creator.lastName
							? `${expense.creator.firstName} ${expense.creator.lastName}`
							: expense.creator.email)
						: 'Vault',
					amount: 0,
					count: 0
				};
				existing.amount += expense.amount;
				existing.count += 1;
				memberMap.set(memberId, existing);
			});
			const members = Array.from(memberMap.entries()).map(([id, stats]) => ({ id, ...stats }));

			return { total, count, categories, members };
		};

		const stats1 = calculateStats(period1Expenses);
		const stats2 = calculateStats(period2Expenses);

		const totalDiff = stats1.total - stats2.total;
		const totalDiffPercent = stats2.total > 0 ? ((totalDiff / stats2.total) * 100) : 0;
		const countDiff = stats1.count - stats2.count;
		const countDiffPercent = stats2.count > 0 ? ((countDiff / stats2.count) * 100) : 0;

		// Compare categories
		const allCategoryIds = new Set([
			...stats1.categories.map(c => c.id),
			...stats2.categories.map(c => c.id)
		]);
		const categoryComparisons = Array.from(allCategoryIds).map(id => {
			const cat1 = stats1.categories.find(c => c.id === id);
			const cat2 = stats2.categories.find(c => c.id === id);
			const amount1 = cat1?.amount || 0;
			const amount2 = cat2?.amount || 0;
			const diff = amount1 - amount2;
			const diffPercent = amount2 > 0 ? ((diff / amount2) * 100) : (amount1 > 0 ? 100 : 0);

			return {
				id,
				name: cat1?.name || cat2?.name || 'Unknown',
				color: cat1?.color || cat2?.color || '#gray',
				period1Amount: amount1,
				period2Amount: amount2,
				diff,
				diffPercent
			};
		}).sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff));

		// Compare members
		const allMemberIds = new Set([
			...stats1.members.map(m => m.id),
			...stats2.members.map(m => m.id)
		]);
		const memberComparisons = Array.from(allMemberIds).map(id => {
			const mem1 = stats1.members.find(m => m.id === id);
			const mem2 = stats2.members.find(m => m.id === id);
			const amount1 = mem1?.amount || 0;
			const amount2 = mem2?.amount || 0;
			const diff = amount1 - amount2;
			const diffPercent = amount2 > 0 ? ((diff / amount2) * 100) : (amount1 > 0 ? 100 : 0);

			return {
				id,
				name: mem1?.name || mem2?.name || 'Unknown',
				period1Amount: amount1,
				period2Amount: amount2,
				diff,
				diffPercent
			};
		}).sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff));

		return {
			period1: { ...stats1, label: period1Label, expenses: period1Expenses },
			period2: { ...stats2, label: period2Label, expenses: period2Expenses },
			diff: {
				total: totalDiff,
				totalPercent: totalDiffPercent,
				count: countDiff,
				countPercent: countDiffPercent
			},
			categoryComparisons,
			memberComparisons
		};
	});
</script>

<svelte:head>
	<title>Statistics - Expense Tracker</title>
</svelte:head>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
	<!-- Header -->
	<div class="mb-6">
		<div>
			<h1 class="text-3xl font-bold text-foreground font-display">Statistics</h1>
			<p class="mt-2 text-muted-foreground">Overview and insights of your expenses</p>
		</div>
	</div>

	<!-- Tab Navigation -->
	<div class="mb-6 hidden lg:block">
		<div class="border-b border-border">
			<div class="flex gap-4">
				<button
					onclick={() => { activePageTab = 'filters'; showComparison = false; }}
					class="px-4 py-3 text-sm font-medium transition-colors border-b-2 {activePageTab === 'filters' ? 'text-primary border-primary' : 'text-muted-foreground border-transparent hover:text-foreground hover:border-border'}"
				>
					<Faders class="w-4 h-4 inline-block mr-2" />
					Filters
				</button>
				<button
					onclick={() => { activePageTab = 'compare'; showComparison = true; }}
					class="px-4 py-3 text-sm font-medium transition-colors border-b-2 {activePageTab === 'compare' ? 'text-primary border-primary' : 'text-muted-foreground border-transparent hover:text-foreground hover:border-border'}"
				>
					<ArrowsLeftRight class="w-4 h-4 inline-block mr-2" />
					Compare Periods
				</button>
			</div>
		</div>
	</div>

	<!-- Filters Section (Desktop) -->
	{#if activePageTab === 'filters'}
		<div class="hidden lg:block bg-background rounded-lg border border-border shadow-sm p-6 mb-6">
		<div class="flex items-center justify-between mb-4">
			<h2 class="text-lg font-semibold text-foreground flex items-center gap-2">
				<MagnifyingGlass class="w-5 h-5" />
				Filters
			</h2>
			{#if hasActiveFilters}
				<Button onclick={clearFilters} variant="ghost" size="sm" class="text-xs">
					<X class="w-3 h-3 mr-1" />
					Clear All
				</Button>
			{/if}
		</div>

		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
			<div>
				<label for="category-filter" class="block text-sm font-medium text-foreground mb-2">
					Category {availableCategories.length > 0 ? `(${availableCategories.length})` : ''}
				</label>
				<Select id="category-filter" bind:value={filterCategory}>
					<option value="">All Categories</option>
					{#each availableCategories as category}
						<option value={category.id}>{category.name}</option>
					{/each}
				</Select>
			</div>

			<div>
				<label for="tag-filter" class="block text-sm font-medium text-foreground mb-2">
					Tag {availableTags.length > 0 ? `(${availableTags.length})` : ''}
				</label>
				<Select id="tag-filter" bind:value={filterTag}>
					<option value="">All Tags</option>
					{#each availableTags as tag}
						<option value={tag.name}>{tag.name}</option>
					{/each}
				</Select>
			</div>

			<div>
				<label for="member-filter" class="block text-sm font-medium text-foreground mb-2">
					Member {availableMembers.length > 0 ? `(${availableMembers.length})` : ''}
				</label>
				<Select id="member-filter" bind:value={filterMember}>
					<option value="">All Members</option>
					{#each availableMembers as member}
						<option value={member.userId}>
							{member.firstName && member.lastName
								? `${member.firstName} ${member.lastName}`
								: member.email}
							{member.role === 'owner' ? ' (Owner)' : ''}
						</option>
					{/each}
				</Select>
			</div>

			<div>
				<label for="note-filter" class="block text-sm font-medium text-foreground mb-2">
					Search Note
				</label>
				<Input
					id="note-filter"
					bind:value={filterNote}
					placeholder="Search in notes..."
				/>
			</div>

			<div>
				<label for="period-filter" class="block text-sm font-medium text-foreground mb-2">
					Time Period
				</label>
				<Select id="period-filter" bind:value={timePeriod}>
					{#each timePeriods as period}
						<option value={period.value}>{period.label}</option>
					{/each}
				</Select>
			</div>
		</div>

		{#if hasActiveFilters}
			<div class="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border">
				<span class="text-xs text-muted-foreground">Active filters:</span>
				{#if filterCategory}
					<button
						onclick={() => filterCategory = ''}
						class="inline-flex items-center gap-1 px-2 py-1 text-xs bg-accent rounded-md hover:bg-accent/80 transition-colors"
					>
						<span>Category: {data.categories.find(c => c.id === filterCategory)?.name}</span>
						<X class="w-3 h-3" />
					</button>
				{/if}
				{#if filterTag}
					<button
						onclick={() => filterTag = ''}
						class="inline-flex items-center gap-1 px-2 py-1 text-xs bg-accent rounded-md hover:bg-accent/80 transition-colors"
					>
						<span>Tag: {filterTag}</span>
						<X class="w-3 h-3" />
					</button>
				{/if}
				{#if filterMember}
					{@const member = data.members.find(m => m.userId === filterMember)}
					<button
						onclick={() => filterMember = ''}
						class="inline-flex items-center gap-1 px-2 py-1 text-xs bg-accent rounded-md hover:bg-accent/80 transition-colors"
					>
						<span>Member: {member?.firstName && member?.lastName ? `${member.firstName} ${member.lastName}` : member?.email}</span>
						<X class="w-3 h-3" />
					</button>
				{/if}
				{#if filterNote}
					<button
						onclick={() => filterNote = ''}
						class="inline-flex items-center gap-1 px-2 py-1 text-xs bg-accent rounded-md hover:bg-accent/80 transition-colors"
					>
						<span>Note: "{filterNote}"</span>
						<X class="w-3 h-3" />
					</button>
				{/if}
				{#if timePeriod !== 'all'}
					{@const periodLabel = timePeriods.find(p => p.value === timePeriod)?.label}
					<button
						onclick={() => timePeriod = 'all'}
						class="inline-flex items-center gap-1 px-2 py-1 text-xs bg-accent rounded-md hover:bg-accent/80 transition-colors"
					>
						<span>Period: {periodLabel}</span>
						<X class="w-3 h-3" />
					</button>
				{/if}
			</div>
		{/if}
	</div>
	{:else}
		<!-- Compare Section (Desktop) -->
		<div class="hidden lg:block bg-background rounded-lg border border-border shadow-sm p-4 sm:p-6 mb-6 touch-manipulation">
			<h2 class="text-base sm:text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
				<ArrowsLeftRight class="w-5 h-5" />
				Compare Periods
			</h2>

			<!-- Comparison Mode Toggle -->
			<div class="flex gap-2 mb-4">
				<Button
					onclick={() => comparisonMode = 'period'}
					variant={comparisonMode === 'period' ? 'default' : 'outline'}
					size="sm"
				>
					By Period
				</Button>
				<Button
					onclick={() => comparisonMode = 'date'}
					variant={comparisonMode === 'date' ? 'default' : 'outline'}
					size="sm"
				>
					Custom Dates
				</Button>
			</div>

			{#if comparisonMode === 'period'}
				<!-- Period Comparison -->
				<div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
					<div>
						<label class="block text-sm font-medium text-foreground mb-2">Period 1</label>
						<Select bind:value={comparePeriod1}>
							<option value="daily">Today</option>
							<option value="weekly">This Week</option>
							<option value="monthly">This Month</option>
							<option value="yearly">This Year</option>
						</Select>
					</div>
					<div>
						<label class="block text-sm font-medium text-foreground mb-2">Period 2 (Compare To)</label>
						<Select bind:value={comparePeriod2}>
							<option value="daily">Yesterday</option>
							<option value="weekly">Last Week</option>
							<option value="monthly">Last Month</option>
							<option value="yearly">Last Year</option>
						</Select>
					</div>
				</div>
			{:else}
				<!-- Custom Date Comparison -->
				<div class="space-y-4 mb-4">
					<div class="grid grid-cols-2 gap-2">
						<div>
							<label class="block text-sm font-medium text-foreground mb-2">Period 1 Start</label>
							<Input type="date" bind:value={compareDate1Start} />
						</div>
						<div>
							<label class="block text-sm font-medium text-foreground mb-2">Period 1 End</label>
							<Input type="date" bind:value={compareDate1End} />
						</div>
					</div>
					<div class="grid grid-cols-2 gap-2">
						<div>
							<label class="block text-sm font-medium text-foreground mb-2">Period 2 Start</label>
							<Input type="date" bind:value={compareDate2Start} />
						</div>
						<div>
							<label class="block text-sm font-medium text-foreground mb-2">Period 2 End</label>
							<Input type="date" bind:value={compareDate2End} />
						</div>
					</div>
				</div>
			{/if}

			<!-- Comparison Results -->
			{#if comparisonData}
				<div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
					<!-- Period 1 Stats -->
					<div class="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
						<div class="text-xs font-medium text-muted-foreground mb-2">{comparisonData.period1.label}</div>
						<div class="text-2xl font-bold text-foreground">{formatCurrency(comparisonData.period1.total)}</div>
						<div class="text-xs text-muted-foreground mt-1">{comparisonData.period1.count} expenses</div>
					</div>

					<!-- Period 2 Stats -->
					<div class="bg-purple-50 dark:bg-purple-950/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
						<div class="text-xs font-medium text-muted-foreground mb-2">{comparisonData.period2.label}</div>
						<div class="text-2xl font-bold text-foreground">{formatCurrency(comparisonData.period2.total)}</div>
						<div class="text-xs text-muted-foreground mt-1">{comparisonData.period2.count} expenses</div>
					</div>

					<!-- Difference -->
					<div class="bg-accent rounded-lg p-4 border border-border">
						<div class="text-xs font-medium text-muted-foreground mb-2">Difference</div>
						<div class="flex items-center gap-2">
							{#if comparisonData.diff.total > 0}
								<TrendUp class="w-5 h-5 text-red-500" weight="bold" />
								<div class="text-2xl font-bold text-red-500">+{formatCurrency(Math.abs(comparisonData.diff.total))}</div>
							{:else if comparisonData.diff.total < 0}
								<TrendDown class="w-5 h-5 text-green-500" weight="bold" />
								<div class="text-2xl font-bold text-green-500">-{formatCurrency(Math.abs(comparisonData.diff.total))}</div>
							{:else}
								<div class="text-2xl font-bold text-foreground">{formatCurrency(0)}</div>
							{/if}
						</div>
						<div class="text-xs text-muted-foreground mt-1">
							{comparisonData.diff.totalPercent > 0 ? '+' : ''}{comparisonData.diff.totalPercent.toFixed(1)}%
							({comparisonData.diff.count > 0 ? '+' : ''}{comparisonData.diff.count} expenses)
						</div>
					</div>
				</div>

				<!-- Detailed Comparisons -->
				<div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
					<!-- Category Comparison -->
					{#if comparisonData.categoryComparisons.length > 0}
						<div class="bg-background rounded-lg border border-border p-4">
							<h3 class="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
								<ChartBar class="w-4 h-4" />
								Category Spending Comparison
							</h3>
							<div class="space-y-3">
								{#each comparisonData.categoryComparisons.slice(0, 8) as category}
									<div class="space-y-1">
										<div class="flex items-center justify-between text-sm">
											<div class="flex items-center gap-2">
												<div
													class="w-3 h-3 rounded-full"
													style="background-color: {category.color}"
												></div>
												<span class="font-medium text-foreground">{category.name}</span>
											</div>
											<div class="flex items-center gap-2">
												{#if category.diff > 0}
													<TrendUp class="w-3 h-3 text-red-500" />
													<span class="text-xs text-red-500 font-medium">+{category.diffPercent.toFixed(0)}%</span>
												{:else if category.diff < 0}
													<TrendDown class="w-3 h-3 text-green-500" />
													<span class="text-xs text-green-500 font-medium">{category.diffPercent.toFixed(0)}%</span>
												{:else}
													<span class="text-xs text-muted-foreground">0%</span>
												{/if}
											</div>
										</div>
										<div class="grid grid-cols-2 gap-2 text-xs">
											<div class="bg-blue-50 dark:bg-blue-950/20 rounded px-2 py-1">
												<span class="text-muted-foreground">P1:</span>
												<span class="font-medium ml-1">{formatCurrency(category.period1Amount)}</span>
											</div>
											<div class="bg-purple-50 dark:bg-purple-950/20 rounded px-2 py-1">
												<span class="text-muted-foreground">P2:</span>
												<span class="font-medium ml-1">{formatCurrency(category.period2Amount)}</span>
											</div>
										</div>
										{#if category.diff !== 0}
											<div class="text-xs text-muted-foreground">
												Difference: <span class="font-medium {category.diff > 0 ? 'text-red-500' : 'text-green-500'}">
													{category.diff > 0 ? '+' : ''}{formatCurrency(category.diff)}
												</span>
											</div>
										{/if}
									</div>
								{/each}
							</div>
						</div>
					{/if}

					<!-- Member Comparison -->
					{#if comparisonData.memberComparisons.length > 0}
						<div class="bg-background rounded-lg border border-border p-4">
							<h3 class="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
								<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
								</svg>
								Member Spending Comparison
							</h3>
							<div class="space-y-3">
								{#each comparisonData.memberComparisons.slice(0, 8) as member}
									<div class="space-y-1">
										<div class="flex items-center justify-between text-sm">
											<span class="font-medium text-foreground truncate">{member.name}</span>
											<div class="flex items-center gap-2">
												{#if member.diff > 0}
													<TrendUp class="w-3 h-3 text-red-500" />
													<span class="text-xs text-red-500 font-medium">+{member.diffPercent.toFixed(0)}%</span>
												{:else if member.diff < 0}
													<TrendDown class="w-3 h-3 text-green-500" />
													<span class="text-xs text-green-500 font-medium">{member.diffPercent.toFixed(0)}%</span>
												{:else}
													<span class="text-xs text-muted-foreground">0%</span>
												{/if}
											</div>
										</div>
										<div class="grid grid-cols-2 gap-2 text-xs">
											<div class="bg-blue-50 dark:bg-blue-950/20 rounded px-2 py-1">
												<span class="text-muted-foreground">P1:</span>
												<span class="font-medium ml-1">{formatCurrency(member.period1Amount)}</span>
											</div>
											<div class="bg-purple-50 dark:bg-purple-950/20 rounded px-2 py-1">
												<span class="text-muted-foreground">P2:</span>
												<span class="font-medium ml-1">{formatCurrency(member.period2Amount)}</span>
											</div>
										</div>
										{#if member.diff !== 0}
											<div class="text-xs text-muted-foreground">
												Difference: <span class="font-medium {member.diff > 0 ? 'text-red-500' : 'text-green-500'}">
													{member.diff > 0 ? '+' : ''}{formatCurrency(member.diff)}
												</span>
											</div>
										{/if}
									</div>
								{/each}
							</div>
						</div>
					{/if}
				</div>
			{/if}
		</div>
	{/if}

	<!-- Summary Cards -->
	<div class="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6">
		<div class="bg-background rounded-lg border border-border shadow-sm p-4 sm:p-6 touch-manipulation">
			<div class="text-sm font-medium text-muted-foreground mb-2">Total Expenses</div>
			<div class="text-2xl sm:text-3xl font-bold text-foreground">{formatCurrency(statistics.total)}</div>
			<div class="text-xs text-muted-foreground mt-2">{statistics.count} transactions</div>
		</div>

		<div class="bg-background rounded-lg border border-border shadow-sm p-4 sm:p-6 touch-manipulation">
			<div class="text-sm font-medium text-muted-foreground mb-2">Categories</div>
			<div class="text-2xl sm:text-3xl font-bold text-foreground">{statistics.byCategory.length}</div>
			<div class="text-xs text-muted-foreground mt-2">with expenses</div>
		</div>
	</div>

	<!-- Category Distribution -->
	{#if statistics.byCategory.length > 0}
		<div class="bg-background rounded-lg border border-border shadow-sm p-4 sm:p-6 mb-6 touch-manipulation">
			<h2 class="text-base sm:text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
				<ChartBar class="w-5 h-5" />
				Expenses by Category
			</h2>

			<div class="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
				<!-- Pie Chart -->
				<div class="flex items-center justify-center py-4">
					<svg viewBox="0 0 200 200" class="w-full max-w-[280px] sm:max-w-[300px] touch-manipulation">
						{#each categoryChartData as category, index}
							{@const startAngle = categoryChartData
								.slice(0, index)
								.reduce((sum, c) => sum + (c.percentage * 3.6), 0)}
							{@const endAngle = startAngle + (category.percentage * 3.6)}
							<path
								d={getPieSlicePath(100, 100, 80, startAngle, endAngle)}
								fill={category.color}
								stroke="white"
								stroke-width="2"
								class="hover:opacity-80 active:opacity-70 transition-opacity cursor-pointer"
							>
								<title>{category.name}: {formatCurrency(category.amount)} ({category.percentage.toFixed(1)}%)</title>
							</path>
						{/each}
					</svg>
				</div>

				<!-- Bar Chart -->
				<div class="space-y-3 sm:space-y-4">
					{#each categoryChartData as category}
						<div>
							<div class="flex items-center justify-between mb-2">
								<div class="flex items-center gap-2">
									<div
										class="w-3 h-3 rounded-full"
										style="background-color: {category.color}"
									></div>
									<span class="text-sm font-medium text-foreground">{category.name}</span>
								</div>
								<div class="text-right">
									<div class="text-sm font-semibold text-foreground">{formatCurrency(category.amount)}</div>
									<div class="text-xs text-muted-foreground">{category.count} items · {category.percentage.toFixed(1)}%</div>
								</div>
							</div>
							<div class="w-full bg-muted rounded-full h-2">
								<div
									class="h-2 rounded-full transition-all duration-300"
									style="width: {category.percentage}%; background-color: {category.color}"
								></div>
							</div>
						</div>
					{/each}
				</div>
			</div>
		</div>
	{/if}

	<!-- Tag Distribution -->
	{#if statistics.byTag.length > 0}
		<div class="bg-background rounded-lg border border-border shadow-sm p-4 sm:p-6 mb-6 touch-manipulation">
			<h2 class="text-base sm:text-lg font-semibold text-foreground mb-4">Expenses by Tag (Top 10)</h2>

			<div class="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
				<!-- Pie Chart -->
				<div class="flex items-center justify-center py-4">
					<svg viewBox="0 0 200 200" class="w-full max-w-[280px] sm:max-w-[300px] touch-manipulation">
						{#each tagChartData.slice(0, 10) as tag, index}
							{@const startAngle = tagChartData
								.slice(0, index)
								.reduce((sum, t) => sum + (t.percentage * 3.6), 0)}
							{@const endAngle = startAngle + (tag.percentage * 3.6)}
							{@const color = generateColor(index, Math.min(tagChartData.length, 10))}
							<path
								d={getPieSlicePath(100, 100, 80, startAngle, endAngle)}
								fill={color}
								stroke="white"
								stroke-width="2"
								class="hover:opacity-80 active:opacity-70 transition-opacity cursor-pointer"
							>
								<title>#{tag.name}: {formatCurrency(tag.amount)} ({tag.percentage.toFixed(1)}%)</title>
							</path>
						{/each}
					</svg>
				</div>

				<!-- Bar Chart -->
				<div class="space-y-3 sm:space-y-4">
					{#each tagChartData.slice(0, 10) as tag, index}
						{@const color = generateColor(index, Math.min(tagChartData.length, 10))}
						<div>
							<div class="flex items-center justify-between mb-2">
								<div class="flex items-center gap-2">
									<div
										class="w-3 h-3 rounded-full"
										style="background-color: {color}"
									></div>
									<span class="text-sm font-medium text-foreground">#{tag.name}</span>
								</div>
								<div class="text-right">
									<div class="text-sm font-semibold text-foreground">{formatCurrency(tag.amount)}</div>
									<div class="text-xs text-muted-foreground">{tag.count} items · {tag.percentage.toFixed(1)}%</div>
								</div>
							</div>
							<div class="w-full bg-muted rounded-full h-2">
								<div
									class="h-2 rounded-full transition-all duration-300"
									style="width: {tag.percentage}%; background-color: {color}"
								></div>
							</div>
						</div>
					{/each}
				</div>
			</div>
		</div>
	{/if}

	<!-- Time Period Trend -->
	{#if statistics.byTime.length > 0}
		<div class="bg-background rounded-lg border border-border shadow-sm p-4 sm:p-6 mb-6 touch-manipulation">
			<h2 class="text-base sm:text-lg font-semibold text-foreground mb-4">Expenses Over Time</h2>
			<div class="space-y-2 sm:space-y-3">
				{#each statistics.byTime.slice(-12) as timeStat}
					<div class="flex items-center justify-between py-3 sm:py-2 border-b border-border last:border-b-0 min-h-[48px] touch-manipulation">
						<span class="text-sm text-foreground">{formatTimePeriod(timeStat.period, timePeriod)}</span>
						<div class="text-right">
							<div class="text-sm font-semibold text-foreground">{formatCurrency(timeStat.amount)}</div>
							<div class="text-xs text-muted-foreground">{timeStat.count} items</div>
						</div>
					</div>
				{/each}
			</div>
		</div>
	{/if}

	<!-- Duplicate Notes -->
	{#if statistics.duplicateNotes.length > 0}
		<div class="bg-background rounded-lg border border-border shadow-sm p-4 sm:p-6 mb-6 touch-manipulation">
			<h2 class="text-base sm:text-lg font-semibold text-foreground mb-2 sm:mb-4">
				Duplicate Notes ({statistics.duplicateNotes.length})
			</h2>
			<p class="text-sm text-muted-foreground mb-4">
				Expenses with identical notes that may be duplicates
			</p>
			<div class="space-y-3 sm:space-y-4">
				{#each statistics.duplicateNotes as duplicate}
					<details class="group">
						<summary class="flex items-center justify-between cursor-pointer p-3 sm:p-4 bg-accent/50 hover:bg-accent active:bg-accent rounded-lg transition-colors min-h-[56px] touch-manipulation">
							<div class="flex-1 pr-2">
								<div class="text-sm font-medium text-foreground mb-1 line-clamp-2">
									"{duplicate.note}"
								</div>
								<div class="text-xs text-muted-foreground">
									{duplicate.count} expenses · Total: {formatCurrency(duplicate.amount)}
								</div>
							</div>
							<svg
								class="w-6 h-6 flex-shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
							</svg>
						</summary>
						<div class="mt-2 space-y-2 pl-2 sm:pl-3">
							{#each duplicate.expenses as expense}
								<div class="flex items-center justify-between p-3 sm:p-2 border-l-2 border-border hover:border-primary active:border-primary transition-colors min-h-[56px] touch-manipulation">
									<div class="flex-1">
										<div class="flex items-center gap-2 flex-wrap">
											{#if expense.category}
												<div
													class="w-3 h-3 rounded-full flex-shrink-0"
													style="background-color: {expense.category.color}"
												></div>
												<span class="text-xs text-muted-foreground">
													{expense.category.name}
												</span>
											{/if}
											<span class="text-xs text-muted-foreground">
												{#if expense.creator}
													· {expense.creator.firstName && expense.creator.lastName
														? `${expense.creator.firstName} ${expense.creator.lastName}`
														: expense.creator.email}
												{:else}
													· <span class="italic">Vault</span>
												{/if}
											</span>
										</div>
										<div class="text-xs text-muted-foreground mt-1">
											{new Date(expense.date).toLocaleDateString()}
										</div>
									</div>
									<div class="text-sm font-semibold text-foreground ml-2">
										{formatCurrency(expense.amount)}
									</div>
								</div>
							{/each}
						</div>
					</details>
				{/each}
			</div>
		</div>
	{/if}

	<!-- Empty State -->
	{#if statistics.count === 0}
		<div class="bg-background rounded-lg border border-border shadow-sm p-12 text-center">
			<ChartBar class="w-16 h-16 text-muted-foreground mx-auto mb-4" />
			<h3 class="text-lg font-medium text-foreground mb-2">No expenses found</h3>
			<p class="text-muted-foreground mb-6">
				{#if hasActiveFilters}
					Try adjusting your filters to see statistics
				{:else}
					Start adding expenses to see your statistics
				{/if}
			</p>
			{#if hasActiveFilters}
				<Button onclick={clearFilters}>Clear Filters</Button>
			{:else}
				<Button onclick={() => goto(`/vaults/${data.vaultId}/expenses/new`)}>
					Add Expense
				</Button>
			{/if}
		</div>
	{/if}
</div>

<!-- Filter FAB -->
<div class="fixed bottom-6 right-6 z-40">
	<div class="relative">
		<!-- Active Filter/Compare Badge -->
		{#if hasActiveFilters || showComparison}
			<div class="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-lg z-10">
				{[filterCategory, filterTag, filterMember, filterNote, timePeriod !== 'all', showComparison].filter(Boolean).length}
			</div>
		{/if}

		<!-- FAB Button -->
		<button
			onclick={() => showFabDropdown = !showFabDropdown}
			class="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center justify-center group hover:from-blue-600 hover:to-purple-600 touch-manipulation"
			title="Filters & Compare"
		>
			<Faders class="w-6 h-6 sm:w-7 sm:h-7 transition-transform duration-300 {showFabDropdown ? 'rotate-90' : ''}" weight="bold" />
		</button>

		<!-- FAB Dropdown -->
		{#if showFabDropdown}
			<div class="absolute bottom-full right-0 mb-4 w-80 sm:w-96 max-h-[80vh] overflow-y-auto bg-background border border-border rounded-lg shadow-xl z-[100] animate-in slide-in-from-bottom-2 duration-200">
				<!-- Header with Tabs -->
				<div class="sticky top-0 bg-background z-10 border-b border-border">
					<div class="flex items-center justify-between px-4 py-3">
						<h3 class="text-base font-semibold text-foreground flex items-center gap-2">
							{#if activeFabTab === 'filters'}
								<Faders class="w-5 h-5" />
								Filters
							{:else}
								<ArrowsLeftRight class="w-5 h-5" />
								Compare
							{/if}
						</h3>
						<button
							onclick={() => showFabDropdown = false}
							class="p-2 hover:bg-accent rounded-lg transition-colors touch-manipulation"
						>
							<X class="w-5 h-5" />
						</button>
					</div>

					<!-- Tab Buttons -->
					<div class="flex border-t border-border">
						<button
							onclick={() => activeFabTab = 'filters'}
							class="flex-1 px-4 py-3 text-sm font-medium transition-colors touch-manipulation {activeFabTab === 'filters' ? 'text-primary bg-accent border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'}"
						>
							<Faders class="w-4 h-4 inline-block mr-2" />
							Filters
						</button>
						<button
							onclick={() => activeFabTab = 'compare'}
							class="flex-1 px-4 py-3 text-sm font-medium transition-colors touch-manipulation {activeFabTab === 'compare' ? 'text-primary bg-accent border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'}"
						>
							<ArrowsLeftRight class="w-4 h-4 inline-block mr-2" />
							Compare
						</button>
					</div>
				</div>

				<!-- Tab Content -->
				<div class="p-4 space-y-4">{#if activeFabTab === 'filters'}
					<!-- Category Filter -->
					<div>
						<label for="mobile-category-filter" class="block text-sm font-medium text-foreground mb-2">
							Category {availableCategories.length > 0 ? `(${availableCategories.length})` : ''}
						</label>
						<Select id="mobile-category-filter" bind:value={filterCategory}>
							<option value="">All Categories</option>
							{#each availableCategories as category}
								<option value={category.id}>{category.name}</option>
							{/each}
						</Select>
					</div>

					<!-- Tag Filter -->
					<div>
						<label for="mobile-tag-filter" class="block text-sm font-medium text-foreground mb-2">
							Tag {availableTags.length > 0 ? `(${availableTags.length})` : ''}
						</label>
						<Select id="mobile-tag-filter" bind:value={filterTag}>
							<option value="">All Tags</option>
							{#each availableTags as tag}
								<option value={tag.name}>{tag.name}</option>
							{/each}
						</Select>
					</div>

					<!-- Member Filter -->
					<div>
						<label for="mobile-member-filter" class="block text-sm font-medium text-foreground mb-2">
							Member {availableMembers.length > 0 ? `(${availableMembers.length})` : ''}
						</label>
						<Select id="mobile-member-filter" bind:value={filterMember}>
							<option value="">All Members</option>
							{#each availableMembers as member}
								<option value={member.userId}>
									{member.firstName && member.lastName
										? `${member.firstName} ${member.lastName}`
										: member.email}
									{member.role === 'owner' ? ' (Owner)' : ''}
								</option>
							{/each}
						</Select>
					</div>

					<!-- Note Search -->
					<div>
						<label for="mobile-note-filter" class="block text-sm font-medium text-foreground mb-2">
							Search Note
						</label>
						<Input
							id="mobile-note-filter"
							bind:value={filterNote}
							placeholder="Search in notes..."
						/>
					</div>

					<!-- Time Period Filter -->
					<div>
						<label for="mobile-period-filter" class="block text-sm font-medium text-foreground mb-2">
							Time Period
						</label>
						<Select id="mobile-period-filter" bind:value={timePeriod}>
							{#each timePeriods as period}
								<option value={period.value}>{period.label}</option>
							{/each}
						</Select>
					</div>

					<!-- Active Filters -->
					{#if hasActiveFilters}
						<div class="pt-4 border-t border-border">
							<div class="text-xs font-medium text-muted-foreground mb-2">Active Filters:</div>
							<div class="flex flex-wrap gap-2">
								{#if filterCategory}
									<button
										onclick={() => filterCategory = ''}
										class="inline-flex items-center gap-1 px-2 py-1 text-xs bg-accent rounded-md hover:bg-accent/80 transition-colors touch-manipulation"
									>
										<span>Category: {data.categories.find(c => c.id === filterCategory)?.name}</span>
										<X class="w-3 h-3" />
									</button>
								{/if}
								{#if filterTag}
									<button
										onclick={() => filterTag = ''}
										class="inline-flex items-center gap-1 px-2 py-1 text-xs bg-accent rounded-md hover:bg-accent/80 transition-colors touch-manipulation"
									>
										<span>Tag: {filterTag}</span>
										<X class="w-3 h-3" />
									</button>
								{/if}
								{#if filterMember}
									{@const member = data.members.find(m => m.userId === filterMember)}
									<button
										onclick={() => filterMember = ''}
										class="inline-flex items-center gap-1 px-2 py-1 text-xs bg-accent rounded-md hover:bg-accent/80 transition-colors touch-manipulation"
									>
										<span>Member: {member?.firstName && member?.lastName ? `${member.firstName} ${member.lastName}` : member?.email}</span>
										<X class="w-3 h-3" />
									</button>
								{/if}
								{#if filterNote}
									<button
										onclick={() => filterNote = ''}
										class="inline-flex items-center gap-1 px-2 py-1 text-xs bg-accent rounded-md hover:bg-accent/80 transition-colors touch-manipulation"
									>
										<span>Note: "{filterNote}"</span>
										<X class="w-3 h-3" />
									</button>
								{/if}
								{#if timePeriod !== 'all'}
									{@const periodLabel = timePeriods.find(p => p.value === timePeriod)?.label}
									<button
										onclick={() => timePeriod = 'all'}
										class="inline-flex items-center gap-1 px-2 py-1 text-xs bg-accent rounded-md hover:bg-accent/80 transition-colors touch-manipulation"
									>
										<span>Period: {periodLabel}</span>
										<X class="w-3 h-3" />
									</button>
								{/if}
							</div>
						</div>
					{/if}

					<!-- Apply Button -->
					<div class="pt-2">
						<Button
							onclick={() => showFabDropdown = false}
							class="w-full"
						>
							Apply Filters
						</Button>
					</div>
				{:else}
					<!-- Compare Tab Content -->
					<!-- Comparison Mode Toggle -->
					<div class="flex gap-2 mb-4">
						<Button
							onclick={() => { comparisonMode = 'period'; showComparison = true; }}
							variant={comparisonMode === 'period' ? 'default' : 'outline'}
							size="sm"
						>
							By Period
						</Button>
						<Button
							onclick={() => { comparisonMode = 'date'; showComparison = true; }}
							variant={comparisonMode === 'date' ? 'default' : 'outline'}
							size="sm"
						>
							Custom Dates
						</Button>
					</div>

					{#if comparisonMode === 'period'}
						<!-- Period Comparison -->
						<div class="space-y-4">
							<div>
								<label class="block text-sm font-medium text-foreground mb-2">Period 1</label>
								<Select bind:value={comparePeriod1} onchange={() => showComparison = true}>
									<option value="daily">Today</option>
									<option value="weekly">This Week</option>
									<option value="monthly">This Month</option>
									<option value="yearly">This Year</option>
								</Select>
							</div>
							<div>
								<label class="block text-sm font-medium text-foreground mb-2">Period 2 (Compare To)</label>
								<Select bind:value={comparePeriod2} onchange={() => showComparison = true}>
									<option value="daily">Yesterday</option>
									<option value="weekly">Last Week</option>
									<option value="monthly">Last Month</option>
									<option value="yearly">Last Year</option>
								</Select>
							</div>
						</div>
					{:else}
						<!-- Custom Date Comparison -->
						<div class="space-y-4">
							<div>
								<label class="block text-sm font-medium text-foreground mb-2">Period 1 Start</label>
								<Input type="date" bind:value={compareDate1Start} onchange={() => showComparison = true} />
							</div>
							<div>
								<label class="block text-sm font-medium text-foreground mb-2">Period 1 End</label>
								<Input type="date" bind:value={compareDate1End} onchange={() => showComparison = true} />
							</div>
							<div>
								<label class="block text-sm font-medium text-foreground mb-2">Period 2 Start</label>
								<Input type="date" bind:value={compareDate2Start} onchange={() => showComparison = true} />
							</div>
							<div>
								<label class="block text-sm font-medium text-foreground mb-2">Period 2 End</label>
								<Input type="date" bind:value={compareDate2End} onchange={() => showComparison = true} />
							</div>
						</div>
					{/if}

					<!-- Apply/Close Button -->
					<div class="pt-2 flex gap-2">
						<Button
							onclick={() => { showComparison = true; showFabDropdown = false; }}
							class="flex-1"
						>
							Apply & Compare
						</Button>
						{#if showComparison}
							<Button
								onclick={() => { showComparison = false; showFabDropdown = false; }}
								variant="outline"
							>
								Clear
							</Button>
						{/if}
					</div>
				{/if}
				</div>
			</div>
		{/if}
	</div>
</div>
