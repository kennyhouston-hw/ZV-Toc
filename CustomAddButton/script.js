(function() {
    let cartState = {};

    function updateCartIconCounter() {
        try {
            const tcartRaw = localStorage.getItem('tcart');
            if (!tcartRaw) {
                document.querySelectorAll('.js-carticon-counter').forEach(el => {
                    el.textContent = '0';
                    el.style.display = 'none';
                });
                return;
            }

            const tcart = JSON.parse(tcartRaw);
            
            let totalItems = 0;
            if (tcart.products && Array.isArray(tcart.products)) {
                totalItems = tcart.products.reduce((sum, item) => {
                    return sum + (item.quantity || 1);
                }, 0);
            }

            document.querySelectorAll('.js-carticon-counter').forEach(el => {
                el.textContent = totalItems;
                el.style.display = totalItems > 0 ? 'block' : 'none';
            });

            document.querySelectorAll('.t-menuwidgeticons__carticon').forEach(el => {
                el.dataset.productscount = totalItems;
            });
        } catch (e) {
            console.error('Ошибка обновления счётчика корзины:', e);
        }
    }

    // Product Options
    function getProductOptions(card) {
        const options = [];
        const optionElements = card.querySelectorAll('.js-product-edition-option');
        
        optionElements.forEach(optionEl => {
            const optionName = optionEl.dataset.editionOptionId;
            const selectedInput = optionEl.querySelector('input[type="radio"]:checked, select');
            
            if (selectedInput) {
                const value = selectedInput.value || selectedInput.options?.[selectedInput.selectedIndex]?.value;
                if (optionName && value) {
                    options.push({
                        option: optionName,
                        variant: value
                    });
                }
            }
        });
        
        return options;
    }

    // Create UID
    function getProductKey(uid, options) {
        if (!options || options.length === 0) {
            return uid;
        }
        
        const sortedOptions = options
            .map(opt => `${opt.option}:${opt.variant}`)
            .sort()
            .join('|');
        
        return `${uid}|${sortedOptions}`;
    }

    // Sync Cart
    function syncCartState() {
        try {
            const tcartRaw = localStorage.getItem('tcart');
            if (!tcartRaw) {
                cartState = {};
                updateAllButtons();
                updateCartIconCounter();
                return;
            }

            const tcart = JSON.parse(tcartRaw);
            cartState = {};

            if (tcart.products && Array.isArray(tcart.products)) {
                tcart.products.forEach(item => {
                    const uid = item.uid || item.lid;
                    const qty = item.quantity || 1;
                    const options = item.options || [];
                    
                    if (uid) {
                        const key = getProductKey(uid, options);
                        cartState[key] = qty;
                    }
                });
            }

            updateAllButtons();
            updateCartIconCounter();
        } catch (e) {
            console.error('Ошибка чтения tcart:', e);
        }
    }

    // Get UID
    function getProductUid(card) {
        const btn = card.querySelector('.js-store-prod-btn2');
        return (
            card.dataset.productLid ||
            card.dataset.lid ||
            btn?.dataset.productLid ||
            btn?.dataset.lid ||
            card.querySelector('[data-product-lid]')?.dataset.productLid ||
            null
        );
    }

    // Update Buttons
    function updateButton(card) {
        const customBtn = card.querySelector('.custom-cart-btn');
        const counter = card.querySelector('.custom-cart-counter');
        const valueEl = card.querySelector('.custom-cart-counter__value');
        
        if (!customBtn || !counter || !valueEl) return;

        const uid = getProductUid(card);
        const options = getProductOptions(card);
        const key = getProductKey(uid, options);
        const count = cartState[key] || 0;

        if (count > 0) {
            customBtn.classList.add('has-items');
            counter.classList.add('active');
            valueEl.textContent = count;
        } else {
            customBtn.classList.remove('has-items');
            counter.classList.remove('active');
        }
    }

    function updateAllButtons() {
        document.querySelectorAll('.js-product').forEach(card => updateButton(card));
    }

    // Change Quantity
    function changeQuantity(card, delta) {
        const uid = getProductUid(card);
        if (!uid) return;

        const originalButton = card.querySelector('.js-store-prod-btn2');
        if (!originalButton) return;

        const options = getProductOptions(card);
        const key = getProductKey(uid, options);
        const currentQty = cartState[key] || 0;
        const newQty = currentQty + delta;

        if (newQty <= 0) {
            removeFromCart(uid, options);
        } else if (delta > 0) {
            originalButton.click();
            setTimeout(() => syncCartState(), 400);
        } else {
            decreaseQuantity(uid, options);
        }
    }

    // Remove From Cart
    function removeFromCart(uid, options) {
        try {
            const tcartRaw = localStorage.getItem('tcart');
            if (!tcartRaw) return;

            const tcart = JSON.parse(tcartRaw);
            if (!tcart.products) return;

            tcart.products = tcart.products.filter(item => {
                const itemUid = item.uid || item.lid;
                if (itemUid !== uid) return true;
                
                const itemOptions = item.options || [];
                if (options.length === 0 && itemOptions.length === 0) return false;
                
                const itemKey = getProductKey(itemUid, itemOptions);
                const targetKey = getProductKey(uid, options);
                
                return itemKey !== targetKey;
            });
            
            tcart.total = tcart.products.length;
            tcart.amount = tcart.products.reduce((sum, item) => sum + (item.amount || 0), 0);
            tcart.prodamount = tcart.amount;

            localStorage.setItem('tcart', JSON.stringify(tcart));
            
            if (window.tildaCartUpdate) {
                window.tildaCartUpdate();
            }
            
            updateCartIconCounter();
            syncCartState();
        } catch (e) {
            console.error('Ошибка удаления из корзины:', e);
        }
    }

    // Decrease Quantity
    function decreaseQuantity(uid, options) {
        try {
            const tcartRaw = localStorage.getItem('tcart');
            if (!tcartRaw) return;

            const tcart = JSON.parse(tcartRaw);
            if (!tcart.products) return;

            const product = tcart.products.find(item => {
                const itemUid = item.uid || item.lid;
                if (itemUid !== uid) return false;
                
                const itemOptions = item.options || [];
                const itemKey = getProductKey(itemUid, itemOptions);
                const targetKey = getProductKey(uid, options);
                
                return itemKey === targetKey;
            });
            
            if (!product) return;

            product.quantity = Math.max(1, product.quantity - 1);
            product.amount = product.price * product.quantity;

            tcart.amount = tcart.products.reduce((sum, item) => sum + (item.amount || 0), 0);
            tcart.prodamount = tcart.amount;

            localStorage.setItem('tcart', JSON.stringify(tcart));
            
            if (window.tildaCartUpdate) {
                window.tildaCartUpdate();
            }
            
            updateCartIconCounter();
            syncCartState();
        } catch (e) {
            console.error('Ошибка уменьшения количества:', e);
        }
    }

    // Add Custom Button To Product Cards
    function addCustomCartButtons() {
        const productCards = document.querySelectorAll('.js-product');

        productCards.forEach(card => {
            if (card.querySelector('.custom-cart-btn')) return;

            const imgWrapper = card.querySelector('.js-store-buttons-wrapper');
            const originalButton = card.querySelector('.js-store-prod-btn2');

            if (imgWrapper && originalButton) {
                const customButton = document.createElement('button');
                customButton.className = 'custom-cart-btn';
                customButton.setAttribute('aria-label', 'Добавить в корзину');

                const text = document.createElement('span');
                text.className = 'custom-cart-btn__text';
                text.textContent = 'В корзину';
                customButton.appendChild(text);

                const counter = document.createElement('div');
                counter.className = 'custom-cart-counter';

                const minusBtn = document.createElement('button');
                minusBtn.className = 'custom-cart-counter__btn';
                minusBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/></svg>`;
                minusBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    changeQuantity(card, -1);
                });

                const value = document.createElement('span');
                value.className = 'custom-cart-counter__value';
                value.textContent = '0';

                const plusBtn = document.createElement('button');
                plusBtn.className = 'custom-cart-counter__btn';
                plusBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`;
                plusBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    changeQuantity(card, 1);
                });

                counter.appendChild(minusBtn);
                counter.appendChild(value);
                counter.appendChild(plusBtn);
                customButton.appendChild(counter);

                imgWrapper.appendChild(customButton);

                customButton.addEventListener('click', (e) => {
                    if (e.target === customButton || e.target === text) {
                        e.preventDefault();
                        e.stopPropagation();
                        
                        const uid = getProductUid(card);
                        const options = getProductOptions(card);
                        const key = getProductKey(uid, options);
                        const count = cartState[key] || 0;
                        
                        if (count === 0) {
                            customButton.classList.add('adding');
                            setTimeout(() => customButton.classList.remove('adding'), 300);
                            changeQuantity(card, 1);
                        }
                    }
                });

                const optionInputs = card.querySelectorAll('.js-product-edition-option input, .js-product-edition-option select');
                optionInputs.forEach(input => {
                    input.addEventListener('change', () => {
                        setTimeout(() => updateButton(card), 100);
                    });
                });

                updateButton(card);
            }
        });
    }

    // Sync Cart Widget State
    function watchCartWidget() {
        document.addEventListener('click', (e) => {
            const target = e.target.closest('.t706__product-plus, .t706__product-minus, .t706__product-del');
            if (target) {
                setTimeout(() => syncCartState(), 300);
            }
        }, true);

        const cartObserver = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (mutation.target.classList?.contains('t706__cartwin-products') ||
                    mutation.target.classList?.contains('t706__product-quantity')) {
                    setTimeout(() => syncCartState(), 200);
                    break;
                }
            }
        });

        const observeCart = () => {
            const cartContainer = document.querySelector('.t706__cartwin-products, .t-popup__container');
            if (cartContainer) {
                cartObserver.observe(cartContainer, {
                    childList: true,
                    subtree: true,
                    characterData: true
                });
            }
        };

        observeCart();
        
        const popupObserver = new MutationObserver(() => {
            observeCart();
        });
        
        popupObserver.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // Sync Cart on Storage Change
    window.addEventListener('storage', (e) => {
        if (e.key === 'tcart') {
            syncCartState();
        }
    });

    const originalSetItem = localStorage.setItem;
    localStorage.setItem = function(key, value) {
        originalSetItem.apply(this, arguments);
        if (key === 'tcart') {
            setTimeout(() => syncCartState(), 100);
        }
    };

    document.addEventListener('DOMContentLoaded', () => {
        addCustomCartButtons();
        syncCartState();
        watchCartWidget();
    });
    
    setTimeout(() => {
        addCustomCartButtons();
        syncCartState();
        watchCartWidget();
    }, 500);

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
            requestAnimationFrame(() => {
                addCustomCartButtons();
                syncCartState();
            });
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    // Catch Fetch
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
        const result = originalFetch.apply(this, args);
        const url = typeof args[0] === 'string' ? args[0] : args[0]?.url || '';
        
        if (url.includes('/cart/') || url.includes('tildaapi.com')) {
            result.then(() => setTimeout(syncCartState, 400));
        }
        return result;
    };

})();