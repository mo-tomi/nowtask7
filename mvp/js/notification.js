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

    // ===== トースト通知システム =====

    /**
     * トースト通知を表示
     * @param {string} message - 表示するメッセージ
     * @param {string} type - 通知タイプ ('success', 'error', 'warning', 'info')
     * @param {number} duration - 表示時間（ミリ秒）デフォルト3000ms
     */
    function showNotification(message, type = 'info', duration = 3000) {
        // トーストコンテナを取得または作成
        let container = document.getElementById('toastContainer');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toastContainer';
            container.className = 'toast-container';
            document.body.appendChild(container);
        }

        // トースト要素を作成
        const toast = document.createElement('div');
        toast.className = `toast toast--${type}`;

        // アイコンを設定
        let icon = '';
        switch (type) {
            case 'success':
                icon = '<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>';
                break;
            case 'error':
                icon = '<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>';
                break;
            case 'warning':
                icon = '<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>';
                break;
            default: // info
                icon = '<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>';
        }

        toast.innerHTML = `
            ${icon}
            <span class="toast-message">${escapeHtml(message)}</span>
            <button class="toast-close" aria-label="閉じる">×</button>
        `;

        // トーストをコンテナに追加
        container.appendChild(toast);

        // 閉じるボタンのイベントリスナー
        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => {
            removeToast(toast);
        });

        // アニメーションで表示
        setTimeout(() => {
            toast.classList.add('toast--show');
        }, 10);

        // 指定時間後に自動で閉じる
        setTimeout(() => {
            removeToast(toast);
        }, duration);
    }

    /**
     * トースト通知を削除
     * @param {Element} toast - トースト要素
     */
    function removeToast(toast) {
        toast.classList.remove('toast--show');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }

    /**
     * HTML特殊文字をエスケープ（XSS対策）
     * @param {string} text - エスケープするテキスト
     * @returns {string} エスケープされたテキスト
     */
    function escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return String(text).replace(/[&<>"']/g, char => map[char]);
    }

    // グローバルに公開
    window.NotificationManager = {
        checkAndShowWarning: checkAndShowWarning,
        closeWarningModal: closeWarningModal,
        showNotification: showNotification
    };

    // グローバルスコープにも公開（後方互換性のため）
    window.showNotification = showNotification;

    // 初期化を実行
    init();
})();
