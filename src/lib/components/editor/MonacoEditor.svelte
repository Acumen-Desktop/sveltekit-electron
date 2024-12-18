<script lang="ts">
	import { onMount } from 'svelte';
	import * as monaco from 'monaco-editor';
	import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
	import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
	import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker';
	import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker';
	import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';

	let editorContainer: HTMLElement;
	let editor: monaco.editor.IStandaloneCodeEditor | null = null;
	let currentFile: { path: string; content: string } | null = null;
	let saving = false;

	// Props
	export let path: string | null = null;
	export let content = '';
	export let language = 'plaintext';
	export let readOnly = false;

	// Event dispatcher
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher<{
		save: { path: string; content: string };
		error: string;
	}>();

	self.MonacoEnvironment = {
		getWorker(_moduleId: string, label: string): Worker {
			if (label === 'json') {
				return new (jsonWorker as unknown as WorkerConstructor)();
			}
			if (label === 'css' || label === 'scss' || label === 'less') {
				return new (cssWorker as unknown as WorkerConstructor)();
			}
			if (label === 'html' || label === 'handlebars' || label === 'razor') {
				return new (htmlWorker as unknown as WorkerConstructor)();
			}
			if (label === 'typescript' || label === 'javascript') {
				return new (tsWorker as unknown as WorkerConstructor)();
			}
			return new (editorWorker as unknown as WorkerConstructor)();
		}
	};

	// Detect file language based on extension
	function detectLanguage(filePath: string): string {
		const ext = filePath.split('.').pop()?.toLowerCase() || '';
		const languageMap: Record<string, string> = {
			js: 'javascript',
			ts: 'typescript',
			json: 'json',
			html: 'html',
			css: 'css',
			scss: 'scss',
			less: 'less',
			md: 'markdown',
			svelte: 'html', // Using HTML for now, could be enhanced with Svelte syntax
			txt: 'plaintext'
		};
		return languageMap[ext] || 'plaintext';
	}

	// Save file content
	async function saveFile() {
		if (!currentFile || !editor) return;

		try {
			saving = true;
			const result = await window.fs.updateFile({
				path: currentFile.path,
				content: editor.getValue()
			});

			if (result.success) {
				dispatch('save', {
					path: currentFile.path,
					content: editor.getValue()
				});
			} else {
				dispatch('error', result.error || 'Failed to save file');
			}
		} catch (err) {
			dispatch('error', err instanceof Error ? err.message : 'Unknown error');
		} finally {
			saving = false;
		}
	}

	// Handle keyboard shortcuts
	function handleKeyboard(e: KeyboardEvent) {
		if ((e.metaKey || e.ctrlKey) && e.key === 's') {
			e.preventDefault();
			void saveFile();
		}
	}

	// Update editor content and language when file changes
	$: if (editor && path) {
		currentFile = { path, content };
		editor.setValue(content);
		editor.updateOptions({ readOnly });
		monaco.editor.setModelLanguage(editor.getModel()!, detectLanguage(path));
	}

	onMount(() => {
		editor = monaco.editor.create(editorContainer, {
			value: content,
			language: detectLanguage(path || ''),
			theme: 'vs-dark',
			minimap: { enabled: false },
			automaticLayout: true,
			readOnly
		});

		// Add keyboard listener
		window.addEventListener('keydown', handleKeyboard);

		return () => {
			window.removeEventListener('keydown', handleKeyboard);
			if (editor) {
				editor.dispose();
			}
		};
	});

	type WorkerConstructor = new () => Worker;
</script>

<svelte:window on:keydown={handleKeyboard} />

<div class="editor-container" class:saving>
	<main id="monaco-editor" bind:this={editorContainer}></main>
</div>

<style>
	.editor-container {
		position: relative;
		height: 100%;
		width: 100%;
	}

	.saving {
		opacity: 0.7;
		pointer-events: none;
	}

	main#monaco-editor {
		border: 1px solid #ccc;
		padding: 1px;
		height: 100%;
		width: 100%;
	}
</style>
