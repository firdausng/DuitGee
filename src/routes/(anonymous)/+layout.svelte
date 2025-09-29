<script lang="ts">
    import favicon from '$lib/assets/favicon.svg';
    import ThemeToggle from '$lib/components/ui/ThemeToggle.svelte';

    let {children} = $props();
</script>

<svelte:head>
    <link rel="icon" href={favicon}/>
</svelte:head>

<!-- Theme toggle for anonymous pages -->
<div class="fixed top-4 right-4 z-50">
    <ThemeToggle />
</div>

{@render children?.()}

