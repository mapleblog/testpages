// 爱心树动画实现
// 使用 jQuery 的 noConflict 模式，避免与其他可能的 jQuery 实例冲突
var jq = jQuery.noConflict();
jq(function() {
    // 设置友谊开始的日期，与项目中的日期保持一致
    var together = new Date('2025-05-05');
    together.setHours(0);
    together.setMinutes(0);
    together.setSeconds(0);
    together.setMilliseconds(0);
    
    // 初始化画布
    var $loveHeart = jq("#loveHeart");
    var canvasWidth = $loveHeart.width();
    var canvasHeight = $loveHeart.height();
    
    // 计算心形的中心点和缩放比例
    var offsetX = canvasWidth / 2;
    // 将Y偏移量向上移动，留出更多空间给心形底部
    var offsetY = canvasHeight * 0.4; // 将中心点设置在画布高度的40%处
    
    // 对于移动设备，调整心形的垂直位置使其更加居中
    if (window.innerWidth <= 480) {
        offsetY = canvasHeight * 0.45; // 在移动设备上将心形垂直位置调整到画布高度的45%处
    }
    
    // 计算缩放比例，确保心形完全适应画布
    // 进一步减小缩放比例，确保在移动设备上不会触碰画布边缘
    var heartScale = Math.min(canvasWidth, canvasHeight) / 650;
    
    // 对于移动设备进一步减小心形大小
    if (window.innerWidth <= 480) {
        heartScale = Math.min(canvasWidth, canvasHeight) / 750;
    }
    
    // 获取画布元素
    var $garden = jq("#garden");
    var gardenCanvas = $garden[0];
    
    // 设置画布尺寸，确保高清显示
    var pixelRatio = window.devicePixelRatio || 1;
    gardenCanvas.width = canvasWidth * pixelRatio;
    gardenCanvas.height = canvasHeight * pixelRatio;
    gardenCanvas.style.width = canvasWidth + 'px';
    gardenCanvas.style.height = canvasHeight + 'px';
    
    var gardenCtx = gardenCanvas.getContext("2d");
    gardenCtx.scale(pixelRatio, pixelRatio);
    gardenCtx.globalCompositeOperation = "lighter";
    
    // 创建花园对象
    var garden = new Garden(gardenCtx, gardenCanvas);
    
    // 设置渲染间隔
    setInterval(function() {
        garden.render();
    }, Garden.options.growSpeed);
    
    // 调整元素位置
    function adjustWordsPosition() {
        var $garden = jq("#garden");
        var $words = jq("#words");
        
        // 计算文字元素的位置，使其居中显示
        $words.css({
            "position": "absolute",
            "width": "100%",
            "top": canvasHeight * 0.65, // 将文字元素放在画布高度的65%处
            "left": 0,
            "text-align": "center"
        });
    }
    
    // 显示爱心中间的文字
    function showHeartName() {
        // 在爱心绘制到一定程度后显示文字
        setTimeout(function() {
            jq("#heartName").css("opacity", "1");
        }, 1000);
    }
    
    // 显示消息区域
    function showMessages() {
        adjustWordsPosition();
        jq("#messages").fadeIn(3000);
    }
    
    // 获取心形坐标点
    function getHeartPoint(angle) {
        var t = angle / Math.PI;
        
        // 调整心形曲线公式的参数，使心形更窄一些
        var horizontalCompression = 0.85; // 水平方向压缩因子，小于1使心形更窄
        
        // 使用心形曲线公式计算坐标，并应用水平压缩
        var x = 19.5 * (16 * Math.pow(Math.sin(t), 3)) * horizontalCompression;
        
        // 调整心形的纵向比例，使心形稍微扁平一点
        var y = -20 * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * 0.9;
        
        // 对于移动设备，进一步调整心形大小
        if (window.innerWidth <= 480) {
            x = x * 0.95; // 移动设备上再压缩一点水平宽度
        }
        
        // 应用缩放比例和偏移量
        return new Array(offsetX + x * heartScale, offsetY + y * heartScale);
    }
    
    // 开始心形动画
    function startHeartAnimation() {
        var interval = 50; // 调慢动画速度，从30增加到50
        var angle = 10;
        var heart = new Array();
        
        // 计算心形的密度因子，根据画布大小调整
        var densityFactor = Math.max(1, Math.min(canvasWidth, canvasHeight) / 300);
        
        // 设置角度范围，确保心形完整绘制
        var startAngle = 10;
        var endAngle = 30.8; // 增加结束角度，确保心形底部完整绘制
        
        var animationTimer = setInterval(function() {
            var bloom = getHeartPoint(angle);
            var draw = true;
            
            // 检查点是否在画布范围内
            if (bloom[0] < 0 || bloom[0] > canvasWidth || bloom[1] < 0 || bloom[1] > canvasHeight) {
                draw = false;
            }
            
            // 检查与其他点的距离
            for (var i = 0; i < heart.length; i++) {
                var p = heart[i];
                var distance = Math.sqrt(Math.pow(p[0] - bloom[0], 2) + Math.pow(p[1] - bloom[1], 2));
                // 根据密度因子调整最小距离
                if (distance < Garden.options.bloomRadius.max * densityFactor) {
                    draw = false;
                    break;
                }
            }
            
            if (draw) {
                heart.push(bloom);
                garden.createRandomBloom(bloom[0], bloom[1]);
            }
            
            // 当爱心动画完成约80%时显示爱心中间的文字
            // 计算动画进度百分比
            var animationProgress = (angle - startAngle) / (endAngle - startAngle);
            if (animationProgress >= 0.8 && animationProgress < 0.81) {
                showHeartName();
                // 触发一个自定义事件，通知星星背景开始显示
                var event = new CustomEvent('heartAnimationNearlyComplete');
                document.dispatchEvent(event);
            }
            
            if (angle >= endAngle) {
                clearInterval(animationTimer);
                showMessages();
            } else {
                // 调整角度增量，使心形更平滑且速度更慢
                angle += 0.08; // 从0.15减小到0.08，使动画更加缓慢
            }
        }, interval);
    }
    
    // 移除计时器功能，因为已经不需要了
    
    // 创建交叉观察器，在滚动到爱心区块时触发动画
    function setupHeartAnimationObserver() {
        if (!document.createElement('canvas').getContext) {
            var msg = document.createElement("div");
            msg.id = "errorMsg";
            msg.innerHTML = "您的浏览器不支持HTML5 Canvas，请使用现代浏览器。";
            document.body.appendChild(msg);
            jq("#code").css("display", "none");
            jq("#copyright").css("position", "absolute");
            jq("#copyright").css("bottom", "10px");
            return;
        }
        
        // 预先调整元素位置
        adjustWordsPosition();
        
        // 获取爱心区块元素
        const loveHeartSection = document.querySelector('.love-heart-section');
        if (!loveHeartSection) return;
        
        // 创建交叉观察器
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                // 当爱心区块进入视口
                if (entry.isIntersecting) {
                    // 开始动画
                    startHeartAnimation();
                    // 取消观察，确保动画只触发一次
                    observer.unobserve(entry.target);
                }
            });
        }, {
            // 当元素至少有 10% 进入视口时触发
            threshold: 0.1
        });
        
        // 开始观察爱心区块
        observer.observe(loveHeartSection);
    }
    
    // 页面加载完成后，设置交叉观察器
    setupHeartAnimationObserver();
});
