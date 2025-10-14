<script lang="ts">
    import {authClientBase} from "$lib/auth-client-base";

    let {data} = $props()

    const authClient = authClientBase({basePath: data.basePath});
    const organizations = authClient.useListOrganizations;

</script>

<svelte:head>
    <title>Admin - DuitGee</title>
</svelte:head>

<h1>Organizations</h1>
{#if $organizations.isPending}
    <p>Loading...</p>
{:else if !$organizations.data?.length}
    <p>No organizations found.</p>
{:else}
    <ul>
        {#each $organizations.data as organization}
            <li>{organization.name}</li>
        {/each}
    </ul>
{/if}