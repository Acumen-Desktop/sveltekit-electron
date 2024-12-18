import type {
	CreateFileOptions,
	UpdateFileOptions,
	RenameFileOptions,
	ListDirectoryResponse,
	ReadFileResponse,
	WriteFileResponse,
	FileOperationResult
} from '../../electron/main/fileSystem/types';

declare global {
	interface Window {
		fs: {
			listDirectory: (path?: string) => Promise<ListDirectoryResponse>;
			readFile: (path: string) => Promise<ReadFileResponse>;
			createFile: (options: CreateFileOptions) => Promise<FileOperationResult>;
			updateFile: (options: UpdateFileOptions) => Promise<WriteFileResponse>;
			deleteFile: (path: string) => Promise<FileOperationResult>;
			renameFile: (options: RenameFileOptions) => Promise<FileOperationResult>;
		};
		api: {
			preload: () => void;
			main: () => Promise<void>;
			getDesktopPath?: () => Promise<string>;
			getElectronFilesPath?: () => Promise<string>;
		};
		electron: {
			ipcRenderer: {
				send: (channel: string, ...args: unknown[]) => void;
				on: (channel: string, func: (...args: unknown[]) => void) => () => void;
				invoke: (channel: string, ...args: unknown[]) => Promise<unknown>;
			};
		};
	}
}
