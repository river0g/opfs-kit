/**
 * OPFS ユーティリティ関数
 * 内部実装用のヘルパー関数を提供
 */

// OPFS のルートディレクトリハンドル
let rootDirectory: FileSystemDirectoryHandle | null = null;

/**
 * OPFS がサポートされているかチェック
 * @returns OPFS がサポートされているかどうか
 */
export function isOPFSSupported(): boolean {
  return 'navigator' in globalThis && 'storage' in navigator && 'getDirectory' in navigator.storage;
}

/**
 * OPFS を初期化する
 * @returns Promise<void>
 */
export async function initialize(): Promise<void> {
  if (!isOPFSSupported()) {
    throw new Error('OPFS is not supported in this browser');
  }

  if (!rootDirectory) {
    rootDirectory = await navigator.storage.getDirectory();
  }
}

/**
 * ファイルパスからディレクトリハンドルとファイル名を取得する
 * @param path ファイルパス
 * @returns ディレクトリハンドルとファイル名のオブジェクト
 */
export async function getDirectoryAndFileName(
  path: string,
): Promise<{ directory: FileSystemDirectoryHandle; fileName: string }> {
  if (!rootDirectory) {
    await initialize();
  }

  // initialize後にrootDirectoryがnullの場合はエラー
  if (!rootDirectory) {
    throw new Error('Failed to initialize OPFS root directory');
  }

  const parts = path.split('/');
  const fileName = parts.pop() || '';
  const directoryPath = parts.join('/');

  const directory = directoryPath ? await getDirectoryByPath(directoryPath, true) : rootDirectory;

  return { directory, fileName };
}

/**
 * ファイルパスからディレクトリを取得する
 * @param path ディレクトリパス
 * @param create ディレクトリが存在しない場合に作成するかどうか
 * @returns ディレクトリハンドル
 */
export async function getDirectoryByPath(
  path: string,
  create = false,
): Promise<FileSystemDirectoryHandle> {
  if (!rootDirectory) {
    await initialize();
  }

  // initialize後にrootDirectoryがnullの場合はエラー
  if (!rootDirectory) {
    throw new Error('Failed to initialize OPFS root directory');
  }

  const parts = path.split('/').filter((part) => part.length > 0);
  let currentDirectory = rootDirectory;

  for (const part of parts) {
    currentDirectory = await currentDirectory.getDirectoryHandle(part, { create });
  }

  return currentDirectory;
}

// ファイルシステムの操作に関する型定義
export type FileEncoding = 'utf8' | 'utf-8' | 'base64' | 'binary';
export type FileFlag = 'r' | 'r+' | 'w' | 'w+' | 'a' | 'a+';

export interface ReadFileOptions {
  encoding?: FileEncoding;
  flag?: FileFlag;
}

export interface WriteFileOptions {
  encoding?: FileEncoding;
  flag?: FileFlag;
  mode?: number;
}
