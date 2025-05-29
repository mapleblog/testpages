/**
 * 表情反应功能模块 - 跨设备同步版本
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('初始化表情反应功能 - 跨设备同步版本');
    
    // 表情反应配置
    const reactionTypes = {
        'like': { icon: 'fa-thumbs-up', label: '赞' },
        'love': { icon: 'fa-heart', label: '爱' },
        'haha': { icon: 'fa-laugh', label: '哈哈' },
        'wow': { icon: 'fa-surprise', label: '哇' },
        'sad': { icon: 'fa-sad-tear', label: '伤心' }
    };
    
    // 存储表情反应的键名前缀
    const STORAGE_KEYS = {
        MESSAGE: 'message_reactions_',
        MOOD: 'mood_reactions_',
        WISH: 'wish_reactions_'
    };
    
    /**
     * 初始化表情反应功能
     * @param {string} itemType - 项目类型：'message', 'mood', 'wish'
     * @param {string} itemId - 项目ID
     * @param {HTMLElement} container - 放置表情反应的容器
     */
    function initReactions(itemType, itemId, container) {
        // 创建表情反应容器
        const reactionsContainer = document.createElement('div');
        reactionsContainer.className = 'reactions-container';
        reactionsContainer.dataset.itemType = itemType;
        reactionsContainer.dataset.itemId = itemId;
        
        // 首先从本地存储获取数据
        const storageKey = getStorageKey(itemType, itemId);
        const reactions = getReactionsFromStorage(storageKey);
        
        // 创建各种表情按钮
        createReactionButtons(reactionsContainer, reactions, storageKey, itemType, itemId);
        
        // 添加到父容器
        container.appendChild(reactionsContainer);
        
        // 从Firebase加载最新数据并更新UI
        loadReactionsFromFirebase(itemType, itemId).then(firebaseReactions => {
            if (firebaseReactions && Object.keys(firebaseReactions).length > 0) {
                // 如果从Firebase获取到数据，更新到本地存储
                saveReactionsToStorage(storageKey, firebaseReactions);
                
                // 重新创建按钮以反映最新数据
                updateReactionButtons(reactionsContainer, firebaseReactions, storageKey);
            }
        }).catch(error => {
            console.error('从Firebase加载表情反应失败:', error);
        });
        
        // 设置实时监听
        setupRealtimeListener(itemType, itemId, reactionsContainer);
    }
    
    /**
     * 创建表情反应按钮
     * @param {HTMLElement} container - 表情反应容器
     * @param {Object} reactions - 表情反应数据
     * @param {string} storageKey - 存储键名
     * @param {string} itemType - 项目类型
     * @param {string} itemId - 项目ID
     */
    function createReactionButtons(container, reactions, storageKey, itemType, itemId) {
        // 清空容器
        container.innerHTML = '';
        
        // 创建各种表情按钮
        Object.keys(reactionTypes).forEach(reactionType => {
            const { icon } = reactionTypes[reactionType];
            
            // 创建表情按钮
            const reactionButton = document.createElement('div');
            reactionButton.className = 'reaction-button';
            reactionButton.dataset.reaction = reactionType;
            reactionButton.dataset.itemId = itemId;
            reactionButton.dataset.itemType = itemType;
            
            // 如果用户已点击过此表情，添加active类
            if (hasUserReacted(storageKey, reactionType)) {
                reactionButton.classList.add('active');
            }
            
            // 设置按钮内容 - 只显示图标
            reactionButton.innerHTML = `
                <i class="fas ${icon}"></i>
            `;
            
            // 添加点击事件
            reactionButton.addEventListener('click', handleReactionClick);
            
            // 添加到容器
            container.appendChild(reactionButton);
        });
    }
    
    /**
     * 更新表情反应按钮状态
     * @param {HTMLElement} container - 表情反应容器
     * @param {Object} reactions - 表情反应数据
     * @param {string} storageKey - 存储键名
     */
    function updateReactionButtons(container, reactions, storageKey) {
        // 获取所有表情按钮
        const buttons = container.querySelectorAll('.reaction-button');
        
        // 更新每个按钮的状态
        buttons.forEach(button => {
            const reactionType = button.dataset.reaction;
            
            // 更新激活状态
            if (hasUserReacted(storageKey, reactionType)) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });
    }
    
    /**
     * 处理表情按钮点击事件
     * @param {Event} event - 点击事件
     */
    function handleReactionClick(event) {
        const button = event.currentTarget;
        const reactionType = button.dataset.reaction;
        const itemId = button.dataset.itemId;
        const itemType = button.dataset.itemType;
        const storageKey = getStorageKey(itemType, itemId);
        
        // 获取当前反应数据
        const reactions = getReactionsFromStorage(storageKey);
        
        // 检查用户是否已经点击过此表情
        const hasReacted = hasUserReacted(storageKey, reactionType);
        
        // 更新反应数据
        if (hasReacted) {
            // 如果已点击，则取消
            reactions[reactionType] = Math.max(0, (reactions[reactionType] || 0) - 1);
            removeUserReaction(storageKey, reactionType);
            button.classList.remove('active');
        } else {
            // 如果未点击，则添加
            reactions[reactionType] = (reactions[reactionType] || 0) + 1;
            addUserReaction(storageKey, reactionType);
            button.classList.add('active');
            
            // 添加点击动画
            button.classList.add('just-clicked');
            setTimeout(() => {
                button.classList.remove('just-clicked');
            }, 300);
        }
        
        // 保存到存储
        saveReactionsToStorage(storageKey, reactions);
        
        // 保存到Firebase，确保跨设备同步
        saveReactionsToFirebase(itemType, itemId, reactions)
            .then(() => {
                console.log(`表情反应已同步到Firebase: ${itemType}/${itemId}`);
            })
            .catch(error => {
                console.error('同步表情反应到Firebase失败:', error);
            });
    }
    
    /**
     * 获取存储键名
     * @param {string} itemType - 项目类型
     * @param {string} itemId - 项目ID
     * @returns {string} 存储键名
     */
    function getStorageKey(itemType, itemId) {
        const prefix = STORAGE_KEYS[itemType.toUpperCase()];
        return prefix + itemId;
    }
    
    /**
     * 从存储中获取表情反应数据
     * @param {string} storageKey - 存储键名
     * @returns {Object} 表情反应数据
     */
    function getReactionsFromStorage(storageKey) {
        const reactionsJson = localStorage.getItem(storageKey);
        return reactionsJson ? JSON.parse(reactionsJson) : {};
    }
    
    /**
     * 保存表情反应数据到存储
     * @param {string} storageKey - 存储键名
     * @param {Object} reactions - 表情反应数据
     */
    function saveReactionsToStorage(storageKey, reactions) {
        localStorage.setItem(storageKey, JSON.stringify(reactions));
    }
    
    /**
     * 检查用户是否已点击过某表情
     * @param {string} storageKey - 存储键名
     * @param {string} reactionType - 表情类型
     * @returns {boolean} 是否已点击
     */
    function hasUserReacted(storageKey, reactionType) {
        const userReactionsKey = 'user_' + storageKey;
        const userReactions = localStorage.getItem(userReactionsKey);
        if (!userReactions) return false;
        
        const reactionsArray = JSON.parse(userReactions);
        return reactionsArray.includes(reactionType);
    }
    
    /**
     * 添加用户表情反应记录
     * @param {string} storageKey - 存储键名
     * @param {string} reactionType - 表情类型
     */
    function addUserReaction(storageKey, reactionType) {
        const userReactionsKey = 'user_' + storageKey;
        const userReactions = localStorage.getItem(userReactionsKey);
        
        let reactionsArray = [];
        if (userReactions) {
            reactionsArray = JSON.parse(userReactions);
        }
        
        if (!reactionsArray.includes(reactionType)) {
            reactionsArray.push(reactionType);
        }
        
        localStorage.setItem(userReactionsKey, JSON.stringify(reactionsArray));
    }
    
    /**
     * 移除用户表情反应记录
     * @param {string} storageKey - 存储键名
     * @param {string} reactionType - 表情类型
     */
    function removeUserReaction(storageKey, reactionType) {
        const userReactionsKey = 'user_' + storageKey;
        const userReactions = localStorage.getItem(userReactionsKey);
        
        if (!userReactions) return;
        
        let reactionsArray = JSON.parse(userReactions);
        reactionsArray = reactionsArray.filter(type => type !== reactionType);
        
        localStorage.setItem(userReactionsKey, JSON.stringify(reactionsArray));
    }
    
    /**
     * 保存表情反应到Firebase
     * @param {string} itemType - 项目类型
     * @param {string} itemId - 项目ID
     * @param {Object} reactions - 表情反应数据
     * @returns {Promise} - 返回一个Promise对象
     */
    function saveReactionsToFirebase(itemType, itemId, reactions) {
        return new Promise((resolve, reject) => {
            try {
                console.log(`尝试保存表情反应到Firebase: ${itemType}/${itemId}`, reactions);
                
                if (typeof firebase === 'undefined') {
                    console.error('Firebase SDK未加载，无法保存表情反应');
                    reject(new Error('Firebase SDK未加载'));
                    return;
                }
                
                if (firebase.apps.length === 0) {
                    console.error('Firebase未初始化，无法保存表情反应');
                    reject(new Error('Firebase未初始化'));
                    return;
                }
                
                // 获取设备ID或用户ID
                let deviceId = localStorage.getItem('device_id');
                if (!deviceId) {
                    deviceId = 'device_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                    localStorage.setItem('device_id', deviceId);
                }
                
                const db = firebase.database();
                
                // 保存到多个路径以确保跨设备同步
                const paths = [
                    // 1. 公共路径 - 所有设备共享
                    `reactions/${itemType}/${itemId}`,
                    // 2. 设备特定路径 - 用于跟踪此设备的反应
                    `device_reactions/${deviceId}/${itemType}_${itemId}`
                ];
                
                // 创建所有保存操作的Promise数组
                const savePromises = paths.map(path => {
                    console.log(`正在保存数据到路径: ${path}`);
                    return db.ref(path).set(reactions);
                });
                
                // 等待所有保存操作完成
                Promise.all(savePromises)
                    .then(() => {
                        console.log(`✅ 表情反应已成功保存到所有路径`);
                        resolve();
                    })
                    .catch(error => {
                        console.error(`❌ 保存表情反应失败:`, error);
                        reject(error);
                    });
            } catch (error) {
                console.error('Firebase操作失败:', error);
                reject(error);
            }
        });
    }
    
    /**
     * 从Firebase加载表情反应
     * @param {string} itemType - 项目类型
     * @param {string} itemId - 项目ID
     * @returns {Promise<Object>} 表情反应数据
     */
    function loadReactionsFromFirebase(itemType, itemId) {
        return new Promise((resolve, reject) => {
            try {
                console.log(`尝试从Firebase加载表情反应: ${itemType}/${itemId}`);
                
                if (typeof firebase === 'undefined') {
                    console.error('Firebase SDK未加载，无法加载表情反应');
                    resolve({});
                    return;
                }
                
                if (firebase.apps.length === 0) {
                    console.error('Firebase未初始化，无法加载表情反应');
                    resolve({});
                    return;
                }
                
                const db = firebase.database();
                const path = `reactions/${itemType}/${itemId}`;
                
                console.log(`正在从Firebase路径读取数据: ${path}`);
                
                db.ref(path).once('value')
                    .then(snapshot => {
                        const reactions = snapshot.val() || {};
                        console.log(`✅ 从Firebase成功加载表情反应: ${path}`, reactions);
                        resolve(reactions);
                    })
                    .catch(error => {
                        console.error(`❌ 从Firebase加载表情反应失败: ${path}`, error);
                        reject(error);
                    });
            } catch (error) {
                console.error('Firebase操作失败:', error);
                resolve({});
            }
        });
    }
    
    /**
     * 设置实时数据监听
     * @param {string} itemType - 项目类型
     * @param {string} itemId - 项目ID
     * @param {HTMLElement} container - 表情反应容器
     */
    function setupRealtimeListener(itemType, itemId, container) {
        try {
            console.log(`尝试设置实时监听: ${itemType}/${itemId}`);
            
            if (typeof firebase === 'undefined') {
                console.error('Firebase SDK未加载，无法设置实时监听');
                return;
            }
            
            if (firebase.apps.length === 0) {
                console.error('Firebase未初始化，无法设置实时监听');
                return;
            }
            
            const db = firebase.database();
            const path = `reactions/${itemType}/${itemId}`;
            
            console.log(`正在设置实时监听Firebase路径: ${path}`);
            
            // 监听数据变化
            db.ref(path).on('value', snapshot => {
                console.log(`检测到Firebase数据变化: ${path}`);
                const firebaseReactions = snapshot.val() || {};
                const storageKey = getStorageKey(itemType, itemId);
                
                // 更新本地存储
                saveReactionsToStorage(storageKey, firebaseReactions);
                
                // 更新UI
                updateReactionButtons(container, firebaseReactions, storageKey);
                console.log(`✅ 已更新表情反应UI: ${itemType}/${itemId}`);
            }, error => {
                console.error(`监听Firebase数据变化失败: ${path}`, error);
            });
            
            // 获取设备ID
            const deviceId = localStorage.getItem('device_id');
            if (deviceId) {
                const devicePath = `device_reactions/${deviceId}/${itemType}_${itemId}`;
                
                // 监听设备特定数据变化
                db.ref(devicePath).on('value', snapshot => {
                    console.log(`检测到设备特定数据变化: ${devicePath}`);
                    const deviceReactions = snapshot.val();
                    
                    if (deviceReactions) {
                        // 同步到公共路径
                        db.ref(path).set(deviceReactions)
                            .then(() => console.log(`✅ 设备数据已同步到公共路径: ${path}`))
                            .catch(error => console.error(`同步设备数据到公共路径失败: ${path}`, error));
                    }
                }, error => {
                    console.error(`监听设备特定数据变化失败: ${devicePath}`, error);
                });
            }
            
            console.log(`✅ 实时监听设置成功: ${path}`);
        } catch (error) {
            console.error('设置实时监听失败:', error);
        }
    }
    
    // 导出公共API
    window.ReactionsModule = {
        initReactions,
        loadReactionsFromFirebase,
        updateReactionButtons
    };
});
