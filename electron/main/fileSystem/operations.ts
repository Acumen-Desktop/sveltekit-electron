import fs from 'node:fs/promises';
import path from 'node:path';
import { app } from 'electron';
import type {
	FileInfo,
	FileOperationResult,
	ListDirectoryResponse,
	ReadFileResponse,
	WriteFileResponse,
	CreateFileOptions,
	UpdateFileOptions,
	RenameFileOptions
} from '../../../src/lib/types/fileSystemTypes';
import { resolveSafePath, pathExists, formatError } from './utils';

// Get the base directory for all file operations
const getBaseDirectory = (): string => {
	return path.join(app.getPath('desktop'), 'fap-electron-files');
};

// Ensure base directory exists
const ensureBaseDirectory = async (): Promise<void> => {
	const baseDir = getBaseDirectory();
	try {
		await fs.access(baseDir);
	} catch {
		await fs.mkdir(baseDir, { recursive: true });
	}
};

// Get file info
async function getFileInfo(absolutePath: string): Promise<FileInfo> {
	const stats = await fs.stat(absolutePath);
	const baseDir = getBaseDirectory();
	return {
		name: path.basename(absolutePath),
		path: path.relative(baseDir, absolutePath),
		type: stats.isDirectory() ? 'folder' : 'file',
		size: stats.size,
		modifiedAt: stats.mtime,
		createdAt: stats.birthtime
	};
}

// List directory contents
export async function listDirectory(dirPath = ''): Promise<ListDirectoryResponse> {
	try {
		await ensureBaseDirectory();
		const resolvedPath = resolveSafePath(dirPath);
		if (!resolvedPath.success || !resolvedPath.data) {
			return { success: false, error: resolvedPath.error };
		}

		const basePath = resolvedPath.data;
		const entries = await fs.readdir(basePath, { withFileTypes: true });
		const contents = await Promise.all(
			entries.map((entry) => getFileInfo(path.join(basePath, entry.name)))
		);

		return { success: true, data: contents };
	} catch (error) {
		return { success: false, error: formatError(error) };
	}
}

// Read file content
export async function readFile(filePath: string): Promise<ReadFileResponse> {
	try {
		const resolvedPath = resolveSafePath(filePath);
		if (!resolvedPath.success || !resolvedPath.data) {
			return { success: false, error: resolvedPath.error };
		}

		const content = await fs.readFile(resolvedPath.data, 'utf-8');
		const info = await getFileInfo(resolvedPath.data);

		return {
			success: true,
			data: { content, info }
		};
	} catch (error) {
		return { success: false, error: formatError(error) };
	}
}

// Create file or directory
export async function createFile(
	options: CreateFileOptions
): Promise<FileOperationResult<FileInfo>> {
	try {
		await ensureBaseDirectory();

		// Ensure name is a non-empty string
		if (!options.name || typeof options.name !== 'string') {
			return {
				success: false,
				error: 'Invalid file or folder name'
			};
		}

		const resolvedPath = resolveSafePath(options.name);
		if (!resolvedPath.success || !resolvedPath.data) {
			return { success: false, error: resolvedPath.error };
		}

		const exists = await pathExists(resolvedPath.data);
		if (exists) {
			return { success: false, error: 'File or folder already exists' };
		}

		if (options.type === 'folder') {
			await fs.mkdir(resolvedPath.data, { recursive: true });
		} else {
			await fs.writeFile(resolvedPath.data, options.content ?? '', 'utf-8');
		}

		const info = await getFileInfo(resolvedPath.data);
		return { success: true, data: info };
	} catch (error) {
		return { success: false, error: formatError(error) };
	}
}

// Update file content
export async function updateFile(options: UpdateFileOptions): Promise<WriteFileResponse> {
	try {
		const resolvedPath = resolveSafePath(options.path);
		if (!resolvedPath.success || !resolvedPath.data) {
			return { success: false, error: resolvedPath.error };
		}

		await fs.writeFile(resolvedPath.data, options.content, 'utf-8');
		const info = await getFileInfo(resolvedPath.data);

		return { success: true, data: info };
	} catch (error) {
		return { success: false, error: formatError(error) };
	}
}

// Delete file or directory
export async function deleteFile(filePath: string): Promise<FileOperationResult<void>> {
	try {
		const resolvedPath = resolveSafePath(filePath);
		if (!resolvedPath.success || !resolvedPath.data) {
			return { success: false, error: resolvedPath.error };
		}

		const stats = await fs.stat(resolvedPath.data);
		if (stats.isDirectory()) {
			await fs.rm(resolvedPath.data, { recursive: true });
		} else {
			await fs.unlink(resolvedPath.data);
		}

		return { success: true };
	} catch (error) {
		return { success: false, error: formatError(error) };
	}
}

// Rename file or directory
export async function renameFile(
	options: RenameFileOptions
): Promise<FileOperationResult<FileInfo>> {
	try {
		const oldPath = resolveSafePath(options.oldPath);
		if (!oldPath.success || !oldPath.data) {
			return { success: false, error: oldPath.error };
		}

		const newPath = resolveSafePath(options.newName);
		if (!newPath.success || !newPath.data) {
			return { success: false, error: newPath.error };
		}

		await fs.rename(oldPath.data, newPath.data);
		const info = await getFileInfo(newPath.data);

		return { success: true, data: info };
	} catch (error) {
		return { success: false, error: formatError(error) };
	}
}
