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
    let sortDirection = 'desc';
    let isFullView = false;
    let totalCardsCount = 0;
    let filterMode = 'and'; // 'and' или 'or'

    const YM_COUNTER_ID = 109559184;

    // ------------------- НОВЫЕ ФУНКЦИИ ДЛЯ ВЫПАДАЮЩИХ ФИЛЬТРОВ -------------------
    function createMultiSelectDropdown(category, items, align = 'left') {
        const wrapper = document.createElement('div');
        wrapper.className = 'multi-select-wrapper';
        
        const btn = document.createElement('button');
        btn.className = 'multi-select-btn';
        btn.textContent = 'Выбрать';
        wrapper.appendChild(btn);
        
        const dropdown = document.createElement('div');
        dropdown.className = `multi-select-dropdown align-${align}`;
        const itemsContainer = document.createElement('div');
        itemsContainer.className = 'multi-select-items';
        
        const selectedValues = new Set();
        
        items.forEach(item => {
            const label = document.createElement('label');
            label.className = 'multi-select-item';
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value = item;
            checkbox.addEventListener('change', (e) => {
                if (checkbox.checked) selectedValues.add(item);
                else selectedValues.delete(item);
                updateSelectedCount();
                updateDropdownOptions();
                if (typeof ym === 'function') {
                    ym(YM_COUNTER_ID, 'reachGoal', 'filter_select', {
                        filter_category: category,
                        filter_value: item,
                        action: checkbox.checked ? 'add' : 'remove'
                    });
                }
                filterAndDisplayCards();
            });
            label.appendChild(checkbox);
            label.appendChild(document.createTextNode(item));
            itemsContainer.appendChild(label);
        });
        dropdown.appendChild(itemsContainer);
        wrapper.appendChild(dropdown);
        
        const countSpan = document.createElement('span');
        countSpan.className = 'selected-count';
        btn.appendChild(countSpan);
        
        function updateSelectedCount() {
            const count = selectedValues.size;
            if (count === 0) btn.textContent = 'Выбрать';
            else btn.textContent = `Выбрано (${count})`;
            btn.appendChild(countSpan);
        }
        
        document.addEventListener('click', (e) => {
            if (!wrapper.contains(e.target)) dropdown.classList.remove('open');
        });
        
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpening = !dropdown.classList.contains('open');
            
            // Закрыть все другие дропдауны
            document.querySelectorAll('.multi-select-dropdown.open').forEach(openDropdown => {
                if (openDropdown !== dropdown) {
                    openDropdown.classList.remove('open');
                    const parentGroup = openDropdown.closest('.filter-group');
                    if (parentGroup) parentGroup.style.zIndex = '';
                }
            });
            
            if (isOpening) {
                dropdown.classList.add('open');
                const parentGroup = wrapper.closest('.filter-group');
                if (parentGroup) {
                    parentGroup.style.zIndex = '100';
                    document.querySelectorAll('.filter-group').forEach(group => {
                        if (group !== parentGroup) group.style.zIndex = '1';
                    });
                }
            } else {
                dropdown.classList.remove('open');
                const parentGroup = wrapper.closest('.filter-group');
                if (parentGroup) parentGroup.style.zIndex = '';
            }
        });
        
        wrapper.getSelected = () => Array.from(selectedValues);
        wrapper.setSelected = (values) => {
            selectedValues.clear();
            const checkboxes = itemsContainer.querySelectorAll('input[type="checkbox"]');
            checkboxes.forEach(cb => {
                cb.checked = values.includes(cb.value);
                if (cb.checked) selectedValues.add(cb.value);
            });
            updateSelectedCount();
            updateDropdownOptions();
            filterAndDisplayCards();
        };
        return wrapper;
    }
    
    
    function updateDropdownOptions() {
        if (!window.filterDropdowns) return;
        const currentSelections = {
            rank: window.filterDropdowns.rank.getSelected(),
            title: window.filterDropdowns.title.getSelected(),
            character: window.filterDropdowns.character.getSelected()
        };
        
        function getCardNumbersForValue(category, value) {
            if (category === 'rank') return RANKS_CONFIG[value] || [];
            if (category === 'title') return TITLES_CONFIG[value] || [];
            if (category === 'character') return CHARACTERS_CONFIG[value] || [];
            return [];
        }
        
        let relevantCardNumbers;
        if (filterMode === 'and') {
            relevantCardNumbers = new Set(currentCards.map(c => c.number));
            for (let cat in currentSelections) {
                const selected = currentSelections[cat];
                if (selected.length === 0) continue;
                const catNumbers = new Set();
                for (let val of selected) {
                    const nums = getCardNumbersForValue(cat, val);
                    nums.forEach(n => catNumbers.add(n));
                }
                relevantCardNumbers = new Set([...relevantCardNumbers].filter(n => catNumbers.has(n)));
            }
        } else {
            relevantCardNumbers = new Set(currentCards.map(c => c.number));
        }
        
        function computeAvailableItems(allItems, getNumbersFunc) {
            const available = [];
            for (let val of allItems) {
                const nums = getNumbersFunc(val);
                const hasIntersection = [...nums].some(n => relevantCardNumbers.has(n));
                if (hasIntersection) available.push(val);
            }
            available.sort((a, b) => getNumbersFunc(b).length - getNumbersFunc(a).length);
            return available;
        }
        
        const rankItemsAll = Object.keys(RANKS_CONFIG);
        const titleItemsAll = Object.keys(TITLES_CONFIG);
        const charItemsAll = Object.keys(CHARACTERS_CONFIG);
        
        const availableRanks = computeAvailableItems(rankItemsAll, (val) => RANKS_CONFIG[val] || []);
        const availableTitles = computeAvailableItems(titleItemsAll, (val) => TITLES_CONFIG[val] || []);
        const availableChars = computeAvailableItems(charItemsAll, (val) => CHARACTERS_CONFIG[val] || []);
        
        updateDropdownItems(window.filterDropdowns.rank, rankItemsAll, availableRanks);
        updateDropdownItems(window.filterDropdowns.title, titleItemsAll, availableTitles);
        updateDropdownItems(window.filterDropdowns.character, charItemsAll, availableChars);
    }
    
    function updateDropdownItems(dropdownWrapper, allItems, availableItems) {
        const itemsContainer = dropdownWrapper.querySelector('.multi-select-items');
        const checkboxes = itemsContainer.querySelectorAll('input[type="checkbox"]');
        // Сортировка видимых элементов по порядку availableItems
        const orderMap = new Map(availableItems.map((item, idx) => [item, idx]));
        const sortedCheckboxes = Array.from(checkboxes).sort((a, b) => {
            const idxA = orderMap.get(a.value) ?? Infinity;
            const idxB = orderMap.get(b.value) ?? Infinity;
            return idxA - idxB;
        });
        // Переставляем в DOM
        for (let cb of sortedCheckboxes) {
            itemsContainer.appendChild(cb.parentElement);
        }
        // Обновляем видимость и состояние
        checkboxes.forEach(cb => {
            const item = cb.value;
            const isAvailable = availableItems.includes(item);
            const label = cb.parentElement;
            if (isAvailable) {
                label.style.display = '';
                cb.disabled = false;
            } else {
                label.style.display = 'none';
                cb.disabled = true;
                if (cb.checked) {
                    cb.checked = false;
                    const selected = dropdownWrapper.getSelected();
                    const newSelected = selected.filter(v => v !== item);
                    dropdownWrapper.setSelected(newSelected);
                }
            }
        });
    }
    
    function initializeFilters() {
        function sortByCount(items, config) {
            return items.sort((a, b) => config[b].length - config[a].length);
        }
        
        const rankItems = sortByCount(Object.keys(RANKS_CONFIG), RANKS_CONFIG);
        const titleItems = sortByCount(Object.keys(TITLES_CONFIG), TITLES_CONFIG);
        const charItems = sortByCount(Object.keys(CHARACTERS_CONFIG), CHARACTERS_CONFIG);
        
        const rankContainer = document.createElement('div');
        rankContainer.className = 'filter-group';
        rankContainer.innerHTML = '<div class="filter-group-label">Rank</div>';
        const rankDropdown = createMultiSelectDropdown('rank', rankItems, 'left');
        rankContainer.appendChild(rankDropdown);
        
        const titleContainer = document.createElement('div');
        titleContainer.className = 'filter-group';
        titleContainer.innerHTML = '<div class="filter-group-label">Тайтл / Вселенная</div>';
        const titleDropdown = createMultiSelectDropdown('title', titleItems, 'center');
        titleContainer.appendChild(titleDropdown);
        
        const charContainer = document.createElement('div');
        charContainer.className = 'filter-group';
        charContainer.innerHTML = '<div class="filter-group-label">Персонаж</div>';
        const charDropdown = createMultiSelectDropdown('character', charItems, 'right');
        charContainer.appendChild(charDropdown);
        
        // Кнопка переключения AND/OR
        const logicContainer = document.createElement('div');
        logicContainer.className = 'logic-switch-container';
        const logicBtn = document.createElement('button');
        logicBtn.className = 'logic-switch-btn and-mode';
        logicBtn.textContent = 'Режим: И (все теги)';
        logicBtn.addEventListener('click', () => {
            filterMode = filterMode === 'and' ? 'or' : 'and';
            if (filterMode === 'and') {
                logicBtn.textContent = 'Режим: И (все теги)';
                logicBtn.classList.remove('or-mode');
                logicBtn.classList.add('and-mode');
            } else {
                logicBtn.textContent = 'Режим: ИЛИ (любой тег)';
                logicBtn.classList.remove('and-mode');
                logicBtn.classList.add('or-mode');
            }
            if (typeof ym === 'function') {
                ym(YM_COUNTER_ID, 'reachGoal', 'filter_mode_switch', { mode: filterMode });
            }
            updateDropdownOptions();
            filterAndDisplayCards();
        });
        logicContainer.appendChild(logicBtn);
        
        filtersContainer.innerHTML = '';
        filtersContainer.appendChild(rankContainer);
        filtersContainer.appendChild(titleContainer);
        filtersContainer.appendChild(charContainer);
        filtersContainer.appendChild(logicContainer);
        
        window.filterDropdowns = {
            rank: rankDropdown,
            title: titleDropdown,
            character: charDropdown
        };
    }
    
    // ------------------- ОСТАЛЬНЫЕ ФУНКЦИИ -------------------
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
            <p><span class="tooltip-highlight">Нажмите на карточку</span>, чтобы разглядеть её поближе.</p>
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
        if (cardInfo.remanga_url && cardInfo.remanga_url.trim() !== '') {
            html += `<p><strong><span class="remanga-icon"></span> <a href="${escapeHtml(cardInfo.remanga_url)}" target="_blank" rel="noopener noreferrer">Ссылка на карту на Remanga</a></strong></p>`;
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

        if (typeof ym === 'function') {
            ym(YM_COUNTER_ID, 'reachGoal', 'card_open', { card_id: cardNumber });
        }
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

        if (typeof ym === 'function') {
            ym(YM_COUNTER_ID, 'reachGoal', 'card_doubleclick', { card_id: cardNumber });
        }
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

        if (typeof ym === 'function') {
            ym(YM_COUNTER_ID, 'reachGoal', 'card_doubleclick', { card_id: cardNumber });
        }
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
            card.removeEventListener('touchstart', handleCardTouchStart);
            card.removeEventListener('touchend', handleCardTouchEnd);
            card.addEventListener('click', handleCardClick);
            card.addEventListener('touchstart', handleCardTouchStart, { passive: true });
            card.addEventListener('touchend', handleCardTouchEnd);
        });
    }

    function handleCardClick(e) {
        if (this.touchHandled) {
            this.touchHandled = false;
            return;
        }
        e.preventDefault();
        e.stopPropagation();
        const cardNumber = parseInt(this.dataset.number);
        const video = this.querySelector('video');
        const img = this.querySelector('img');
        if (video) openVideoModal(video.src, cardNumber);
        else if (img) openImageModal(img.src, cardNumber);
    }

    function handleCardTouchStart(e) {
        const touch = e.touches[0];
        this.touchStartX = touch.clientX;
        this.touchStartY = touch.clientY;
        this.touchMoved = false;
    }

    function handleCardTouchEnd(e) {
        if (this.touchMoved) {
            this.touchMoved = false;
            return;
        }
        const touchEnd = e.changedTouches[0];
        const deltaX = Math.abs(touchEnd.clientX - this.touchStartX);
        const deltaY = Math.abs(touchEnd.clientY - this.touchStartY);
        if (deltaX > 10 || deltaY > 10) {
            return;
        }
        e.preventDefault();
        e.stopPropagation();
        const cardNumber = parseInt(this.dataset.number);
        const video = this.querySelector('video');
        const img = this.querySelector('img');
        if (video) openVideoModal(video.src, cardNumber);
        else if (img) openImageModal(img.src, cardNumber);
        this.touchHandled = true;
        setTimeout(() => { this.touchHandled = false; }, 100);
    }
    
    function loadCardsFromManualList() {
        try {
            const cardsFolder = './cards/';
            const sortedCards = [...MANUAL_CARD_LIST].sort((a, b) => b.number - a.number);
            const cardsWithPaths = sortedCards.map(card => ({ ...card, path: cardsFolder + card.filename }));
            currentCards = cardsWithPaths;
            totalCardsCount = currentCards.length;
            showFeaturedCards(true);
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
        } else {
            const selectedRanks = window.filterDropdowns?.rank.getSelected() || [];
            const selectedTitles = window.filterDropdowns?.title.getSelected() || [];
            const selectedChars = window.filterDropdowns?.character.getSelected() || [];
            const allSelected = [...selectedRanks, ...selectedTitles, ...selectedChars];
            if (allSelected.length > 0) {
                if (filterMode === 'and') {
                    filteredCards = filteredCards.filter(card => {
                        return allSelected.every(filterName => {
                            if (RANKS_CONFIG[filterName]) return RANKS_CONFIG[filterName].includes(card.number);
                            if (TITLES_CONFIG[filterName]) return TITLES_CONFIG[filterName].includes(card.number);
                            if (CHARACTERS_CONFIG[filterName]) return CHARACTERS_CONFIG[filterName].includes(card.number);
                            return false;
                        });
                    });
                } else {
                    filteredCards = filteredCards.filter(card => {
                        return allSelected.some(filterName => {
                            if (RANKS_CONFIG[filterName]) return RANKS_CONFIG[filterName].includes(card.number);
                            if (TITLES_CONFIG[filterName]) return TITLES_CONFIG[filterName].includes(card.number);
                            if (CHARACTERS_CONFIG[filterName]) return CHARACTERS_CONFIG[filterName].includes(card.number);
                            return false;
                        });
                    });
                }
            }
        }
        if (sortDirection === 'desc') filteredCards.sort((a, b) => b.number - a.number);
        else filteredCards.sort((a, b) => a.number - b.number);
        displayCards(filteredCards);
        updateCardsCounter(filteredCards.length, totalCardsToShow);
        if (isFullView) updateFilterHint();
    }
    
    function displayCards(cards, keepOrder = false) {
        if (cards.length === 0) {
            cardsContainer.innerHTML = `<div class="empty-state"><h3>Карточки не найдены</h3><p>${isFullView ? 'Нет карточек, соответствующих выбранным фильтрам.' : 'Избранные карточки не найдены.'}</p></div>`;
            return;
        }
        let cardsToDisplay = cards;
        if (!keepOrder) {
            if (sortDirection === 'desc') cardsToDisplay = [...cards].sort((a, b) => b.number - a.number);
            else cardsToDisplay = [...cards].sort((a, b) => a.number - b.number);
        }
        cardsContainer.innerHTML = '';
        cardsToDisplay.forEach(card => {
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
    
    function showFeaturedCards(skipAnalytics = false) {
        isFullView = false;
        if (window.filterDropdowns) {
            window.filterDropdowns.rank.setSelected([]);
            window.filterDropdowns.title.setSelected([]);
            window.filterDropdowns.character.setSelected([]);
        }
        const featuredCards = FEATURED_CARDS
            .map(num => currentCards.find(card => card.number === num))
            .filter(card => card);
        displayCards(featuredCards, true);
        controlsContainer.style.display = 'none';
        filtersSection.classList.remove('show');
        showMoreBtn.style.display = 'block';
        showLessBtn.style.display = 'none';
        foundCardsCounter.style.display = 'none';
        updateCardsCounter(featuredCards.length, FEATURED_CARDS.length);
        const filterHint = document.getElementById('filterHint');
        if (filterHint) filterHint.textContent = `Показаны избранные карточки (${featuredCards.length} шт.)`;
        if (!skipAnalytics && typeof ym === 'function') {
            ym(YM_COUNTER_ID, 'reachGoal', 'show_featured_cards');
        }
    }
    
    function showAllCards() {
        isFullView = true;
        controlsContainer.style.display = 'block';
        foundCardsCounter.style.display = 'block';
        setTimeout(() => filtersSection.classList.add('show'), 100);
        showMoreBtn.style.display = 'none';
        showLessBtn.style.display = 'block';
        filterAndDisplayCards();
        if (typeof ym === 'function') {
            ym(YM_COUNTER_ID, 'reachGoal', 'show_all_cards');
        }
    }
    
    function updateFilterHint() {
        const filterHint = document.getElementById('filterHint');
        if (!filterHint) return;
        const selectedRanks = window.filterDropdowns?.rank.getSelected() || [];
        const selectedTitles = window.filterDropdowns?.title.getSelected() || [];
        const selectedChars = window.filterDropdowns?.character.getSelected() || [];
        const allSelected = [...selectedRanks, ...selectedTitles, ...selectedChars];
        if (allSelected.length === 0) {
            filterHint.textContent = 'Показаны все карточки';
        } else {
            const modeText = filterMode === 'and' ? 'ВСЕ теги' : 'ЛЮБОЙ из тегов';
            filterHint.textContent = `Показаны карточки, содержащие ${modeText}: ${allSelected.join(', ')}`;
        }
    }
    
    function showNoCardsMessage() {
        cardsContainer.innerHTML = `<div class="empty-state"><h3>Карточки не найдены</h3><p>Добавьте карточки в папку cards/ и обновите список в коде</p></div>`;
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
    
    // ------------------- ОБРАБОТЧИКИ СОБЫТИЙ -------------------
    sortAscBtn.addEventListener('click', () => { sortDirection = 'asc'; sortAscBtn.classList.add('active'); sortDescBtn.classList.remove('active'); filterAndDisplayCards(); });
    sortDescBtn.addEventListener('click', () => { sortDirection = 'desc'; sortDescBtn.classList.add('active'); sortAscBtn.classList.remove('active'); filterAndDisplayCards(); });
    
    if (mobileContactLink) {
        function handleMobileContactClick(e) { if (window.innerWidth <= 768) { e.preventDefault(); e.stopPropagation(); toggleMobileMenu(); } }
        mobileContactLink.addEventListener('click', handleMobileContactClick);
        mobileContactLink.addEventListener('touchend', handleMobileContactClick);
    }
    
    showMoreBtn.addEventListener('click', showAllCards);
    showLessBtn.addEventListener('click', () => showFeaturedCards());
    
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
    
    // ИНИЦИАЛИЗАЦИЯ
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

    document.querySelectorAll('.contact-link-with-text, .mobile-contact-link').forEach(link => {
        link.addEventListener('click', function(e) {
            let platform = '';
            if (this.classList.contains('telegram')) platform = 'telegram';
            else if (this.classList.contains('discord')) platform = 'discord';
            else if (this.classList.contains('boosty')) platform = 'boosty';
            else if (this.classList.contains('vk')) platform = 'vk';
            else if (this.classList.contains('pinterest')) platform = 'pinterest';
            
            if (platform && typeof ym === 'function') {
                ym(YM_COUNTER_ID, 'reachGoal', 'social_click', { platform: platform });
            }
        });
    });
});