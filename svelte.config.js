import adapter from '@sveltejs/adapter-cloudflare';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: vitePreprocess(),
	kit: { adapter: adapter() },
    vitePlugin: {
        inspector: {
            toggleKeyCombo: 'ctrl+shift+i',
            showToggleButton: 'always',
            showPanelButton: 'always',
        }
    }
};

export default config;