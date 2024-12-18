<script lang="ts">
	import { onMount } from 'svelte';
	import { Filemanager } from 'wx-svelte-filemanager';
	import type { FileInfo } from '../../../electron/main/fileSystem/types';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher<{
		fileSelect: { path: string; content: string };
		error: string;
	}>();

	let files: FileInfo[] = [];
	let currentPath = '';
	let loading = true;
	let error: string | null = null;

	async function loadDirectory(path: string = '') {
		try {
			loading = true;
			error = null;
			const result = await window.fs.listDirectory(path);
			if (result.success && result.data) {
				files = result.data;
				currentPath = path;
			} else {
				error = result.error || 'Failed to load directory';
			}
		} catch (err) {
			error = err instanceof Error ? err.message : 'Unknown error';
		} finally {
			loading = false;
		}
	}

	async function handleFileSelect(event: CustomEvent<{ id: string }>) {
		try {
			const result = await window.fs.readFile(event.detail.id);
			if (result.success && result.data) {
				dispatch('fileSelect', {
					path: result.data.info.path,
					content: result.data.content
				});
			} else {
				dispatch('error', result.error || 'Failed to read file');
			}
		} catch (err) {
			dispatch('error', err instanceof Error ? err.message : 'Unknown error');
		}
	}

	async function handleCreateFile(event: CustomEvent<{ name: string; type: 'file' | 'folder' }>) {
		try {
			const path = currentPath ? `${currentPath}/${event.detail.name}` : event.detail.name;
			const result = await window.fs.createFile({
				name: path,
				type: event.detail.type,
				content: event.detail.type === 'file' ? '' : undefined
			});

			if (result.success) {
				await loadDirectory(currentPath);
			} else {
				dispatch('error', result.error || 'Failed to create file/folder');
			}
		} catch (err) {
			dispatch('error', err instanceof Error ? err.message : 'Unknown error');
		}
	}

	async function handleDelete(event: CustomEvent<{ id: string }>) {
		try {
			const result = await window.fs.deleteFile(event.detail.id);
			if (result.success) {
				await loadDirectory(currentPath);
			} else {
				dispatch('error', result.error || 'Failed to delete file/folder');
			}
		} catch (err) {
			dispatch('error', err instanceof Error ? err.message : 'Unknown error');
		}
	}

	async function handleRename(event: CustomEvent<{ oldId: string; newName: string }>) {
		try {
			const result = await window.fs.renameFile({
				oldPath: event.detail.oldId,
				newName: event.detail.newName
			});

			if (result.success) {
				await loadDirectory(currentPath);
			} else {
				dispatch('error', result.error || 'Failed to rename file/folder');
			}
		} catch (err) {
			dispatch('error', err instanceof Error ? err.message : 'Unknown error');
		}
	}

	onMount(async () => {
		await loadDirectory();
	});
</script>

{#if error}
	<div class="error" role="alert">
		{error}
	</div>
{/if}

<div class="filemanager-container" class:loading>
	<Filemanager
		data={files}
		on:fileSelect={handleFileSelect}
		on:createFile={handleCreateFile}
		on:delete={handleDelete}
		on:rename={handleRename}
	/>
</div>

<style>
	.filemanager-container {
		height: 100%;
		width: 100%;
		position: relative;
	}

	.loading {
		opacity: 0.7;
		pointer-events: none;
	}

	.error {
		color: red;
		padding: 8px;
		margin-bottom: 8px;
		border: 1px solid red;
		border-radius: 4px;
		background-color: rgba(255, 0, 0, 0.1);
	}
</style>
