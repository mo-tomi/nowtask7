/* コア機能 - ローカルストレージ、ユーティリティ関数 */

// ===== ローカルストレージキーの定義 =====
const STORAGE_KEYS = {
  TASKS: 'nowTask_tasks',
  SCHEMA_VERSION: 'nowTask_schemaVersion',
  TIME_DISPLAY_FORMAT: 'nowTask_timeDisplayFormat',
  TIME_FORMAT_STYLE: 'nowTask_timeFormatStyle'
};

// ===== ローカルストレージ機能 =====

/**
 * データをローカルストレージに保存
 * @param {string} key - ストレージキー
 * @param {*} data - 保存するデータ
 */
function saveToLocalStorage(key, data) {
  try {
    const jsonData = JSON.stringify(data);
    localStorage.setItem(key, jsonData);
  } catch (error) {
    console.error(`ローカルストレージへの保存に失敗しました: ${key}`, error);
  }
}

/**
 * ローカルストレージからデータを読み込む
 * @param {string} key - ストレージキー
 * @param {*} defaultValue - デフォルト値
 * @returns {*} 読み込んだデータ
 */
function loadFromLocalStorage(key, defaultValue = null) {
  try {
    const jsonData = localStorage.getItem(key);
    return jsonData ? JSON.parse(jsonData) : defaultValue;
  } catch (error) {
    console.error(`ローカルストレージからの読み込みに失敗しました: ${key}`, error);
    return defaultValue;
  }
}

/**
 * ローカルストレージからデータを削除
 * @param {string} key - ストレージキー
 */
function deleteFromLocalStorage(key) {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`ローカルストレージからの削除に失敗しました: ${key}`, error);
  }
}

// ===== ユーティリティ関数 =====

/**
 * DOM 要素を取得（便利関数）
 * @param {string} selector - CSSセレクタ
 * @returns {Element|null} 取得した要素
 */
function getElement(selector) {
  return document.querySelector(selector);
}

/**
 * 複数の DOM 要素を取得
 * @param {string} selector - CSSセレクタ
 * @returns {NodeList} 取得した要素のリスト
 */
function getElements(selector) {
  return document.querySelectorAll(selector);
}

/**
 * DOM 要素にイベントリスナーを追加
 * @param {Element} element - 対象要素
 * @param {string} eventType - イベントタイプ（例：'click', 'submit'）
 * @param {Function} callback - コールバック関数
 */
function attachEventListener(element, eventType, callback) {
  if (element) {
    element.addEventListener(eventType, callback);
  }
}

/**
 * 複数要素にイベントリスナーを追加
 * @param {NodeList} elements - 対象要素のリスト
 * @param {string} eventType - イベントタイプ
 * @param {Function} callback - コールバック関数
 */
function attachEventListenerToAll(elements, eventType, callback) {
  elements.forEach(element => {
    attachEventListener(element, eventType, callback);
  });
}

/**
 * 日付を YYYY-MM-DD 形式の文字列に変換
 * @param {Date} date - 変換する日付
 * @returns {string} YYYY-MM-DD 形式の文字列
 */
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 時刻を HH:MM 形式の文字列に変換
 * @param {Date} date - 変換する日付
 * @returns {string} HH:MM 形式の文字列
 */
function formatTime(date) {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * 現在の日付を YYYY-MM-DD 形式で取得
 * @returns {string} 現在の日付
 */
function getTodayDate() {
  return formatDate(new Date());
}

/**
 * テキストが正しいかを確認（バリデーション）
 * @param {string} text - 確認するテキスト
 * @param {number} minLength - 最小文字数（デフォルト：1）
 * @param {number} maxLength - 最大文字数（デフォルト：100）
 * @returns {boolean} 正しければ true、正しくなければ false
 */
function validateText(text, minLength = 1, maxLength = 100) {
  if (typeof text !== 'string') {
    return false;
  }
  const trimmedText = text.trim();
  return trimmedText.length >= minLength && trimmedText.length <= maxLength;
}

/**
 * ユニークな ID を生成
 * @returns {string} ユニークな ID
 */
function generateUniqueId() {
  return `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// ===== 初期化処理 =====

/**
 * DOM が完全に読み込まれたときに実行する処理を登録
 * @param {Function} callback - 実行するコールバック関数
 */
function onDOMReady(callback) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', callback);
  } else {
    callback();
  }
}

/**
 * アプリケーションの初期化処理
 */
function initializeApp() {
  // ローカルストレージからタスクを読み込む
  const tasks = loadFromLocalStorage(STORAGE_KEYS.TASKS, []);

  // デバッグ情報をコンソールに出力
  console.log('Now Task アプリケーション初期化完了');
  console.log(`保存されているタスク数: ${tasks.length}`);
}

// DOM が準備できたら、アプリケーションを初期化
onDOMReady(initializeApp);
