// 功能模块：互动留言板、心情日记和愿望清单
document.addEventListener('DOMContentLoaded', function() {
    // Firebase 配置
    const firebaseConfig = {
        apiKey: "AIzaSyCxtfRwm3cGObl3D2lbAkwUeGR2LhGT3FQ",
    	authDomain: "daycount-vietnam.firebaseapp.com",
    	databaseURL: "https://daycount-vietnam-default-rtdb.asia-southeast1.firebasedatabase.app",
    	projectId: "daycount-vietnam",
    	storageBucket: "daycount-vietnam.firebasestorage.app",
    	messagingSenderId: "335860361173",
    	appId: "1:335860361173:web:931d891d00085d33083f5c",
    	measurementId: "G-LVPPF0CX2C"
    };
    
    // 初始化 Firebase
    // 注意：在实际使用前需要替换上面的配置信息
    let firebaseInitialized = true;
    let db;
    
    try {
        // 检查 Firebase 是否已加载
        if (typeof firebase !== 'undefined') {
            // 初始化 Firebase
            firebase.initializeApp(firebaseConfig);
            db = firebase.database();
            firebaseInitialized = true;
            console.log('Firebase 初始化成功');
        } else {
            console.warn('Firebase SDK 未加载，将使用本地存储');
        }
    } catch (error) {
        console.error('Firebase 初始化失败:', error);
        console.warn('将使用本地存储作为备选');
    }
    // 初始化功能
    initMessageBoard();
    
    // 标签切换代码已删除，因为现在只有一个功能模块

    // 互动留言板功能
    function initMessageBoard() {
        const messageForm = document.getElementById('message-form');
        const messageList = document.getElementById('message-list');
        const emojiPicker = document.getElementById('emoji-picker');
        const emojiButton = document.getElementById('emoji-button');
        const messageImageInput = document.getElementById('message-image');
        const messageImagePreview = document.getElementById('message-image-preview');
        let messageImageData = null; // 用于存储图片的 base64 数据
        
        // 图片上传和预览
        messageImageInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (!file) return;
            
            // 检查文件类型和大小
            if (!file.type.match('image.*')) {
                alert('请选择图片文件');
                return;
            }
            
            if (file.size > 5 * 1024 * 1024) { // 5MB 限制
                alert('图片大小不能超过 5MB');
                return;
            }
            
            const reader = new FileReader();
            reader.onload = function(e) {
                messageImageData = e.target.result;
                
                // 创建预览
                messageImagePreview.innerHTML = `
                    <div class="preview-container">
                        <img src="${messageImageData}" class="preview-image" alt="预览">
                        <button type="button" class="remove-image" title="移除图片">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                `;
                
                // 添加移除图片的功能
                const removeButton = messageImagePreview.querySelector('.remove-image');
                removeButton.addEventListener('click', function() {
                    messageImagePreview.innerHTML = '';
                    messageImageData = null;
                    messageImageInput.value = ''; // 重置文件输入
                });
            };
            
            reader.readAsDataURL(file);
        });
        
        // 加载保存的留言
        loadMessages();
        
        // 显示/隐藏表情选择器
        emojiButton.addEventListener('click', function(e) {
            e.preventDefault();
            emojiPicker.classList.toggle('active');
        });
        
        // 添加表情到留言
        const emojis = document.querySelectorAll('.emoji');
        emojis.forEach(emoji => {
            emoji.addEventListener('click', function() {
                const messageInput = document.getElementById('message-input');
                messageInput.value += this.textContent;
                emojiPicker.classList.remove('active');
                messageInput.focus();
            });
        });
        
        // 提交留言
        messageForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const messageInput = document.getElementById('message-input');
            const nameInput = document.getElementById('name-input');
            
            if (messageInput.value.trim() === '' && !messageImageData) {
                alert('请输入留言内容或添加图片');
                return;
            }
            
            saveMessages();
            return false;
        });
        
        // 添加留言到列表
        function addMessage(message) {
            const messageElement = document.createElement('div');
            messageElement.classList.add('message-item');
            messageElement.dataset.id = message.id;
            
            // 构建图片HTML（如果有图片）
            let imageHtml = '';
            if (message.image) {
                imageHtml = `
                    <div class="message-image-container">
                        <img src="${message.image}" class="message-image" alt="留言图片" onclick="window.open(this.src, '_blank')">
                    </div>
                `;
            }
            
            messageElement.innerHTML = `
                <div class="message-header">
                    <span class="message-name">${escapeHtml(message.name)}</span>
                    <span class="message-time">${message.time}</span>
                </div>
                <div class="message-content">${formatMessage(message.content)}</div>
                ${imageHtml}
                <div class="message-actions">
                    <button class="like-button" title="点赞">
                        <i class="fas fa-heart"></i> <span class="like-count">${message.likes}</span>
                    </button>
                    <button class="delete-button" title="删除">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            
            // 添加点赞功能
            const likeButton = messageElement.querySelector('.like-button');
            likeButton.addEventListener('click', function() {
                const id = messageElement.dataset.id;
                const messages = getMessages();
                const messageIndex = messages.findIndex(m => m.id == id);
                
                if (messageIndex !== -1) {
                    messages[messageIndex].likes++;
                    messageElement.querySelector('.like-count').textContent = messages[messageIndex].likes;
                    saveMessagesToStorage(messages);
                }
            });
            
            // 添加删除功能
            const deleteButton = messageElement.querySelector('.delete-button');
            deleteButton.addEventListener('click', function() {
                if (confirm('确定要删除这条留言吗？')) {
                    const id = messageElement.dataset.id;
                    const messages = getMessages().filter(m => m.id != id);
                    saveMessagesToStorage(messages);
                    messageElement.remove();
                }
            });
            
            messageList.prepend(messageElement);
        }
        
        // 格式化留言内容（支持简单的表情和格式化）
        function formatMessage(content) {
            // 转义HTML
            let formatted = escapeHtml(content);
            
            // 简单的格式化支持
            formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'); // 加粗
            formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>'); // 斜体
            formatted = formatted.replace(/~~(.*?)~~/g, '<del>$1</del>'); // 删除线
            
            // 将URL转换为链接
            const urlRegex = /(https?:\/\/[^\s]+)/g;
            formatted = formatted.replace(urlRegex, '<a href="$1" target="_blank">$1</a>');
            
            return formatted;
        }
        
        // HTML转义函数
        function escapeHtml(text) {
            const map = {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#039;'
            };
            return text.replace(/[&<>"']/g, m => map[m]);
        }
        
        // 获取保存的留言
        function getMessages() {
            const messagesJSON = localStorage.getItem('messages');
            return messagesJSON ? JSON.parse(messagesJSON) : [];
        }
        
        // 保存留言到存储
        function saveMessagesToStorage(messages) {
            // 保存到本地存储
            try {
                localStorage.setItem('messages', JSON.stringify(messages));
                console.log('留言已保存到本地存储');
            } catch (error) {
                console.error('保存到本地存储失败:', error);
            }
        }
        
        // 保存当前留言列表
        function saveMessages() {
            const messages = getMessages();
            const newMessage = {
                id: Date.now(),
                name: document.getElementById('name-input').value.trim() || '匿名',
                content: document.getElementById('message-input').value,
                time: new Date().toLocaleString(),
                likes: 0
            };
            
            messages.unshift(newMessage); // 将新消息添加到数组开头
            saveMessagesToStorage(messages);
            
            // 清空输入框
            document.getElementById('message-input').value = '';
            document.getElementById('name-input').value = '';
            
            // 重新加载显示
            loadMessages();
        }
        
        // 加载保存的留言
        function loadMessages() {
            try {
                const messages = getMessages();
                // 清空当前列表
                messageList.innerHTML = '';
                // 按时间倒序显示留言
                messages.forEach(message => addMessage(message));
            } catch (error) {
                console.error('加载留言失败:', error);
                messageList.innerHTML = '<div class="error-message">加载留言失败</div>';
            }
        }
    }

    // 心情日记和愿望清单功能已删除
        const moodForm = document.getElementById('mood-form');
        const moodList = document.getElementById('mood-list');
        const moodIcons = document.querySelectorAll('.mood-icon');
        const moodImageInput = document.getElementById('mood-image');
        const moodImagePreview = document.getElementById('mood-image-preview');
        let selectedMood = '';
        let moodImageData = null; // 用于存储图片的 base64 数据
        
        // 图片上传和预览
        moodImageInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (!file) return;
            
            // 检查文件类型和大小
            if (!file.type.match('image.*')) {
                alert('请选择图片文件');
                return;
            }
            
            if (file.size > 5 * 1024 * 1024) { // 5MB 限制
                alert('图片大小不能超过 5MB');
                return;
            }
            
            const reader = new FileReader();
            reader.onload = function(e) {
                moodImageData = e.target.result;
                
                // 创建预览
                moodImagePreview.innerHTML = `
                    <div class="preview-container">
                        <img src="${moodImageData}" class="preview-image" alt="预览">
                        <button type="button" class="remove-image" title="移除图片">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                `;
                
                // 添加移除图片的功能
                const removeButton = moodImagePreview.querySelector('.remove-image');
                removeButton.addEventListener('click', function() {
                    moodImagePreview.innerHTML = '';
                    moodImageData = null;
                    moodImageInput.value = ''; // 重置文件输入
                });
            };
            
            reader.readAsDataURL(file);
        });
        
        // 加载保存的心情记录
        loadMoods();
        
        // 选择心情图标
        moodIcons.forEach(icon => {
            icon.addEventListener('click', function() {
                moodIcons.forEach(i => i.classList.remove('selected'));
                this.classList.add('selected');
                selectedMood = this.dataset.mood;
            });
        });
        
        // 提交心情记录
        moodForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const moodText = document.getElementById('mood-text').value;
            const today = new Date().toISOString().split('T')[0];
            
            if (!selectedMood) {
                alert('请选择一个心情图标');
                return;
            }
            
            // 允许空文本，只要有图片
            if (moodText.trim() === '' && !moodImageData) {
                alert('请输入心情描述或添加图片');
                return;
            }
            
            const mood = {
                id: Date.now(),
                date: today,
                mood: selectedMood,
                text: moodText,
                time: new Date().toLocaleString(),
                image: moodImageData // 添加图片数据
            };
            
            addMood(mood);
            saveMoods();
            
            // 重置表单
            document.getElementById('mood-text').value = '';
            moodIcons.forEach(i => i.classList.remove('selected'));
            selectedMood = '';
            moodImageData = null;
            moodImagePreview.innerHTML = '';
        });
        
        // 添加心情记录到列表
        function addMood(mood) {
            const moodElement = document.createElement('div');
            moodElement.classList.add('mood-item');
            moodElement.dataset.id = mood.id;
            
            // 获取心情图标
            const moodIconClass = getMoodIconClass(mood.mood);
            const moodColor = getMoodColor(mood.mood);
            
            // 构建图片HTML（如果有图片）
            let imageHtml = '';
            if (mood.image) {
                imageHtml = `
                    <div class="mood-image-container">
                        <img src="${mood.image}" class="mood-image" alt="心情图片" onclick="window.open(this.src, '_blank')">
                    </div>
                `;
            }
            
            moodElement.innerHTML = `
                <div class="mood-header">
                    <span class="mood-date">${mood.date}</span>
                    <span class="mood-icon-display" style="${moodColor}">
                        <i class="${moodIconClass}"></i>
                    </span>
                    <span class="mood-time">${mood.time}</span>
                </div>
                <div class="mood-content">${escapeHtml(mood.text)}</div>
                ${imageHtml}
                <div class="mood-actions">
                    <button class="delete-mood-button" title="删除">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            
            // 添加动态效果
            const iconDisplay = moodElement.querySelector('.mood-icon-display');
            iconDisplay.classList.add('animated-mood-icon');
            
            // 添加删除功能
            const deleteButton = moodElement.querySelector('.delete-mood-button');
            deleteButton.addEventListener('click', function() {
                if (confirm('确定要删除这条心情记录吗？')) {
                    const id = moodElement.dataset.id;
                    const moods = getMoods().filter(m => m.id != id);
                    saveMoodsToStorage(moods);
                    moodElement.remove();
                }
            });
            
            moodList.prepend(moodElement);
        }
        
        // 获取心情图标类
        function getMoodIconClass(mood) {
            const moodIcons = {
                'happy': 'fas fa-smile',
                'sad': 'fas fa-frown',
                'angry': 'fas fa-angry',
                'surprised': 'fas fa-surprise',
                'neutral': 'fas fa-meh',
                'love': 'fas fa-heart',
                'tired': 'fas fa-tired'
            };
            
            return moodIcons[mood] || 'fas fa-question';
        }
        
        // 获取心情颜色样式
        function getMoodColor(mood) {
            const moodColors = {
                'happy': 'background: linear-gradient(135deg, #fdcb6e, #e17055); color: #fff; border-radius: 50%; width: 40px; height: 40px; display: flex; justify-content: center; align-items: center;',
                'sad': 'background: linear-gradient(135deg, #74b9ff, #0984e3); color: #fff; border-radius: 50%; width: 40px; height: 40px; display: flex; justify-content: center; align-items: center;',
                'angry': 'background: linear-gradient(135deg, #ff7675, #d63031); color: #fff; border-radius: 50%; width: 40px; height: 40px; display: flex; justify-content: center; align-items: center;',
                'surprised': 'background: linear-gradient(135deg, #a29bfe, #6c5ce7); color: #fff; border-radius: 50%; width: 40px; height: 40px; display: flex; justify-content: center; align-items: center;',
                'neutral': 'background: linear-gradient(135deg, #b2bec3, #636e72); color: #fff; border-radius: 50%; width: 40px; height: 40px; display: flex; justify-content: center; align-items: center;',
                'love': 'background: linear-gradient(135deg, #fd79a8, #e84393); color: #fff; border-radius: 50%; width: 40px; height: 40px; display: flex; justify-content: center; align-items: center;',
                'tired': 'background: linear-gradient(135deg, #dfe6e9, #b2bec3); color: #636e72; border-radius: 50%; width: 40px; height: 40px; display: flex; justify-content: center; align-items: center;'
            };
            
            return moodColors[mood] || 'background: rgba(0, 0, 0, 0.2); color: #fff; border-radius: 50%; width: 40px; height: 40px; display: flex; justify-content: center; align-items: center;';
        }
        
        // HTML转义函数
        function escapeHtml(text) {
            const map = {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#039;'
            };
            return text.replace(/[&<>"']/g, m => map[m]);
        }
        
        // 获取保存的心情记录
        function getMoods() {
            const moodsJSON = localStorage.getItem('moods');
            return moodsJSON ? JSON.parse(moodsJSON) : [];
        }
        
        // 保存心情记录到存储
        function saveMoodsToStorage(moods) {
            // 保存到本地存储
            localStorage.setItem('moods', JSON.stringify(moods));
            
            // 如果 Firebase 已初始化，也保存到 Firebase
            if (firebaseInitialized) {
                try {
                    db.ref('moods').set(moods);
                } catch (error) {
                    console.error('Firebase 保存失败:', error);
                }
            }
        }
        
        // 保存当前心情记录列表
        function saveMoods() {
            const moodElements = document.querySelectorAll('.mood-item');
            const moods = [];
            
            moodElements.forEach(el => {
                const iconElement = el.querySelector('.mood-icon-display i');
                const moodType = getMoodTypeFromClass(iconElement.className);
                
                moods.push({
                    id: el.dataset.id,
                    date: el.querySelector('.mood-date').textContent,
                    mood: moodType,
                    text: el.querySelector('.mood-content').textContent,
                    time: el.querySelector('.mood-time').textContent
                });
            });
            
            saveMoodsToStorage(moods);
        }
        
        // 从类名获取心情类型
        function getMoodTypeFromClass(className) {
            if (className.includes('fa-smile')) return 'happy';
            if (className.includes('fa-frown')) return 'sad';
            if (className.includes('fa-angry')) return 'angry';
            if (className.includes('fa-surprise')) return 'surprised';
            if (className.includes('fa-meh')) return 'neutral';
            if (className.includes('fa-heart')) return 'love';
            if (className.includes('fa-tired')) return 'tired';
            return 'neutral';
        }
        
        // 加载保存的心情记录
        function loadMoods() {
            // 优先从 Firebase 加载
            if (firebaseInitialized) {
                try {
                    db.ref('moods').once('value').then((snapshot) => {
                        const moods = snapshot.val() || [];
                        // 清空当前列表
                        moodList.innerHTML = '';
                        // 添加从 Firebase 获取的心情记录
                        moods.forEach(mood => addMood(mood));
                        // 同步到本地存储
                        localStorage.setItem('moods', JSON.stringify(moods));
                    }).catch(error => {
                        console.error('从 Firebase 加载心情记录失败:', error);
                        // 如果 Firebase 加载失败，从本地加载
                        const moods = getMoods();
                        moods.forEach(mood => addMood(mood));
                    });
                } catch (error) {
                    console.error('Firebase 操作失败:', error);
                    // 从本地加载
                    const moods = getMoods();
                    moods.forEach(mood => addMood(mood));
                }
            } else {
                // 从本地加载
                const moods = getMoods();
                moods.forEach(mood => addMood(mood));
            }
        }
    }

    // 愿望清单功能
    function initWishList() {
        const wishForm = document.getElementById('wish-form');
        const wishList = document.getElementById('wish-list');
        
        // 加载保存的愿望
        loadWishes();
        
        // 提交愿望
        wishForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const wishText = document.getElementById('wish-text').value;
            const wishCategory = document.getElementById('wish-category').value;
            
            if (wishText.trim() === '') return;
            
            const wish = {
                id: Date.now(),
                text: wishText,
                category: wishCategory,
                completed: false,
                time: new Date().toLocaleString()
            };
            
            addWish(wish);
            saveWishes();
            
            document.getElementById('wish-text').value = '';
        });
        
        // 添加愿望到列表
        function addWish(wish) {
            const wishElement = document.createElement('div');
            wishElement.classList.add('wish-item');
            if (wish.completed) wishElement.classList.add('completed');
            wishElement.dataset.id = wish.id;
            
            // 获取分类图标
            const categoryIcon = getCategoryIcon(wish.category);
            
            wishElement.innerHTML = `
                <div class="wish-header">
                    <span class="wish-category"><i class="${categoryIcon}"></i> ${wish.category}</span>
                    <span class="wish-time">${wish.time}</span>
                </div>
                <div class="wish-content">${escapeHtml(wish.text)}</div>
                <div class="wish-actions">
                    <button class="complete-wish-button" title="${wish.completed ? '取消完成' : '标记为已完成'}">
                        <i class="fas ${wish.completed ? 'fa-times' : 'fa-check'}"></i>
                    </button>
                    <button class="delete-wish-button" title="删除">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            
            // 添加完成/取消完成功能
            const completeButton = wishElement.querySelector('.complete-wish-button');
            completeButton.addEventListener('click', function() {
                const id = wishElement.dataset.id;
                const wishes = getWishes();
                const wishIndex = wishes.findIndex(w => w.id == id);
                
                if (wishIndex !== -1) {
                    wishes[wishIndex].completed = !wishes[wishIndex].completed;
                    wishElement.classList.toggle('completed');
                    completeButton.title = wishes[wishIndex].completed ? '取消完成' : '标记为已完成';
                    completeButton.querySelector('i').className = 'fas ' + (wishes[wishIndex].completed ? 'fa-times' : 'fa-check');
                    saveWishesToStorage(wishes);
                }
            });
            
            // 添加删除功能
            const deleteButton = wishElement.querySelector('.delete-wish-button');
            deleteButton.addEventListener('click', function() {
                if (confirm('确定要删除这个愿望吗？')) {
                    const id = wishElement.dataset.id;
                    const wishes = getWishes().filter(w => w.id != id);
                    saveWishesToStorage(wishes);
                    wishElement.remove();
                }
            });
            
            wishList.prepend(wishElement);
        }
        
        // 获取分类图标
        function getCategoryIcon(category) {
            const categoryIcons = {
                '旅行': 'fas fa-plane',
                '美食': 'fas fa-utensils',
                '活动': 'fas fa-calendar-day',
                '购物': 'fas fa-shopping-bag',
                '其他': 'fas fa-star'
            };
            
            return categoryIcons[category] || 'fas fa-star';
        }
        
        // HTML转义函数
        function escapeHtml(text) {
            const map = {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#039;'
            };
            return text.replace(/[&<>"']/g, m => map[m]);
        }
        
        // 获取保存的愿望
        function getWishes() {
            const wishesJSON = localStorage.getItem('wishes');
            return wishesJSON ? JSON.parse(wishesJSON) : [];
        }
        
        // 保存愿望到存储
        function saveWishesToStorage(wishes) {
            // 保存到本地存储
            localStorage.setItem('wishes', JSON.stringify(wishes));
            
            // 如果 Firebase 已初始化，也保存到 Firebase
            if (firebaseInitialized) {
                try {
                    db.ref('wishes').set(wishes);
                } catch (error) {
                    console.error('Firebase 保存失败:', error);
                }
            }
        }
        
        // 保存当前愿望列表
        function saveWishes() {
            const wishElements = document.querySelectorAll('.wish-item');
            const wishes = [];
            
            wishElements.forEach(el => {
                const categoryText = el.querySelector('.wish-category').textContent.trim();
                const category = categoryText.split(' ')[1] || categoryText;
                
                wishes.push({
                    id: el.dataset.id,
                    text: el.querySelector('.wish-content').textContent,
                    category: category,
                    completed: el.classList.contains('completed'),
                    time: el.querySelector('.wish-time').textContent
                });
            });
            
            saveWishesToStorage(wishes);
        }
        
        // 加载保存的愿望
        function loadWishes() {
            // 优先从 Firebase 加载
            if (firebaseInitialized) {
                try {
                    db.ref('wishes').once('value').then((snapshot) => {
                        const wishes = snapshot.val() || [];
                        // 清空当前列表
                        wishList.innerHTML = '';
                        // 添加从 Firebase 获取的愿望
                        wishes.forEach(wish => addWish(wish));
                        // 同步到本地存储
                        localStorage.setItem('wishes', JSON.stringify(wishes));
                    }).catch(error => {
                        console.error('从 Firebase 加载愿望失败:', error);
                        // 如果 Firebase 加载失败，从本地加载
                        const wishes = getWishes();
                        wishes.forEach(wish => addWish(wish));
                    });
                } catch (error) {
                    console.error('Firebase 操作失败:', error);
                    // 从本地加载
                    const wishes = getWishes();
                    wishes.forEach(wish => addWish(wish));
                }
            } else {
                // 从本地加载
                const wishes = getWishes();
                wishes.forEach(wish => addWish(wish));
            }
        }
    }
});
