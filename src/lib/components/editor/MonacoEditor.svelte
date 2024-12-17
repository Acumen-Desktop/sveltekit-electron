<script>
	import { onMount } from 'svelte';
	import * as monaco from 'monaco-editor';
	import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
	import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
	import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker';
	import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker';
	import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';

	let editorContainer;
	let editor;

	self.MonacoEnvironment = {
		getWorker(_, label) {
			if (label === 'json') {
				return new jsonWorker();
			}
			if (label === 'css' || label === 'scss' || label === 'less') {
				return new cssWorker();
			}
			if (label === 'html' || label === 'handlebars' || label === 'razor') {
				return new htmlWorker();
			}
			if (label === 'typescript' || label === 'javascript') {
				return new tsWorker();
			}
			return new editorWorker();
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
</script>

<div bind:this={editorContainer} style="width: 95%; height: 600px;"></div>

<style>
	div {
		border: 1px solid #ccc;
		margin: 20px;
	}
</style>
