/**
 * 一括操作機能
 * 複数のタスクを選択して一括で操作する
 */

(function() {
    'use strict';

    // 選択されたタスクIDを管理
    let selectedTaskIds = new Set();

    /**
     * 全選択ボタンのチェック状態を更新
     */
    function updateSelectAllCheckbox() {
        const selectAllCheckbox = document.getElementById('selectAllTasks');
        if (!selectAllCheckbox) return;

        const tasks = window.TaskManager ? window.TaskManager.getTasks() : [];
        const visibleTasks = tasks.filter(task => !task.completed);

        if (visibleTasks.length === 0) {
            selectAllCheckbox.checked = false;
            selectAllCheckbox.indeterminate = false;
            return;
        }

        const selectedCount = visibleTasks.filter(task => selectedTaskIds.has(task.id)).length;

        if (selectedCount === 0) {
            selectAllCheckbox.checked = false;
            selectAllCheckbox.indeterminate = false;
        } else if (selectedCount === visibleTasks.length) {
            selectAllCheckbox.checked = true;
            selectAllCheckbox.indeterminate = false;
        } else {
            selectAllCheckbox.checked = false;
            selectAllCheckbox.indeterminate = true;
        }
    }

    /**
     * 一括操作ボタンの表示/非表示を切り替え
     */
    function updateBatchActionsVisibility() {
        const batchActions = document.getElementById('batchActions');
        const selectedCount = document.getElementById('selectedCount');

        if (!batchActions || !selectedCount) return;

        if (selectedTaskIds.size > 0) {
            batchActions.style.display = 'flex';
            selectedCount.textContent = selectedTaskIds.size;
        } else {
            batchActions.style.display = 'none';
        }
    }

    /**
     * タスクの選択状態を切り替え
     * @param {string} taskId - タスクID
     */
    function toggleTaskSelection(taskId) {
        if (selectedTaskIds.has(taskId)) {
            selectedTaskIds.delete(taskId);
        } else {
            selectedTaskIds.add(taskId);
        }

        updateSelectAllCheckbox();
        updateBatchActionsVisibility();
        updateTaskCheckboxes();
    }

    /**
     * 全選択/全解除
     */
    function toggleSelectAll() {
        const tasks = window.TaskManager ? window.TaskManager.getTasks() : [];
        const visibleTasks = tasks.filter(task => !task.completed);

        const allSelected = visibleTasks.every(task => selectedTaskIds.has(task.id));

        if (allSelected) {
            // 全解除
            visibleTasks.forEach(task => selectedTaskIds.delete(task.id));
        } else {
            // 全選択
            visibleTasks.forEach(task => selectedTaskIds.add(task.id));
        }

        updateSelectAllCheckbox();
        updateBatchActionsVisibility();
        updateTaskCheckboxes();
    }

    /**
     * タスクチェックボックスの状態を更新
     */
    function updateTaskCheckboxes() {
        const checkboxes = document.querySelectorAll('.task-select-checkbox');
        checkboxes.forEach(checkbox => {
            const taskId = checkbox.dataset.taskId;
            checkbox.checked = selectedTaskIds.has(taskId);
        });
    }

    /**
     * 選択中のタスクを一括削除
     */
    function batchDelete() {
        if (selectedTaskIds.size === 0) {
            alert('削除するタスクを選択してください');
            return;
        }

        const confirmMessage = `選択した ${selectedTaskIds.size} 個のタスクを削除しますか？`;
        if (!confirm(confirmMessage)) {
            return;
        }

        const tasks = window.TaskManager ? window.TaskManager.getTasks() : [];
        const updatedTasks = tasks.filter(task => !selectedTaskIds.has(task.id));

        if (window.TaskManager) {
            window.TaskManager.saveTasks(updatedTasks);
        }

        // 選択をクリア
        selectedTaskIds.clear();
        updateSelectAllCheckbox();
        updateBatchActionsVisibility();

        // タスク一覧を更新
        if (typeof displayTasks === 'function') {
            displayTasks();
        }

        // タスク更新イベントを発火
        document.dispatchEvent(new Event('tasksUpdated'));
    }

    /**
     * 選択中のタスクを一括完了
     */
    function batchComplete() {
        if (selectedTaskIds.size === 0) {
            alert('完了するタスクを選択してください');
            return;
        }

        const tasks = window.TaskManager ? window.TaskManager.getTasks() : [];
        const updatedTasks = tasks.map(task => {
            if (selectedTaskIds.has(task.id) && !task.completed) {
                return {
                    ...task,
                    completed: true,
                    completedAt: new Date().toISOString()
                };
            }
            return task;
        });

        if (window.TaskManager) {
            window.TaskManager.saveTasks(updatedTasks);
        }

        // 選択をクリア
        selectedTaskIds.clear();
        updateSelectAllCheckbox();
        updateBatchActionsVisibility();

        // タスク一覧を更新
        if (typeof displayTasks === 'function') {
            displayTasks();
        }

        // タスク更新イベントを発火
        document.dispatchEvent(new Event('tasksUpdated'));
    }

    /**
     * 選択をクリア
     */
    function clearSelection() {
        selectedTaskIds.clear();
        updateSelectAllCheckbox();
        updateBatchActionsVisibility();
        updateTaskCheckboxes();
    }

    /**
     * タスクチェックボックスのイベントリスナーを追加
     */
    function attachTaskCheckboxListeners() {
        const checkboxes = document.querySelectorAll('.task-select-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                e.stopPropagation();
                const taskId = checkbox.dataset.taskId;
                toggleTaskSelection(taskId);
            });
        });
    }

    /**
     * イベントリスナーを追加
     */
    function attachEventListeners() {
        // 全選択チェックボックス
        const selectAllCheckbox = document.getElementById('selectAllTasks');
        if (selectAllCheckbox) {
            selectAllCheckbox.addEventListener('change', toggleSelectAll);
        }

        // 一括削除ボタン
        const batchDeleteBtn = document.getElementById('batchDeleteBtn');
        if (batchDeleteBtn) {
            batchDeleteBtn.addEventListener('click', batchDelete);
        }

        // 一括完了ボタン
        const batchCompleteBtn = document.getElementById('batchCompleteBtn');
        if (batchCompleteBtn) {
            batchCompleteBtn.addEventListener('click', batchComplete);
        }

        // 選択クリアボタン
        const clearSelectionBtn = document.getElementById('clearSelectionBtn');
        if (clearSelectionBtn) {
            clearSelectionBtn.addEventListener('click', clearSelection);
        }

        // タスク更新時にチェックボックスを再設定
        document.addEventListener('tasksUpdated', () => {
            setTimeout(() => {
                attachTaskCheckboxListeners();
                updateTaskCheckboxes();
            }, 100);
        });
    }

    /**
     * 初期化処理
     */
    function init() {
        // DOM の準備ができたらイベントリスナーを追加
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                attachEventListeners();
                attachTaskCheckboxListeners();
            });
        } else {
            attachEventListeners();
            attachTaskCheckboxListeners();
        }
    }

    // グローバルに公開
    window.BatchManager = {
        toggleTaskSelection: toggleTaskSelection,
        clearSelection: clearSelection,
        attachTaskCheckboxListeners: attachTaskCheckboxListeners
    };

    // 初期化を実行
    init();
})();
