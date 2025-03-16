/**
 * OPFSパッケージを使用したサンプルアプリケーション
 */

// パッケージをインポート
// 実際にはパッケージがインストールされている場合は以下のようにインポートします
// import opfsHandler, { isOPFSSupported } from 'opfs-package';

// ローカル開発ではパッケージのビルド結果を直接インポート
// パスはプロジェクトの構造に合わせて調整してください
import opfsHandler from '../../dist/index.js';
// DOM要素の取得
const statusContainer = document.getElementById('status-container') as HTMLDivElement;
const filenameInput = document.getElementById('filename') as HTMLInputElement;
const contentInput = document.getElementById('content') as HTMLTextAreaElement;
const writeBtn = document.getElementById('write-btn') as HTMLButtonElement;
const listBtn = document.getElementById('list-btn') as HTMLButtonElement;
const fileList = document.getElementById('file-list') as HTMLUListElement;
const output = document.getElementById('output') as HTMLDivElement;

// ログ出力関数
function log(message: string): void {
  const timestamp = new Date().toLocaleTimeString();
  output.textContent += `[${timestamp}] ${message}\n`;
  output.scrollTop = output.scrollHeight;
}

// ステータス表示関数
function showStatus(message: string, isError = false): void {
  statusContainer.innerHTML = '';
  const statusDiv = document.createElement('div');
  statusDiv.className = `status ${isError ? 'error' : 'success'}`;
  statusDiv.textContent = message;
  statusContainer.appendChild(statusDiv);
}

// ファイル一覧を更新する関数
async function updateFileList(): Promise<void> {
  try {
    const files = await opfsHandler.readdir('/');
    fileList.innerHTML = '';
    
    if (files.length === 0) {
      const li = document.createElement('li');
      li.textContent = 'ファイルがありません';
      fileList.appendChild(li);
      return;
    }
    
    for (const file of files) {
      const li = document.createElement('li');
      li.className = 'file-item';
      
      const fileNameSpan = document.createElement('span');
      fileNameSpan.className = 'file-name';
      fileNameSpan.textContent = file;
      fileNameSpan.addEventListener('click', () => readFile(file));
      
      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'delete-btn';
      deleteBtn.textContent = '削除';
      deleteBtn.addEventListener('click', () => deleteFile(file));
      
      li.appendChild(fileNameSpan);
      li.appendChild(deleteBtn);
      fileList.appendChild(li);
    }
    
    log(`${files.length}個のファイルが見つかりました`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '不明なエラー';
    log(`ファイル一覧の取得中にエラーが発生しました: ${errorMessage}`);
    showStatus(`ファイル一覧の取得に失敗しました: ${errorMessage}`, true);
  }
}

// ファイルを読み込む関数
async function readFile(filename: string): Promise<void> {
  try {
    const content = await opfsHandler.readFile(filename);
    log(`ファイル "${filename}" の内容: ${content}`);
    showStatus(`ファイル "${filename}" を正常に読み込みました`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '不明なエラー';
    log(`ファイルの読み込み中にエラーが発生しました: ${errorMessage}`);
    showStatus(`ファイルの読み込みに失敗しました: ${errorMessage}`, true);
  }
}

// ファイルを削除する関数
async function deleteFile(filename: string): Promise<void> {
  try {
    await opfsHandler.unlink(filename);
    log(`ファイル "${filename}" を削除しました`);
    showStatus(`ファイル "${filename}" を正常に削除しました`);
    updateFileList();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '不明なエラー';
    log(`ファイルの削除中にエラーが発生しました: ${errorMessage}`);
    showStatus(`ファイルの削除に失敗しました: ${errorMessage}`, true);
  }
}

// イベントリスナーの設定
writeBtn.addEventListener('click', async () => {
  const filename = filenameInput.value.trim();
  const content = contentInput.value;
  
  if (!filename) {
    showStatus('ファイル名を入力してください', true);
    return;
  }
  
  try {
    await opfsHandler.writeFile(filename, content);
    log(`ファイル "${filename}" を保存しました`);
    showStatus(`ファイル "${filename}" を正常に保存しました`);
    filenameInput.value = '';
    contentInput.value = '';
    updateFileList();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '不明なエラー';
    log(`ファイルの保存中にエラーが発生しました: ${errorMessage}`);
    showStatus(`ファイルの保存に失敗しました: ${errorMessage}`, true);
  }
});

listBtn.addEventListener('click', updateFileList);

