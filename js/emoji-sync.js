/**
 * u8de8u8bbeu5907u540cu6b65u8868u60c5u529fu80fdu6a21u5757
 * u91cdu65b0u8bbeu8ba1u7684u8868u60c5u529fu80fduff0cu786eu4fddu8de8u8bbeu5907u540cu6b65
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('u521du59cbu5316u8de8u8bbeu5907u540cu6b65u8868u60c5u529fu80fdu6a21u5757');
    
    // u8868u60c5u9009u9879
    const emojiList = [
        { emoji: '👍', name: 'thumbs_up', label: '赞' },
        { emoji: '❤️', name: 'heart', label: '爱心' },
        { emoji: '😄', name: 'smile', label: '笑脸' },
        { emoji: '😮', name: 'wow', label: '哇' },
        { emoji: '😢', name: 'sad', label: '难过' },
        { emoji: '👏', name: 'clap', label: '鼓掌' }
    ];
    
    // u521bu5efau5168u5c40u8bbeu5907ID
    let deviceId = localStorage.getItem('global_device_id');
    if (!deviceId) {
        deviceId = 'device_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('global_device_id', deviceId);
    }
    console.log('u5f53u524du8bbeu5907ID:', deviceId);
    
    // u521bu5efau5168u5c40u7528u6237ID
    let userId = localStorage.getItem('global_user_id');
    if (!userId) {
        userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('global_user_id', userId);
    }
    console.log('u5f53u524du7528u6237ID:', userId);
    
    // u521du59cbu5316Firebaseu76d1u542cu5668
    const listeners = {};
    
    /**
     * u521du59cbu5316u8868u60c5u529fu80fd
     */
    function initEmojis(itemType, itemId, container) {
        // u751fu6210u552fu4e00u7684u5bb9u5668ID
        const containerId = `${itemType}_${itemId}_emoji_container`;
        
        console.log(`u521du59cbu5316u8868u60c5u529fu80fd: ${itemType}/${itemId}`);
        
        // u521bu5efau8868u60c5u5bb9u5668
        const emojiContainer = document.createElement('div');
        emojiContainer.className = 'emoji-reactions-container';
        emojiContainer.dataset.itemType = itemType;
        emojiContainer.dataset.itemId = itemId;
        emojiContainer.id = containerId;
        
        // u6dfbu52a0u6240u6709u8868u60c5u6309u94ae
        emojiList.forEach(item => {
            const button = document.createElement('button');
            button.className = 'emoji-button';
            button.innerHTML = item.emoji;
            button.title = item.label;
            button.dataset.emoji = item.name;
            
            // u6dfbu52a0u70b9u51fbu4e8bu4ef6
            button.addEventListener('click', function() {
                toggleEmoji(itemType, itemId, item.name, containerId);
            });
            
            emojiContainer.appendChild(button);
        });
        
        // u6dfbu52a0u5230u5bb9u5668
        container.appendChild(emojiContainer);
        
        // u8bbeu7f6eu76d1u542cu5668
        setupListener(itemType, itemId, containerId);
        
        return emojiContainer;
    }
    
    /**
     * u8bbeu7f6eu76d1u542cu5668
     */
    function setupListener(itemType, itemId, containerId) {
        // u68c0u67e5Firebaseu662fu5426u5df2u52a0u8f7d
        if (typeof firebase === 'undefined' || !firebase.database) {
            console.error('Firebaseu672au521du59cbu5316uff0cu65e0u6cd5u8bbeu7f6eu76d1u542cu5668');
            return;
        }
        
        // u751fu6210u76d1u542cu5668u7684u552fu4e00u6807u8bc6
        const listenerId = `${itemType}_${itemId}`;
        
        // u5982u679cu5df2u7ecfu6709u76d1u542cu5668uff0cu5148u79fbu9664
        if (listeners[listenerId]) {
            firebase.database().ref(`emoji_reactions/${itemType}/${itemId}`).off('value', listeners[listenerId]);
        }
        
        // u521bu5efau65b0u7684u76d1u542cu5668
        listeners[listenerId] = firebase.database().ref(`emoji_reactions/${itemType}/${itemId}`).on('value', snapshot => {
            updateEmojiState(snapshot.val() || {}, itemType, itemId, containerId);
        });
        
        console.log(`u5df2u8bbeu7f6eu76d1u542cu5668: ${listenerId}`);
    }
    
    /**
     * u66f4u65b0u8868u60c5u72b6u6001
     */
    function updateEmojiState(data, itemType, itemId, containerId) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`u627eu4e0du5230u5bb9u5668: ${containerId}`);
            return;
        }
        
        // u904du5386u6240u6709u8868u60c5
        emojiList.forEach(item => {
            const emojiName = item.name;
            const emojiData = data[emojiName] || {};
            
            // u68c0u67e5u662fu5426u6709u4efbu4f55u7528u6237u70b9u51fbu4e86u8be5u8868u60c5
            const userIds = Object.keys(emojiData);
            const hasAnyReaction = userIds.length > 0;
            
            // u68c0u67e5u5f53u524du7528u6237u662fu5426u70b9u51fbu4e86u8be5u8868u60c5
            const isActiveByCurrentUser = emojiData[userId] !== undefined;
            
            // u627eu5230u5bf9u5e94u7684u6309u94ae
            const button = container.querySelector(`button[data-emoji="${emojiName}"]`);
            if (button) {
                // u66f4u65b0u6309u94aeu72b6u6001
                if (hasAnyReaction) {
                    button.classList.add('active');
                } else {
                    button.classList.remove('active');
                }
                
                if (isActiveByCurrentUser) {
                    button.classList.add('active-by-me');
                } else {
                    button.classList.remove('active-by-me');
                }
            }
        });
    }
    
    /**
     * u5207u6362u8868u60c5u72b6u6001
     */
    function toggleEmoji(itemType, itemId, emojiName, containerId) {
        // u68c0u67e5Firebaseu662fu5426u5df2u52a0u8f7d
        if (typeof firebase === 'undefined' || !firebase.database) {
            console.error('Firebaseu672au521du59cbu5316uff0cu65e0u6cd5u5207u6362u8868u60c5u72b6u6001');
            return;
        }
        
        const db = firebase.database();
        const path = `emoji_reactions/${itemType}/${itemId}/${emojiName}/${userId}`;
        
        // u68c0u67e5u5f53u524du72b6u6001
        db.ref(path).once('value')
            .then(snapshot => {
                const exists = snapshot.exists();
                
                if (exists) {
                    // u5982u679cu5df2u5b58u5728uff0cu5219u79fbu9664
                    return db.ref(path).remove();
                } else {
                    // u5982u679cu4e0du5b58u5728uff0cu5219u6dfbu52a0
                    return db.ref(path).set({
                        timestamp: firebase.database.ServerValue.TIMESTAMP,
                        deviceId: deviceId
                    });
                }
            })
            .then(() => {
                console.log(`u5207u6362u8868u60c5u72b6u6001u6210u529f: ${path}`);
                
                // u6dfbu52a0u70b9u51fbu52a8u753b
                const container = document.getElementById(containerId);
                if (container) {
                    const button = container.querySelector(`button[data-emoji="${emojiName}"]`);
                    if (button) {
                        button.classList.add('just-clicked');
                        setTimeout(() => {
                            button.classList.remove('just-clicked');
                        }, 500);
                    }
                }
            })
            .catch(error => {
                console.error(`u5207u6362u8868u60c5u72b6u6001u5931u8d25: ${error.message}`);
            });
    }
    
    // u5bfcu51fau516cu5171API
    window.EmojiSyncModule = {
        initEmojis: initEmojis
    };
    
    console.log('u8de8u8bbeu5907u540cu6b65u8868u60c5u529fu80fdu6a21u5757u521du59cbu5316u5b8cu6210');
});
