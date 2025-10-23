/* タスクランキング機能 - 完了タスクの所要時間ランキング */

// ===== ランキング計算機能 =====

/**
 * 完了したタスクから所要時間が長いものを集計し、TOP 5を取得
 * @returns {Array} ランキングデータの配列
 */
function calculateTaskRanking() {
  const tasks = loadFromLocalStorage(STORAGE_KEYS.TASKS, []);

  // 完了したタスクで、所要時間が設定されているものをフィルタ
  const completedTasksWithDuration = tasks.filter(task =>
    task.completed && task.duration && task.duration > 0
  );

  // タスク名ごとに所要時間を集計
  const taskDurationMap = {};

  completedTasksWithDuration.forEach(task => {
    const taskName = task.text;
    const duration = parseInt(task.duration, 10);

    if (taskDurationMap[taskName]) {
      // 既に同名タスクがある場合、累積時間を加算
      taskDurationMap[taskName].totalDuration += duration;
      taskDurationMap[taskName].count += 1;
    } else {
      // 新規タスク
      taskDurationMap[taskName] = {
        taskName: taskName,
        totalDuration: duration,
        count: 1
      };
    }
  });

  // 配列に変換してソート（所要時間が長い順）
  const rankingArray = Object.values(taskDurationMap);
  rankingArray.sort((a, b) => b.totalDuration - a.totalDuration);

  // TOP 5 を取得
  return rankingArray.slice(0, 5);
}

/**
 * 所要時間を時間と分の形式に変換
 * @param {number} minutes - 分単位の時間
 * @returns {string} フォーマット済みの時間文字列（例：2時間30分）
 */
function formatDuration(minutes) {
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

// ===== ランキング表示機能 =====

/**
 * タスクランキングを画面に表示
 */
function displayTaskRanking() {
  const rankingData = calculateTaskRanking();
  const rankingContainer = getElement('#taskRankingList');

  if (!rankingContainer) {
    return;
  }

  // 既存の内容をクリア
  rankingContainer.innerHTML = '';

  // ランキングデータがない場合
  if (rankingData.length === 0) {
    rankingContainer.innerHTML = '<p class="ranking-empty">まだランキングデータがありません</p>';
    return;
  }

  // ランキング項目を生成
  rankingData.forEach((item, index) => {
    const rankingItem = document.createElement('div');
    rankingItem.className = 'ranking-item';

    const rank = index + 1;
    const formattedDuration = formatDuration(item.totalDuration);

    rankingItem.innerHTML = `
      <div class="ranking-rank">${rank}</div>
      <div class="ranking-info">
        <div class="ranking-task-name">${escapeHtml(item.taskName)}</div>
        <div class="ranking-details">
          <span class="ranking-duration">${formattedDuration}</span>
          <span class="ranking-count">（${item.count}回）</span>
        </div>
      </div>
    `;

    rankingContainer.appendChild(rankingItem);
  });
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

/**
 * タスク情報が更新されたときに、ランキングを更新
 */
function updateRankingOnTaskChange() {
  displayTaskRanking();
}

// ===== 初期化処理 =====

/**
 * タスクランキング機能の初期化
 */
function initializeRanking() {
  // ランキング情報を表示
  displayTaskRanking();

  console.log('タスクランキング機能を初期化しました');
}

// ページ読み込み時にタスクランキング機能を初期化
onDOMReady(initializeRanking);
