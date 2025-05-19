// u5fc3u60c5u65e5u8bb0u529fu80fd
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM加载完成，初始化心情日记功能');
    
    // 获取DOM元素
    const moodForm = document.getElementById('mood-form');
    const moodList = document.getElementById('mood-list');
    const moodIcons = document.querySelectorAll('.mood-icon');
    const selectedMoodInput = document.getElementById('selected-mood');
    const moodTitleInput = document.getElementById('mood-title');
    const moodContentInput = document.getElementById('mood-content');
    
    // 当前正在编辑的日记ID
    let editingMoodId = null;
    
    // 尝试从 Firebase 加载日记
    loadMoodsFromFirebase();
    
    // 加载日记（如果 Firebase 加载失败，将使用本地数据）
    loadMoods();
    
    // 心情图标点击事件
    moodIcons.forEach(icon => {
        icon.addEventListener('click', function() {
            // 移除其他图标的选中状态
            moodIcons.forEach(i => i.classList.remove('selected'));
            
            // 添加当前图标的选中状态
            this.classList.add('selected');
            
            // 保存选中的心情
            selectedMoodInput.value = this.getAttribute('data-mood');
        });
    });
    
    // 提交日记表单事件
    moodForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const title = moodTitleInput.value.trim();
        const content = moodContentInput.value.trim();
        const mood = selectedMoodInput.value;
        
        if (!title) {
            alert('请输入日记标题');
            return;
        }
        
        if (!content) {
            alert('请输入日记内容');
            return;
        }
        
        if (!mood) {
            alert('请选择今日心情');
            return;
        }
        
        if (editingMoodId) {
            // 更新已有日记
            updateMood(editingMoodId, title, content, mood);
        } else {
            // 创建新日记
            const moodEntry = {
                id: Date.now(),
                title: title,
                content: content,
                mood: mood,
                date: new Date().toLocaleString(),
                createdAt: Date.now()
            };
            
            saveMood(moodEntry);
        }
        
        // 重置表单
        resetMoodForm();
    });
    
    // 加载所有日记
    function loadMoods() {
        console.log('加载心情日记');
        
        // 清空日记列表
        if (moodList) {
            moodList.innerHTML = '';
        } else {
            console.error('日记列表元素不存在');
            return;
        }
        
        // 获取保存的日记
        const moods = getMoods();
        
        if (moods.length === 0) {
            moodList.innerHTML = '';
            return;
        }
        
        // 按创建时间降序排序
        moods.sort((a, b) => b.createdAt - a.createdAt);
        
        // 显示日记
        moods.forEach(mood => {
            const moodElement = createMoodElement(mood);
            moodList.appendChild(moodElement);
        });
    }
    
    // 创建日记元素
    function createMoodElement(mood) {
        const moodElement = document.createElement('div');
        moodElement.className = 'mood-item';
        moodElement.dataset.id = mood.id;
        moodElement.dataset.mood = mood.mood;
        
        // 获取心情图标
        let moodIcon = '';
        switch(mood.mood) {
            case 'happy':
                moodIcon = '<i class="fas fa-smile" style="color: #ffd54f;"></i>';
                break;
            case 'calm':
                moodIcon = '<i class="fas fa-meh" style="color: #81d4fa;"></i>';
                break;
            case 'sad':
                moodIcon = '<i class="fas fa-frown" style="color: #90a4ae;"></i>';
                break;
            case 'excited':
                moodIcon = '<i class="fas fa-grin-stars" style="color: #ff8a65;"></i>';
                break;
            case 'tired':
                moodIcon = '<i class="fas fa-tired" style="color: #9575cd;"></i>';
                break;
            default:
                moodIcon = '<i class="fas fa-book"></i>';
        }
        
        moodElement.innerHTML = `
            <div class="mood-item-header">
                <div class="mood-item-title">${moodIcon} ${escapeHtml(mood.title)}</div>
                <div class="mood-item-date">${mood.date}</div>
            </div>
            <div class="mood-item-content">${escapeHtml(mood.content)}</div>
            <div class="mood-item-actions">
                <button class="mood-action-button edit-mood-button" title="编辑">
                    <i class="fas fa-edit"></i> 编辑
                </button>
                <button class="mood-action-button delete-mood-button" title="删除">
                    <i class="fas fa-trash"></i> 删除
                </button>
            </div>
        `;
        
        // 添加编辑按钮事件
        const editButton = moodElement.querySelector('.edit-mood-button');
        if (editButton) {
            editButton.addEventListener('click', function() {
                startEditMood(mood.id);
            });
        }
        
        // 添加删除按钮事件
        const deleteButton = moodElement.querySelector('.delete-mood-button');
        if (deleteButton) {
            deleteButton.addEventListener('click', function() {
                if (confirm('确定要删除这篇日记吗？')) {
                    deleteMood(mood.id);
                }
            });
        }
        
        return moodElement;
    }
    
    // 开始编辑日记
    function startEditMood(moodId) {
        console.log('开始编辑日记:', moodId);
        
        // 获取日记数据
        const moods = getMoods();
        const mood = moods.find(m => m.id == moodId);
        
        if (mood) {
            // 设置当前编辑的日记ID
            editingMoodId = moodId;
            
            // 填充表单
            moodTitleInput.value = mood.title;
            moodContentInput.value = mood.content;
            selectedMoodInput.value = mood.mood;
            
            // 选中对应的心情图标
            moodIcons.forEach(icon => {
                if (icon.getAttribute('data-mood') === mood.mood) {
                    icon.classList.add('selected');
                } else {
                    icon.classList.remove('selected');
                }
            });
            
            // 滚动到表单位置
            moodForm.scrollIntoView({ behavior: 'smooth' });
            
            // 更改提交按钮文字
            const submitButton = moodForm.querySelector('.submit-button');
            if (submitButton) {
                submitButton.textContent = '更新日记';
            }
        }
    }
    
    // 更新日记
    function updateMood(moodId, title, content, mood) {
        console.log('更新日记:', moodId);
        
        // 获取日记数据
        const moods = getMoods();
        const moodIndex = moods.findIndex(m => m.id == moodId);
        
        if (moodIndex !== -1) {
            // 更新日记内容
            moods[moodIndex].title = title;
            moods[moodIndex].content = content;
            moods[moodIndex].mood = mood;
            moods[moodIndex].edited = true;
            moods[moodIndex].editDate = new Date().toLocaleString();
            
            // 保存更新后的日记
            localStorage.setItem('moods', JSON.stringify(moods));
            
            // 重新加载日记
            loadMoods();
            
            // 显示成功消息
            alert('日记已更新！');
        }
        
        // 清除编辑状态
        editingMoodId = null;
        
        // 恢复提交按钮文字
        const submitButton = moodForm.querySelector('.submit-button');
        if (submitButton) {
            submitButton.textContent = '保存日记';
        }
    }
    
    // 删除日记
    function deleteMood(moodId) {
        console.log('删除日记:', moodId);
        
        // 获取日记数据
        let moods = getMoods();
        
        // 过滤掉要删除的日记
        moods = moods.filter(mood => mood.id != moodId);
        
        // 保存更新后的日记
        localStorage.setItem('moods', JSON.stringify(moods));
        
        // 保存到Firebase
        saveMoodsToFirebase(moods);
        
        // 重新加载日记
        loadMoods();
        
        // 如果正在编辑被删除的日记，重置表单
        if (editingMoodId == moodId) {
            resetMoodForm();
        }
    }
    
    // 保存日记
    function saveMood(mood) {
        console.log('保存日记:', mood);
        
        // 获取现有日记
        const moods = getMoods();
        
        // 添加新日记
        moods.push(mood);
        
        // 保存到本地存储
        localStorage.setItem('moods', JSON.stringify(moods));
        
        // 保存到Firebase
        saveMoodsToFirebase(moods);
        
        // 重新加载日记
        loadMoods();
        
        // 显示成功消息
        alert('日记保存成功！');
    }
    
    // 获取所有日记
    function getMoods() {
        const moodsJson = localStorage.getItem('moods');
        return moodsJson ? JSON.parse(moodsJson) : [];
    }
    
    // 从 Firebase 加载日记
    function loadMoodsFromFirebase() {
        try {
            if (typeof firebase !== 'undefined' && firebase.apps.length > 0) {
                const db = firebase.database();
                db.ref('moods').once('value')
                    .then(snapshot => {
                        const firebaseMoods = snapshot.val();
                        if (firebaseMoods) {
                            // 将 Firebase 数据保存到本地存储
                            localStorage.setItem('moods', JSON.stringify(firebaseMoods));
                            console.log('从 Firebase 加载日记成功');
                            // 重新加载日记
                            loadMoods();
                        }
                    })
                    .catch(error => console.error('从 Firebase 加载日记失败:', error));
            }
        } catch (error) {
            console.error('Firebase 操作失败:', error);
        }
    }
    
    // 保存日记到 Firebase
    function saveMoodsToFirebase(moods) {
        try {
            if (typeof firebase !== 'undefined' && firebase.apps.length > 0) {
                const db = firebase.database();
                db.ref('moods').set(moods)
                    .then(() => console.log('日记已保存到 Firebase'))
                    .catch(error => console.error('保存到 Firebase 失败:', error));
            }
        } catch (error) {
            console.error('Firebase 操作失败:', error);
        }
    }
    
    // 重置日记表单
    function resetMoodForm() {
        moodTitleInput.value = '';
        moodContentInput.value = '';
        selectedMoodInput.value = '';
        editingMoodId = null;
        
        // 移除所有心情图标的选中状态
        moodIcons.forEach(icon => icon.classList.remove('selected'));
        
        // 恢复提交按钮文字
        const submitButton = moodForm.querySelector('.submit-button');
        if (submitButton) {
            submitButton.textContent = '保存日记';
        }
    }
    
    // HTML转义函数，防止XSS攻击
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
});
