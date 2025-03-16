import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { readFile, writeFile } from './fs';
import { Buffer } from './buffer';

// fs-utilsをモック
vi.mock('./utils/fs-utils', () => {
  return {
    getDirectoryAndFileName: vi.fn(),
  };
});

// fs-utilsのgetDirectoryAndFileNameパラメータをインポート
const fsUtils = await import('./utils/fs-utils');

// モック用のオブジェクトを定義
type MockFileSystemDirectoryHandle = {
  getFileHandle: ReturnType<typeof vi.fn>;
};

type MockFileSystemFileHandle = {
  getFile: ReturnType<typeof vi.fn>;
  createWritable: ReturnType<typeof vi.fn>;
};

type MockFile = {
  text: ReturnType<typeof vi.fn>;
  arrayBuffer: ReturnType<typeof vi.fn>;
};

type MockWritable = {
  write: ReturnType<typeof vi.fn>;
  close: ReturnType<typeof vi.fn>;
};

describe('readFile関数', () => {
  // テスト用のモックデータ
  const testFilePath = '/test/file.txt';
  const testFileContent = 'テストファイルの内容';
  const testFileBuffer = new Uint8Array([0x74, 0x65, 0x73, 0x74]);

  // モック用のオブジェクト
  const mockDirectory: MockFileSystemDirectoryHandle = {
    getFileHandle: vi.fn(),
  };

  const mockFileHandle: MockFileSystemFileHandle = {
    getFile: vi.fn(),
    createWritable: vi.fn(),
  };

  const mockFile: MockFile = {
    text: vi.fn(),
    arrayBuffer: vi.fn(),
  };

  const mockWritable: MockWritable = {
    write: vi.fn(),
    close: vi.fn(),
  };

  beforeEach(() => {
    // モックをリセット
    vi.resetAllMocks();

    // getDirectoryAndFileNameのモック設定
    vi.mocked(fsUtils.getDirectoryAndFileName).mockImplementation(async () => {
      return {
        directory: mockDirectory as unknown as FileSystemDirectoryHandle,
        fileName: 'file.txt',
      };
    });

    // getFileHandleのモック設定
    mockDirectory.getFileHandle.mockResolvedValue(mockFileHandle);

    // getFileのモック設定
    mockFileHandle.getFile.mockResolvedValue(mockFile);

    // textのモック設定
    mockFile.text.mockResolvedValue(testFileContent);

    // arrayBufferのモック設定
    mockFile.arrayBuffer.mockResolvedValue(testFileBuffer.buffer);

    // createWritableのモック設定
    mockFileHandle.createWritable.mockResolvedValue(mockWritable);

    // writeのモック設定
    mockWritable.write.mockResolvedValue(undefined);

    // closeのモック設定
    mockWritable.close.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // 正常系テスト - Promiseスタイル（UTF-8）
  it('Promiseスタイルでテキストファイルを正常に読み込むこと', async () => {
    const result = await readFile(testFilePath, 'utf8');
    expect(result).toBe(testFileContent);
    expect(fsUtils.getDirectoryAndFileName).toHaveBeenCalledWith(testFilePath);
    expect(mockDirectory.getFileHandle).toHaveBeenCalledWith('file.txt');
    expect(mockFile.text).toHaveBeenCalled();
  });

  // 正常系テスト - Promiseスタイル（バイナリ）
  it('Promiseスタイルでバイナリファイルを正常に読み込むこと', async () => {
    const result = await readFile(testFilePath, 'binary');
    expect(result instanceof Buffer).toBe(true);
    expect(fsUtils.getDirectoryAndFileName).toHaveBeenCalledWith(testFilePath);
    expect(mockDirectory.getFileHandle).toHaveBeenCalledWith('file.txt');
    expect(mockFile.arrayBuffer).toHaveBeenCalled();
  });

  // 正常系テスト - コールバックスタイル（UTF-8）
  it('コールバックスタイルでテキストファイルを正常に読み込むこと', async () => {
    return new Promise<void>((resolve) => {
      readFile(testFilePath, 'utf8', (err, data) => {
        expect(err).toBeNull();
        expect(data).toBe(testFileContent);
        expect(fsUtils.getDirectoryAndFileName).toHaveBeenCalledWith(testFilePath);
        expect(mockDirectory.getFileHandle).toHaveBeenCalledWith('file.txt');
        expect(mockFile.text).toHaveBeenCalled();
        resolve();
      });
    });
  });

  // 正常系テスト - オプションオブジェクト
  it('オプションオブジェクトを使用して正常に読み込むこと', async () => {
    const result = await readFile(testFilePath, { encoding: 'utf8' });
    expect(result).toBe(testFileContent);
    expect(fsUtils.getDirectoryAndFileName).toHaveBeenCalledWith(testFilePath);
    expect(mockDirectory.getFileHandle).toHaveBeenCalledWith('file.txt');
    expect(mockFile.text).toHaveBeenCalled();
  });

  // エラーテスト
  it('Promiseスタイルでエラーを適切に処理すること', async () => {
    // エラーモック
    const testError = new Error('テストエラー');
    mockDirectory.getFileHandle.mockRejectedValueOnce(testError);

    // テスト実行と検証
    await expect(readFile(testFilePath)).rejects.toThrow('Error reading file: テストエラー');
    expect(fsUtils.getDirectoryAndFileName).toHaveBeenCalledWith(testFilePath);
    expect(mockDirectory.getFileHandle).toHaveBeenCalledWith('file.txt');
  });

  it('コールバックスタイルでエラーを適切に処理すること', async () => {
    // エラーモック
    const testError = new Error('テストエラー');
    mockDirectory.getFileHandle.mockRejectedValueOnce(testError);

    // Promiseを使用してコールバックスタイルをテスト
    return new Promise<void>((resolve) => {
      readFile(testFilePath, (err, data) => {
        // 検証
        expect(err).toBeInstanceOf(Error);
        expect(err?.message).toContain('Error reading file: テストエラー');
        expect(data).toBe('');
        expect(fsUtils.getDirectoryAndFileName).toHaveBeenCalledWith(testFilePath);
        expect(mockDirectory.getFileHandle).toHaveBeenCalledWith('file.txt');
        resolve();
      });
    });
  });
});

describe('writeFile関数', () => {
  // テスト用のモックデータ
  const testFilePath = '/test/file.txt';
  const testFileContent = 'テストファイルの内容';

  // モック用のオブジェクト
  const mockDirectory: MockFileSystemDirectoryHandle = {
    getFileHandle: vi.fn(),
  };

  const mockFileHandle: MockFileSystemFileHandle = {
    getFile: vi.fn(),
    createWritable: vi.fn(),
  };

  const mockWritable: MockWritable = {
    write: vi.fn(),
    close: vi.fn(),
  };

  beforeEach(() => {
    // モックをリセット
    vi.resetAllMocks();

    // getDirectoryAndFileNameのモック設定
    vi.mocked(fsUtils.getDirectoryAndFileName).mockImplementation(async () => {
      return {
        directory: mockDirectory as unknown as FileSystemDirectoryHandle,
        fileName: 'file.txt',
      };
    });

    // getFileHandleのモック設定
    mockDirectory.getFileHandle.mockResolvedValue(mockFileHandle);

    // createWritableのモック設定
    mockFileHandle.createWritable.mockResolvedValue(mockWritable);

    // writeのモック設定
    mockWritable.write.mockResolvedValue(undefined);

    // closeのモック設定
    mockWritable.close.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // 正常系テスト - Promiseスタイル（文字列）
  it('Promiseスタイルで文字列を正常に書き込むこと', async () => {
    await writeFile(testFilePath, testFileContent);
    expect(fsUtils.getDirectoryAndFileName).toHaveBeenCalledWith(testFilePath);
    expect(mockDirectory.getFileHandle).toHaveBeenCalledWith('file.txt', { create: true });
    expect(mockFileHandle.createWritable).toHaveBeenCalled();
    expect(mockWritable.write).toHaveBeenCalledWith(testFileContent);
    expect(mockWritable.close).toHaveBeenCalled();
  });

  // 正常系テスト - コールバックスタイル（文字列）
  it('コールバックスタイルで文字列を正常に書き込むこと', async () => {
    return new Promise<void>((resolve) => {
      writeFile(testFilePath, testFileContent, (err) => {
        expect(err).toBeNull();
        expect(fsUtils.getDirectoryAndFileName).toHaveBeenCalledWith(testFilePath);
        expect(mockDirectory.getFileHandle).toHaveBeenCalledWith('file.txt', { create: true });
        expect(mockFileHandle.createWritable).toHaveBeenCalled();
        expect(mockWritable.write).toHaveBeenCalledWith(testFileContent);
        expect(mockWritable.close).toHaveBeenCalled();
        resolve();
      });
    });
  });

  // 正常系テスト - バイナリデータ（Buffer）
  it('Bufferオブジェクトを正常に書き込むこと', async () => {
    const buffer = Buffer.from(testFileContent);
    await writeFile(testFilePath, buffer);
    expect(fsUtils.getDirectoryAndFileName).toHaveBeenCalledWith(testFilePath);
    expect(mockDirectory.getFileHandle).toHaveBeenCalledWith('file.txt', { create: true });
    expect(mockFileHandle.createWritable).toHaveBeenCalled();
    expect(mockWritable.write).toHaveBeenCalledWith(buffer);
    expect(mockWritable.close).toHaveBeenCalled();
  });

  // 正常系テスト - オプションオブジェクト
  it('オプションオブジェクトを使用して正常に書き込むこと', async () => {
    await writeFile(testFilePath, testFileContent, { encoding: 'utf8' });
    expect(fsUtils.getDirectoryAndFileName).toHaveBeenCalledWith(testFilePath);
    expect(mockDirectory.getFileHandle).toHaveBeenCalledWith('file.txt', { create: true });
    expect(mockFileHandle.createWritable).toHaveBeenCalled();
    expect(mockWritable.write).toHaveBeenCalledWith(testFileContent);
    expect(mockWritable.close).toHaveBeenCalled();
  });

  // エラーテスト
  it('Promiseスタイルでエラーを適切に処理すること', async () => {
    // エラーモック
    const testError = new Error('テストエラー');
    mockDirectory.getFileHandle.mockRejectedValueOnce(testError);

    // テスト実行と検証
    await expect(writeFile(testFilePath, testFileContent)).rejects.toThrow('Error writing file: テストエラー');
    expect(fsUtils.getDirectoryAndFileName).toHaveBeenCalledWith(testFilePath);
    expect(mockDirectory.getFileHandle).toHaveBeenCalledWith('file.txt', { create: true });
  });

  it('コールバックスタイルでエラーを適切に処理すること', async () => {
    // エラーモック
    const testError = new Error('テストエラー');
    mockDirectory.getFileHandle.mockRejectedValueOnce(testError);

    // Promiseを使用してコールバックスタイルをテスト
    return new Promise<void>((resolve) => {
      writeFile(testFilePath, testFileContent, (err) => {
        // 検証
        expect(err).toBeInstanceOf(Error);
        expect(err?.message).toContain('Error writing file: テストエラー');
        expect(fsUtils.getDirectoryAndFileName).toHaveBeenCalledWith(testFilePath);
        expect(mockDirectory.getFileHandle).toHaveBeenCalledWith('file.txt', { create: true });
        resolve();
      });
    });
  });
});
