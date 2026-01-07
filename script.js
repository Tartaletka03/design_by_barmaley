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
    
    let currentCards = [];
    let activeFilters = [];
    let sortDirection = 'desc';
    let filterMode = 'or';
    let isFullView = false;
    
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

    // Функция для открытия карточки в полноэкранном режиме
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
        
        // Кнопка закрытия
        const closeButton = document.createElement('div');
        closeButton.innerHTML = '✕';
        closeButton.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            width: 50px;
            height: 50px;
            background: rgba(0,0,0,0.7);
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            cursor: pointer;
            z-index: 2001;
            user-select: none;
            touch-action: manipulation;
            box-shadow: 0 2px 10px rgba(0,0,0,0.3);
        `;
        
        // Функция для закрытия
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
    }

    function openVideoModal(videoSrc) {
        const video = document.createElement('video');
        video.src = videoSrc;
        video.autoplay = true;
        video.loop = true;
        video.muted = true;
        video.style.width = '100vw';
        video.style.height = '100vh';
        video.style.maxWidth = '100vw';
        video.style.maxHeight = '100vh';
        video.style.objectFit = 'contain';
        
        const modalContent = document.querySelector('.modal-content');
        modalContent.innerHTML = '';
        
        // Кнопка закрытия
        const closeButton = document.createElement('div');
        closeButton.innerHTML = '✕';
        closeButton.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            width: 50px;
            height: 50px;
            background: rgba(0,0,0,0.7);
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            cursor: pointer;
            z-index: 2001;
            user-select: none;
            touch-action: manipulation;
            box-shadow: 0 2px 10px rgba(0,0,0,0.3);
        `;
        
        // Функция для закрытия
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
        
        video.play().catch(e => {
            console.log('Автовоспроизведение заблокировано');
            const playButton = document.createElement('button');
            playButton.textContent = '▶️ Воспроизвести видео';
            playButton.style.cssText = `
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                padding: 15px 30px;
                background: var(--accent);
                color: white;
                border: none;
                border-radius: 25px;
                font-size: 1.2rem;
                cursor: pointer;
                z-index: 1000;
                touch-action: manipulation;
            `;
            
            function playVideoHandler(e) {
                e.preventDefault();
                video.play();
                playButton.remove();
                return false;
            }
            
            playButton.addEventListener('click', playVideoHandler);
            playButton.addEventListener('touchend', playVideoHandler);
            modalContent.appendChild(playButton);
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
    }
    
    // ПРОСТАЯ ЗАГРУЗКА КАРТОЧЕК ИЗ РУЧНОГО СПИСКА
    function loadCardsFromManualList() {
        try {
            const cardsFolder = './cards/';
            
            // Сортируем по номеру от большего к меньшему (новые -> старые)
            const sortedCards = [...MANUAL_CARD_LIST].sort((a, b) => b.number - a.number);
            
            // Проверяем существование файлов (опционально)
            const cardsWithPaths = sortedCards.map(card => ({
                ...card,
                path: cardsFolder + card.filename
            }));
            
            // Обновляем текущие карточки
            currentCards = cardsWithPaths;
            
            console.log('✅ Загружено карточек из ручного списка:', currentCards.length);
            
            // Показываем избранные карты
            showFeaturedCards();
            
            // Показываем успешное уведомление
            showNotification(`✅ Загружено ${currentCards.length} карточек`, 'success');
            
        } catch (error) {
            console.error('Ошибка загрузки карточек:', error);
            showNotification('❌ Ошибка загрузки карточек', 'error');
            showNoCardsMessage();
        }
    }
    
    // Фильтрация и отображение карточек
    function filterAndDisplayCards() {
        let filteredCards = [...currentCards];
        
        // В режиме избранных показываем только выбранные карты
        if (!isFullView) {
            filteredCards = filteredCards.filter(card => 
                FEATURED_CARDS.includes(card.number)
            );
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
        
        // Обновляем счетчик и подсказку
        updateCardsCounter(filteredCards.length);
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
                
                // Функция обработки открытия видео
                function handleVideoClick(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    openVideoModal(card.path);
                    return false;
                }
                
                cardElement.addEventListener('click', handleVideoClick);
                cardElement.addEventListener('touchend', handleVideoClick);
                
                cardElement.appendChild(video);
            } else {
                const img = document.createElement('img');
                img.src = card.path;
                img.alt = `Карточка ${card.number}`;
                img.loading = 'lazy';
                
                // Добавляем обработчик ошибки загрузки изображения
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
                
                // Функция обработки открытия изображения
                function handleImageClick(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    openImageModal(card.path);
                    return false;
                }
                
                cardElement.addEventListener('click', handleImageClick);
                cardElement.addEventListener('touchend', handleImageClick);
                
                cardElement.appendChild(img);
            }
            
            cardsContainer.appendChild(cardElement);
        });
    }
    
    // Обновление счетчика карточек
    function updateCardsCounter(count) {
        const cardsCountElement = document.getElementById('cardsCount');
        if (cardsCountElement) {
            cardsCountElement.textContent = count;
        }
    }

    // Закрытие по клику на затемненную область
    imageModal.addEventListener('click', function(e) {
        if (e.target === imageModal) {
            closeImageModal();
        }
    });

    // Закрытие по touch на мобильных
    imageModal.addEventListener('touchend', function(e) {
        if (e.target === imageModal) {
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
    
    // Предотвращаем скроллинг страницы при открытом модальном окне
    document.addEventListener('touchmove', function(e) {
        if (imageModal.classList.contains('show')) {
            e.preventDefault();
        }
    }, { passive: false });
    
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
        
        // ОБНОВЛЯЕМ СЧЕТЧИК ДЛЯ ИЗБРАННЫХ КАРТОЧЕК
        updateCardsCounter(featuredCards.length);
        
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
                <p style="margin-top: 10px; font-size: 0.9rem; color: var(--text-secondary);">
                    Файлы должны называться: card1.png, card2.webp, card3.webm и т.д.
                </p>
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
        `;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 3000);
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
    
    // Тема
    const themeToggle = document.getElementById('themeToggle');

    function toggleTheme() {
        const currentTheme = document.body.classList.contains('light-theme') ? 'light' : 'dark';
        
        if (currentTheme === 'dark') {
            // Включаем светлую тему
            document.body.classList.add('light-theme');
            localStorage.setItem('theme', 'light');
            themeToggle.checked = true;
        } else {
            // Включаем тёмную тему
            document.body.classList.remove('light-theme');
            localStorage.setItem('theme', 'dark');
            themeToggle.checked = false;
        }
    }

    function loadTheme() {
        // Проверяем сохранённую тему пользователя
        const savedTheme = localStorage.getItem('theme');
        
        if (savedTheme === 'light') {
            document.body.classList.add('light-theme');
            themeToggle.checked = true;
        } else if (savedTheme === 'dark') {
            document.body.classList.remove('light-theme');
            themeToggle.checked = false;
        } else {
            // Если нет сохранённой темы, используем системную
            const prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
            if (prefersLight) {
                document.body.classList.add('light-theme');
                themeToggle.checked = true;
            } else {
                document.body.classList.remove('light-theme');
                themeToggle.checked = false;
            }
        }
    }

    themeToggle.addEventListener('change', toggleTheme);
    
    // Слушаем изменения системной темы (только если пользователь не выбрал тему сам)
    window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', e => {
        // Меняем тему только если пользователь не сохранил свой выбор
        if (!localStorage.getItem('theme')) {
            if (e.matches) {
                document.body.classList.add('light-theme');
                themeToggle.checked = true;
            } else {
                document.body.classList.remove('light-theme');
                themeToggle.checked = false;
            }
        }
    });
    
    // Инициализация
    initializeFilters();
    loadTheme();
    loadCardsFromManualList(); // Простая загрузка из ручного списка

    // Анимация для карточек при загрузке
    setTimeout(() => {
        document.querySelectorAll('.card').forEach((card, index) => {
            setTimeout(() => {
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';
                card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, 50);
            }, index * 50);
        });
    }, 100);
    
    // Дополнительный фикс для мобильных (на всякий случай)
    setTimeout(function() {
        // Убедимся, что все карточки имеют touch события
        document.querySelectorAll('.card').forEach(card => {
            if (!card.hasTouchListener) {
                card.addEventListener('touchend', function(event) {
                    event.preventDefault();
                    event.stopPropagation();
                    
                    const video = card.querySelector('video');
                    const img = card.querySelector('img');
                    
                    if (video) {
                        openVideoModal(video.src);
                    } else if (img) {
                        openImageModal(img.src);
                    }
                    return false;
                });
                card.hasTouchListener = true;
            }
        });
    }, 1000);
});