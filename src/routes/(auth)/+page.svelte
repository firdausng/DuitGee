<script lang="ts">
	import { goto } from '$app/navigation';
    import {onMount} from "svelte";
    import {ofetch} from "ofetch";
    import type {VaultWithMember} from "$lib/schemas/read/vaultWithMember";

    let { data } = $props();
    let isLoading = $state(true);
    onMount(async () => {
        try {
            const response = await ofetch<{success: boolean, data: VaultWithMember[]}>(`/api/getVaults`);
            const defaultVault = response.data.filter(d => d.vaultMembers.isDefault);

            if(defaultVault.length > 0){
                goto(`/vaults/${defaultVault[0].vaults.id}`);
            }else{
                // No vaults available, redirect to vaults page to create one
                goto('/vaults');
            }

        } catch (error) {
            console.error('Failed to fetch vaults:', error);
        } finally {
            isLoading = false;
        }
    });

</script>

<svelte:head>
	<title>DuitGee - Loading...</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 flex items-center justify-center">
	<div class="text-center">
		<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
		<p class="mt-4 text-gray-600">Loading your vaults...</p>
	</div>
</div>
