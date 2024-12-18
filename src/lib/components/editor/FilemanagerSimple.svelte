<script lang="ts">
	import { onMount } from 'svelte';
	import type { FileInfo } from '$lib/types/fileSystemTypes';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher<{
		fileSelect: { path: string; content: string };
		error: string;
	}>();

	let files: FileInfo[] = [];
	let currentPath = '';
	let loading = true;
	let error: string | null = null;

	// Load directory contents
	async function loadDirectory(path: string = '') {
		try {
			loading = true;
			error = null;
			console.log('Line 21 - Filemanager.svelte - Loading directory:', path);
			const result = await window.fs.listDirectory(path);
			if (result.success && result.data) {
				files = result.data;
				currentPath = path;
			} else {
				error = result.error || 'Failed to load directory';
			}
		} catch (err) {
			console.error('Line 30 - Filemanager.svelte - Error loading directory:', err);
			error = err instanceof Error ? err.message : 'Unknown error';
		} finally {
			loading = false;
		}
	}

	// Handle file selection
	async function handleFileSelect(filePath: string) {
		try {
			console.log('Line 40 - Filemanager.svelte - Selected file:', filePath);
			const result = await window.fs.readFile(filePath);
			if (result.success && result.data) {
				dispatch('fileSelect', {
					path: result.data.info.path,
					content: result.data.content
				});
			} else {
				dispatch('error', result.error || 'Failed to read file');
			}
		} catch (err) {
			console.error('Line 50 - Filemanager.svelte - Error reading file:', err);
			dispatch('error', err instanceof Error ? err.message : 'Unknown error');
		}
	}

	// Initialize on mount
	onMount(() => {
		void loadDirectory();
	});
</script>

<div class="file-manager">
	<div class="header">
		<h3>Files</h3>
		{#if loading}
			<span class="loading">Loading...</span>
		{/if}
	</div>

	{#if error}
		<div class="error" role="alert">
			{error}
		</div>
	{/if}

	<div class="files-list">
		{#if files.length === 0 && !loading}
			<div class="empty-state">No files found</div>
		{:else}
			{#each files as file (file.path)}
				<div 
					class="file-item"
					class:folder={file.type === 'folder'}
					onclick={() => file.type === 'file' ? handleFileSelect(file.path) : loadDirectory(file.path)}
				>
					<span class="icon">{file.type === 'folder' ? '📁' : '📄'}</span>
					<span class="name">{file.name}</span>
				</div>
			{/each}
		{/if}
	</div>
</div>

<style>
	.file-manager {
		height: 100%;
		display: flex;
		flex-direction: column;
		background: var(--background-color, #1e1e1e);
		color: var(--text-color, #d4d4d4);
	}

	.header {
		padding: 8px;
		border-bottom: 1px solid var(--border-color, #333);
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.loading {
		font-size: 0.8em;
		color: var(--text-muted, #888);
	}

	.error {
		padding: 8px;
		margin: 8px;
		background: var(--error-background, #442222);
		color: var(--error-text, #ff8888);
		border-radius: 4px;
	}

	.files-list {
		flex: 1;
		overflow-y: auto;
		padding: 8px;
	}

	.empty-state {
		padding: 16px;
		text-align: center;
		color: var(--text-muted, #888);
	}

	.file-item {
		padding: 6px 8px;
		margin: 2px 0;
		display: flex;
		align-items: center;
		cursor: pointer;
		border-radius: 4px;
		transition: background-color 0.2s;
	}

	.file-item:hover {
		background: var(--hover-background, #2a2a2a);
	}

	.file-item.folder {
		font-weight: 500;
	}

	.icon {
		margin-right: 8px;
	}

	.name {
		flex: 1;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
</style>
