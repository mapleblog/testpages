/**
 * 回忆相册模块
 * 用于展示和管理珍贵的回忆照片和描述
 */

document.addEventListener('DOMContentLoaded', function() {
    // 初始化回忆相册
    initMemoryAlbum();
    
    // 绑定事件监听器
    bindMemoryAlbumEvents();
});

// 初始化回忆相册
function initMemoryAlbum() {
    // 从本地存储加载回忆数据
    loadMemories();
    
    // 渲染回忆卡片
    renderMemoryCards();
}

// 绑定事件监听器
function bindMemoryAlbumEvents() {
    // 打开添加回忆模态框
    const addMemoryBtn = document.getElementById('memory-add-btn');
    if (addMemoryBtn) {
        addMemoryBtn.addEventListener('click', openMemoryModal);
    }
    
    // 关闭模态框
    const closeModalBtn = document.getElementById('memory-modal-close');
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeMemoryModal);
    }
    
    // 点击模态框外部关闭
    const memoryModal = document.getElementById('memory-modal');
    if (memoryModal) {
        memoryModal.addEventListener('click', function(e) {
            if (e.target === memoryModal) {
                closeMemoryModal();
            }
        });
    }
    
    // 提交表单
    const memoryForm = document.getElementById('memory-form');
    if (memoryForm) {
        memoryForm.addEventListener('submit', handleMemorySubmit);
    }
    
    // 图片预览
    const memoryImageInput = document.getElementById('memory-image');
    if (memoryImageInput) {
        memoryImageInput.addEventListener('change', previewMemoryImage);
    }
    
    // 左右滚动按钮
    const prevBtn = document.getElementById('memory-prev');
    const nextBtn = document.getElementById('memory-next');
    const memoryContainer = document.querySelector('.memory-album-container');
    
    if (prevBtn && memoryContainer) {
        prevBtn.addEventListener('click', function() {
            memoryContainer.scrollBy({ left: -300, behavior: 'smooth' });
        });
    }
    
    if (nextBtn && memoryContainer) {
        nextBtn.addEventListener('click', function() {
            memoryContainer.scrollBy({ left: 300, behavior: 'smooth' });
        });
    }
}

// 打开添加回忆模态框
function openMemoryModal() {
    const modal = document.getElementById('memory-modal');
    if (modal) {
        modal.style.display = 'flex';
        
        // 重置表单
        const form = document.getElementById('memory-form');
        if (form) {
            form.reset();
        }
        
        // 清除图片预览
        const preview = document.getElementById('memory-image-preview');
        if (preview) {
            preview.innerHTML = '图片预览区域';
        }
    }
}

// 关闭模态框
function closeMemoryModal() {
    const modal = document.getElementById('memory-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// 预览上传的图片
function previewMemoryImage(e) {
    const preview = document.getElementById('memory-image-preview');
    const file = e.target.files[0];
    
    if (!file) {
        preview.innerHTML = '图片预览区域';
        return;
    }
    
    if (!file.type.match('image.*')) {
        alert('请选择图片文件');
        return;
    }
    
    const reader = new FileReader();
    
    reader.onload = function(e) {
        preview.innerHTML = '';
        const img = document.createElement('img');
        img.src = e.target.result;
        preview.appendChild(img);
    }
    
    reader.readAsDataURL(file);
}

// 处理表单提交
function handleMemorySubmit(e) {
    e.preventDefault();
    
    const title = document.getElementById('memory-title').value;
    const date = document.getElementById('memory-date').value;
    const description = document.getElementById('memory-description').value;
    const imageInput = document.getElementById('memory-image');
    
    if (!title || !date || !description || !imageInput.files[0]) {
        alert('请填写所有字段并选择图片');
        return;
    }
    
    const file = imageInput.files[0];
    const reader = new FileReader();
    
    reader.onload = function(e) {
        const imageData = e.target.result;
        
        // 创建新的回忆对象
        const newMemory = {
            id: Date.now().toString(),
            title: title,
            date: date,
            description: description,
            image: imageData
        };
        
        // 保存到本地存储
        saveMemory(newMemory);
        
        // 关闭模态框
        closeMemoryModal();
        
        // 重新渲染回忆卡片
        renderMemoryCards();
    };
    
    reader.readAsDataURL(file);
}

// 保存回忆到本地存储
function saveMemory(memory) {
    let memories = JSON.parse(localStorage.getItem('memories') || '[]');
    memories.push(memory);
    localStorage.setItem('memories', JSON.stringify(memories));
}

// 从本地存储加载回忆
function loadMemories() {
    return JSON.parse(localStorage.getItem('memories') || '[]');
}

// 删除回忆
function deleteMemory(id) {
    if (confirm('确定要删除这个回忆吗？')) {
        let memories = loadMemories();
        memories = memories.filter(memory => memory.id !== id);
        localStorage.setItem('memories', JSON.stringify(memories));
        renderMemoryCards();
    }
}

// 渲染回忆卡片
function renderMemoryCards() {
    const container = document.querySelector('.memory-album-container');
    if (!container) return;
    
    const memories = loadMemories();
    
    // 清空容器
    container.innerHTML = '';
    
    if (memories.length === 0) {
        container.innerHTML = '<div class="empty-memory">还没有添加回忆，点击右上角的加号添加吧！</div>';
        return;
    }
    
    // 按日期排序（从新到旧）
    memories.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // 创建回忆卡片
    memories.forEach(memory => {
        const card = document.createElement('div');
        card.className = 'memory-card';
        card.innerHTML = `
            <div class="memory-card-inner">
                <div class="memory-card-front" style="background-image: url('${memory.image}')">
                    <span class="memory-date">${formatDate(memory.date)}</span>
                </div>
                <div class="memory-card-back">
                    <h3 class="memory-title">${memory.title}</h3>
                    <div class="memory-description">${memory.description}</div>
                    <button class="memory-delete-btn" onclick="deleteMemory('${memory.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

// 格式化日期
function formatDate(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// 导出函数到全局作用域，以便HTML中的onclick调用
window.deleteMemory = deleteMemory;
window.openMemoryModal = openMemoryModal;
window.closeMemoryModal = closeMemoryModal;