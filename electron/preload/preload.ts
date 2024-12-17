import { app, contextBridge, ipcRenderer } from 'electron';
import { electronAPI } from '@electron-toolkit/preload';

import { join } from 'node:path';
import * as fs from 'node:fs';

const desktopPath = app.getPath('desktop');
const electronFilesPath = join(desktopPath, 'electron-files');
if (!fs.existsSync(electronFilesPath)) {
	fs.mkdirSync(electronFilesPath);
}

// API exposed to renderer process
const api = {
	preload: () => {
		console.log('Line 5 - preload.ts: Preload function called from renderer process');
	},
	main: async () => {
		try {
			await ipcRenderer.invoke('main-function');
		} catch (error) {
			console.error('Line 11 - preload.ts: Error calling main function:', error);
		}
	}
};

// Expose the API to the renderer process
contextBridge.exposeInMainWorld('api', api);
contextBridge.exposeInMainWorld('api', {
	getDesktopPath: () => desktopPath,
	getElectronFilesPath: () => electronFilesPath
});

if (process.contextIsolated) {
	try {
		contextBridge.exposeInMainWorld('electron', electronAPI);
	} catch (error) {
		console.error('Line 38 - preload.ts: Error exposing electronAPI:', error);
	}
} else {
	window.electron = electronAPI;
}
