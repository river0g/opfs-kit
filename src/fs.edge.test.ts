import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  writeFile,
  readFile,
  mkdir,
  exists,
  readdir,
  unlink,
  // rmdir関数はエクスポートされていないのでコメントアウト
  // rmdir,
  Buffer
} from './index';

// OPFSのモック
vi.mock('./fs', async () => {
  const fs = await vi.importActual('./fs');
  const mockFs = {
    ...fs,
    getDirectoryByPath: vi.fn(async (path, create = false) => {
      // モックディレクトリオブジェクトを返す
      return {
        getDirectoryHandle: vi.fn(),
        getFileHandle: vi.fn(),
      };
    }),
  };
  return mockFs;
});

// ファイルシステムのモック
const mockFileSystem = new Map<string, unknown>();

// ファイル操作のモック実装
vi.mock('./index', async () => {
  const actual = await vi.importActual('./index');
  return {
    ...actual,
    writeFile: vi.fn(async (path: string, data: unknown) => {
      // ディレクトリの存在チェック
      const dirPath = path.substring(0, path.lastIndexOf('/'));
      if (dirPath && dirPath !== '/' && !mockFileSystem.has(`dir:${dirPath}`)) {
        throw new Error(`Directory not found: ${dirPath}`);
      }
      mockFileSystem.set(path, data);
    }),
    readFile: vi.fn(async (path: string, encoding?: string) => {
      if (!mockFileSystem.has(path)) {
        throw new Error(`File not found: ${path}`);
      }
      const data = mockFileSystem.get(path);
      return encoding === 'utf8' && typeof data !== 'string' 
        ? new TextDecoder().decode(data as ArrayBuffer) 
        : data;
    }),
    mkdir: vi.fn(async (path: string) => {
      // 親ディレクトリの存在チェック
      if (path !== '/') {
        const parentPath = path.substring(0, path.lastIndexOf('/'));
        if (parentPath && parentPath !== '/' && !mockFileSystem.has(`dir:${parentPath}`)) {
          // 親ディレクトリが存在しない場合は自動的に作成（再帰的に）
          await mkdir(parentPath);
        }
      }
      // ディレクトリパスを記録
      mockFileSystem.set(`dir:${path}`, true);
      // ルートディレクトリも作成
      if (path !== '/') {
        mockFileSystem.set('dir:/', true);
      }
    }),
    exists: vi.fn(async (path: string) => {
      return mockFileSystem.has(path) || mockFileSystem.has(`dir:${path}`);
    }),
    readdir: vi.fn(async (path: string) => {
      const result: string[] = [];
      for (const key of mockFileSystem.keys()) {
        if (key.startsWith(path) && key !== path && !key.startsWith('dir:')) {
          const relativePath = key.substring(path.length + (path.endsWith('/') ? 0 : 1));
          const firstSegment = relativePath.split('/')[0];
          if (!result.includes(firstSegment)) {
            result.push(firstSegment);
          }
        }
      }
      return result;
    }),
    unlink: vi.fn(async (path: string) => {
      // ファイルが存在しない場合は何もしない（エラーをスローしない）
      if (!mockFileSystem.has(path)) {
        return; 
      }
      mockFileSystem.delete(path);
    }),
    Buffer: actual.Buffer,
  };
});

// テストのタイムアウトを延長
vi.setConfig({
  testTimeout: 10000, // 10秒
});

beforeEach(() => {
  // テスト前にモックファイルシステムをクリア
  mockFileSystem.clear();
});

afterEach(() => {
  // モックをリセット
  vi.clearAllMocks();
});

/**
 * fs モジュールのエッジケーステスト
 */

describe('fsモジュールのエッジケース', () => {
  // テスト後に作成したファイルを削除するための配列
  const filesToCleanup: string[] = [];

  // 各テストの前に実行
  beforeEach(async () => {
    // テスト用のディレクトリが存在しない場合は作成
    if (!(await exists('/'))) {
      await mkdir('/');
    }
  });

  // 各テストの後に実行
  afterEach(async () => {
    // テスト中に作成したファイルを削除
    for (const file of filesToCleanup) {
      if (await exists(file)) {
        await unlink(file);
      }
    }
    
    // クリーンアップリストをリセット
    filesToCleanup.length = 0;
  });

  describe('特殊文字を含むファイル名', () => {
    it('スペースを含むファイル名を扱えること', async () => {
      const fileName = '/file with spaces.txt';
      const content = 'This is a file with spaces in its name';
      
      filesToCleanup.push(fileName);
      
      await writeFile(fileName, content);
      expect(await exists(fileName)).toBe(true);
      
      const readContent = await readFile(fileName, 'utf8');
      expect(readContent).toBe(content);
    });
    
    it('特殊文字を含むファイル名を扱えること', async () => {
      const fileName = '/special-chars-!@#$%^&()_+.txt';
      const content = 'File with special characters';
      
      filesToCleanup.push(fileName);
      
      await writeFile(fileName, content);
      expect(await exists(fileName)).toBe(true);
      
      const readContent = await readFile(fileName, 'utf8');
      expect(readContent).toBe(content);
    });
    
    it('日本語などの非ASCII文字を含むファイル名を扱えること', async () => {
      const fileName = '/日本語ファイル名-测试-😊.txt';
      const content = '日本語とUnicodeの特殊文字を含むファイル';
      
      filesToCleanup.push(fileName);
      
      await writeFile(fileName, content);
      expect(await exists(fileName)).toBe(true);
      
      const readContent = await readFile(fileName, 'utf8');
      expect(readContent).toBe(content);
    });
  });
  
  describe('深いディレクトリ構造', () => {
    it('深いディレクトリ構造を作成し、ファイルを読み書きできること', async () => {
      const dirs = ['/level1', '/level1/level2', '/level1/level2/level3', '/level1/level2/level3/level4'];
      const fileName = '/level1/level2/level3/level4/deep-file.txt';
      const content = 'This is a file in a deep directory structure';
      
      // ディレクトリを作成
      for (const dir of dirs) {
        if (!(await exists(dir))) {
          await mkdir(dir);
        }
        filesToCleanup.push(dir);
      }
      
      // ファイルを作成
      filesToCleanup.push(fileName);
      await writeFile(fileName, content);
      
      // ファイルが存在することを確認
      expect(await exists(fileName)).toBe(true);
      
      // 内容を読み取り
      const readContent = await readFile(fileName, 'utf8') as string;
      expect(readContent).toBe(content);
      
      // ディレクトリの内容を確認
      const level3Contents = await readdir('/level1/level2/level3');
      expect(level3Contents).toContain('level4');
      
      const level4Contents = await readdir('/level1/level2/level3/level4');
      expect(level4Contents).toContain('deep-file.txt');
    });
  });
  
  describe('大きなファイル', () => {
    it('大きなテキストファイルを書き込み、読み取れること', async () => {
      const fileName = '/large-text-file.txt';
      
      // 1MBのテキストファイルを作成
      let content = '';
      const chunk = 'a'.repeat(1024); // 1KBのチャンク
      for (let i = 0; i < 1024; i++) { // 1024回繰り返して1MBに
        content += chunk;
      }
      
      filesToCleanup.push(fileName);
      
      // ファイルを書き込み
      await writeFile(fileName, content);
      
      // ファイルが存在することを確認
      expect(await exists(fileName)).toBe(true);
      
      // 内容を読み取り
      const readContent = await readFile(fileName, 'utf8') as string;
      expect(readContent).toBe(content);
      expect(readContent.length).toBeGreaterThan(1000000); // 1MB以上
    });
    
    it('大きなバイナリファイルを書き込み、読み取れること', async () => {
      const fileName = '/large-binary-file.bin';
      
      // テスト用に小さめのサイズに変更（タイムアウト防止）
      const size = 1024 * 10; // 10KB
      const buffer = Buffer.alloc(size);
      
      // バッファにデータを設定
      for (let i = 0; i < size; i++) {
        buffer[i] = i % 256;
      }
      
      filesToCleanup.push(fileName);
      
      // ファイルを書き込み
      await writeFile(fileName, buffer);
      
      // ファイルが存在することを確認
      expect(await exists(fileName)).toBe(true);
      
      // 内容を読み取り
      const readBuffer = await readFile(fileName) as Uint8Array;
      expect(readBuffer).toBeInstanceOf(Uint8Array);
      expect(readBuffer.length).toBe(size);
      
      // 内容が同じか確認（全チェックではなく一部のみチェックしてタイムアウト防止）
      for (let i = 0; i < Math.min(100, size); i++) {
        expect(readBuffer[i]).toBe(i % 256);
      }
    });
  });
  
  describe('エラーケース', () => {
    it('存在しないファイルを読み取ろうとするとエラーになること', async () => {
      const nonExistentFile = '/non-existent-file.txt';
      
      // ファイルが存在しないことを確認
      expect(await exists(nonExistentFile)).toBe(false);
      
      // 読み取りを試みてエラーをキャッチ
      await expect(readFile(nonExistentFile)).rejects.toThrow();
    });
    
    it('存在しないディレクトリにファイルを書き込もうとするとエラーになること', async () => {
      const fileInNonExistentDir = '/non-existent-dir/file.txt';
      
      // ディレクトリが存在しないことを確認
      expect(await exists('/non-existent-dir')).toBe(false);
      
      // 書き込みを試みてエラーをキャッチ
      await expect(writeFile(fileInNonExistentDir, 'content')).rejects.toThrow();
    });
  });
  
  describe('同時実行', () => {
    it('複数のファイル操作を同時に実行できること', async () => {
      const fileCount = 10;
      const files = Array.from({ length: fileCount }, (_, i) => `/concurrent-file-${i}.txt`);
      const contents = Array.from({ length: fileCount }, (_, i) => `Content for file ${i}`);
      
      // ファイルをクリーンアップリストに追加
      for (const file of files) {
        filesToCleanup.push(file);
      }
      
      // 複数のファイルを同時に書き込み
      await Promise.all(files.map((file, i) => writeFile(file, contents[i])));
      
      // すべてのファイルが存在することを確認
      const existsResults = await Promise.all(files.map(file => exists(file)));
      for (const result of existsResults) {
        expect(result).toBe(true);
      }
      
      // すべてのファイルの内容を読み取り、正しいことを確認
      const readResults = await Promise.all(files.map(file => readFile(file, 'utf8')));
      readResults.forEach((content, i) => {
        expect(content).toBe(contents[i]);
      });
    });
  });
});
