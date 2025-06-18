/**
 * 创意爱心表白页面功能
 * 实现六边形导航、爱心动画和时间计数等功能
 */

document.addEventListener('DOMContentLoaded', function() {
    // 获取DOM元素
    const loveDeclaration = document.getElementById('love-declaration-content');
    const hexagonNavItems = document.querySelectorAll('.hexagon');
    const loveContents = document.querySelectorAll('.love-content');
    const backButtons = document.querySelectorAll('.back-button');
    const elapseClockElement = document.getElementById('elapse-clock');
    
    // 集成到现有标签页系统
    integrateWithTabSystem();
    
    // 设置恋爱纪念日期 - 可以从localStorage获取或使用默认值
    let togetherDate = localStorage.getItem('anniversaryDate') || '2023-01-01';
    const together = new Date(togetherDate);
    
    // 初始化
    initHexagonNav();
    createHeartParticles();
    
    // 更新时间计数
    updateElapseTime();
    setInterval(updateElapseTime, 1000);
    
    // 初始化六边形导航
    function initHexagonNav() {
        // 为每个六边形添加点击事件
        hexagonNavItems.forEach(item => {
            item.addEventListener('click', function() {
                const targetId = this.getAttribute('data-target');
                if (targetId) {
                    showContent(targetId);
                }
            });
        });
        
        // 返回按钮点击事件
        backButtons.forEach(button => {
            button.addEventListener('click', function() {
                hideAllContents();
            });
        });
    }
    
    // 显示指定内容
    function showContent(contentId) {
        // 隐藏所有内容
        hideAllContents();
        
        // 显示目标内容
        const targetContent = document.getElementById(contentId);
        if (targetContent) {
            targetContent.classList.add('active');
        }
    }
    
    // 隐藏所有内容
    function hideAllContents() {
        loveContents.forEach(content => {
            content.classList.remove('active');
        });
    }
    
    // 更新已经在一起的时间
    function updateElapseTime() {
        if (!elapseClockElement) return;
        
        const now = new Date();
        const timeDiff = Math.abs(now - together);
        
        // 计算天、时、分、秒
        const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
        
        // 格式化显示
        const timeString = `
            <span class="time-unit">${days}</span> 天 
            <span class="time-unit">${hours < 10 ? '0' + hours : hours}</span> 小时 
            <span class="time-unit">${minutes < 10 ? '0' + minutes : minutes}</span> 分钟 
            <span class="time-unit">${seconds < 10 ? '0' + seconds : seconds}</span> 秒
        `;
        
        elapseClockElement.innerHTML = timeString;
    }
    
    // 创建爱心粒子效果
    function createHeartParticles() {
        const garden = document.getElementById('garden-love');
        if (!garden) return;
        
        // 定期创建新的粒子
        setInterval(() => {
            const particle = document.createElement('div');
            particle.classList.add('heart-particle');
            
            // 随机位置
            const left = Math.random() * garden.offsetWidth;
            particle.style.left = `${left}px`;
            particle.style.bottom = '0';
            
            // 随机大小
            const size = Math.random() * 15 + 5;
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            
            // 随机颜色
            const hue = Math.random() * 60 + 330; // 粉红色到紫色范围
            particle.style.backgroundColor = `hsl(${hue}, 100%, 70%)`;
            
            // 添加到DOM
            garden.appendChild(particle);
            
            // 动画结束后移除
            setTimeout(() => {
                garden.removeChild(particle);
            }, 5000);
        }, 300);
    }
    
    // 爱心形状函数 - 用于绘制爱心
    function getHeartPoint(angle) {
        const t = angle / Math.PI;
        const x = 16 * Math.pow(Math.sin(t), 3);
        const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
        return { x, y };
    }
    
    // 初始化爱心动画
    function initHeartAnimation() {
        const garden = document.getElementById('garden');
        if (!garden) return;
        
        const ctx = garden.getContext('2d');
        const width = garden.width;
        const height = garden.height;
        const centerX = width / 2;
        const centerY = height / 2;
        
        // 清除画布
        ctx.clearRect(0, 0, width, height);
        
        // 绘制爱心
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        
        for (let angle = 0; angle < 2 * Math.PI; angle += 0.01) {
            const point = getHeartPoint(angle);
            const x = centerX + point.x * 10;
            const y = centerY + point.y * 10;
            ctx.lineTo(x, y);
        }
        
        ctx.fillStyle = '#ff6b8b';
        ctx.fill();
        ctx.closePath();
    }
    
    // 留言板功能
    function initMessageBoard() {
        const messageForm = document.getElementById('message-form');
        const messagesDisplay = document.getElementById('messages-display');
        
        if (!messageForm || !messagesDisplay) return;
        
        // 加载已有留言
        loadMessages();
        
        // 提交留言
        messageForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const messageInput = document.getElementById('message-input');
            const message = messageInput.value.trim();
            
            if (message) {
                // 创建新留言
                const newMessage = {
                    text: message,
                    date: new Date().toISOString()
                };
                
                // 保存留言
                saveMessage(newMessage);
                
                // 清空输入
                messageInput.value = '';
                
                // 刷新留言显示
                loadMessages();
            }
        });
        
        // 保存留言到localStorage
        function saveMessage(message) {
            const messages = JSON.parse(localStorage.getItem('loveMessages') || '[]');
            messages.push(message);
            localStorage.setItem('loveMessages', JSON.stringify(messages));
        }
        
        // 从localStorage加载留言
        function loadMessages() {
            const messages = JSON.parse(localStorage.getItem('loveMessages') || '[]');
            
            // 清空显示区域
            messagesDisplay.innerHTML = '';
            
            // 添加留言到显示区域
            messages.forEach(message => {
                const messageElement = document.createElement('div');
                messageElement.classList.add('message-item');
                
                const date = new Date(message.date);
                const formattedDate = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}`;
                
                messageElement.innerHTML = `
                    <div class="message-date">${formattedDate}</div>
                    <div class="message-text">${message.text}</div>
                `;
                
                messagesDisplay.appendChild(messageElement);
            });
            
            // 滚动到底部
            messagesDisplay.scrollTop = messagesDisplay.scrollHeight;
        }
    }
    
    // 初始化留言板
    initMessageBoard();
    
    // 集成到现有标签页系统
    function integrateWithTabSystem() {
        // 获取所有标签按钮
        const tabButtons = document.querySelectorAll('.tab-button');
        const tabContents = document.querySelectorAll('.feature-content');
        
        // 为标签按钮添加点击事件
        tabButtons.forEach(button => {
            button.addEventListener('click', function() {
                const target = this.getAttribute('data-tab');
                
                // 移除所有活动类
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabContents.forEach(content => content.classList.remove('active'));
                
                // 添加活动类到当前标签
                this.classList.add('active');
                document.getElementById(target + '-content').classList.add('active');
                
                // 如果是爱心表白页面，更新时间计数
                if (target === 'love-declaration-content') {
                    updateElapseTime();
                }
            });
        });
    }
    
    // 公开API
    window.loveDeclaration = {
        showContent: showContent,
        hideAllContents: hideAllContents,
        updateElapseTime: updateElapseTime
    };
});