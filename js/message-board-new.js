// u7559u8a00u677fu529fu80fdu6a21u5757
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOMu52a0u8f7du5b8cu6210uff0cu521du59cbu5316u7559u8a00u677f');
    
    // u83b7u53d6DOMu5143u7d20
    const messageForm = document.getElementById('message-form');
    const messageList = document.getElementById('message-list');
    const messageNameInput = document.getElementById('message-name');
    const messageTextInput = document.getElementById('message-text');
    const savedMessage = document.getElementById('saved-message');
    
    console.log('u7559u8a00u5217u8868u5143u7d20:', messageList);
    
    // u5f53u524du6b63u5728u7f16u8f91u7684u7559u8a00ID
    let editingMessageId = null;
    
    // u4eceFirebaseu52a0u8f7du7559u8a00
    loadMessagesFromFirebase();
    
    // u52a0u8f7du7559u8a00
    loadMessages();
    
    // u4eceLocalStorageu52a0u8f7du7528u6237u540du79f0
    if (localStorage.getItem('userName')) {
        messageNameInput.value = localStorage.getItem('userName');
    }
    
    // u63d0u4ea4u7559u8a00u8868u5355u4e8bu4ef6
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
        
        // u4fdd u5b58u7528u6237u6635u79f0
        localStorage.setItem('userName', name);
        
        if (editingMessageId) {
            // u66f4u65b0u5df2u6709u7559u8a00
            updateMessage(editingMessageId, text);
        } else {
            // u521bu5efau65b0u7559u8a00
            const message = {
                id: Date.now(),
                author: name,
                text: text,
                time: new Date().toLocaleString(),
                createdAt: Date.now()
            };
            
            saveMessage(message);
        }
        
        // u91cdu7f6eu8868u5355
        messageTextInput.value = '';
        
        // u663eu793au6210u529fu6d88u606f
        if (savedMessage) {
            savedMessage.textContent = '留言发送成功！';
            savedMessage.style.opacity = 1;
            
            setTimeout(function() {
                savedMessage.style.opacity = 0;
            }, 2000);
        }
    });
    
    // u52a0u8f7du6240u6709u7559u8a00
    function loadMessages() {
        console.log('u52a0u8f7du7559u8a00');
        
        // u6e05u7a7au7559u8a00u5217u8868
        if (messageList) {
            messageList.innerHTML = '';
        } else {
            console.error('u7559u8a00u5217u8868u5143u7d20u4e0du5b58u5728');
            return;
        }
        
        // u83b7u53d6u4fdd u5b58u7684u7559u8a00
        const messages = getMessages();
        
        if (messages.length === 0) {
            messageList.innerHTML = '';
            return;
        }
        
        // u6309u521bu5efau65f6u95f4u964du5e8fu6392u5e8f
        messages.sort((a, b) => b.createdAt - a.createdAt);
        
        // u663eu793au7559u8a00
        messages.forEach(function(message) {
            const messageElement = createMessageElement(message);
            messageList.appendChild(messageElement); // 按照排序顺序添加留言
        });
    }
    
    // u521bu5efau7559u8a00u5143u7d20
    function createMessageElement(message) {
        const messageElement = document.createElement('div');
        messageElement.className = 'message-item';
        messageElement.dataset.id = message.id;
        
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
        
        // u6dfbu52a0u7f16u8f91u6309u94aeu4e8bu4ef6
        const editButton = messageElement.querySelector('.edit-message-button');
        if (editButton) {
            editButton.addEventListener('click', function() {
                startEdit(message.id);
            });
        }
        
        // u6dfbu52a0u5220u9664u6309u94aeu4e8bu4ef6
        const deleteButton = messageElement.querySelector('.delete-message-button');
        if (deleteButton) {
            deleteButton.addEventListener('click', function() {
                if (confirm('确定要删除这条留言吗？')) {
                    deleteMessage(message.id);
                }
            });
        }
        
        return messageElement;
    }
    
    // u5f00u59cbu7f16u8f91u7559u8a00
    function startEdit(messageId) {
        console.log('u5f00u59cbu7f16u8f91u7559u8a00:', messageId);
        
        // u83b7u53d6u7559u8a00u6570u636e
        const messages = getMessages();
        const message = messages.find(m => m.id == messageId);
        
        if (message) {
            // u8bbeu7f6eu5f53u524du7f16u8f91u7684u7559u8a00ID
            editingMessageId = messageId;
            
            // u586bu5145u8868u5355
            messageTextInput.value = message.text;
            messageTextInput.focus();
            
            // u66f4u6539u63d0u4ea4u6309u94aeu6587u5b57
            const submitButton = messageForm.querySelector('button[type="submit"]');
            if (submitButton) {
                submitButton.textContent = 'u66f4u65b0u7559u8a00';
            }
        }
    }
    
    // u66f4u65b0u7559u8a00
    function updateMessage(messageId, newText) {
        console.log('u66f4u65b0u7559u8a00:', messageId, newText);
        
        // u83b7u53d6u6240u6709u7559u8a00
        const messages = getMessages();
        
        // u627eu5230u8981u7f16u8f91u7684u7559u8a00
        const messageIndex = messages.findIndex(message => message.id == messageId);
        
        if (messageIndex !== -1) {
            // u66f4u65b0u7559u8a00u5185u5bb9
            messages[messageIndex].text = newText.trim();
            messages[messageIndex].edited = true;
            messages[messageIndex].time = new Date().toLocaleString();
            
            // u4fdd u5b58u5230u672cu5730u5b58u50a8
            localStorage.setItem('messages', JSON.stringify(messages));
            
            // u4fdd u5b58u5230Firebase
            saveMessagesToFirebase(messages);
            
            // u91cdu65b0u52a0u8f7du7559u8a00
            loadMessages();
            
            // u91cdu7f6eu7f16u8f91u72b6u6001
            editingMessageId = null;
            
            // u91cdu7f6eu63d0u4ea4u6309u94aeu6587u5b57
            const submitButton = messageForm.querySelector('button[type="submit"]');
            if (submitButton) {
                submitButton.textContent = 'u53d1u9001';
            }
            
            // u663eu793au6210u529fu6d88u606f
            if (savedMessage) {
                savedMessage.textContent = 'u7559u8a00u66f4u65b0u6210u529fuff01';
                savedMessage.style.opacity = 1;
                
                setTimeout(function() {
                    savedMessage.style.opacity = 0;
                }, 2000);
            }
        }
    }
    
    // u5220u9664u7559u8a00
    function deleteMessage(messageId) {
        console.log('u5220u9664u7559u8a00:', messageId);
        
        // u83b7u53d6u73b0u6709u7559u8a00
        const messages = getMessages();
        
        // u8fc7u6ee4u6389u8981u5220u9664u7684u7559u8a00
        const filteredMessages = messages.filter(message => message.id != messageId);
        
        // u4fdd u5b58u5230u672cu5730u5b58u50a8
        localStorage.setItem('messages', JSON.stringify(filteredMessages));
        
        // u4fdd u5b58u5230Firebase
        saveMessagesToFirebase(filteredMessages);
        
        // u91cdu65b0u52a0u8f7du7559u8a00
        loadMessages();
        
        // u663eu793au6210u529fu6d88u606f
        if (savedMessage) {
            savedMessage.textContent = '留言已删除！';
            savedMessage.style.opacity = 1;
            
            setTimeout(function() {
                savedMessage.style.opacity = 0;
            }, 2000);
        }
    }
    
    // u4fdd u5b58u7559u8a00
    function saveMessage(message) {
        console.log('u4fdd u5b58u7559u8a00:', message);
        
        // u83b7u53d6u73b0u6709u7559u8a00
        const messages = getMessages();
        
        // 添加新留言到数组开头，确保最新留言在最前面
        messages.unshift(message);
        
        // u4fdd u5b58u5230u672cu5730u5b58u50a8
        localStorage.setItem('messages', JSON.stringify(messages));
        
        // u4fdd u5b58u5230Firebase
        saveMessagesToFirebase(messages);
        
        // u91cdu65b0u52a0u8f7du7559u8a00
        loadMessages();
    }
    
    // u83b7u53d6u6240u6709u7559u8a00
    function getMessages() {
        const messagesJson = localStorage.getItem('messages');
        return messagesJson ? JSON.parse(messagesJson) : [];
    }
    
    // u4eceFirebaseu52a0u8f7du7559u8a00
    function loadMessagesFromFirebase() {
        try {
            if (typeof firebase !== 'undefined' && firebase.apps.length > 0) {
                const db = firebase.database();
                db.ref('messages').once('value')
                    .then(snapshot => {
                        const firebaseMessages = snapshot.val();
                        if (firebaseMessages) {
                            // u5c06Firebaseu6570u636eu4fdd u5b58u5230u672cu5730u5b58u50a8
                            localStorage.setItem('messages', JSON.stringify(firebaseMessages));
                            console.log('u4eceFirebaseu52a0u8f7du7559u8a00u6210u529f');
                            // u91cdu65b0u52a0u8f7du7559u8a00
                            loadMessages();
                        }
                    })
                    .catch(error => console.error('u4eceFirebaseu52a0u8f7du7559u8a00u5931u8d25:', error));
            }
        } catch (error) {
            console.error('Firebaseu64cdu4f5cu5931u8d25:', error);
        }
    }
    
    // u4fdd u5b58u7559u8a00u5230Firebase
    function saveMessagesToFirebase(messages) {
        try {
            if (typeof firebase !== 'undefined' && firebase.apps.length > 0) {
                const db = firebase.database();
                db.ref('messages').set(messages)
                    .then(() => console.log('u7559u8a00u5df2u4fdd u5b58u5230Firebase'))
                    .catch(error => console.error('u4fdd u5b58u5230Firebaseu5931u8d25:', error));
            }
        } catch (error) {
            console.error('Firebaseu64cdu4f5cu5931u8d25:', error);
        }
    }
    
    // HTMLu8f6cu4e49u51fdu6570uff0cu9632u6b62XSSu653bu51fb
    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
});
