/// <reference types="@sveltejs/kit" />

declare module '$app/navigation' {
    export function goto(href: string, opts?: { replaceState?: boolean }): Promise<void>;
}

// Add other SvelteKit module declarations as needed
declare module '$app/environment' {
    export const browser: boolean;
    export const dev: boolean;
}

declare module '$app/stores' {
    import { Readable } from 'svelte/store';
    export const page: Readable<any>;
    export const navigating: Readable<any>;
}
