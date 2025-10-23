/* ヘッダー機能 - ヘッダーボタンの制御 */

// ===== ヘッダーボタン制御 =====

/**
 * カレンダーボタンクリック時の処理
 */
function handleCalendarBtnClick() {
  const calendarSection = getElement('.calendar-section');

  if (calendarSection) {
    // カレンダーセクションにスムーズスクロール
    calendarSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } else {
    console.warn('カレンダーセクションが見つかりません');
  }
}

/**
 * 設定ボタンクリック時の処理
 */
function handleSettingsBtnClick() {
  console.log('設定ボタンがクリックされました');
  // 将来: 設定ページを開く機能を実装
  alert('設定機能は準備中です');
}

/**
 * メニューボタンクリック時の処理
 */
function handleMenuBtnClick() {
  console.log('メニューボタンがクリックされました');
  // 将来: メニューを開く機能を実装
  alert('メニューは準備中です');
}

// ===== 初期化処理 =====

/**
 * ヘッダー機能の初期化
 */
function initializeHeader() {
  // カレンダーボタン
  const calendarBtn = getElement('#calendarBtn');
  if (calendarBtn) {
    attachEventListener(calendarBtn, 'click', handleCalendarBtnClick);
  }

  // 設定ボタン
  const settingsBtn = getElement('#settingsBtn');
  if (settingsBtn) {
    attachEventListener(settingsBtn, 'click', handleSettingsBtnClick);
  }

  // メニューボタン
  const menuBtn = getElement('#menuBtn');
  if (menuBtn) {
    attachEventListener(menuBtn, 'click', handleMenuBtnClick);
  }

  console.log('ヘッダー機能を初期化しました');
}

// ページ読み込み時に初期化
onDOMReady(initializeHeader);
