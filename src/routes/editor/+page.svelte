<script lang="ts">
	import { onMount } from 'svelte';
	import MonacoEditor from '$lib/components/editor/MonacoEditor.svelte';
	import Filemanager from '$lib/components/editor/Filemanager.svelte';
	import * as Resizable from '$lib/components/ui/resizable/index.js';
	import { writable } from 'svelte/store';

	// Stores for managing state
	const currentFile = writable<{ path: string; content: string } | null>(null);
	const error = writable<string | null>(null);
	const saveStatus = writable<string | null>(null);

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

	// Handle file selection
	function handleFileSelect(event: CustomEvent<{ path: string; content: string }>) {
		currentFile.set(event.detail);
		error.set(null);
		saveStatus.set(null);
	}

	// Handle file save
	function handleFileSave(event: CustomEvent<{ path: string; content: string }>) {
		error.set(null);
		saveStatus.set('File saved successfully');
		currentFile.update((file) => {
			if (!file) return null;
			return {
				...file,
				content: event.detail.content
			};
		});
		setTimeout(() => saveStatus.set(null), 2000);
	}

	// Handle errors
	function handleError(event: CustomEvent<string>) {
		error.set(event.detail);
		saveStatus.set(null);
		setTimeout(() => error.set(null), 5000);
	}

	// Initialize file system
	async function initializeFileSystem() {
		try {
			const electronFilesPath = (await window.api.getElectronFilesPath?.()) ?? defaultPath;
			console.log(' Line 61: - Electron Files Path:', electronFilesPath);
		} catch (error) {
			console.error(' Line 63: - Error initializing file system:', error);
		}
	}
</script>

<header>
	<h3>Editor</h3>
	{#if $error}
		<div class="error" role="alert">
			{$error}
		</div>
	{/if}
	{#if $saveStatus}
		<div class="save-status" role="status">
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
