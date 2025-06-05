// 爱心特效实现
// 使用 jQuery 的 noConflict 模式，避免与其他可能的 jQuery 实例冲突
var jqEffect = jQuery.noConflict();

jqEffect(function() {
    // 初始化爱心特效
    function initHeartEffects() {
        // 创建光晕效果元素
        const $loveHeartSection = jqEffect('.love-heart-section');
        $loveHeartSection.append('<div class="heart-glow"></div>');
        $loveHeartSection.append('<div class="heart-pulse"></div>');
        
        // 监听心形动画接近完成的事件
        document.addEventListener('heartAnimationNearlyComplete', function() {
            // 显示光晕效果
            setTimeout(function() {
                jqEffect('.heart-glow').css('opacity', '0.7');
                // 启动心跳效果
                startHeartbeat();
                // 创建漂浮爱心
                createFloatingHearts();
                // 创建闪烁效果
                createSparkles();
            }, 500);
        });
    }
    
    // 心跳效果
    function startHeartbeat() {
        const $heartPulse = jqEffect('.heart-pulse');
        $heartPulse.css('opacity', '1');
        $heartPulse.css('animation', 'heartbeat 2s infinite');
    }
    
    // 创建漂浮爱心
    function createFloatingHearts() {
        const $loveHeartSection = jqEffect('.love-heart-section');
        const sectionWidth = $loveHeartSection.width();
        const sectionHeight = $loveHeartSection.height();
        
        // 创建迷你爱心图片（如果不存在）
        createMiniHeartImage();
        
        // 定期创建漂浮爱心
        setInterval(function() {
            // 随机位置
            const x = Math.random() * sectionWidth;
            const y = sectionHeight - 20;
            
            // 随机大小
            const size = 5 + Math.random() * 10;
            
            // 随机动画持续时间
            const duration = 3 + Math.random() * 4;
            
            // 创建爱心元素
            const $heart = jqEffect('<div class="floating-heart"></div>');
            $heart.css({
                'left': x + 'px',
                'bottom': '0',
                'width': size + 'px',
                'height': size + 'px',
                'animation-duration': duration + 's'
            });
            
            // 添加到DOM
            $loveHeartSection.append($heart);
            
            // 动画结束后移除元素
            setTimeout(function() {
                $heart.remove();
            }, duration * 1000);
        }, 800);
    }
    
    // 创建闪烁效果
    function createSparkles() {
        const $loveHeartSection = jqEffect('.love-heart-section');
        const $garden = jqEffect('#garden');
        const gardenOffset = $garden.offset();
        const gardenWidth = $garden.width();
        const gardenHeight = $garden.height();
        
        // 定期创建闪烁效果
        setInterval(function() {
            // 在心形区域内随机位置
            const x = gardenOffset.left + Math.random() * gardenWidth;
            const y = gardenOffset.top + Math.random() * gardenHeight;
            
            // 随机大小
            const size = 2 + Math.random() * 4;
            
            // 随机动画持续时间
            const duration = 0.5 + Math.random() * 1;
            
            // 创建闪烁元素
            const $sparkle = jqEffect('<div class="sparkle"></div>');
            $sparkle.css({
                'left': x + 'px',
                'top': y + 'px',
                'width': size + 'px',
                'height': size + 'px',
                'animation-duration': duration + 's'
            });
            
            // 添加到DOM
            $loveHeartSection.append($sparkle);
            
            // 动画结束后移除元素
            setTimeout(function() {
                $sparkle.remove();
            }, duration * 1000);
        }, 300);
    }
    
    // 创建迷你爱心图片（如果不存在）
    function createMiniHeartImage() {
        // 检查图片是否已存在
        const img = new Image();
        img.src = 'img/mini-heart.png';
        
        img.onerror = function() {
            // 如果图片不存在，创建一个简单的爱心SVG并保存
            const svgHeart = `
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                    <path fill="#ff69b4" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
            `;
            
            // 将SVG转换为Base64
            const base64Heart = 'data:image/svg+xml;base64,' + btoa(svgHeart);
            
            // 创建一个使用Base64的CSS规则
            const style = document.createElement('style');
            style.textContent = `.floating-heart { background-image: url('${base64Heart}') !important; }`;
            document.head.appendChild(style);
        };
    }
    
    // 页面加载完成后初始化特效
    initHeartEffects();
});
