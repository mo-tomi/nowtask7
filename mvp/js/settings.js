/**
 * 設定機能
 * データのリセット機能とアプリ情報表示
 */

(function() {
    'use strict';

    /**
     * すべてのデータをリセット
     */
    function resetAllData() {
        const confirmMessage = '本当にすべてのデータを削除しますか？\n\nこの操作は元に戻せません！\n\n削除されるデータ：\n- すべてのタスク\n- すべてのテンプレート\n- すべてのルーティン\n- すべての設定';

        if (!confirm(confirmMessage)) {
            return;
        }

        // 二重確認
        const doubleConfirm = prompt('本当に削除する場合は「削除」と入力してください');

        if (doubleConfirm !== '削除') {
            alert('削除がキャンセルされました');
            return;
        }

        // すべてのローカルストレージをクリア
        localStorage.clear();

        alert('すべてのデータを削除しました。ページを再読み込みします。');
        location.reload();
    }

    /**
     * アプリ情報を更新
     */
    function updateAppInfo() {
        const tasks = loadFromLocalStorage(STORAGE_KEYS.TASKS, []);
        const templates = loadFromLocalStorage('nowTask_templates', []);
        const routines = loadFromLocalStorage('nowTask_routines', []);

        const totalTasksCount = document.getElementById('totalTasksCount');
        const totalTemplatesCount = document.getElementById('totalTemplatesCount');
        const totalRoutinesCount = document.getElementById('totalRoutinesCount');

        if (totalTasksCount) {
            totalTasksCount.textContent = `${tasks.length}個`;
        }

        if (totalTemplatesCount) {
            totalTemplatesCount.textContent = `${templates.length}個`;
        }

        if (totalRoutinesCount) {
            totalRoutinesCount.textContent = `${routines.length}個`;
        }
    }

    /**
     * 時刻表示設定を保存
     */
    function saveTimeDisplaySettings() {
        const formatSelect = document.getElementById('timeDisplayFormat');
        const styleSelect = document.getElementById('timeFormatStyle');

        if (formatSelect) {
            saveToLocalStorage(STORAGE_KEYS.TIME_DISPLAY_FORMAT, formatSelect.value);
        }

        if (styleSelect) {
            saveToLocalStorage(STORAGE_KEYS.TIME_FORMAT_STYLE, styleSelect.value);
        }

        // ゲージの時刻ラベルを再描画
        if (typeof displayTimeLabels === 'function') {
            displayTimeLabels();
        }
    }

    /**
     * 時刻表示設定を読み込み
     */
    function loadTimeDisplaySettings() {
        const formatSelect = document.getElementById('timeDisplayFormat');
        const styleSelect = document.getElementById('timeFormatStyle');

        // デフォルト値：6時間区切り、1桁表記
        const savedFormat = loadFromLocalStorage(STORAGE_KEYS.TIME_DISPLAY_FORMAT, '6h');
        const savedStyle = loadFromLocalStorage(STORAGE_KEYS.TIME_FORMAT_STYLE, '1digit');

        if (formatSelect) {
            formatSelect.value = savedFormat;
        }

        if (styleSelect) {
            styleSelect.value = savedStyle;
        }
    }

    /**
     * イベントリスナーを追加
     */
    function attachEventListeners() {
        // リセットボタン
        const resetBtn = document.getElementById('resetDataBtn');
        if (resetBtn) {
            resetBtn.addEventListener('click', resetAllData);
        }

        // 時刻表示形式の変更
        const formatSelect = document.getElementById('timeDisplayFormat');
        if (formatSelect) {
            formatSelect.addEventListener('change', saveTimeDisplaySettings);
        }

        // 時刻表記形式の変更
        const styleSelect = document.getElementById('timeFormatStyle');
        if (styleSelect) {
            styleSelect.addEventListener('change', saveTimeDisplaySettings);
        }
    }

    /**
     * 初期化処理
     */
    function init() {
        // DOM の準備ができたら実行
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                attachEventListeners();
                updateAppInfo();
                loadTimeDisplaySettings();
            });
        } else {
            attachEventListeners();
            updateAppInfo();
            loadTimeDisplaySettings();
        }

        // タスク更新時に情報を更新
        document.addEventListener('tasksUpdated', updateAppInfo);
    }

    // グローバルに公開
    window.SettingsManager = {
        resetAllData: resetAllData,
        updateAppInfo: updateAppInfo,
        saveTimeDisplaySettings: saveTimeDisplaySettings,
        loadTimeDisplaySettings: loadTimeDisplaySettings
    };

    // 初期化を実行
    init();
})();
