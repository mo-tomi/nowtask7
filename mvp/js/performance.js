/**
 * パフォーマンス最適化
 * 大量タスク時のレンダリング最適化、キャッシング、デバウンス処理
 */

(function() {
    'use strict';

    // キャッシュ
    let taskCache = null;
    let lastCacheUpdate = 0;
    const CACHE_DURATION = 1000; // 1秒

    /**
     * デバウンス関数
     * 連続した呼び出しを制限し、最後の呼び出しのみを実行
     * @param {Function} func - 実行する関数
     * @param {number} wait - 待機時間（ミリ秒）
     * @returns {Function} デバウンスされた関数
     */
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * スロットル関数
     * 一定時間内に1回のみ実行
     * @param {Function} func - 実行する関数
     * @param {number} limit - 制限時間（ミリ秒）
     * @returns {Function} スロットルされた関数
     */
    function throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    /**
     * タスクデータをキャッシュから取得
     * @param {boolean} forceRefresh - 強制的に再取得
     * @returns {Array} タスクの配列
     */
    function getCachedTasks(forceRefresh = false) {
        const now = Date.now();

        if (forceRefresh || !taskCache || (now - lastCacheUpdate) > CACHE_DURATION) {
            taskCache = loadFromLocalStorage(STORAGE_KEYS.TASKS, []);
            lastCacheUpdate = now;
        }

        return taskCache;
    }

    /**
     * キャッシュを無効化
     */
    function invalidateCache() {
        taskCache = null;
        lastCacheUpdate = 0;
    }

    /**
     * DocumentFragment を使った効率的な DOM 更新
     * @param {HTMLElement} container - コンテナ要素
     * @param {Array} elements - 追加する要素の配列
     */
    function efficientDOMUpdate(container, elements) {
        if (!container || !elements || elements.length === 0) {
            return;
        }

        // DocumentFragment を使用して一度に DOM に追加
        const fragment = document.createDocumentFragment();
        elements.forEach(element => {
            if (element instanceof Node) {
                fragment.appendChild(element);
            }
        });

        // 既存の内容をクリアして新しい内容を追加
        container.innerHTML = '';
        container.appendChild(fragment);
    }

    /**
     * 配列を指定サイズのチャンクに分割
     * @param {Array} array - 分割する配列
     * @param {number} chunkSize - チャンクサイズ
     * @returns {Array} チャンクの配列
     */
    function chunkArray(array, chunkSize) {
        const chunks = [];
        for (let i = 0; i < array.length; i += chunkSize) {
            chunks.push(array.slice(i, i + chunkSize));
        }
        return chunks;
    }

    /**
     * バッチレンダリング（大量タスクを分割して描画）
     * @param {Array} tasks - タスクの配列
     * @param {HTMLElement} container - コンテナ要素
     * @param {Function} renderFunction - レンダリング関数
     */
    function batchRender(tasks, container, renderFunction) {
        if (!container || !renderFunction) {
            return;
        }

        // タスクが少ない場合は通常レンダリング
        if (tasks.length < 100) {
            renderFunction(tasks, container);
            return;
        }

        // 100件ずつに分割
        const chunks = chunkArray(tasks, 100);
        let currentIndex = 0;

        container.innerHTML = '<div class="loading">読み込み中...</div>';

        function renderNextChunk() {
            if (currentIndex >= chunks.length) {
                return;
            }

            const chunk = chunks[currentIndex];

            if (currentIndex === 0) {
                container.innerHTML = '';
            }

            chunk.forEach(task => {
                const element = createTaskElement(task);
                container.appendChild(element);
            });

            currentIndex++;

            // 次のチャンクを非同期で描画
            if (currentIndex < chunks.length) {
                requestAnimationFrame(renderNextChunk);
            } else {
                // すべて描画完了後の処理
                if (typeof attachTaskEventListeners === 'function') {
                    attachTaskEventListeners();
                }
            }
        }

        renderNextChunk();
    }

    /**
     * ローカルストレージのデータを圧縮して保存
     * @param {string} key - ストレージキー
     * @param {*} data - 保存するデータ
     */
    function compressAndSave(key, data) {
        try {
            // 不要なプロパティを削除して圧縮
            const compressedData = compressData(data);
            saveToLocalStorage(key, compressedData);
        } catch (error) {
            console.error('データ圧縮エラー:', error);
            // 圧縮失敗時は通常保存
            saveToLocalStorage(key, data);
        }
    }

    /**
     * データを圧縮（不要なプロパティを削除）
     * @param {*} data - 圧縮するデータ
     * @returns {*} 圧縮されたデータ
     */
    function compressData(data) {
        if (Array.isArray(data)) {
            return data.map(item => compressData(item));
        }

        if (typeof data === 'object' && data !== null) {
            const compressed = {};
            for (const key in data) {
                // null や undefined は除外
                if (data[key] !== null && data[key] !== undefined && data[key] !== '') {
                    compressed[key] = compressData(data[key]);
                }
            }
            return compressed;
        }

        return data;
    }

    /**
     * メモリ使用量を監視
     * @returns {Object} メモリ情報
     */
    function getMemoryInfo() {
        if (performance.memory) {
            return {
                usedJSHeapSize: (performance.memory.usedJSHeapSize / 1048576).toFixed(2) + ' MB',
                totalJSHeapSize: (performance.memory.totalJSHeapSize / 1048576).toFixed(2) + ' MB',
                jsHeapSizeLimit: (performance.memory.jsHeapSizeLimit / 1048576).toFixed(2) + ' MB'
            };
        }
        return null;
    }

    /**
     * ローカルストレージの使用量を取得
     * @returns {string} 使用量（KB単位）
     */
    function getLocalStorageSize() {
        let total = 0;
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                total += localStorage[key].length + key.length;
            }
        }
        return (total / 1024).toFixed(2) + ' KB';
    }

    /**
     * パフォーマンス情報をコンソールに出力
     */
    function logPerformanceInfo() {
        console.group('パフォーマンス情報');

        const memoryInfo = getMemoryInfo();
        if (memoryInfo) {
            console.log('メモリ使用量:', memoryInfo.usedJSHeapSize);
            console.log('メモリ合計:', memoryInfo.totalJSHeapSize);
        }

        console.log('ローカルストレージ使用量:', getLocalStorageSize());

        const tasks = getCachedTasks();
        console.log('タスク数:', tasks.length);

        console.groupEnd();
    }

    /**
     * DOM要素の遅延読み込み（Intersection Observer使用）
     * @param {string} selector - 監視する要素のセレクタ
     * @param {Function} callback - 要素が表示されたときのコールバック
     */
    function lazyLoad(selector, callback) {
        if (!('IntersectionObserver' in window)) {
            // Intersection Observerがサポートされていない場合は即座に実行
            document.querySelectorAll(selector).forEach(callback);
            return;
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    callback(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, {
            rootMargin: '50px'
        });

        document.querySelectorAll(selector).forEach(element => {
            observer.observe(element);
        });
    }

    /**
     * イベントリスナーの最適化（イベント委譲）
     * @param {HTMLElement} container - コンテナ要素
     * @param {string} eventType - イベントタイプ
     * @param {string} selector - セレクタ
     * @param {Function} handler - ハンドラ関数
     */
    function delegateEvent(container, eventType, selector, handler) {
        if (!container) return;

        container.addEventListener(eventType, (e) => {
            const target = e.target.closest(selector);
            if (target) {
                handler.call(target, e);
            }
        });
    }

    // グローバルに公開
    window.PerformanceOptimizer = {
        debounce: debounce,
        throttle: throttle,
        getCachedTasks: getCachedTasks,
        invalidateCache: invalidateCache,
        efficientDOMUpdate: efficientDOMUpdate,
        batchRender: batchRender,
        compressAndSave: compressAndSave,
        getMemoryInfo: getMemoryInfo,
        getLocalStorageSize: getLocalStorageSize,
        logPerformanceInfo: logPerformanceInfo,
        lazyLoad: lazyLoad,
        delegateEvent: delegateEvent
    };

    // タスク更新時にキャッシュを無効化
    document.addEventListener('tasksUpdated', invalidateCache);

    // デバッグモード時にパフォーマンス情報を出力
    if (window.location.search.includes('debug=true')) {
        setTimeout(logPerformanceInfo, 2000);
    }

    console.log('パフォーマンス最適化モジュールを初期化しました');
})();
