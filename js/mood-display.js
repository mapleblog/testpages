// 固定显示心情记录功能
document.addEventListener('DOMContentLoaded', function() {
    // 创建固定显示的心情记录区域
    createMoodDisplayFixed();
    
    // 初始化固定显示的心情记录
    initMoodDisplayFixed();
    
    // 创建固定显示的心情记录区域
    function createMoodDisplayFixed() {
        // 创建切换按钮
        const toggleButton = document.createElement('button');
        toggleButton.className = 'mood-display-toggle';
        toggleButton.innerHTML = '<i class="fas fa-smile"></i>';
        toggleButton.title = '显示/隐藏心情记录';
        document.body.appendChild(toggleButton);
        
        // 创建固定显示区域
        const moodDisplayFixed = document.createElement('div');
        moodDisplayFixed.className = 'mood-display-fixed';
        moodDisplayFixed.style.display = 'none'; // 初始隐藏
        moodDisplayFixed.innerHTML = `
            <div class="mood-title">最近心情</div>
            <button class="close-button"><i class="fas fa-times"></i></button>
            <div id="fixed-mood-list"></div>
        `;
        document.body.appendChild(moodDisplayFixed);
        
        // 添加切换按钮点击事件
        toggleButton.addEventListener('click', function() {
            if (moodDisplayFixed.style.display === 'none') {
                moodDisplayFixed.style.display = 'block';
                loadFixedMoods();
            } else {
                moodDisplayFixed.style.display = 'none';
            }
        });
        
        // 添加关闭按钮点击事件
        const closeButton = moodDisplayFixed.querySelector('.close-button');
        closeButton.addEventListener('click', function() {
            moodDisplayFixed.style.display = 'none';
        });
    }
    
    // 初始化固定显示的心情记录
    function initMoodDisplayFixed() {
        // 监听心情记录的变化
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    // 当心情列表有新增节点时，更新固定显示区域
                    loadFixedMoods();
                }
            });
        });
        
        // 开始监听心情列表的变化
        const moodList = document.getElementById('mood-list');
        if (moodList) {
            observer.observe(moodList, { childList: true });
        }
    }
    
    // 加载固定显示的心情记录
    function loadFixedMoods() {
        const fixedMoodList = document.getElementById('fixed-mood-list');
        if (!fixedMoodList) return;
        
        // 清空当前列表
        fixedMoodList.innerHTML = '';
        
        // 获取心情记录
        const moods = getMoods();
        
        // 按时间倒序排序
        moods.sort((a, b) => b.id - a.id);
        
        // 只显示最近的5条记录
        const recentMoods = moods.slice(0, 5);
        
        if (recentMoods.length === 0) {
            fixedMoodList.innerHTML = '<div class="empty-message">暂无心情记录</div>';
            return;
        }
        
        // 显示心情记录
        recentMoods.forEach(mood => {
            const moodElement = document.createElement('div');
            moodElement.className = 'mood-item';
            
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
            `;
            
            fixedMoodList.appendChild(moodElement);
        });
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
    
    // 获取保存的心情记录
    function getMoods() {
        const moodsJson = localStorage.getItem('moods');
        return moodsJson ? JSON.parse(moodsJson) : [];
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
});
