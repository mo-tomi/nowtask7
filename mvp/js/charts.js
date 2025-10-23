/**
 * グラフ表示機能
 * Chart.js を使って統計情報をグラフで可視化
 */

(function() {
    'use strict';

    // グラフのインスタンスを保持
    let dailyChart = null;
    let weeklyChart = null;
    let monthlyChart = null;

    /**
     * 日付を YYYY-MM-DD 形式にフォーマット
     */
    function formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    /**
     * 日別完了タスク数を集計（過去7日間）
     */
    function getDailyCompletedTasks() {
        const tasks = window.TaskManager ? window.TaskManager.getTasks() : [];
        const today = new Date();
        const dailyData = {};

        // 過去7日間の日付を初期化
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const dateStr = formatDate(date);
            dailyData[dateStr] = 0;
        }

        // 完了済みタスクを集計
        tasks.forEach(task => {
            if (task.completed && task.completedAt) {
                const completedDate = new Date(task.completedAt);
                const dateStr = formatDate(completedDate);
                if (dailyData.hasOwnProperty(dateStr)) {
                    dailyData[dateStr]++;
                }
            }
        });

        return dailyData;
    }

    /**
     * 週別完了率を集計（過去4週間）
     */
    function getWeeklyCompletionRate() {
        const tasks = window.TaskManager ? window.TaskManager.getTasks() : [];
        const today = new Date();
        const weeklyData = {};

        // 過去4週間の週番号を初期化
        for (let i = 3; i >= 0; i--) {
            const weekStart = new Date(today);
            weekStart.setDate(today.getDate() - (i * 7) - today.getDay());
            const weekLabel = `${weekStart.getMonth() + 1}/${weekStart.getDate()}～`;
            weeklyData[weekLabel] = { completed: 0, total: 0 };
        }

        // 週ごとにタスクを集計
        const weekLabels = Object.keys(weeklyData);
        tasks.forEach(task => {
            const createdDate = new Date(task.createdAt || Date.now());
            const weekIndex = Math.floor((today - createdDate) / (7 * 24 * 60 * 60 * 1000));

            if (weekIndex >= 0 && weekIndex < 4) {
                const label = weekLabels[3 - weekIndex];
                if (label) {
                    weeklyData[label].total++;
                    if (task.completed) {
                        weeklyData[label].completed++;
                    }
                }
            }
        });

        // 完了率をパーセンテージに変換
        const weeklyRates = {};
        Object.keys(weeklyData).forEach(week => {
            const data = weeklyData[week];
            weeklyRates[week] = data.total > 0
                ? Math.round((data.completed / data.total) * 100)
                : 0;
        });

        return weeklyRates;
    }

    /**
     * 月別タスク統計を集計（過去6ヶ月）
     */
    function getMonthlyStats() {
        const tasks = window.TaskManager ? window.TaskManager.getTasks() : [];
        const today = new Date();
        const monthlyData = {};

        // 過去6ヶ月を初期化
        for (let i = 5; i >= 0; i--) {
            const monthDate = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const monthLabel = `${monthDate.getFullYear()}/${monthDate.getMonth() + 1}月`;
            monthlyData[monthLabel] = { completed: 0, total: 0 };
        }

        // 月ごとにタスクを集計
        tasks.forEach(task => {
            const createdDate = new Date(task.createdAt || Date.now());
            const monthLabel = `${createdDate.getFullYear()}/${createdDate.getMonth() + 1}月`;

            if (monthlyData.hasOwnProperty(monthLabel)) {
                monthlyData[monthLabel].total++;
                if (task.completed) {
                    monthlyData[monthLabel].completed++;
                }
            }
        });

        return monthlyData;
    }

    /**
     * 日別完了タスク数グラフを描画
     */
    function renderDailyChart() {
        const canvas = document.getElementById('dailyTasksChart');
        if (!canvas) return;

        const dailyData = getDailyCompletedTasks();
        const labels = Object.keys(dailyData).map(date => {
            const d = new Date(date);
            return `${d.getMonth() + 1}/${d.getDate()}`;
        });
        const data = Object.values(dailyData);

        // 既存のグラフを破棄
        if (dailyChart) {
            dailyChart.destroy();
        }

        // 新しいグラフを作成
        const ctx = canvas.getContext('2d');
        dailyChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: '完了タスク数',
                    data: data,
                    backgroundColor: 'rgba(75, 192, 192, 0.6)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    }
                }
            }
        });
    }

    /**
     * 週別完了率グラフを描画
     */
    function renderWeeklyChart() {
        const canvas = document.getElementById('weeklyCompletionChart');
        if (!canvas) return;

        const weeklyData = getWeeklyCompletionRate();
        const labels = Object.keys(weeklyData);
        const data = Object.values(weeklyData);

        // 既存のグラフを破棄
        if (weeklyChart) {
            weeklyChart.destroy();
        }

        // 新しいグラフを作成
        const ctx = canvas.getContext('2d');
        weeklyChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: '完了率 (%)',
                    data: data,
                    backgroundColor: 'rgba(153, 102, 255, 0.2)',
                    borderColor: 'rgba(153, 102, 255, 1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    }
                }
            }
        });
    }

    /**
     * 月別統計グラフを描画
     */
    function renderMonthlyChart() {
        const canvas = document.getElementById('monthlyStatsChart');
        if (!canvas) return;

        const monthlyData = getMonthlyStats();
        const labels = Object.keys(monthlyData);
        const completedData = labels.map(month => monthlyData[month].completed);
        const totalData = labels.map(month => monthlyData[month].total);

        // 既存のグラフを破棄
        if (monthlyChart) {
            monthlyChart.destroy();
        }

        // 新しいグラフを作成
        const ctx = canvas.getContext('2d');
        monthlyChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: '完了タスク',
                        data: completedData,
                        backgroundColor: 'rgba(54, 162, 235, 0.6)',
                        borderColor: 'rgba(54, 162, 235, 1)',
                        borderWidth: 1
                    },
                    {
                        label: '総タスク',
                        data: totalData,
                        backgroundColor: 'rgba(255, 206, 86, 0.6)',
                        borderColor: 'rgba(255, 206, 86, 1)',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    }
                }
            }
        });
    }

    /**
     * すべてのグラフを描画
     */
    function renderAllCharts() {
        renderDailyChart();
        renderWeeklyChart();
        renderMonthlyChart();
    }

    /**
     * グラフを更新
     */
    function updateCharts() {
        renderAllCharts();
    }

    // 初期化処理
    function init() {
        // DOM の準備ができたらグラフを描画
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', renderAllCharts);
        } else {
            renderAllCharts();
        }

        // タスク更新時にグラフも更新
        document.addEventListener('tasksUpdated', updateCharts);
    }

    // グローバルに公開
    window.ChartsManager = {
        renderAllCharts: renderAllCharts,
        updateCharts: updateCharts
    };

    // 初期化を実行
    init();
})();
