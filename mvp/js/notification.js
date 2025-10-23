/**
 * 警告・通知機能
 * タスクの総時間が24時間を超過した場合に警告を表示
 */

(function() {
    'use strict';

    /**
     * タスクの総時間を計算（分単位）
     * @param {Array} tasks - タスクの配列
     * @returns {number} 総時間（分）
     */
    function calculateTotalDuration(tasks) {
        let totalMinutes = 0;

        tasks.forEach(task => {
            if (task.duration && !task.completed) {
                totalMinutes += parseInt(task.duration, 10);
            }
        });

        return totalMinutes;
    }

    /**
     * 24時間超過をチェック
     * @param {number} totalMinutes - 総時間（分）
     * @returns {Object} { isOver: boolean, overMinutes: number }
     */
    function checkOvertime(totalMinutes) {
        const dayInMinutes = 24 * 60; // 1440分
        const isOver = totalMinutes > dayInMinutes;
        const overMinutes = isOver ? totalMinutes - dayInMinutes : 0;

        return {
            isOver: isOver,
            overMinutes: overMinutes
        };
    }

    /**
     * 分を「時間」と「分」に変換
     * @param {number} minutes - 分
     * @returns {Object} { hours: number, mins: number }
     */
    function convertMinutesToHoursAndMinutes(minutes) {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return { hours, mins };
    }

    /**
     * オーバー時間をフォーマット
     * @param {number} overMinutes - オーバー時間（分）
     * @returns {string} フォーマット済みの文字列
     */
    function formatOvertime(overMinutes) {
        const { hours, mins } = convertMinutesToHoursAndMinutes(overMinutes);

        if (hours > 0 && mins > 0) {
            return `${hours}時間${mins}分`;
        } else if (hours > 0) {
            return `${hours}時間`;
        } else {
            return `${mins}分`;
        }
    }

    /**
     * 警告モーダルを表示
     * @param {number} overMinutes - オーバー時間（分）
     */
    function showWarningModal(overMinutes) {
        const modal = document.getElementById('warningModal');
        const overlay = document.getElementById('modalOverlay');
        const overtimeText = document.getElementById('overtimeText');

        if (!modal || !overlay || !overtimeText) {
            console.warn('警告モーダル要素が見つかりません');
            return;
        }

        // オーバー時間を表示
        overtimeText.textContent = formatOvertime(overMinutes);

        // モーダルを表示
        modal.classList.add('modal--active');
        overlay.classList.add('modal-overlay--active');
    }

    /**
     * 警告モーダルを閉じる
     */
    function closeWarningModal() {
        const modal = document.getElementById('warningModal');
        const overlay = document.getElementById('modalOverlay');

        if (modal) {
            modal.classList.remove('modal--active');
        }

        if (overlay && !document.querySelector('.modal--active')) {
            overlay.classList.remove('modal-overlay--active');
        }
    }

    /**
     * タスク更新時に警告をチェック
     */
    function checkAndShowWarning() {
        const tasks = window.TaskManager ? window.TaskManager.getTasks() : [];
        const totalMinutes = calculateTotalDuration(tasks);
        const { isOver, overMinutes } = checkOvertime(totalMinutes);

        if (isOver) {
            showWarningModal(overMinutes);
        }
    }

    /**
     * イベントリスナーを追加
     */
    function attachEventListeners() {
        // 警告モーダル閉じるボタン
        const closeBtn = document.getElementById('warningModalClose');
        if (closeBtn) {
            closeBtn.addEventListener('click', closeWarningModal);
        }

        const okBtn = document.getElementById('warningModalOk');
        if (okBtn) {
            okBtn.addEventListener('click', closeWarningModal);
        }
    }

    /**
     * 初期化処理
     */
    function init() {
        // DOM の準備ができたらイベントリスナーを追加
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', attachEventListeners);
        } else {
            attachEventListeners();
        }

        // タスク更新時に警告をチェック
        document.addEventListener('tasksUpdated', checkAndShowWarning);
    }

    // グローバルに公開
    window.NotificationManager = {
        checkAndShowWarning: checkAndShowWarning,
        closeWarningModal: closeWarningModal
    };

    // 初期化を実行
    init();
})();
