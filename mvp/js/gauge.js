/* ゲージ機能 - 24時間ゲージの表示と更新 */

// ===== グローバル変数 =====

let gaugeUpdateInterval = null;

// ===== 現在時刻取得 =====

/**
 * 現在時刻を取得して、24時間における経過率を計算
 * @returns {Object} { hours, minutes, seconds, percentage, timeString }
 */
function getCurrentTimeInfo() {
  const now = new Date();

  // 時間、分、秒を取得
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();

  // 24時間における経過分数を計算
  const totalMinutesInDay = 24 * 60; // 1440分
  const elapsedMinutes = hours * 60 + minutes;

  // パーセンテージを計算（小数第2位で四捨五入）
  const percentage = Math.round((elapsedMinutes / totalMinutesInDay) * 10000) / 100;

  // 時刻を HH:MM 形式で取得
  const timeString = formatTime(now);

  return {
    hours,
    minutes,
    seconds,
    elapsedMinutes,
    percentage: Math.min(100, Math.max(0, percentage)),
    timeString
  };
}

// ===== 経過時間計算 =====

/**
 * 24時間の開始時刻（00:00）から現在までの経過分数を計算
 * @returns {number} 経過分数
 */
function calculateElapsedMinutes() {
  const timeInfo = getCurrentTimeInfo();
  return timeInfo.elapsedMinutes;
}

/**
 * 経過パーセンテージを計算（0～100）
 * @returns {number} パーセンテージ
 */
function calculatePercentage() {
  const timeInfo = getCurrentTimeInfo();
  return timeInfo.percentage;
}

// ===== タスクの予定時間を取得 =====

/**
 * タスクの予定時間を24時間の配列で取得
 * @returns {Array<boolean>} 24要素の配列（true = 予定あり）
 */
function getScheduledHours() {
  const scheduledHours = Array(24).fill(false);

  // タスクを取得
  const tasks = loadFromLocalStorage(STORAGE_KEYS.TASKS, []);

  tasks.forEach(task => {
    // 完了済みタスクはスキップ
    if (task.completed) {
      return;
    }

    // 開始時刻と終了時刻がある場合
    if (task.startTime && task.endTime) {
      const startHour = parseInt(task.startTime.split(':')[0]);
      let endHour = parseInt(task.endTime.split(':')[0]);

      // 終了時刻の分数が0より大きい場合は、次の時間帯もアクティブにする
      const endMinute = parseInt(task.endTime.split(':')[1] || 0);
      if (endMinute > 0 && endHour < 23) {
        endHour++;
      }

      // 開始時刻から終了時刻までをアクティブにする
      if (endHour >= startHour) {
        // 同日の場合
        for (let i = startHour; i < endHour && i < 24; i++) {
          scheduledHours[i] = true;
        }
      } else {
        // 日跨ぎの場合（例：23:00-01:00）
        for (let i = startHour; i < 24; i++) {
          scheduledHours[i] = true;
        }
        for (let i = 0; i < endHour; i++) {
          scheduledHours[i] = true;
        }
      }
    } else if (task.duration) {
      // 所要時間のみの場合は、現在時刻から所要時間分をアクティブにする
      const now = new Date();
      const currentHour = now.getHours();
      const durationHours = Math.ceil(task.duration / 60);

      for (let i = 0; i < durationHours && (currentHour + i) < 24; i++) {
        scheduledHours[currentHour + i] = true;
      }
    }
  });

  return scheduledHours;
}

// ===== ゲージヘッダー表示 =====

/**
 * ゲージヘッダーの現在時刻と残り時間を更新
 */
function updateGaugeHeader() {
  const timeInfo = getCurrentTimeInfo();

  // 現在時刻を表示
  const gaugeCurrentTime = getElement('#gaugeCurrentTime');
  if (gaugeCurrentTime) {
    gaugeCurrentTime.textContent = timeInfo.timeString;
  }

  // 残り時間を計算して表示（24時間 - 経過時間）
  const remainingMinutes = (24 * 60) - timeInfo.elapsedMinutes;
  const remainingHours = Math.floor(remainingMinutes / 60);
  const remainingMins = remainingMinutes % 60;

  const gaugeRemainingTime = getElement('#gaugeRemainingTime');
  if (gaugeRemainingTime) {
    if (remainingMins > 0) {
      gaugeRemainingTime.textContent = `残り: ${remainingHours}時間${remainingMins}分`;
    } else {
      gaugeRemainingTime.textContent = `残り: ${remainingHours}時間`;
    }
  }

  // 日付ラベルは既にHTMLで「今日」と設定されているので更新不要
  // 将来的にナビゲーション機能を追加する場合は、ここで日付を更新する
}

// ===== ゲージ表示 =====

/**
 * ゲージをDOM上に表示（24ブロック型）
 */
function displayGauge() {
  const gaugeBar = getElement('#gaugeBar');

  if (!gaugeBar) {
    console.warn('ゲージ要素が見つかりません');
    return;
  }

  const timeInfo = getCurrentTimeInfo();
  const scheduledHours = getScheduledHours();
  const currentHour = timeInfo.hours;

  // 24個のブロックを生成
  let gaugeContent = '';
  for (let i = 0; i < 24; i++) {
    const classes = ['gauge-step'];

    // 予定がある時間帯をアクティブにする
    if (scheduledHours[i]) {
      classes.push('active');
    }

    // 現在時刻のブロックをハイライト
    if (i === currentHour) {
      classes.push('current-marker-highlight');
    }

    gaugeContent += `<div class="${classes.join(' ')}"></div>`;
  }

  gaugeBar.innerHTML = gaugeContent;

  // ゲージヘッダーも更新
  updateGaugeHeader();
}

/**
 * ゲージを更新（リアルタイム更新用）
 */
function updateGauge() {
  // 24ブロック型では、全体を再描画
  displayGauge();
}

// ===== リアルタイム更新 =====

/**
 * ゲージのリアルタイム更新を開始
 * 1分ごとに更新を行う
 */
function startGaugeUpdate() {
  // 既に実行中の場合はクリア
  if (gaugeUpdateInterval !== null) {
    clearInterval(gaugeUpdateInterval);
  }

  // 1分ごとにゲージを更新
  gaugeUpdateInterval = setInterval(() => {
    updateGauge();
  }, 60000); // 60,000ms = 1分

  console.log('ゲージの自動更新を開始しました（1分ごと）');
}

/**
 * ゲージのリアルタイム更新を停止
 */
function stopGaugeUpdate() {
  if (gaugeUpdateInterval !== null) {
    clearInterval(gaugeUpdateInterval);
    gaugeUpdateInterval = null;
    console.log('ゲージの自動更新を停止しました');
  }
}

// ===== 時刻ラベル表示 =====

/**
 * 24時間ゲージの時刻ラベルを表示（24ブロック型）
 */
function displayTimeLabels() {
  const timeLabelsContainer = getElement('#timeLabels');

  if (!timeLabelsContainer) {
    console.warn('時刻ラベル要素が見つかりません');
    return;
  }

  // 設定を読み込み
  const displayFormat = loadFromLocalStorage(STORAGE_KEYS.TIME_DISPLAY_FORMAT, '6h');
  const formatStyle = loadFromLocalStorage(STORAGE_KEYS.TIME_FORMAT_STYLE, '1digit');

  // 表示間隔を決定
  let interval = 6; // デフォルトは6時間区切り
  if (displayFormat === 'all') {
    interval = 1; // 全ての時刻を表示
  } else if (displayFormat === '3h') {
    interval = 3; // 3時間区切り
  }

  // ラベルパターンを生成
  const labels = Array(24).fill('').map((_, i) => {
    if (i % interval === 0) {
      // 時刻の表記形式を適用
      const hour = formatStyle === '2digit' ? String(i).padStart(2, '0') : String(i);
      return `${hour}:00`;
    }
    return '';
  });

  // 24個のラベル枠を生成
  let labelsHtml = '';
  labels.forEach(label => {
    labelsHtml += `<div class="time-label">${label}</div>`;
  });

  timeLabelsContainer.innerHTML = labelsHtml;
}

// ===== 初期化処理 =====

/**
 * ゲージ機能の初期化
 */
function initializeGauge() {
  // ゲージを初期表示
  displayGauge();

  // 時刻ラベルを表示
  displayTimeLabels();

  // ゲージのリアルタイム更新を開始
  startGaugeUpdate();

  // タスク更新時にゲージを再描画
  document.addEventListener('tasksUpdated', () => {
    displayGauge();
  });

  console.log('ゲージ機能を初期化しました');
}

// ページ読み込み時にゲージ機能を初期化
onDOMReady(initializeGauge);

// ===== ページアンロード時の処理 =====

/**
 * ページを離れるときに、リアルタイム更新を停止
 */
window.addEventListener('beforeunload', () => {
  stopGaugeUpdate();
}, false);
