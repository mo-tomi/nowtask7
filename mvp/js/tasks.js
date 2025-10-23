/* タスク管理 - タスク追加、削除、完了機能 */

// ===== タスク追加機能 =====

/**
 * タスク追加フォームの送信イベントを処理
 */
function handleTaskFormSubmit(event) {
  event.preventDefault();

  // フォーム入力値を取得
  const taskInput = getElement('#taskInput');
  const taskText = taskInput.value.trim();

  // バリデーション
  if (!validateText(taskText, 1, 100)) {
    console.warn('タスク入力値が不正です');
    return;
  }

  // タスクオブジェクトを作成
  const task = {
    id: generateUniqueId(),
    text: taskText,
    completed: false,
    createdDate: getTodayDate(),
    createdTime: formatTime(new Date()),
    memo: null,
    duration: null,
    startTime: null,
    endTime: null,
    priority: null,
    emergency: false,
    subtasks: []
  };

  // 既存タスクを取得
  let tasks = loadFromLocalStorage(STORAGE_KEYS.TASKS, []);

  // 新しいタスクを追加
  tasks.push(task);

  // ローカルストレージに保存
  saveToLocalStorage(STORAGE_KEYS.TASKS, tasks);

  // フォーム入力欄をクリア
  taskInput.value = '';
  taskInput.focus();

  // UI を更新
  displayTasks();
  updateTasksCount();

  // 分析情報を更新
  if (typeof updateAnalyticsOnTaskChange === 'function') {
    updateAnalyticsOnTaskChange();
  }

  // ランキング情報を更新
  if (typeof updateRankingOnTaskChange === 'function') {
    updateRankingOnTaskChange();
  }

  // 空き時間情報を更新
  if (typeof updateFreeTimeOnTaskChange === 'function') {
    updateFreeTimeOnTaskChange();
  }
}

// ===== タスク表示機能 =====

/**
 * すべてのタスクを画面に表示
 */
function displayTasks() {
  // 保存されているタスクを取得
  const tasks = loadFromLocalStorage(STORAGE_KEYS.TASKS, []);

  // タスクコンテナを取得
  const tasksContainer = getElement('#tasksContainer');

  // 既存の内容をクリア
  tasksContainer.innerHTML = '';

  // タスクをグループ化して表示
  const groupedTasksElement = createGroupedTaskListElement(tasks);
  tasksContainer.appendChild(groupedTasksElement);

  // 各タスク要素にイベントリスナーを追加
  attachTaskEventListeners();
  attachGroupToggleListeners();
}

/**
 * タスクを完了状態でグループ化
 * @param {Array} tasks - タスクの配列
 * @returns {Object} グループ化されたタスク
 */
function groupTasksByCompletion(tasks) {
  const incomplete = tasks.filter(task => !task.completed);
  const completed = tasks.filter(task => task.completed);

  return {
    incomplete,
    completed
  };
}

/**
 * グループ切り替えボタンにイベントリスナーを追加
 */
function attachGroupToggleListeners() {
  const toggleButtons = getElements('.group-toggle');
  attachEventListenerToAll(toggleButtons, 'click', handleGroupToggleClick);
}

/**
 * グループ切り替えボタンクリック時の処理
 */
function handleGroupToggleClick(event) {
  const toggleButton = event.target.closest('.group-toggle');
  const groupHeader = toggleButton.closest('.task-group-header');
  const groupContent = groupHeader.nextElementSibling;

  // 折りたたみ状態を切り替え
  const isCollapsed = groupContent.classList.toggle('task-group-content--collapsed');

  // ボタンのテキストを変更
  toggleButton.textContent = isCollapsed ? '▶' : '▼';

  // 状態をローカルストレージに保存
  const groupType = groupHeader.dataset.groupType;
  if (groupType === 'completed') {
    saveToLocalStorage('completedGroupCollapsed', isCollapsed);
  }
}

/**
 * タスク要素にイベントリスナーを追加
 */
function attachTaskEventListeners() {
  // チェックボックスのイベントリスナー（新デザイン）
  const checkboxesRight = getElements('.task-checkbox-right');
  attachEventListenerToAll(checkboxesRight, 'click', handleTaskCheckboxChange);

  // チェックボックスのイベントリスナー（旧デザイン）
  const checkboxes = getElements('.task-checkbox');
  attachEventListenerToAll(checkboxes, 'change', handleTaskCheckboxChange);

  // サブタスクチェックボックスのイベントリスナー（新デザイン）
  const subtaskCheckboxesNew = getElements('.subtask-checkbox');
  attachEventListenerToAll(subtaskCheckboxesNew, 'click', handleSubtaskCheckboxChange);

  // サブタスクチェックボックスのイベントリスナー（旧デザイン）
  const subtaskCheckboxes = getElements('.task-subtask-checkbox');
  attachEventListenerToAll(subtaskCheckboxes, 'change', handleSubtaskCheckboxChange);

  // メニューボタンのイベントリスナー
  const menuButtons = getElements('.task-menu-btn');
  attachEventListenerToAll(menuButtons, 'click', handleMenuButtonClick);

  // 編集ボタンのイベントリスナー
  const editButtons = getElements('.task-edit-btn');
  attachEventListenerToAll(editButtons, 'click', handleTaskEditClick);

  // 複製ボタンのイベントリスナー
  const duplicateButtons = getElements('.task-duplicate-btn');
  attachEventListenerToAll(duplicateButtons, 'click', handleTaskDuplicateClick);

  // 削除ボタンのイベントリスナー
  const deleteButtons = getElements('.task-delete-btn');
  attachEventListenerToAll(deleteButtons, 'click', handleTaskDeleteClick);
}

// ===== コンテキストメニュー機能 =====

/**
 * メニューボタンクリックイベントを処理
 */
function handleMenuButtonClick(event) {
  event.stopPropagation();

  const menuButton = event.target.closest('.task-menu-btn');
  const taskItem = menuButton.closest('.task-item');
  const contextMenu = taskItem.querySelector('.task-context-menu');

  // 他のすべてのメニューを閉じる
  const allMenus = getElements('.task-context-menu');
  allMenus.forEach(menu => {
    if (menu !== contextMenu) {
      menu.style.display = 'none';
    }
  });

  // 現在のメニューを切り替え
  if (contextMenu.style.display === 'none' || contextMenu.style.display === '') {
    contextMenu.style.display = 'block';
  } else {
    contextMenu.style.display = 'none';
  }
}

/**
 * メニュー外をクリックした時にメニューを閉じる
 */
function closeAllContextMenus() {
  const allMenus = getElements('.task-context-menu');
  allMenus.forEach(menu => {
    menu.style.display = 'none';
  });
}

// ===== タスク完了機能 =====

/**
 * チェックボックス変更イベントを処理
 */
function handleTaskCheckboxChange(event) {
  // 対象のタスク要素を取得（新旧デザイン両対応）
  const taskElement = event.target.closest('.task-item') || event.target.closest('.task-card-right');
  const taskId = taskElement.dataset.taskId;

  // チェックボックスの状態を判定（新旧デザイン両対応）
  let isChecked;
  if (event.target.classList.contains('task-checkbox-right')) {
    // 新デザイン: クラスの有無で判定
    isChecked = !event.target.classList.contains('checked');
    if (isChecked) {
      event.target.classList.add('checked');
    } else {
      event.target.classList.remove('checked');
    }
  } else {
    // 旧デザイン: checked プロパティで判定
    isChecked = event.target.checked;
  }

  // ローカルストレージからタスク一覧を取得
  let tasks = loadFromLocalStorage(STORAGE_KEYS.TASKS, []);

  // 対象タスクを找す
  const taskIndex = tasks.findIndex(task => task.id === taskId);

  if (taskIndex !== -1) {
    // タスクの完了状態を切り替える
    tasks[taskIndex].completed = isChecked;

    // ローカルストレージに保存
    saveToLocalStorage(STORAGE_KEYS.TASKS, tasks);

    // UI を更新
    if (isChecked) {
      taskElement.classList.add('task-item--completed');
      taskElement.classList.add('completed');

      // X 共有ボタンを表示
      if (typeof showXShareButton === 'function') {
        showXShareButton(taskId, tasks[taskIndex].text);
      }
    } else {
      taskElement.classList.remove('task-item--completed');
      taskElement.classList.remove('completed');

      // X 共有ボタンを削除
      const shareBtn = taskElement.querySelector('.task-share-btn');
      if (shareBtn) {
        shareBtn.remove();
      }
    }

    updateTasksCount();

    // 分析情報を更新
    if (typeof updateAnalyticsOnTaskChange === 'function') {
      updateAnalyticsOnTaskChange();
    }
  }
}

/**
 * サブタスクチェックボックス変更イベントを処理
 */
function handleSubtaskCheckboxChange(event) {
  const checkbox = event.target;
  const taskId = checkbox.dataset.taskId;
  const subtaskId = checkbox.dataset.subtaskId;

  // チェックボックスの状態を判定（新旧デザイン両対応）
  let isChecked;
  if (checkbox.classList.contains('subtask-checkbox')) {
    // 新デザイン: クラスの有無で判定
    isChecked = !checkbox.classList.contains('checked');
    if (isChecked) {
      checkbox.classList.add('checked');
      // サブタスクテキストにも completed クラスを追加
      const subtaskText = checkbox.nextElementSibling;
      if (subtaskText) {
        subtaskText.classList.add('completed');
      }
    } else {
      checkbox.classList.remove('checked');
      // サブタスクテキストから completed クラスを削除
      const subtaskText = checkbox.nextElementSibling;
      if (subtaskText) {
        subtaskText.classList.remove('completed');
      }
    }
  } else {
    // 旧デザイン: checked プロパティで判定
    isChecked = checkbox.checked;
  }

  // ローカルストレージからタスク一覧を取得
  let tasks = loadFromLocalStorage(STORAGE_KEYS.TASKS, []);

  // 対象タスクを検索
  const taskIndex = tasks.findIndex(task => task.id === taskId);

  if (taskIndex !== -1 && tasks[taskIndex].subtasks) {
    // サブタスクを検索
    const subtaskIndex = tasks[taskIndex].subtasks.findIndex(st => st.id === subtaskId);

    if (subtaskIndex !== -1) {
      // サブタスクの完了状態を更新
      tasks[taskIndex].subtasks[subtaskIndex].completed = isChecked;

      // ローカルストレージに保存
      saveToLocalStorage(STORAGE_KEYS.TASKS, tasks);

      // UIを更新（タスクリストを再描画）
      displayTasks();
      updateTasksCount();

      // 分析情報を更新
      if (typeof updateAnalyticsOnTaskChange === 'function') {
        updateAnalyticsOnTaskChange();
      }
    }
  }
}

// ===== タスク編集機能 =====

/**
 * 編集ボタンクリックイベントを処理
 */
function handleTaskEditClick(event) {
  event.stopPropagation();

  // コンテキストメニューを閉じる
  closeAllContextMenus();

  // 対象のタスク要素を取得
  const taskElement = event.target.closest('.task-item');
  const taskId = taskElement.dataset.taskId;

  // 編集モーダルを開く
  if (typeof openEditModal === 'function') {
    openEditModal(taskId);
  }
}

// ===== タスク複製機能 =====

/**
 * 複製ボタンクリックイベントを処理
 */
function handleTaskDuplicateClick(event) {
  event.stopPropagation();

  // コンテキストメニューを閉じる
  closeAllContextMenus();

  // 対象のタスク要素を取得
  const taskElement = event.target.closest('.task-item');
  const taskId = taskElement.dataset.taskId;

  // ローカルストレージからタスク一覧を取得
  let tasks = loadFromLocalStorage(STORAGE_KEYS.TASKS, []);

  // 対象タスクを検索
  const taskIndex = tasks.findIndex(task => task.id === taskId);

  if (taskIndex === -1) {
    console.warn('タスクが見つかりません');
    return;
  }

  // 元のタスクをコピー
  const originalTask = tasks[taskIndex];
  const duplicatedTask = {
    ...originalTask,
    id: generateUniqueId(),
    createdDate: getTodayDate(),
    createdTime: formatTime(new Date())
  };

  // 複製したタスクを追加
  tasks.push(duplicatedTask);

  // ローカルストレージに保存
  saveToLocalStorage(STORAGE_KEYS.TASKS, tasks);

  // UI を更新
  displayTasks();
  updateTasksCount();

  // 分析情報を更新
  if (typeof updateAnalyticsOnTaskChange === 'function') {
    updateAnalyticsOnTaskChange();
  }

  console.log(`タスク ${taskId} を複製しました`);
}

// ===== タスク削除機能 =====

/**
 * 削除ボタンクリックイベントを処理
 */
function handleTaskDeleteClick(event) {
  event.stopPropagation();

  // コンテキストメニューを閉じる
  closeAllContextMenus();

  // 対象のタスク要素を取得
  const taskElement = event.target.closest('.task-item');
  const taskId = taskElement.dataset.taskId;

  // 削除確認ダイアログを表示
  const taskText = taskElement.querySelector('.task-text').textContent;
  if (!confirm(`「${taskText}」を削除しますか？`)) {
    return;
  }

  // ローカルストレージからタスク一覧を取得
  let tasks = loadFromLocalStorage(STORAGE_KEYS.TASKS, []);

  // 対象タスクを削除
  tasks = tasks.filter(task => task.id !== taskId);

  // ローカルストレージに保存
  saveToLocalStorage(STORAGE_KEYS.TASKS, tasks);

  // UI からタスク要素を削除
  taskElement.remove();

  updateTasksCount();

  // 分析情報を更新
  if (typeof updateAnalyticsOnTaskChange === 'function') {
    updateAnalyticsOnTaskChange();
  }

  // ランキング情報を更新
  if (typeof updateRankingOnTaskChange === 'function') {
    updateRankingOnTaskChange();
  }

  // 空き時間情報を更新
  if (typeof updateFreeTimeOnTaskChange === 'function') {
    updateFreeTimeOnTaskChange();
  }
}

// ===== ユーティリティ機能 =====

/**
 * タスク件数を表示
 */
function updateTasksCount() {
  const tasks = loadFromLocalStorage(STORAGE_KEYS.TASKS, []);
  const tasksCount = getElement('#tasksCount');

  if (tasksCount) {
    tasksCount.textContent = `${tasks.length}個`;
  }
}

// ===== チュートリアル用サンプルタスク =====

/**
 * チュートリアル用のサンプルタスクを作成
 */
function createTutorialTasks() {
  // 既にタスクがある場合は作成しない
  const existingTasks = loadFromLocalStorage(STORAGE_KEYS.TASKS, []);
  if (existingTasks.length > 0) {
    return;
  }

  // チュートリアルフラグをチェック
  const tutorialCompleted = loadFromLocalStorage('nowTask_tutorialCompleted', false);
  if (tutorialCompleted) {
    return;
  }

  // サンプルタスクを作成
  const sampleTasks = [
    {
      id: generateUniqueId(),
      text: '朝のルーティン（歯磨き、朝食など）',
      completed: false,
      createdDate: getTodayDate(),
      createdTime: '07:00',
      memo: 'チュートリアルタスクです。完了したらチェックしてください。',
      duration: 30,
      startTime: '07:00',
      endTime: '07:30',
      priority: 'high',
      emergency: false,
      subtasks: []
    },
    {
      id: generateUniqueId(),
      text: 'メールチェックと返信',
      completed: false,
      createdDate: getTodayDate(),
      createdTime: '09:00',
      memo: 'チュートリアルタスクです。メモ機能を使ってみましょう。',
      duration: 15,
      startTime: '09:00',
      endTime: '09:15',
      priority: 'medium',
      emergency: false,
      subtasks: []
    },
    {
      id: generateUniqueId(),
      text: 'プロジェクトの作業',
      completed: false,
      createdDate: getTodayDate(),
      createdTime: '10:00',
      memo: 'チュートリアルタスクです。所要時間を設定できます。',
      duration: 120,
      startTime: '10:00',
      endTime: '12:00',
      priority: 'high',
      emergency: true,
      subtasks: [
        { id: generateUniqueId(), text: '要件定義書を確認', completed: false },
        { id: generateUniqueId(), text: '設計書を作成', completed: false },
        { id: generateUniqueId(), text: 'レビュー依頼', completed: false }
      ]
    },
    {
      id: generateUniqueId(),
      text: '昼休憩',
      completed: false,
      createdDate: getTodayDate(),
      createdTime: '12:00',
      memo: 'チュートリアルタスクです。休憩時間も管理できます。',
      duration: 60,
      startTime: '12:00',
      endTime: '13:00',
      priority: 'low',
      emergency: false,
      subtasks: []
    },
    {
      id: generateUniqueId(),
      text: 'チームミーティング',
      completed: false,
      createdDate: getTodayDate(),
      createdTime: '14:00',
      memo: 'チュートリアルタスクです。緊急フラグを設定できます。',
      duration: 60,
      startTime: '14:00',
      endTime: '15:00',
      priority: 'high',
      emergency: false,
      subtasks: []
    }
  ];

  // サンプルタスクを保存
  saveToLocalStorage(STORAGE_KEYS.TASKS, sampleTasks);

  console.log('チュートリアル用のサンプルタスクを作成しました');
}

// ===== 初期化処理 =====

/**
 * タスク管理機能の初期化
 */
function initializeTasks() {
  // チュートリアル用サンプルタスクを作成
  createTutorialTasks();
  // タスクフォームのイベントリスナーを設定
  const taskForm = getElement('#taskForm');
  if (taskForm) {
    attachEventListener(taskForm, 'submit', handleTaskFormSubmit);
  }

  // ドキュメント全体のクリックでメニューを閉じる
  attachEventListener(document, 'click', closeAllContextMenus);

  // ページ読み込み時にタスク一覧を表示
  displayTasks();
  updateTasksCount();

  console.log('タスク管理機能を初期化しました');
}

// ページ読み込み時にタスク管理機能を初期化
onDOMReady(initializeTasks);
