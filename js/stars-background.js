// 星星背景动画
document.addEventListener('DOMContentLoaded', function() {
    // 获取爱心容器
    const loveHeart = document.getElementById('loveHeart');
    if (!loveHeart) return;
    
    // 创建星星容器
    const starsContainer = document.createElement('div');
    starsContainer.className = 'stars-container';
    // 初始时隐藏星星容器
    starsContainer.style.opacity = '0';
    loveHeart.appendChild(starsContainer);
    
    // 生成星星
    function createStars() {
        // 根据容器大小确定星星数量
        const containerWidth = loveHeart.offsetWidth;
        const containerHeight = loveHeart.offsetHeight;
        const area = containerWidth * containerHeight;
        const starCount = Math.floor(area / 3000); // 每3000平方像素一颗星
        
        // 清空现有星星
        starsContainer.innerHTML = '';
        
        // 创建新星星
        for (let i = 0; i < starCount; i++) {
            const star = document.createElement('div');
            star.className = 'star';
            
            // 随机位置
            const left = Math.random() * 100;
            const top = Math.random() * 100;
            
            // 随机大小
            const size = Math.random() * 3 + 1;
            
            // 随机动画持续时间
            const duration = Math.random() * 3 + 3; // 3-6秒
            
            // 随机延迟
            const delay = Math.random() * 5;
            
            // 设置样式
            star.style.cssText = `
                left: ${left}%;
                top: ${top}%;
                width: ${size}px;
                height: ${size}px;
                --duration: ${duration}s;
                animation-delay: ${delay}s;
            `;
            
            starsContainer.appendChild(star);
        }
    }
    
    // 初始创建星星（但不显示）
    createStars();
    
    // 监听爱心动画接近完成的事件
    document.addEventListener('heartAnimationNearlyComplete', function() {
        // 渐显星星背景
        starsContainer.style.transition = 'opacity 2s ease-in';
        starsContainer.style.opacity = '1';
    });
    
    // 窗口大小改变时重新创建星星
    window.addEventListener('resize', function() {
        // 使用防抖动，避免频繁调用
        clearTimeout(window.resizeTimer);
        window.resizeTimer = setTimeout(function() {
            createStars();
        }, 250);
    });
});
