document.addEventListener('DOMContentLoaded', function() {
    // DOM 元素
    const daysEl = document.getElementById('days');
    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');
    const avatar1Img = document.getElementById('avatar1-img');
    const avatar2Img = document.getElementById('avatar2-img');
    
    // 音乐播放器元素
    const audioPlayer = document.getElementById('audio-player');
    const playBtn = document.getElementById('play-btn');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const volumeSlider = document.getElementById('volume-slider');
    const songTitle = document.getElementById('song-title');
    
    // 初始化
    updateCounter();
    setInterval(updateCounter, 1000);
    initFriendshipGradients();
    initMusicPlayer();
    
    // 添加鼠标悬停效果
    addHoverEffects();
    
    // 初始化音乐播放器
    function initMusicPlayer() {
        // 音乐列表
        const playlist = [
            {
                title: '赤壁Online - 登入畫面',
                src: 'music/bgm.mp4'
            }
            // 可以根据需要添加更多音乐
        ];
        
        let currentTrack = 0;
        let isPlaying = false;
        
        // 设置初始音乐
        try {
            console.log('加载音乐:', playlist[currentTrack]);
            audioPlayer.src = playlist[currentTrack].src;
            songTitle.textContent = playlist[currentTrack].title;
            
            // 添加错误处理
            audioPlayer.addEventListener('error', function(e) {
                console.error('音频加载错误:', e);
                console.error('错误代码:', audioPlayer.error.code);
                console.error('错误信息:', audioPlayer.error.message);
                alert('音频加载失败\n请检查文件路径和格式\n错误代码: ' + audioPlayer.error.code);
            });
            
            // 添加调试信息
            audioPlayer.addEventListener('canplay', function() {
                console.log('音频已准备好可以播放');
            });
        } catch (err) {
            console.error('设置音乐源时出错:', err);
        }
        
        // 播放/暂停按钮
        playBtn.addEventListener('click', function() {
            if (isPlaying) {
                audioPlayer.pause();
                playBtn.innerHTML = '<i class="fas fa-play"></i>';
            } else {
                // 尝试播放并捕获错误
                const playPromise = audioPlayer.play();
                
                if (playPromise !== undefined) {
                    playPromise.then(() => {
                        // 播放成功
                        console.log('音乐开始播放');
                        playBtn.innerHTML = '<i class="fas fa-pause"></i>';
                        isPlaying = true;
                    }).catch(error => {
                        // 播放失败
                        console.error('播放失败:', error);
                        alert('播放失败: ' + error.message);
                        playBtn.innerHTML = '<i class="fas fa-play"></i>';
                        isPlaying = false;
                    });
                }
            }
            isPlaying = !isPlaying;
        });
        
        // 上一首按钮
        prevBtn.addEventListener('click', function() {
            currentTrack = (currentTrack - 1 + playlist.length) % playlist.length;
            changeSong(currentTrack);
        });
        
        // 下一首按钮
        nextBtn.addEventListener('click', function() {
            currentTrack = (currentTrack + 1) % playlist.length;
            changeSong(currentTrack);
        });
        
        // 音量控制
        volumeSlider.addEventListener('input', function() {
            audioPlayer.volume = this.value / 100;
        });
        
        // 音乐结束时自动播放下一首
        audioPlayer.addEventListener('ended', function() {
            currentTrack = (currentTrack + 1) % playlist.length;
            changeSong(currentTrack);
        });
        
        // 切换歌曲
        function changeSong(index) {
            audioPlayer.src = playlist[index].src;
            songTitle.textContent = playlist[index].title;
            
            if (isPlaying) {
                audioPlayer.play();
                playBtn.innerHTML = '<i class="fas fa-pause"></i>';
            }
        }
        
        // 设置初始音量
        audioPlayer.volume = volumeSlider.value / 100;
    }
    
    // 加载保存的数据
    function loadData() {
        // 加载头像
        const savedAvatar1 = localStorage.getItem('avatar1');
        const savedAvatar2 = localStorage.getItem('avatar2');
        if (savedAvatar1) avatar1Img.src = savedAvatar1;
        if (savedAvatar2) avatar2Img.src = savedAvatar2;
    }
    
    // 更新计数器
    function updateCounter() {
        // 使用固定开始日期
        const startDate = new Date('2025-05-05');
        const currentDate = new Date();
        
        // 计算已经过去的总秒数
        const totalElapsedSeconds = Math.floor((currentDate - startDate) / 1000);
        
        // 计算已经过去的天数
        const days = Math.floor(totalElapsedSeconds / 3600 / 24);
        
        // 计算今天已经过去的时间（从凌晨12点开始）
        const today = new Date(currentDate);
        today.setHours(0, 0, 0, 0);
        
        const elapsedSecondsToday = Math.floor((currentDate - today) / 1000);
        
        // 计算已经过去的小时、分钟和秒数
        const hours = Math.floor(elapsedSecondsToday / 3600);
        const minutes = Math.floor((elapsedSecondsToday % 3600) / 60);
        const seconds = elapsedSecondsToday % 60;
        
        // 更新DOM
        daysEl.innerHTML = days;
        hoursEl.innerHTML = hours;
        minutesEl.innerHTML = minutes;
        secondsEl.innerHTML = seconds;
        
        // 添加数字变化动画
        animateValue(daysEl, parseInt(daysEl.textContent), days, 500);
        animateValue(hoursEl, parseInt(hoursEl.textContent), hours, 500);
        animateValue(minutesEl, parseInt(minutesEl.textContent), minutes, 500);
        animateValue(secondsEl, parseInt(secondsEl.textContent), seconds, 500);
    }
    
    // 数字动画效果
    function animateValue(element, start, end, duration) {
        // 如果数字相同，不需要动画
        if (start === end) return;
        
        // 添加动画样式
        element.classList.add('counter-update');
        setTimeout(() => {
            element.classList.remove('counter-update');
        }, 300);
        
        // 立即设置数字
        element.innerHTML = end;
    }
    
    // 初始化友谊渐变效果
    function initFriendshipGradients() {
        // 添加渐变背景样式
        const style = document.createElement('style');
        style.textContent = `
            .counter-update {
                animation: pulse 0.3s ease-in-out;
            }
            
            @keyframes pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.2); }
                100% { transform: scale(1); }
            }
            
            .avatar-updated {
                animation: flash 1s ease;
            }
            
            @keyframes flash {
                0%, 50%, 100% { opacity: 1; }
                25%, 75% { opacity: 0.5; }
            }
            
            .celebration {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                z-index: 9999;
            }
            
            .confetti {
                position: absolute;
                width: 10px;
                height: 10px;
                background-color: #f00;
                border-radius: 50%;
                animation: fall 5s ease-in infinite;
            }
            
            @keyframes fall {
                0% { transform: translateY(-100px) rotate(0deg); opacity: 1; }
                100% { transform: translateY(100vh) rotate(360deg); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
        
        // 初始化友谊渐变效果
        updateFriendshipGradients();
    }
    
    // 更新友谊渐变效果
    function updateFriendshipGradients() {
        // 使用固定的色调值
        const hue1 = 330; // 粉红色
        const hue2 = 210; // 蓝色
        const hue3 = 270; // 紫色
        
        // 更新渐变背景
        document.documentElement.style.setProperty('--friendship-gradient-1', 
            `linear-gradient(135deg, hsl(${hue1}, 70%, 60%), hsl(${(hue1 + 30) % 360}, 80%, 40%))`);
        document.documentElement.style.setProperty('--friendship-gradient-2', 
            `linear-gradient(135deg, hsl(${hue2}, 80%, 65%), hsl(${(hue2 + 30) % 360}, 70%, 50%))`);
        document.documentElement.style.setProperty('--friendship-gradient-3', 
            `linear-gradient(135deg, hsl(${hue3}, 70%, 60%), hsl(${(hue3 + 40) % 360}, 80%, 65%), hsl(${(hue3 + 80) % 360}, 75%, 60%))`);
    }
    
    // 添加鼠标悬停效果
    function addHoverEffects() {
        // 添加心形图标悬停效果
        const heart = document.querySelector('.heart');
        if (heart) {
            heart.addEventListener('mouseover', function() {
                this.style.transform = 'scale(1.5)';
                this.style.transition = 'transform 0.3s ease';
            });
            
            heart.addEventListener('mouseout', function() {
                this.style.transform = 'scale(1)';
            });
        }
        
        // 添加计数器悬停效果
        const counters = document.querySelectorAll('.counter');
        counters.forEach(counter => {
            counter.addEventListener('mouseover', function() {
                this.style.transform = 'translateY(-10px)';
                this.style.boxShadow = '0 15px 30px rgba(0, 0, 0, 0.25)';
                this.style.transition = 'transform 0.3s ease, box-shadow 0.3s ease';
            });
            
            counter.addEventListener('mouseout', function() {
                this.style.transform = '';
                this.style.boxShadow = '';
            });
        });
    }
});
