// 留言板功能模块
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM加载完成，初始化留言板');
    
    // 获取DOM元素
    const messageForm = document.getElementById('message-form');
    const messageList = document.getElementById('message-list');
    const messageNameInput = document.getElementById('message-name');
    const messageTextInput = document.getElementById('message-text');
    const savedMessage = document.getElementById('saved-message');
    
    console.log('留言列表元素:', messageList);
    
    // 当前正在编辑的留言ID
    let editingMessageId = null;
    
    // 从本地存储加载昵称
    if (localStorage.getItem('userName')) {
        messageNameInput.value = localStorage.getItem('userName');
    }
    
    // 尝试从 Firebase 加载留言
    loadMessagesFromFirebase();
    
    // 加载留言
    loadMessages();
    
    // 提交留言表单事件
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
        
        // 保存用户昵称
        localStorage.setItem('userName', name);
        
        // 创建新留言对象
        const message = {
            id: Date.now(),
            author: name,
            text: text,
            time: new Date().toLocaleString()
        };
        
        console.log('创建新留言:', message);
        
        // 保存留言
        saveMessage(message);
        
        // 重置表单
        messageTextInput.value = '';
        
        // 显示成功消息
        if (savedMessage) {
            savedMessage.textContent = '留言发送成功！';
            savedMessage.style.opacity = 1;
            
            setTimeout(function() {
                savedMessage.style.opacity = 0;
            }, 2000);
        }
    });
    
    // 加载所有留言
    function loadMessages() {
        console.log('加载留言');
        
        // 清空留言列表
        if (messageList) {
            messageList.innerHTML = '';
        } else {
            console.error('留言列表元素不存在');
            return;
        }
        
        // 先尝试从 Firebase 加载留言
        loadMessagesFromFirebase();
        
        // 从本地存储加载留言
        const messages = getMessagesFromStorage();
        
        if (messages.length === 0) {
            messageList.innerHTML = '';
            return;
        }
        
        // 按创建时间降序排序
        messages.sort((a, b) => b.id - a.id);
        
        // 显示留言
        displayMessages(messages);
    }
    
    // 从本地存储加载留言并显示
    function loadMessagesFromLocalStorage() {
        try {
            // 尝试从本地存储获取留言
            const savedMessages = localStorage.getItem('messages');
            console.log('本地存储中的留言:', savedMessages);
            
            let messages = [];
            if (savedMessages) {
                messages = JSON.parse(savedMessages);
            }
            
            // 按创建时间降序排序
            messages.sort((a, b) => b.id - a.id);
            
            displayMessages(messages);
        } catch (error) {
            console.error('解析本地留言数据出错:', error);
            displayMessages([]);
        }
    }
    
    // 显示留言列表
    function displayMessages(messages) {
        // 如果没有留言，不显示任何内容
        if (!messages || messages.length === 0) {
            messageList.innerHTML = '';
            return;
        }
        
        console.log(`显示 ${messages.length} 条留言`);
        
        // 按时间倒序排序
        messages.sort((a, b) => b.id - a.id);
        
        // 显示留言
        messages.forEach(function(message) {
            const messageElement = createMessageElement(message);
            messageList.appendChild(messageElement);
        });
    }
    
    // 创建留言元素
    function createMessageElement(message) {
        console.log('创建留言元素:', message);
        
        const messageElement = document.createElement('div');
        messageElement.className = 'message-item';
        messageElement.dataset.id = message.id;
        
        updateMessageElementContent(messageElement, message);
        
        // 添加表情反应功能
        if (window.ReactionsModule && !messageElement.querySelector('.reactions-container')) {
            window.ReactionsModule.initReactions('MESSAGE', message.id, messageElement);
        }
        
        return messageElement;
    }
    
    // 更新留言元素内容
    function updateMessageElementContent(messageElement, message) {
        // 保存表情反应容器（如果存在）
        const reactionsContainer = messageElement.querySelector('.reactions-container');
        
        // 检查是否处于编辑模式
        if (editingMessageId === message.id) {
            messageElement.classList.add('editing');
            
            // 保存原始的背景色和旋转角度
            const computedStyle = window.getComputedStyle(messageElement);
            const originalBg = computedStyle.backgroundColor;
            const originalTransform = computedStyle.transform;
            
            messageElement.innerHTML = `
                <div class="message-header">
                    <span class="message-author">${escapeHtml(message.author)}</span>
                    <span class="message-time">${message.time}${message.edited ? ' (已编辑)' : ''}</span>
                </div>
                <textarea class="message-content-edit">${escapeHtml(message.text)}</textarea>
                <div class="message-actions">
                    <button class="message-button save-message-button" title="保存">
                        <i class="fas fa-check"></i> 保存
                    </button>
                    <button class="message-button cancel-message-button" title="取消">
                        <i class="fas fa-times"></i> 取消
                    </button>
                </div>
            `;
            
            // 获取编辑区域并聚焦
            const editArea = messageElement.querySelector('.message-content-edit');
            if (editArea) {
                // 设置背景色为稍暗一点，以区分编辑状态
                editArea.style.backgroundColor = adjustColor(originalBg, -10);
                
                setTimeout(() => {
                    editArea.focus();
                    // 将光标移到文本末尾
                    editArea.selectionStart = editArea.selectionEnd = editArea.value.length;
                }, 50);
                
                // 添加回车键保存功能（Ctrl+Enter）
                editArea.addEventListener('keydown', function(e) {
                    if (e.ctrlKey && e.key === 'Enter') {
                        saveEditedMessage(message.id, editArea.value);
                        e.preventDefault();
                    } else if (e.key === 'Escape') {
                        cancelEdit();
                        e.preventDefault();
                    }
                });
            }
            
            // 添加保存按钮事件
            const saveButton = messageElement.querySelector('.save-message-button');
            if (saveButton) {
                saveButton.addEventListener('click', function() {
                    const editArea = messageElement.querySelector('.message-content-edit');
                    if (editArea) {
                        saveEditedMessage(message.id, editArea.value);
                    }
                });
            }
            
            // 添加取消按钮事件
            const cancelButton = messageElement.querySelector('.cancel-message-button');
            if (cancelButton) {
                cancelButton.addEventListener('click', function() {
                    cancelEdit();
                });
            }
        } else {
            // 非编辑模式，显示正常内容
            messageElement.innerHTML = `
                <div class="message-header">
                    <span class="message-author">${escapeHtml(message.author)}</span>
                    <span class="message-time">${message.time}${message.edited ? ' (已编辑)' : ''}</span>
                </div>
                <div class="message-content">${escapeHtml(message.text)}</div>
                <div class="message-actions">
                    <button class="message-button edit-message-button" title="编辑">
                        <i class="fas fa-edit"></i> 编辑
                    </button>
                    <button class="message-button delete-message-button" title="删除">
                        <i class="fas fa-trash"></i> 删除
                    </button>
                </div>
            `;
            
            // 如果之前有表情反应容器，重新添加
            if (reactionsContainer) {
                messageElement.appendChild(reactionsContainer);
            }
            // 如果没有表情反应容器且ReactionsModule可用，初始化表情反应
            else if (window.ReactionsModule && !messageElement.querySelector('.reactions-container')) {
                window.ReactionsModule.initReactions('MESSAGE', message.id, messageElement);
            }
            
            // 添加编辑按钮事件
            const editButton = messageElement.querySelector('.edit-message-button');
            if (editButton) {
                editButton.addEventListener('click', function() {
                    startEdit(message.id);
                });
            }
            
            // 添加删除按钮事件
            const deleteButton = messageElement.querySelector('.delete-message-button');
            if (deleteButton) {
                deleteButton.addEventListener('click', function() {
                    if (confirm('确定要删除这条留言吗？')) {
                        deleteMessage(message.id);
                    }
                });
            }
            
            // 添加点击留言即可编辑的功能
            const messageContent = messageElement.querySelector('.message-content');
            if (messageContent) {
                messageContent.addEventListener('dblclick', function() {
                    startEdit(message.id);
                });
            }
        }
    }
    
    // 取消编辑
    function cancelEdit() {
        if (editingMessageId) {
            console.log('取消编辑留言:', editingMessageId);
            
            // 重置编辑状态
            editingMessageId = null;
            
            // 重新加载留言
            loadMessages();
        }
    }
    
    // 开始编辑留言
    function startEdit(messageId) {
        console.log('开始编辑留言:', messageId);
        
        // 设置当前正在编辑的留言ID
        editingMessageId = messageId;
        
        // 重新加载留言，以显示编辑界面
        loadMessages();
    }
    
    // 保存编辑后的留言
    function saveEditedMessage(messageId, newText) {
        console.log('保存编辑后的留言:', messageId, newText);
        
        if (!newText.trim()) {
            alert('留言内容不能为空');
            return;
        }
        
        // 获取所有留言
        const messages = getMessagesFromStorage();
        
        // 查找要编辑的留言
        const messageIndex = messages.findIndex(m => m.id == messageId);
        
        if (messageIndex !== -1) {
            // 更新留言内容
            messages[messageIndex].text = newText.trim();
            messages[messageIndex].edited = true;
            
            // 保存留言
            saveMessagesToStorage(messages);
            
            // 保存到Firebase
            saveMessagesToFirebase(messages);
            
            // 重置编辑状态
            editingMessageId = null;
            
            // 重新加载留言
            loadMessages();
            
            // 显示成功消息
            if (savedMessage) {
                savedMessage.textContent = '留言已更新！';
                savedMessage.style.opacity = 1;
                
                setTimeout(function() {
                    savedMessage.style.opacity = 0;
                }, 2000);
            }
        }
    }
    
    // 保存留言
    function saveMessage(message) {
        // 获取已有留言
        const messages = getMessagesFromStorage();
        
        // 添加新留言
        messages.push(message);
        
        // 保存留言
        saveMessagesToStorage(messages);
        
        // 保存到Firebase
        saveMessagesToFirebase(messages);
        
        // 重新加载留言
        loadMessages();
    }
    
    // 删除留言
    function deleteMessage(id) {
        console.log('删除留言:', id);
        
        // 获取所有留言
        const messages = getMessagesFromStorage();
        
        // 过滤掉要删除的留言
        const filteredMessages = messages.filter(message => message.id != id);
        
        // 保存留言
        saveMessagesToStorage(filteredMessages);
        
        // 保存到Firebase
        saveMessagesToFirebase(filteredMessages);
        
        // 重新加载留言
        loadMessages();
        
        // 显示成功消息
        if (savedMessage) {
            savedMessage.textContent = '留言已删除！';
            savedMessage.style.opacity = 1;
            
            setTimeout(function() {
                savedMessage.style.opacity = 0;
            }, 2000);
        }
    }
    
    // 获取所有留言
    function getMessages() {
        return getMessagesFromStorage();
    }
    
    // 从本地存储获取留言
    function getMessagesFromStorage() {
        const messagesJson = localStorage.getItem('messages');
        return messagesJson ? JSON.parse(messagesJson) : [];
    }
    
    // 保存留言到本地存储
    function saveMessagesToStorage(messages) {
        localStorage.setItem('messages', JSON.stringify(messages));
    }
    
    // 保存留言到Firebase
    function saveMessagesToFirebase(messages) {
        try {
            if (typeof firebase !== 'undefined' && firebase.apps.length > 0) {
                const db = firebase.database();
                db.ref('messages').set(messages)
                    .then(() => console.log('留言已保存到 Firebase'))
                    .catch(error => console.error('保存到 Firebase 失败:', error));
            }
        } catch (error) {
            console.error('Firebase 操作失败:', error);
        }
    }
    
    // 从Firebase加载留言
    function loadMessagesFromFirebase() {
        try {
            if (typeof firebase !== 'undefined' && firebase.apps.length > 0) {
                console.log('尝试从 Firebase 加载留言');
                
                const db = firebase.database();
                db.ref('messages').once('value')
                    .then(snapshot => {
                        const firebaseMessages = snapshot.val();
                        
                        if (firebaseMessages) {
                            console.log('从 Firebase 加载到留言:', firebaseMessages.length);
                            
                            // 保存到本地存储
                            saveMessagesToStorage(firebaseMessages);
                            
                            // 显示留言
                            displayMessages(firebaseMessages);
                        } else {
                            console.log('Firebase 中没有留言数据');
                            // 从本地存储加载
                            loadMessagesFromLocalStorage();
                        }
                    })
                    .catch(error => {
                        console.error('从 Firebase 加载留言失败:', error);
                        // 从本地存储加载
                        loadMessagesFromLocalStorage();
                    });
            } else {
                console.log('Firebase 未初始化，从本地存储加载');
                // 从本地存储加载
                loadMessagesFromLocalStorage();
            }
        } catch (error) {
            console.error('Firebase 操作失败:', error);
            // 从本地存储加载
            loadMessagesFromLocalStorage();
        }
    }
    
    // 调整颜色亮度的辅助函数
    function adjustColor(color, amount) {
        // 处理rgba格式
        const rgba = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
        if (rgba) {
            let r = parseInt(rgba[1]);
            let g = parseInt(rgba[2]);
            let b = parseInt(rgba[3]);
            let a = rgba[4] ? parseFloat(rgba[4]) : 1;
            
            r = Math.max(0, Math.min(255, r + amount));
            g = Math.max(0, Math.min(255, g + amount));
            b = Math.max(0, Math.min(255, b + amount));
            
            return `rgba(${r}, ${g}, ${b}, ${a})`;
        }
        
        // 处理十六进制格式
        let hex = color.replace('#', '');
        
        // 将3位颜色扩展为6位
        if (hex.length === 3) {
            hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
        }
        
        // 转换为RGB
        let r = parseInt(hex.substr(0, 2), 16);
        let g = parseInt(hex.substr(2, 2), 16);
        let b = parseInt(hex.substr(4, 2), 16);
        
        // 调整亮度
        r = Math.max(0, Math.min(255, r + amount));
        g = Math.max(0, Math.min(255, g + amount));
        b = Math.max(0, Math.min(255, b + amount));
        
        // 转回十六进制
        return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
    }
    
    // HTML转义函数
    function escapeHtml(text) {
        return text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
});
