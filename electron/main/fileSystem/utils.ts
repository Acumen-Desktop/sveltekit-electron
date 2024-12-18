import { app } from 'electron';
import path from 'node:path';
import fs from 'node:fs/promises';
import type { FileOperationResult } from '../../../src/lib/types/fileSystemTypes';

// Get the base directory for all file operations
export const getBaseDirectory = (): string => {
	return path.join(app.getPath('desktop'), 'fap-electron-files');
};

// Ensure base directory exists
export const ensureBaseDirectory = async (): Promise<void> => {
	const baseDir = getBaseDirectory();
	try {
		await fs.access(baseDir);
	} catch {
		await fs.mkdir(baseDir, { recursive: true });
	}
};

// Validate and resolve path (ensure it's within base directory)
export const resolveSafePath = (requestedPath: string): FileOperationResult<string> => {
	const baseDir = getBaseDirectory();
	// If requestedPath is empty, return the base directory
	if (!requestedPath) {
		return {
			success: true,
			data: baseDir
		};
	}

	const absolutePath = path.isAbsolute(requestedPath)
		? requestedPath
		: path.resolve(baseDir, requestedPath);

	// Ensure the resolved path is within the base directory
	if (!absolutePath.startsWith(baseDir)) {
		return {
			success: false,
			error: 'Access denied: Path is outside the allowed directory'
		};
	}

	return {
		success: true,
		data: absolutePath
	};
};

// Check if path exists
export const pathExists = async (absolutePath: string): Promise<boolean> => {
	try {
		await fs.access(absolutePath);
		return true;
	} catch {
		return false;
	}
};

// Format error message
export const formatError = (error: unknown): string => {
	if (error instanceof Error) {
		return error.message;
	}
	return String(error);
};
