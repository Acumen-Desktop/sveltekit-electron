declare module 'wx-svelte-filemanager' {
	// Add any type definitions you need here
	import { SvelteComponentTyped } from 'svelte';

	export class FileManager extends SvelteComponentTyped<{
		// Add props types here if known
		[key: string]: unknown;
	}> {}
}
