/**
 * 愿望清单功能
 */
document.addEventListener('DOMContentLoaded', function() {
    // 获取DOM元素
    const wishlistForm = document.getElementById('wishlist-form');
    const wishTitleInput = document.getElementById('wish-title');
    const wishDescriptionInput = document.getElementById('wish-description');
    const wishTargetDateInput = document.getElementById('wish-target-date');
    const selectedTypeInput = document.getElementById('selected-type');
    const typeOptions = document.querySelectorAll('.wish-type-option');
    const wishList = document.getElementById('wish-list');

    // 初始化
    initWishlist();

    /**
     * 初始化愿望清单功能
     */
    function initWishlist() {
        // 删除标题为 undefined 的愿望
        removeUndefinedWishes();
        
        // 尝试从 Firebase 加载愿望
        loadWishesFromFirebase();
        
        // 加载已保存的愿望（如果 Firebase 加载失败，将使用本地数据）
        loadWishes();

        // 设置优先级选择事件
        setupPrioritySelection();

        // 设置表单提交事件
        if (wishlistForm) {
            wishlistForm.addEventListener('submit', handleWishSubmit);
        } else {
            console.error('愿望清单表单元素不存在');
        }
    }

    /**
     * 设置类型选择功能
     */
    function setupPrioritySelection() {
        typeOptions.forEach(option => {
            option.addEventListener('click', function() {
                // 移除其他选项的选中状态
                typeOptions.forEach(opt => opt.classList.remove('selected'));
                
                // 添加当前选项的选中状态
                this.classList.add('selected');
                
                // 更新隐藏输入框的值
                selectedTypeInput.value = this.dataset.type;
            });
        });
    }

    /**
     * 处理愿望表单提交
     */
    function handleWishSubmit(event) {
        event.preventDefault();
        
        // 获取表单数据
        const title = wishTitleInput.value.trim();
        const description = wishDescriptionInput.value.trim();
        const targetDate = wishTargetDateInput.value;
        const type = selectedTypeInput.value;
        
        // 验证表单
        if (!title) {
            alert('请输入愿望标题');
            return;
        }
        
        if (!type) {
            alert('请选择愿望类型');
            return;
        }
        
        // 创建新愿望对象
        const wish = {
            id: Date.now(),
            title: escapeHtml(title),
            description: escapeHtml(description),
            type: type,
            targetDate: targetDate,
            createdAt: Date.now(),
            completed: false
        };
        
        // 保存愿望
        saveWish(wish);
        
        // 重置表单
        resetWishForm();
        
        // 重新加载愿望列表
        loadWishes();
    }

    /**
     * 重置愿望表单
     */
    function resetWishForm() {
        wishTitleInput.value = '';
        wishDescriptionInput.value = '';
        wishTargetDateInput.value = '';
        selectedTypeInput.value = '';
        
        // 移除所有类型选项的选中状态
        typeOptions.forEach(option => option.classList.remove('selected'));
    }

    /**
     * 获取所有愿望
     */
    function getWishes() {
        const wishesJson = localStorage.getItem('wishes');
        return wishesJson ? JSON.parse(wishesJson) : [];
    }

    /**
     * 保存愿望
     */
    function saveWish(wish) {
        const wishes = getWishes();
        wishes.push(wish);
        localStorage.setItem('wishes', JSON.stringify(wishes));
        
        // 保存到Firebase
        saveWishesToFirebase(wishes);
    }

    /**
     * 更新愿望
     */
    function updateWish(updatedWish) {
        const wishes = getWishes();
        const index = wishes.findIndex(wish => wish.id === updatedWish.id);
        
        if (index !== -1) {
            wishes[index] = updatedWish;
            localStorage.setItem('wishes', JSON.stringify(wishes));
            
            // 保存到Firebase
            saveWishesToFirebase(wishes);
            
            return true;
        }
        
        return false;
    }

    /**
     * 删除愿望
     */
    function deleteWish(wishId) {
        const wishes = getWishes();
        const filteredWishes = wishes.filter(wish => wish.id !== wishId);
        
        if (filteredWishes.length !== wishes.length) {
            localStorage.setItem('wishes', JSON.stringify(filteredWishes));
            
            // 保存到Firebase
            saveWishesToFirebase(filteredWishes);
            
            return true;
        }
        
        return false;
    }

    /**
     * 保存愿望到 Firebase
     */
    function saveWishesToFirebase(wishes) {
        try {
            if (typeof firebase !== 'undefined' && firebase.apps.length > 0) {
                const db = firebase.database();
                db.ref('wishes').set(wishes)
                    .then(() => console.log('愿望已保存到 Firebase'))
                    .catch(error => console.error('保存到 Firebase 失败:', error));
            }
        } catch (error) {
            console.error('Firebase 操作失败:', error);
        }
    }
    
    /**
     * 删除标题为 undefined 的愿望
     */
    function removeUndefinedWishes() {
        const wishes = getWishes();
        const validWishes = wishes.filter(wish => {
            // 检查标题是否为 undefined 或者 'undefined'
            return wish.title !== undefined && wish.title !== 'undefined' && wish.title.trim() !== '';
        });
        
        // 如果有无效愿望被移除
        if (validWishes.length < wishes.length) {
            console.log(`已移除 ${wishes.length - validWishes.length} 个无效愿望`);
            localStorage.setItem('wishes', JSON.stringify(validWishes));
            
            // 同步到 Firebase
            saveWishesToFirebase(validWishes);
            
            // 重新加载愿望列表
            loadWishes();
            
            return true;
        }
        
        return false;
    }
    
    /**
     * 从 Firebase 加载愿望
     */
    function loadWishesFromFirebase() {
        try {
            if (typeof firebase !== 'undefined' && firebase.apps.length > 0) {
                const db = firebase.database();
                db.ref('wishes').once('value')
                    .then(snapshot => {
                        const firebaseWishes = snapshot.val();
                        if (firebaseWishes) {
                            // 将 Firebase 数据保存到本地存储
                            localStorage.setItem('wishes', JSON.stringify(firebaseWishes));
                            console.log('从 Firebase 加载愿望成功');
                            // 重新加载愿望
                            loadWishes();
                        }
                    })
                    .catch(error => console.error('从 Firebase 加载愿望失败:', error));
            }
        } catch (error) {
            console.error('Firebase 操作失败:', error);
        }
    }
    
    /**
     * 加载愿望列表
     */
    function loadWishes() {
        // 清空愿望列表
        if (wishList) {
            wishList.innerHTML = '';
        } else {
            console.error('愿望列表元素不存在');
            return;
        }
        
        // 获取保存的愿望
        const wishes = getWishes();
        
        if (wishes.length === 0) {
            wishList.innerHTML = '';
            return;
        }
        
        // 按类型和创建时间排序
        wishes.sort((a, b) => {
            // 首先按完成状态排序（未完成的在前）
            if (a.completed !== b.completed) {
                return a.completed ? 1 : -1;
            }
            
            // 然后按类型分组（保持相同类型的愿望在一起）
            if (a.type !== b.type) {
                // 按类型字母序排序
                return a.type.localeCompare(b.type);
            }
            
            // 最后按创建时间降序排序
            return b.createdAt - a.createdAt;
        });
        
        // 显示愿望
        wishes.forEach(wish => {
            const wishElement = createWishElement(wish);
            wishList.appendChild(wishElement);
        });
    }

    /**
     * 创建愿望元素
     */
    function createWishElement(wish) {
        const wishElement = document.createElement('div');
        wishElement.className = 'wish-item';
        wishElement.dataset.id = wish.id;
        wishElement.dataset.type = wish.type;
        
        // 获取类型图标
        let typeIcon = '';
        switch(wish.type) {
            case 'travel':
                typeIcon = '<i class="fas fa-plane" style="color: #64b5f6;"></i>';
                break;
            case 'food':
                typeIcon = '<i class="fas fa-utensils" style="color: #ff8a65;"></i>';
                break;
            case 'activity':
                typeIcon = '<i class="fas fa-hiking" style="color: #81c784;"></i>';
                break;
            case 'other':
                typeIcon = '<i class="fas fa-star" style="color: #ba68c8;"></i>';
                break;
        }
        
        // 格式化日期
        const createdDate = new Date(wish.createdAt).toLocaleDateString('zh-CN');
        let targetDateDisplay = '';
        
        if (wish.targetDate) {
            targetDateDisplay = `<div class="wish-target-date"><i class="fas fa-calendar-alt"></i> 目标日期: ${wish.targetDate}</div>`;
        }
        
        // 构建HTML
        wishElement.innerHTML = `
            <div class="wish-item-header">
                <div class="wish-item-title">
                    ${typeIcon} ${wish.title}
                </div>
                <div class="wish-item-date">
                    <i class="fas fa-clock"></i> 创建于 ${createdDate}
                </div>
            </div>
            <div class="wish-item-description">${wish.description || '无描述'}</div>
            ${targetDateDisplay || ''}
            <div class="wish-item-actions">
                <div class="wish-status ${wish.completed ? 'completed' : ''}">
                    ${wish.completed ? '<i class="fas fa-check-circle"></i> 已完成' : '<i class="far fa-circle"></i> 未完成'}
                </div>
                <div class="wish-action-buttons">
                    <button class="wish-action-button complete-wish-button" data-id="${wish.id}">
                        <i class="fas ${wish.completed ? 'fa-undo' : 'fa-check'}"></i> ${wish.completed ? '撤销' : '完成'}
                    </button>
                    <button class="wish-action-button edit-wish-button" data-id="${wish.id}">
                        <i class="fas fa-edit"></i> 编辑
                    </button>
                    <button class="wish-action-button delete-wish-button" data-id="${wish.id}">
                        <i class="fas fa-trash"></i> 删除
                    </button>
                </div>
            </div>
        `;
        
        // 添加事件监听器
        addWishEventListeners(wishElement);
        
        return wishElement;
    }

    /**
     * 为愿望元素添加事件监听器
     */
    function addWishEventListeners(wishElement) {
        // 完成/撤销按钮
        const completeButton = wishElement.querySelector('.complete-wish-button');
        if (completeButton) {
            completeButton.addEventListener('click', function() {
                const wishId = parseInt(this.dataset.id);
                toggleWishCompletion(wishId);
            });
        }
        
        // 编辑按钮
        const editButton = wishElement.querySelector('.edit-wish-button');
        if (editButton) {
            editButton.addEventListener('click', function() {
                const wishId = parseInt(this.dataset.id);
                editWish(wishId);
            });
        }
        
        // 删除按钮
        const deleteButton = wishElement.querySelector('.delete-wish-button');
        if (deleteButton) {
            deleteButton.addEventListener('click', function() {
                const wishId = parseInt(this.dataset.id);
                if (confirm('确定要删除这个愿望吗？')) {
                    deleteWish(wishId);
                    loadWishes();
                }
            });
        }
    }

    /**
     * 切换愿望完成状态
     */
    function toggleWishCompletion(wishId) {
        const wishes = getWishes();
        const wishIndex = wishes.findIndex(wish => wish.id === wishId);
        
        if (wishIndex !== -1) {
            wishes[wishIndex].completed = !wishes[wishIndex].completed;
            localStorage.setItem('wishes', JSON.stringify(wishes));
            loadWishes();
        }
    }

    /**
     * 编辑愿望
     */
    function editWish(wishId) {
        const wishes = getWishes();
        const wish = wishes.find(wish => wish.id === wishId);
        
        if (!wish) return;
        
        // 填充表单
        wishTitleInput.value = unescapeHtml(wish.title);
        wishDescriptionInput.value = unescapeHtml(wish.description || '');
        wishTargetDateInput.value = wish.targetDate || '';
        
        // 设置类型
        selectedTypeInput.value = wish.type;
        typeOptions.forEach(option => {
            if (option.dataset.type === wish.type) {
                option.classList.add('selected');
            } else {
                option.classList.remove('selected');
            }
        });
        
        // 修改提交按钮文本
        const submitButton = wishlistForm.querySelector('.submit-button');
        submitButton.textContent = '更新愿望';
        
        // 添加编辑状态标记
        wishlistForm.dataset.editing = 'true';
        wishlistForm.dataset.editId = wishId;
        
        // 滚动到表单位置
        wishlistForm.scrollIntoView({ behavior: 'smooth' });
        
        // 修改表单提交处理
        wishlistForm.removeEventListener('submit', handleWishSubmit);
        wishlistForm.addEventListener('submit', function handleEditSubmit(e) {
            e.preventDefault();
            
            // 获取表单数据
            const title = wishTitleInput.value.trim();
            const description = wishDescriptionInput.value.trim();
            const targetDate = wishTargetDateInput.value;
            const type = selectedTypeInput.value;
            
            // 验证表单
            if (!title) {
                alert('请输入愿望标题');
                return;
            }
            
            if (!type) {
                alert('请选择愿望类型');
                return;
            }
            
            // 更新愿望对象
            const updatedWish = {
                ...wish,
                title: escapeHtml(title),
                description: escapeHtml(description),
                type: type,
                targetDate: targetDate
            };
            
            // 保存更新后的愿望
            updateWish(updatedWish);
            
            // 重置表单
            resetWishForm();
            
            // 恢复提交按钮文本
            submitButton.textContent = '添加愿望';
            
            // 移除编辑状态标记
            delete wishlistForm.dataset.editing;
            delete wishlistForm.dataset.editId;
            
            // 恢复原始表单提交处理
            wishlistForm.removeEventListener('submit', handleEditSubmit);
            wishlistForm.addEventListener('submit', handleWishSubmit);
            
            // 重新加载愿望列表
            loadWishes();
        });
    }

    /**
     * HTML转义函数
     */
    function escapeHtml(text) {
        if (!text) return '';
        
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        
        return text.replace(/[&<>"']/g, function(m) { return map[m]; });
    }

    /**
     * HTML反转义函数
     */
    function unescapeHtml(text) {
        if (!text) return '';
        
        const map = {
            '&amp;': '&',
            '&lt;': '<',
            '&gt;': '>',
            '&quot;': '"',
            '&#039;': "'"
        };
        
        return text.replace(/&amp;|&lt;|&gt;|&quot;|&#039;/g, function(m) { return map[m]; });
    }
});
