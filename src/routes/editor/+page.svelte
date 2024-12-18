<script lang="ts">
	import { onMount } from 'svelte';
	import MonacoEditor from '$lib/components/editor/MonacoEditor.svelte';
	import Filemanager from '$lib/components/editor/Filemanager.svelte';
	import * as Resizable from '$lib/components/ui/resizable/index.js';
	import { writable } from 'svelte/store';

	// Stores for managing state
	const currentFile = writable<{ path: string; content: string; isNew?: boolean } | null>(null);
	const error = writable<string | null>(null);
	const saveStatus = writable<string | null>(null);
	const isLoading = writable<boolean>(false);
	const electronFilesPath = writable<string>('');

	// Async function to get default path
	async function getDefaultPath(): Promise<string> {
		return (
			import.meta.env.VITE_DEFAULT_PATH ||
			(window.api.getDesktopPath ? await window.api.getDesktopPath() : '~/Documents')
		);
	}

	// Use a store or variable to hold the default path
	let defaultPath = '~/Documents';

	// Initialize default path on mount
	onMount(async () => {
		defaultPath = await getDefaultPath();
		await initializeFileSystem();
	});

	// Initialize file system
	async function initializeFileSystem() {
		try {
			const desktopPath = await window.api.getDesktopPath();
			const fapPath = await window.api.getElectronFilesPath();

			console.log('Desktop Path:', desktopPath);
			console.log('FAP Electron Files Path:', fapPath);

			if (fapPath) {
				electronFilesPath.set(fapPath);
				// Ensure the directory exists by trying to list its contents
				await window.fs.listDirectory('');
			} else {
				error.set('Failed to get electron files path');
			}
		} catch (err) {
			console.error('Error initializing file system:', err);
			error.set('Error initializing file system');
		}
	}

	// Function to create a new markdown file
	async function createNewMarkdown() {
		try {
			const defaultContent = '# New Markdown File\n\nStart writing here...';
			const timestamp = new Date().getTime();
			const fileName = `new_file_${timestamp}.md`;

			console.log('Line 89 - Creating new file:', fileName);

			isLoading.set(true);
			const result = await window.fs.createFile({
				name: fileName,
				content: defaultContent,
				type: 'file'
			});

			if (result.success) {
				currentFile.set({
					path: fileName,
					content: defaultContent,
					isNew: true
				});
				error.set(null);
			} else {
				error.set(`Failed to create new file: ${result.error || 'Unknown error'}`);
			}
		} catch (err) {
			console.error('Line 42 - +page.svelte - Error creating file:', err);
			error.set('Error creating new file');
		} finally {
			isLoading.set(false);
		}
	}

	// Handle file selection
	function handleFileSelect(event: CustomEvent<{ path: string; content: string }>) {
		currentFile.set(event.detail);
		error.set(null);
		saveStatus.set(null);
	}

	// Handle file save with proper error handling
	async function handleFileSave(event: CustomEvent<{ path: string; content: string }>) {
		try {
			isLoading.set(true);
			const result = await window.fs.updateFile({
				path: event.detail.path,
				content: event.detail.content
			});

			if (result.success) {
				saveStatus.set('File saved successfully');
				currentFile.update((file) => {
					if (!file) return null;
					return {
						...file,
						content: event.detail.content,
						isNew: false
					};
				});
			} else {
				error.set('Failed to save file');
			}
		} catch (err) {
			console.error('Line 71 - +page.svelte - Error saving file:', err);
			error.set('Error saving file');
		} finally {
			isLoading.set(false);
			setTimeout(() => saveStatus.set(null), 2000);
		}
	}

	// Handle errors
	function handleError(event: CustomEvent<string>) {
		error.set(event.detail);
		saveStatus.set(null);
		setTimeout(() => error.set(null), 5000);
	}
</script>

<header>
	<div class="flex justify-between items-center p-4 border-b">
		<h3>Editor</h3>
		<button
			class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
			onclick={createNewMarkdown}
			disabled={$isLoading}
		>
			{$isLoading ? 'Creating...' : 'New Markdown'}
		</button>
	</div>
	{#if $error}
		<div class="error bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
			{$error}
		</div>
	{/if}
	{#if $saveStatus}
		<div
			class="save-status bg-green-100 border-l-4 border-green-500 text-green-700 p-4"
			role="status"
		>
			{$saveStatus}
		</div>
	{/if}
</header>

<main>
	<Resizable.PaneGroup direction="horizontal" class="h-screen w-full">
		<!-- Left Pane (Explorer) -->
		<Resizable.Pane id="explorer" defaultSize={20} minSize={1} maxSize={50}>
			<Filemanager on:fileSelect={handleFileSelect} on:error={handleError} />
		</Resizable.Pane>

		<Resizable.Handle withHandle />

		<!-- Middle Pane (Editor + Terminal) -->
		<Resizable.Pane id="middle-section" defaultSize={60}>
			<Resizable.PaneGroup direction="vertical">
				<!-- Editor Area -->
				<Resizable.Pane id="editor" defaultSize={70}>
					<MonacoEditor
						path={$currentFile?.path}
						content={$currentFile?.content ?? ''}
						readOnly={!$currentFile}
						on:save={handleFileSave}
						on:error={handleError}
					/>
				</Resizable.Pane>

				<Resizable.Handle withHandle />

				<!-- Terminal Area -->
				<Resizable.Pane id="terminal" defaultSize={30} minSize={0.5}>
					<div class="h-full bg-background p-4">
						<span class="font-semibold">Terminal</span>
					</div>
				</Resizable.Pane>
			</Resizable.PaneGroup>
		</Resizable.Pane>

		<Resizable.Handle withHandle />

		<!-- Right Pane (Preview/Details) -->
		<Resizable.Pane id="preview" defaultSize={20} minSize={0.5} maxSize={50}>
			<div class="h-full bg-background p-4">
				<span class="font-semibold">Preview/Details</span>
			</div>
		</Resizable.Pane>
	</Resizable.PaneGroup>
</main>

<footer>
	<h3>Footer</h3>
</footer>

<style>
	header {
		height: 42px;
		position: relative;
	}

	.error,
	.save-status {
		position: absolute;
		top: 0.5rem;
		right: 1rem;
		padding: 0.5rem 1rem;
		border-radius: 4px;
		color: white;
		font-size: 0.875rem;
		max-width: 400px;
		z-index: 1000;
	}

	.error {
		background-color: #ff4444;
	}

	.save-status {
		background-color: #44b544;
	}

	main {
		height: calc(100vh - 78px);
	}

	footer {
		height: 36px;
	}
</style>
