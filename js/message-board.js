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
        loadMessagesFromFirebase()
            .then(firebaseMessages => {
                if (firebaseMessages && firebaseMessages.length > 0) {
                    // 如果成功从 Firebase 加载，则使用 Firebase 数据并更新本地存储
                    console.log(`从 Firebase 加载了 ${firebaseMessages.length} 条留言`);
                    saveMessagesToStorage(firebaseMessages);
                    displayMessages(firebaseMessages);
                } else {
                    // 如果 Firebase 没有数据，则使用本地存储
                    loadMessagesFromLocalStorage();
                }
            })
            .catch(error => {
                console.error('从 Firebase 加载留言失败:', error);
                // 发生错误时，回退到本地存储
                loadMessagesFromLocalStorage();
            });
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
        
        return messageElement;
    }
    
    // 更新留言元素内容
    function updateMessageElementContent(messageElement, message) {
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
                    saveEditedMessage(message.id, editArea.value);
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
            // 正常显示模式
            messageElement.classList.remove('editing');
            
            // 显示编辑状态
            const editedInfo = message.edited ? '<span class="edited-info">(已编辑)</span>' : '';
            
            messageElement.innerHTML = `
                <div class="message-header">
                    <span class="message-author">${escapeHtml(message.author)}</span>
                    <span class="message-time">${message.time} ${editedInfo}</span>
                </div>
                <div class="message-content">${escapeHtml(message.text)}</div>
                <div class="message-actions">
                    <button class="message-button edit-message-button" title="编辑">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="message-button delete-message-button" title="删除">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            
            // 添加编辑按钮事件
            const editButton = messageElement.querySelector('.edit-message-button');
            if (editButton) {
                editButton.addEventListener('click', function(e) {
                    e.stopPropagation(); // 防止事件冒泡
                    startEdit(message.id);
                });
            }
            
            // 添加删除按钮事件
            const deleteButton = messageElement.querySelector('.delete-message-button');
            if (deleteButton) {
                deleteButton.addEventListener('click', function(e) {
                    e.stopPropagation(); // 防止事件冒泡
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
        if (color.startsWith('#')) {
            let hex = color.substring(1);
            if (hex.length === 3) {
                hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
            }
            
            const r = parseInt(hex.substring(0, 2), 16);
            const g = parseInt(hex.substring(2, 4), 16);
            const b = parseInt(hex.substring(4, 6), 16);
            
            const newR = Math.max(0, Math.min(255, r + amount));
            const newG = Math.max(0, Math.min(255, g + amount));
            const newB = Math.max(0, Math.min(255, b + amount));
            
            return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
        }
        
        return color; // 如果不能解析颜色，返回原始颜色
    }
    
    // 开始编辑留言
    function startEdit(messageId) {
        console.log('开始编辑留言:', messageId);
        
        // 如果有其他留言正在编辑，先取消
        if (editingMessageId && editingMessageId !== messageId) {
            cancelEdit();
        }
        
        // 设置当前编辑的留言ID
        editingMessageId = messageId;
        
        // 获取留言数据
        const messages = getMessages();
        const message = messages.find(m => m.id == messageId);
        
        if (message) {
            // 获取留言元素并更新为编辑模式
            const messageElement = document.querySelector(`.message-item[data-id="${messageId}"]`);
            if (messageElement) {
                updateMessageElementContent(messageElement, message);
            }
        }
    }
    
        
        // 添加删除按钮事件
        const deleteButton = messageElement.querySelector('.delete-message-button');
        if (deleteButton) {
            deleteButton.addEventListener('click', function(e) {
                e.stopPropagation(); // 防止事件冒泡
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
    if (color.startsWith('#')) {
        let hex = color.substring(1);
        if (hex.length === 3) {
            hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
        }
        
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        
        const newR = Math.max(0, Math.min(255, r + amount));
        const newG = Math.max(0, Math.min(255, g + amount));
        const newB = Math.max(0, Math.min(255, b + amount));
        
        return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
    }
    
    return color; // 如果不能解析颜色，返回原始颜色
}

// 开始编辑留言
function startEdit(messageId) {
    console.log('开始编辑留言:', messageId);
    
    // 如果有其他留言正在编辑，先取消
    if (editingMessageId && editingMessageId !== messageId) {
        cancelEdit();
    }
    
    // 设置当前编辑的留言ID
    editingMessageId = messageId;
    
    // 获取留言数据
    const messages = getMessages();
    const message = messages.find(m => m.id == messageId);
    
    if (message) {
        // 获取留言元素并更新为编辑模式
        const messageElement = document.querySelector(`.message-item[data-id="${messageId}"]`);
        if (messageElement) {
            updateMessageElementContent(messageElement, message);
        }
    }
}

// 保存编辑后的留言
function saveEditedMessage(messageId, newText) {
    console.log('保存编辑后的留言:', messageId, newText);
    
    // 获取所有留言
    let messages = getMessages();
    
    // 找到要编辑的留言
    const messageIndex = messages.findIndex(message => message.id == messageId);
    
    if (messageIndex !== -1) {
        // 更新留言内容
        messages[messageIndex].text = newText.trim();
        messages[messageIndex].edited = true;
        
        // 保存到本地存储
        saveMessagesToStorage(messages);
        
        // 更新Firebase中的特定留言
        try {
            if (typeof firebase !== 'undefined' && firebase.apps.length > 0) {
                const db = firebase.database();
                db.ref(`messages/${messageId}`).update({
                    text: newText.trim(),
                    edited: true
                })
                .then(() => console.log('留言已在Firebase中更新'))
                .catch(error => console.error('在Firebase中更新失败:', error));
            }
        } catch (error) {
            console.error('Firebase操作失败:', error);
        }
        
        // 退出编辑模式
        editingMessageId = null;
        
        // 重新加载留言
    }
    
    // 保存留言
    function saveMessage(message) {
        console.log('保存留言:', message);
        
        // 获取现有留言
        let messages = [];
        
        try {
            const savedMessages = localStorage.getItem('messages');
            if (savedMessages) {
                messages = JSON.parse(savedMessages);
            }
        } catch (error) {
            console.error('解析留言数据出错:', error);
        }
        
        // 添加新留言
        messages.push(message);
        
        // 保存到本地存储
        saveMessagesToStorage(messages);
        
        // 尝试保存到Firebase (只保存这一条新留言)
        const singleMessageObj = {};
        singleMessageObj[message.id] = message;
        try {
            if (typeof firebase !== 'undefined' && firebase.apps.length > 0) {
                const db = firebase.database();
                db.ref('messages').update(singleMessageObj)
                    .then(() => console.log('新留言已保存到Firebase'))
                    .catch(error => console.error('保存到Firebase失败:', error));
            }
        } catch (error) {
            console.error('Firebase操作失败:', error);
        }
        
        // 重新加载留言
        displayMessages(messages);
    }
    
    // 删除留言
    function deleteMessage(id) {
        console.log('删除留言:', id);
        
        // 获取现有留言
        let messages = getMessages();
        
        // 过滤掉要删除的留言
        messages = messages.filter(message => message.id != id);
        
        // 保存到本地存储
        saveMessagesToStorage(messages);
        
        // 从Firebase中删除该留言
        try {
            if (typeof firebase !== 'undefined' && firebase.apps.length > 0) {
                const db = firebase.database();
                db.ref(`messages/${id}`).remove()
                    .then(() => console.log('留言已从Firebase删除'))
                    .catch(error => console.error('从Firebase删除失败:', error));
            }
        } catch (error) {
            console.error('Firebase操作失败:', error);
        }
        
        // 重新加载留言
        displayMessages(messages);
        
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
                
                // 创建一个以消息ID为键的对象，而不是使用数组
                const messagesObject = {};
                messages.forEach(message => {
                    messagesObject[message.id] = message;
                });
                
                // 使用 update 而不是 set，这样不会覆盖其他设备的数据
                db.ref('messages').update(messagesObject)
                    .then(() => console.log('留言已保存到Firebase'))
                    .catch(error => console.error('保存到Firebase失败:', error));
            }
        } catch (error) {
            console.error('Firebase操作失败:', error);
        }
    }
    
    // 从Firebase加载留言
    function loadMessagesFromFirebase() {
        return new Promise((resolve, reject) => {
            try {
                if (typeof firebase !== 'undefined' && firebase.apps.length > 0) {
                    const db = firebase.database();
                    db.ref('messages').once('value')
                        .then(snapshot => {
                            const data = snapshot.val();
                            if (data) {
                                // 将对象格式转换回数组格式
                                const messagesArray = Object.values(data);
                                resolve(messagesArray);
                            } else {
                                resolve([]);
                            }
                        })
                        .catch(error => {
                            console.error('从Firebase读取数据失败:', error);
                            reject(error);
                        });
                } else {
                    resolve([]);
                }
            } catch (error) {
                console.error('Firebase操作失败:', error);
                reject(error);
            }
        });
    }
    
    // HTML转义函数
    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
});
