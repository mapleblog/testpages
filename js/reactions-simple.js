/**
 * u8868u60c5u53cdu5e94u529fu80fd - u7b80u5316u7248
 * u4e13u6ce8u4e8eu89e3u51b3u8de8u8bbeu5907u540cu6b65u95eeu9898
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('u521du59cbu5316u7b80u5316u7248u8868u60c5u53cdu5e94u529fu80fd');
    
    // u8868u60c5u53cdu5e94u7c7bu578b
    const reactionTypes = {
        'like': { icon: 'fa-thumbs-up' },
        'love': { icon: 'fa-heart' },
        'haha': { icon: 'fa-laugh' },
        'wow': { icon: 'fa-surprise' },
        'sad': { icon: 'fa-sad-tear' }
    };
    
    // u521du59cbu5316u8868u60c5u53cdu5e94u529fu80fd
    function initReactions(itemType, itemId, container) {
        console.log(`u521du59cbu5316u8868u60c5u53cdu5e94: ${itemType}/${itemId}`);
        
        // u521bu5efau8868u60c5u53cdu5e94u5bb9u5668
        const reactionsContainer = document.createElement('div');
        reactionsContainer.className = 'reactions-container';
        reactionsContainer.dataset.itemType = itemType;
        reactionsContainer.dataset.itemId = itemId;
        
        // u521bu5efau8868u60c5u6309u94ae
        Object.keys(reactionTypes).forEach(type => {
            const button = document.createElement('div');
            button.className = 'reaction-button';
            button.dataset.reaction = type;
            button.dataset.itemType = itemType;
            button.dataset.itemId = itemId;
            button.innerHTML = `<i class="fas ${reactionTypes[type].icon}"></i>`;
            
            // u6dfbu52a0u70b9u51fbu4e8bu4ef6
            button.addEventListener('click', function() {
                handleReactionClick(this, type, itemType, itemId);
            });
            
            reactionsContainer.appendChild(button);
        });
        
        // u6dfbu52a0u5230u7236u5bb9u5668
        container.appendChild(reactionsContainer);
        
        // u4eceFirebaseu52a0u8f7du72b6u6001
        loadReactionState(itemType, itemId, reactionsContainer);
        
        // u8bbeu7f6eu76d1u542c
        setupRealtimeListener(itemType, itemId, reactionsContainer);
        
        return reactionsContainer;
    }
    
    // u5904u7406u8868u60c5u70b9u51fb
    function handleReactionClick(button, type, itemType, itemId) {
        console.log(`u70b9u51fbu8868u60c5: ${type} for ${itemType}/${itemId}`);
        
        // u5207u6362u6fc0u6d3bu72b6u6001
        const isActive = button.classList.toggle('active');
        
        // u6dfbu52a0u70b9u51fbu52a8u753b
        if (isActive) {
            button.classList.add('just-clicked');
            setTimeout(() => {
                button.classList.remove('just-clicked');
            }, 300);
        }
        
        // u4fddu5b58u5230Firebase
        saveReactionToFirebase(itemType, itemId, type, isActive);
    }
    
    // u4fddu5b58u8868u60c5u72b6u6001u5230Firebase
    function saveReactionToFirebase(itemType, itemId, reactionType, isActive) {
        if (typeof firebase === 'undefined' || firebase.apps.length === 0) {
            console.error('Firebaseu672au521du59cbu5316uff0cu65e0u6cd5u4fddu5b58u8868u60c5u53cdu5e94');
            return Promise.reject(new Error('Firebaseu672au521du59cbu5316'));
        }
        
        try {
            // u751fu6210u8bbeu5907ID
            let deviceId = localStorage.getItem('device_id');
            if (!deviceId) {
                deviceId = 'device_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                localStorage.setItem('device_id', deviceId);
            }
            
            const db = firebase.database();
            const path = `simple_reactions/${itemType}/${itemId}/${reactionType}/${deviceId}`;
            
            console.log(`u4fddu5b58u8868u60c5u72b6u6001u5230Firebase: ${path}, u72b6u6001: ${isActive}`);
            
            return db.ref(path).set(isActive ? true : null)
                .then(() => {
                    console.log(`u8868u60c5u72b6u6001u4fddu5b58u6210u529f: ${path}`);
                    return true;
                })
                .catch(error => {
                    console.error(`u8868u60c5u72b6u6001u4fddu5b58u5931u8d25: ${path}`, error);
                    throw error;
                });
        } catch (error) {
            console.error('u4fddu5b58u8868u60c5u72b6u6001u5931u8d25:', error);
            return Promise.reject(error);
        }
    }
    
    // u4eceFirebaseu52a0u8f7du8868u60c5u72b6u6001
    function loadReactionState(itemType, itemId, container) {
        if (typeof firebase === 'undefined' || firebase.apps.length === 0) {
            console.error('Firebaseu672au521du59cbu5316uff0cu65e0u6cd5u52a0u8f7du8868u60c5u53cdu5e94');
            return;
        }
        
        try {
            // u83b7u53d6u8bbeu5907ID
            const deviceId = localStorage.getItem('device_id');
            if (!deviceId) return;
            
            const db = firebase.database();
            
            // u904du5386u6240u6709u8868u60c5u7c7bu578b
            Object.keys(reactionTypes).forEach(type => {
                const path = `simple_reactions/${itemType}/${itemId}/${type}/${deviceId}`;
                
                db.ref(path).once('value')
                    .then(snapshot => {
                        const isActive = snapshot.val() === true;
                        
                        // u66f4u65b0u6309u94aeu72b6u6001
                        const button = container.querySelector(`.reaction-button[data-reaction="${type}"]`);
                        if (button) {
                            if (isActive) {
                                button.classList.add('active');
                            } else {
                                button.classList.remove('active');
                            }
                        }
                    })
                    .catch(error => {
                        console.error(`u52a0u8f7du8868u60c5u72b6u6001u5931u8d25: ${path}`, error);
                    });
            });
        } catch (error) {
            console.error('u52a0u8f7du8868u60c5u72b6u6001u5931u8d25:', error);
        }
    }
    
    // u8bbeu7f6eu5b9eu65f6u76d1u542c
    function setupRealtimeListener(itemType, itemId, container) {
        if (typeof firebase === 'undefined' || firebase.apps.length === 0) {
            console.error('Firebaseu672au521du59cbu5316uff0cu65e0u6cd5u8bbeu7f6eu76d1u542c');
            return;
        }
        
        try {
            const db = firebase.database();
            
            // u83b7u53d6u8bbeu5907ID
            const deviceId = localStorage.getItem('device_id');
            if (!deviceId) return;
            
            // u76d1u542cu6240u6709u8868u60c5u7c7bu578b
            Object.keys(reactionTypes).forEach(type => {
                // u76d1u542cu6240u6709u8bbeu5907u7684u53cdu5e94
                const path = `simple_reactions/${itemType}/${itemId}/${type}`;
                
                db.ref(path).on('value', snapshot => {
                    console.log(`u68c0u6d4bu5230u8868u60c5u72b6u6001u53d8u5316: ${path}`);
                    
                    // u68c0u67e5u5f53u524du8bbeu5907u7684u72b6u6001
                    const deviceState = snapshot.child(deviceId).val() === true;
                    
                    // u66f4u65b0u6309u94aeu72b6u6001
                    const button = container.querySelector(`.reaction-button[data-reaction="${type}"]`);
                    if (button) {
                        if (deviceState) {
                            button.classList.add('active');
                        } else {
                            button.classList.remove('active');
                        }
                    }
                }, error => {
                    console.error(`u76d1u542cu8868u60c5u72b6u6001u5931u8d25: ${path}`, error);
                });
            });
        } catch (error) {
            console.error('u8bbeu7f6eu8868u60c5u76d1u542cu5931u8d25:', error);
        }
    }
    
    // u5bfcu51fau516cu5171API
    window.ReactionsModule = {
        initReactions: initReactions,
        loadReactionState: loadReactionState
    };
});
