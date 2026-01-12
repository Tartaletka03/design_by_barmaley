document.addEventListener('DOMContentLoaded', function() {
    const imageModal = document.getElementById('imageModal');
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
    
    // Элементы мобильного меню
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const mobileSidebar = document.getElementById('mobileSidebar');
    const sidebarClose = document.getElementById('sidebarClose');
    const mobileThemeToggle = document.getElementById('mobileThemeToggle');
    const desktopThemeToggle = document.getElementById('desktopThemeToggle');
    
    let currentCards = [];
    let activeFilters = [];
    let sortDirection = 'desc';
    let filterMode = 'or';
    let isFullView = false;
    let totalCardsCount = 0;
    
    // Инициализация фильтров
    function initializeFilters() {
        // Добавляем кнопку "Все"
        const allButton = document.createElement('button');
        allButton.className = 'filter-btn active';
        allButton.textContent = 'Все';
        allButton.addEventListener('click', () => {
            activeFilters = [];
            updateActiveFilters();
            filterAndDisplayCards();
        });
        filtersContainer.appendChild(allButton);
        
        // Добавляем остальные фильтры из конфигурации
        Object.keys(FILTERS_CONFIG).forEach(filterName => {
            const button = document.createElement('button');
            button.className = 'filter-btn';
            button.textContent = filterName;
            button.addEventListener('click', () => {
                toggleFilter(filterName);
            });
            filtersContainer.appendChild(button);
        });
    }
    
    // Переключение фильтра
    function toggleFilter(filterName) {
        const index = activeFilters.indexOf(filterName);
        if (index === -1) {
            activeFilters.push(filterName);
        } else {
            activeFilters.splice(index, 1);
        }
        updateActiveFilters();
        filterAndDisplayCards();
        updateFilterHint();
    }
    
    // Обновление активных фильтров
    function updateActiveFilters() {
        const buttons = filtersContainer.querySelectorAll('.filter-btn');
        buttons.forEach(button => {
            if (button.textContent === 'Все') {
                button.classList.toggle('active', activeFilters.length === 0);
            } else {
                button.classList.toggle('active', activeFilters.includes(button.textContent));
            }
        });
    }

    // Функция для открытия картинки в полноэкранном режиме
    function openImageModal(imageSrc) {
        const modalContent = document.querySelector('.modal-content');
        modalContent.innerHTML = '';
        
        const img = document.createElement('img');
        img.src = imageSrc;
        img.alt = "Увеличенная карточка";
        img.style.maxWidth = '100%';
        img.style.maxHeight = '100%';
        img.style.objectFit = 'contain';
        img.style.borderRadius = '8px';
        
        // АККУРАТНЫЙ КРЕСТИК ДЛЯ ЗАКРЫТИЯ
        const closeButton = document.createElement('div');
        closeButton.innerHTML = '×';
        closeButton.className = 'modal-close-btn';
        
        // Функция закрытия
        function closeModalHandler(e) {
            e.preventDefault();
            e.stopPropagation();
            closeImageModal();
            return false;
        }
        
        closeButton.addEventListener('click', closeModalHandler);
        closeButton.addEventListener('touchend', closeModalHandler);
        
        modalContent.appendChild(img);
        modalContent.appendChild(closeButton);
        imageModal.classList.add('show');
        document.body.style.overflow = 'hidden';
        
        // Предотвращаем скролл на фоне для мобильных
        document.addEventListener('touchmove', preventScroll, { passive: false });
    }

    // Функция для открытия ВИДЕО в полноэкранном режиме
    function openVideoModal(videoSrc) {
        const modalContent = document.querySelector('.modal-content');
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
        
        // АККУРАТНЫЙ КРЕСТИК ДЛЯ ЗАКРЫТИЯ
        const closeButton = document.createElement('div');
        closeButton.innerHTML = '×';
        closeButton.className = 'modal-close-btn';
        
        // Функция закрытия
        function closeModalHandler(e) {
            e.preventDefault();
            e.stopPropagation();
            closeImageModal();
            return false;
        }
        
        closeButton.addEventListener('click', closeModalHandler);
        closeButton.addEventListener('touchend', closeModalHandler);
        
        modalContent.appendChild(video);
        modalContent.appendChild(closeButton);
        
        imageModal.classList.add('show');
        document.body.style.overflow = 'hidden';
        
        // Предотвращаем скролл на фоне для мобильных
        document.addEventListener('touchmove', preventScroll, { passive: false });
        
        // Пытаемся запустить видео
        video.play().catch(e => {
            console.log('Автовоспроизведение заблокировано');
        });
    }

    // Функция для закрытия модального окна
    function closeImageModal() {
        const video = document.querySelector('.modal-content video');
        if (video) {
            video.pause();
            video.currentTime = 0;
        }
        
        imageModal.classList.remove('show');
        document.body.style.overflow = '';
        
        // Восстанавливаем скролл
        document.removeEventListener('touchmove', preventScroll);
    }

    // Функция предотвращения скролла для модального окна
    function preventScroll(e) {
        if (imageModal.classList.contains('show')) {
            e.preventDefault();
            return false;
        }
    }

    // Обновленная функция для обработки нажатий на карточки
    function setupCardInteractions() {
        const cards = document.querySelectorAll('.card');
        
        cards.forEach(card => {
            // Удаляем старые обработчики
            card.removeEventListener('click', handleCardClick);
            card.removeEventListener('touchend', handleCardTouch);
            
            // Добавляем новые обработчики
            card.addEventListener('click', handleCardClick);
            card.addEventListener('touchend', handleCardTouch);
        });
    }

    // Обработчик клика для десктопа
    function handleCardClick(e) {
        // Проверяем, было ли это двойное нажатие
        const currentTime = new Date().getTime();
        const timeSinceLastClick = currentTime - (this.lastClickTime || 0);
        
        if (timeSinceLastClick < 300) {
            // Двойной клик - открываем модальное окно
            e.preventDefault();
            e.stopPropagation();
            
            const video = this.querySelector('video');
            const img = this.querySelector('img');
            
            if (video) {
                openVideoModal(video.src);
            } else if (img) {
                openImageModal(img.src);
            }
            
            this.lastClickTime = 0;
        } else {
            // Одиночный клик - запоминаем время
            this.lastClickTime = currentTime;
        }
    }

    // Обработчик касания для мобильных
    function handleCardTouch(e) {
        // Предотвращаем срабатывание при скролле
        if (this.isScrolling) {
            return;
        }
        
        // Проверяем, было ли это двойное касание
        const currentTime = new Date().getTime();
        const timeSinceLastTap = currentTime - (this.lastTapTime || 0);
        
        if (timeSinceLastTap < 300 && timeSinceLastTap > 0) {
            // Двойное касание - открываем модальное окно
            e.preventDefault();
            e.stopPropagation();
            
            const video = this.querySelector('video');
            const img = this.querySelector('img');
            
            if (video) {
                openVideoModal(video.src);
            } else if (img) {
                openImageModal(img.src);
            }
            
            this.lastTapTime = 0;
            this.tapCount = 0;
        } else {
            // Одиночное касание - запоминаем время
            this.lastTapTime = currentTime;
            this.tapCount = (this.tapCount || 0) + 1;
            
            // Сбрасываем счетчик через 500 мс
            setTimeout(() => {
                this.tapCount = 0;
            }, 500);
        }
    }

    // Функция для предотвращения случайных срабатываний при скролле
    function preventScrollTrigger() {
        const cards = document.querySelectorAll('.card');
        
        cards.forEach(card => {
            let touchStartY = 0;
            let touchStartX = 0;
            let isScrolling = false;
            
            card.addEventListener('touchstart', function(e) {
                touchStartY = e.touches[0].clientY;
                touchStartX = e.touches[0].clientX;
                isScrolling = false;
            });
            
            card.addEventListener('touchmove', function(e) {
                const touchY = e.touches[0].clientY;
                const touchX = e.touches[0].clientX;
                const deltaY = Math.abs(touchY - touchStartY);
                const deltaX = Math.abs(touchX - touchStartX);
                
                // Если перемещение больше 10px, считаем это скроллом
                if (deltaY > 10 || deltaX > 10) {
                    isScrolling = true;
                }
            });
            
            card.addEventListener('touchend', function(e) {
                // Задержка для предотвращения срабатывания при быстром скролле
                setTimeout(() => {
                    this.isScrolling = isScrolling;
                }, 100);
            });
        });
    }
    
    // Загрузка карточек из ручного списка
    function loadCardsFromManualList() {
        try {
            const cardsFolder = './cards/';
            
            // Сортируем по номеру от большего к меньшему
            const sortedCards = [...MANUAL_CARD_LIST].sort((a, b) => b.number - a.number);
            
            // Проверяем существование файлов
            const cardsWithPaths = sortedCards.map(card => ({
                ...card,
                path: cardsFolder + card.filename
            }));
            
            // Обновляем текущие карточки
            currentCards = cardsWithPaths;
            totalCardsCount = currentCards.length;
            
            console.log('✅ Загружено карточек из ручного списка:', totalCardsCount);
            
            // Показываем избранные карты
            showFeaturedCards();
            
            // Обновляем счетчик
            updateCardsCounter();
            
            // Показываем успешное уведомление
            showNotification(`✅ Загружено ${totalCardsCount} карточек`, 'success');
            
        } catch (error) {
            console.error('Ошибка загрузки карточек:', error);
            showNotification('❌ Ошибка загрузки карточек', 'error');
            showNoCardsMessage();
        }
    }
    
    // Фильтрация и отображение карточек
    function filterAndDisplayCards() {
        let filteredCards = [...currentCards];
        let totalCardsToShow = totalCardsCount;
        
        // В режиме избранных показываем только выбранные карты
        if (!isFullView) {
            filteredCards = filteredCards.filter(card => 
                FEATURED_CARDS.includes(card.number)
            );
            totalCardsToShow = FEATURED_CARDS.length;
        }
        
        // Применяем фильтры, если есть активные (только в полном режиме)
        if (isFullView && activeFilters.length > 0) {
            if (filterMode === 'or') {
                const filteredNumbers = new Set();
                activeFilters.forEach(filterName => {
                    if (FILTERS_CONFIG[filterName]) {
                        FILTERS_CONFIG[filterName].forEach(num => filteredNumbers.add(num));
                    }
                });
                filteredCards = filteredCards.filter(card => 
                    filteredNumbers.has(card.number)
                );
            } else if (filterMode === 'and') {
                filteredCards = filteredCards.filter(card => {
                    return activeFilters.every(filterName => {
                        return FILTERS_CONFIG[filterName] && FILTERS_CONFIG[filterName].includes(card.number);
                    });
                });
            } else if (filterMode === 'except') {
                const excludedNumbers = new Set();
                activeFilters.forEach(filterName => {
                    if (FILTERS_CONFIG[filterName]) {
                        FILTERS_CONFIG[filterName].forEach(num => excludedNumbers.add(num));
                    }
                });
                filteredCards = filteredCards.filter(card => 
                    !excludedNumbers.has(card.number)
                );
            }
        }
        
        // Применяем сортировку
        if (sortDirection === 'desc') {
            filteredCards.sort((a, b) => b.number - a.number);
        } else {
            filteredCards.sort((a, b) => a.number - b.number);
        }
        
        // Отображаем карточки
        displayCards(filteredCards);
        
        // Обновляем счетчик
        updateCardsCounter(filteredCards.length, totalCardsToShow);
        
        // Обновляем подсказку
        if (isFullView) {
            updateFilterHint();
        }
    }
    
    // Отображение карточек
    function displayCards(cards) {
        if (cards.length === 0) {
            cardsContainer.innerHTML = `
                <div class="empty-state">
                    <h3>Карточки не найдены</h3>
                    <p>${isFullView ? 'Нет карточек, соответствующих выбранным фильтрам.' : 'Избранные карточки не найдены.'}</p>
                </div>
            `;
            return;
        }
        
        cardsContainer.innerHTML = '';
        
        cards.forEach(card => {
            const cardElement = document.createElement('div');
            cardElement.className = 'card';
            
            const filename = card.filename.toLowerCase();
            const isVideo = filename.endsWith('.webm') || filename.endsWith('.mp4') || filename.endsWith('.mov');
            
            if (isVideo) {
                const video = document.createElement('video');
                video.src = card.path;
                video.alt = `Видео карточка ${card.number}`;
                video.loading = 'lazy';
                video.muted = true;
                video.loop = true;
                video.playsInline = true;
                
                cardElement.addEventListener('mouseenter', function() {
                    video.play().catch(e => console.log('Автовоспроизведение заблокировано'));
                });
                
                cardElement.addEventListener('mouseleave', function() {
                    video.pause();
                    video.currentTime = 0;
                });
                
                cardElement.appendChild(video);
            } else {
                const img = document.createElement('img');
                img.src = card.path;
                img.alt = `Карточка ${card.number}`;
                img.loading = 'lazy';
                
                img.onerror = function() {
                    console.error(`Не удалось загрузить изображение: ${card.path}`);
                    this.style.display = 'none';
                    const errorDiv = document.createElement('div');
                    errorDiv.innerHTML = `❌<br>Карточка ${card.number}<br>не найдена`;
                    errorDiv.style.cssText = `
                        color: var(--text-secondary);
                        text-align: center;
                        font-size: 0.9rem;
                        padding: 20px;
                    `;
                    cardElement.appendChild(errorDiv);
                };
                
                cardElement.appendChild(img);
            }
            
            cardsContainer.appendChild(cardElement);
        });
        
        // Настраиваем взаимодействие с карточками
        setTimeout(() => {
            setupCardInteractions();
            preventScrollTrigger();
            
            // Анимация появления карточек
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
    
    // Обновление счетчика карточек
    function updateCardsCounter(current = 0, total = totalCardsCount) {
        if (counterCurrent && counterTotal) {
            counterCurrent.textContent = current;
            counterTotal.textContent = total;
        }
    }

    // Закрытие по клику на затемненную область
    imageModal.addEventListener('click', function(e) {
        if (e.target === imageModal || e.target.classList.contains('modal-close')) {
            closeImageModal();
        }
    });

    // Закрытие по touch на мобильных
    imageModal.addEventListener('touchend', function(e) {
        if (e.target === imageModal || e.target.classList.contains('modal-close')) {
            e.preventDefault();
            e.stopPropagation();
            closeImageModal();
            return false;
        }
    });

    // Закрытие по нажатию Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && imageModal.classList.contains('show')) {
            closeImageModal();
        }
    });
    
    // Показать избранные карты
    function showFeaturedCards() {
        isFullView = false;
        activeFilters = [];
        updateActiveFilters();
        
        // Сортируем избранные карты от новых к старым
        let featuredCards = currentCards.filter(card => 
            FEATURED_CARDS.includes(card.number)
        );
        
        // Применяем сортировку
        if (sortDirection === 'desc') {
            featuredCards.sort((a, b) => b.number - a.number);
        } else {
            featuredCards.sort((a, b) => a.number - b.number);
        }
        
        // Отображаем карточки
        displayCards(featuredCards);
        
        controlsContainer.style.display = 'none';
        filtersSection.classList.remove('show');
        showMoreBtn.style.display = 'block';
        showLessBtn.style.display = 'none';
        foundCardsCounter.style.display = 'none';
        
        // Обновляем счетчик
        updateCardsCounter(featuredCards.length, FEATURED_CARDS.length);
        
        // Обновляем подсказку
        const filterHint = document.getElementById('filterHint');
        if (filterHint) {
            filterHint.textContent = `Показаны избранные карточки (${featuredCards.length} шт.)`;
        }
    }
    
    // Показать все карты с фильтрами
    function showAllCards() {
        isFullView = true;
        controlsContainer.style.display = 'block';
        foundCardsCounter.style.display = 'block';
        setTimeout(() => {
            filtersSection.classList.add('show');
        }, 100);
        showMoreBtn.style.display = 'none';
        showLessBtn.style.display = 'block';
        filterAndDisplayCards();
    }
    
    // Функция для обновления подсказки фильтра
    function updateFilterHint() {
        const filterHint = document.getElementById('filterHint');
        if (!filterHint) return;
        
        if (activeFilters.length === 0) {
            filterHint.textContent = 'Показаны все карточки';
            return;
        }
        
        const filterNames = activeFilters.join(', ');
        
        if (filterMode === 'or') {
            filterHint.textContent = `Показаны карточки с тегами: ${filterNames}`;
        } else if (filterMode === 'and') {
            filterHint.textContent = `Показаны карточки со всеми тегами: ${filterNames}`;
        } else if (filterMode === 'except') {
            filterHint.textContent = `Показаны карточки КРОМЕ тегов: ${filterNames}`;
        }
    }

    // Сообщение об отсутствии карточек
    function showNoCardsMessage() {
        cardsContainer.innerHTML = `
            <div class="empty-state">
                <h3>Карточки не найдены</h3>
                <p>Добавьте карточки в папку cards/ и обновите список в коде</p>
            </div>
        `;
    }
    
    // Показать уведомление
    function showNotification(message, type = 'info') {
        const existingNotification = document.querySelector('.auto-notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        const notification = document.createElement('div');
        notification.className = 'auto-notification';
        notification.style.cssText = `
            position: fixed;
            top: 80px;
            left: 50%;
            transform: translateX(-50%);
            background: ${type === 'error' ? '#ff4444' : type === 'success' ? '#00c851' : '#33b5e5'};
            color: white;
            padding: 12px 24px;
            border-radius: 25px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            z-index: 10000;
            font-size: 0.9rem;
            font-weight: 500;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.1);
            text-align: center;
            max-width: 90%;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // Анимация появления
        setTimeout(() => {
            notification.style.opacity = '1';
        }, 10);
        
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, 3000);
    }

    // Управление темой
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

    // Управление мобильным меню
    function toggleMobileMenu() {
        mobileSidebar.classList.toggle('active');
        document.body.style.overflow = mobileSidebar.classList.contains('active') ? 'hidden' : '';
    }

    // Обработчики событий
    sortAscBtn.addEventListener('click', function() {
        sortDirection = 'asc';
        sortAscBtn.classList.add('active');
        sortDescBtn.classList.remove('active');
        filterAndDisplayCards();
    });
    
    sortDescBtn.addEventListener('click', function() {
        sortDirection = 'desc';
        sortDescBtn.classList.add('active');
        sortAscBtn.classList.remove('active');
        filterAndDisplayCards();
    });
    
    showMoreBtn.addEventListener('click', showAllCards);
    showLessBtn.addEventListener('click', showFeaturedCards);
    
    // Обработчики режимов фильтрации
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            filterMode = this.dataset.mode;
            filterAndDisplayCards();
            updateFilterHint();
        });
    });
    
    // Обработчики темы
    if (desktopThemeToggle) {
        desktopThemeToggle.addEventListener('change', toggleTheme);
    }
    
    if (mobileThemeToggle) {
        mobileThemeToggle.addEventListener('change', toggleTheme);
    }
    
    // Обработчики мобильного меню
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', toggleMobileMenu);
    }
    
    if (sidebarClose) {
        sidebarClose.addEventListener('click', toggleMobileMenu);
    }
    
    // Закрытие меню при клике вне его
    document.addEventListener('click', function(event) {
        if (mobileSidebar.classList.contains('active') && 
            !mobileSidebar.contains(event.target) && 
            !mobileMenuToggle.contains(event.target)) {
            toggleMobileMenu();
        }
    });
    
    // Слушаем изменения системной темы
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
    
    // Инициализация
    initializeFilters();
    loadTheme();
    loadCardsFromManualList();
});