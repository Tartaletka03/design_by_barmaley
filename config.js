// КОНФИГУРАЦИЯ ФИЛЬТРОВ

// Ранги (без изменений)
const RANKS_CONFIG = {
    "Rank: A": [1, 2, 3, 5, 8, 17, 18, 19, 20, 21, 22, 23, 24, 31, 32, 33, 34, 35, 36, 38, 41, 42, 64, 65, 66, 80, 81, 85],
    "Rank: RE": [4, 6, 7, 9, 10, 11, 12, 13, 14, 16, 15, 25, 26, 27, 28, 29, 30, 37, 39, 40, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 59, 60, 61, 62, 63, 67, 68, 69, 70, 71, 72, 73, 74, 76, 77, 78, 79, 82, 83, 84]
};

// Явные теги для каждой карты (тайтл, персонаж)
// Для множественных значений используем массивы
const CARD_TAGS = {
    1: { title: "Поднятие уровня в одиночку", character: "Сон Джин-Ву" },
    2: { title: "Поднятие уровня в одиночку", character: "Бэк Юн-Хо" },
    3: { title: "Поднятие уровня в одиночку", character: "Чхве Чжон-Ин" },
    4: { title: "Hunter x Hunter", character: "Хисока" },
    5: { title: "Кот в сапогах", character: "Смерть" },
    6: { title: "Вьютубер", character: "Хизуки Юи" },
    7: { title: "РКН", character: "РКН-тян" },
    8: { title: "Клинок, рассекающий демонов", character: "Музан" },
    9: { title: "Twisted Wonderland", character: ["Стич", "Флойд Лич"] },
    10: { title: "Neurochemical OC", character: "Адреналин" },
    11: { title: "Neurochemical OC", character: "Серотонин" },
    12: { title: "Тюленья Пропаганда", character: "Тюлень" },
    13: { title: "Twisted Wonderland", character: ["Флойд Лич", "Джейд Лич"] },
    14: { title: "Eternal Tree", character: "Сириаэр" },
    15: { title: "Повелитель тайн", character: "Клейн Моретти" },
    16: { title: "Повелитель тайн", character: "Леонард Митчелл" },
    17: { title: "Звёздные войны", character: "Дарт Вейдер" },
    18: { title: "Класс убийц", character: "Нагиса" },
    19: { title: "Мир поверил в то, что я - финальный босс", character: "Су Лян" },
    20: { title: "Marvel", character: "Эмма Фрост" },
    21: { title: "Берсерк", character: "Слан" },
    22: { title: "Azur Lane", character: "Золотая лань" },
    23: { title: "Marvel", character: "Гамбит" },
    24: { title: "Fate", character: "Сэйбер" },
    25: { title: "Хазбин Отель", character: "Аластор" },
    26: { title: "Хазбин Отель", character: "Вокс" },
    27: { title: "Хазбин Отель", character: "Адам" },
    28: { title: "Хазбин Отель", character: "Физзаролли" },
    29: { title: "Хазбин Отель", character: "Чарли" },
    30: { title: "Хазбин Отель", character: "Столас" },
    31: { title: "Элисед", character: "Гестелла" },
    32: { title: "Marvel", character: "Хелла" },
    33: { title: "Fate", character: "Сэйбер" },
    34: { title: "Re:Zero", character: "Субару Нацуки" },
    35: { title: "Bloodborne", character: "Леди Мария" },
    36: { title: "Охотник-самоубийца SSS-ранга", character: "Ким Кон Чжа" },
    37: { title: "Zenless Zone Zero", character: "Йидхари Мерфи" },
    38: { title: "Marvel", character: "Алая Ведьма" },
    39: { title: "Resident Evil", character: "Алсина Димитреску" },
    40: { title: "Overwatch", character: "Мерси" },
    41: { title: "Blue Lock", character: "Михаэль Кайзер" },
    42: { title: "Marvel", character: "Альтрон" },
    43: { title: "Fate", character: "Эрешкигаль" },
    44: { title: "Вайолет Эвергарден", character: "Вайолет" },
    45: { title: "Overwatch", character: "D.Va" },
    46: { title: "Fate", character: "Мурасаки Сикибу" },
    47: { title: "Провожающая в последний путь Фрирен", character: "Ферн" },
    48: { title: "Провожающая в последний путь Фрирен", character: "Аура Гильотина" },
    49: { title: "Элисед", character: "Кайден" },
    50: { title: "Blue Lock", character: "Исаги Ёичи" },
    51: { title: "Blue Lock", character: "Итоши Рин" },
    52: { title: "Охотник-самоубийца SSS-ранга", character: "Ким Кон Чжа" },
    53: { title: "Steins;Gate", character: "Курису Макисэ" },
    54: { title: "Магическая битва", character: "Тодзи Фусигуро" },
    55: { title: "Fate", character: "Сэйбер" },
    56: { title: "Аля иногда кокетничает со мной по-русски", character: "Аля" },
    57: { title: "Zenless Zone Zero", character: "Джейн Доу" },
    59: { title: "Fate", character: "Бааван Ши" },
    60: { title: "Магическая битва", character: "Юки Цукумо" },
    61: { title: "Магическая битва", character: "Махито" },
    62: { title: "Магическая битва", character: "Мэй Мэй" },
    63: { title: "Магическая битва", character: "Сукуна" },
    64: { title: "Blue Lock", character: "Саэ Итоши" },
    65: { title: "Противостояние святого", character: "Ван Линь" },
    66: { title: "Охотник-самоубийца SSS-ранга", character: "Со Бэк Хян" },
    67: { title: "Fate", character: "Бааван Ши" },
    68: { title: "Зверополис", character: ["Ник", "Джуди"] },
    69: { title: "Реалити Квест", character: "Сон Мун" },
    70: { title: "Реалити Квест", character: "Чхве Сон Чжэ" },
    71: { title: "Система всемогущего дизайнера", character: "Ллойд Фронтера" },
    72: { title: "Начало после конца", character: ["Артур", "Тессия"] },
    73: { title: "Fate", character: ["Сен-но Рикю", "Комахиме"] },
    74: { title: "Fate", character: ["Сен-но Рикю", "Комахиме"] },
    76: { title: "Реалити Квест", character: "Ким Хо Сон" },
    77: { title: "Реалити Квест", character: "Ха До Ван" },
    78: { title: ["Marvel", "Звёздные войны"], character: "Псайлок" },
    79: { title: "Marvel", character: "Луна Сноу" },
    80: { title: "Fate", character: "Рин Тосака" },
    81: { title: "Тринадцать огней", character: "Смотрящий" },
    82: { title: "Bloodborne", character: "Охотник" },
    83: { title: "Bloodborne", character: "Охотник" },
    84: { title: "The Witcher", character: "Цири" },
    85: { title: "Для меня игра - убийство", character: "Красная Шапочка" }
};

// Генерация TITLES_CONFIG и CHARACTERS_CONFIG с поддержкой массивов
const TITLES_CONFIG = {};
const CHARACTERS_CONFIG = {};

function addToConfig(config, key, value) {
    if (!config[key]) config[key] = [];
    config[key].push(value);
}

for (const [numStr, tags] of Object.entries(CARD_TAGS)) {
    const num = parseInt(numStr);
    if (tags.title) {
        if (Array.isArray(tags.title)) {
            for (const title of tags.title) {
                addToConfig(TITLES_CONFIG, title, num);
            }
        } else {
            addToConfig(TITLES_CONFIG, tags.title, num);
        }
    }
    if (tags.character) {
        if (Array.isArray(tags.character)) {
            for (const character of tags.character) {
                addToConfig(CHARACTERS_CONFIG, character, num);
            }
        } else {
            addToConfig(CHARACTERS_CONFIG, tags.character, num);
        }
    }
}

// ОСНОВНЫЕ КАРТЫ (показываются на главной)
const FEATURED_CARDS = [83, 81, 79, 78, 68, 67, 66, 65, 64, 63, 62, 59, 42, 41, 35, 34, 33, 30];

// ========== НАСТРОЙКИ ГЕНЕРАЦИИ СПИСКА КАРТ ==========
const MAX_CARD_NUMBER = 85;
const EXCLUDED_NUMBERS = [58, 75];
const VIDEO_NUMBERS = [];

const MANUAL_CARD_LIST = (() => {
    const list = [];
    for (let i = 1; i <= MAX_CARD_NUMBER; i++) {
        if (EXCLUDED_NUMBERS.includes(i)) continue;
        const ext = VIDEO_NUMBERS.includes(i) ? 'webm' : 'webp';
        list.push({ number: i, filename: `card${i}.${ext}` });
    }
    return list;
})();