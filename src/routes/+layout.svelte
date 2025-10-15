<script lang="ts">
    import '../app.css';
    import posthog from 'posthog-js'
    import favicon from '$lib/assets/favicon.svg';
    import { theme } from '$lib/stores/theme.svelte.js';
    import { navigating } from '$app/stores';
    import {onMount} from "svelte";
    import {browser, dev} from "$app/environment";

    let {children, data} = $props();

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

    onMount(() => {
        if (browser && !dev) {
            posthog.init(
                data.posthogKey,
                {
                    api_host: 'https://us.i.posthog.com',
                    defaults: '2025-05-24',
                    person_profiles: 'always', // or 'always' to create profiles for anonymous users as well
                }
            )
        }
        return
    });
</script>

<svelte:head>
    <link rel="icon" href={favicon}/>
</svelte:head>

<!-- Top loading bar for page transitions -->
{#if $navigating}
    <div class="loading-bar"></div>
{/if}

<style>
    .loading-bar {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        height: 3px;
        background: linear-gradient(90deg, #3b82f6, #60a5fa);
        z-index: 9999;
        transform-origin: left;
        animation: loading 2s ease-in-out;
    }

    @media (prefers-color-scheme: dark) {
        .loading-bar {
            background: linear-gradient(90deg, #60a5fa, #93c5fd);
        }
    }

    :global(.dark) .loading-bar {
        background: linear-gradient(90deg, #60a5fa, #93c5fd);
    }

    @keyframes loading {
        0% {
            transform: scaleX(0);
        }
        50% {
            transform: scaleX(0.7);
        }
        100% {
            transform: scaleX(0.95);
        }
    }
</style>

{@render children?.()}
