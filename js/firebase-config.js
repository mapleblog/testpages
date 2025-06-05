// Firebase 配置文件

// 初始化 Firebase
document.addEventListener('DOMContentLoaded', function() {
    console.log('开始初始化 Firebase...');
    
    // Firebase 配置
    const firebaseConfig = {
        apiKey: "AIzaSyBOxLe9OHVlrB9n8CnJPyAQb8tzrGS-yYU",
        authDomain: "daycount-vietnam.firebaseapp.com",
        databaseURL: "https://daycount-vietnam-default-rtdb.asia-southeast1.firebasedatabase.app",
        projectId: "daycount-vietnam",
        storageBucket: "daycount-vietnam.appspot.com",
        messagingSenderId: "1082275680753",
        appId: "1:1082275680753:web:2f5e8a7b5c8d9a8f4e6c3b"
    };

    // 初始化 Firebase
    try {
        // 检查是否已经初始化
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
            console.log('Firebase 初始化成功');
            
            // 测试数据库连接
            const db = firebase.database();
            db.ref('.info/connected').on('value', function(snap) {
                if (snap.val() === true) {
                    console.log('已连接到 Firebase 数据库');
                } else {
                    console.log('未连接到 Firebase 数据库');
                }
            });
        } else {
            console.log('Firebase 已经初始化');
        }
    } catch (error) {
        console.error('Firebase 初始化失败:', error);
    }
});
