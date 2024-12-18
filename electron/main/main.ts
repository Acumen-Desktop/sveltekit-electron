import { app, shell, BrowserWindow, ipcMain } from 'electron';
import { join } from 'node:path';
import { electronApp, optimizer, is } from '@electron-toolkit/utils';
import serve from 'electron-serve';
import icon from '../../resources/icon.png?asset';
import path from 'node:path';
import { registerFileSystemHandlers } from './fileSystem/ipc';

const loadURL = serve({
	directory: 'out/svelte',
	scheme: 'app'
});

async function createWindow(): Promise<void> {
	// Create the browser window.
	const mainWindow = new BrowserWindow({
		x: 2048,
		y: 0,
		width: 1860,
		height: 1100,
		show: false,
		autoHideMenuBar: true,
		...(process.platform === 'linux' ? { icon } : {}),
		webPreferences: {
			preload: join(__dirname, '../preload/preload.cjs'),
			sandbox: true,
			contextIsolation: true
		}
	});

	// Load the remote URL for development or the local html file for production.
	if (is.dev && process.env.ELECTRON_RENDERER_URL) {
		await mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL);
	} else {
		await loadURL(mainWindow);
	}

	// Show window when ready
	mainWindow.show();
	mainWindow.webContents.openDevTools();

	// Handle external links
	mainWindow.webContents.setWindowOpenHandler((details) => {
		shell.openExternal(details.url);
		return { action: 'deny' };
	});
}

async function main() {
	try {
		await app.whenReady();

		// Set app user model id for windows
		electronApp.setAppUserModelId('com.electron');

		// Register file system handlers
		registerFileSystemHandlers();

		// Default open or close DevTools by F12 in development
		// and ignore CommandOrControl + R in production.
		app.on('browser-window-created', (_, window) => {
			optimizer.watchWindowShortcuts(window);
		});

		await createWindow();

		app.on('activate', async () => {
			// On macOS it's common to re-create a window in the app when the
			// dock icon is clicked and there are no other windows open.
			if (BrowserWindow.getAllWindows().length === 0) {
				await createWindow();
			}
		});

		// Quit when all windows are closed, except on macOS
		app.on('window-all-closed', () => {
			if (process.platform !== 'darwin') {
				app.quit();
			}
		});

		ipcMain.handle('main-function', () => {
			console.log('Line 58 - main.ts: Function called from renderer process via IPC');
			return Promise.resolve(); // Return a promise to properly handle async operation
		});

		ipcMain.handle('get-desktop-path', () => {
			return app.getPath('desktop');
		});

		ipcMain.handle('get-fap-electron-files-path', () => {
			// Adjust this path as needed for your specific use case
			return path.join(app.getPath('userData'), 'fap-electron-files');
		});
	} catch (error) {
		console.error('Failed to initialize app:', error);
		app.quit();
	}
}

main().catch(console.error);
