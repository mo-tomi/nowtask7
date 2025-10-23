/* 空き時間分析 - 日別・週別・月別の空き時間を計算 */

// ===== 空き時間計算機能 =====

/**
 * 指定した日付のタスク所要時間の合計を計算
 * @param {string} date - YYYY-MM-DD形式の日付
 * @returns {number} 所要時間の合計（分）
 */
function calculateTotalDurationForDate(date) {
  const tasks = loadFromLocalStorage(STORAGE_KEYS.TASKS, []);

  return tasks
    .filter(task => task.createdDate === date && task.duration && task.duration > 0)
    .reduce((total, task) => total + parseInt(task.duration, 10), 0);
}

/**
 * 本日の空き時間を計算
 * @returns {number} 空き時間（分）
 */
function calculateTodayFreeTime() {
  const today = getTodayDate();
  const totalDuration = calculateTotalDurationForDate(today);
  const dayMinutes = 24 * 60; // 1日は1440分

  return Math.max(0, dayMinutes - totalDuration);
}

/**
 * 今週の空き時間を計算
 * @returns {number} 空き時間（分）
 */
function calculateWeekFreeTime() {
  const today = new Date();

  // 今週の月曜日を計算
  const dayOfWeek = today.getDay();
  const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
  const weekStart = new Date(today.getFullYear(), today.getMonth(), diff);

  let totalDuration = 0;
  let daysCount = 0;

  // 月曜日から今日までの所要時間を集計
  for (let i = 0; i <= (today.getDay() === 0 ? 6 : today.getDay() - 1); i++) {
    const currentDate = new Date(weekStart);
    currentDate.setDate(weekStart.getDate() + i);
    const dateStr = formatDate(currentDate);

    totalDuration += calculateTotalDurationForDate(dateStr);
    daysCount++;
  }

  const weekMinutes = daysCount * 24 * 60;
  return Math.max(0, weekMinutes - totalDuration);
}

/**
 * 今月の空き時間を計算
 * @returns {number} 空き時間（分）
 */
function calculateMonthFreeTime() {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  // 月の初日と最後の日を計算
  const monthStart = new Date(year, month, 1);
  const monthEnd = new Date(year, month + 1, 0);

  let totalDuration = 0;
  let daysCount = 0;

  // 月初から今日までの所要時間を集計
  for (let d = monthStart; d <= today; d.setDate(d.getDate() + 1)) {
    const dateStr = formatDate(d);
    totalDuration += calculateTotalDurationForDate(dateStr);
    daysCount++;
  }

  const monthMinutes = daysCount * 24 * 60;
  return Math.max(0, monthMinutes - totalDuration);
}

/**
 * 分単位の時間を「時間」と「分」の形式に変換
 * @param {number} minutes - 分単位の時間
 * @returns {string} フォーマット済みの時間文字列
 */
function formatFreeTime(minutes) {
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
 * 日別の空き時間データを取得（過去7日分）
 * @returns {Array} 日別空き時間データ
 */
function getDailyFreeTimeData() {
  const result = [];
  const today = new Date();

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = formatDate(date);

    const totalDuration = calculateTotalDurationForDate(dateStr);
    const dayMinutes = 24 * 60;
    const freeTime = Math.max(0, dayMinutes - totalDuration);

    result.push({
      date: dateStr,
      freeTime: freeTime,
      usedTime: totalDuration
    });
  }

  return result;
}

// ===== 表示機能 =====

/**
 * 空き時間情報を画面に表示
 */
function displayFreeTime() {
  const todayFreeTime = calculateTodayFreeTime();
  const weekFreeTime = calculateWeekFreeTime();
  const monthFreeTime = calculateMonthFreeTime();

  // 本日空き時間を表示
  const freeTimeTodayElement = getElement('#freeTimeTodayValue');
  if (freeTimeTodayElement) {
    freeTimeTodayElement.textContent = formatFreeTime(todayFreeTime);
  }

  // 今週空き時間を表示
  const freeTimeWeekElement = getElement('#freeTimeWeekValue');
  if (freeTimeWeekElement) {
    freeTimeWeekElement.textContent = formatFreeTime(weekFreeTime);
  }

  // 今月空き時間を表示
  const freeTimeMonthElement = getElement('#freeTimeMonthValue');
  if (freeTimeMonthElement) {
    freeTimeMonthElement.textContent = formatFreeTime(monthFreeTime);
  }

  console.log(`本日空き時間: ${formatFreeTime(todayFreeTime)}, 今週空き時間: ${formatFreeTime(weekFreeTime)}, 今月空き時間: ${formatFreeTime(monthFreeTime)}`);
}

/**
 * タスク情報が更新されたときに、空き時間を更新
 */
function updateFreeTimeOnTaskChange() {
  displayFreeTime();
}

// ===== 初期化処理 =====

/**
 * 空き時間分析機能の初期化
 */
function initializeFreeTime() {
  // 空き時間情報を表示
  displayFreeTime();

  console.log('空き時間分析機能を初期化しました');
}

// ページ読み込み時に空き時間分析機能を初期化
onDOMReady(initializeFreeTime);
