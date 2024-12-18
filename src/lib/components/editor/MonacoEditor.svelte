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

	onMount(() => {
		editor = monaco.editor.create(editorContainer, {
			value: '// Type your code here\nconsole.log("Hello Monaco!");',
			language: 'javascript',
			theme: 'vs-dark',
			minimap: { enabled: false },
			automaticLayout: true
		});

		return () => {
			if (editor) {
				editor.dispose();
			}
		};
	});

	type WorkerConstructor = new () => Worker;
</script>

<main id="monaco-editor" bind:this={editorContainer}></main>

<style>
	main#monaco-editor {
		border: 1px solid #ccc;
		padding: 1px;
		height: 100%;
		width: 100%;
	}
</style>
