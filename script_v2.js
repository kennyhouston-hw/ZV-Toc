document.addEventListener('DOMContentLoaded', () => {
    const HEADER_SELECTOR = 'h2, h3';
    const TARGET_CONTAINER_ID = '#toc';
    const SCROLL_OFFSET = 100;
    const headers = document.querySelectorAll(HEADER_SELECTOR);
    if (headers.length === 0) { return; }
    
    const tocContainer = document.createElement('div');
    tocContainer.id = 'table-of-contents';
    tocContainer.setAttribute('aria-labelledby', 'toc-main-header');
    
    const headerDiv = document.createElement('div');
    headerDiv.className = 'toc-header-wrapper';
    
    const headerSpan = document.createElement('span');
    headerSpan.id = 'toc-main-header';
    headerSpan.className = 'toc-header';
    headerSpan.textContent = 'Содержание:';
    
    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'toc-toggle-btn toc-toggle-expanded';
    toggleBtn.setAttribute('aria-expanded', 'true');
    toggleBtn.setAttribute('aria-label', 'Свернуть/развернуть оглавление');
    
    headerDiv.appendChild(headerSpan);
    headerDiv.appendChild(toggleBtn);
    tocContainer.appendChild(headerDiv);
    
    const tocList = document.createElement('ul');
    tocList.className = 'toc-list-expanded';
    tocContainer.appendChild(tocList);
    
    let currentH2Item = null;
    let currentH2List = null;
    
    headers.forEach((header, index) => {
        if (!header.id) { header.id = `toc-header-${index}`; }
        const level = parseInt(header.tagName.replace('H', ''), 10);
        
        const a = document.createElement('a');
        a.href = `#${header.id}`;
        a.textContent = header.textContent;
        a.className = 'toc-link';
        
        if (level === 2) {
            const li = document.createElement('li');
            li.className = 'toc-level-2';
            li.appendChild(a);
            tocList.appendChild(li);
            currentH2Item = li;
            currentH2List = null;
        } else if (level === 3) {
            if (!currentH2List && currentH2Item) {
                currentH2List = document.createElement('ul');
                currentH2List.className = 'toc-sublist';
                currentH2Item.appendChild(currentH2List);
            }
            
            if (currentH2List) {
                const li = document.createElement('li');
                li.className = 'toc-level-3';
                li.appendChild(a);
                currentH2List.appendChild(li);
            }
        }
    });
    
    const target = document.querySelector(TARGET_CONTAINER_ID) || document.body;
    target.prepend(tocContainer);
    
    headerDiv.addEventListener('click', () => {
        const isExpanded = toggleBtn.getAttribute('aria-expanded') === 'true';
        toggleBtn.setAttribute('aria-expanded', isExpanded ? 'false' : 'true');
        tocList.classList.toggle('toc-list-expanded');
        tocList.classList.toggle('toc-list-collapsed');
        toggleBtn.classList.toggle('toc-toggle-expanded');
        toggleBtn.classList.toggle('toc-toggle-collapsed');
    });
    
    tocList.addEventListener('click', (e) => {
        if (e.target.tagName === 'A') {
            e.preventDefault();
            const targetId = e.target.getAttribute('href');
            document.querySelector(targetId).scrollIntoView({ behavior: 'smooth' });
        }
    });
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const id = entry.target.getAttribute('id');
            const link = tocList.querySelector(`a[href="#${id}"]`);
            if (entry.isIntersecting && entry.intersectionRatio > 0) {
                tocList.querySelectorAll('li').forEach(li => li.classList.remove('active'));
                if (link) { link.parentElement.classList.add('active'); }
            }
        });
    }, { rootMargin: `-${SCROLL_OFFSET - 1}px 0px -${window.innerHeight - SCROLL_OFFSET}px 0px` });
    headers.forEach(header => observer.observe(header));
});
