/* テンプレート管理 - HTML 要素の動的生成 */

// ===== テンプレート定義 =====

/**
 * タスク要素の HTML テンプレート
 * @param {Object} task - タスクオブジェクト
 * @returns {string} HTML文字列
 */
function createTaskElementTemplate(task) {
  const completedClass = task.completed ? 'completed' : '';
  const completedAttr = task.completed ? 'checked' : '';

  // 優先度クラスの設定
  let priorityClass = '';
  if (task.priority === 'high') {
    priorityClass = 'priority-high';
  } else if (task.priority === 'medium') {
    priorityClass = 'priority-medium';
  } else if (task.priority === 'low') {
    priorityClass = 'priority-low';
  }

  // 緊急フラグのクラス設定
  const urgentClass = task.emergency ? 'urgent' : '';

  // 所要時間表示
  let durationBadge = '';
  if (task.duration) {
    durationBadge = `<span class="duration-badge">${task.duration}分</span>`;
  }

  // 緊急バッジ
  let urgentBadge = '';
  if (task.emergency) {
    urgentBadge = `<span class="urgent-badge">緊急</span>`;
  }

  // サブタスクがある場合のHTML生成
  let subtasksHtml = '';
  if (task.subtasks && task.subtasks.length > 0) {
    const completedSubtasks = task.subtasks.filter(st => st.completed).length;
    const totalSubtasks = task.subtasks.length;

    subtasksHtml = `
      <div class="subtasks-container">
        ${task.subtasks.map(subtask => `
          <div class="subtask-item">
            <div class="subtask-checkbox ${subtask.completed ? 'checked' : ''}"
                 data-task-id="${task.id}"
                 data-subtask-id="${subtask.id}"></div>
            <div class="subtask-text ${subtask.completed ? 'completed' : ''}">${escapeHtml(subtask.text)}</div>
          </div>
        `).join('')}
      </div>
    `;
  }

  // サブタスクバッジ（サブタスクがある場合）
  let subtaskBadge = '';
  if (task.subtasks && task.subtasks.length > 0) {
    const completedSubtasks = task.subtasks.filter(st => st.completed).length;
    const totalSubtasks = task.subtasks.length;
    subtaskBadge = `<div class="subtask-badge">${completedSubtasks}/${totalSubtasks}完了</div>`;
  }

  return `
    <div class="task-card-right ${completedClass} ${priorityClass} ${urgentClass}" data-task-id="${task.id}">
      <div class="task-body-right">
        <div class="task-header">
          ${subtaskBadge ? `<div class="expand-btn collapsed"></div>` : ''}
          <div class="task-title">${escapeHtml(task.text)}</div>
          ${subtaskBadge}
        </div>
        <div class="task-meta">
          ${durationBadge}
          ${urgentBadge}
        </div>
        ${subtasksHtml}
      </div>
      <button class="task-menu-btn" aria-label="メニューを開く" title="メニュー">⋮</button>
      <div class="task-checkbox-right ${completedAttr ? 'checked' : ''}" aria-label="タスク完了状態"></div>
      <div class="task-context-menu" style="display: none;">
        <button class="context-menu-item task-edit-btn" data-action="edit">
          <svg class="icon-svg icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
          <span>編集</span>
        </button>
        <button class="context-menu-item task-duplicate-btn" data-action="duplicate">
          <svg class="icon-svg icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
          <span>複製</span>
        </button>
        <button class="context-menu-item task-delete-btn" data-action="delete">
          <svg class="icon-svg icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
          <span>削除</span>
        </button>
      </div>
    </div>
  `;
}

/**
 * タスクリストの HTML テンプレート
 * @param {Array} tasks - タスクの配列
 * @returns {string} HTML文字列
 */
function createTaskListTemplate(tasks) {
  if (tasks.length === 0) {
    return `
      <div class="empty-state">
        <p>タスクがまだありません</p>
        <p class="empty-state-hint">上のフォームからタスクを追加してください</p>
      </div>
    `;
  }

  const taskElements = tasks.map(task => createTaskElementTemplate(task)).join('');
  return taskElements;
}

/**
 * グループ化されたタスクリストのHTMLテンプレート
 * @param {Array} tasks - タスクの配列
 * @returns {string} HTML文字列
 */
function createGroupedTaskListTemplate(tasks) {
  if (tasks.length === 0) {
    return `
      <div class="empty-state">
        <p>タスクがまだありません</p>
        <p class="empty-state-hint">上のフォームからタスクを追加してください</p>
      </div>
    `;
  }

  // タスクを完了状態で分類
  const incomplete = tasks.filter(task => !task.completed);
  const completed = tasks.filter(task => task.completed);

  // 折りたたみ状態を取得
  const isCompletedCollapsed = loadFromLocalStorage('completedGroupCollapsed', false);
  const completedToggleIcon = isCompletedCollapsed ? '▶' : '▼';
  const completedCollapsedClass = isCompletedCollapsed ? 'task-group-content--collapsed' : '';

  let html = '';

  // 未完了タスクグループ
  if (incomplete.length > 0) {
    const incompleteTasksHtml = incomplete.map(task => createTaskElementTemplate(task)).join('');
    html += `
      <div class="task-group">
        <div class="task-group-header" data-group-type="incomplete">
          <h3 class="task-group-title">未完了</h3>
          <span class="task-group-count">${incomplete.length}個</span>
        </div>
        <div class="task-group-content">
          ${incompleteTasksHtml}
        </div>
      </div>
    `;
  }

  // 完了済みタスクグループ
  if (completed.length > 0) {
    const completedTasksHtml = completed.map(task => createTaskElementTemplate(task)).join('');
    html += `
      <div class="task-group">
        <div class="task-group-header" data-group-type="completed">
          <button class="group-toggle" aria-label="グループを切り替え">${completedToggleIcon}</button>
          <h3 class="task-group-title">完了済み</h3>
          <span class="task-group-count">${completed.length}個</span>
        </div>
        <div class="task-group-content ${completedCollapsedClass}">
          ${completedTasksHtml}
        </div>
      </div>
    `;
  }

  return html;
}

/**
 * ゲージ要素の HTML テンプレート
 * @param {number} percentage - パーセンテージ（0～100）
 * @param {string} currentTime - 現在時刻（HH:MM形式）
 * @returns {string} HTML文字列
 */
function createGaugeTemplate(percentage, currentTime) {
  return `
    <div class="gauge-progress" style="width: ${percentage}%;"></div>
    <div class="gauge-info">
      <span class="gauge-time">${currentTime}</span>
      <span class="gauge-percentage">${percentage}%</span>
    </div>
  `;
}

// ===== DOM 生成関数 =====

/**
 * テンプレートを使ってタスク要素を生成
 * @param {Object} task - タスクオブジェクト
 * @returns {Element} 生成された DOM 要素
 */
function createTaskElement(task) {
  const template = createTaskElementTemplate(task);
  const container = document.createElement('div');
  container.innerHTML = template;
  return container.firstElementChild;
}

/**
 * テンプレートを使ってタスク一覧を生成
 * @param {Array} tasks - タスクの配列
 * @returns {Element} 生成された DOM 要素
 */
function createTaskListElement(tasks) {
  const template = createTaskListTemplate(tasks);
  const container = document.createElement('div');
  container.innerHTML = template;

  // 複数の要素が返される場合と1つの要素が返される場合の両方に対応
  if (container.children.length === 1) {
    return container.firstElementChild;
  } else {
    // DocumentFragment を返す
    const fragment = document.createDocumentFragment();
    while (container.firstElementChild) {
      fragment.appendChild(container.firstElementChild);
    }
    return fragment;
  }
}

/**
 * テンプレートを使ってグループ化されたタスク一覧を生成
 * @param {Array} tasks - タスクの配列
 * @returns {Element} 生成された DOM 要素
 */
function createGroupedTaskListElement(tasks) {
  const template = createGroupedTaskListTemplate(tasks);
  const container = document.createElement('div');
  container.innerHTML = template;

  // 複数の要素が返される場合と1つの要素が返される場合の両方に対応
  if (container.children.length === 1) {
    return container.firstElementChild;
  } else {
    // DocumentFragment を返す
    const fragment = document.createDocumentFragment();
    while (container.firstElementChild) {
      fragment.appendChild(container.firstElementChild);
    }
    return fragment;
  }
}

/**
 * テンプレートを使ってゲージ要素を生成
 * @param {number} percentage - パーセンテージ（0～100）
 * @param {string} currentTime - 現在時刻（HH:MM形式）
 * @returns {Element} 生成された DOM 要素
 */
function createGaugeElement(percentage, currentTime) {
  // パーセンテージを0～100の範囲に制限
  const clampedPercentage = Math.max(0, Math.min(100, percentage));

  const template = createGaugeTemplate(clampedPercentage, currentTime);
  const container = document.createElement('div');
  container.innerHTML = template;
  return container;
}

// ===== ヘルパー関数 =====

/**
 * HTML特殊文字をエスケープ（XSS対策）
 * @param {string} text - エスケープするテキスト
 * @returns {string} エスケープされたテキスト
 */
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, char => map[char]);
}
