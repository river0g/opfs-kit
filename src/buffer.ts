/**
 * Bufferu30afu30e9u30b9u306eu5b9fu88c5
 * Node.jsu306eBufferu306bu4f3cu305fu30a4u30f3u30bfu30fcu30d5u30a7u30fcu30b9u3092u63d0u4f9b
 */

/**
 * Bufferu30afu30e9u30b9
 * u30d0u30a4u30cau30eau30c7u30fcu30bfu3092u6271u3046u305fu3081u306eUint8Arrayu306eu62e1u5f35
 */
export class Buffer extends Uint8Array {
  /**
   * u6587u5b57u5217u304bu3089Bufferu3092u4f5cu6210
   * @param data u5909u63dbu3059u308bu6587u5b57u5217u307eu305fu306fu914du5217
   * @param encoding u30a8u30f3u30b3u30fcu30c7u30a3u30f3u30b0
   * @returns Bufferu30a4u30f3u30b9u30bfu30f3u30b9
   */
  static from(data: string | ArrayBuffer | ArrayLike<number>, encoding?: string): Buffer {
    if (typeof data === 'string') {
      // u6587u5b57u5217u306eu5834u5408u306fu30a8u30f3u30b3u30fcu30c9
      const encoder = new TextEncoder();
      return new Buffer(encoder.encode(data).buffer);
    } else if (data instanceof ArrayBuffer) {
      // ArrayBufferu306eu5834u5408u306fu305du306eu307eu307eu4f7fu7528
      return new Buffer(data);
    } else {
      // u914du5217u306eu5834u5408u306fu65b0u3057u3044u30d0u30c3u30d5u30a1u306bu30b3u30d4u30fc
      return new Buffer(new Uint8Array(data).buffer);
    }
  }

  /**
   * u30d0u30a4u30c8u6570u3092u6307u5b9au3057u3066u65b0u3057u3044Bufferu3092u4f5cu6210
   * @param size u30d0u30a4u30c8u6570
   * @returns Bufferu30a4u30f3u30b9u30bfu30f3u30b9
   */
  static alloc(size: number): Buffer {
    return new Buffer(new ArrayBuffer(size));
  }

  /**
   * Bufferu3092u6587u5b57u5217u306bu5909u63db
   * @param encoding u30a8u30f3u30b3u30fcu30c7u30a3u30f3u30b0
   * @returns u6587u5b57u5217
   */
  toString(encoding?: string): string {
    const decoder = new TextDecoder(encoding || 'utf-8');
    return decoder.decode(this);
  }

  /**
   * Bufferu3092u7d50u5408
   * @param list u7d50u5408u3059u308bBufferu306eu914du5217
   * @returns u65b0u3057u3044Buffer
   */
  static concat(list: Buffer[]): Buffer {
    // u5168u4f53u306eu9577u3055u3092u8a08u7b97
    const totalLength = list.reduce((acc, buf) => acc + buf.length, 0);
    const result = Buffer.alloc(totalLength);
    
    // u5404Bufferu3092u7d50u5408
    let offset = 0;
    for (const buf of list) {
      result.set(buf, offset);
      offset += buf.length;
    }
    
    return result;
  }
}
