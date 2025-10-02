import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	optimizeDeps: {
		include: ['bits-ui']
	},
	build: {
		rollupOptions: {
			output: {
				manualChunks: (id) => {
					// Separate bits-ui into its own chunk
					if (id.includes('bits-ui')) {
						return 'bits-ui';
					}
					// Group all phosphor icons into one chunk
					if (id.includes('phosphor-svelte')) {
						return 'phosphor-icons';
					}
					// Separate node_modules into vendor chunk
					if (id.includes('node_modules')) {
						return 'vendor';
					}
				}
			}
		}
	}
});
