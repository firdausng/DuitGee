<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';
	import IconDisplay from '$lib/components/IconDisplay.svelte';
	import { Users, Gear, Trash, Lock, Globe, Star } from 'phosphor-svelte';
    import {goto} from "$app/navigation";

	interface Props {
		vault: {
			id: string;
			name: string;
			description?: string;
			color: string;
			icon?: string;
			iconType?: 'emoji' | 'phosphor';
			isPersonal: boolean;
			ownerId: string;
			createdAt: string;
		};
		owner?: {
			id: string;
			name: string;
			email: string;
		};
		membership?: {
			role: string;
			permissions: string;
			status: string;
			joinedAt?: string;
		};
		stats?: {
			totalExpenses: number;
			totalAmount: number;
			avgAmount: number;
		};
		currentUserId: string;
		isFavorite?: boolean;
		onEdit?: () => void;
		onDelete?: () => void;
		onManageMembers?: () => void;
		onToggleFavorite?: () => void;
	}

	let {
		vault,
		owner,
		membership,
		stats,
		currentUserId,
		isFavorite = false,
		onEdit,
		onDelete,
		onManageMembers,
		onToggleFavorite
	}: Props = $props();

	let isOwner = $derived(vault.ownerId === currentUserId);
	let canEdit = $derived(isOwner || membership?.permissions === 'admin');
	let canDelete = $derived(isOwner);

	function formatCurrency(amount: number): string {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD'
		}).format(amount);
	}

	function formatDate(dateString: string): string {
		return new Date(dateString).toLocaleDateString();
	}
</script>

<div class="bg-background rounded-lg shadow-sm hover:shadow-md transition-all border-l-4 border" style="border-left-color: {vault.color}" onclick={() => goto(`/vaults/${vault.id}`)} role="button" tabindex="0">
	<div class="p-4">
		<!-- Header -->
		<div class="flex items-center justify-between mb-3">
			<div class="flex items-center space-x-3 flex-1">
				<div class="w-6 h-6 rounded-full flex items-center justify-center" style="background-color: {vault.color}20; border: 1px solid {vault.color}">
					{#if vault.icon}
						<IconDisplay icon={vault.icon} iconType={vault.iconType} size="sm" />
					{:else}
						🏦
					{/if}
				</div>
				<div class="flex-1 min-w-0">
					<div class="flex items-center space-x-2">
						<h3 class="text-base font-semibold text-foreground truncate">{vault.name}</h3>
						{#if vault.isPersonal}
							<Lock size={14} class="text-muted-foreground flex-shrink-0" title="Personal vault" />
						{:else}
							<Globe size={14} class="text-dark flex-shrink-0" title="Shared vault" />
						{/if}
					</div>
					{#if vault.description}
						<p class="text-xs text-muted-foreground mt-0.5 truncate">{vault.description}</p>
					{/if}
				</div>
			</div>

			<div class="flex space-x-1">
				<Button
					variant="ghost"
					size="sm"
					onclick={(e) => { e.stopPropagation(); onToggleFavorite?.(); }}
					title={isFavorite ? "Remove from favorites" : "Add to favorites"}
					class="p-1.5"
				>
					<Star size={14} class={isFavorite ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground"} />
				</Button>
				{#if !vault.isPersonal && canEdit}
					<Button
						variant="ghost"
						size="sm"
						onclick={(e) => { e.stopPropagation(); onManageMembers?.(); }}
						title="Manage members"
						class="p-1.5"
					>
						<Users size={14} />
					</Button>
				{/if}
				{#if canEdit}
					<Button
						variant="ghost"
						size="sm"
						onclick={(e) => { e.stopPropagation(); onEdit?.(); }}
						title="Edit vault"
						class="p-1.5"
					>
						<Gear size={14} />
					</Button>
				{/if}
			</div>
		</div>

		<!-- Compact Stats -->
		{#if stats}
			<div class="flex items-center justify-between text-xs mb-3 pt-2 border-t border-border">
				<div class="text-center">
					<p class="text-lg font-bold text-foreground">{stats.totalExpenses}</p>
					<p class="text-muted-foreground">Expenses</p>
				</div>
				<div class="text-center">
					<p class="text-lg font-bold text-foreground">{formatCurrency(stats.totalAmount)}</p>
					<p class="text-muted-foreground">Total</p>
				</div>
				<div class="text-center">
					<p class="text-lg font-bold text-foreground">{formatCurrency(stats.avgAmount)}</p>
					<p class="text-muted-foreground">Average</p>
				</div>
			</div>
		{/if}

		<!-- Compact Actions -->
		<div class="flex space-x-2">
			<Button
				variant="default"
				size="sm"
				onclick={(e) => { e.stopPropagation(); goto(`/vaults/${vault.id}`); }}
				class="flex-1 py-1.5 text-xs"
			>
				Open
			</Button>
			<Button
				variant="outline"
				size="sm"
				onclick={(e) => { e.stopPropagation(); goto(`/vaults/${vault.id}/expenses/new`); }}
				class="flex-1 py-1.5 text-xs"
			>
				Add Expense
			</Button>
		</div>
	</div>
</div>