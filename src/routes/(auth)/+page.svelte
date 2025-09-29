<script lang="ts">
	import { goto } from '$app/navigation';
    import {onMount} from "svelte";

    let { data } = $props();

    onMount(() => {
        // No vaults available, redirect to vaults page to create one
        goto('/vaults');
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
