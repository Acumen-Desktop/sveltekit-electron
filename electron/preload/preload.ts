import { contextBridge, ipcRenderer } from 'electron';
// import { join } from 'node:path';
// import * as fs from 'node:fs';

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
	},
	getDesktopPath: async () => {
		return await ipcRenderer.invoke('get-desktop-path');
	},
	getElectronFilesPath: async () => {
		return await ipcRenderer.invoke('get-electron-files-path');
	}
};

// Expose the API to the renderer process
contextBridge.exposeInMainWorld('api', api);

// Expose electron APIs if needed
contextBridge.exposeInMainWorld('electron', {
	ipcRenderer: {
		send: (channel: string, ...args: unknown[]) => ipcRenderer.send(channel, ...args),
		on: (channel: string, func: (...args: unknown[]) => void) => {
			const subscription = (_event: unknown, ...args: unknown[]) => func(...args);
			ipcRenderer.on(channel, subscription);
			return () => {
				ipcRenderer.removeListener(channel, subscription);
			};
		},
		invoke: (channel: string, ...args: unknown[]) => ipcRenderer.invoke(channel, ...args)
	}
});

// Add this to your existing preload.ts
console.log('Line 44 Preload - Desktop Path:', process.env.HOME || process.env.USERPROFILE);
