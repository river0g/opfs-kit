import { describe, expect, it } from 'vitest';
import { Buffer } from './index';

describe('Bufferクラス', () => {
  describe('fromメソッド', () => {
    it('文字列からBufferを作成できること', () => {
      const text = 'Hello World';
      const buf = Buffer.from(text);
      
      // 正しいタイプと長さを持つことを確認
      expect(buf instanceof Uint8Array).toBe(true);
      expect(buf.length).toBe(text.length);
      
      // 元の文字列に戻せることを確認
      expect(buf.toString()).toBe(text);
    });
    
    it('Base64文字列からBufferを作成できること', () => {
      const base64Text = 'SGVsbG8gV29ybGQ=';
      const originalText = 'Hello World';
      const buf = Buffer.from(base64Text, 'base64');
      
      // 正しいタイプと内容を持つことを確認
      expect(buf instanceof Uint8Array).toBe(true);
      expect(buf.toString()).toBe(originalText);
      
      // Base64に戻せることを確認
      expect(buf.toString('base64')).toBe(base64Text);
    });
    
    it('ArrayBufferからBufferを作成できること', () => {
      const bytes = new Uint8Array([72, 101, 108, 108, 111]); // "Hello"
      const arrayBuffer = bytes.buffer;
      const buf = Buffer.from(arrayBuffer);
      
      // 正しいタイプと内容を持つことを確認
      expect(buf instanceof Uint8Array).toBe(true);
      expect(buf.length).toBe(bytes.length);
      expect(buf.toString()).toBe('Hello');
      
      // 各バイトが正しいことを確認
      for (let i = 0; i < bytes.length; i++) {
        expect(buf[i]).toBe(bytes[i]);
      }
    });
    
    it('Uint8ArrayからBufferを作成できること', () => {
      const bytes = new Uint8Array([87, 111, 114, 108, 100]); // "World"
      const buf = Buffer.from(bytes);
      
      // 正しいタイプと内容を持つことを確認
      expect(buf instanceof Uint8Array).toBe(true);
      expect(buf.length).toBe(bytes.length);
      expect(buf.toString()).toBe('World');
      
      // 各バイトが正しいことを確認
      for (let i = 0; i < bytes.length; i++) {
        expect(buf[i]).toBe(bytes[i]);
      }
    });
    
    it('ArrayLike<number>からBufferを作成できること', () => {
      const array = { 0: 72, 1: 105, length: 2 }; // "Hi"
      const buf = Buffer.from(array);
      
      // 正しいタイプと内容を持つことを確認
      expect(buf instanceof Uint8Array).toBe(true);
      expect(buf.length).toBe(array.length);
      expect(buf[0]).toBe(72);
      expect(buf[1]).toBe(105);
      expect(buf.toString()).toBe('Hi');
    });
    
    // エッジケース: 大きなデータの処理
    it('大きなデータからBufferを作成できること', () => {
      // 1MBのデータを作成
      const size = 1024 * 1024;
      const largeArray = new Uint8Array(size);
      for (let i = 0; i < size; i++) {
        largeArray[i] = i % 256;
      }
      
      const buf = Buffer.from(largeArray);
      
      // サイズと内容の一部を確認
      expect(buf.length).toBe(size);
      expect(buf[0]).toBe(0);
      expect(buf[255]).toBe(255);
      expect(buf[256]).toBe(0);
    });
  });
  
  describe('allocメソッド', () => {
    it('指定したサイズのBufferを作成できること', () => {
      const size = 10;
      const buf = Buffer.alloc(size);
      
      // 正しいタイプと長さを持つことを確認
      expect(buf instanceof Uint8Array).toBe(true);
      expect(buf.length).toBe(size);
      
      // すべてのバイトが0で初期化されていることを確認
      for (let i = 0; i < size; i++) {
        expect(buf[i]).toBe(0);
      }
    });
    
    it('サイズ0のBufferを作成できること', () => {
      const buf = Buffer.alloc(0);
      
      // 正しいタイプと長さを持つことを確認
      expect(buf instanceof Uint8Array).toBe(true);
      expect(buf.length).toBe(0);
    });
    
    // エッジケース: 非常に大きなサイズのBuffer
    it('大きなサイズのBufferを作成できること', () => {
      // 10MBのBufferを作成
      const size = 10 * 1024 * 1024;
      const buf = Buffer.alloc(size);
      
      // 正しいサイズを持つことを確認
      expect(buf.length).toBe(size);
      
      // いくつかのインデックスをチェック
      expect(buf[0]).toBe(0);
      expect(buf[size - 1]).toBe(0);
    });
  });
  
  describe('toStringメソッド', () => {
    it('UTF-8文字列に変換できること', () => {
      const text = 'Hello 日本語'; // 日本語を含む
      const buf = Buffer.from(text);
      
      // 元の文字列に戻せることを確認
      expect(buf.toString()).toBe(text);
      expect(buf.toString('utf8')).toBe(text);
    });
    
    it('Base64文字列に変換できること', () => {
      const text = 'Hello World';
      const base64 = 'SGVsbG8gV29ybGQ=';
      const buf = Buffer.from(text);
      
      // Base64に正しく変換されることを確認
      expect(buf.toString('base64')).toBe(base64);
    });
    
    // エッジケース: 非ASCII文字を含む文字列
    it('非ASCII文字を含む文字列を正しく処理できること', () => {
      const text = '🚀 こんにちは世界! Привет мир! مرحبا بالعالم!';
      const buf = Buffer.from(text);
      
      // 元の文字列に戻せることを確認
      expect(buf.toString()).toBe(text);
      
      // Base64に変換して戻せることを確認
      const base64 = buf.toString('base64');
      const bufFromBase64 = Buffer.from(base64, 'base64');
      expect(bufFromBase64.toString()).toBe(text);
    });
  });
  
  describe('特殊ケース', () => {
    it('空文字列からBufferを作成できること', () => {
      const buf = Buffer.from('');
      
      expect(buf instanceof Uint8Array).toBe(true);
      expect(buf.length).toBe(0);
      expect(buf.toString()).toBe('');
    });
    
    it('日本語などのマルチバイト文字を正しく処理できること', () => {
      const text = 'こんにちは世界';
      const buf = Buffer.from(text);
      
      expect(buf instanceof Uint8Array).toBe(true);
      expect(buf.toString()).toBe(text);
    });
    
    // エッジケース: 無効なエンコーディング
    it('無効なエンコーディングを指定した場合はデフォルトのUTF-8として処理すること', () => {
      const text = 'Hello World';
      const buf = Buffer.from(text);
      
      // @ts-ignore - 意図的に無効なエンコーディングを渡す
      expect(buf.toString('invalid_encoding')).toBe(text);
    });
    
    // エッジケース: 非常に長い文字列
    it('非常に長い文字列を処理できること', () => {
      // 100KBの文字列を作成
      let longText = '';
      for (let i = 0; i < 10000; i++) {
        longText += 'abcdefghij'; // 10文字 x 10000 = 100,000文字
      }
      
      const buf = Buffer.from(longText);
      expect(buf.length).toBe(longText.length);
      expect(buf.toString()).toBe(longText);
    });
  });
});
