import { ipcMain } from 'electron';
import {
	listDirectory,
	readFile,
	createFile,
	updateFile,
	deleteFile,
	renameFile
} from './operations';
import type {
	CreateFileOptions,
	UpdateFileOptions,
	RenameFileOptions
} from '../../../src/lib/types/fileSystemTypes';

export function registerFileSystemHandlers(): void {
	// List directory contents
	ipcMain.handle('fs:list-directory', async (_, path?: string) => {
		return await listDirectory(path);
	});

	// Read file
	ipcMain.handle('fs:read-file', async (_, path: string) => {
		return await readFile(path);
	});

	// Create file or directory
	ipcMain.handle('fs:create', async (_, options: CreateFileOptions) => {
		return await createFile(options);
	});

	// Update file
	ipcMain.handle('fs:update', async (_, options: UpdateFileOptions) => {
		return await updateFile(options);
	});

	// Delete file or directory
	ipcMain.handle('fs:delete', async (_, path: string) => {
		return await deleteFile(path);
	});

	// Rename file or directory
	ipcMain.handle('fs:rename', async (_, options: RenameFileOptions) => {
		return await renameFile(options);
	});
}
