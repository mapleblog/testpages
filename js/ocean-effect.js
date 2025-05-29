/**
 * 蓝色梦幻海洋特效
 * 实现波浪、气泡和鼠标涟漪效果
 */

// 创建单个气泡
function createBubble() {
    const oceanEffect = document.querySelector('.ocean-effect');
    if (!oceanEffect) {
        console.error('找不到海洋特效容器');
        return;
    }
    
    // 创建气泡元素
    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    
    // 随机大小
    const size = Math.random() * 20 + 10;
    bubble.style.width = `${size}px`;
    bubble.style.height = `${size}px`;
    
    // 随机位置
    bubble.style.left = `${Math.random() * 100}%`;
    bubble.style.bottom = '0';
    
    // 添加到容器
    oceanEffect.appendChild(bubble);
    
    // 气泡生命周期结束后移除
    setTimeout(() => {
        if (bubble && bubble.parentNode) {
            bubble.parentNode.removeChild(bubble);
        }
    }, 4000);
}

// 自动生成气泡
function createBubbles() {
    console.log('开始生成气泡');
    
    // 立即生成一批气泡
    for (let i = 0; i < 20; i++) {
        setTimeout(() => {
            createBubble();
        }, i * 200);
    }
    
    // 定期生成新气泡
    setInterval(createBubble, 300);
}

// 鼠标交互涟漪效果
function setupRippleEffect() {
    document.addEventListener('mousemove', (e) => {
        // 限制创建的涟漪数量，避免性能问题
        if (Math.random() > 0.1) return;
        
        const ripple = document.createElement('div');
        ripple.className = 'ripple';
        ripple.style.left = e.clientX + 'px';
        ripple.style.top = e.clientY + 'px';
        document.querySelector('.ocean-effect').appendChild(ripple);
        
        setTimeout(() => ripple.remove(), 1000);
    });
}

// 初始化海洋特效
function initOceanEffect() {
    console.log('初始化海洋特效');
    
    // 使用已存在的海洋特效容器
    const oceanEffect = document.querySelector('.ocean-effect');
    if (!oceanEffect) {
        console.error('找不到海洋特效容器');
        return;
    }
    
    // 波浪已经在HTML中创建
    
    // 启动气泡效果
    createBubbles();
    
    // 设置涟漪效果
    setupRippleEffect();
    
    console.log('海洋特效初始化完成');
}

// 当DOM加载完成后初始化
document.addEventListener('DOMContentLoaded', initOceanEffect);
