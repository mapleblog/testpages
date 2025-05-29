/**
 * Firebase认证和数据同步模块
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('初始化Firebase认证模块...');
    
    // 用户ID - 使用设备唯一标识或匿名登录
    let userId = localStorage.getItem('user_id');
    
    // 如果没有用户ID，创建一个新的
    if (!userId) {
        userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('user_id', userId);
    }
    
    // 全局变量，用于存储用户认证状态
    window.FirebaseAuthModule = {
        userId: userId,
        isAuthenticated: false,
        initialize: initializeAuth,
        syncUserData: syncUserData
    };
    
    // 初始化认证
    initializeAuth();
    
    /**
     * 初始化Firebase认证
     */
    function initializeAuth() {
        try {
            if (typeof firebase === 'undefined') {
                console.error('Firebase SDK未加载，无法初始化认证');
                return;
            }
            
            if (firebase.apps.length === 0) {
                console.error('Firebase未初始化，无法初始化认证');
                return;
            }
            
            console.log('正在初始化Firebase匿名认证...');
            
            // 使用匿名认证
            firebase.auth().signInAnonymously()
                .then(() => {
                    console.log('✅ Firebase匿名认证成功');
                    window.FirebaseAuthModule.isAuthenticated = true;
                    
                    // 监听认证状态变化
                    firebase.auth().onAuthStateChanged(user => {
                        if (user) {
                            // 用户已登录
                            console.log('用户已登录:', user.uid);
                            window.FirebaseAuthModule.userId = user.uid;
                            window.FirebaseAuthModule.isAuthenticated = true;
                            
                            // 同步用户数据
                            syncUserData();
                        } else {
                            // 用户已登出
                            console.log('用户已登出');
                            window.FirebaseAuthModule.isAuthenticated = false;
                        }
                    });
                })
                .catch(error => {
                    console.error('Firebase匿名认证失败:', error);
                });
        } catch (error) {
            console.error('初始化Firebase认证失败:', error);
        }
    }
    
    /**
     * 同步用户数据
     */
    function syncUserData() {
        try {
            if (!window.FirebaseAuthModule.isAuthenticated) {
                console.warn('用户未认证，无法同步数据');
                return;
            }
            
            console.log('正在同步用户数据...');
            
            // 同步表情反应数据
            syncReactionsData();
        } catch (error) {
            console.error('同步用户数据失败:', error);
        }
    }
    
    /**
     * 同步表情反应数据
     */
    function syncReactionsData() {
        try {
            console.log('正在同步表情反应数据...');
            
            // 获取所有本地存储的表情反应数据
            const reactionsData = {};
            
            // 遍历localStorage中的所有键
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                
                // 检查是否是表情反应数据
                if (key.startsWith('message_reactions_') || 
                    key.startsWith('mood_reactions_') || 
                    key.startsWith('wish_reactions_')) {
                    
                    try {
                        const data = JSON.parse(localStorage.getItem(key));
                        reactionsData[key] = data;
                    } catch (e) {
                        console.error('解析表情反应数据失败:', e);
                    }
                }
            }
            
            // 如果有数据，同步到Firebase
            if (Object.keys(reactionsData).length > 0) {
                const db = firebase.database();
                const userId = window.FirebaseAuthModule.userId;
                
                // 同步到用户特定的路径
                db.ref(`user_reactions/${userId}`).set(reactionsData)
                    .then(() => {
                        console.log('✅ 表情反应数据已同步到Firebase');
                    })
                    .catch(error => {
                        console.error('同步表情反应数据到Firebase失败:', error);
                    });
            } else {
                console.log('没有表情反应数据需要同步');
            }
        } catch (error) {
            console.error('同步表情反应数据失败:', error);
        }
    }
});
