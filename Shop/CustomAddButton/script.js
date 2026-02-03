(function() {
    function addCustomCartButtons() {
        const productCards = document.querySelectorAll('.js-product');
        
        productCards.forEach(card => {
            if (card.querySelector('.custom-cart-btn')) {
                return;
            }
            
            const imgWrapper = card.querySelector('.t-store__card__imgwrapper');
            const originalButton = card.querySelector('.js-store-prod-btn2');
            
            if (imgWrapper && originalButton) {
                const customButton = document.createElement('button');
                customButton.className = 'custom-cart-btn';
                customButton.setAttribute('aria-label', 'Добавить в корзину');
                
                const icon = document.createElement('span');
                icon.className = 'custom-cart-btn__icon';
                
                customButton.appendChild(icon);
                imgWrapper.appendChild(customButton);
                
                customButton.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    originalButton.click();
                    this.classList.add('added');
                    setTimeout(() => {
                        this.classList.remove('added');
                    }, 1000);
                });
            }
        });
    }
    
    addCustomCartButtons();
    document.addEventListener('DOMContentLoaded', addCustomCartButtons);
    setTimeout(addCustomCartButtons, 500);

    const observer = new MutationObserver((mutations) => {
        let hasRelevantChanges = false;

        for (const mutation of mutations) {
            for (const node of mutation.addedNodes) {
                if (node.nodeType !== Node.ELEMENT_NODE) continue;
                if (node.classList?.contains('js-product') || node.querySelector?.('.js-product')) {
                    hasRelevantChanges = true;
                    break;
                }
            }
            if (hasRelevantChanges) break;
        }

        if (hasRelevantChanges) {
            requestAnimationFrame(() => addCustomCartButtons());
        }
    });

    observer.observe(document.body, {
        childList: true,  
        subtree: true     
    });

})();