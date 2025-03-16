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
  });
  
  describe('特殊ケース', () => {
    it('空文字列からBufferを作成できること', () => {
      const buf = Buffer.from('');
      
      expect(buf instanceof Uint8Array).toBe(true);
      expect(buf.length).toBe(0);
      expect(buf.toString()).toBe('');
    });
    
    it('日本語などのマルチバイト文字を正しく処理できること', () => {
      const text = 'こんにちは世界'; // "こんにちは世界"
      const buf = Buffer.from(text);
      
      expect(buf instanceof Uint8Array).toBe(true);
      expect(buf.toString()).toBe(text);
    });
  });
});
