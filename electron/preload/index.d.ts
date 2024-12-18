// import { ElectronAPI } from '@electron-toolkit/preload';

interface API {
	preload: () => void;
	main: () => Promise<void>;
	getDesktopPath: () => Promise<string>;
	getElectronFilesPath: () => Promise<string>;
}

declare global {
	interface Window {
		electron: ElectronAPI;
		api: API;
	}
}

export {};
