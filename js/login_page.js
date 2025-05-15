document.addEventListener('DOMContentLoaded', () => {
    // 表单切换功能
    const toggleBtns = document.querySelectorAll('.toggle-btn');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    toggleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const formType = btn.dataset.form;
            
            toggleBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            loginForm.style.display = formType === 'login' ? 'flex' : 'none';
            registerForm.style.display = formType === 'register' ? 'flex' : 'none';
        });
    });

    // 登录表单提交
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const errorElement = document.getElementById('loginError');
        
        const username = this.querySelector('input[type="text"]').value;
        const password = this.querySelector('input[type="password"]').value;

        if (!username || !password) {
            showError(errorElement, '请输入完整的登录信息');
            return;
        }

        // 模拟登录成功
        console.log('登录信息：', { username, password });
        alert('登录成功（模拟）');
    });

    // 注册表单提交
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const errorElement = document.getElementById('registerError');
        
        const username = this.querySelector('#username').value;
        const email = this.querySelector('#email').value;
        const password = this.querySelector('#password').value;

        if (!username || !email || !password) {
            showError(errorElement, '请填写所有必填字段');
            return;
        }

        if (!validateEmail(email)) {
            showError(errorElement, '请输入有效的电子邮箱');
            return;
        }

        if (password.length < 6) {
            showError(errorElement, '密码长度至少需要6位');
            return;
        }

        // 模拟注册成功
        console.log('注册信息：', { username, email, password });
        alert('注册成功（模拟）');
    });

    // 显示错误信息
    function showError(element, message) {
        element.textContent = message;
        element.style.display = 'block';
        setTimeout(() => {
            element.style.display = 'none';
        }, 3000);
    }

    // 邮箱验证函数
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
});