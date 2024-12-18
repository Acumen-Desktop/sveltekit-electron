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
	let currentValue = '';
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
			md: 'markdown',
			markdown: 'markdown',
			txt: 'plaintext'
		};
		return languageMap[ext] || 'plaintext';
	}

	$: if (editor && content !== currentValue) {
		currentValue = content;
		const position = editor.getPosition();
		editor.setValue(content);
		if (position) {
			editor.setPosition(position);
		}
	}

	// Initialize editor with markdown-specific settings
	function initEditor() {
		if (!editorContainer) return;

		// Configure editor settings
		const options: monaco.editor.IStandaloneEditorConstructionOptions = {
			value: content,
			language: path ? detectLanguage(path) : language,
			theme: 'vs-dark',
			automaticLayout: true,
			minimap: { enabled: true },
			wordWrap: 'on',
			lineNumbers: 'on',
			readOnly,
			scrollBeyondLastLine: false,
			renderWhitespace: 'boundary',
			quickSuggestions: true,
			contextmenu: true,
			renderControlCharacters: true,
			fontSize: 14,
			lineHeight: 21,
			tabSize: 2,
			insertSpaces: true,
			cursorStyle: 'line',
			cursorBlinking: 'blink',
			cursorSmoothCaretAnimation: 'on',
			roundedSelection: true,
			links: true,
			mouseWheelZoom: true,
			multiCursorModifier: 'alt',
			accessibilitySupport: 'on',
			// Markdown-specific settings
			wordBasedSuggestions: 'allDocuments',
			suggest: {
				showWords: true
			},
			// Enable basic formatting commands
			extraEditorClassName: 'markdown-editor'
		};

		editor = monaco.editor.create(editorContainer, options);

		// Add keyboard shortcuts for basic markdown formatting
		editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyB, () => {
			insertMarkdownSyntax('**', '**');
		});
		editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyI, () => {
			insertMarkdownSyntax('*', '*');
		});

		// Add save command
		editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
			handleSave();
		});

		// Update content when editor changes
		editor.onDidChangeModelContent(() => {
			if (editor) {
				currentValue = editor.getValue();
				content = currentValue;
			}
		});

		// Focus the editor
		editor.focus();
	}

	// Helper function to insert markdown syntax
	function insertMarkdownSyntax(prefix: string, suffix: string) {
		if (!editor) return;

		const selection = editor.getSelection();
		if (!selection) return;

		const selectedText = editor.getModel()?.getValueInRange(selection) || '';
		const newText = prefix + selectedText + suffix;

		editor.executeEdits('markdown-formatting', [
			{
				range: selection,
				text: newText,
				forceMoveMarkers: true
			}
		]);
	}

	// Save file content
	async function handleSave() {
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

	// Handle keyboard events
	function handleKeyboard(e: KeyboardEvent) {
		if ((e.metaKey || e.ctrlKey) && e.key === 's') {
			e.preventDefault();
			void handleSave();
		}
	}

	// Handle window resize
	function handleResize() {
		if (editor) {
			editor.layout();
		}
	}

	onMount(() => {
		initEditor();
		window.addEventListener('keydown', handleKeyboard);
		window.addEventListener('resize', handleResize);

		return () => {
			window.removeEventListener('keydown', handleKeyboard);
			window.removeEventListener('resize', handleResize);
			if (editor) {
				editor.dispose();
			}
		};
	});

	$: if (editor && path) {
		currentFile = { path, content };
		editor.updateOptions({ readOnly });
		monaco.editor.setModelLanguage(editor.getModel()!, detectLanguage(path));
	}

	type WorkerConstructor = new () => Worker;
</script>

<svelte:window on:keydown={handleKeyboard} />

<div bind:this={editorContainer} class="editor-container"></div>

<style>
	.editor-container {
		width: 100%;
		height: 100%;
		min-height: 300px;
		position: relative;
		overflow: hidden;
	}

	:global(.markdown-editor) {
		padding: 8px;
	}

	:global(.monaco-editor) {
		position: absolute !important;
		top: 0;
		right: 0;
		bottom: 0;
		left: 0;
	}
</style>
