/**
 * 表情反应功能调试模块
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('初始化表情反应调试功能');
    
    // 等待Firebase加载完成
    setTimeout(function() {
        console.log('开始检查Firebase连接状态...');
        checkFirebaseConnection();
    }, 2000);
    
    /**
     * 检查Firebase连接状态
     */
    function checkFirebaseConnection() {
        if (typeof firebase === 'undefined') {
            console.error('❌ Firebase未定义，请确保Firebase SDK已正确加载');
            return;
        }
        
        if (!firebase.apps.length) {
            console.error('❌ Firebase未初始化，请确保firebase.initializeApp已被调用');
            return;
        }
        
        try {
            const db = firebase.database();
            
            // 测试数据库连接
            db.ref('.info/connected').on('value', function(snap) {
                if (snap.val() === true) {
                    console.log('✅ 已连接到Firebase数据库');
                    testReactionsDatabase();
                } else {
                    console.error('❌ 未连接到Firebase数据库');
                }
            });
        } catch (error) {
            console.error('Firebase连接测试失败:', error);
        }
    }
    
    /**
     * 测试表情反应数据库
     */
    function testReactionsDatabase() {
        console.log('测试表情反应数据库...');
        
        try {
            const db = firebase.database();
            const testPath = 'reactions/test/debug-' + Date.now();
            
            // 测试写入
            const testData = {
                timestamp: Date.now(),
                test: true
            };
            
            db.ref(testPath).set(testData)
                .then(() => {
                    console.log('✅ 表情反应数据库写入测试成功');
                    
                    // 测试读取
                    return db.ref(testPath).once('value');
                })
                .then((snapshot) => {
                    const data = snapshot.val();
                    if (data && data.test === true) {
                        console.log('✅ 表情反应数据库读取测试成功');
                        console.log('✅ 表情反应功能应该可以正常工作');
                        
                        // 清理测试数据
                        return db.ref(testPath).remove();
                    } else {
                        console.error('❌ 表情反应数据库读取测试失败');
                    }
                })
                .then(() => {
                    console.log('✅ 测试数据清理完成');
                    monitorReactions();
                })
                .catch((error) => {
                    console.error('表情反应数据库测试失败:', error);
                });
        } catch (error) {
            console.error('表情反应数据库测试失败:', error);
        }
    }
    
    /**
     * 监控表情反应数据变化
     */
    function monitorReactions() {
        console.log('开始监控表情反应数据变化...');
        
        try {
            const db = firebase.database();
            
            // 监听所有表情反应数据变化
            db.ref('reactions').on('child_changed', function(snapshot) {
                console.log('检测到表情反应数据变化:', snapshot.key);
            });
            
            console.log('✅ 表情反应数据监控已启动');
        } catch (error) {
            console.error('设置表情反应数据监控失败:', error);
        }
    }
});
