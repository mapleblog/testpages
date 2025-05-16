// 留言板功能模块
document.addEventListener('DOMContentLoaded', function() {
    // Firebase 配置已在 features.js 中初始化
    
    // 初始化留言板功能
    initMessageBoard();
    
    function initMessageBoard() {
        const messageForm = document.getElementById('message-form');
        const messageList = document.getElementById('message-list');
        const messageNameInput = document.getElementById('message-name');
        const messageTextInput = document.getElementById('message-text');
        
        // 加载保存的留言
        loadMessages();
        
        // 提交留言
        messageForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = messageNameInput.value.trim();
            const text = messageTextInput.value.trim();
            
            if (!name) {
                alert('请输入您的昵称');
                return;
            }
            
            if (!text) {
                alert('请输入留言内容');
                return;
            }
            
            const message = {
                id: Date.now(),
                author: name,
                text: text,
                time: new Date().toLocaleString()
            };
            
            addMessage(message);
            saveMessages();
            
            // 重置表单
            messageTextInput.value = '';
        });
        
        // 添加留言到列表
        function addMessage(message) {
            const messageElement = document.createElement('div');
            messageElement.classList.add('message-item');
            messageElement.dataset.id = message.id;
            
            messageElement.innerHTML = `
                <div class="message-header">
                    <span class="message-author">${escapeHtml(message.author)}</span>
                    <span class="message-time">${message.time}</span>
                </div>
                <div class="message-text">${escapeHtml(message.text)}</div>
                <div class="message-actions">
                    <button class="delete-message-button" title="删除">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            
            // 添加删除功能
            const deleteButton = messageElement.querySelector('.delete-message-button');
            deleteButton.addEventListener('click', function() {
                if (confirm('确定要删除这条留言吗？')) {
                    const id = messageElement.dataset.id;
                    const messages = getMessages().filter(m => m.id != id);
                    saveMessagesToStorage(messages);
                    messageElement.remove();
                }
            });
            
            // 添加到列表开头
            messageList.insertBefore(messageElement, messageList.firstChild);
        }
        
        // 从存储中加载留言
        function loadMessages() {
            const messages = getMessages();
            
            // 清空当前列表
            messageList.innerHTML = '';
            
            // 按时间倒序添加留言
            messages.sort((a, b) => b.id - a.id).forEach(message => {
                addMessage(message);
            });
        }
        
        // 获取所有留言
        function getMessages() {
            // 尝试从 Firebase 获取数据
            if (typeof firebase !== 'undefined' && firebase.apps.length > 0) {
                // 这里应该实现从 Firebase 获取数据的逻辑
                // 由于异步问题，这里先使用本地存储
                return getMessagesFromStorage();
            } else {
                // 从本地存储获取
                return getMessagesFromStorage();
            }
        }
        
        // 从本地存储获取留言
        function getMessagesFromStorage() {
            const messagesJson = localStorage.getItem('messages');
            return messagesJson ? JSON.parse(messagesJson) : [];
        }
        
        // 保存留言
        function saveMessages() {
            const messages = getMessages();
            const newMessage = {
                id: Date.now(),
                author: messageNameInput.value.trim(),
                text: messageTextInput.value.trim(),
                time: new Date().toLocaleString()
            };
            
            messages.push(newMessage);
            saveMessagesToStorage(messages);
            
            // 如果 Firebase 可用，也保存到 Firebase
            if (typeof firebase !== 'undefined' && firebase.apps.length > 0) {
                try {
                    const db = firebase.database();
                    db.ref('messages').set(messages)
                        .then(() => console.log('留言已保存到 Firebase'))
                        .catch(error => {
                            console.error('保存到 Firebase 失败:', error);
                            // 如果 Firebase 保存失败，确保本地存储已更新
                            saveMessagesToStorage(messages);
                        });
                } catch (error) {
                    console.error('Firebase 操作失败:', error);
                }
            }
        }
        
        // 保存留言到本地存储
        function saveMessagesToStorage(messages) {
            localStorage.setItem('messages', JSON.stringify(messages));
        }
    }
    
    // HTML 转义函数，防止 XSS 攻击
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
});
