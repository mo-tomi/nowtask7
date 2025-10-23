/* データ分析 - タスク完了数の統計、日別・週別・月別の分析 */

// ===== 統計計算 =====

/**
 * 本日のタスク完了数を計算
 * @returns {number} 本日の完了タスク数
 */
function calculateTodayCompletedTasks() {
  const tasks = loadFromLocalStorage(STORAGE_KEYS.TASKS, []);
  const today = getTodayDate();

  return tasks.filter(task =>
    task.completed && task.createdDate === today
  ).length;
}

/**
 * 今週のタスク完了数を計算
 * @returns {number} 今週の完了タスク数
 */
function calculateWeekCompletedTasks() {
  const tasks = loadFromLocalStorage(STORAGE_KEYS.TASKS, []);
  const today = new Date();

  // 今週の月曜日を計算
  const dayOfWeek = today.getDay();
  const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
  const weekStart = new Date(today.getFullYear(), today.getMonth(), diff);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);

  const weekStartStr = formatDate(weekStart);
  const weekEndStr = formatDate(weekEnd);

  return tasks.filter(task => {
    if (!task.completed) return false;
    return task.createdDate >= weekStartStr && task.createdDate <= weekEndStr;
  }).length;
}

/**
 * 今月のタスク完了数を計算
 * @returns {number} 今月の完了タスク数
 */
function calculateMonthCompletedTasks() {
  const tasks = loadFromLocalStorage(STORAGE_KEYS.TASKS, []);
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  // 月の初日と最後の日を計算
  const monthStart = new Date(year, month, 1);
  const monthEnd = new Date(year, month + 1, 0);

  const monthStartStr = formatDate(monthStart);
  const monthEndStr = formatDate(monthEnd);

  return tasks.filter(task => {
    if (!task.completed) return false;
    return task.createdDate >= monthStartStr && task.createdDate <= monthEndStr;
  }).length;
}

/**
 * タスク完了率をパーセンテージで計算
 * @returns {number} 完了率（0～100）
 */
function calculateCompleteRate() {
  const tasks = loadFromLocalStorage(STORAGE_KEYS.TASKS, []);

  if (tasks.length === 0) {
    return 0;
  }

  const completedCount = tasks.filter(task => task.completed).length;
  return Math.round((completedCount / tasks.length) * 100);
}

// ===== 表示機能 =====

/**
 * 統計情報をダッシュボードに表示
 */
function displayAnalytics() {
  const todayComplete = calculateTodayCompletedTasks();
  const weekComplete = calculateWeekCompletedTasks();
  const completeRate = calculateCompleteRate();

  // 本日完了数を表示
  const analyticsTodayElement = getElement('#analyticsTodayComplete');
  if (analyticsTodayElement) {
    analyticsTodayElement.textContent = `${todayComplete}個`;
  }

  // 今週完了数を表示
  const analyticsWeekElement = getElement('#analyticsWeekComplete');
  if (analyticsWeekElement) {
    analyticsWeekElement.textContent = `${weekComplete}個`;
  }

  // 完了率を表示
  const analyticsRateElement = getElement('#analyticsCompleteRate');
  if (analyticsRateElement) {
    analyticsRateElement.textContent = `${completeRate}%`;
  }

  console.log(`本日完了: ${todayComplete}個, 今週完了: ${weekComplete}個, 完了率: ${completeRate}%`);
}

/**
 * タスク情報が更新されたときに、分析を更新
 */
function updateAnalyticsOnTaskChange() {
  displayAnalytics();
}

// ===== 初期化処理 =====

/**
 * データ分析機能の初期化
 */
function initializeAnalytics() {
  // 統計情報を表示
  displayAnalytics();

  console.log('データ分析機能を初期化しました');
}

// ページ読み込み時にデータ分析機能を初期化
onDOMReady(initializeAnalytics);
