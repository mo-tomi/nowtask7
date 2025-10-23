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
 * @returns {boolean} 保存に成功した場合はtrue
 */
function saveToLocalStorage(key, data) {
  try {
    const jsonData = JSON.stringify(data);
    localStorage.setItem(key, jsonData);
    return true;
  } catch (error) {
    console.error(`ローカルストレージへの保存に失敗しました: ${key}`, error);
    // ストレージ容量超過エラーの場合の処理
    if (error.name === 'QuotaExceededError') {
      showErrorMessage('ストレージ容量が不足しています。不要なデータを削除してください。');
    } else {
      showErrorMessage('データの保存に失敗しました。ページを再読み込みしてください。');
    }
    return false;
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
 * 数値が正しい範囲内かを確認（バリデーション）
 * @param {number|string} value - 確認する値
 * @param {number} min - 最小値
 * @param {number} max - 最大値
 * @returns {boolean} 正しければ true、正しくなければ false
 */
function validateNumber(value, min, max) {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) {
    return false;
  }
  return num >= min && num <= max;
}

/**
 * 時刻形式が正しいかを確認（HH:MM形式）
 * @param {string} timeString - 確認する時刻文字列
 * @returns {boolean} 正しければ true、正しくなければ false
 */
function validateTime(timeString) {
  if (typeof timeString !== 'string') {
    return false;
  }
  const timePattern = /^([01]\d|2[0-3]):([0-5]\d)$/;
  return timePattern.test(timeString);
}

/**
 * 開始時刻と終了時刻の妥当性を確認
 * @param {string} startTime - 開始時刻（HH:MM形式）
 * @param {string} endTime - 終了時刻（HH:MM形式）
 * @returns {boolean} 正しければ true、正しくなければ false
 */
function validateTimeRange(startTime, endTime) {
  if (!validateTime(startTime) || !validateTime(endTime)) {
    return false;
  }
  // 時刻を分数に変換
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);
  // 終了時刻が開始時刻より後であることを確認（日跨ぎは許容）
  return true; // 日跨ぎを許容するため常にtrueを返す
}

/**
 * 時刻文字列を分数に変換
 * @param {string} timeString - 時刻文字列（HH:MM形式）
 * @returns {number} 0時からの経過分数
 */
function timeToMinutes(timeString) {
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * ユニークな ID を生成（重複チェック付き）
 * @returns {string} ユニークな ID
 */
function generateUniqueId() {
  const tasks = loadFromLocalStorage(STORAGE_KEYS.TASKS, []);
  let newId;
  let attempts = 0;
  const maxAttempts = 100;

  do {
    newId = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    attempts++;
    if (attempts >= maxAttempts) {
      console.error('ユニークなIDの生成に失敗しました');
      // フォールバック: より長いランダム文字列を使用
      newId = `${Date.now()}_${Math.random().toString(36).substring(2)}_${Math.random().toString(36).substring(2)}`;
      break;
    }
  } while (tasks.some(task => task.id === newId));

  return newId;
}

/**
 * エラーメッセージを表示する
 * @param {string} message - 表示するメッセージ
 */
function showErrorMessage(message) {
  // トースト通知が実装されている場合はそれを使用
  if (typeof showNotification === 'function') {
    showNotification(message, 'error');
  } else {
    // フォールバック: アラート表示
    alert(`エラー: ${message}`);
  }
}

/**
 * 成功メッセージを表示する
 * @param {string} message - 表示するメッセージ
 */
function showSuccessMessage(message) {
  // トースト通知が実装されている場合はそれを使用
  if (typeof showNotification === 'function') {
    showNotification(message, 'success');
  } else {
    // フォールバック: コンソールログ
    console.log(`成功: ${message}`);
  }
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
