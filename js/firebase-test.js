// Firebase u6d4bu8bd5u6587u4ef6
// u7528u4e8eu6d4bu8bd5 Firebase u8fdeu63a5u548cu6570u636eu8bfbu53d6

document.addEventListener('DOMContentLoaded', function() {
    console.log('u5f00u59cbu6d4bu8bd5 Firebase u8fdeu63a5...');
    
    // u7b49u5f85 Firebase u521du59cbu5316
    if (window.firebaseInitialized) {
        testFirebase();
    } else {
        document.addEventListener('firebaseInitialized', function() {
            console.log('u6536u5230 Firebase u521du59cbu5316u5b8cu6210u4e8bu4ef6uff0cu5f00u59cbu6d4bu8bd5');
            testFirebase();
        });
        
        // u8bbeu7f6eu8d85u65f6
        setTimeout(function() {
            if (!window.firebaseInitialized) {
                console.error('Firebase u521du59cbu5316u8d85u65f6');
                document.body.insertAdjacentHTML('afterbegin', '<div style="background-color: #ffcccc; padding: 10px; margin: 10px; border: 1px solid red;">Firebase u8fdeu63a5u5931u8d25uff0cu8bf7u68c0u67e5u63a7u5236u53f0u9519u8bef</div>');
            }
        }, 5000);
    }
    
    // u6d4bu8bd5 Firebase u8fdeu63a5u548cu6570u636eu8bfbu53d6
    function testFirebase() {
        try {
            const db = firebase.database();
            
            // u6d4bu8bd5u8fdeu63a5u72b6u6001
            db.ref('.info/connected').on('value', function(snap) {
                if (snap.val() === true) {
                    console.log('u5df2u6210u529fu8fdeu63a5u5230 Firebase u6570u636eu5e93');
                    document.body.insertAdjacentHTML('afterbegin', '<div style="background-color: #ccffcc; padding: 10px; margin: 10px; border: 1px solid green;">Firebase u8fdeu63a5u6210u529f</div>');
                    
                    // u8bfbu53d6u7559u8a00u6570u636e
                    readMessages();
                } else {
                    console.log('u672au8fdeu63a5u5230 Firebase u6570u636eu5e93');
                    document.body.insertAdjacentHTML('afterbegin', '<div style="background-color: #ffcccc; padding: 10px; margin: 10px; border: 1px solid red;">Firebase u8fdeu63a5u5931u8d25</div>');
                }
            });
        } catch (error) {
            console.error('Firebase u6d4bu8bd5u5931u8d25:', error);
            document.body.insertAdjacentHTML('afterbegin', `<div style="background-color: #ffcccc; padding: 10px; margin: 10px; border: 1px solid red;">Firebase u6d4bu8bd5u5931u8d25: ${error.message}</div>`);
        }
    }
    
    // u8bfbu53d6u7559u8a00u6570u636e
    function readMessages() {
        const db = firebase.database();
        
        db.ref('messages').once('value')
            .then(snapshot => {
                console.log('Firebase u6570u636eu5febu7167:', snapshot.key);
                const data = snapshot.val();
                console.log('Firebase u6570u636eu5185u5bb9:', data);
                
                // u663eu793au7ed3u679c
                let resultHTML = '<div style="background-color: #f0f0f0; padding: 10px; margin: 10px; border: 1px solid #ccc;">';
                
                if (data) {
                    const messagesArray = Object.values(data);
                    resultHTML += `<p>u5171u627eu5230 ${messagesArray.length} u6761u7559u8a00</p>`;
                    
                    // u663eu793au524d3u6761u7559u8a00
                    const displayCount = Math.min(3, messagesArray.length);
                    for (let i = 0; i < displayCount; i++) {
                        const message = messagesArray[i];
                        resultHTML += `<div style="margin-bottom: 10px; padding: 5px; border-bottom: 1px solid #ddd;">
                            <p><strong>u4f5cu8005:</strong> ${message.author}</p>
                            <p><strong>u5185u5bb9:</strong> ${message.text}</p>
                            <p><strong>u65f6u95f4:</strong> ${message.time}</p>
                        </div>`;
                    }
                } else {
                    resultHTML += '<p>u6ca1u6709u627eu5230u7559u8a00u6570u636e</p>';
                }
                
                resultHTML += '</div>';
                document.body.insertAdjacentHTML('afterbegin', resultHTML);
            })
            .catch(error => {
                console.error('u8bfbu53d6u7559u8a00u6570u636eu5931u8d25:', error);
                document.body.insertAdjacentHTML('afterbegin', `<div style="background-color: #ffcccc; padding: 10px; margin: 10px; border: 1px solid red;">u8bfbu53d6u7559u8a00u6570u636eu5931u8d25: ${error.message}</div>`);
            });
    }
});
