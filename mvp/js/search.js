/* 検索機能 - タスクの検索とフィルタリング */

// ===== 検索状態管理 =====

let searchQuery = '';

// ===== 検索機能 =====

/**
 * タスクを検索
 * @param {Array} tasks - タスクの配列
 * @param {string} query - 検索クエリ
 * @returns {Array} 検索結果のタスク
 */
function searchTasks(tasks, query) {
  if (!query || query.trim() === '') {
    return tasks;
  }

  const lowerQuery = query.toLowerCase().trim();

  return tasks.filter(task => {
    // タスク名で検索
    const taskNameMatch = task.text && task.text.toLowerCase().includes(lowerQuery);

    // メモで検索
    const memoMatch = task.memo && task.memo.toLowerCase().includes(lowerQuery);

    return taskNameMatch || memoMatch;
  });
}

/**
 * 検索クエリをクリア
 */
function clearSearch() {
  searchQuery = '';

  const searchInput = getElement('#searchInput');
  const clearButton = getElement('#clearSearch');

  if (searchInput) {
    searchInput.value = '';
  }

  if (clearButton) {
    clearButton.style.display = 'none';
  }

  // タスク一覧を再表示
  applySearchAndFilters();
}

// ===== 検索とフィルタの統合 =====

/**
 * 検索、フィルタ、ソートを適用してタスクを表示
 */
function applySearchAndFilters() {
  // すべてのタスクを取得
  const allTasks = loadFromLocalStorage(STORAGE_KEYS.TASKS, []);

  // 検索を適用
  let filteredTasks = searchTasks(allTasks, searchQuery);

  // フィルタを適用（filter.jsの関数）
  if (typeof applyFilters === 'function') {
    filteredTasks = applyFilters(filteredTasks);
  }

  // ソートを適用（filter.jsの関数）
  if (typeof applySorting === 'function') {
    filteredTasks = applySorting(filteredTasks);
  }

  // タスクコンテナを取得
  const tasksContainer = getElement('#tasksContainer');

  // 既存の内容をクリア
  tasksContainer.innerHTML = '';

  // タスクをグループ化して表示
  const groupedTasksElement = createGroupedTaskListElement(filteredTasks);
  tasksContainer.appendChild(groupedTasksElement);

  // 各タスク要素にイベントリスナーを追加
  if (typeof attachTaskEventListeners === 'function') {
    attachTaskEventListeners();
  }

  if (typeof attachGroupToggleListeners === 'function') {
    attachGroupToggleListeners();
  }

  // 検索結果が0件の場合
  if (filteredTasks.length === 0 && allTasks.length > 0) {
    tasksContainer.innerHTML = `
      <div class="empty-state">
        <p>検索結果が見つかりませんでした</p>
        <p class="empty-state-hint">別のキーワードで検索してみてください</p>
      </div>
    `;
  }
}

// ===== イベントハンドラー =====

/**
 * 検索入力イベント（リアルタイム検索）
 */
function handleSearchInput(event) {
  searchQuery = event.target.value;

  const clearButton = getElement('#clearSearch');

  // クリアボタンの表示/非表示
  if (clearButton) {
    if (searchQuery.trim() !== '') {
      clearButton.style.display = 'block';
    } else {
      clearButton.style.display = 'none';
    }
  }

  // デバウンス処理を適用してタスク一覧を更新
  debouncedApplySearchAndFilters();
}

// デバウンスされた検索・フィルタ適用関数（300ms待機）
const debouncedApplySearchAndFilters = window.PerformanceOptimizer
  ? window.PerformanceOptimizer.debounce(applySearchAndFilters, 300)
  : applySearchAndFilters;

/**
 * クリアボタンクリックイベント
 */
function handleClearSearchClick() {
  clearSearch();
}

// ===== 初期化処理 =====

/**
 * 検索機能の初期化
 */
function initializeSearch() {
  // 検索入力欄
  const searchInput = getElement('#searchInput');
  if (searchInput) {
    attachEventListener(searchInput, 'input', handleSearchInput);
  }

  // クリアボタン
  const clearButton = getElement('#clearSearch');
  if (clearButton) {
    attachEventListener(clearButton, 'click', handleClearSearchClick);
  }

  console.log('検索機能を初期化しました');
}

// ページ読み込み時に初期化
onDOMReady(initializeSearch);
