/* データマイグレーション - データ形式の変更対応 */

// ===== スキーマバージョン管理 =====

// 現在のデータスキーマバージョン
const CURRENT_SCHEMA_VERSION = 1;

/**
 * 保存されているデータスキーマのバージョンを取得
 * @returns {number} バージョン番号
 */
function getStoredSchemaVersion() {
  const version = loadFromLocalStorage(STORAGE_KEYS.SCHEMA_VERSION, 0);
  return parseInt(version, 10);
}

/**
 * データスキーマバージョンを更新
 * @param {number} version - 新しいバージョン番号
 */
function updateSchemaVersion(version) {
  saveToLocalStorage(STORAGE_KEYS.SCHEMA_VERSION, version);
}

// ===== マイグレーション処理 =====

/**
 * バージョン 0 から 1 への マイグレーション
 * （古いタスク形式から新しい形式へ変換）
 * @returns {boolean} マイグレーション成功フラグ
 */
function migrateFromV0ToV1() {
  try {
    let tasks = loadFromLocalStorage(STORAGE_KEYS.TASKS, []);

    // タスクが存在する場合、各タスクをチェック
    if (tasks.length > 0) {
      tasks = tasks.map(task => {
        // 新しいフィールドが存在しない場合、デフォルト値を設定
        return {
          id: task.id || generateUniqueId(),
          text: task.text || '',
          completed: task.completed || false,
          createdDate: task.createdDate || getTodayDate(),
          createdTime: task.createdTime || '00:00'
        };
      });

      saveToLocalStorage(STORAGE_KEYS.TASKS, tasks);
    }

    return true;
  } catch (error) {
    console.error('マイグレーション処理（v0→v1）に失敗しました', error);
    return false;
  }
}

/**
 * マイグレーション処理を実行
 */
function executeMigration() {
  const currentVersion = getStoredSchemaVersion();

  console.log(`現在のスキーマバージョン: ${currentVersion}`);
  console.log(`期待されるスキーマバージョン: ${CURRENT_SCHEMA_VERSION}`);

  // バージョンが最新より古い場合、マイグレーションを実行
  if (currentVersion < 1) {
    console.log('マイグレーション: v0 → v1 を実行します');
    if (migrateFromV0ToV1()) {
      updateSchemaVersion(1);
      console.log('マイグレーション完了（v0 → v1）');
    } else {
      console.error('マイグレーション失敗（v0 → v1）');
    }
  }

  // バージョンが最新の場合
  if (currentVersion === CURRENT_SCHEMA_VERSION) {
    console.log('データスキーマは最新バージョンです');
  }
}

// ===== 初期化処理 =====

/**
 * マイグレーション機能の初期化
 */
function initializeMigration() {
  executeMigration();
  console.log('データマイグレーション機能を初期化しました');
}

// ページ読み込み時にマイグレーション機能を初期化
onDOMReady(initializeMigration);
