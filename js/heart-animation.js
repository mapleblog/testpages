// 爱心动画函数
var offsetX, offsetY, garden;
var gardenCanvas, gardenCtx;

document.addEventListener('DOMContentLoaded', function() {
    // 初始化爱心动画
    initHeartAnimation();
    
    // 设置恋爱纪念日
    const togetherDate = document.getElementById('together-date');
    if (togetherDate) {
        const savedDate = localStorage.getItem('anniversaryDate') || '2023-01-01';
        togetherDate.textContent = savedDate;
        
        // 计算时间差
        timeElapse(new Date(savedDate));
        setInterval(function() {
            timeElapse(new Date(savedDate));
        }, 500);
    }
});

// 初始化爱心动画
function initHeartAnimation() {
    const gardenLove = document.getElementById('garden-love');
    if (!gardenLove) return;
    
    // 创建Canvas元素
    gardenCanvas = document.createElement('canvas');
    gardenCanvas.width = gardenLove.offsetWidth;
    gardenCanvas.height = gardenLove.offsetHeight;
    gardenLove.appendChild(gardenCanvas);
    
    gardenCtx = gardenCanvas.getContext('2d');
    gardenCtx.globalCompositeOperation = "lighter";
    garden = new Garden(gardenCtx, gardenCanvas);
    
    // 设置爱心中心点
    offsetX = gardenLove.offsetWidth / 2;
    offsetY = gardenLove.offsetHeight / 2 - 20;
    
    // 开始爱心动画
    startHeartAnimation();
}

// 获取爱心点坐标
function getHeartPoint(angle) {
    var t = angle / Math.PI;
    var x = 19.5 * (16 * Math.pow(Math.sin(t), 3));
    var y = -20 * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
    return [offsetX + x, offsetY + y];
}

// 开始爱心动画
function startHeartAnimation() {
    var interval = 50;
    var angle = 10;
    var heart = [];
    
    var animationTimer = setInterval(function() {
        var point = getHeartPoint(angle);
        var isValid = true;
        
        for (var i = 0; i < heart.length; i++) {
            var p = heart[i];
            var distance = Math.sqrt(Math.pow(p[0] - point[0], 2) + Math.pow(p[1] - point[1], 2));
            if (distance < 10) {
                isValid = false;
                break;
            }
        }
        
        if (isValid) {
            heart.push(point);
            garden.createRandomBloom(point[0], point[1]);
        }
        
        if (angle >= 30) {
            clearInterval(animationTimer);
        } else {
            angle += 0.2;
        }
    }, interval);
}

// 计算时间差
function timeElapse(startDate) {
    var currentTime = new Date();
    var timeElapsed = (Date.parse(currentTime) - Date.parse(startDate)) / 1000;
    
    var days = Math.floor(timeElapsed / (3600 * 24));
    timeElapsed = timeElapsed % (3600 * 24);
    
    var hours = Math.floor(timeElapsed / 3600);
    if (hours < 10) hours = "0" + hours;
    timeElapsed = timeElapsed % 3600;
    
    var minutes = Math.floor(timeElapsed / 60);
    if (minutes < 10) minutes = "0" + minutes;
    
    var seconds = Math.floor(timeElapsed % 60);
    if (seconds < 10) seconds = "0" + seconds;
    
    var result = '<span class="digit">' + days + '</span> 天 <span class="digit">' + 
                 hours + '</span> 小时 <span class="digit">' + 
                 minutes + '</span> 分钟 <span class="digit">' + 
                 seconds + '</span> 秒';
    
    document.getElementById('elapse-clock').innerHTML = result;
}