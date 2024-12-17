import { ElectronAPI } from '@electron-toolkit/preload';

interface API {
	getDesktopPath: () => string;
	getElectronFilesPath: () => string;
}

declare global {
	interface Window {
		electron: ElectronAPI;
		api: API;
	}
}
