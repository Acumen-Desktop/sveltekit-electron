<script lang="ts">
	import MonacoEditor from '$lib/components/editor/MonacoEditor.svelte';
	import Filemanager from '$lib/components/editor/Filemanager.svelte';
	import * as Resizable from '$lib/components/ui/resizable/index.js';

	// const desktopPath = window.api.getDesktopPath();
	// const electronFilesPath = window.api.getElectronFilesPath();
	// console.log(
	// 	'Line 8 - editor.svelte: desktopPath, electronFilesPath',
	// 	desktopPath,
	// 	electronFilesPath
	// );
</script>

<header>
	<h3>Editor</h3>
</header>
<main>
	<Resizable.PaneGroup direction="horizontal" class="h-screen w-full">
		<!-- Left Pane (Explorer) -->
		<Resizable.Pane id="explorer" defaultSize={20} minSize={1} maxSize={50}>
			<Filemanager />
		</Resizable.Pane>

		<Resizable.Handle withHandle />

		<!-- Middle Pane (Editor + Terminal) -->
		<Resizable.Pane id="middle-section" defaultSize={60}>
			<Resizable.PaneGroup direction="vertical">
				<!-- Editor Area -->
				<Resizable.Pane id="editor" defaultSize={70}>
					<MonacoEditor />
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
	}
	main {
		height: calc(100vh - 78px);
	}
	footer {
		height: 36px;
	}
</style>
