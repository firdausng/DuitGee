<script lang="ts">
    import {adminAuthClientBase} from "$lib/auth-client-base";

    let {data} = $props()

    const adminClient = adminAuthClientBase({basePath: data.basePath});
    const session = adminClient.useSession;

</script>

<svelte:head>
    <title>Admin - DuitGee</title>
</svelte:head>

<div class="flex flex-col gap-4">

</div>