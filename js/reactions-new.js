/**
 * 表情反应功能模块
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('初始化表情反应功能');
    
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
            
            // 检查是否有用户ID
            let userId = 'anonymous';
            if (window.FirebaseAuthModule && window.FirebaseAuthModule.userId) {
                userId = window.FirebaseAuthModule.userId;
            }
            
            const db = firebase.database();
            
            // 保存到两个路径：
            // 1. 公共路径 - 所有用户可见
            const publicPath = `reactions/${itemType}/${itemId}`;
            // 2. 用户特定路径 - 用于同步用户的反应
            const userPath = `user_reactions/${userId}/${itemType}_${itemId}`;
            
            console.log(`正在将数据写入Firebase路径: ${publicPath} 和 ${userPath}`);
            
            // 同时保存到两个路径
            Promise.all([
                db.ref(publicPath).set(reactions),
                db.ref(userPath).set(reactions)
            ])
                .then(() => {
                    console.log(`✅ 表情反应已成功保存到Firebase`);
                    resolve();
                })
                .catch(error => {
                    console.error(`❌ 保存表情反应到Firebase失败:`, error);
                    reject(error);
                });
        } catch (error) {
            console.error('Firebase操作失败:', error);
            reject(error);
        }
    });
}

/**
 * 设u7f6eu5b9eu65f6u6570u636eu76d1u542c
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
        const publicPath = `reactions/${itemType}/${itemId}`;
        
        console.log(`正在设置实时监听Firebase路径: ${publicPath}`);
        
        // 监听公共数据变化
        db.ref(publicPath).on('value', snapshot => {
            console.log(`检测到Firebase公共数据变化: ${publicPath}`);
            const firebaseReactions = snapshot.val() || {};
            const storageKey = getStorageKey(itemType, itemId);
            
            // 更新本地存储
            saveReactionsToStorage(storageKey, firebaseReactions);
            
            // 更新UI
            updateReactionButtons(container, firebaseReactions, storageKey);
            console.log(`✅ 已更新表情反应UI(公共): ${itemType}/${itemId}`);
        }, error => {
            console.error(`监听Firebase公共数据变化失败: ${publicPath}`, error);
        });
        
        // 如果有用户ID，也监听用户特定数据
        if (window.FirebaseAuthModule && window.FirebaseAuthModule.userId) {
            const userId = window.FirebaseAuthModule.userId;
            const userPath = `user_reactions/${userId}/${itemType}_${itemId}`;
            
            console.log(`正在设置实时监听用户特定路径: ${userPath}`);
            
            db.ref(userPath).on('value', snapshot => {
                console.log(`检测到Firebase用户数据变化: ${userPath}`);
                const userReactions = snapshot.val();
                
                if (userReactions) {
                    const storageKey = getStorageKey(itemType, itemId);
                    
                    // 更新本地存储
                    saveReactionsToStorage(storageKey, userReactions);
                    
                    // 更新UI
                    updateReactionButtons(container, userReactions, storageKey);
                    console.log(`✅ 已更新表情反应UI(用户): ${itemType}/${itemId}`);
                    
                    // 同步到公共路径
                    db.ref(publicPath).set(userReactions)
                        .then(() => console.log(`✅ 用户数据已同步到公共路径: ${publicPath}`))
                        .catch(error => console.error(`同步用户数据到公共路径失败: ${publicPath}`, error));
                }
            }, error => {
                console.error(`监听Firebase用户数据变化失败: ${userPath}`, error);
            });
        }
        
        console.log(`✅ 实时监听设置成功: ${itemType}/${itemId}`);
    } catch (error) {
        console.error('设置实时监听失败:', error);
    }
}
    window.ReactionsModule = {
        initReactions,
        loadReactionsFromFirebase,
        updateReactionButtons
    };
});
