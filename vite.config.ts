import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
	plugins: [sveltekit(), tailwindcss()],
	optimizeDeps: {
		exclude: ['monaco-editor']
	},
	resolve: {
		alias: {
			'monaco-editor': 'monaco-editor/esm/vs/editor/editor.main.js'
		}
	}
});
