/* テンプレート機能 - よく使うタスクをテンプレート化 */

// ===== ローカルストレージキーの定義 =====

const TEMPLATE_STORAGE_KEY = 'nowTask_templates';

// ===== テンプレートデータ管理 =====

/**
 * すべてのテンプレートを取得
 * @returns {Array} テンプレートの配列
 */
function getAllTemplates() {
  return loadFromLocalStorage(TEMPLATE_STORAGE_KEY, []);
}

/**
 * テンプレートを保存
 * @param {Array} templates - テンプレートの配列
 */
function saveTemplates(templates) {
  saveToLocalStorage(TEMPLATE_STORAGE_KEY, templates);
}

/**
 * 新しいテンプレートを追加
 * @param {Object} template - テンプレートオブジェクト
 */
function addTemplate(template) {
  const templates = getAllTemplates();
  templates.push(template);
  saveTemplates(templates);
}

/**
 * テンプレートを更新
 * @param {string} templateId - テンプレートID
 * @param {Object} updatedTemplate - 更新するテンプレートオブジェクト
 */
function updateTemplate(templateId, updatedTemplate) {
  let templates = getAllTemplates();
  const index = templates.findIndex(t => t.id === templateId);

  if (index !== -1) {
    templates[index] = { ...templates[index], ...updatedTemplate };
    saveTemplates(templates);
  }
}

/**
 * テンプレートを削除
 * @param {string} templateId - テンプレートID
 */
function deleteTemplate(templateId) {
  let templates = getAllTemplates();
  templates = templates.filter(t => t.id !== templateId);
  saveTemplates(templates);
}

// ===== テンプレート表示機能 =====

/**
 * テンプレート一覧を表示
 */
function displayTemplates() {
  const templates = getAllTemplates();
  const templateList = getElement('#templateList');

  if (!templateList) {
    return;
  }

  // 既存の内容をクリア
  templateList.innerHTML = '';

  // テンプレートがない場合
  if (templates.length === 0) {
    templateList.innerHTML = '<p class="template-empty">まだテンプレートがありません</p>';
    return;
  }

  // テンプレート項目を生成
  templates.forEach(template => {
    const templateItem = createTemplateElement(template);
    templateList.appendChild(templateItem);
  });

  // イベントリスナーを再設定
  attachTemplateEventListeners();
}

/**
 * テンプレート要素を生成
 * @param {Object} template - テンプレートオブジェクト
 * @returns {HTMLElement} テンプレート要素
 */
function createTemplateElement(template) {
  const templateItem = document.createElement('div');
  templateItem.className = 'template-item';
  templateItem.dataset.templateId = template.id;

  const durationText = template.duration ? formatTemplateDuration(template.duration) : '未設定';
  const priorityText = template.priority ? getPriorityText(template.priority) : '';
  const emergencyBadge = template.emergency ? '<span class="template-emergency-badge">緊急</span>' : '';

  templateItem.innerHTML = `
    <div class="template-info">
      <div class="template-name">${escapeHtml(template.name)}</div>
      <div class="template-details">
        <span class="template-duration">${durationText}</span>
        ${priorityText ? `<span class="template-priority">${priorityText}</span>` : ''}
        ${emergencyBadge}
      </div>
    </div>
    <div class="template-actions">
      <button class="template-use-btn" data-template-id="${template.id}" title="タスクとして追加">
        使用
      </button>
      <button class="template-edit-btn" data-template-id="${template.id}" title="編集">
        編集
      </button>
      <button class="template-delete-btn" data-template-id="${template.id}" title="削除">
        削除
      </button>
    </div>
  `;

  return templateItem;
}

/**
 * 所要時間を表示用にフォーマット
 * @param {number} minutes - 分単位の時間
 * @returns {string} フォーマット済みの文字列
 */
function formatTemplateDuration(minutes) {
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
 * 優先度のテキストを取得
 * @param {string} priority - 優先度
 * @returns {string} 優先度のテキスト
 */
function getPriorityText(priority) {
  const priorityMap = {
    'high': '優先度：高',
    'medium': '優先度：中',
    'low': '優先度：低'
  };
  return priorityMap[priority] || '';
}

// ===== テンプレート追加・編集モーダル =====

/**
 * テンプレート追加モーダルを開く
 */
function openTemplateAddModal() {
  const modal = getElement('#templateModal');
  const overlay = getElement('#modalOverlay');
  const form = getElement('#templateForm');

  if (!modal || !overlay || !form) {
    return;
  }

  // フォームをリセット
  form.reset();
  form.dataset.templateId = '';

  // モーダルタイトルを変更
  const modalTitle = getElement('#templateModalTitle');
  if (modalTitle) {
    modalTitle.textContent = 'テンプレートを追加';
  }

  // モーダルを表示
  modal.classList.add('modal--active');
  overlay.classList.add('modal-overlay--active');
}

/**
 * テンプレート編集モーダルを開く
 * @param {string} templateId - テンプレートID
 */
function openTemplateEditModal(templateId) {
  const templates = getAllTemplates();
  const template = templates.find(t => t.id === templateId);

  if (!template) {
    console.warn('テンプレートが見つかりません');
    return;
  }

  const modal = getElement('#templateModal');
  const overlay = getElement('#modalOverlay');
  const form = getElement('#templateForm');

  if (!modal || !overlay || !form) {
    return;
  }

  // フォームに既存の値をセット
  form.dataset.templateId = templateId;
  getElement('#templateName').value = template.name || '';
  getElement('#templateMemo').value = template.memo || '';
  getElement('#templateDuration').value = template.duration || '';
  getElement('#templateStartTime').value = template.startTime || '';
  getElement('#templateEndTime').value = template.endTime || '';
  getElement('#templatePriority').value = template.priority || '';
  getElement('#templateEmergency').checked = template.emergency || false;

  // モーダルタイトルを変更
  const modalTitle = getElement('#templateModalTitle');
  if (modalTitle) {
    modalTitle.textContent = 'テンプレートを編集';
  }

  // モーダルを表示
  modal.classList.add('modal--active');
  overlay.classList.add('modal-overlay--active');
}

/**
 * テンプレートモーダルを閉じる
 */
function closeTemplateModal() {
  const modal = getElement('#templateModal');
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
 * テンプレートフォーム送信処理
 */
function handleTemplateFormSubmit(event) {
  event.preventDefault();

  const form = getElement('#templateForm');
  const templateId = form.dataset.templateId;
  const name = getElement('#templateName').value.trim();
  const memo = getElement('#templateMemo').value.trim();
  const duration = getElement('#templateDuration').value ? parseInt(getElement('#templateDuration').value, 10) : null;
  const startTime = getElement('#templateStartTime').value || null;
  const endTime = getElement('#templateEndTime').value || null;
  const priority = getElement('#templatePriority').value || null;
  const emergency = getElement('#templateEmergency').checked;

  // バリデーション
  if (!validateText(name, 1, 100)) {
    alert('テンプレート名を入力してください');
    return;
  }

  const templateData = {
    name: name,
    memo: memo || null,
    duration: duration,
    startTime: startTime,
    endTime: endTime,
    priority: priority,
    emergency: emergency
  };

  if (templateId) {
    // 編集
    updateTemplate(templateId, templateData);
  } else {
    // 新規追加
    const newTemplate = {
      id: generateUniqueId(),
      ...templateData,
      createdDate: getTodayDate()
    };
    addTemplate(newTemplate);
  }

  // モーダルを閉じる
  closeTemplateModal();

  // テンプレート一覧を再表示
  displayTemplates();
}

/**
 * テンプレート使用ボタンクリック処理
 */
function handleTemplateUseClick(event) {
  const templateId = event.target.dataset.templateId;
  const templates = getAllTemplates();
  const template = templates.find(t => t.id === templateId);

  if (!template) {
    console.warn('テンプレートが見つかりません');
    return;
  }

  // テンプレートからタスクを生成
  const newTask = {
    id: generateUniqueId(),
    text: template.name,
    completed: false,
    createdDate: getTodayDate(),
    createdTime: formatTime(new Date()),
    memo: template.memo,
    duration: template.duration,
    startTime: template.startTime,
    endTime: template.endTime,
    priority: template.priority,
    emergency: template.emergency,
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

  console.log(`テンプレート「${template.name}」からタスクを作成しました`);
}

/**
 * テンプレート編集ボタンクリック処理
 */
function handleTemplateEditClick(event) {
  const templateId = event.target.dataset.templateId;
  openTemplateEditModal(templateId);
}

/**
 * テンプレート削除ボタンクリック処理
 */
function handleTemplateDeleteClick(event) {
  const templateId = event.target.dataset.templateId;
  const templates = getAllTemplates();
  const template = templates.find(t => t.id === templateId);

  if (!template) {
    console.warn('テンプレートが見つかりません');
    return;
  }

  if (!confirm(`「${template.name}」を削除しますか？`)) {
    return;
  }

  deleteTemplate(templateId);
  displayTemplates();
}

/**
 * テンプレートイベントリスナーを追加
 */
function attachTemplateEventListeners() {
  // 使用ボタン
  const useButtons = getElements('.template-use-btn');
  attachEventListenerToAll(useButtons, 'click', handleTemplateUseClick);

  // 編集ボタン
  const editButtons = getElements('.template-edit-btn');
  attachEventListenerToAll(editButtons, 'click', handleTemplateEditClick);

  // 削除ボタン
  const deleteButtons = getElements('.template-delete-btn');
  attachEventListenerToAll(deleteButtons, 'click', handleTemplateDeleteClick);
}

// ===== 初期化処理 =====

/**
 * テンプレート機能の初期化
 */
function initializeTemplate() {
  // テンプレート一覧を表示
  displayTemplates();

  // テンプレート追加ボタンのイベントリスナー
  const addTemplateBtn = getElement('#addTemplateBtn');
  if (addTemplateBtn) {
    attachEventListener(addTemplateBtn, 'click', openTemplateAddModal);
  }

  // テンプレートフォームのイベントリスナー
  const templateForm = getElement('#templateForm');
  if (templateForm) {
    attachEventListener(templateForm, 'submit', handleTemplateFormSubmit);
  }

  // モーダル閉じるボタン
  const templateModalClose = getElement('#templateModalClose');
  if (templateModalClose) {
    attachEventListener(templateModalClose, 'click', closeTemplateModal);
  }

  const templateModalCancel = getElement('#templateModalCancel');
  if (templateModalCancel) {
    attachEventListener(templateModalCancel, 'click', closeTemplateModal);
  }

  // テンプレートアイテムのイベントリスナーを追加
  attachTemplateEventListeners();

  console.log('テンプレート機能を初期化しました');
}

// ページ読み込み時にテンプレート機能を初期化
onDOMReady(initializeTemplate);
