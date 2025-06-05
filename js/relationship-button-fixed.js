document.addEventListener('DOMContentLoaded', function() {
    const confirmationButton = document.getElementById('confirmation-button');
    const confirmationMessage = document.getElementById('confirmation-message');
    const relationshipStatus = document.getElementById('relationship-status');
    const heartExplosion = document.getElementById('heart-explosion');
    const buttonContainer = document.querySelector('.confirmation-button-container');
    
    // 如果按钮存在
    if (confirmationButton) {
        let attempts = 0;
        const maxAttempts = 3; // 减少尝试次数，使体验更流畅
        
        // 保存按钮的原始位置
        const originalButtonPosition = {
            top: '0px',
            left: '0px'
        };
        
        // 检查本地存储中是否已经确认关系
        if (localStorage.getItem('relationshipConfirmed') === 'true') {
            showRelationshipConfirmed();
        }
        
        confirmationButton.addEventListener('mouseenter', function(e) {
            // 如果尝试次数小于最大次数，按钮会轻柔移动
            if (attempts < maxAttempts) {
                attempts++;
                
                // 添加动画类使按钮轻柔移动
                confirmationButton.classList.add('running-away');
                
                // 显示优雅的提示消息
                confirmationMessage.style.display = 'block';
                
                // 更浪漫的提示语
                const messages = [
                    '爱情需要勇气，再靠近一点...',
                    '差一点点就能抓住爱情了...',
                    '最后一次尝试，相信你能抓住我的心...'
                ];
                confirmationMessage.textContent = messages[attempts - 1] || messages[0];
                
                // 动画结束后移动按钮到新位置
                setTimeout(() => {
                    confirmationButton.classList.remove('running-away');
                    
                    // 获取容器尺寸
                    const containerRect = buttonContainer.getBoundingClientRect();
                    
                    // 计算按钮可移动的最大范围（保持在容器内）
                    const maxX = containerRect.width - confirmationButton.offsetWidth;
                    const maxY = containerRect.height - confirmationButton.offsetHeight;
                    
                    // 生成新的随机位置
                    const randomX = Math.max(0, Math.min(maxX, Math.random() * maxX));
                    const randomY = Math.max(0, Math.min(maxY, Math.random() * maxY));
                    
                    // 移动按钮
                    confirmationButton.style.left = randomX + 'px';
                    confirmationButton.style.top = randomY + 'px';
                }, 600);
            }
        });
        
        confirmationButton.addEventListener('click', function(e) {
            // 如果尝试次数达到最大次数，点击按钮确认关系
            if (attempts >= maxAttempts) {
                e.preventDefault();
                showRelationshipConfirmed();
                
                // 保存到本地存储
                localStorage.setItem('relationshipConfirmed', 'true');
                localStorage.setItem('relationshipDate', new Date().toISOString());
                
                // 创建心形效果
                createHeartExplosion();
            } else {
                e.preventDefault();
                attempts++;
                confirmationMessage.style.display = 'block';
                
                // 更浪漫的提示语
                const messages = [
                    '爱情需要勇气，再靠近一点...',
                    '差一点点就能抓住爱情了...',
                    '最后一次尝试，相信你能抓住我的心...'
                ];
                confirmationMessage.textContent = messages[attempts - 1] || messages[0];
                
                // 如果是最后一次尝试，让按钮不再移动
                if (attempts >= maxAttempts) {
                    confirmationButton.style.transition = 'all 0.5s ease';
                    confirmationButton.style.left = '0';
                    confirmationButton.style.top = '0';
                }
            }
        });
    }
    
    // 显示关系确认后的状态
    function showRelationshipConfirmed() {
        if (confirmationButton) {
            // 恢复按钮到原始位置
            confirmationButton.style.left = originalButtonPosition.left;
            confirmationButton.style.top = originalButtonPosition.top;
            confirmationButton.disabled = true;
            confirmationButton.textContent = '爱你❤';
            confirmationButton.style.background = 'linear-gradient(45deg, #ff6b6b, #ff8e8e)';
            confirmationButton.style.boxShadow = '0 5px 15px rgba(255, 107, 107, 0.6)';
            confirmationButton.style.color = 'white';
            confirmationButton.style.fontWeight = '600';
        }
        
        if (confirmationMessage) {
            confirmationMessage.style.display = 'none';
        }
        
        if (relationshipStatus) {
            relationshipStatus.style.display = 'block';
            
            // 计算在一起的时间
            const today = new Date();
            const relationshipDate = new Date(localStorage.getItem('relationshipDate') || today);
            
            // 如果是第一次确认关系，保存日期
            if (!localStorage.getItem('relationshipDate')) {
                localStorage.setItem('relationshipDate', today.toISOString());
            }
            
            const daysTogether = Math.floor((today - relationshipDate) / (1000 * 60 * 60 * 24));
            document.getElementById('days-together').textContent = daysTogether;
        }
    }
    
    // 创建心形效果
    function createHeartExplosion() {
        if (heartExplosion) {
            heartExplosion.style.display = 'block';
            heartExplosion.innerHTML = '';
            
            // 创建心形效果，数量适中
            for (let i = 0; i < 80; i++) {
                const heart = document.createElement('div');
                heart.className = 'flying-heart';
                heart.innerHTML = '<i class="fas fa-heart"></i>';
                
                // 从按钮位置开始
                const buttonRect = confirmationButton.getBoundingClientRect();
                const startX = buttonRect.left + buttonRect.width/2;
                const startY = buttonRect.top + buttonRect.height/2;
                
                heart.style.left = startX + 'px';
                heart.style.top = startY + 'px';
                
                // 随机移动方向
                const tx = (Math.random() - 0.5) * window.innerWidth * 0.8;
                const ty = (Math.random() - 0.5) * window.innerHeight * 0.8;
                heart.style.setProperty('--tx', tx + 'px');
                heart.style.setProperty('--ty', ty + 'px');
                
                // 随机延迟
                heart.style.animationDelay = (Math.random() * 0.8) + 's';
                
                // 随机大小
                const size = Math.random() * 20 + 10;
                heart.style.fontSize = size + 'px';
                
                // 随机颜色
                const colors = ['#ff6b6b', '#ff8e8e', '#ff4757', '#ff6b81', '#ff7979'];
                heart.style.color = colors[Math.floor(Math.random() * colors.length)];
                
                heartExplosion.appendChild(heart);
            }
            
            // 4秒后隐藏
            setTimeout(() => {
                heartExplosion.style.display = 'none';
            }, 4000);
        }
    }
});
