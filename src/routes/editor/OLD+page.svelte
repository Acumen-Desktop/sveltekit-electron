<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import * as monaco from 'monaco-editor';
	import '../../lib/monaco-worker-loader';

	// Editor instance reference
	let editorInstance: monaco.editor.IStandaloneCodeEditor | null = null;
	let editorContainer: HTMLElement;

	// Initialize editor when component mounts
	onMount(() => {
		if (editorContainer) {
			editorInstance = monaco.editor.create(editorContainer, {
				value: '// Type your code here\nfunction hello() {\n\tconsole.log("Hello world!");\n}',
				language: 'typescript',
				theme: 'vs-dark',
				automaticLayout: true,
				minimap: { enabled: false },
				fontSize: 14,
				lineNumbers: 'on',
				roundedSelection: false,
				scrollBeyondLastLine: false,
				readOnly: false,
				cursorStyle: 'line',
				tabSize: 2,
				wordWrap: 'on'
			});

			// Add window resize handler
			const resizeEditor = () => {
				if (editorInstance) {
					editorInstance.layout();
				}
			};
			window.addEventListener('resize', resizeEditor);

			// Cleanup resize handler
			return () => {
				window.removeEventListener('resize', resizeEditor);
			};
		}
	});

	// Cleanup when component is destroyed
	onDestroy(() => {
		if (editorInstance) {
			editorInstance.dispose();
		}
	});
</script>

<main class="editor-container">
	<div bind:this={editorContainer} class="monaco-editor"></div>
</main>

<style>
	.editor-container {
		width: 100%;
		height: 100vh;
		display: flex;
		flex-direction: column;
		background-color: #1e1e1e;
	}

	.monaco-editor {
		flex: 1;
		min-height: 0;
	}

	:global(.monaco-editor .overflow-guard) {
		border-radius: 4px;
	}
</style>
