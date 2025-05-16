// 功能模块：心情日记和愿望清单
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
    let firebaseInitialized = false;
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
    
    // 初始化所有功能
    initMoodDiary();
    initWishList();
    
    // 切换功能标签
    const featureTabs = document.querySelectorAll('.feature-tab');
    const featureContents = document.querySelectorAll('.feature-content');

    featureTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // 移除所有活动状态
            featureTabs.forEach(t => t.classList.remove('active'));
            featureContents.forEach(c => c.classList.remove('active'));
            
            // 添加当前活动状态
            tab.classList.add('active');
            const targetId = tab.getAttribute('data-target');
            document.getElementById(targetId).classList.add('active');
        });
    });

    // 默认显示第一个标签
    featureTabs[0].click();

    // 心情日记功能
    function initMoodDiary() {
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
                selectedMood = this.getAttribute('data-mood');
            });
        });
        
        // 提交心情
        moodForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const moodText = document.getElementById('mood-text').value;
            
            if (!selectedMood) {
                alert('请选择一个心情');
                return;
            }
            
            if (moodText.trim() === '') {
                alert('请输入心情描述');
                return;
            }
            
            const mood = {
                id: Date.now(),
                mood: selectedMood,
                text: moodText,
                image: moodImageData,
                time: new Date().toLocaleString()
            };
            
            addMood(mood);
            saveMoods();
            
            // 重置表单
            moodIcons.forEach(i => i.classList.remove('selected'));
            document.getElementById('mood-text').value = '';
            moodImagePreview.innerHTML = '';
            moodImageData = null;
            moodImageInput.value = '';
            selectedMood = '';
        });
        
        // 添加心情到列表
        function addMood(mood) {
            const moodElement = document.createElement('div');
            moodElement.classList.add('mood-item');
            moodElement.dataset.id = mood.id;
            
            // 获取心情图标
            const moodIcon = getMoodIcon(mood.mood);
            
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
                    <span class="mood-icon-display"><i class="${moodIcon}"></i></span>
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
            
            // 添加到列表开头
            messageList.insertBefore(moodElement, moodList.firstChild);
        }
        
        // 获取心情图标
        function getMoodIcon(mood) {
            switch(mood) {
                case 'happy': return 'fas fa-smile';
                case 'sad': return 'fas fa-frown';
                case 'angry': return 'fas fa-angry';
                case 'surprised': return 'fas fa-surprise';
                case 'neutral': return 'fas fa-meh';
                case 'love': return 'fas fa-heart';
                case 'tired': return 'fas fa-tired';
                default: return 'fas fa-smile';
            }
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
            return text.replace(/[&<>"']/g, function(m) { return map[m]; });
        }
        
        // 获取保存的心情记录
        function getMoods() {
            const moodsJson = localStorage.getItem('moods');
            return moodsJson ? JSON.parse(moodsJson) : [];
        }
        
        // 保存心情记录到存储
        function saveMoodsToStorage(moods) {
            if (firebaseInitialized) {
                try {
                    // 保存到 Firebase
                    db.ref('moods').set(moods)
                        .then(() => console.log('心情记录已保存到 Firebase'))
                        .catch(error => {
                            console.error('保存到 Firebase 失败:', error);
                            // 备用：保存到本地
                            localStorage.setItem('moods', JSON.stringify(moods));
                        });
                } catch (error) {
                    console.error('Firebase 操作失败:', error);
                    // 备用：保存到本地
                    localStorage.setItem('moods', JSON.stringify(moods));
                }
            } else {
                // 保存到本地
                localStorage.setItem('moods', JSON.stringify(moods));
            }
        }
        
        // 保存当前心情记录列表
        function saveMoods() {
            const moods = getMoods();
            const moodElements = document.querySelectorAll('.mood-item');
            
            // 将新的心情记录添加到数组开头
            const newMoods = Array.from(moodElements).map(el => {
                const id = el.dataset.id;
                return moods.find(m => m.id == id);
            }).filter(Boolean); // 过滤掉可能的 undefined
            
            saveMoodsToStorage(newMoods);
        }
        
        // 加载保存的心情记录
        function loadMoods() {
            try {
                // 清空当前列表
                moodList.innerHTML = '';
                
                if (firebaseInitialized) {
                    try {
                        // 从 Firebase 加载
                        db.ref('moods').once('value').then(snapshot => {
                            const moods = snapshot.val() || [];
                            // 按时间倒序显示心情
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
            } catch (error) {
                console.error('加载心情记录失败:', error);
                moodList.innerHTML = '<div class="error-message">加载心情记录失败</div>';
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
            
            if (wishText.trim() === '') {
                alert('请输入愿望内容');
                return;
            }
            
            const wish = {
                id: Date.now(),
                text: wishText,
                category: wishCategory,
                completed: false,
                time: new Date().toLocaleString()
            };
            
            addWish(wish);
            saveWishes();
            
            // 重置表单
            document.getElementById('wish-text').value = '';
        });
        
        // 添加愿望到列表
        function addWish(wish) {
            const wishElement = document.createElement('div');
            wishElement.classList.add('wish-item');
            wishElement.dataset.id = wish.id;
            
            // 根据完成状态添加类
            if (wish.completed) {
                wishElement.classList.add('completed');
            }
            
            wishElement.innerHTML = `
                <div class="wish-header">
                    <span class="wish-category">${wish.category}</span>
                    <span class="wish-time">${wish.time}</span>
                </div>
                <div class="wish-content">${escapeHtml(wish.text)}</div>
                <div class="wish-actions">
                    <button class="toggle-wish-button" title="${wish.completed ? '标记为未完成' : '标记为已完成'}">
                        <i class="fas ${wish.completed ? 'fa-times-circle' : 'fa-check-circle'}"></i>
                    </button>
                    <button class="delete-wish-button" title="删除">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            
            // 添加切换完成状态功能
            const toggleButton = wishElement.querySelector('.toggle-wish-button');
            toggleButton.addEventListener('click', function() {
                const id = wishElement.dataset.id;
                const wishes = getWishes();
                const wishIndex = wishes.findIndex(w => w.id == id);
                
                if (wishIndex !== -1) {
                    wishes[wishIndex].completed = !wishes[wishIndex].completed;
                    saveWishesToStorage(wishes);
                    
                    // 更新UI
                    wishElement.classList.toggle('completed');
                    const icon = toggleButton.querySelector('i');
                    icon.classList.toggle('fa-check-circle');
                    icon.classList.toggle('fa-times-circle');
                    toggleButton.title = wishes[wishIndex].completed ? '标记为未完成' : '标记为已完成';
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
        
        // HTML转义函数
        function escapeHtml(text) {
            const map = {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#039;'
            };
            return text.replace(/[&<>"']/g, function(m) { return map[m]; });
        }
        
        // 获取保存的愿望
        function getWishes() {
            const wishesJson = localStorage.getItem('wishes');
            return wishesJson ? JSON.parse(wishesJson) : [];
        }
        
        // 保存愿望到存储
        function saveWishesToStorage(wishes) {
            if (firebaseInitialized) {
                try {
                    // 保存到 Firebase
                    db.ref('wishes').set(wishes)
                        .then(() => console.log('愿望已保存到 Firebase'))
                        .catch(error => {
                            console.error('保存到 Firebase 失败:', error);
                            // 备用：保存到本地
                            localStorage.setItem('wishes', JSON.stringify(wishes));
                        });
                } catch (error) {
                    console.error('Firebase 操作失败:', error);
                    // 备用：保存到本地
                    localStorage.setItem('wishes', JSON.stringify(wishes));
                }
            } else {
                // 保存到本地
                localStorage.setItem('wishes', JSON.stringify(wishes));
            }
        }
        
        // 保存当前愿望列表
        function saveWishes() {
            const wishes = getWishes();
            const wishElements = document.querySelectorAll('.wish-item');
            
            // 将新的愿望添加到数组开头
            const newWishes = Array.from(wishElements).map(el => {
                const id = el.dataset.id;
                return wishes.find(w => w.id == id);
            }).filter(Boolean); // 过滤掉可能的 undefined
            
            saveWishesToStorage(newWishes);
        }
        
        // 加载保存的愿望
        function loadWishes() {
            try {
                // 清空当前列表
                wishList.innerHTML = '';
                
                if (firebaseInitialized) {
                    try {
                        // 从 Firebase 加载
                        db.ref('wishes').once('value').then(snapshot => {
                            const wishes = snapshot.val() || [];
                            // 按时间倒序显示愿望
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
            } catch (error) {
                console.error('加载愿望失败:', error);
                wishList.innerHTML = '<div class="error-message">加载愿望失败</div>';
            }
        }
    }
});
