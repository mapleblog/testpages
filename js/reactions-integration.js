/**
 * u8868u60c5u53cdu5e94u529fu80fdu96c6u6210
 * u8be5u6587u4ef6u8d1fu8d23u5c06u8868u60c5u53cdu5e94u529fu80fdu96c6u6210u5230u7559u8a00u677fu3001u5fc3u60c5u65e5u8bb0u548cu613fu671bu6e05u5355u4e2d
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('u521du59cbu5316u8868u60c5u53cdu5e94u96c6u6210');
    
    // u7b49u5f85u6240u6709u5185u5bb9u52a0u8f7du5b8cu6210
    setTimeout(initReactionsForAllItems, 1000);
    
    // u76d1u542cu5185u5bb9u53d8u5316
    observeContentChanges();
    
    /**
     * u4e3au6240u6709u9879u76eeu6dfbu52a0u8868u60c5u53cdu5e94
     */
    function initReactionsForAllItems() {
        // u4e3au7559u8a00u677fu6dfbu52a0u8868u60c5u53cdu5e94
        initReactionsForMessages();
        
        // u4e3au5fc3u60c5u65e5u8bb0u6dfbu52a0u8868u60c5u53cdu5e94
        initReactionsForMoods();
        
        // u4e3au613fu671bu6e05u5355u6dfbu52a0u8868u60c5u53cdu5e94
        initReactionsForWishes();
    }
    
    /**
     * u76d1u542cu5185u5bb9u53d8u5316uff0cu5f53u6709u65b0u5185u5bb9u6dfbu52a0u65f6u81eau52a8u6dfbu52a0u8868u60c5u53cdu5e94
     */
    function observeContentChanges() {
        // u76d1u542cu7559u8a00u677fu53d8u5316
        const messageList = document.getElementById('message-list');
        if (messageList) {
            const messageObserver = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                        mutation.addedNodes.forEach(function(node) {
                            if (node.nodeType === 1 && node.classList.contains('message-item') && !node.querySelector('.reactions-container')) {
                                const messageId = node.dataset.id;
                                if (messageId && window.ReactionsModule) {
                                    window.ReactionsModule.initReactions('MESSAGE', messageId, node);
                                }
                            }
                        });
                    }
                });
            });
            
            messageObserver.observe(messageList, { childList: true, subtree: true });
        }
        
        // u76d1u542cu5fc3u60c5u65e5u8bb0u53d8u5316
        const moodList = document.getElementById('mood-list');
        if (moodList) {
            const moodObserver = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                        mutation.addedNodes.forEach(function(node) {
                            if (node.nodeType === 1 && node.classList.contains('mood-item') && !node.querySelector('.reactions-container')) {
                                const moodId = node.dataset.id;
                                if (moodId && window.ReactionsModule) {
                                    window.ReactionsModule.initReactions('MOOD', moodId, node);
                                }
                            }
                        });
                    }
                });
            });
            
            moodObserver.observe(moodList, { childList: true, subtree: true });
        }
        
        // u76d1u542cu613fu671bu6e05u5355u53d8u5316
        const wishList = document.getElementById('wish-list');
        if (wishList) {
            const wishObserver = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                        mutation.addedNodes.forEach(function(node) {
                            if (node.nodeType === 1 && node.classList.contains('wish-item') && !node.querySelector('.reactions-container')) {
                                const wishId = node.dataset.id;
                                if (wishId && window.ReactionsModule) {
                                    window.ReactionsModule.initReactions('WISH', wishId, node);
                                }
                            }
                        });
                    }
                });
            });
            
            wishObserver.observe(wishList, { childList: true, subtree: true });
        }
        
        // u76d1u542cu529fu80fdu6807u7b7eu5207u6362
        const featureTabs = document.querySelectorAll('.feature-tab');
        featureTabs.forEach(tab => {
            tab.addEventListener('click', function() {
                // u7b49u5f85u5185u5bb9u52a0u8f7d
                setTimeout(initReactionsForAllItems, 300);
            });
        });
    }
    
    /**
     * u4e3au7559u8a00u677fu6dfbu52a0u8868u60c5u53cdu5e94
     */
    function initReactionsForMessages() {
        const messageItems = document.querySelectorAll('.message-item');
        messageItems.forEach(item => {
            if (!item.querySelector('.reactions-container') && !item.classList.contains('editing')) {
                const messageId = item.dataset.id;
                if (messageId && window.ReactionsModule) {
                    window.ReactionsModule.initReactions('MESSAGE', messageId, item);
                }
            }
        });
    }
    
    /**
     * u4e3au5fc3u60c5u65e5u8bb0u6dfbu52a0u8868u60c5u53cdu5e94
     */
    function initReactionsForMoods() {
        const moodItems = document.querySelectorAll('.mood-item');
        moodItems.forEach(item => {
            if (!item.querySelector('.reactions-container')) {
                const moodId = item.dataset.id;
                if (moodId && window.ReactionsModule) {
                    window.ReactionsModule.initReactions('MOOD', moodId, item);
                }
            }
        });
    }
    
    /**
     * u4e3au613fu671bu6e05u5355u6dfbu52a0u8868u60c5u53cdu5e94
     */
    function initReactionsForWishes() {
        const wishItems = document.querySelectorAll('.wish-item');
        wishItems.forEach(item => {
            if (!item.querySelector('.reactions-container')) {
                const wishId = item.dataset.id;
                if (wishId && window.ReactionsModule) {
                    window.ReactionsModule.initReactions('WISH', wishId, item);
                }
            }
        });
    }
});
