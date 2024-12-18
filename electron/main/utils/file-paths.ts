import { join } from 'node:path';
import * as fs from 'node:fs';

export function getDesktopPath(): string {
	const homeDir = process.env.HOME || process.env.USERPROFILE;
	if (!homeDir) {
		throw new Error('Could not determine user home directory');
	}
	return join(homeDir, 'Desktop');
}

export function getElectronFilesPath(): string {
	const desktopPath = getDesktopPath();
	const electronFilesPath = join(desktopPath, 'fap-electron-files');

	// Ensure the directory exists
	if (!fs.existsSync(electronFilesPath)) {
		fs.mkdirSync(electronFilesPath, { recursive: true });
	}

	return electronFilesPath;
}
