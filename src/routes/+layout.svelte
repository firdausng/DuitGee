<script lang="ts">
    import '../app.css';
    import favicon from '$lib/assets/favicon.svg';
    import { theme } from '$lib/stores/theme.svelte.js';

    let {children} = $props();

    // Initialize theme on app start
    $effect(() => {
        // Add preload class to prevent flash
        document.documentElement.classList.add('preload');

        theme.init();

        // Remove preload class after theme is initialized to enable transitions
        setTimeout(() => {
            document.documentElement.classList.remove('preload');
        }, 100);
    });
</script>

<svelte:head>
    <link rel="icon" href={favicon}/>
</svelte:head>

{@render children?.()}
