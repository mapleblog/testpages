// 初始化particles.js
document.addEventListener('DOMContentLoaded', function() {
    // 初始化particles.js
    particlesJS("particles-js", {
        particles: {
            number: { value: 80, density: { enable: true, value_area: 800 } },
            color: { value: "#ffffff" },
            shape: { type: "circle" },
            opacity: { value: 0.5, random: true },
            size: { value: 3, random: true },
            move: {
                enable: true,
                speed: 1,
                direction: "none",
                random: true,
                straight: false,
                out_mode: "out"
            }
        }
    });
    
    // 标题动画
    gsap.to("h1", { opacity: 1, duration: 2, delay: 1, ease: "power2.inOut" });
    
    // 创建气泡
    function createBubble() {
        const bubble = document.createElement('div');
        bubble.className = 'ocean-bubble';
        
        const size = Math.random() * 20 + 5;
        const left = Math.random() * 100;
        
        bubble.style.width = `${size}px`;
        bubble.style.height = `${size}px`;
        bubble.style.left = `${left}%`;
        bubble.style.bottom = '-50px';
        
        const duration = Math.random() * 3 + 2;
        bubble.style.animationDuration = `${duration}s`;
        
        document.getElementById('ocean').appendChild(bubble);
        
        setTimeout(() => {
            bubble.remove();
        }, duration * 1000);
    }
    
    // 定期创建气泡
    setInterval(createBubble, 300);
});
