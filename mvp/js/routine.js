/* ルーティン機能 - 定期的なタスクを登録・管理 */

// ===== ローカルストレージキーの定義 =====

const ROUTINE_STORAGE_KEY = 'nowTask_routines';

// ===== ルーティンデータ管理 =====

/**
 * すべてのルーティンを取得
 * @returns {Array} ルーティンの配列
 */
function getAllRoutines() {
  return loadFromLocalStorage(ROUTINE_STORAGE_KEY, []);
}

/**
 * ルーティンを保存
 * @param {Array} routines - ルーティンの配列
 */
function saveRoutines(routines) {
  saveToLocalStorage(ROUTINE_STORAGE_KEY, routines);
}

/**
 * 新しいルーティンを追加
 * @param {Object} routine - ルーティンオブジェクト
 */
function addRoutine(routine) {
  const routines = getAllRoutines();
  routines.push(routine);
  saveRoutines(routines);
}

/**
 * ルーティンを更新
 * @param {string} routineId - ルーティンID
 * @param {Object} updatedRoutine - 更新するルーティンオブジェクト
 */
function updateRoutine(routineId, updatedRoutine) {
  let routines = getAllRoutines();
  const index = routines.findIndex(r => r.id === routineId);

  if (index !== -1) {
    routines[index] = { ...routines[index], ...updatedRoutine };
    saveRoutines(routines);
  }
}

/**
 * ルーティンを削除
 * @param {string} routineId - ルーティンID
 */
function deleteRoutine(routineId) {
  let routines = getAllRoutines();
  routines = routines.filter(r => r.id !== routineId);
  saveRoutines(routines);
}

// ===== ルーティン表示機能 =====

/**
 * ルーティン一覧を表示
 */
function displayRoutines() {
  const routines = getAllRoutines();
  const routineList = getElement('#routineList');

  if (!routineList) {
    return;
  }

  // 既存の内容をクリア
  routineList.innerHTML = '';

  // ルーティンがない場合
  if (routines.length === 0) {
    routineList.innerHTML = '<p class="routine-empty">まだルーティンがありません</p>';
    return;
  }

  // ルーティン項目を生成
  routines.forEach(routine => {
    const routineItem = createRoutineElement(routine);
    routineList.appendChild(routineItem);
  });

  // イベントリスナーを再設定
  attachRoutineEventListeners();
}

/**
 * ルーティン要素を生成
 * @param {Object} routine - ルーティンオブジェクト
 * @returns {HTMLElement} ルーティン要素
 */
function createRoutineElement(routine) {
  const routineItem = document.createElement('div');
  routineItem.className = 'routine-item';
  routineItem.dataset.routineId = routine.id;

  const durationText = formatRoutineDuration(routine.duration);

  routineItem.innerHTML = `
    <div class="routine-info">
      <div class="routine-name">${escapeHtml(routine.name)}</div>
      <div class="routine-duration">${durationText}</div>
    </div>
    <div class="routine-actions">
      <button class="routine-use-btn" data-routine-id="${routine.id}" title="タスクとして追加">
        使用
      </button>
      <button class="routine-edit-btn" data-routine-id="${routine.id}" title="編集">
        編集
      </button>
      <button class="routine-delete-btn" data-routine-id="${routine.id}" title="削除">
        削除
      </button>
    </div>
  `;

  return routineItem;
}

/**
 * 所要時間を表示用にフォーマット
 * @param {number} minutes - 分単位の時間
 * @returns {string} フォーマット済みの文字列
 */
function formatRoutineDuration(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours > 0 && mins > 0) {
    return `${hours}時間${mins}分`;
  } else if (hours > 0) {
    return `${hours}時間`;
  } else {
    return `${mins}分`;
  }
}

/**
 * HTMLエスケープ処理
 * @param {string} text - エスケープするテキスト
 * @returns {string} エスケープ済みテキスト
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ===== ルーティン追加・編集モーダル =====

/**
 * ルーティン追加モーダルを開く
 */
function openRoutineAddModal() {
  const modal = getElement('#routineModal');
  const overlay = getElement('#modalOverlay');
  const form = getElement('#routineForm');

  if (!modal || !overlay || !form) {
    return;
  }

  // フォームをリセット
  form.reset();
  form.dataset.routineId = '';

  // モーダルタイトルを変更
  const modalTitle = getElement('#routineModalTitle');
  if (modalTitle) {
    modalTitle.textContent = 'ルーティンを追加';
  }

  // モーダルを表示
  modal.classList.add('modal--active');
  overlay.classList.add('modal-overlay--active');
}

/**
 * ルーティン編集モーダルを開く
 * @param {string} routineId - ルーティンID
 */
function openRoutineEditModal(routineId) {
  const routines = getAllRoutines();
  const routine = routines.find(r => r.id === routineId);

  if (!routine) {
    console.warn('ルーティンが見つかりません');
    return;
  }

  const modal = getElement('#routineModal');
  const overlay = getElement('#modalOverlay');
  const form = getElement('#routineForm');

  if (!modal || !overlay || !form) {
    return;
  }

  // フォームに既存の値をセット
  form.dataset.routineId = routineId;
  getElement('#routineName').value = routine.name;
  getElement('#routineDuration').value = routine.duration;

  // モーダルタイトルを変更
  const modalTitle = getElement('#routineModalTitle');
  if (modalTitle) {
    modalTitle.textContent = 'ルーティンを編集';
  }

  // モーダルを表示
  modal.classList.add('modal--active');
  overlay.classList.add('modal-overlay--active');
}

/**
 * ルーティンモーダルを閉じる
 */
function closeRoutineModal() {
  const modal = getElement('#routineModal');
  const overlay = getElement('#modalOverlay');

  if (modal) {
    modal.classList.remove('modal--active');
  }

  if (overlay) {
    overlay.classList.remove('modal-overlay--active');
  }
}

// ===== イベントハンドラ =====

/**
 * ルーティンフォーム送信処理
 */
function handleRoutineFormSubmit(event) {
  event.preventDefault();

  const form = getElement('#routineForm');
  const routineId = form.dataset.routineId;
  const name = getElement('#routineName').value.trim();
  const duration = parseInt(getElement('#routineDuration').value, 10);

  // バリデーション
  if (!validateText(name, 1, 100)) {
    alert('ルーティン名を入力してください');
    return;
  }

  if (!duration || duration < 1 || duration > 1440) {
    alert('所要時間を正しく入力してください（1〜1440分）');
    return;
  }

  if (routineId) {
    // 編集
    updateRoutine(routineId, { name, duration });
  } else {
    // 新規追加
    const newRoutine = {
      id: generateUniqueId(),
      name: name,
      duration: duration,
      createdDate: getTodayDate()
    };
    addRoutine(newRoutine);
  }

  // モーダルを閉じる
  closeRoutineModal();

  // ルーティン一覧を再表示
  displayRoutines();
}

/**
 * ルーティン使用ボタンクリック処理
 */
function handleRoutineUseClick(event) {
  const routineId = event.target.dataset.routineId;
  const routines = getAllRoutines();
  const routine = routines.find(r => r.id === routineId);

  if (!routine) {
    console.warn('ルーティンが見つかりません');
    return;
  }

  // ルーティンからタスクを生成
  const newTask = {
    id: generateUniqueId(),
    text: routine.name,
    completed: false,
    createdDate: getTodayDate(),
    createdTime: formatTime(new Date()),
    memo: null,
    duration: routine.duration,
    startTime: null,
    endTime: null,
    priority: null,
    emergency: false,
    subtasks: []
  };

  // タスクを追加
  let tasks = loadFromLocalStorage(STORAGE_KEYS.TASKS, []);
  tasks.push(newTask);
  saveToLocalStorage(STORAGE_KEYS.TASKS, tasks);

  // タスク一覧を更新
  if (typeof displayTasks === 'function') {
    displayTasks();
  }

  if (typeof updateTasksCount === 'function') {
    updateTasksCount();
  }

  console.log(`ルーティン「${routine.name}」からタスクを作成しました`);
}

/**
 * ルーティン編集ボタンクリック処理
 */
function handleRoutineEditClick(event) {
  const routineId = event.target.dataset.routineId;
  openRoutineEditModal(routineId);
}

/**
 * ルーティン削除ボタンクリック処理
 */
function handleRoutineDeleteClick(event) {
  const routineId = event.target.dataset.routineId;
  const routines = getAllRoutines();
  const routine = routines.find(r => r.id === routineId);

  if (!routine) {
    console.warn('ルーティンが見つかりません');
    return;
  }

  if (!confirm(`「${routine.name}」を削除しますか？`)) {
    return;
  }

  deleteRoutine(routineId);
  displayRoutines();
}

/**
 * ルーティンイベントリスナーを追加
 */
function attachRoutineEventListeners() {
  // 使用ボタン
  const useButtons = getElements('.routine-use-btn');
  attachEventListenerToAll(useButtons, 'click', handleRoutineUseClick);

  // 編集ボタン
  const editButtons = getElements('.routine-edit-btn');
  attachEventListenerToAll(editButtons, 'click', handleRoutineEditClick);

  // 削除ボタン
  const deleteButtons = getElements('.routine-delete-btn');
  attachEventListenerToAll(deleteButtons, 'click', handleRoutineDeleteClick);
}

// ===== 初期化処理 =====

/**
 * ルーティン機能の初期化
 */
function initializeRoutine() {
  // ルーティン一覧を表示
  displayRoutines();

  // ルーティン追加ボタンのイベントリスナー
  const addRoutineBtn = getElement('#addRoutineBtn');
  if (addRoutineBtn) {
    attachEventListener(addRoutineBtn, 'click', openRoutineAddModal);
  }

  // ルーティンフォームのイベントリスナー
  const routineForm = getElement('#routineForm');
  if (routineForm) {
    attachEventListener(routineForm, 'submit', handleRoutineFormSubmit);
  }

  // モーダル閉じるボタン
  const routineModalClose = getElement('#routineModalClose');
  if (routineModalClose) {
    attachEventListener(routineModalClose, 'click', closeRoutineModal);
  }

  const routineModalCancel = getElement('#routineModalCancel');
  if (routineModalCancel) {
    attachEventListener(routineModalCancel, 'click', closeRoutineModal);
  }

  // ルーティンアイテムのイベントリスナーを追加
  attachRoutineEventListeners();

  console.log('ルーティン機能を初期化しました');
}

// ページ読み込み時にルーティン機能を初期化
onDOMReady(initializeRoutine);
