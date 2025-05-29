/**
 * Firebaseu8fdeu63a5u548cu6743u9650u6d4bu8bd5u811au672c
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('u5f00u59cbu6d4bu8bd5Firebaseu8fdeu63a5u548cu6743u9650...');
    
    // u7b49u5f85Firebaseu52a0u8f7du5b8cu6210
    setTimeout(runTests, 2000);
    
    /**
     * u8fd0u884cu6d4bu8bd5
     */
    function runTests() {
        // u521bu5efau6d4bu8bd5u7ed3u679cu5bb9u5668
        const testContainer = document.createElement('div');
        testContainer.id = 'firebase-test-results';
        testContainer.style.position = 'fixed';
        testContainer.style.top = '10px';
        testContainer.style.right = '10px';
        testContainer.style.width = '300px';
        testContainer.style.padding = '10px';
        testContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        testContainer.style.color = 'white';
        testContainer.style.borderRadius = '5px';
        testContainer.style.zIndex = '9999';
        testContainer.style.fontSize = '12px';
        testContainer.style.maxHeight = '80vh';
        testContainer.style.overflowY = 'auto';
        testContainer.innerHTML = '<h3>u6d4bu8bd5u7ed3u679c</h3>';
        document.body.appendChild(testContainer);
        
        // u6d4bu8bd5Firebaseu662fu5426u5df2u52a0u8f7d
        logTestResult('Firebase SDKu52a0u8f7du72b6u6001', typeof firebase !== 'undefined');
        
        // u5982u679cFirebaseu672au52a0u8f7duff0cu505cu6b62u6d4bu8bd5
        if (typeof firebase === 'undefined') {
            logTestResult('Firebaseu6d4bu8bd5u7ed3u679c', false, 'u65e0u6cd5u7ee7u7eedu6d4bu8bd5uff0cFirebase SDKu672au52a0u8f7d');
            return;
        }
        
        // u6d4bu8bd5Firebaseu662fu5426u5df2u521du59cbu5316
        logTestResult('Firebaseu521du59cbu5316u72b6u6001', firebase.apps.length > 0);
        
        // u5982u679cFirebaseu672au521du59cbu5316uff0cu505cu6b62u6d4bu8bd5
        if (firebase.apps.length === 0) {
            logTestResult('Firebaseu6d4bu8bd5u7ed3u679c', false, 'u65e0u6cd5u7ee7u7eedu6d4bu8bd5uff0cFirebaseu672au521du59cbu5316');
            return;
        }
        
        // u6d4bu8bd5u6570u636eu5e93u8fdeu63a5
        testDatabaseConnection()
            .then(() => {
                // u6d4bu8bd5u6570u636eu5e93u8bfbu53d6u6743u9650
                return testDatabaseRead();
            })
            .then(() => {
                // u6d4bu8bd5u6570u636eu5e93u5199u5165u6743u9650
                return testDatabaseWrite();
            })
            .then(() => {
                logTestResult('Firebaseu6d4bu8bd5u5b8cu6210', true, 'u6240u6709u6d4bu8bd5u5df2u5b8cu6210');
            })
            .catch(error => {
                logTestResult('Firebaseu6d4bu8bd5u5931u8d25', false, error.message);
            });
    }
    
    /**
     * u6d4bu8bd5u6570u636eu5e93u8fdeu63a5
     */
    function testDatabaseConnection() {
        return new Promise((resolve, reject) => {
            try {
                const db = firebase.database();
                db.ref('.info/connected').once('value')
                    .then(snapshot => {
                        const connected = snapshot.val() === true;
                        logTestResult('Firebaseu6570u636eu5e93u8fdeu63a5u72b6u6001', connected);
                        if (connected) {
                            resolve();
                        } else {
                            reject(new Error('u65e0u6cd5u8fdeu63a5u5230Firebaseu6570u636eu5e93'));
                        }
                    })
                    .catch(error => {
                        logTestResult('Firebaseu6570u636eu5e93u8fdeu63a5u72b6u6001', false, error.message);
                        reject(error);
                    });
            } catch (error) {
                logTestResult('Firebaseu6570u636eu5e93u8fdeu63a5u72b6u6001', false, error.message);
                reject(error);
            }
        });
    }
    
    /**
     * u6d4bu8bd5u6570u636eu5e93u8bfbu53d6u6743u9650
     */
    function testDatabaseRead() {
        return new Promise((resolve, reject) => {
            try {
                const db = firebase.database();
                const testPath = 'test/read_test';
                
                // u5c1du8bd5u8bfbu53d6u6570u636e
                db.ref(testPath).once('value')
                    .then(snapshot => {
                        logTestResult('Firebaseu6570u636eu5e93u8bfbu53d6u6743u9650', true);
                        resolve();
                    })
                    .catch(error => {
                        logTestResult('Firebaseu6570u636eu5e93u8bfbu53d6u6743u9650', false, error.message);
                        reject(error);
                    });
            } catch (error) {
                logTestResult('Firebaseu6570u636eu5e93u8bfbu53d6u6743u9650', false, error.message);
                reject(error);
            }
        });
    }
    
    /**
     * u6d4bu8bd5u6570u636eu5e93u5199u5165u6743u9650
     */
    function testDatabaseWrite() {
        return new Promise((resolve, reject) => {
            try {
                const db = firebase.database();
                const testPath = 'test/write_test';
                const testData = {
                    timestamp: Date.now(),
                    test: true
                };
                
                // u5c1du8bd5u5199u5165u6570u636e
                db.ref(testPath).set(testData)
                    .then(() => {
                        logTestResult('Firebaseu6570u636eu5e93u5199u5165u6743u9650', true);
                        
                        // u6d4bu8bd5u5b8cu6210u540eu5220u9664u6d4bu8bd5u6570u636e
                        return db.ref(testPath).remove();
                    })
                    .then(() => {
                        logTestResult('Firebaseu6d4bu8bd5u6570u636eu6e05u7406', true);
                        resolve();
                    })
                    .catch(error => {
                        logTestResult('Firebaseu6570u636eu5e93u5199u5165u6743u9650', false, error.message);
                        reject(error);
                    });
            } catch (error) {
                logTestResult('Firebaseu6570u636eu5e93u5199u5165u6743u9650', false, error.message);
                reject(error);
            }
        });
    }
    
    /**
     * u8bb0u5f55u6d4bu8bd5u7ed3u679c
     * @param {string} testName - u6d4bu8bd5u540du79f0
     * @param {boolean} success - u662fu5426u6210u529f
     * @param {string} message - u9644u52a0u4fe1u606f
     */
    function logTestResult(testName, success, message = '') {
        const testContainer = document.getElementById('firebase-test-results');
        if (!testContainer) return;
        
        const resultItem = document.createElement('div');
        resultItem.style.marginBottom = '5px';
        resultItem.style.padding = '5px';
        resultItem.style.borderRadius = '3px';
        resultItem.style.backgroundColor = success ? 'rgba(0, 128, 0, 0.2)' : 'rgba(255, 0, 0, 0.2)';
        
        let resultText = `<strong>${testName}</strong>: ${success ? 'u2705 u6210u529f' : 'u274c u5931u8d25'}`;
        if (message) {
            resultText += `<br><small>${message}</small>`;
        }
        
        resultItem.innerHTML = resultText;
        testContainer.appendChild(resultItem);
        
        // u540cu65f6u8f93u51fau5230u63a7u5236u53f0
        console.log(`${testName}: ${success ? 'u6210u529f' : 'u5931u8d25'}${message ? ' - ' + message : ''}`);
    }
});
