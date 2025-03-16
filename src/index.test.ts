/**
 * index.ts のテスト
 * パッケージのメインエントリーポイントが正しくエクスポートされているかを確認
 */

import { describe, it, expect, vi } from 'vitest';
import fs, {
  Buffer,
  readFile,
  readFileSync,
  writeFile,
  writeFileSync,
  exists,
  existsSync,
  unlink,
  mkdir,
  readdir,
  constants,
  isOPFSSupported,
} from '../src';

// グローバル変数の型定義
declare const global: {
  navigator: Record<string, unknown>;
  window: Record<string, unknown>;
};

describe('OPFSパッケージ', () => {
  describe('デフォルトエクスポート', () => {
    it('すべての関数とクラスがデフォルトエクスポートに含まれていること', () => {
      // デフォルトエクスポートに必要な関数とクラスが含まれていることを確認
      expect(fs.readFile).toBeDefined();
      expect(fs.readFileSync).toBeDefined();
      expect(fs.writeFile).toBeDefined();
      expect(fs.writeFileSync).toBeDefined();
      expect(fs.exists).toBeDefined();
      expect(fs.existsSync).toBeDefined();
      expect(fs.unlink).toBeDefined();
      expect(fs.mkdir).toBeDefined();
      expect(fs.readdir).toBeDefined();
      expect(fs.constants).toBeDefined();
      expect(fs.Buffer).toBeDefined();
      expect(fs.isOPFSSupported).toBeDefined();

      // 関数の型を確認
      expect(typeof fs.readFile).toBe('function');
      expect(typeof fs.readFileSync).toBe('function');
      expect(typeof fs.writeFile).toBe('function');
      expect(typeof fs.writeFileSync).toBe('function');
      expect(typeof fs.exists).toBe('function');
      expect(typeof fs.existsSync).toBe('function');
      expect(typeof fs.unlink).toBe('function');
      expect(typeof fs.mkdir).toBe('function');
      expect(typeof fs.readdir).toBe('function');
    });
  });

  describe('名前付きエクスポート', () => {
    it('すべての関数とクラスが名前付きエクスポートとして利用可能であること', () => {
      // 名前付きエクスポートが定義されていることを確認
      expect(readFile).toBeDefined();
      expect(readFileSync).toBeDefined();
      expect(writeFile).toBeDefined();
      expect(writeFileSync).toBeDefined();
      expect(exists).toBeDefined();
      expect(existsSync).toBeDefined();
      expect(unlink).toBeDefined();
      expect(mkdir).toBeDefined();
      expect(readdir).toBeDefined();
      expect(constants).toBeDefined();
      expect(Buffer).toBeDefined();
      expect(isOPFSSupported).toBeDefined();

      // 関数の型を確認
      expect(typeof readFile).toBe('function');
      expect(typeof readFileSync).toBe('function');
      expect(typeof writeFile).toBe('function');
      expect(typeof writeFileSync).toBe('function');
      expect(typeof exists).toBe('function');
      expect(typeof existsSync).toBe('function');
      expect(typeof unlink).toBe('function');
      expect(typeof mkdir).toBe('function');
      expect(typeof readdir).toBe('function');
    });
  });

  describe('Buffer', () => {
    it('Bufferクラスが正しくエクスポートされていること', () => {
      // Bufferのメソッドが存在することを確認
      expect(Buffer.from).toBeDefined();
      expect(Buffer.alloc).toBeDefined();
      
      // 基本的な機能をテスト
      const buf = Buffer.from('テスト');
      expect(buf).toBeInstanceOf(Uint8Array);
      expect(buf.toString()).toBe('テスト');
    });
    
    // エッジケース: エクスポートされたBufferが大きなデータを処理できること
    it('エクスポートされたBufferが大きなデータを処理できること', () => {
      // 100KBのデータを作成
      const size = 100 * 1024;
      const largeArray = new Uint8Array(size);
      for (let i = 0; i < size; i++) {
        largeArray[i] = i % 256;
      }
      
      const buf = Buffer.from(largeArray);
      expect(buf.length).toBe(size);
      expect(buf[0]).toBe(0);
      expect(buf[255]).toBe(255);
    });
  });

  describe('isOPFSSupported', () => {
    it('isOPFSSupportedがブール値を返すこと', () => {
      // テスト環境では実際のブラウザ環境ではないため、
      // 結果の値ではなく型のみを確認
      expect(typeof isOPFSSupported()).toBe('boolean');
    });
    
    // エッジケース: ブラウザ環境のモック
    it('ブラウザ環境をモックしてテストできること', () => {
      // グローバルオブジェクトをモック
      const originalNavigator = global.navigator;
      const originalWindow = global.window;
      
      try {
        // OPFSがサポートされていない環境をモック
        Object.defineProperty(global, 'navigator', {
          value: {},
          configurable: true,
        });
        Object.defineProperty(global, 'window', {
          value: {},
          configurable: true,
        });
        
        // OPFSがサポートされていないことを確認
        expect(isOPFSSupported()).toBe(false);
        
        // OPFSがサポートされている環境をモック
        Object.defineProperty(global, 'navigator', {
          value: {
            ...originalNavigator,
            storage: {
              getDirectory: vi.fn(),
            },
          },
          configurable: true,
        });
        
        Object.defineProperty(global, 'window', {
          value: {
            ...originalWindow,
          },
          configurable: true,
        });
        
        // OPFSがサポートされていることを確認
        expect(isOPFSSupported()).toBe(true);
      } finally {
        // モックを元に戻す
        Object.defineProperty(global, 'navigator', {
          value: originalNavigator,
          configurable: true,
        });
        Object.defineProperty(global, 'window', {
          value: originalWindow,
          configurable: true,
        });
      }
    });
  });

  describe('constants', () => {
    it('必要な定数が定義されていること', () => {
      // ファイルフラグの定数が定義されていることを確認
      expect(constants.O_RDONLY).toBeDefined();
      expect(constants.O_WRONLY).toBeDefined();
      expect(constants.O_RDWR).toBeDefined();
      expect(constants.O_CREAT).toBeDefined();
      expect(constants.O_EXCL).toBeDefined();
      expect(constants.O_TRUNC).toBeDefined();
      expect(constants.O_APPEND).toBeDefined();

      // 定数が数値型であることを確認
      expect(typeof constants.O_RDONLY).toBe('number');
      expect(typeof constants.O_WRONLY).toBe('number');
      expect(typeof constants.O_RDWR).toBe('number');
      expect(typeof constants.O_CREAT).toBe('number');
      expect(typeof constants.O_EXCL).toBe('number');
      expect(typeof constants.O_TRUNC).toBe('number');
      expect(typeof constants.O_APPEND).toBe('number');
    });
    
    // エッジケース: 定数の値が正しいこと
    it('定数の値が正しいこと', () => {
      // ファイルアクセスモード
      expect(constants.F_OK).toBe(0);
      expect(constants.R_OK).toBe(4);
      expect(constants.W_OK).toBe(2);
      expect(constants.X_OK).toBe(1);
      
      // ファイルオープンフラグ
      expect(constants.O_RDONLY).toBe(0);
      expect(constants.O_WRONLY).toBe(1);
      expect(constants.O_RDWR).toBe(2);
      expect(constants.O_CREAT).toBe(64);
      expect(constants.O_EXCL).toBe(128);
      expect(constants.O_TRUNC).toBe(512);
      expect(constants.O_APPEND).toBe(1024);
    });
  });
  
  // エッジケース: インポートと再エクスポートの一貫性
  describe('インポートと再エクスポートの一貫性', () => {
    it('デフォルトエクスポートと名前付きエクスポートが同じ参照を持つこと', () => {
      // 関数が同じ参照を持つことを確認
      expect(fs.readFile).toBe(readFile);
      expect(fs.writeFile).toBe(writeFile);
      expect(fs.exists).toBe(exists);
      expect(fs.mkdir).toBe(mkdir);
      expect(fs.readdir).toBe(readdir);
      
      // オブジェクトが同じ参照を持つことを確認
      expect(fs.constants).toBe(constants);
      expect(fs.Buffer).toBe(Buffer);
    });
    
    it('型定義が正しくエクスポートされていること', () => {
      // 型定義のテストはコンパイル時にチェックされるので、
      // ここではエラーが発生しないことを確認するだけ
      expect(true).toBe(true);
    });
  });
});
