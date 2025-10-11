<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';
	import IconDisplay from '$lib/components/IconDisplay.svelte';
	import Users from 'phosphor-svelte/lib/Users';
	import Gear from 'phosphor-svelte/lib/Gear';
	import Lock from 'phosphor-svelte/lib/Lock';
	import Globe from 'phosphor-svelte/lib/Globe';
	import Star from 'phosphor-svelte/lib/Star';
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
		currentUserId,
		isFavorite = false,
		onEdit,
		onDelete,
		onManageMembers,
		onToggleFavorite
	}: Props = $props();

	let isOwner = $derived(vault.ownerId === currentUserId);
	let canEdit = $derived(isOwner || membership?.permissions === 'admin');
</script>

<tr class="hover:bg-accent/5 cursor-pointer transition-colors border-b border-border" onclick={() => goto(`/vaults/${vault.id}?period=daily`)}>
	<!-- Vault Name & Info -->
	<td class="py-3 px-4">
		<div class="flex items-center space-x-3">
			<div class="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style="background-color: {vault.color}20; border: 1px solid {vault.color}">
				{#if vault.icon}
					<IconDisplay icon={vault.icon} iconType={vault.iconType} size="sm" />
				{:else}
					🏦
				{/if}
			</div>
			<div class="min-w-0">
				<div class="flex items-center space-x-2">
					<p class="text-sm font-medium text-foreground truncate">{vault.name}</p>
					{#if vault.isPersonal}
						<Lock size={12} class="text-muted-foreground flex-shrink-0" title="Personal vault" />
					{:else}
						<Globe size={12} class="text-dark flex-shrink-0" title="Shared vault" />
					{/if}
				</div>
				{#if vault.description}
					<p class="text-xs text-muted-foreground truncate">{vault.description}</p>
				{/if}
			</div>
		</div>
	</td>

	<!-- Owner -->
	<td class="py-3 px-4 text-sm text-muted-foreground">
		{#if owner}
			{isOwner ? 'You' : owner.name}
		{/if}
		{#if membership && !isOwner}
			<span class="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-accent text-accent-foreground ml-2">
				{membership.role}
			</span>
		{/if}
	</td>

	<!-- Actions -->
	<td class="py-3 px-4 text-right">
		<div class="flex items-center justify-end space-x-1">
			<Button
				variant="ghost"
				size="sm"
				onclick={(e) => { e.stopPropagation(); onToggleFavorite?.(); }}
				title={isFavorite ? "Remove from favorites" : "Add to favorites"}
				class="p-1.5"
			>
				<Star size={12} class={isFavorite ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground"} />
			</Button>
			{#if !vault.isPersonal && canEdit}
				<Button
					variant="ghost"
					size="sm"
					onclick={(e) => { e.stopPropagation(); onManageMembers?.(); }}
					title="Manage members"
					class="p-1.5"
				>
					<Users size={12} />
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
					<Gear size={12} />
				</Button>
			{/if}
		</div>
	</td>
</tr>
