/* タスク編集機能 - タスク情報の編集・更新 */

// ===== グローバル変数 =====

let currentEditingTaskId = null;

// ===== モーダル制御 =====

/**
 * 編集モーダルを開く
 * @param {string} taskId - 編集対象のタスク ID
 */
function openEditModal(taskId) {
  // タスク ID を保存
  currentEditingTaskId = taskId;

  // タスクデータを取得
  const tasks = loadFromLocalStorage(STORAGE_KEYS.TASKS, []);
  const task = tasks.find(t => t.id === taskId);

  if (!task) {
    console.warn(`タスク ID ${taskId} が見つかりません`);
    return;
  }

  // フォームに値を設定
  getElement('#editTaskName').value = task.text || '';
  getElement('#editTaskMemo').value = task.memo || '';
  getElement('#editTaskDuration').value = task.duration || '';
  getElement('#editTaskStartTime').value = task.startTime || '';
  getElement('#editTaskEndTime').value = task.endTime || '';
  getElement('#editTaskPriority').value = task.priority || '';
  getElement('#editTaskEmergency').checked = task.emergency || false;

  // サブタスクを表示
  displaySubtasks(task.subtasks || []);

  // モーダルを表示
  const editModal = getElement('#editModal');
  const modalOverlay = getElement('#modalOverlay');

  if (editModal && modalOverlay) {
    editModal.classList.add('modal--active');
    modalOverlay.classList.add('modal-overlay--active');
  }
}

/**
 * 編集モーダルを閉じる
 */
function closeEditModal() {
  currentEditingTaskId = null;

  const editModal = getElement('#editModal');
  const modalOverlay = getElement('#modalOverlay');

  if (editModal && modalOverlay) {
    editModal.classList.remove('modal--active');
    modalOverlay.classList.remove('modal-overlay--active');
  }

  // フォームをリセット
  const editForm = getElement('#editForm');
  if (editForm) {
    editForm.reset();
  }
}

// ===== タスク編集処理 =====

/**
 * 編集フォーム送信イベントを処理
 */
function handleEditFormSubmit(event) {
  event.preventDefault();

  if (!currentEditingTaskId) {
    console.warn('編集対象のタスク ID がありません');
    return;
  }

  // フォーム値を取得
  const taskName = getElement('#editTaskName').value.trim();
  const taskMemo = getElement('#editTaskMemo').value.trim();
  const taskDuration = getElement('#editTaskDuration').value;
  const taskStartTime = getElement('#editTaskStartTime').value;
  const taskEndTime = getElement('#editTaskEndTime').value;
  const taskPriority = getElement('#editTaskPriority').value;
  const taskEmergency = getElement('#editTaskEmergency').checked;

  // バリデーション
  if (!validateText(taskName, 1, 100)) {
    console.warn('タスク名が不正です');
    return;
  }

  // タスク一覧を取得
  let tasks = loadFromLocalStorage(STORAGE_KEYS.TASKS, []);

  // 対象タスクを検索
  const taskIndex = tasks.findIndex(t => t.id === currentEditingTaskId);

  if (taskIndex === -1) {
    console.warn('タスクが見つかりません');
    return;
  }

  // タスクを更新
  tasks[taskIndex].text = taskName;
  tasks[taskIndex].memo = taskMemo || null;
  tasks[taskIndex].duration = taskDuration ? parseInt(taskDuration, 10) : null;
  tasks[taskIndex].startTime = taskStartTime || null;
  tasks[taskIndex].endTime = taskEndTime || null;
  tasks[taskIndex].priority = taskPriority || null;
  tasks[taskIndex].emergency = taskEmergency;

  // サブタスクを保存
  const subtasks = getSubtasksFromUI();
  tasks[taskIndex].subtasks = subtasks;

  // ローカルストレージに保存
  saveToLocalStorage(STORAGE_KEYS.TASKS, tasks);

  // UI を更新
  displayTasks();
  updateTasksCount();

  // 分析情報を更新
  if (typeof updateAnalyticsOnTaskChange === 'function') {
    updateAnalyticsOnTaskChange();
  }

  // モーダルを閉じる
  closeEditModal();

  console.log(`タスク ${currentEditingTaskId} を更新しました`);
}

// ===== サブタスク機能 =====

/**
 * サブタスクを表示
 * @param {Array} subtasks - サブタスクの配列
 */
function displaySubtasks(subtasks) {
  const subtaskList = getElement('#subtaskList');

  if (!subtaskList) {
    return;
  }

  // リストをクリア
  subtaskList.innerHTML = '';

  // サブタスクを表示
  if (subtasks && subtasks.length > 0) {
    subtasks.forEach(subtask => {
      const subtaskItem = createSubtaskItem(subtask);
      subtaskList.appendChild(subtaskItem);
    });
  }

  // イベントリスナーを再度設定
  attachSubtaskEventListeners();
}

/**
 * サブタスク要素を作成
 * @param {Object} subtask - サブタスクオブジェクト
 * @returns {Element} 作成されたDOMエレメント
 */
function createSubtaskItem(subtask) {
  const div = document.createElement('div');
  div.className = 'subtask-item';
  div.dataset.subtaskId = subtask.id;

  const completedClass = subtask.completed ? 'subtask-item--completed' : '';

  div.innerHTML = `
    <label class="subtask-label">
      <input
        type="checkbox"
        class="subtask-checkbox"
        ${subtask.completed ? 'checked' : ''}
        aria-label="サブタスク完了状態"
      >
      <span class="subtask-text">${escapeHtml(subtask.text)}</span>
    </label>
    <button class="subtask-delete-btn" aria-label="サブタスク削除">削除</button>
  `;

  return div;
}

/**
 * UI からサブタスクを取得
 * @returns {Array} サブタスクの配列
 */
function getSubtasksFromUI() {
  const subtaskItems = getElements('.subtask-item');
  const subtasks = [];

  subtaskItems.forEach(item => {
    const checkbox = item.querySelector('.subtask-checkbox');
    const textSpan = item.querySelector('.subtask-text');
    const subtaskId = item.dataset.subtaskId;

    subtasks.push({
      id: subtaskId,
      text: textSpan.textContent,
      completed: checkbox.checked
    });
  });

  return subtasks;
}

/**
 * 新しいサブタスクを追加
 */
function handleAddSubtask() {
  const input = getElement('#subtaskInput');
  const text = input.value.trim();

  if (!validateText(text, 1, 100)) {
    console.warn('サブタスク入力値が不正です');
    return;
  }

  const subtaskId = generateUniqueId();
  const subtask = {
    id: subtaskId,
    text: text,
    completed: false
  };

  const subtaskList = getElement('#subtaskList');
  const subtaskItem = createSubtaskItem(subtask);
  subtaskList.appendChild(subtaskItem);

  // イベントリスナーを再度設定
  attachSubtaskEventListeners();

  // 入力欄をクリア
  input.value = '';
  input.focus();
}

/**
 * サブタスク削除ボタンのクリックを処理
 */
function handleDeleteSubtask(event) {
  const button = event.target;
  const subtaskItem = button.closest('.subtask-item');

  if (subtaskItem) {
    subtaskItem.remove();
  }
}

/**
 * サブタスクのイベントリスナーを設定
 */
function attachSubtaskEventListeners() {
  // サブタスク削除ボタン
  const deleteButtons = getElements('.subtask-delete-btn');
  attachEventListenerToAll(deleteButtons, 'click', handleDeleteSubtask);
}

// ===== イベントリスナー設定 =====

/**
 * 編集機能の初期化
 */
function initializeEdit() {
  // 編集フォーム送信イベント
  const editForm = getElement('#editForm');
  if (editForm) {
    attachEventListener(editForm, 'submit', handleEditFormSubmit);
  }

  // 閉じるボタン
  const modalClose = getElement('.modal-close');
  if (modalClose) {
    attachEventListener(modalClose, 'click', closeEditModal);
  }

  // キャンセルボタン
  const editModalCancel = getElement('#editModalCancel');
  if (editModalCancel) {
    attachEventListener(editModalCancel, 'click', closeEditModal);
  }

  // オーバーレイクリック時に閉じる
  const modalOverlay = getElement('#modalOverlay');
  if (modalOverlay) {
    attachEventListener(modalOverlay, 'click', closeEditModal);
  }

  // サブタスク追加ボタン
  const addSubtaskBtn = getElement('#addSubtaskBtn');
  if (addSubtaskBtn) {
    attachEventListener(addSubtaskBtn, 'click', handleAddSubtask);
  }

  // サブタスク入力欄でエンター押下時に追加
  const subtaskInput = getElement('#subtaskInput');
  if (subtaskInput) {
    attachEventListener(subtaskInput, 'keypress', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        handleAddSubtask();
      }
    });
  }

  console.log('タスク編集機能を初期化しました');
}

// ページ読み込み時に初期化
onDOMReady(initializeEdit);
