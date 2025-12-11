<script lang="ts">
	import '../app.css';
	import posthog from 'posthog-js';
	import favicon from '$lib/assets/favicon.svg';
    import { ModeWatcher } from "mode-watcher";
	import {onMount} from "svelte";
	import {browser, dev} from "$app/environment";
	
	let { children, data } = $props();

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
	<link rel="icon" href={favicon} />
</svelte:head>

<ModeWatcher />
{@render children?.()}
