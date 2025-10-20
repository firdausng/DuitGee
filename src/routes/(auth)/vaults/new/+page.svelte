<script lang="ts">
	import CreateVaultForm from '$lib/components/CreateVaultForm.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { goto } from '$app/navigation';
    import {ofetch} from "ofetch";
    import type {CreateVault} from "$lib/schemas/expense";
    import {authClientBase} from "$lib/auth-client-base";

	let { data } = $props();

    async function handleSubmit(data: CreateVault) {

        if(!data.isPersonal){
            let authClient = authClientBase({basePath: data.basePath});

            const { data: organizationList, error } = await authClient.organization.list();

            if(error){
                console.error(error);
                return;
            }

            if(organizationList.length === 0){
                const metadata = { someKey: "someValue" };
                const org = await authClient.organization.create({
                    name: "abc", // required
                    slug: "my-org", // required
                    metadata,
                    userId: data.currentUserId, // server-only
                    // keepCurrentActiveOrganization: false,
                });
            }
        }

        const response = await ofetch(`/api/vaults`, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json'
            }
        });
        if(response.success){
            await goto(`/vaults/${response.data.id}`);
        }
    }
</script>

<svelte:head>
	<title>Create New Vault - DuitGee</title>
</svelte:head>

<div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
	<div class="mb-8">
		<h1 class="text-3xl font-bold text-foreground font-display">Create New Vault</h1>
		<p class="mt-2 text-muted-foreground">
			Create a new vault to organize your expenses. You can make it personal or share it with others.
		</p>
	</div>

	{#if data.isVaultLimitReach}
		<Card class="p-6 border-warning bg-warning/5">
			<div class="flex items-start space-x-4">
				<div class="flex-shrink-0">
					<LockKey class="w-6 h-6 text-warning" />
				</div>
				<div class="flex-1 space-y-3">
					<div>
						<h3 class="text-lg font-semibold text-foreground">Vault Limit Reached</h3>
						<p class="mt-1 text-sm text-muted-foreground">
							You have reached the maximum limit of 5 vaults. To create a new vault, please delete an existing vault first.
						</p>
					</div>
					<Button
						variant="outline"
						onclick={() => goto('/vaults')}
						class="w-full sm:w-auto"
					>
						Go to My Vaults
					</Button>
				</div>
			</div>
		</Card>
	{:else}
		<Card class="p-6">
			<CreateVaultForm formData={data.form} currentUserId={data.currentUserId} onSubmit={() => goto('/vaults')} />
		</Card>
	{/if}
</div>