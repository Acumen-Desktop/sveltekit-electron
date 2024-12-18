export interface FileInfo {
	name: string;
	path: string;
	type: 'file' | 'folder';
	size: number;
	modifiedAt: Date;
	createdAt: Date;
}

export interface FileOperationResult<T = unknown> {
	success: boolean;
	error?: string;
	data?: T;
}

export interface CreateFileOptions {
	name: string;
	content?: string;
	type: 'file' | 'folder';
}

export interface UpdateFileOptions {
	path: string;
	content: string;
}

export interface RenameFileOptions {
	oldPath: string;
	newName: string;
}

// Response types for different operations
export type ListDirectoryResponse = FileOperationResult<FileInfo[]>;

export type ReadFileResponse = FileOperationResult<{
	content: string;
	info: FileInfo;
}>;

export type WriteFileResponse = FileOperationResult<FileInfo>;
