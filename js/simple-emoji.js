/**
 * 简单表情功能模块
 * 支持在留言板中添加表情反应
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('初始化简单表情功能模块');
    
    // 表情选项
    const emojiList = [
        { emoji: '👍', name: 'thumbs_up', label: '赞' },
        { emoji: '❤️', name: 'heart', label: '爱心' },
        { emoji: '😄', name: 'smile', label: '笑脸' },
        { emoji: '😮', name: 'wow', label: '哇' },
        { emoji: '😢', name: 'sad', label: '难过' },
        { emoji: '👏', name: 'clap', label: '鼓掌' }
    ];
    
    // 设备ID
    let deviceId = localStorage.getItem('device_id');
    if (!deviceId) {
        deviceId = 'device_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('device_id', deviceId);
    }
    
    /**
     * 初始化表情功能
     */
    function initEmojis(itemType, itemId, container) {
        console.log(`初始化表情功能: ${itemType}/${itemId}`);
        
        // 创建表情容器
        const emojiContainer = document.createElement('div');
        emojiContainer.className = 'emoji-reactions-container';
        emojiContainer.dataset.itemType = itemType;
        emojiContainer.dataset.itemId = itemId;
        
        // 添加所有表情按钮
        emojiList.forEach(item => {
            const button = document.createElement('button');
            button.className = 'emoji-button';
            button.innerHTML = item.emoji;
            button.title = item.label;
            button.dataset.emoji = item.name;
            
            // 添加点击事件
            button.addEventListener('click', function() {
                toggleEmoji(itemType, itemId, item.name, this);
            });
            
            emojiContainer.appendChild(button);
        });
        
        // 添加到容器
        container.appendChild(emojiContainer);
        
        // 加载当前状态
        loadEmojiState(itemType, itemId, emojiContainer);
        
        return emojiContainer;
    }
    
    /**
     * 切换表情状态
     */
    function toggleEmoji(itemType, itemId, emojiName, button) {
        if (!firebase || !firebase.database) {
            console.error('Firebase未初始化');
            return;
        }
        
        const db = firebase.database();
        const path = `emojis/${itemType}/${itemId}/${emojiName}/${deviceId}`;
        
        // 检查当前状态
        db.ref(path).once('value', snapshot => {
            const exists = snapshot.exists();
            
            if (exists) {
                // 如果已存在，则移除
                db.ref(path).remove()
                    .then(() => {
                        console.log(`移除表情: ${emojiName}`);
                        button.classList.remove('active');
                    })
                    .catch(error => {
                        console.error('移除表情失败:', error);
                    });
            } else {
                // 如果不存在，则添加
                db.ref(path).set({
                    timestamp: firebase.database.ServerValue.TIMESTAMP
                })
                    .then(() => {
                        console.log(`添加表情: ${emojiName}`);
                        button.classList.add('active');
                        button.classList.add('just-clicked');
                        setTimeout(() => {
                            button.classList.remove('just-clicked');
                        }, 500);
                    })
                    .catch(error => {
                        console.error('添加表情失败:', error);
                    });
            }
        });
    }
    
    /**
     * 加载表情状态
     */
    function loadEmojiState(itemType, itemId, container) {
        if (!firebase || !firebase.database) {
            console.error('Firebase未初始化');
            return;
        }
        
        const db = firebase.database();
        const basePath = `emojis/${itemType}/${itemId}`;
        
        // 监听表情变化
        db.ref(basePath).on('value', snapshot => {
            const data = snapshot.val() || {};
            
            // 更新所有表情按钮状态
            emojiList.forEach(item => {
                const emojiData = data[item.name] || {};
                
                // 检查是否有任何设备点击了该表情
                const hasAnyReaction = Object.keys(emojiData).length > 0;
                
                // 检查当前设备是否点击了该表情
                const isActiveOnThisDevice = emojiData[deviceId] !== undefined;
                
                const button = container.querySelector(`button[data-emoji="${item.name}"]`);
                if (button) {
                    // 如果有任何设备点击了该表情，则显示为激活状态
                    if (hasAnyReaction) {
                        button.classList.add('active');
                        
                        // 如果当前设备也点击了，添加额外的类
                        if (isActiveOnThisDevice) {
                            button.classList.add('active-by-me');
                        } else {
                            button.classList.remove('active-by-me');
                        }
                    } else {
                        button.classList.remove('active');
                        button.classList.remove('active-by-me');
                    }
                }
            });
        });
    }
    
    // 导出公共API
    window.SimpleEmojiModule = {
        initEmojis: initEmojis
    };
    
    console.log('简单表情功能模块初始化完成');
});
