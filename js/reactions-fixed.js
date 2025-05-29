/**
 * u8868u60c5u53cdu5e94u529fu80fdu6a21u5757
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('u521du59cbu5316u8868u60c5u53cdu5e94u529fu80fd');
    
    // u8868u60c5u53cdu5e94u914du7f6e
    const reactionTypes = {
        'like': { icon: 'fa-thumbs-up', label: 'u8d5e' },
        'love': { icon: 'fa-heart', label: 'u7231' },
        'haha': { icon: 'fa-laugh', label: 'u54c8u54c8' },
        'wow': { icon: 'fa-surprise', label: 'u54c7' },
        'sad': { icon: 'fa-sad-tear', label: 'u4f24u5fc3' }
    };
    
    // u5b58u50a8u8868u60c5u53cdu5e94u7684u952eu540du524du7f00
    const STORAGE_KEYS = {
        MESSAGE: 'message_reactions_',
        MOOD: 'mood_reactions_',
        WISH: 'wish_reactions_'
    };
    
    /**
     * u521du59cbu5316u8868u60c5u53cdu5e94u529fu80fd
     * @param {string} itemType - u9879u76eeu7c7bu578buff1a'message', 'mood', 'wish'
     * @param {string} itemId - u9879u76eeID
     * @param {HTMLElement} container - u653eu7f6eu8868u60c5u53cdu5e94u7684u5bb9u5668
     */
    function initReactions(itemType, itemId, container) {
        // u521bu5efau8868u60c5u53cdu5e94u5bb9u5668
        const reactionsContainer = document.createElement('div');
        reactionsContainer.className = 'reactions-container';
        reactionsContainer.dataset.itemType = itemType;
        reactionsContainer.dataset.itemId = itemId;
        
        // u9996u5148u4eceu672cu5730u5b58u50a8u83b7u53d6u6570u636e
        const storageKey = getStorageKey(itemType, itemId);
        const reactions = getReactionsFromStorage(storageKey);
        
        // u521bu5efau5404u79cdu8868u60c5u6309u94ae
        createReactionButtons(reactionsContainer, reactions, storageKey, itemType, itemId);
        
        // u6dfbu52a0u5230u7236u5bb9u5668
        container.appendChild(reactionsContainer);
        
        // u4eceFirebaseu52a0u8f7du6700u65b0u6570u636eu5e76u66f4u65b0UI
        loadReactionsFromFirebase(itemType, itemId).then(firebaseReactions => {
            if (firebaseReactions && Object.keys(firebaseReactions).length > 0) {
                // u5982u679cu4eceFirebaseu83b7u53d6u5230u6570u636euff0cu66f4u65b0u5230u672cu5730u5b58u50a8
                saveReactionsToStorage(storageKey, firebaseReactions);
                
                // u91cdu65b0u521bu5efau6309u94aeu4ee5u53cdu6620u6700u65b0u6570u636e
                updateReactionButtons(reactionsContainer, firebaseReactions, storageKey);
            }
        }).catch(error => {
            console.error('u4eceFirebaseu52a0u8f7du8868u60c5u53cdu5e94u5931u8d25:', error);
        });
        
        // u8bbeu7f6eu5b9eu65f6u76d1u542c
        setupRealtimeListener(itemType, itemId, reactionsContainer);
    }
    
    /**
     * u521bu5efau8868u60c5u53cdu5e94u6309u94ae
     * @param {HTMLElement} container - u8868u60c5u53cdu5e94u5bb9u5668
     * @param {Object} reactions - u8868u60c5u53cdu5e94u6570u636e
     * @param {string} storageKey - u5b58u50a8u952eu540d
     * @param {string} itemType - u9879u76eeu7c7bu578b
     * @param {string} itemId - u9879u76eeID
     */
    function createReactionButtons(container, reactions, storageKey, itemType, itemId) {
        // u6e05u7a7au5bb9u5668
        container.innerHTML = '';
        
        // u521bu5efau5404u79cdu8868u60c5u6309u94ae
        Object.keys(reactionTypes).forEach(reactionType => {
            const { icon } = reactionTypes[reactionType];
            
            // u521bu5efau8868u60c5u6309u94ae
            const reactionButton = document.createElement('div');
            reactionButton.className = 'reaction-button';
            reactionButton.dataset.reaction = reactionType;
            reactionButton.dataset.itemId = itemId;
            reactionButton.dataset.itemType = itemType;
            
            // u5982u679cu7528u6237u5df2u70b9u51fbu8fc7u6b64u8868u60c5uff0cu6dfbu52a0activeu7c7b
            if (hasUserReacted(storageKey, reactionType)) {
                reactionButton.classList.add('active');
            }
            
            // u8bbeu7f6eu6309u94aeu5185u5bb9 - u53eau663eu793au56feu6807
            reactionButton.innerHTML = `
                <i class="fas ${icon}"></i>
            `;
            
            // u6dfbu52a0u70b9u51fbu4e8bu4ef6
            reactionButton.addEventListener('click', handleReactionClick);
            
            // u6dfbu52a0u5230u5bb9u5668
            container.appendChild(reactionButton);
        });
    }
    
    /**
     * u66f4u65b0u8868u60c5u53cdu5e94u6309u94aeu72b6u6001
     * @param {HTMLElement} container - u8868u60c5u53cdu5e94u5bb9u5668
     * @param {Object} reactions - u8868u60c5u53cdu5e94u6570u636e
     * @param {string} storageKey - u5b58u50a8u952eu540d
     */
    function updateReactionButtons(container, reactions, storageKey) {
        // u83b7u53d6u6240u6709u8868u60c5u6309u94ae
        const buttons = container.querySelectorAll('.reaction-button');
        
        // u66f4u65b0u6bcfu4e2au6309u94aeu7684u72b6u6001
        buttons.forEach(button => {
            const reactionType = button.dataset.reaction;
            
            // u66f4u65b0u6fc0u6d3bu72b6u6001
            if (hasUserReacted(storageKey, reactionType)) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });
    }
    
    /**
     * u5904u7406u8868u60c5u6309u94aeu70b9u51fbu4e8bu4ef6
     * @param {Event} event - u70b9u51fbu4e8bu4ef6
     */
    function handleReactionClick(event) {
        const button = event.currentTarget;
        const reactionType = button.dataset.reaction;
        const itemId = button.dataset.itemId;
        const itemType = button.dataset.itemType;
        const storageKey = getStorageKey(itemType, itemId);
        
        // u83b7u53d6u5f53u524du53cdu5e94u6570u636e
        const reactions = getReactionsFromStorage(storageKey);
        
        // u68c0u67e5u7528u6237u662fu5426u5df2u7ecfu70b9u51fbu8fc7u6b64u8868u60c5
        const hasReacted = hasUserReacted(storageKey, reactionType);
        
        // u66f4u65b0u53cdu5e94u6570u636e
        if (hasReacted) {
            // u5982u679cu5df2u70b9u51fbuff0cu5219u53d6u6d88
            reactions[reactionType] = Math.max(0, (reactions[reactionType] || 0) - 1);
            removeUserReaction(storageKey, reactionType);
            button.classList.remove('active');
        } else {
            // u5982u679cu672au70b9u51fbuff0cu5219u6dfbu52a0
            reactions[reactionType] = (reactions[reactionType] || 0) + 1;
            addUserReaction(storageKey, reactionType);
            button.classList.add('active');
            
            // u6dfbu52a0u70b9u51fbu52a8u753b
            button.classList.add('just-clicked');
            setTimeout(() => {
                button.classList.remove('just-clicked');
            }, 300);
        }
        
        // u4fddu5b58u5230u5b58u50a8
        saveReactionsToStorage(storageKey, reactions);
        
        // u4fddu5b58u5230Firebaseuff0cu786eu4fddu8de8u8bbeu5907u540cu6b65
        saveReactionsToFirebase(itemType, itemId, reactions)
            .then(() => {
                console.log(`u8868u60c5u53cdu5e94u5df2u540cu6b65u5230Firebase: ${itemType}/${itemId}`);
            })
            .catch(error => {
                console.error('u540cu6b65u8868u60c5u53cdu5e94u5230Firebaseu5931u8d25:', error);
            });
    }
    
    /**
     * u83b7u53d6u5b58u50a8u952eu540d
     * @param {string} itemType - u9879u76eeu7c7bu578b
     * @param {string} itemId - u9879u76eeID
     * @returns {string} u5b58u50a8u952eu540d
     */
    function getStorageKey(itemType, itemId) {
        const prefix = STORAGE_KEYS[itemType.toUpperCase()];
        return prefix + itemId;
    }
    
    /**
     * u4eceu5b58u50a8u4e2du83b7u53d6u8868u60c5u53cdu5e94u6570u636e
     * @param {string} storageKey - u5b58u50a8u952eu540d
     * @returns {Object} u8868u60c5u53cdu5e94u6570u636e
     */
    function getReactionsFromStorage(storageKey) {
        const reactionsJson = localStorage.getItem(storageKey);
        return reactionsJson ? JSON.parse(reactionsJson) : {};
    }
    
    /**
     * u4fddu5b58u8868u60c5u53cdu5e94u6570u636eu5230u5b58u50a8
     * @param {string} storageKey - u5b58u50a8u952eu540d
     * @param {Object} reactions - u8868u60c5u53cdu5e94u6570u636e
     */
    function saveReactionsToStorage(storageKey, reactions) {
        localStorage.setItem(storageKey, JSON.stringify(reactions));
    }
    
    /**
     * u68c0u67e5u7528u6237u662fu5426u5df2u70b9u51fbu8fc7u67d0u8868u60c5
     * @param {string} storageKey - u5b58u50a8u952eu540d
     * @param {string} reactionType - u8868u60c5u7c7bu578b
     * @returns {boolean} u662fu5426u5df2u70b9u51fb
     */
    function hasUserReacted(storageKey, reactionType) {
        const userReactionsKey = 'user_' + storageKey;
        const userReactions = localStorage.getItem(userReactionsKey);
        if (!userReactions) return false;
        
        const reactionsArray = JSON.parse(userReactions);
        return reactionsArray.includes(reactionType);
    }
    
    /**
     * u6dfbu52a0u7528u6237u8868u60c5u53cdu5e94u8bb0u5f55
     * @param {string} storageKey - u5b58u50a8u952eu540d
     * @param {string} reactionType - u8868u60c5u7c7bu578b
     */
    function addUserReaction(storageKey, reactionType) {
        const userReactionsKey = 'user_' + storageKey;
        const userReactions = localStorage.getItem(userReactionsKey);
        
        let reactionsArray = [];
        if (userReactions) {
            reactionsArray = JSON.parse(userReactions);
        }
        
        if (!reactionsArray.includes(reactionType)) {
            reactionsArray.push(reactionType);
        }
        
        localStorage.setItem(userReactionsKey, JSON.stringify(reactionsArray));
    }
    
    /**
     * u79fbu9664u7528u6237u8868u60c5u53cdu5e94u8bb0u5f55
     * @param {string} storageKey - u5b58u50a8u952eu540d
     * @param {string} reactionType - u8868u60c5u7c7bu578b
     */
    function removeUserReaction(storageKey, reactionType) {
        const userReactionsKey = 'user_' + storageKey;
        const userReactions = localStorage.getItem(userReactionsKey);
        
        if (!userReactions) return;
        
        let reactionsArray = JSON.parse(userReactions);
        reactionsArray = reactionsArray.filter(type => type !== reactionType);
        
        localStorage.setItem(userReactionsKey, JSON.stringify(reactionsArray));
    }
    
    /**
     * u4fddu5b58u8868u60c5u53cdu5e94u5230Firebase
     * @param {string} itemType - u9879u76eeu7c7bu578b
     * @param {string} itemId - u9879u76eeID
     * @param {Object} reactions - u8868u60c5u53cdu5e94u6570u636e
     * @returns {Promise} - u8fd4u56deu4e00u4e2aPromiseu5bf9u8c61
     */
    function saveReactionsToFirebase(itemType, itemId, reactions) {
        return new Promise((resolve, reject) => {
            try {
                if (typeof firebase !== 'undefined' && firebase.apps.length > 0) {
                    const db = firebase.database();
                    const path = `reactions/${itemType}/${itemId}`;
                    
                    db.ref(path).set(reactions)
                        .then(() => {
                            console.log(`u8868u60c5u53cdu5e94u5df2u4fddu5b58u5230 Firebase: ${path}`);
                            resolve();
                        })
                        .catch(error => {
                            console.error('u4fddu5b58u8868u60c5u53cdu5e94u5230 Firebase u5931u8d25:', error);
                            reject(error);
                        });
                } else {
                    console.warn('Firebase u672au521du59cbu5316uff0cu65e0u6cd5u4fddu5b58u8868u60c5u53cdu5e94');
                    resolve(); // u4ecdu7136u89e3u6790Promiseuff0cu4ee5u514du963bu585eu6d41u7a0b
                }
            } catch (error) {
                console.error('Firebase u64cdu4f5cu5931u8d25:', error);
                reject(error);
            }
        });
    }
    
    /**
     * u4eceFirebaseu52a0u8f7du8868u60c5u53cdu5e94
     * @param {string} itemType - u9879u76eeu7c7bu578b
     * @param {string} itemId - u9879u76eeID
     * @returns {Promise<Object>} u8868u60c5u53cdu5e94u6570u636e
     */
    function loadReactionsFromFirebase(itemType, itemId) {
        return new Promise((resolve, reject) => {
            try {
                if (typeof firebase !== 'undefined' && firebase.apps.length > 0) {
                    const db = firebase.database();
                    const path = `reactions/${itemType}/${itemId}`;
                    
                    db.ref(path).once('value')
                        .then(snapshot => {
                            const reactions = snapshot.val() || {};
                            resolve(reactions);
                        })
                        .catch(error => {
                            console.error('u4ece Firebase u52a0u8f7du8868u60c5u53cdu5e94u5931u8d25:', error);
                            reject(error);
                        });
                } else {
                    resolve({});
                }
            } catch (error) {
                console.error('Firebase u64cdu4f5cu5931u8d25:', error);
                resolve({});
            }
        });
    }
    
    /**
     * u8bbeu7f6eu5b9eu65f6u6570u636eu76d1u542c
     * @param {string} itemType - u9879u76eeu7c7bu578b
     * @param {string} itemId - u9879u76eeID
     * @param {HTMLElement} container - u8868u60c5u53cdu5e94u5bb9u5668
     */
    function setupRealtimeListener(itemType, itemId, container) {
        try {
            if (typeof firebase !== 'undefined' && firebase.apps.length > 0) {
                const db = firebase.database();
                const path = `reactions/${itemType}/${itemId}`;
                
                // u76d1u542cu6570u636eu53d8u5316
                db.ref(path).on('value', snapshot => {
                    const firebaseReactions = snapshot.val() || {};
                    const storageKey = getStorageKey(itemType, itemId);
                    
                    // u66f4u65b0u672cu5730u5b58u50a8
                    saveReactionsToStorage(storageKey, firebaseReactions);
                    
                    // u66f4u65b0UI
                    updateReactionButtons(container, firebaseReactions, storageKey);
                });
            }
        } catch (error) {
            console.error('u8bbeu7f6eu5b9eu65f6u76d1u542cu5931u8d25:', error);
        }
    }
    
    // u5bfcu51fau516cu5171API
    window.ReactionsModule = {
        initReactions,
        loadReactionsFromFirebase,
        updateReactionButtons
    };
});
