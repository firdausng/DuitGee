<script lang="ts">
	import { formatCurrency } from '$lib/utils';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Select from '$lib/components/ui/Select.svelte';
	import { goto } from '$app/navigation';
	import MagnifyingGlass from 'phosphor-svelte/lib/MagnifyingGlass';
	import ChartBar from 'phosphor-svelte/lib/ChartBar';
	import X from 'phosphor-svelte/lib/X';

	let { data } = $props();

	// Filter state - all reactive
	let filterTag = $state('');
	let filterCategory = $state('');
	let filterNote = $state('');
	let filterMember = $state('');
	let timePeriod = $state('all');

	// Reactive filtered expenses
	const filteredExpenses = $derived.by(() => {
		let result = data.expenses;

		if (filterTag) {
			result = result.filter(expense =>
				expense.tags?.some(tag => tag.name === filterTag)
			);
		}

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
			result = result.filter(expense =>
				expense.creator?.id === filterMember
			);
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

		return data.members.filter(member => memberIds.has(member.userId));
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
</script>

<svelte:head>
	<title>Statistics - Expense Tracker</title>
</svelte:head>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
	<!-- Header -->
	<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
		<div>
			<h1 class="text-3xl font-bold text-foreground font-display">Statistics</h1>
			<p class="mt-2 text-muted-foreground">Overview and insights of your expenses</p>
		</div>
		<Button onclick={() => goto(`/vaults/${data.vaultId}/expenses`)} variant="outline" class="mt-4 sm:mt-0">
			Back to Expenses
		</Button>
	</div>

	<!-- Filters -->
	<div class="bg-background rounded-lg border border-border shadow-sm p-6 mb-6">
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
											{#if expense.creator}
												<span class="text-xs text-muted-foreground">
													· {expense.creator.firstName && expense.creator.lastName
														? `${expense.creator.firstName} ${expense.creator.lastName}`
														: expense.creator.email}
												</span>
											{/if}
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
