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
        
        // 获取已有的表情反应数据
        const storageKey = getStorageKey(itemType, itemId);
        const reactions = getReactionsFromStorage(storageKey);
        
        // 创建各种表情按钮
        Object.keys(reactionTypes).forEach(reactionType => {
            const { icon, label } = reactionTypes[reactionType];
            const count = reactions[reactionType] || 0;
            
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
            reactionsContainer.appendChild(reactionButton);
        });
        
        // 添加到父容器
        container.appendChild(reactionsContainer);
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
        
        // 不再更新显示数量，只有点击效果
        
        // 保存到存储
        saveReactionsToStorage(storageKey, reactions);
        
        // 如果Firebase可用，保存到Firebase
        saveReactionsToFirebase(itemType, itemId, reactions);
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
     */
    function saveReactionsToFirebase(itemType, itemId, reactions) {
        try {
            if (typeof firebase !== 'undefined' && firebase.apps.length > 0) {
                const db = firebase.database();
                const path = `reactions/${itemType}/${itemId}`;
                
                db.ref(path).set(reactions)
                    .then(() => console.log(`表情反应已保存到 Firebase: ${path}`))
                    .catch(error => console.error('保存表情反应到 Firebase 失败:', error));
            }
        } catch (error) {
            console.error('Firebase 操作失败:', error);
        }
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
                if (typeof firebase !== 'undefined' && firebase.apps.length > 0) {
                    const db = firebase.database();
                    const path = `reactions/${itemType}/${itemId}`;
                    
                    db.ref(path).once('value')
                        .then(snapshot => {
                            const reactions = snapshot.val() || {};
                            resolve(reactions);
                        })
                        .catch(error => {
                            console.error('从 Firebase 加载表情反应失败:', error);
                            reject(error);
                        });
                } else {
                    resolve({});
                }
            } catch (error) {
                console.error('Firebase 操作失败:', error);
                resolve({});
            }
        });
    }
    
    // 导出公共API
    window.ReactionsModule = {
        initReactions,
        loadReactionsFromFirebase
    };
});
