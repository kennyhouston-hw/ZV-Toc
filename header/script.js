(function(window) {
    'use strict';
    
    // Links
    function highlightActiveLinks(container) {
        if (!container) return;
        
        const currentPath = window.location.pathname;
        const currentHash = window.location.hash;

        const pages = container.querySelectorAll('.page');

        pages.forEach(page => {
            const link = page.tagName === 'A' ? page : page.querySelector('a');
            if (!link) return;

            const href = link.getAttribute('href');
            if (!href) return;

            const cleanHref = href.replace(window.location.origin, "");

            const isActive = 
                (cleanHref === currentPath) || 
                (cleanHref === '/' && currentPath === '/') || 
                (currentHash && cleanHref === currentHash); 

            if (isActive) {
                page.classList.add('active');
            } else {
                page.classList.remove('active');
            }
        });
    }

    // Header
    class SmartHeader {
        constructor(selector, options = {}) {
            this.header = document.querySelector(selector);
            if (!this.header) return console.warn(`Header: Block ${selector} not found`);

            this.options = {
                offset: options.offset || 50,
                hideOnScrollDown: options.hideOnScrollDown !== undefined ? options.hideOnScrollDown : true
            };

            this.lastScrollY = 0;
            this.ticking = false;
            this.header.classList.add('smart-header');
            highlightActiveLinks(this.header);
            
            this.init();
        }

        init() {
            window.addEventListener('scroll', () => this.onScroll(), { passive: true });
        }

        onScroll() {
            this.currentScrollY = window.scrollY;
            if (!this.ticking) {
                window.requestAnimationFrame(() => {
                    this.update();
                    this.ticking = false;
                });
                this.ticking = true;
            }
        }

        update() {
            if (this.currentScrollY > this.options.offset) {
                this.header.classList.add('header-scrolled');
            } else {
                this.header.classList.remove('header-scrolled');
            }

            if (this.options.hideOnScrollDown) {
                if (this.currentScrollY > this.lastScrollY && this.currentScrollY > this.options.offset) {
                    this.header.classList.add('header-hidden');
                } else {
                    this.header.classList.remove('header-hidden');
                }
            }
            this.lastScrollY = this.currentScrollY;
        }
    }

    // Menu
    class SmartMenu {
        constructor(selector, options = {}) {
            this.menuBlock = document.querySelector(selector);
            if (!this.menuBlock) return console.warn(`Menu: Block ${selector} not found`);

            this.options = {
                open: options.open || '#menu',
                close: options.close || '#menu-close'
            };

            this.openLinks = document.querySelectorAll(`a[href="${this.options.open}"]`);
            this.closeLinks = document.querySelectorAll(`a[href="${this.options.close}"]`);

            this.menuBlock.classList.add('smart-menu-drawer');
            
            setTimeout(() => {
                this.menuBlock.classList.remove('uc-menu-hidden');
            }, 50);

            highlightActiveLinks(this.menuBlock);

            this.init();
        }

        init() {
            this.openLinks.forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.openMenu();
                });
            });

            this.closeLinks.forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.closeMenu();
                });
            });
            
            this.menuBlock.addEventListener('click', (e) => {
                 if (e.target === this.menuBlock || 
                     e.target.classList.contains('t396') || 
                     e.target.classList.contains('t396__artboard') || 
                     e.target.classList.contains('t396__filter') || 
                     e.target.classList.contains('t396__carrier')) {
                     this.closeMenu();
                 }
            });
        }

        openMenu() {
            this.menuBlock.classList.add('is-open');
            document.body.classList.add('menu-open-lock');
        }

        closeMenu() {
            this.menuBlock.classList.remove('is-open');
            document.body.classList.remove('menu-open-lock');
        }
    }

    window.header = {
        init: function(selector, options) {
            return new SmartHeader(selector, options);
        }
    };

    window.menu = {
        init: function(selector, options) {
            return new SmartMenu(selector, options);
        }
    };

})(window);
