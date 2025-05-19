// 功能模块管理
document.addEventListener('DOMContentLoaded', function() {
    // Firebase 配置
    const firebaseConfig = {
        apiKey: "AIzaSyCW9goMRxNq2QILQC5UQHemXAz8A1NbMuA",
    	authDomain: "daycount-test.firebaseapp.com",
    	databaseURL: "https://daycount-test-default-rtdb.asia-southeast1.firebasedatabase.app",
    	projectId: "daycount-test",
    	storageBucket: "daycount-test.firebasestorage.app",
    	messagingSenderId: "309331763509",
    	appId: "1:309331763509:web:1569e6bb6527c8b7506c7c",
    	measurementId: "G-Y44YQ77TDM"
    };
    
    // 初始化 Firebase
    let firebaseInitialized = false;
    let db;
    
    try {
        // 检查 Firebase 是否已加载
        if (typeof firebase !== 'undefined') {
            // 初始化 Firebase
            firebase.initializeApp(firebaseConfig);
            db = firebase.database();
            firebaseInitialized = true;
            console.log('Firebase 初始化成功');
        } else {
            console.warn('Firebase SDK 未加载，将使用本地存储');
        }
    } catch (error) {
        console.error('Firebase 初始化失败:', error);
        console.warn('将使用本地存储作为备选');
    }
    
    // 功能标签切换
    initializeFeatureTabs();
    
    // 留言板功能已在 message-board.js 中初始化
    console.log('留言板功能已初始化');
    
    // 心情日记功能已在 mood-diary.js 中初始化
    console.log('心情日记功能已初始化');
    
    // 初始化功能标签切换
    function initializeFeatureTabs() {
        const featureTabs = document.querySelectorAll('.feature-tab');
        const featureContents = document.querySelectorAll('.feature-content');
        
        featureTabs.forEach(tab => {
            tab.addEventListener('click', function() {
                // 移除所有标签的活动状态
                featureTabs.forEach(t => t.classList.remove('active'));
                
                // 隐藏所有内容区域
                featureContents.forEach(content => content.classList.remove('active'));
                
                // 激活当前标签
                this.classList.add('active');
                
                // 显示对应的内容区域
                const targetId = this.getAttribute('data-target');
                const targetContent = document.getElementById(targetId);
                if (targetContent) {
                    targetContent.classList.add('active');
                }
            });
        });
    }
});
