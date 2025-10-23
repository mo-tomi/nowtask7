/**
 * メニュー機能
 * サイドメニューの開閉と画面切り替えを管理
 */

(function() {
    'use strict';

    let currentView = 'home';

    /**
     * メニューを開く
     */
    function openMenu() {
        const sideMenu = document.getElementById('sideMenu');
        const menuOverlay = document.getElementById('menuOverlay');

        if (sideMenu) {
            sideMenu.classList.add('side-menu--open');
        }

        if (menuOverlay) {
            menuOverlay.classList.add('menu-overlay--visible');
        }
    }

    /**
     * メニューを閉じる
     */
    function closeMenu() {
        const sideMenu = document.getElementById('sideMenu');
        const menuOverlay = document.getElementById('menuOverlay');

        if (sideMenu) {
            sideMenu.classList.remove('side-menu--open');
        }

        if (menuOverlay) {
            menuOverlay.classList.remove('menu-overlay--visible');
        }
    }

    /**
     * 表示するビューを切り替え
     * @param {string} viewName - 表示するビューの名前
     */
    function switchView(viewName) {
        // すべてのセクションを非表示
        const allSections = document.querySelectorAll('.view-section');
        allSections.forEach(section => {
            section.style.display = 'none';
        });

        // 指定されたビューのセクションを表示
        const targetSections = document.querySelectorAll(`[data-view="${viewName}"]`);
        targetSections.forEach(section => {
            section.style.display = 'block';
        });

        // 現在のビューを更新
        currentView = viewName;

        // メニューボタンのアクティブ状態を更新
        updateActiveMenuItem(viewName);

        // メニューを閉じる
        closeMenu();

        // ビューに応じた初期化処理を実行
        initializeView(viewName);
    }

    /**
     * アクティブなメニュー項目を更新
     * @param {string} viewName - アクティブにするビューの名前
     */
    function updateActiveMenuItem(viewName) {
        const menuLinks = document.querySelectorAll('.side-menu-link');
        menuLinks.forEach(link => {
            if (link.getAttribute('data-view') === viewName) {
                link.classList.add('side-menu-link--active');
            } else {
                link.classList.remove('side-menu-link--active');
            }
        });
    }

    /**
     * ビューの初期化処理
     * @param {string} viewName - 初期化するビューの名前
     */
    function initializeView(viewName) {
        switch (viewName) {
            case 'home':
                // ホーム画面の初期化
                if (typeof applySearchAndFilters === 'function') {
                    applySearchAndFilters();
                }
                break;

            case 'calendar':
                // カレンダーの再描画
                if (typeof renderCalendar === 'function') {
                    renderCalendar();
                }
                break;

            case 'analytics':
                // 分析データの更新
                if (typeof updateAnalytics === 'function') {
                    updateAnalytics();
                }
                break;

            case 'ranking':
                // ランキングの更新
                if (typeof updateRanking === 'function') {
                    updateRanking();
                }
                break;

            case 'freetime':
                // 空き時間の更新
                if (typeof updateFreeTime === 'function') {
                    updateFreeTime();
                }
                break;

            case 'charts':
                // グラフの再描画
                if (typeof renderAllCharts === 'function') {
                    renderAllCharts();
                }
                break;

            case 'routine':
                // ルーティン一覧の更新
                if (typeof renderRoutineList === 'function') {
                    renderRoutineList();
                }
                break;

            case 'template':
                // テンプレート一覧の更新
                if (typeof renderTemplateList === 'function') {
                    renderTemplateList();
                }
                break;

            case 'settings':
                // 設定画面の初期化
                if (typeof updateAppInfo === 'function') {
                    window.SettingsManager.updateAppInfo();
                }
                break;
        }
    }

    /**
     * イベントリスナーを設定
     */
    function attachEventListeners() {
        // メニューボタン
        const menuBtn = document.getElementById('menuBtn');
        if (menuBtn) {
            menuBtn.addEventListener('click', openMenu);
        }

        // メニュー閉じるボタン
        const closeMenuBtn = document.getElementById('closeMenuBtn');
        if (closeMenuBtn) {
            closeMenuBtn.addEventListener('click', closeMenu);
        }

        // オーバーレイクリック
        const menuOverlay = document.getElementById('menuOverlay');
        if (menuOverlay) {
            menuOverlay.addEventListener('click', closeMenu);
        }

        // メニュー項目
        const menuLinks = document.querySelectorAll('.side-menu-link');
        menuLinks.forEach(link => {
            link.addEventListener('click', function() {
                const viewName = this.getAttribute('data-view');
                if (viewName) {
                    switchView(viewName);
                }
            });
        });

        // ヘッダーのカレンダーボタン
        const calendarBtn = document.getElementById('calendarBtn');
        if (calendarBtn) {
            calendarBtn.addEventListener('click', function() {
                switchView('calendar');
            });
        }

        // ヘッダーの設定ボタン
        const settingsBtn = document.getElementById('settingsBtn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', function() {
                switchView('settings');
            });
        }
    }

    /**
     * 初期化処理
     */
    function init() {
        // DOMの準備ができたら実行
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                attachEventListeners();
                // デフォルトでホーム画面を表示
                updateActiveMenuItem('home');
            });
        } else {
            attachEventListeners();
            updateActiveMenuItem('home');
        }
    }

    // グローバルに公開
    window.MenuManager = {
        openMenu: openMenu,
        closeMenu: closeMenu,
        switchView: switchView,
        getCurrentView: function() {
            return currentView;
        }
    };

    // 初期化を実行
    init();

    console.log('メニュー機能を初期化しました');
})();
