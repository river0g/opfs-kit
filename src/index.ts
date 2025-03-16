/**
 * OPFS (Origin Private File System) Package
 * Node.js の fs パッケージと同等のインターフェースを提供
 */

// 各モジュールからエクスポート
import { Buffer } from './buffer';
import {
  constants,
  exists,
  existsSync,
  mkdir,
  readFile,
  readFileSync,
  readdir,
  unlink,
  writeFile,
  writeFileSync,
} from './fs';
import { isOPFSSupported } from './utils/fs-utils';

// 再エクスポート
export { Buffer } from './buffer';
export {
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
} from './fs';
export { isOPFSSupported } from './utils/fs-utils';

// 型定義のエクスポート
export type { FileEncoding, FileFlag, ReadFileOptions, WriteFileOptions } from './utils/fs-utils';

// デフォルトエクスポート
export default {
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
  Buffer,
  isOPFSSupported,
};
