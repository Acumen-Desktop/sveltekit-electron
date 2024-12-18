import { join } from 'node:path';
import * as fs from 'node:fs';

export function getDesktopPath(): string {
	const homeDir = process.env.HOME || process.env.USERPROFILE;
	console.log(' Line 6: - Home Directory:', homeDir);
	if (!homeDir) {
		throw new Error('Could not determine user home directory');
	}
	return join(homeDir, 'Desktop');
}

export function getElectronFilesPath(): string {
	const desktopPath = getDesktopPath();
	console.log(' Line 15: - Desktop Path:', desktopPath);
	const electronFilesPath = join(desktopPath, 'fap-electron-files');
	console.log(' Line 17: - Electron Files Path:', electronFilesPath);

	// Ensure the directory exists
	if (!fs.existsSync(electronFilesPath)) {
		fs.mkdirSync(electronFilesPath, { recursive: true });
	}

	return electronFilesPath;
}
