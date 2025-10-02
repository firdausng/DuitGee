<script lang="ts">
	import '../../app.css';
	import Button from '$lib/components/ui/Button.svelte';
	import ThemeToggle from '$lib/components/ui/ThemeToggle.svelte';
	import UserDropdown from '$lib/components/UserDropdown.svelte';
	import NotificationDropdown from '$lib/components/NotificationDropdown.svelte';
	import InvitationIndicator from '$lib/components/InvitationIndicator.svelte';
	import IconDisplay from '$lib/components/IconDisplay.svelte';
	import { House, Receipt, Tag, ChartPie, User, Stool, CaretRight, Gear, Bell, CaretDown, List, Moon, Sun, Plus, UserPlus } from 'phosphor-svelte';
	import { goto } from '$app/navigation';
	import { theme } from '$lib/stores/theme.svelte.js';
    import {authManager} from "$lib/stores/current-session.svelte";

	let { children, data } = $props();

    authManager.setAuthenticationResponse(data.currentSession);
	// Main navigation sections
	const mainNavigation = [
		{ name: 'Vaults', href: '/vaults', icon: Stool, key: 'vaults' },
	];

	// Generate vault-specific navigation when inside a vault
	function getVaultNavigation() {
		const segments = data.pathname.split('/').filter(Boolean);

		if (segments[0] === 'vaults' && segments[1] && segments[1] !== 'new') {
			const vaultId = segments[1];
			return [
				{ name: 'Dashboard', href: `/vaults/${vaultId}`, icon: House, key: 'dashboard' },
				{ name: 'Expenses', href: `/vaults/${vaultId}/expenses`, icon: Receipt, key: 'expenses' },
				{ name: 'Categories', href: `/vaults/${vaultId}/categories`, icon: Tag, key: 'categories' },
				{ name: 'Members', href: `/vaults/${vaultId}/members`, icon: User, key: 'members' },
			];
		}
		return [];
	}

	// Generate breadcrumbs based on current path
	function generateBreadcrumbs() {
		const path = data.pathname;
		const segments = path.split('/').filter(Boolean);
		const breadcrumbs = [{ name: 'DuitGee', href: '/vaults', isHome: false }];

		if (segments.length === 0) return breadcrumbs;

		// Handle vault routes
		if (segments[0] === 'vaults' && segments.length > 1) {
			breadcrumbs.push({ name: 'Vaults', href: '/vaults', isHome: true });

			if (segments.length > 1 && segments[1] !== 'new') {
				// Individual vault
				const vaultId = segments[1];
                const currentVault = data.vaults.find(vault => vault.vault.id === vaultId);
				const vaultName = `${currentVault?.vault.name.slice(0, 8)}`;
				breadcrumbs.push({
					name: vaultName,
					href: `/vaults/${vaultId}`,
					isHome: false,
					icon: currentVault?.vault.icon,
					iconType: currentVault?.vault.iconType,
					color: currentVault?.vault.color
				});

				// Vault sub-pages
				if (segments.length > 2) {
					const subPage = segments[2];
					switch (subPage) {
						case 'expenses':
							breadcrumbs.push({ name: 'Expenses', href: `/vaults/${vaultId}/expenses`, isHome: false });
							if (segments[3] === 'new') {
								breadcrumbs.push({ name: 'New Expense', href: `/vaults/${vaultId}/expenses/new`, isHome: false });
							} else if (segments[3]) {
								breadcrumbs.push({ name: 'Edit Expense', href: `/vaults/${vaultId}/expenses/${segments[3]}`, isHome: false });
							}
							break;
						case 'categories':
							breadcrumbs.push({ name: 'Categories', href: `/vaults/${vaultId}/categories`, isHome: false });
							if (segments[3] === 'new') {
								breadcrumbs.push({ name: 'New Category', href: `/vaults/${vaultId}/categories/new`, isHome: false });
							}
							break;
						case 'edit':
							breadcrumbs.push({ name: 'Settings', href: `/vaults/${vaultId}/edit`, isHome: false });
							break;
						case 'members':
							breadcrumbs.push({ name: 'Members', href: `/vaults/${vaultId}/members`, isHome: false });
							if (segments[3] === 'invite') {
								breadcrumbs.push({ name: 'Invite User', href: `/vaults/${vaultId}/members/invite`, isHome: false });
							}
							break;
					}
				}
			} else if (segments[1] === 'new') {
				breadcrumbs.push({ name: 'New Vault', href: '/vaults/new', isHome: false });
			}
		}
        else if (segments[0] === 'users' && data.isAdmin) {
			breadcrumbs.push({ name: 'Users', href: '/users', isHome: false });
		}
		else if (segments[0] === 'profile') {
			breadcrumbs.push({ name: 'Profile', href: '/profile', isHome: false });
		}

		return breadcrumbs;
	}

	const breadcrumbs = $derived(generateBreadcrumbs());
	const currentSection = $derived(data.pathname.split('/')[1] || 'vaults');
	const vaultNavigation = $derived(getVaultNavigation());
	const isInVault = $derived(vaultNavigation.length > 0);

	// Dropdown state for vault menu
	let showVaultDropdown = $state(false);

	// Quick Add dropdown state
	let showQuickAddDropdown = $state(false);

	// Mobile menu dropdown state
	let showMobileMenu = $state(false);

	// FAB dropdown state
	let showFabDropdown = $state(false);

	// Favorite vault tracking
	let favoriteVaultId = $state(typeof window !== 'undefined' ? localStorage.getItem('favoriteVaultId') : null);

	// Close dropdown when clicking outside
	function handleClickOutside(event) {
		const dropdown = event.target.closest('.relative');
		if (!dropdown) {
			showVaultDropdown = false;
			showQuickAddDropdown = false;
			showMobileMenu = false;
			showFabDropdown = false;
		}
	}

	// Add click outside listener
	$effect(() => {
		document.addEventListener('click', handleClickOutside);
		return () => {
			document.removeEventListener('click', handleClickOutside);
		};
	});

	// Get suggested vaults for Quick Add
	const suggestedVaults = $derived.by(() => {
		return data.vaults.slice(0, 5);
	});

	function handleQuickAdd(vaultId: string) {
		// Close dropdown and navigate
		showQuickAddDropdown = false;
		showFabDropdown = false;
		goto(`/vaults/${vaultId}/expenses/new`);
	}

	function isActive(key: string): boolean {
		if (isInVault) {
			// When in vault, check both main section and vault sub-section
			const path =data.pathname;
			const segments = path.split('/').filter(Boolean);

			if (key === 'vaults') {
				return segments[0] === 'vaults';
			}

			// For vault-specific navigation
			if (segments[0] === 'vaults' && segments[1]) {
				if (key === 'dashboard') {
					return segments.length === 2; // /vaults/[id]
				}
				return segments[2] === key; // /vaults/[id]/expenses, etc.
			}
		}

		return currentSection === key;
	}
</script>

<svelte:head>
	<title>Expense Tracker</title>
	<meta name="description" content="Track and manage your expenses with ease" />
</svelte:head>

<div class="min-h-screen bg-background">
	<!-- Modern Two-Tier Header -->
	<header class="bg-background/95 backdrop-blur-sm border-b border-border sticky top-0 z-50">
		<!-- Top Bar -->
		<div class="border-b border-border/40">
			<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div class="flex items-center justify-between h-12">
					<!-- Logo & Brand -->
					<div class="flex items-center space-x-3">
                        <img src="/favicon.svg" alt="DuitGee" class="w-8 h-8" />
						<h1 class="font-display text-lg font-semibold text-foreground">DuitGee</h1>
					</div>

					<!-- Global Actions -->
					<div class="flex items-center space-x-1">
						<!-- Mobile Navigation -->
						<div class="flex items-center space-x-2 lg:hidden">
							<!-- Quick Add Button -->
							<div class="relative">
								<button
									onclick={() => showQuickAddDropdown = !showQuickAddDropdown}
									class="inline-flex items-center justify-center w-10 h-10 rounded-lg transition-colors bg-primary text-primary-foreground hover:bg-primary/90 shadow-md"
									title="Quick Add Expense"
								>
									<span class="text-lg font-bold">+</span>
								</button>

								{#if showQuickAddDropdown}
									<div class="absolute left-0 mt-2 w-64 bg-background border border-border rounded-lg shadow-xl z-50">
										<div class="py-2">
											<div class="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border">
												Quick Add Expense
											</div>
											{#each suggestedVaults as vault, index}
												<button
													onclick={() => handleQuickAdd(vault.vault.id)}
													class="w-full flex items-center px-4 py-3 text-sm transition-colors hover:bg-accent"
												>
													<div class="w-6 h-6 rounded-full flex items-center justify-center mr-3 text-sm" style="background-color: {vault.vault.color}20; border: 1px solid {vault.vault.color}">
														{vault.vault.icon}
													</div>
													<div class="flex-1 text-left">
														<div class="font-medium text-foreground">{vault.vault.name}</div>
														<div class="text-xs text-muted-foreground">
															{vault.vault.isPersonal ? 'Personal' : 'Shared'} vault
														</div>
													</div>
												</button>
											{/each}
										</div>
									</div>
								{/if}
							</div>

							<!-- Mobile Menu Button -->
							<div class="relative">
								<button
									onclick={() => showMobileMenu = !showMobileMenu}
									class="inline-flex items-center justify-center w-10 h-10 rounded-lg transition-colors text-muted-foreground hover:text-foreground hover:bg-accent"
									title="Menu"
								>
									<List class="w-5 h-5" />
								</button>

								{#if showMobileMenu}
									<div class="absolute right-0 mt-2 w-64 bg-background border border-border rounded-lg shadow-xl z-50">
										<div class="py-2">
											<!-- Navigation Items -->
											<div class="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border">
												Navigation
											</div>

											<a
												href="/vaults"
												class="flex items-center px-4 py-3 text-sm transition-colors hover:bg-accent {isActive('vaults') ? 'bg-accent/50 text-foreground' : 'text-muted-foreground'}"
												onclick={() => showMobileMenu = false}
											>
												<Stool class="w-4 h-4 mr-3" />
												<span>Vaults</span>
											</a>

											{#if data.isAdmin}
												<a
													href="/users"
													class="flex items-center px-4 py-3 text-sm transition-colors hover:bg-accent {isActive('users') ? 'bg-accent/50 text-foreground' : 'text-muted-foreground'}"
													onclick={() => showMobileMenu = false}
												>
													<User class="w-4 h-4 mr-3" />
													<span>Users</span>
												</a>
											{/if}

											<!-- Vault Navigation (when in vault) -->
											{#if isInVault && vaultNavigation.length > 0}
												<div class="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border border-t border-border mt-2">
													Vault Menu
												</div>
												{#each vaultNavigation as item}
													<a
														href={item.href}
														class="flex items-center px-4 py-3 text-sm transition-colors hover:bg-accent {isActive(item.key) ? 'bg-accent/50 text-foreground' : 'text-muted-foreground'}"
														onclick={() => showMobileMenu = false}
													>
														<svelte:component this={item.icon} class="w-4 h-4 mr-3" />
														<span>{item.name}</span>
													</a>
												{/each}

												<!-- Edit Vault -->
												<a
													href="/vaults/{data.pathname.split('/')[2]}/edit"
													class="flex items-center px-4 py-3 text-sm transition-colors hover:bg-accent text-muted-foreground"
													onclick={() => showMobileMenu = false}
												>
													<Gear class="w-4 h-4 mr-3" />
													<span>Edit Vault</span>
												</a>
											{/if}

											<!-- Settings Section -->
											<div class="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border border-t border-border mt-2">
												Settings
											</div>

											<!-- Invitations Link -->
											<a
												href="/invitations"
												class="flex items-center px-4 py-3 text-sm transition-colors hover:bg-accent text-muted-foreground"
												onclick={() => showMobileMenu = false}
											>
												<UserPlus class="w-4 h-4 mr-3" />
												<span>Invitations</span>
											</a>

											<!-- Notifications Link -->
											<a
												href="/notifications"
												class="flex items-center px-4 py-3 text-sm transition-colors hover:bg-accent text-muted-foreground"
												onclick={() => showMobileMenu = false}
											>
												<Bell class="w-4 h-4 mr-3" />
												<span>Notifications</span>
											</a>

											<!-- Dark Mode Toggle -->
											<button
												onclick={() => { theme.toggle(); showMobileMenu = false; }}
												class="w-full flex items-center px-4 py-3 text-sm transition-colors hover:bg-accent text-muted-foreground"
											>
												{#if theme.current === 'dark'}
													<Sun class="w-4 h-4 mr-3" />
													<span>Light Mode</span>
												{:else}
													<Moon class="w-4 h-4 mr-3" />
													<span>Dark Mode</span>
												{/if}
											</button>

											<!-- Profile Link -->
											<a
												href="/profile"
												class="flex items-center px-4 py-3 text-sm transition-colors hover:bg-accent text-muted-foreground"
												onclick={() => showMobileMenu = false}
											>
												<User class="w-4 h-4 mr-3" />
												<span>Profile</span>
											</a>

											<!-- Logout -->
											<a
												href="/logout"
												class="flex items-center px-4 py-3 text-sm transition-colors hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
												onclick={() => showMobileMenu = false}
											>
												<svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
												</svg>
												<span>Sign Out</span>
											</a>
										</div>
									</div>
								{/if}
							</div>
						</div>

						<!-- Desktop Navigation -->
						<div class="hidden lg:flex items-center space-x-2">
							<!-- Quick Add -->
							<div class="relative">
								<Button
									variant="outline"
									size="sm"
									onclick={() => showQuickAddDropdown = !showQuickAddDropdown}
								>
									<span class="text-xs">+</span>
									<span class="ml-1 hidden md:inline">Quick Add</span>
									<CaretDown class="w-3 h-3 ml-1 transition-transform duration-200 {showQuickAddDropdown ? 'rotate-180' : ''}" />
								</Button>

								{#if showQuickAddDropdown}
									<div class="absolute left-0 mt-2 w-64 bg-background border border-border rounded-lg shadow-lg z-50">
										<div class="py-2">
											<div class="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider border-b border-border">
												Select Vault
											</div>
											{#each suggestedVaults as vault, index}
												<button
													onclick={() => handleQuickAdd(vault.vault.id)}
													class="w-full flex items-center px-3 py-2 text-sm transition-colors hover:bg-accent"
												>
													<div class="w-6 h-6 rounded-full flex items-center justify-center mr-3 text-sm" style="background-color: {vault.vault.color}20; border: 1px solid {vault.vault.color}">
														{vault.vault.icon}
													</div>
													<div class="flex-1 text-left">
														<div class="flex items-center space-x-2">
															<span class="font-medium text-foreground">{vault.vault.name}</span>
															{#if index === 0}
																<span class="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary">
																	Suggested
																</span>
															{/if}
														</div>
														<div class="text-xs text-muted-foreground">
															{vault.vault.isPersonal ? 'Personal' : 'Shared'} vault
														</div>
													</div>
												</button>
											{/each}
											<div class="border-t border-border mt-2 pt-2">
												<button
													onclick={() => { showQuickAddDropdown = false; goto('/vaults'); }}
													class="w-full flex items-center px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
												>
													<span class="w-6 h-6 rounded-full bg-muted flex items-center justify-center mr-3 text-xs">
														⋯
													</span>
													Browse all vaults
												</button>
											</div>
										</div>
									</div>
								{/if}
							</div>

							<!-- Main Navigation -->
							<a
								href="/vaults"
								class="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md transition-colors {isActive('vaults')
									? 'bg-primary text-primary-foreground'
									: 'text-muted-foreground hover:text-foreground hover:bg-accent'}"
							>
								<Stool class="w-3.5 h-3.5 mr-1.5" />
								Vaults
							</a>

							<!-- Users Management (Admin Only) -->
							{#if data.isAdmin}
								<a
									href="/users"
									class="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md transition-colors {isActive('users')
										? 'bg-primary text-primary-foreground'
										: 'text-muted-foreground hover:text-foreground hover:bg-accent'}"
								>
									<User class="w-3.5 h-3.5 mr-1.5" />
									Users
								</a>
							{/if}

							<!-- Vault Dropdown in Top Bar -->
							{#if isInVault}
								<div class="relative">
									<button
										onclick={() => showVaultDropdown = !showVaultDropdown}
										class="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md transition-colors text-muted-foreground hover:text-foreground hover:bg-accent"
									>
										<Gear class="w-3.5 h-3.5 mr-1.5" />
										<span class="hidden md:inline">Manage</span>
										<CaretDown class="w-3 h-3 ml-1 transition-transform duration-200 {showVaultDropdown ? 'rotate-180' : ''}" />
									</button>

									{#if showVaultDropdown}
										<div class="absolute right-0 mt-2 w-48 bg-background border border-border rounded-lg shadow-lg z-50">
											<div class="py-1">
												{#each vaultNavigation as item}
													<a
														href={item.href}
														class="flex items-center px-4 py-2 text-sm transition-colors hover:bg-accent {isActive(item.key)
															? 'text-foreground bg-accent/50'
															: 'text-muted-foreground'}"
														onclick={() => showVaultDropdown = false}
													>
														<svelte:component this={item.icon} class="w-4 h-4 mr-3" />
														{item.name}
													</a>
												{/each}
												<div class="border-t border-border my-1"></div>
												<a
													href="/vaults/{data.pathname.split('/')[2]}/edit"
													class="flex items-center px-4 py-2 text-sm transition-colors hover:bg-accent text-muted-foreground"
													onclick={() => showVaultDropdown = false}
												>
													<Gear class="w-4 h-4 mr-3" />
													Edit Vault
												</a>
											</div>
										</div>
									{/if}
								</div>
							{/if}
						</div>

						<!-- Universal Actions -->
						<div class="flex items-center space-x-2 ml-2">
							<!-- Theme Toggle -->
							<ThemeToggle />

							<!-- Invitation Indicator -->
							<InvitationIndicator />

							<!-- Notifications -->
<!--							<NotificationDropdown />-->

							<!-- User Dropdown -->
							<div class="hidden lg:block">
								<UserDropdown activeUser={data.activeUser} />
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Breadcrumb Navigation -->
		<div class="bg-background/60">
			<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div class="flex items-center h-12">
					<!-- Dynamic Breadcrumb Path -->
					<nav class="flex items-center space-x-1 text-sm" aria-label="Breadcrumb">
						{#each breadcrumbs as crumb, index}
							{#if index > 0}
								<CaretRight class="w-3.5 h-3.5 text-muted-foreground/60" />
							{/if}
							<a
								href={crumb.href}
								class="font-medium transition-colors px-2 py-1 rounded-md flex items-center space-x-1.5 {index === breadcrumbs.length - 1
									? 'text-foreground bg-accent/50'
									: crumb.isHome
									? 'text-primary hover:bg-primary/10'
									: 'text-muted-foreground hover:text-foreground hover:bg-accent/50'}"
							>
								{#if crumb.icon}
									<div class="w-5 h-5 rounded flex items-center justify-center" style="background-color: {crumb.color}20; border: 1px solid {crumb.color}">
										<IconDisplay icon={crumb.icon} iconType={crumb.iconType} size="xs" />
									</div>
								{/if}
								<span>{crumb.name}</span>
							</a>
						{/each}
					</nav>
				</div>
			</div>
		</div>

	</header>

	<!-- Main content -->
	<main class="theme-transition">
		{@render children?.()}
	</main>

	<!-- Floating Action Button -->
	<div class="fixed bottom-6 right-6 z-40">
		<div class="relative">
			<!-- FAB Button -->
			<button
				onclick={() => showFabDropdown = !showFabDropdown}
				class="w-14 h-14 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center justify-center group hover:from-orange-600 hover:to-red-600"
				title="Add Expense"
			>
				<Plus class="w-6 h-6 transition-transform duration-300 {showFabDropdown ? 'rotate-45' : ''}" weight="bold" />
			</button>

			<!-- FAB Dropdown -->
			{#if showFabDropdown}
				<div class="absolute bottom-full right-0 mb-4 w-72 bg-background border border-border rounded-lg shadow-xl z-50 animate-in slide-in-from-bottom-2 duration-200">
					<div class="py-3">
						<div class="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border">
							Add Expense To
						</div>
						{#each suggestedVaults as vault, index}
							<button
								onclick={() => handleQuickAdd(vault.vault.id)}
								class="w-full flex items-center px-4 py-3 text-sm transition-colors hover:bg-accent group"
							>
								<div class="w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm transition-transform group-hover:scale-105" style="background-color: {vault.vault.color}20; border: 1px solid {vault.vault.color}">
									{vault.vault.icon}
								</div>
								<div class="flex-1 text-left">
									<div class="font-medium text-foreground">{vault.vault.name}</div>
									<div class="text-xs text-muted-foreground">
										{vault.vault.isPersonal ? 'Personal' : 'Shared'} vault
										{#if index === 0}
											• Suggested
										{/if}
									</div>
								</div>
								<div class="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
									<CaretRight class="w-4 h-4" />
								</div>
							</button>
						{/each}

						{#if data.vaults.length > 5}
							<div class="border-t border-border mt-2 pt-2">
								<button
									onclick={() => { showFabDropdown = false; goto('/vaults'); }}
									class="w-full flex items-center px-4 py-3 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
								>
									<div class="w-8 h-8 rounded-full bg-muted flex items-center justify-center mr-3 text-xs">
										⋯
									</div>
									<span>View all vaults ({data.vaults.length})</span>
								</button>
							</div>
						{/if}
					</div>
				</div>
			{/if}
		</div>
	</div>
</div>
