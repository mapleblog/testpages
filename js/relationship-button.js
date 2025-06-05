document.addEventListener('DOMContentLoaded', function() {
    const confirmationButton = document.getElementById('confirmation-button');
    const confirmationMessage = document.getElementById('confirmation-message');
    const relationshipStatus = document.getElementById('relationship-status');
    const heartExplosion = document.getElementById('heart-explosion');
    const buttonContainer = document.querySelector('.confirmation-button-container');
    
    let attempts = 0;
    const maxAttempts = 5;
    
    // 检查本地存储中是否已经确认关系
    if (localStorage.getItem('relationshipConfirmed') === 'true') {
        showRelationshipConfirmed();
    }
    
    confirmationButton.addEventListener('mouseover', function(e) {
        // 如果尝试次数小于最大次数，按钮会"逃跑"
        if (attempts < maxAttempts) {
            attempts++;
            
            // 随机方向
            const directionX = Math.random() > 0.5 ? 0.3 : -0.3;
            const directionY = Math.random() > 0.5 ? 0.3 : -0.3;
            
            // 设置CSS变量
            confirmationButton.style.setProperty('--direction-x', directionX);
            confirmationButton.style.setProperty('--direction-y', directionY);
            
            // 添加动画类
            confirmationButton.classList.add('running-away');
            
            // 显示提示消息
            confirmationMessage.style.display = 'block';
            confirmationMessage.textContent = `再试一次！还差 ${maxAttempts - attempts} 次就能抓住我了！`;
            
            // 动画结束后重置
            setTimeout(() => {
                confirmationButton.classList.remove('running-away');
                
                // 重新定位按钮到随机位置
                const containerRect = buttonContainer.getBoundingClientRect();
                const buttonRect = confirmationButton.getBoundingClientRect();
                
                const maxX = window.innerWidth - buttonRect.width - 20;
                const maxY = window.innerHeight - buttonRect.height - 20;
                
                const randomX = Math.max(20, Math.min(maxX, Math.random() * maxX));
                const randomY = Math.max(20, Math.min(maxY, Math.random() * maxY));
                
                confirmationButton.style.position = 'fixed';
                confirmationButton.style.top = randomY + 'px';
                confirmationButton.style.left = randomX + 'px';
            }, 500);
        }
    });
    
    confirmationButton.addEventListener('click', function(e) {
        // 如果尝试次数达到最大次数，点击按钮确认关系
        if (attempts >= maxAttempts) {
            e.preventDefault();
            showRelationshipConfirmed();
            
            // 保存到本地存储
            localStorage.setItem('relationshipConfirmed', 'true');
            
            // 创建心形爆炸效果
            createHeartExplosion();
        } else {
            e.preventDefault();
            attempts++;
            confirmationMessage.style.display = 'block';
            confirmationMessage.textContent = `再试一次！还差 ${maxAttempts - attempts} 次就能抓住我了！`;
        }
        
        confirmationButton.addEventListener('mouseover', function(e) {
            // 如果尝试次数小于最大次数，按钮会"逃跑"
            if (attempts < maxAttempts) {
                attempts++;
                
                // 随机方向
                const directionX = Math.random() > 0.5 ? 0.3 : -0.3;
                const directionY = Math.random() > 0.5 ? 0.3 : -0.3;
                
                // 设置CSS变量
                confirmationButton.style.setProperty('--direction-x', directionX);
                confirmationButton.style.setProperty('--direction-y', directionY);
                
                // 添加动画类
                confirmationButton.classList.add('running-away');
                
                // 显示提示消息
                confirmationMessage.style.display = 'block';
                confirmationMessage.textContent = `再试一次！还差 ${maxAttempts - attempts} 次就能抓住我了！`;
                
                // 动画结束后重置
                setTimeout(() => {
                    confirmationButton.classList.remove('running-away');
                    
                    // 重新定位按钮到随机位置
                    const containerRect = document.querySelector('.confirmation-button-container').getBoundingClientRect();
                    const buttonRect = confirmationButton.getBoundingClientRect();
                    
                    const maxX = window.innerWidth - buttonRect.width - 20;
                    const maxY = window.innerHeight - buttonRect.height - 20;
                    
                    const randomX = Math.max(20, Math.min(maxX, Math.random() * maxX));
                    const randomY = Math.max(20, Math.min(maxY, Math.random() * maxY));
                    
                    confirmationButton.style.position = 'fixed';
                    confirmationButton.style.top = randomY + 'px';
                    confirmationButton.style.left = randomX + 'px';
                }, 500);
            }
        });
        
        confirmationButton.addEventListener('click', function(e) {
            // 如果尝试次数达到最大次数，点击按钮确认关系
            if (attempts >= maxAttempts) {
                e.preventDefault();
                showRelationshipConfirmed();
                
                // 保存到本地存储
                localStorage.setItem('relationshipConfirmed', 'true');
                
                // 创建心形爆炸效果
                createHeartExplosion();
            } else {
                e.preventDefault();
                attempts++;
                confirmationMessage.style.display = 'block';
                confirmationMessage.textContent = `再试一次！还差 ${maxAttempts - attempts} 次就能抓住我了！`;
            }
        });
    }
    
    // 显示关系确认后的状态
    function showRelationshipConfirmed() {
        if (confirmationButton) {
            confirmationButton.style.position = 'static';
            confirmationButton.disabled = true;
            confirmationButton.textContent = '我们在一起啦！';
            confirmationButton.style.background = 'linear-gradient(45deg, #4CAF50, #8BC34A)';
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
    
    // 创建心形爆炸效果
    function createHeartExplosion() {
        if (heartExplosion) {
            heartExplosion.style.display = 'block';
            heartExplosion.innerHTML = '';
            
            // 创建100个飞行的心形
            for (let i = 0; i < 100; i++) {
                const heart = document.createElement('div');
                heart.className = 'flying-heart';
                heart.innerHTML = '<i class="fas fa-heart"></i>';
                
                // 随机位置
                const x = Math.random() * window.innerWidth;
                const y = Math.random() * window.innerHeight;
                heart.style.left = x + 'px';
                heart.style.top = y + 'px';
                
                // 随机延迟
                heart.style.animationDelay = (Math.random() * 2) + 's';
                
                // 随机大小
                const size = Math.random() * 30 + 10;
                heart.style.fontSize = size + 'px';
                
                heartExplosion.appendChild(heart);
            }
            
            // 3秒后隐藏
            setTimeout(() => {
                heartExplosion.style.display = 'none';
            }, 5000);
        }
    }
});
