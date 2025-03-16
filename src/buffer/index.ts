/**
 * バイナリデータを扱うためのBufferインターフェース
 * @private
 */
export interface Buffer extends Uint8Array {
  toString(encoding?: string): string;
}

/**
 * Buffer クラス
 */
export const Buffer = {
  /**
   * 様々なデータ型からBufferインスタンスを作成します
   *
   * @param {string | ArrayBuffer | Uint8Array | ArrayLike<number>} data - 変換元のデータ
   *   - string: 指定されたエンコーディングの文字列
   *   - ArrayBuffer: バイナリデータを含むArrayBuffer
   *   - Uint8Array: バイト配列
   *   - ArrayLike<number>: 数値配列のようなオブジェクト
   * @param {string} [encoding='utf8'] - 文字列を変換する際のエンコーディング
   *   - 'utf8': UTF-8エンコーディング（デフォルト）
   *   - 'base64': Base64エンコーディング
   * @returns {Buffer} 新しいBufferインスタンス
   *
   * @example
   * // 文字列からBufferを作成
   * const buf1 = Buffer.from('Hello World', 'utf8');
   *
   * // Base64文字列からBufferを作成
   * const buf2 = Buffer.from('SGVsbG8gV29ybGQ=', 'base64');
   *
   * // ArrayBufferからBufferを作成
   * const arrayBuffer = new ArrayBuffer(10);
   * const buf3 = Buffer.from(arrayBuffer);
   *
   * // Uint8ArrayからBufferを作成
   * const uint8Array = new Uint8Array([1, 2, 3, 4]);
   * const buf4 = Buffer.from(uint8Array);
   */
  from(data: string | ArrayBuffer | Uint8Array | ArrayLike<number>, encoding?: string): Buffer {
    if (typeof data === 'string') {
      if (encoding === 'base64') {
        const binaryString = atob(data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const buffer = new Uint8Array(bytes.buffer) as Buffer;
        buffer.toString = function (encoding = 'utf8'): string {
          if (encoding === 'base64') {
            return btoa(String.fromCharCode(...new Uint8Array(this.buffer)));
          }
          const decoder = new TextDecoder();
          return decoder.decode(this);
        };
        return buffer;
      }
      const encoder = new TextEncoder();
      const buffer = new Uint8Array(encoder.encode(data)) as Buffer;
      buffer.toString = function (encoding = 'utf8'): string {
        if (encoding === 'base64') {
          return btoa(String.fromCharCode(...new Uint8Array(this.buffer)));
        }
        const decoder = new TextDecoder();
        return decoder.decode(this);
      };
      return buffer;
    }
    if (data instanceof ArrayBuffer) {
      const buffer = new Uint8Array(data) as Buffer;
      buffer.toString = function (encoding = 'utf8'): string {
        if (encoding === 'base64') {
          return btoa(String.fromCharCode(...new Uint8Array(this.buffer)));
        }
        const decoder = new TextDecoder();
        return decoder.decode(this);
      };
      return buffer;
    }
    if (data instanceof Uint8Array) {
      const buffer = new Uint8Array(data) as Buffer;
      buffer.toString = function (encoding = 'utf8'): string {
        if (encoding === 'base64') {
          return btoa(String.fromCharCode(...new Uint8Array(this.buffer)));
        }
        const decoder = new TextDecoder();
        return decoder.decode(this);
      };
      return buffer;
    }
    // ArrayLike<number> の場合
    const array = new Uint8Array(data.length);
    for (let i = 0; i < data.length; i++) {
      array[i] = data[i];
    }
    const buffer = array as Buffer;
    buffer.toString = function (encoding = 'utf8'): string {
      if (encoding === 'base64') {
        return btoa(String.fromCharCode(...new Uint8Array(this.buffer)));
      }
      const decoder = new TextDecoder();
      return decoder.decode(this);
    };
    return buffer;
  },

  /**
   * 指定されたサイズの新しいBufferインスタンスを作成します
   *
   * @param {number} size - 作成するBufferのサイズ（バイト数）
   * @returns {Buffer} 作成したBufferインスタンス
   *
   * @example
   * // 10バイトのBufferを作成
   * const buf = Buffer.alloc(10);
   * // <Buffer 00 00 00 00 00 00 00 00 00 00>
   */
  alloc(size: number): Buffer {
    const buffer = new Uint8Array(size) as Buffer;
    buffer.toString = function (encoding = 'utf8'): string {
      if (encoding === 'base64') {
        return btoa(String.fromCharCode(...new Uint8Array(this.buffer)));
      }
      const decoder = new TextDecoder();
      return decoder.decode(this);
    };
    return buffer;
  },
};

export default Buffer;
