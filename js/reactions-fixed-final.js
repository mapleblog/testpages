/**
 * u8868u60c5u53cdu5e94u529fu80fd - u6700u7ec8u4fee u590du7248
 * u4e13u6ce8u4e8eu89e3u51b3u8de8u8bbeu5907u540cu6b65u95eeu9898
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('u521du59cbu5316u6700u7ec8u4fee u590du7248u8868u60c5u53cdu5e94u529fu80fd');
    
    // u7b49u5f85Firebase u521du59cbu5316
    setTimeout(initModule, 1000);
    
    function initModule() {
        // u8868u60c5u53cdu5e94u7c7bu578b
        const reactionTypes = {
            'like': { icon: 'fa-thumbs-up' },
            'love': { icon: 'fa-heart' },
            'haha': { icon: 'fa-laugh' },
            'wow': { icon: 'fa-surprise' },
            'sad': { icon: 'fa-sad-tear' }
        };
        
        // u5b58u50a8u524du7f00
        const STORAGE_PREFIX = 'reaction_';
        
        // u751fu6210u7528u6237ID
        let userId = localStorage.getItem('reaction_user_id');
        if (!userId) {
            userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('reaction_user_id', userId);
        }
        
        /**
         * u521du59cbu5316u8868u60c5u53cdu5e94u529fu80fd
         * @param {string} itemType - u9879u76eeu7c7bu578b
         * @param {string} itemId - u9879u76eeID
         * @param {HTMLElement} container - u5bb9u5668
         */
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
                
                // u68c0u67e5u662fu5426u5df2u7ecfu70b9u51fbu8fc7
                const isActive = getReactionState(itemType, itemId, type);
                if (isActive) {
                    button.classList.add('active');
                }
                
                // u6dfbu52a0u70b9u51fbu4e8bu4ef6
                button.addEventListener('click', function() {
                    handleReactionClick(this, type, itemType, itemId);
                });
                
                reactionsContainer.appendChild(button);
            });
            
            // u6dfbu52a0u5230u7236u5bb9u5668
            container.appendChild(reactionsContainer);
            
            // u4eceFirebaseu52a0u8f7du6240u6709u53cdu5e94
            loadAllReactions(itemType, itemId, reactionsContainer);
            
            return reactionsContainer;
        }
        
        /**
         * u83b7u53d6u5b58u50a8u952e
         */
        function getStorageKey(itemType, itemId, reactionType) {
            return `${STORAGE_PREFIX}${itemType}_${itemId}_${reactionType}`;
        }
        
        /**
         * u83b7u53d6u53cdu5e94u72b6u6001
         */
        function getReactionState(itemType, itemId, reactionType) {
            const key = getStorageKey(itemType, itemId, reactionType);
            return localStorage.getItem(key) === 'true';
        }
        
        /**
         * u8bbeu7f6eu53cdu5e94u72b6u6001
         */
        function setReactionState(itemType, itemId, reactionType, state) {
            const key = getStorageKey(itemType, itemId, reactionType);
            if (state) {
                localStorage.setItem(key, 'true');
            } else {
                localStorage.removeItem(key);
            }
        }
        
        /**
         * u5904u7406u8868u60c5u70b9u51fb
         */
        function handleReactionClick(button, type, itemType, itemId) {
            console.log(`u70b9u51fbu8868u60c5: ${type} for ${itemType}/${itemId}`);
            
            // u5207u6362u6fc0u6d3bu72b6u6001
            const isActive = !button.classList.contains('active');
            
            if (isActive) {
                button.classList.add('active');
                // u6dfbu52a0u70b9u51fbu52a8u753b
                button.classList.add('just-clicked');
                setTimeout(() => {
                    button.classList.remove('just-clicked');
                }, 300);
            } else {
                button.classList.remove('active');
            }
            
            // u4fddu5b58u5230u672cu5730u5b58u50a8
            setReactionState(itemType, itemId, type, isActive);
            
            // u4fddu5b58u5230Firebase
            saveReactionToFirebase(itemType, itemId, type, isActive);
        }
        
        /**
         * u4fddu5b58u53cdu5e94u5230Firebase
         */
        function saveReactionToFirebase(itemType, itemId, reactionType, isActive) {
            try {
                // u68c0u67e5Firebase u662fu5426u53efu7528
                if (typeof firebase === 'undefined') {
                    console.error('Firebase SDKu672au52a0u8f7d');
                    return Promise.reject(new Error('Firebase SDKu672au52a0u8f7d'));
                }
                
                if (firebase.apps.length === 0) {
                    console.error('Firebaseu672au521du59cbu5316');
                    return Promise.reject(new Error('Firebaseu672au521du59cbu5316'));
                }
                
                // u83b7u53d6u6570u636eu5e93u5b9eu4f8b
                const db = firebase.database();
                
                // u8bbeu7f6eu6570u636eu8defu5f84
                const basePath = `reactions_final/${itemType}/${itemId}`;
                const userPath = `${basePath}/${reactionType}/${userId}`;
                
                console.log(`u4fddu5b58u53cdu5e94u5230Firebase: ${userPath}, u72b6u6001: ${isActive}`);
                
                // u5982u679cu4e3au6fc0u6d3bu72b6u6001uff0cu8bbeu7f6eu4e3atrueuff0cu5426u5219u5220u9664u8be5u8282u70b9
                return isActive ? 
                    db.ref(userPath).set(true) : 
                    db.ref(userPath).remove();
            } catch (error) {
                console.error('u4fddu5b58u53cdu5e94u5931u8d25:', error);
                return Promise.reject(error);
            }
        }
        
        /**
         * u4eceFirebaseu52a0u8f7du6240u6709u53cdu5e94
         */
        function loadAllReactions(itemType, itemId, container) {
            try {
                // u68c0u67e5Firebase u662fu5426u53efu7528
                if (typeof firebase === 'undefined') {
                    console.error('Firebase SDKu672au52a0u8f7d');
                    return;
                }
                
                if (firebase.apps.length === 0) {
                    console.error('Firebaseu672au521du59cbu5316');
                    return;
                }
                
                // u83b7u53d6u6570u636eu5e93u5b9eu4f8b
                const db = firebase.database();
                
                // u904du5386u6240u6709u53cdu5e94u7c7bu578b
                Object.keys(reactionTypes).forEach(type => {
                    const basePath = `reactions_final/${itemType}/${itemId}/${type}`;
                    
                    // u76d1u542cu8be5u7c7bu578bu7684u6240u6709u53cdu5e94
                    db.ref(basePath).on('value', snapshot => {
                        const data = snapshot.val() || {};
                        const userIds = Object.keys(data);
                        
                        // u68c0u67e5u5f53u524du7528u6237u662fu5426u5df2u7ecfu53cdu5e94
                        const hasReacted = userIds.includes(userId);
                        
                        // u66f4u65b0u6309u94aeu72b6u6001
                        const button = container.querySelector(`.reaction-button[data-reaction="${type}"]`);
                        if (button) {
                            if (hasReacted) {
                                button.classList.add('active');
                                // u66f4u65b0u672cu5730u5b58u50a8
                                setReactionState(itemType, itemId, type, true);
                            } else {
                                button.classList.remove('active');
                                // u66f4u65b0u672cu5730u5b58u50a8
                                setReactionState(itemType, itemId, type, false);
                            }
                        }
                        
                        console.log(`u52a0u8f7du53cdu5e94u5b8cu6210: ${basePath}, u7528u6237u6570: ${userIds.length}`);
                    }, error => {
                        console.error(`u76d1u542cu53cdu5e94u5931u8d25: ${basePath}`, error);
                    });
                });
            } catch (error) {
                console.error('u52a0u8f7du53cdu5e94u5931u8d25:', error);
            }
        }
        
        // u5bfcu51fau516cu5171API
        window.ReactionsModule = {
            initReactions: initReactions
        };
    }
});
