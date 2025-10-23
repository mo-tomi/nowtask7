/* カレンダー - カレンダー表示、日付からタスク検索 */

// ===== グローバル変数 =====

let currentCalendarDate = new Date();

// ===== カレンダー生成 =====

/**
 * 指定月のカレンダーを生成
 * @param {Date} date - 基準となる日付
 * @returns {string} カレンダーのHTML文字列
 */
function generateCalendarHTML(date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const today = new Date();

  // 月の最初の日と最後の日を取得
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const prevLastDay = new Date(year, month, 0);

  // 月の初日の曜日（0=日, 1=月, ..., 6=土）
  const firstDayOfWeek = firstDay.getDay();

  // 月の日数
  const daysInMonth = lastDay.getDate();
  const daysInPrevMonth = prevLastDay.getDate();

  // 月次統計を計算
  const monthlyStats = calculateMonthlyStats(year, month);

  let html = `
    <div class="calendar-month">
      <div class="calendar-header">
        <h3>${year}年${String(month + 1).padStart(2, '0')}月</h3>
      </div>
      <div class="calendar-stats">
        <div class="calendar-stat-item">
          <span class="calendar-stat-label">完了タスク</span>
          <span class="calendar-stat-value">${monthlyStats.completedTasks}個</span>
        </div>
        <div class="calendar-stat-item">
          <span class="calendar-stat-label">総タスク</span>
          <span class="calendar-stat-value">${monthlyStats.totalTasks}個</span>
        </div>
        <div class="calendar-stat-item">
          <span class="calendar-stat-label">完了率</span>
          <span class="calendar-stat-value">${monthlyStats.completionRate}%</span>
        </div>
      </div>
      <div class="calendar-weekdays">
        <div class="calendar-weekday">日</div>
        <div class="calendar-weekday">月</div>
        <div class="calendar-weekday">火</div>
        <div class="calendar-weekday">水</div>
        <div class="calendar-weekday">木</div>
        <div class="calendar-weekday">金</div>
        <div class="calendar-weekday">土</div>
      </div>
      <div class="calendar-days">
  `;

  // 前月の日を表示
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    const prevDate = new Date(year, month - 1, day);
    const dateStr = formatDate(prevDate);
    html += `
      <div class="calendar-day calendar-day--other" data-date="${dateStr}">
        <span>${day}</span>
      </div>
    `;
  }

  // 当月の日を表示
  for (let day = 1; day <= daysInMonth; day++) {
    const currentDate = new Date(year, month, day);
    const dateStr = formatDate(currentDate);
    const isToday = dateStr === getTodayDate();
    const tasksForDate = getTasksByDate(dateStr);
    const taskCount = tasksForDate.length;
    const completionRate = calculateCompletionRate(tasksForDate);

    html += `
      <div class="calendar-day ${isToday ? 'calendar-day--today' : ''}" data-date="${dateStr}">
        <span class="calendar-day-number">${day}</span>
        ${taskCount > 0 ? `<span class="calendar-task-count">${taskCount}</span>` : ''}
        ${completionRate !== null ? `<span class="calendar-completion-rate">${completionRate}%</span>` : ''}
      </div>
    `;
  }

  // 次月の日を表示
  const totalCells = Math.ceil((daysInMonth + firstDayOfWeek) / 7) * 7;
  const daysFromNextMonth = totalCells - (firstDayOfWeek + daysInMonth);
  for (let day = 1; day <= daysFromNextMonth; day++) {
    const nextDate = new Date(year, month + 1, day);
    const dateStr = formatDate(nextDate);
    html += `
      <div class="calendar-day calendar-day--other" data-date="${dateStr}">
        <span>${day}</span>
      </div>
    `;
  }

  html += `
      </div>
    </div>
  `;

  return html;
}

/**
 * カレンダーを表示
 */
function displayCalendar() {
  const calendarContainer = getElement('#calendarContainer');

  if (!calendarContainer) {
    console.warn('カレンダーコンテナが見つかりません');
    return;
  }

  const calendarHTML = generateCalendarHTML(currentCalendarDate);
  calendarContainer.innerHTML = calendarHTML;

  // カレンダー日付のイベントリスナーを追加
  attachCalendarEventListeners();
}

// ===== カレンダーイベント処理 =====

/**
 * カレンダーのイベントリスナーを追加
 */
function attachCalendarEventListeners() {
  const calendarDays = getElements('.calendar-day');
  attachEventListenerToAll(calendarDays, 'click', handleCalendarDayClick);
}

/**
 * カレンダー日付クリックイベント
 */
function handleCalendarDayClick(event) {
  const dayElement = event.target.closest('.calendar-day');

  if (!dayElement) {
    return;
  }

  const date = dayElement.dataset.date;

  // 選択済みスタイルを更新
  getElements('.calendar-day--selected').forEach(el => {
    el.classList.remove('calendar-day--selected');
  });
  dayElement.classList.add('calendar-day--selected');

  // 選択した日付のタスクを検索して表示
  displayTasksForDate(date);
}

// ===== タスク検索 =====

/**
 * 指定日付のタスクを検索
 * @param {string} date - 日付（YYYY-MM-DD形式）
 * @returns {Array} マッチしたタスクの配列
 */
function getTasksByDate(date) {
  const tasks = loadFromLocalStorage(STORAGE_KEYS.TASKS, []);
  return tasks.filter(task => task.createdDate === date);
}

/**
 * タスクの完了率を計算
 * @param {Array} tasks - タスクの配列
 * @returns {number|null} 完了率（0～100）、タスクがない場合はnull
 */
function calculateCompletionRate(tasks) {
  if (tasks.length === 0) {
    return null;
  }

  const completedCount = tasks.filter(task => task.completed).length;
  return Math.round((completedCount / tasks.length) * 100);
}

/**
 * 月次統計を計算
 * @param {number} year - 年
 * @param {number} month - 月（0～11）
 * @returns {Object} 統計情報
 */
function calculateMonthlyStats(year, month) {
  const tasks = loadFromLocalStorage(STORAGE_KEYS.TASKS, []);
  const monthTasks = tasks.filter(task => {
    if (!task.createdDate) return false;
    const taskDate = new Date(task.createdDate);
    return taskDate.getFullYear() === year && taskDate.getMonth() === month;
  });

  const completedTasks = monthTasks.filter(task => task.completed).length;
  const totalTasks = monthTasks.length;
  const completionRate = totalTasks > 0
    ? Math.round((completedTasks / totalTasks) * 100)
    : 0;

  return {
    completedTasks: completedTasks,
    totalTasks: totalTasks,
    completionRate: completionRate
  };
}

/**
 * 指定日付のタスクを表示
 * @param {string} date - 日付（YYYY-MM-DD形式）
 */
function displayTasksForDate(date) {
  const tasks = getTasksByDate(date);

  console.log(`${date} のタスク数: ${tasks.length}`);

  // 将来の実装として使用予定
  // ここでタスク一覧を更新する処理を実装
}

// ===== 月の移動 =====

/**
 * 前月へ移動
 */
function goToPreviousMonth() {
  currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1);
  displayCalendar();
}

/**
 * 次月へ移動
 */
function goToNextMonth() {
  currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1);
  displayCalendar();
}

/**
 * 今月へ移動
 */
function goToCurrentMonth() {
  currentCalendarDate = new Date();
  displayCalendar();
}

// ===== 初期化処理 =====

/**
 * カレンダー機能の初期化
 */
function initializeCalendar() {
  // カレンダーを表示
  displayCalendar();

  // ナビゲーションボタンのイベントリスナーを設定
  const prevMonthBtn = getElement('#prevMonthBtn');
  const nextMonthBtn = getElement('#nextMonthBtn');
  const todayBtn = getElement('#todayBtn');

  if (prevMonthBtn) {
    attachEventListener(prevMonthBtn, 'click', goToPreviousMonth);
  }

  if (nextMonthBtn) {
    attachEventListener(nextMonthBtn, 'click', goToNextMonth);
  }

  if (todayBtn) {
    attachEventListener(todayBtn, 'click', goToCurrentMonth);
  }

  console.log('カレンダー機能を初期化しました');
}

// ページ読み込み時にカレンダー機能を初期化
onDOMReady(initializeCalendar);
