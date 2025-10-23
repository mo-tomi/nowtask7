/* X共有機能 - タスク完了を X（Twitter）にシェア */

// ===== X共有リンク生成 =====

/**
 * ツイート内容を生成
 * @param {string} taskText - タスク内容
 * @returns {string} ツイート内容
 */
function generateTweetContent(taskText) {
  const date = getTodayDate();
  return `✅ タスク完了！「${taskText}」を達成しました。
Now Task で 24 時間タスク管理を実践中！ #NowTask #タスク管理`;
}

/**
 * X（Twitter）の共有リンクを生成
 * @param {string} tweetContent - ツイート内容
 * @returns {string} X共有リンク
 */
function generateXShareLink(tweetContent) {
  const text = encodeURIComponent(tweetContent);
  return `https://twitter.com/intent/tweet?text=${text}`;
}

// ===== 共有機能 =====

/**
 * タスク完了時に X 共有ボタンを表示
 * @param {string} taskId - タスク ID
 * @param {string} taskText - タスク内容
 */
function showXShareButton(taskId, taskText) {
  const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);

  if (!taskElement) {
    return;
  }

  // 既に共有ボタンがあれば削除
  const existingShareBtn = taskElement.querySelector('.task-share-btn');
  if (existingShareBtn) {
    existingShareBtn.remove();
  }

  // 共有ボタンを作成
  const shareBtn = document.createElement('button');
  shareBtn.className = 'task-share-btn';
  shareBtn.textContent = 'Xで共有';
  shareBtn.setAttribute('aria-label', 'X（Twitter）で共有');

  // クリックイベントを追加
  attachEventListener(shareBtn, 'click', () => {
    handleXShareClick(taskText);
  });

  // タスク要素に共有ボタンを追加
  const taskContent = taskElement.querySelector('.task-item-content');
  if (taskContent) {
    taskContent.appendChild(shareBtn);
  }
}

/**
 * X 共有ボタンクリックイベント
 * @param {string} taskText - タスク内容
 */
function handleXShareClick(taskText) {
  const tweetContent = generateTweetContent(taskText);
  const shareLink = generateXShareLink(tweetContent);

  // 新しいウィンドウで X の共有ページを開く
  window.open(shareLink, '_blank', 'width=600,height=400');
}

/**
 * すべての完了済みタスクに共有ボタンを追加
 */
function attachXShareButtonsToCompletedTasks() {
  const tasks = loadFromLocalStorage(STORAGE_KEYS.TASKS, []);

  tasks.forEach(task => {
    if (task.completed) {
      // 共有ボタンが存在しないかチェック
      const taskElement = document.querySelector(`[data-task-id="${task.id}"]`);
      if (taskElement && !taskElement.querySelector('.task-share-btn')) {
        // 共有ボタンを表示
        showXShareButton(task.id, task.text);
      }
    }
  });
}

// ===== 初期化処理 =====

/**
 * X 共有機能の初期化
 */
function initializeShare() {
  // すべての完了済みタスクに共有ボタンを追加
  attachXShareButtonsToCompletedTasks();

  console.log('X 共有機能を初期化しました');
}

// ページ読み込み時に X 共有機能を初期化
onDOMReady(initializeShare);
