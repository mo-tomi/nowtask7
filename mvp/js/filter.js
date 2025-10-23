/* フィルタ・ソート機能 - タスクの絞り込みと並び替え */

// ===== フィルタ・ソート状態管理 =====

let filterState = {
  emergency: false,
  priority: '',
  sortBy: 'created'
};

// ===== フィルタ機能 =====

/**
 * タスクをフィルタリング
 * @param {Array} tasks - タスクの配列
 * @returns {Array} フィルタリングされたタスク
 */
function applyFilters(tasks) {
  let filteredTasks = tasks;

  // 緊急フィルタ
  if (filterState.emergency) {
    filteredTasks = filteredTasks.filter(task => task.emergency === true);
  }

  // 優先度フィルタ
  if (filterState.priority) {
    filteredTasks = filteredTasks.filter(task => task.priority === filterState.priority);
  }

  return filteredTasks;
}

/**
 * フィルタをクリア
 */
function clearFilters() {
  filterState.emergency = false;
  filterState.priority = '';

  // UI を更新
  const emergencyCheckbox = getElement('#filterEmergency');
  const prioritySelect = getElement('#filterPriority');

  if (emergencyCheckbox) {
    emergencyCheckbox.checked = false;
  }

  if (prioritySelect) {
    prioritySelect.value = '';
  }

  // タスク一覧を再表示
  applyFiltersAndSort();
}

// ===== ソート機能 =====

/**
 * タスクをソート
 * @param {Array} tasks - タスクの配列
 * @returns {Array} ソートされたタスク
 */
function applySorting(tasks) {
  const sortedTasks = [...tasks];

  switch (filterState.sortBy) {
    case 'created':
      // 追加順（新しい順）
      sortedTasks.sort((a, b) => {
        const dateA = new Date(a.createdDate + ' ' + a.createdTime);
        const dateB = new Date(b.createdDate + ' ' + b.createdTime);
        return dateB - dateA;
      });
      break;

    case 'priority':
      // 優先順位順
      const priorityOrder = { high: 1, medium: 2, low: 3 };
      sortedTasks.sort((a, b) => {
        const priorityA = priorityOrder[a.priority] || 4;
        const priorityB = priorityOrder[b.priority] || 4;
        return priorityA - priorityB;
      });
      break;

    case 'time':
      // 時間順（期限が近い順）
      sortedTasks.sort((a, b) => {
        const timeA = a.endTime ? parseTimeToMinutes(a.endTime) : 9999;
        const timeB = b.endTime ? parseTimeToMinutes(b.endTime) : 9999;
        return timeA - timeB;
      });
      break;
  }

  return sortedTasks;
}

/**
 * 時刻文字列を分に変換
 * @param {string} timeString - HH:MM形式の時刻文字列
 * @returns {number} 0時からの経過分数
 */
function parseTimeToMinutes(timeString) {
  if (!timeString) return 9999;
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
}

// ===== フィルタ・ソート適用 =====

/**
 * フィルタとソートを適用してタスクを表示
 */
function applyFiltersAndSort() {
  // search.jsと連携
  if (typeof applySearchAndFilters === 'function') {
    applySearchAndFilters();
  } else {
    // search.jsがない場合は独自に処理
    const allTasks = loadFromLocalStorage(STORAGE_KEYS.TASKS, []);
    let filteredTasks = applyFilters(allTasks);
    filteredTasks = applySorting(filteredTasks);

    const tasksContainer = getElement('#tasksContainer');
    tasksContainer.innerHTML = '';

    const groupedTasksElement = createGroupedTaskListElement(filteredTasks);
    tasksContainer.appendChild(groupedTasksElement);

    if (typeof attachTaskEventListeners === 'function') {
      attachTaskEventListeners();
    }

    if (typeof attachGroupToggleListeners === 'function') {
      attachGroupToggleListeners();
    }
  }
}

// ===== イベントハンドラー =====

/**
 * 緊急フィルタチェックボックス変更イベント
 */
function handleEmergencyFilterChange(event) {
  filterState.emergency = event.target.checked;
  applyFiltersAndSort();
}

/**
 * 優先度フィルタセレクト変更イベント
 */
function handlePriorityFilterChange(event) {
  filterState.priority = event.target.value;
  applyFiltersAndSort();
}

/**
 * ソートセレクト変更イベント
 */
function handleSortChange(event) {
  filterState.sortBy = event.target.value;
  applyFiltersAndSort();
}

/**
 * クリアボタンクリックイベント
 */
function handleClearFiltersClick() {
  clearFilters();
}

// ===== 初期化処理 =====

/**
 * フィルタ・ソート機能の初期化
 */
function initializeFilters() {
  // 緊急フィルタチェックボックス
  const emergencyCheckbox = getElement('#filterEmergency');
  if (emergencyCheckbox) {
    attachEventListener(emergencyCheckbox, 'change', handleEmergencyFilterChange);
  }

  // 優先度フィルタセレクト
  const prioritySelect = getElement('#filterPriority');
  if (prioritySelect) {
    attachEventListener(prioritySelect, 'change', handlePriorityFilterChange);
  }

  // ソートセレクト
  const sortSelect = getElement('#sortBy');
  if (sortSelect) {
    attachEventListener(sortSelect, 'change', handleSortChange);
  }

  // クリアボタン
  const clearButton = getElement('#clearFilters');
  if (clearButton) {
    attachEventListener(clearButton, 'click', handleClearFiltersClick);
  }

  console.log('フィルタ・ソート機能を初期化しました');
}

// ページ読み込み時に初期化
onDOMReady(initializeFilters);
