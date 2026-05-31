document.addEventListener('DOMContentLoaded', function() {
    const imageModal = document.getElementById('imageModal');
    const detailsModal = document.getElementById('detailsModal');
    const cardsContainer = document.getElementById('cardsContainer');
    const filtersContainer = document.getElementById('filtersContainer');
    const sortAscBtn = document.getElementById('sortAsc');
    const sortDescBtn = document.getElementById('sortDesc');
    const showMoreBtn = document.getElementById('showMoreBtn');
    const showLessBtn = document.getElementById('showLessBtn');
    const controlsContainer = document.getElementById('controlsContainer');
    const filtersSection = document.getElementById('filtersSection');
    const foundCardsCounter = document.getElementById('foundCardsCounter');
    const counterCurrent = document.getElementById('counterCurrent');
    const counterTotal = document.getElementById('counterTotal');
    
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const mobileSidebar = document.getElementById('mobileSidebar');
    const sidebarClose = document.getElementById('sidebarClose');
    const mobileThemeToggle = document.getElementById('mobileThemeToggle');
    const desktopThemeToggle = document.getElementById('desktopThemeToggle');
    const mobileContactLink = document.getElementById('mobileContactLink');
    
    let currentCards = [];
    let activeFilters = [];
    let sortDirection = 'desc';
    let isFullView = false;
    let totalCardsCount = 0;

    function openCardFromHash() {
        const hash = window.location.hash;
        if (hash && hash.startsWith('#card')) {
            const cardNumber = parseInt(hash.replace('#card', ''));
            if (!isNaN(cardNumber) && currentCards.some(c => c.number === cardNumber)) {
                openDetailsModal(cardNumber);
            }
        }
    }

    let toastTimeout = null;
    function showToast(message, duration = 3000) {
        const existingToast = document.querySelector('.toast-notification');
        if (existingToast) {
            existingToast.remove();
            if (toastTimeout) clearTimeout(toastTimeout);
        }
        const toast = document.createElement('div');
        toast.className = 'toast-notification';
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.classList.add('show'), 10);
        toastTimeout = setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
            toastTimeout = null;
        }, duration);
    }
    
    function showFirstVisitTooltip() {
        const hasSeen = localStorage.getItem('tooltipShown');
        if (hasSeen) return;
        const tooltip = document.createElement('div');
        tooltip.className = 'first-visit-tooltip';
        tooltip.innerHTML = `
            <p><span class="tooltip-highlight">Если дважды нажать на карточку</span>, то вы сможете разглядеть её поближе.</p>
            <button class="tooltip-btn" id="tooltipConfirm">Подтвердить</button>
        `;
        document.body.appendChild(tooltip);
        const confirmBtn = tooltip.querySelector('#tooltipConfirm');
        confirmBtn.addEventListener('click', () => {
            localStorage.setItem('tooltipShown', 'true');
            tooltip.remove();
        });
        setTimeout(() => {
            if (tooltip && tooltip.parentNode) {
                localStorage.setItem('tooltipShown', 'true');
                tooltip.remove();
            }
        }, 15000);
    }
    
    let cardsDataCache = null;
    async function loadCardsData() {
        if (cardsDataCache) return cardsDataCache;
        try {
            const response = await fetch('./cards_data.json');
            if (!response.ok) throw new Error('JSON не загружен');
            cardsDataCache = await response.json();
            return cardsDataCache;
        } catch (error) {
            console.warn('Не удалось загрузить cards_data.json', error);
            return {};
        }
    }
    
    async function openDetailsModal(cardNumber) {
        const data = await loadCardsData();
        const cardInfo = data[cardNumber];
        if (!cardInfo) {
            showToast('📭 Информация о данной карточке пока не добавлена.', 2500);
            return;
        }
        const card = currentCards.find(c => c.number == cardNumber);
        const cardPath = card ? card.path : null;
        const detailsBody = document.getElementById('detailsBody');
        let html = '';
        if (cardPath) {
            const isVideo = cardPath.toLowerCase().endsWith('.webm') || cardPath.toLowerCase().endsWith('.mp4');
            if (isVideo) {
                html += `<video src="${escapeHtml(cardPath)}" autoplay loop muted playsinline style="max-width:100%; border-radius:12px; margin-bottom:20px;"></video>`;
            } else {
                html += `<img src="${escapeHtml(cardPath)}" alt="Карточка ${cardNumber}" style="max-width:100%; border-radius:12px; margin-bottom:20px;">`;
            }
        }
        if (cardInfo.author_design && cardInfo.author_design.trim() !== '') {
            html += `<p><strong>🎨 Автор дизайна:</strong> ${escapeHtml(cardInfo.author_design)}</p>`;
        }
        if (cardInfo.description && cardInfo.description.trim() !== '') {
            html += `<p><strong>📝 Описание:</strong><br>${escapeHtml(cardInfo.description)}</p>`;
        }
        if (cardInfo.video_review_url && cardInfo.video_review_url.trim() !== '') {
            html += `<p><strong>🎬 Видео-разбор:</strong> <a href="${escapeHtml(cardInfo.video_review_url)}" target="_blank" rel="noopener noreferrer">Смотреть разбор</a></p>`;
        }
        if (cardInfo.original_art_url && cardInfo.original_art_url.trim() !== '') {
            let fixedArtUrl = cardInfo.original_art_url;
            if (fixedArtUrl.includes('drive.google.com') && fixedArtUrl.includes('/file/d/')) {
                const match = fixedArtUrl.match(/\/file\/d\/([^\/]+)/);
                if (match) fixedArtUrl = `https://drive.google.com/uc?export=view&id=${match[1]}`;
            }
            html += `<p><strong>🖼️ Оригинальный арт:</strong><br>
                    <img src="${escapeHtml(fixedArtUrl)}" alt="Оригинальный арт" loading="lazy" 
                    onerror="this.onerror=null; this.src='https://via.placeholder.com/400x200?text=Оригинал+не+загрузился';" 
                    style="max-width:100%; border-radius:8px; margin-top:8px;"></p>`;
        }
        if (cardInfo.original_art_author && cardInfo.original_art_author.trim() !== '') {
            html += `<p><strong>👤 Автор оригинального арта:</strong> ${escapeHtml(cardInfo.original_art_author)}</p>`;
        }
        if (cardInfo.font_credits && cardInfo.font_credits.trim() !== '') {
            html += `<p><strong>✍️ Авторство шрифтов:</strong> ${escapeHtml(cardInfo.font_credits)}</p>`;
        }
        if (html === '') html = '<p><em>Нет дополнительной информации о карточке.</em></p>';
        detailsBody.innerHTML = html;
        detailsModal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
    
    function closeDetailsModal() {
        detailsModal.classList.remove('show');
        document.body.style.overflow = '';
    }
    function closeBothModalsAndReturnToGallery() {
        if (imageModal.classList.contains('show')) closeImageModal();
        if (detailsModal.classList.contains('show')) closeDetailsModal();
        if (window.location.hash) history.pushState("", document.title, window.location.pathname + window.location.search);
    }
    
    function escapeHtml(str) {
        if (!str) return '';
        return str.replace(/[&<>]/g, function(m) {
            if (m === '&') return '&amp;';
            if (m === '<') return '&lt;';
            if (m === '>') return '&gt;';
            return m;
        }).replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, function(c) { return c; });
    }
    
    function openImageModal(imageSrc, cardNumber) {
        const modalContent = document.querySelector('#imageModal .modal-content');
        modalContent.innerHTML = '';
        const img = document.createElement('img');
        img.src = imageSrc;
        img.alt = "Увеличенная карточка";
        img.style.maxWidth = '100%';
        img.style.maxHeight = '100%';
        img.style.objectFit = 'contain';
        img.style.borderRadius = '8px';
        const closeButton = document.createElement('div');
        closeButton.innerHTML = '×';
        closeButton.className = 'modal-close-btn';
        const detailLink = document.createElement('button');
        detailLink.textContent = 'Подробнее';
        detailLink.className = 'detail-link';
        detailLink.addEventListener('click', (e) => {
            e.stopPropagation();
            openDetailsModal(cardNumber);
        });
        const container = document.createElement('div');
        container.style.display = 'flex';
        container.style.flexDirection = 'column';
        container.style.alignItems = 'center';
        container.style.justifyContent = 'center';
        container.style.height = '100%';
        container.appendChild(img);
        container.appendChild(detailLink);
        modalContent.appendChild(container);
        modalContent.appendChild(closeButton);
        imageModal.classList.add('show');
        document.body.style.overflow = 'hidden';
        const closeHandler = (e) => {
            e.preventDefault();
            e.stopPropagation();
            closeImageModal();
        };
        closeButton.addEventListener('click', closeHandler);
        closeButton.addEventListener('touchend', closeHandler);
    }
    
    function openVideoModal(videoSrc, cardNumber) {
        const modalContent = document.querySelector('#imageModal .modal-content');
        modalContent.innerHTML = '';
        const video = document.createElement('video');
        video.src = videoSrc;
        video.autoplay = true;
        video.loop = true;
        video.muted = true;
        video.controls = false;
        video.style.width = '100%';
        video.style.height = '100%';
        video.style.objectFit = 'contain';
        const closeButton = document.createElement('div');
        closeButton.innerHTML = '×';
        closeButton.className = 'modal-close-btn';
        const detailLink = document.createElement('button');
        detailLink.textContent = 'Подробнее';
        detailLink.className = 'detail-link';
        detailLink.addEventListener('click', (e) => {
            e.stopPropagation();
            openDetailsModal(cardNumber);
        });
        const container = document.createElement('div');
        container.style.display = 'flex';
        container.style.flexDirection = 'column';
        container.style.alignItems = 'center';
        container.style.justifyContent = 'center';
        container.style.height = '100%';
        container.appendChild(video);
        container.appendChild(detailLink);
        modalContent.appendChild(container);
        modalContent.appendChild(closeButton);
        imageModal.classList.add('show');
        document.body.style.overflow = 'hidden';
        const closeHandler = (e) => {
            e.preventDefault();
            e.stopPropagation();
            closeImageModal();
        };
        closeButton.addEventListener('click', closeHandler);
        closeButton.addEventListener('touchend', closeHandler);
        video.play().catch(e => console.log('Автовоспроизведение заблокировано'));
    }
    
    function closeImageModal() {
        const video = document.querySelector('#imageModal .modal-content video');
        if (video) {
            video.pause();
            video.currentTime = 0;
        }
        imageModal.classList.remove('show');
        document.body.style.overflow = '';
    }
    
    function setupCardInteractions() {
        const cards = document.querySelectorAll('.card');
        cards.forEach(card => {
            card.removeEventListener('click', handleCardClick);
            card.removeEventListener('touchend', handleCardTouch);
            card.addEventListener('click', handleCardClick);
            card.addEventListener('touchend', handleCardTouch);
        });
    }
    
    function handleCardClick(e) {
        const currentTime = new Date().getTime();
        const timeSinceLastClick = currentTime - (this.lastClickTime || 0);
        if (timeSinceLastClick < 300) {
            e.preventDefault();
            e.stopPropagation();
            const cardNumber = parseInt(this.dataset.number);
            const video = this.querySelector('video');
            const img = this.querySelector('img');
            if (video) openVideoModal(video.src, cardNumber);
            else if (img) openImageModal(img.src, cardNumber);
            this.lastClickTime = 0;
        } else {
            this.lastClickTime = currentTime;
        }
    }
    
    function handleCardTouch(e) {
        if (this.isScrolling) return;
        const currentTime = new Date().getTime();
        const timeSinceLastTap = currentTime - (this.lastTapTime || 0);
        if (timeSinceLastTap < 300 && timeSinceLastTap > 0) {
            e.preventDefault();
            e.stopPropagation();
            const cardNumber = parseInt(this.dataset.number);
            const video = this.querySelector('video');
            const img = this.querySelector('img');
            if (video) openVideoModal(video.src, cardNumber);
            else if (img) openImageModal(img.src, cardNumber);
            this.lastTapTime = 0;
            this.tapCount = 0;
        } else {
            this.lastTapTime = currentTime;
            this.tapCount = (this.tapCount || 0) + 1;
            setTimeout(() => { this.tapCount = 0; }, 500);
        }
    }
    
    function initializeFilters() {
        const allButton = document.createElement('button');
        allButton.className = 'filter-btn active';
        allButton.textContent = 'Все';
        allButton.setAttribute('data-filter-name', 'Все');
        allButton.addEventListener('click', () => {
            activeFilters = [];
            updateActiveFilters();
            filterAndDisplayCards();
            if (isFullView) updateFilterCounts();
        });
        filtersContainer.appendChild(allButton);
        
        Object.keys(FILTERS_CONFIG).forEach(filterName => {
            const button = document.createElement('button');
            button.className = 'filter-btn';
            button.textContent = filterName;
            button.setAttribute('data-filter-name', filterName);
            button.addEventListener('click', () => toggleFilter(filterName));
            filtersContainer.appendChild(button);
        });
        if (isFullView) updateFilterCounts();
    }
    
    function toggleFilter(filterName) {
        const index = activeFilters.indexOf(filterName);
        if (index === -1) activeFilters.push(filterName);
        else activeFilters.splice(index, 1);
        updateActiveFilters();
        filterAndDisplayCards();
        updateFilterHint();
        if (isFullView) updateFilterCounts();
    }
    
    function updateActiveFilters() {
        const buttons = filtersContainer.querySelectorAll('.filter-btn');
        buttons.forEach(button => {
            const filterName = button.getAttribute('data-filter-name');
            if (filterName === 'Все') {
                button.classList.toggle('active', activeFilters.length === 0);
            } else {
                button.classList.toggle('active', activeFilters.includes(filterName));
            }
        });
    }
    
    function updateFilterCounts() {
        if (!isFullView) return;
        const allButton = Array.from(filtersContainer.querySelectorAll('.filter-btn')).find(btn => btn.getAttribute('data-filter-name') === 'Все');
        const totalAllCards = currentCards.length;
        if (allButton) {
            if (activeFilters.length === 0) {
                allButton.innerHTML = `Все`;
                allButton.removeAttribute('data-count');
            } else {
                allButton.innerHTML = `Все <span class="filter-count">${totalAllCards}</span>`;
                allButton.setAttribute('data-count', totalAllCards);
            }
        }
        const filterButtons = Array.from(filtersContainer.querySelectorAll('.filter-btn')).filter(btn => btn.getAttribute('data-filter-name') !== 'Все');
        filterButtons.forEach(btn => {
            const filterName = btn.getAttribute('data-filter-name');
            const filterNumbers = FILTERS_CONFIG[filterName] || [];
            let count;
            if (activeFilters.length === 0) {
                count = filterNumbers.filter(num => currentCards.some(c => c.number === num)).length;
            } else {
                const testFilters = [...activeFilters, filterName];
                count = currentCards.filter(card => {
                    return testFilters.every(f => FILTERS_CONFIG[f] && FILTERS_CONFIG[f].includes(card.number));
                }).length;
            }
            btn.innerHTML = `${filterName} <span class="filter-count">${count}</span>`;
            btn.setAttribute('data-count', count);
        });
    }
    
    function loadCardsFromManualList() {
        try {
            const cardsFolder = './cards/';
            const sortedCards = [...MANUAL_CARD_LIST].sort((a, b) => b.number - a.number);
            const cardsWithPaths = sortedCards.map(card => ({ ...card, path: cardsFolder + card.filename }));
            currentCards = cardsWithPaths;
            totalCardsCount = currentCards.length;
            console.log('✅ Загружено карточек:', totalCardsCount);
            showFeaturedCards();
            updateCardsCounter();
        } catch (error) {
            console.error('Ошибка загрузки карточек:', error);
            showNoCardsMessage();
        }
    }
    
    function filterAndDisplayCards() {
        let filteredCards = [...currentCards];
        let totalCardsToShow = totalCardsCount;
        if (!isFullView) {
            filteredCards = filteredCards.filter(card => FEATURED_CARDS.includes(card.number));
            totalCardsToShow = FEATURED_CARDS.length;
        }
        if (isFullView && activeFilters.length > 0) {
            filteredCards = filteredCards.filter(card => {
                return activeFilters.every(filterName => 
                    FILTERS_CONFIG[filterName] && FILTERS_CONFIG[filterName].includes(card.number)
                );
            });
        }
        if (sortDirection === 'desc') filteredCards.sort((a, b) => b.number - a.number);
        else filteredCards.sort((a, b) => a.number - b.number);
        displayCards(filteredCards);
        updateCardsCounter(filteredCards.length, totalCardsToShow);
        if (isFullView) {
            updateFilterHint();
            updateFilterCounts();
        }
    }
    
    function displayCards(cards) {
        if (cards.length === 0) {
            cardsContainer.innerHTML = `<div class="empty-state"><h3>Карточки не найдены</h3><p>${isFullView ? 'Нет карточек, соответствующих выбранным фильтрам.' : 'Избранные карточки не найдены.'}</p></div>`;
            return;
        }
        cardsContainer.innerHTML = '';
        cards.forEach(card => {
            const cardElement = document.createElement('div');
            cardElement.className = 'card';
            cardElement.dataset.number = card.number;
            const filename = card.filename.toLowerCase();
            const isVideo = filename.endsWith('.webm') || filename.endsWith('.mp4') || filename.endsWith('.mov');
            if (isVideo) {
                const video = document.createElement('video');
                video.src = card.path;
                video.loading = 'lazy';
                video.muted = true;
                video.loop = true;
                video.playsInline = true;
                cardElement.addEventListener('mouseenter', () => video.play().catch(e => {}));
                cardElement.addEventListener('mouseleave', () => { video.pause(); video.currentTime = 0; });
                cardElement.appendChild(video);
            } else {
                const img = document.createElement('img');
                img.src = card.path;
                img.alt = `Карточка ${card.number}`;
                img.loading = 'lazy';
                img.onerror = function() {
                    this.style.display = 'none';
                    const errorDiv = document.createElement('div');
                    errorDiv.innerHTML = `❌<br>Карточка ${card.number}<br>не найдена`;
                    errorDiv.style.cssText = `color: var(--text-secondary); text-align: center; font-size: 0.9rem; padding: 20px;`;
                    cardElement.appendChild(errorDiv);
                };
                cardElement.appendChild(img);
            }
            cardsContainer.appendChild(cardElement);
        });
        setTimeout(() => {
            setupCardInteractions();
            preventScrollTrigger();
            const cardElements = cardsContainer.querySelectorAll('.card');
            cardElements.forEach((card, index) => {
                setTimeout(() => {
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(20px) scale(0.95)';
                    card.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0) scale(1)';
                    }, 50);
                }, index * 50);
            });
        }, 100);
    }
    
    function updateCardsCounter(current = 0, total = totalCardsCount) {
        if (counterCurrent && counterTotal) {
            counterCurrent.textContent = current;
            counterTotal.textContent = total;
        }
    }
    
    function showFeaturedCards() {
        isFullView = false;
        activeFilters = [];
        updateActiveFilters();
        const featuredCards = FEATURED_CARDS.map(num => currentCards.find(card => card.number === num)).filter(card => card);
        displayCards(featuredCards);
        controlsContainer.style.display = 'none';
        filtersSection.classList.remove('show');
        showMoreBtn.style.display = 'block';
        showLessBtn.style.display = 'none';
        foundCardsCounter.style.display = 'none';
        updateCardsCounter(featuredCards.length, FEATURED_CARDS.length);
        const filterHint = document.getElementById('filterHint');
        if (filterHint) filterHint.textContent = `Показаны избранные карточки (${featuredCards.length} шт.)`;
    }
    
    function showAllCards() {
        isFullView = true;
        controlsContainer.style.display = 'block';
        foundCardsCounter.style.display = 'block';
        setTimeout(() => filtersSection.classList.add('show'), 100);
        showMoreBtn.style.display = 'none';
        showLessBtn.style.display = 'block';
        filterAndDisplayCards();
        updateFilterCounts();
    }
    
    function updateFilterHint() {
        const filterHint = document.getElementById('filterHint');
        if (!filterHint) return;
        if (activeFilters.length === 0) {
            filterHint.textContent = 'Показаны все карточки';
            return;
        }
        const filterNames = activeFilters.join(', ');
        filterHint.textContent = `Показаны карточки, содержащие ВСЕ теги: ${filterNames}`;
    }
    
    function showNoCardsMessage() {
        cardsContainer.innerHTML = `<div class="empty-state"><h3>Карточки не найдены</h3><p>Добавьте карточки в папку cards/ и обновите список в коде</p></div>`;
    }
    
    function preventScrollTrigger() {
        const cards = document.querySelectorAll('.card');
        cards.forEach(card => {
            let touchStartY = 0, touchStartX = 0, isScrolling = false;
            card.addEventListener('touchstart', e => { touchStartY = e.touches[0].clientY; touchStartX = e.touches[0].clientX; isScrolling = false; });
            card.addEventListener('touchmove', e => {
                const deltaY = Math.abs(e.touches[0].clientY - touchStartY);
                const deltaX = Math.abs(e.touches[0].clientX - touchStartX);
                if (deltaY > 10 || deltaX > 10) isScrolling = true;
            });
            card.addEventListener('touchend', function() { setTimeout(() => { this.isScrolling = isScrolling; }, 100); });
        });
    }
    
    function toggleTheme() {
        const currentTheme = document.body.classList.contains('light-theme') ? 'light' : 'dark';
        if (currentTheme === 'dark') {
            document.body.classList.add('light-theme');
            localStorage.setItem('theme', 'light');
            if (desktopThemeToggle) desktopThemeToggle.checked = true;
            if (mobileThemeToggle) mobileThemeToggle.checked = true;
        } else {
            document.body.classList.remove('light-theme');
            localStorage.setItem('theme', 'dark');
            if (desktopThemeToggle) desktopThemeToggle.checked = false;
            if (mobileThemeToggle) mobileThemeToggle.checked = false;
        }
    }
    
    function loadTheme() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'light') {
            document.body.classList.add('light-theme');
            if (desktopThemeToggle) desktopThemeToggle.checked = true;
            if (mobileThemeToggle) mobileThemeToggle.checked = true;
        } else if (savedTheme === 'dark') {
            document.body.classList.remove('light-theme');
            if (desktopThemeToggle) desktopThemeToggle.checked = false;
            if (mobileThemeToggle) mobileThemeToggle.checked = false;
        } else {
            const prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
            if (prefersLight) {
                document.body.classList.add('light-theme');
                if (desktopThemeToggle) desktopThemeToggle.checked = true;
                if (mobileThemeToggle) mobileThemeToggle.checked = true;
            } else {
                document.body.classList.remove('light-theme');
                if (desktopThemeToggle) desktopThemeToggle.checked = false;
                if (mobileThemeToggle) mobileThemeToggle.checked = false;
            }
        }
    }
    
    function toggleMobileMenu() {
        mobileSidebar.classList.toggle('active');
        document.body.style.overflow = mobileSidebar.classList.contains('active') ? 'hidden' : '';
    }
    
    function updateHtmlAndScrollbar() {
        const isLight = document.body.classList.contains('light-theme');
        const htmlBg = isLight ? '#f8fafc' : '#0a0a0f';
        document.documentElement.style.backgroundColor = htmlBg;
        const thumbColor = isLight ? '#2563eb' : '#8a2be2';
        const thumbHover = isLight ? '#1d4ed8' : '#9d3ef5';
        const trackColor = isLight ? 'rgba(0, 0, 0, 0.08)' : 'rgba(0, 0, 0, 0.25)';
        let style = document.getElementById('custom-scrollbar-style');
        if (!style) {
            style = document.createElement('style');
            style.id = 'custom-scrollbar-style';
            document.head.appendChild(style);
        }
        style.textContent = `
            ::-webkit-scrollbar { width: 12px; height: 12px; }
            ::-webkit-scrollbar-track { background: ${trackColor} !important; border-radius: 12px !important; margin: 4px 0 !important; }
            ::-webkit-scrollbar-thumb { background: ${thumbColor} !important; border-radius: 12px !important; }
            ::-webkit-scrollbar-thumb:hover { background: ${thumbHover} !important; }
            * { scrollbar-width: thin !important; scrollbar-color: ${thumbColor} ${trackColor} !important; }
        `;
    }
    
    if ('ontouchstart' in window) {
        document.body.addEventListener('touchstart', (e) => {
            const btn = e.target.closest('.filter-btn, .sort-btn, .mode-btn, .view-toggle-btn');
            if (btn) {
                btn.classList.add('tap-active');
                setTimeout(() => btn.classList.remove('tap-active'), 200);
            }
        });
    }
    
    sortAscBtn.addEventListener('click', () => { sortDirection = 'asc'; sortAscBtn.classList.add('active'); sortDescBtn.classList.remove('active'); filterAndDisplayCards(); });
    sortDescBtn.addEventListener('click', () => { sortDirection = 'desc'; sortDescBtn.classList.add('active'); sortAscBtn.classList.remove('active'); filterAndDisplayCards(); });
    
    if (mobileContactLink) {
        function handleMobileContactClick(e) { if (window.innerWidth <= 768) { e.preventDefault(); e.stopPropagation(); toggleMobileMenu(); } }
        mobileContactLink.addEventListener('click', handleMobileContactClick);
        mobileContactLink.addEventListener('touchend', handleMobileContactClick);
    }
    
    showMoreBtn.addEventListener('click', showAllCards);
    showLessBtn.addEventListener('click', showFeaturedCards);
    
    if (desktopThemeToggle) desktopThemeToggle.addEventListener('change', toggleTheme);
    if (mobileThemeToggle) mobileThemeToggle.addEventListener('change', toggleTheme);
    if (mobileMenuToggle) mobileMenuToggle.addEventListener('click', toggleMobileMenu);
    if (sidebarClose) sidebarClose.addEventListener('click', toggleMobileMenu);
    
    document.addEventListener('click', function(event) {
        if (mobileSidebar.classList.contains('active') && !mobileSidebar.contains(event.target) && !mobileMenuToggle.contains(event.target)) toggleMobileMenu();
    });
    
    window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', e => {
        if (!localStorage.getItem('theme')) {
            if (e.matches) {
                document.body.classList.add('light-theme');
                if (desktopThemeToggle) desktopThemeToggle.checked = true;
                if (mobileThemeToggle) mobileThemeToggle.checked = true;
            } else {
                document.body.classList.remove('light-theme');
                if (desktopThemeToggle) desktopThemeToggle.checked = false;
                if (mobileThemeToggle) mobileThemeToggle.checked = false;
            }
        }
    });
    
    const detailsCloseBtn = document.querySelector('#detailsModal .details-close-btn');
    const backToMainBtn = document.getElementById('backToMainBtn');
    if (detailsCloseBtn) detailsCloseBtn.addEventListener('click', closeDetailsModal);
    if (backToMainBtn) backToMainBtn.addEventListener('click', closeBothModalsAndReturnToGallery);
    
    initializeFilters();
    loadTheme();
    loadCardsFromManualList();
    showFirstVisitTooltip();
    openCardFromHash();
    window.addEventListener('hashchange', function() {
        if (detailsModal.classList.contains('show')) closeDetailsModal();
        openCardFromHash();
    });
    
    updateHtmlAndScrollbar();
    if (desktopThemeToggle) desktopThemeToggle.addEventListener('change', () => setTimeout(updateHtmlAndScrollbar, 30));
    if (mobileThemeToggle) mobileThemeToggle.addEventListener('change', () => setTimeout(updateHtmlAndScrollbar, 30));
    const observer = new MutationObserver(() => updateHtmlAndScrollbar());
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
});