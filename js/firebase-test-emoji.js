/**
 * Firebaseu8868u60c5u529fu80fdu6d4bu8bd5u811au672c
 * u7528u4e8eu6d4bu8bd5Firebaseu8fdeu63a5u548cu6743u9650
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('u5f00u59cbu6d4bu8bd5Firebaseu8868u60c5u529fu80fd...');
    
    // u521bu5efau6d4bu8bd5u5bb9u5668
    const testContainer = document.createElement('div');
    testContainer.id = 'firebase-emoji-test';
    testContainer.style.position = 'fixed';
    testContainer.style.top = '10px';
    testContainer.style.right = '10px';
    testContainer.style.padding = '10px';
    testContainer.style.background = 'rgba(0, 0, 0, 0.7)';
    testContainer.style.color = 'white';
    testContainer.style.borderRadius = '5px';
    testContainer.style.fontSize = '12px';
    testContainer.style.zIndex = '9999';
    testContainer.style.maxWidth = '300px';
    testContainer.style.maxHeight = '400px';
    testContainer.style.overflow = 'auto';
    document.body.appendChild(testContainer);
    
    // u6dfbu52a0u6807u9898
    const title = document.createElement('h3');
    title.textContent = 'Firebaseu8868u60c5u6d4bu8bd5';
    title.style.margin = '0 0 10px 0';
    title.style.fontSize = '14px';
    testContainer.appendChild(title);
    
    // u6dfbu52a0u65e5u5fd7u533au57df
    const logArea = document.createElement('div');
    logArea.id = 'firebase-emoji-test-log';
    testContainer.appendChild(logArea);
    
    // u6dfbu52a0u6d4bu8bd5u6309u94ae
    const testButton = document.createElement('button');
    testButton.textContent = 'u8fd0u884cu6d4bu8bd5';
    testButton.style.marginTop = '10px';
    testButton.style.padding = '5px 10px';
    testButton.style.background = '#4CAF50';
    testButton.style.color = 'white';
    testButton.style.border = 'none';
    testButton.style.borderRadius = '3px';
    testButton.style.cursor = 'pointer';
    testContainer.appendChild(testButton);
    
    // u6dfbu52a0u65e5u5fd7u51fdu6570
    function log(message, isError = false) {
        const logEntry = document.createElement('div');
        logEntry.textContent = `${new Date().toLocaleTimeString()}: ${message}`;
        logEntry.style.margin = '5px 0';
        logEntry.style.color = isError ? '#FF5252' : '#8BC34A';
        logArea.appendChild(logEntry);
        console.log(message);
    }
    
    // u6d4bu8bd5Firebaseu8fdeu63a5
    function testFirebaseConnection() {
        log('u5f00u59cbu6d4bu8bd5Firebaseu8fdeu63a5...');
        
        // u68c0u67e5Firebaseu662fu5426u5df2u52a0u8f7d
        if (typeof firebase === 'undefined') {
            log('Firebase SDKu672au52a0u8f7d', true);
            return;
        }
        
        log('Firebase SDKu5df2u52a0u8f7d');
        
        // u68c0u67e5Firebaseu662fu5426u5df2u521du59cbu5316
        if (firebase.apps.length === 0) {
            log('Firebaseu672au521du59cbu5316', true);
            return;
        }
        
        log(`Firebaseu5df2u521du59cbu5316uff0cu5e94u7528u6570u91cf: ${firebase.apps.length}`);
        
        // u83b7u53d6u6570u636eu5e93u5f15u7528
        const db = firebase.database();
        if (!db) {
            log('u65e0u6cd5u83b7u53d6u6570u636eu5e93u5f15u7528', true);
            return;
        }
        
        log('u6210u529fu83b7u53d6u6570u636eu5e93u5f15u7528');
        
        // u68c0u67e5u8fdeu63a5u72b6u6001
        db.ref('.info/connected').on('value', snapshot => {
            const connected = snapshot.val() === true;
            if (connected) {
                log('u5df2u8fdeu63a5u5230Firebaseu6570u636eu5e93');
                testDatabasePermissions(db);
            } else {
                log('u672au8fdeu63a5u5230Firebaseu6570u636eu5e93', true);
            }
        });
    }
    
    // u6d4bu8bd5u6570u636eu5e93u6743u9650
    function testDatabasePermissions(db) {
        log('u5f00u59cbu6d4bu8bd5u6570u636eu5e93u6743u9650...');
        
        // u6d4bu8bd5u8defu5f84
        const testPath = 'emoji_test/permission_test';
        const deviceId = localStorage.getItem('device_id') || 'test_device';
        
        // u6d4bu8bd5u5199u5165u6743u9650
        log(`u6d4bu8bd5u5199u5165u6743u9650: ${testPath}`);
        db.ref(testPath).set({
            timestamp: firebase.database.ServerValue.TIMESTAMP,
            deviceId: deviceId,
            message: 'u6d4bu8bd5u6210u529f'
        })
        .then(() => {
            log('u5199u5165u6d4bu8bd5u6210u529f');
            
            // u6d4bu8bd5u8bfbu53d6u6743u9650
            log(`u6d4bu8bd5u8bfbu53d6u6743u9650: ${testPath}`);
            return db.ref(testPath).once('value');
        })
        .then(snapshot => {
            const data = snapshot.val();
            if (data) {
                log(`u8bfbu53d6u6d4bu8bd5u6210u529f: ${JSON.stringify(data)}`);
                
                // u6d4bu8bd5u8868u60c5u529fu80fdu7684u8defu5f84
                testEmojiPath(db);
            } else {
                log('u8bfbu53d6u6d4bu8bd5u5931u8d25: u6570u636eu4e3au7a7a', true);
            }
        })
        .catch(error => {
            log(`u6d4bu8bd5u5931u8d25: ${error.message}`, true);
        });
    }
    
    // u6d4bu8bd5u8868u60c5u529fu80fdu7684u8defu5f84
    function testEmojiPath(db) {
        log('u5f00u59cbu6d4bu8bd5u8868u60c5u529fu80fdu8defu5f84...');
        
        // u6d4bu8bd5u8defu5f84
        const testPath = 'emojis/TEST/test_message';
        const deviceId = localStorage.getItem('device_id') || 'test_device';
        
        // u6d4bu8bd5u5199u5165u6743u9650
        log(`u6d4bu8bd5u8868u60c5u5199u5165: ${testPath}/thumbs_up/${deviceId}`);
        db.ref(`${testPath}/thumbs_up/${deviceId}`).set({
            timestamp: firebase.database.ServerValue.TIMESTAMP
        })
        .then(() => {
            log('u8868u60c5u5199u5165u6d4bu8bd5u6210u529f');
            
            // u6d4bu8bd5u8bfbu53d6u6743u9650
            log(`u6d4bu8bd5u8868u60c5u8bfbu53d6: ${testPath}`);
            return db.ref(testPath).once('value');
        })
        .then(snapshot => {
            const data = snapshot.val();
            if (data) {
                log(`u8868u60c5u8bfbu53d6u6d4bu8bd5u6210u529f: ${JSON.stringify(data)}`);
                
                // u6d4bu8bd5u5220u9664
                return db.ref(`${testPath}/thumbs_up/${deviceId}`).remove();
            } else {
                log('u8868u60c5u8bfbu53d6u6d4bu8bd5u5931u8d25: u6570u636eu4e3au7a7a', true);
            }
        })
        .then(() => {
            log('u8868u60c5u5220u9664u6d4bu8bd5u6210u529f');
            log('u6240u6709u6d4bu8bd5u5b8cu6210uff01');
        })
        .catch(error => {
            log(`u8868u60c5u6d4bu8bd5u5931u8d25: ${error.message}`, true);
        });
    }
    
    // u6dfbu52a0u6d4bu8bd5u6309u94aeu4e8bu4ef6
    testButton.addEventListener('click', function() {
        // u6e05u7a7au65e5u5fd7
        logArea.innerHTML = '';
        // u8fd0u884cu6d4bu8bd5
        testFirebaseConnection();
    });
    
    // u81eau52a8u8fd0u884cu6d4bu8bd5
    setTimeout(testFirebaseConnection, 2000);
});
