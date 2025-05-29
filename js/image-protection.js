/**
 * 图片保护脚本
 * 防止通过右键、拖拽、快捷键等方式保存图片
 */
document.addEventListener('DOMContentLoaded', function() {
    // 获取所有需要保护的图片
    const protectedImages = document.querySelectorAll('.protected-image');
    
    // 为每个图片添加事件监听器
    protectedImages.forEach(function(img) {
        // 阻止鼠标右键
        img.addEventListener('contextmenu', function(e) {
            e.preventDefault();
            return false;
        });
        
        // 阻止拖拽
        img.addEventListener('dragstart', function(e) {
            e.preventDefault();
            return false;
        });
        
        // 阻止复制
        img.addEventListener('copy', function(e) {
            e.preventDefault();
            return false;
        });
    });
    
    // 禁用整个文档的快捷键
    document.addEventListener('keydown', function(e) {
        // 禁用Ctrl+S, Ctrl+U, Ctrl+Shift+I, F12等快捷键
        if (
            (e.ctrlKey && e.key === 's') || 
            (e.ctrlKey && e.key === 'u') ||
            (e.ctrlKey && e.shiftKey && e.key === 'i') ||
            e.key === 'F12' ||
            (e.ctrlKey && e.key === 'c' && window.getSelection().toString().includes('protected-image'))
        ) {
            e.preventDefault();
            return false;
        }
    });
    
    // 禁用图片上的鼠标事件
    document.addEventListener('mousedown', function(e) {
        if (e.target.classList.contains('protected-image')) {
            if (e.button === 2) { // 右键
                e.preventDefault();
                return false;
            }
        }
    });
});
