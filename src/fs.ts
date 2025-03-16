/**
 * OPFS ファイルシステム関数
 * fs モジュールと互換性のあるインターフェースを提供
 */

import { Buffer } from './buffer';
import {
  type FileEncoding,
  type ReadFileOptions,
  type WriteFileOptions,
  getDirectoryAndFileName,
  getDirectoryByPath,
} from './utils/fs-utils';

// エラー型の定義
export type ErrnoException = Error & {
  errno?: number;
  code?: string;
  path?: string;
  // syscallはブラウザ環境で使用されないため削除
};

/**
 * ファイルを非同期的に読み込む (fs.readFile)
 * @param path ファイルパス
 * @param options オプションまたはエンコーディング
 * @param callback コールバック関数
 */
export function readFile(
  path: string,
  options?:
    | ReadFileOptions
    | string
    | ((err: ErrnoException | null, data: string | Buffer) => void),
  callback?: (err: ErrnoException | null, data: string | Buffer) => void,
): Promise<string | Buffer> | undefined {
  // オプションとコールバックの正規化
  let encoding: FileEncoding = 'utf8';
  let cb: ((err: ErrnoException | null, data: string | Buffer) => void) | undefined = undefined;

  if (typeof options === 'function') {
    cb = options;
  } else if (typeof options === 'string') {
    encoding = options as FileEncoding;
    cb = callback;
  } else if (options && typeof options === 'object') {
    if (options.encoding) {
      encoding = options.encoding;
    }
    cb = callback;
  } else {
    cb = callback;
  }

  const readFileAsync = async (): Promise<string | Buffer> => {
    try {
      const { directory, fileName } = await getDirectoryAndFileName(path);
      const fileHandle = await directory.getFileHandle(fileName);
      const file = await fileHandle.getFile();

      // エンコーディングに基づいて返す
      if (encoding === 'utf8' || encoding === 'utf-8') {
        return await file.text();
      }
      if (encoding === 'base64') {
        const buffer = await file.arrayBuffer();
        return Buffer.from(buffer).toString('base64');
      }
      // binary
      return Buffer.from(await file.arrayBuffer());
    } catch (error) {
      throw new Error(
        `Error reading file: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  };

  if (cb) {
    // コールバックスタイル
    readFileAsync()
      .then((data) => cb?.(null, data))
      .catch((err) => {
        const errnoEx = err as ErrnoException;
        cb?.(errnoEx, '' as string);
      });
    return;
  }

  // Promiseスタイル
  return readFileAsync();
}

/**
 * ファイルを同期的に読み込む (fs.readFileSync)
 * @param path ファイルパス
 * @param options オプションまたはエンコーディング
 */
export function readFileSync(path: string, options?: ReadFileOptions | string): never {
  throw new Error('readFileSync is not supported in browser environment. Use readFile() instead.');
}

/**
 * ファイルを非同期的に書き込む (fs.writeFile)
 * @param path ファイルパス
 * @param data 書き込むデータ
 * @param options オプションまたはエンコーディング
 * @param callback コールバック関数
 */
export function writeFile(
  path: string,
  data: string | Buffer | Uint8Array,
  options?: WriteFileOptions | string | ((err: ErrnoException | null) => void),
  callback?: (err: ErrnoException | null) => void,
): Promise<void> | void {
  // オプションとコールバックの正規化
  let encoding: FileEncoding = 'utf8';
  let cb: ((err: ErrnoException | null) => void) | undefined = undefined;

  if (typeof options === 'function') {
    cb = options;
  } else if (typeof options === 'string') {
    encoding = options as FileEncoding;
    cb = callback;
  } else if (options && typeof options === 'object') {
    if (options.encoding) {
      encoding = options.encoding;
    }
    cb = callback;
  } else {
    cb = callback;
  }

  const writeFileAsync = async (): Promise<void> => {
    try {
      const { directory, fileName } = await getDirectoryAndFileName(path);
      const fileHandle = await directory.getFileHandle(fileName, { create: true });
      const writable = await fileHandle.createWritable();

      // データの型とエンコーディングに基づいて書き込む
      if (typeof data === 'string' && encoding === 'base64') {
        // Base64 文字列をバイナリに変換
        const buffer = Buffer.from(data, 'base64');
        await writable.write(buffer);
      } else if (data instanceof Uint8Array) {
        // Buffer または Uint8Array をそのまま書き込む
        await writable.write(data);
      } else {
        // 文字列をそのまま書き込む
        await writable.write(data);
      }

      await writable.close();
    } catch (error) {
      throw new Error(
        `Error writing file: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  };

  if (cb) {
    // コールバックスタイル
    writeFileAsync()
      .then(() => cb?.(null))
      .catch((err) => cb?.(err as ErrnoException));
    return;
  }

  // Promiseスタイル
  return writeFileAsync();
}

/**
 * ファイルを同期的に書き込む (fs.writeFileSync)
 * @param path ファイルパス
 * @param data 書き込むデータ
 * @param options オプションまたはエンコーディング
 */
export function writeFileSync(
  path: string,
  data: string | Buffer | Uint8Array,
  options?: WriteFileOptions | string,
): never {
  throw new Error(
    'writeFileSync is not supported in browser environment. Use writeFile() instead.',
  );
}

/**
 * ファイルが存在するかチェック (fs.existsSync)
 * @param path ファイルパス
 * @returns ファイルが存在するかどうか
 */
export function existsSync(path: string): boolean {
  throw new Error('existsSync is not supported in browser environment. Use exists() instead.');
}

/**
 * ファイルが存在するかチェック (fs.exists)
 * @param path ファイルパス
 * @param callback コールバック関数
 */
export function exists(
  path: string,
  callback?: (exists: boolean) => void,
): Promise<boolean> | undefined {
  const checkExists = async (): Promise<boolean> => {
    try {
      const { directory, fileName } = await getDirectoryAndFileName(path);
      await directory.getFileHandle(fileName);
      return true;
    } catch (error) {
      return false;
    }
  };

  if (callback) {
    // コールバックスタイル
    checkExists().then((exists) => callback(exists));
    return;
  }

  // Promiseスタイル
  return checkExists();
}

/**
 * ファイルを削除する (fs.unlink)
 * @param path ファイルパス
 * @param callback コールバック関数
 */
export function unlink(
  path: string,
  callback?: (err: ErrnoException | null) => void,
): Promise<void> | void {
  const unlinkFile = async (): Promise<void> => {
    try {
      const { directory, fileName } = await getDirectoryAndFileName(path);
      await directory.removeEntry(fileName);
    } catch (error) {
      throw new Error(
        `Error deleting file: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  };

  if (callback) {
    // コールバックスタイル
    unlinkFile()
      .then(() => callback?.(null))
      .catch((err) => callback?.(err as ErrnoException));
    return;
  }

  // Promiseスタイル
  return unlinkFile();
}

/**
 * ディレクトリを作成する (fs.mkdir)
 * @param path ディレクトリパス
 * @param options オプションまたはコールバック関数
 * @param callback コールバック関数
 */
export function mkdir(
  path: string,
  options?: { recursive?: boolean; mode?: number } | ((err: ErrnoException | null) => void),
  callback?: (err: ErrnoException | null) => void,
): Promise<void> | void {
  // オプションとコールバックの正規化
  let opts = { recursive: false };
  let cb: ((err: ErrnoException | null) => void) | undefined = undefined;

  if (typeof options === 'function') {
    cb = options;
  } else if (options) {
    opts = { ...opts, ...options };
    cb = callback;
  } else {
    cb = callback;
  }

  const createDir = async (): Promise<void> => {
    try {
      await getDirectoryByPath(path, true);
    } catch (error) {
      throw new Error(
        `Error creating directory: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  };

  if (cb) {
    // コールバックスタイル
    createDir()
      .then(() => cb?.(null))
      .catch((err) => cb?.(err as ErrnoException));
    return;
  }

  // Promiseスタイル
  return createDir();
}

/**
 * ディレクトリの内容を読み込む (fs.readdir)
 * @param path ディレクトリパス
 * @param callback コールバック関数
 */
export function readdir(
  path: string,
  callback: (err: ErrnoException | null, files: string[]) => void,
): void;

/**
 * ディレクトリの内容を読み込む (fs.readdir)
 * @param path ディレクトリパス
 * @param options オプション
 * @param callback コールバック関数
 */
export function readdir(
  path: string,
  options: { encoding?: string; withFileTypes?: boolean },
  callback: (err: ErrnoException | null, files: string[]) => void,
): void;

/**
 * ディレクトリの内容を読み込む (fs.readdir)
 * @param path ディレクトリパス
 * @param options オプション
 */
export function readdir(
  path: string,
  options?: { encoding?: string; withFileTypes?: boolean },
): Promise<string[]>;

/**
 * ディレクトリの内容を読み込む
 * @param path ディレクトリパス
 * @param options オプションまたはコールバック関数
 * @param callback コールバック関数
 */
export function readdir(
  path: string,
  options?:
    | { encoding?: string; withFileTypes?: boolean }
    | ((err: ErrnoException | null, files: string[]) => void),
  callback?: (err: ErrnoException | null, files: string[]) => void,
): Promise<string[]> | undefined {
  // オプションとコールバックの正規化
  let cb: ((err: ErrnoException | null, files: string[]) => void) | undefined = undefined;

  if (typeof options === 'function') {
    cb = options;
  } else {
    cb = callback;
  }

  const readDirectory = async (): Promise<string[]> => {
    try {
      const directory = await getDirectoryByPath(path);
      const entries: string[] = [];

      for await (const entry of directory.values()) {
        entries.push(entry.name);
      }

      return entries;
    } catch (error) {
      throw new Error(
        `Error reading directory: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  };

  if (cb) {
    // コールバックスタイル
    readDirectory()
      .then((files) => cb?.(null, files))
      .catch((err) => cb?.(err as ErrnoException, []));
    return;
  }

  // Promiseスタイル
  return readDirectory();
}

/**
 * fs モジュールと同じ定数をエクスポート
 */
export const constants = {
  F_OK: 0,
  R_OK: 4,
  W_OK: 2,
  X_OK: 1,
};
