import { contextBridge, ipcRenderer } from 'electron';
import type {
	CreateFileOptions,
	UpdateFileOptions,
	RenameFileOptions,
	ListDirectoryResponse,
	ReadFileResponse,
	WriteFileResponse,
	FileOperationResult
} from '../../src/lib/types/fileSystemTypes';

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
		console.log(' Line 28: - Preload - getElectronFilesPath');
		return await ipcRenderer.invoke('get-fap-electron-files-path');
	}
};

// Expose the API to the renderer process
contextBridge.exposeInMainWorld('api', api);

// File System API
const fileSystemApi = {
	listDirectory: (path?: string): Promise<ListDirectoryResponse> => {
		return ipcRenderer.invoke('fs:list-directory', path);
	},
	readFile: (path: string): Promise<ReadFileResponse> => {
		return ipcRenderer.invoke('fs:read-file', path);
	},
	createFile: (options: CreateFileOptions): Promise<FileOperationResult> => {
		return ipcRenderer.invoke('fs:create', options);
	},
	updateFile: (options: UpdateFileOptions): Promise<WriteFileResponse> => {
		return ipcRenderer.invoke('fs:update', options);
	},
	deleteFile: (path: string): Promise<FileOperationResult> => {
		return ipcRenderer.invoke('fs:delete', path);
	},
	renameFile: (options: RenameFileOptions): Promise<FileOperationResult> => {
		return ipcRenderer.invoke('fs:rename', options);
	}
};

// Expose APIs to renderer process
contextBridge.exposeInMainWorld('fs', fileSystemApi);

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
