export type Page =
  | 'landing'
  | 'login'
  | 'register'
  | 'forgot'
  | 'onboarding'
  | 'dashboard'
  | 'diary'
  | 'search'
  | 'product'
  | 'planner'
  | 'recipes'
  | 'medical'
  | 'ai'
  | 'progress'
  | 'achievements'
  | 'community'
  | 'notifications'
  | 'profile'
  | 'settings'
  | 'premium'
  | 'help'
  | 'about';

export interface FoodItem {
  id: string;
  name: string;
  emoji: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  serving: string;
  category: string;
  healthScore: number;
  glycemicIndex?: number;
  allergens?: string[];
  vitamins?: string[];
  isFavorite?: boolean;
}

export interface MealEntry {
  id: string;
  food: FoodItem;
  quantity: number;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  time: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export const sampleFoods: FoodItem[] = [
  { id: '1', name: 'Греческий йогурт', emoji: '🥛', calories: 100, protein: 17, carbs: 6, fat: 0.7, serving: '1 чашка (245 г)', category: 'Молочное', healthScore: 92, glycemicIndex: 12, vitamins: ['B12', 'Кальций', 'Пробиотики'] },
  { id: '2', name: 'Тост с авокадо', emoji: '🥑', calories: 280, protein: 8, carbs: 30, fat: 15, serving: '2 ломтика', category: 'Злаки', healthScore: 85, glycemicIndex: 35, allergens: ['Глютен'], vitamins: ['K', 'E', 'Фолат'] },
  { id: '3', name: 'Лосось на гриле', emoji: '🐟', calories: 367, protein: 40, carbs: 0, fat: 22, serving: '170 г', category: 'Морепродукты', healthScore: 95, glycemicIndex: 0, vitamins: ['D', 'B12', 'Омега-3', 'Селен'] },
  { id: '4', name: 'Боул с киноа', emoji: '🥗', calories: 222, protein: 8, carbs: 39, fat: 3.5, serving: '1 чашка (185 г)', category: 'Злаки', healthScore: 90, glycemicIndex: 53, vitamins: ['Железо', 'Магний', 'Фолат'] },
  { id: '5', name: 'Миндаль', emoji: '🌰', calories: 164, protein: 6, carbs: 6, fat: 14, serving: '28 г', category: 'Орехи', healthScore: 88, glycemicIndex: 15, vitamins: ['E', 'Магний'] },
  { id: '6', name: 'Банан', emoji: '🍌', calories: 105, protein: 1.3, carbs: 27, fat: 0.4, serving: '1 средний', category: 'Фрукты', healthScore: 78, glycemicIndex: 51, vitamins: ['B6', 'C', 'Калий'] },
  { id: '7', name: 'Черника', emoji: '🫐', calories: 84, protein: 1.1, carbs: 21, fat: 0.5, serving: '1 чашка (148 г)', category: 'Фрукты', healthScore: 95, glycemicIndex: 53, vitamins: ['C', 'K', 'Антиоксиданты'] },
  { id: '8', name: 'Овсянка', emoji: '🥣', calories: 154, protein: 6, carbs: 27, fat: 3, serving: '1 чашка готовой', category: 'Злаки', healthScore: 87, glycemicIndex: 55, allergens: ['Глютен'], vitamins: ['Железо', 'Цинк', 'Клетчатка'] },
  { id: '9', name: 'Куриная грудка', emoji: '🍗', calories: 165, protein: 31, carbs: 0, fat: 3.6, serving: '85 г', category: 'Белки', healthScore: 89, glycemicIndex: 0, vitamins: ['B6', 'Ниацин', 'Селен'] },
  { id: '10', name: 'Шпинатный салат', emoji: '🥬', calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, serving: '1 чашка (30 г)', category: 'Овощи', healthScore: 97, glycemicIndex: 15, vitamins: ['K', 'A', 'Железо', 'Фолат'] },
  { id: '11', name: 'Бурый рис', emoji: '🍚', calories: 216, protein: 5, carbs: 45, fat: 1.8, serving: '1 чашка (195 г)', category: 'Злаки', healthScore: 82, glycemicIndex: 50, vitamins: ['B1', 'B3', 'Магний'] },
  { id: '12', name: 'Тёмный шоколад', emoji: '🍫', calories: 170, protein: 2, carbs: 13, fat: 12, serving: '28 г', category: 'Перекусы', healthScore: 70, glycemicIndex: 23, allergens: ['Молочное'], vitamins: ['Железо', 'Магний'] },
];

export const foodCategories = [
  { name: 'Фрукты', emoji: '🍎', color: 'bg-accent-50' },
  { name: 'Овощи', emoji: '🥕', color: 'bg-primary-50' },
  { name: 'Белки', emoji: '🍗', color: 'bg-accent-50' },
  { name: 'Злаки', emoji: '🌾', color: 'bg-info-50' },
  { name: 'Молочное', emoji: '🥛', color: 'bg-primary-50' },
  { name: 'Орехи', emoji: '🌰', color: 'bg-accent-50' },
  { name: 'Морепродукты', emoji: '🐟', color: 'bg-info-50' },
  { name: 'Перекусы', emoji: '🍿', color: 'bg-primary-50' },
];

export const medicalConditions = [
  { id: 'diabetes', name: 'Диабет', emoji: '🩸', description: 'Контроль сахара', color: 'bg-accent-50 text-accent-700' },
  { id: 'obesity', name: 'Ожирение', emoji: '⚖️', description: 'Контроль веса', color: 'bg-primary-50 text-primary-700' },
  { id: 'hypertension', name: 'Гипертония', emoji: '❤️', description: 'Контроль давления', color: 'bg-info-50 text-info-700' },
  { id: 'kidney', name: 'Болезнь почек', emoji: '🫘', description: 'Почечная диета', color: 'bg-accent-50 text-accent-700' },
  { id: 'digestive', name: 'Проблемы с пищеварением', emoji: '🌿', description: 'Поддержка ЖКТ', color: 'bg-primary-50 text-primary-700' },
  { id: 'allergies', name: 'Пищевая аллергия', emoji: '🚫', description: 'Исключение аллергенов', color: 'bg-info-50 text-info-700' },
];

export const testimonials = [
  { name: 'Сара М.', role: 'Учитель, 34', avatar: '👩', text: "Vivora изменила моё отношение к еде. Я не ограничиваю себя — я выбираю. Сбросила 5 кг за 3 месяца без ощущения, что сижу на диете.", rating: 5 },
  { name: 'Дмитрий К.', role: 'Папа, 42', avatar: '👨', text: "Как диабетик, я боялся еды. Теперь у меня есть помощник, который помогает делать разумный выбор. Мой уровень гликированного гемоглобина снизился с 7,8 до 6,4.", rating: 5 },
  { name: 'Лена Т.', role: 'Студентка, 19', avatar: '👩‍🎓', text: "AI-помощник — как диетолог в кармане. Отвечает на вопросы, не заставляя чувствовать себя глупо. Обожаю маскота!", rating: 5 },
  { name: 'Роберт Н.', role: 'Пенсионер, 68', avatar: '👴', text: "В моём возрасте нужно что-то простое. Vivora бережная и понятная. Врач был доволен моим последним осмотром.", rating: 5 },
  { name: 'Аиша П.', role: 'Дизайнер, 28', avatar: '👩‍🎨', text: "Наконец-то приложение, которое ощущается по-человечески. Никакого чувства вины и стыда. Только мягкие подсказки в нужном направлении. Планы питания — вкусные.", rating: 5 },
  { name: 'Марк Д.', role: 'Спортсмен, 26', avatar: '🏃', text: "Даже как профессиональный спортсмен, я узнал о питании то, чего не знал. Подсчёт макросов точный, а советы AI — в точку.", rating: 5 },
];

export const faqs = [
  { q: 'Vivora бесплатна?', a: 'Да! Базовые функции — подсчёт калорий, поиск продуктов и AI-помощник — бесплатны. Premium открывает персональные планы питания, расширенную аналитику и специализированную поддержку медицинских диет.' },
  { q: 'Как работает AI-помощник по питанию?', a: 'Виви, наш ИИ, изучает ваши цели, предпочтения и медицинские состояния. Затем предлагает персональные советы, варианты блюд и отвечает на вопросы по питанию простым языком — без осуждения, только поддержка.' },
  { q: 'Может ли Vivora помочь с моим заболеванием?', a: 'Конечно. Vivora поддерживает диабет, ожирение, гипертонию, болезнь почек, проблемы с пищеварением и пищевую аллергию. Рекомендации адаптируются под ваше состояние и указания врача.' },
  { q: 'Я буду чувствовать себя ограниченным или виноватым?', a: 'Никогда. Vivora построена на позитивном подкреплении. Вместо «вы превысили калории» Виви предлагает «давайте сбалансируем следующий приём пищи». Это помощник, а не критик.' },
  { q: 'Мои данные в безопасности?', a: 'Ваши данные о здоровье зашифрованы и никогда не продаются. Вы можете экспортировать или удалить данные в любой момент. Мы следуем практикам безопасности, соответствующим HIPAA.' },
  { q: 'Синхронизируется ли Vivora с Apple Health или Google Fit?', a: 'Да — пользователи Premium могут синхронизировать активность, вес и воду с Apple Health и Google Fit. Интеграции с умными весами и носимыми устройствами появятся в ближайшее время.' },
];

export const landingFeatures = [
  { icon: '🤖', title: 'AI-помощник по питанию', text: 'Спросите что угодно и когда угодно. Виви отвечает простым языком с персональными советами.' },
  { icon: '🥗', title: 'Умное планирование питания', text: 'Получайте еженедельные планы под ваши цели, вкусы и медицинские показания.' },
  { icon: '🔥', title: 'Бережный подсчёт калорий', text: 'Отслеживайте без чувства вины. Виви ценит прогресс, а не идеальность.' },
  { icon: '🩺', title: 'Медицинская поддержка питания', text: 'Специализированные рекомендации при диабете, гипертонии, аллергии и других состояниях.' },
  { icon: '📊', title: 'Наглядные графики прогресса', text: 'Наблюдайте за своим путём в ясных и мотивирующих визуалах.' },
  { icon: '🏆', title: 'Достижения и серии', text: 'Празднуйте здоровые привычки с наградами, которые действительно радуют.' },
];

export const recipes = [
  { id: 'r1', name: 'Средиземноморский боул', emoji: '🥗', calories: 420, time: '20 мин', difficulty: 'Легко', tags: ['Вегетарианское', 'Много клетчатки'], healthScore: 95, ai: true },
  { id: 'r2', name: 'Тост с лососем и авокадо', emoji: '🥑', calories: 380, time: '15 мин', difficulty: 'Легко', tags: ['Много белка', 'Омега-3'], healthScore: 92, ai: true },
  { id: 'r3', name: 'Чиа-пудинг с ягодами', emoji: '🫐', calories: 240, time: '10 мин', difficulty: 'Легко', tags: ['Вегетарианское', 'Низкий ГИ'], healthScore: 90, ai: false },
  { id: 'r4', name: 'Курица с киноа на гриле', emoji: '🍗', calories: 510, time: '30 мин', difficulty: 'Средне', tags: ['Много белка', 'Без глютена'], healthScore: 94, ai: false },
  { id: 'r5', name: 'Суп из чечевицы со сладким картофелем', emoji: '🍲', calories: 290, time: '40 мин', difficulty: 'Легко', tags: ['Веганское', 'Много клетчатки'], healthScore: 93, ai: true },
  { id: 'r6', name: 'Парфе из греческого йогурта', emoji: ' parfait', calories: 220, time: '5 мин', difficulty: 'Легко', tags: ['Вегетарианское', 'Пробиотики'], healthScore: 88, ai: false },
];

export const achievements = [
  { id: 'a1', name: 'Первый шаг', emoji: '🌱', description: 'Завершите свой первый день', unlocked: true, date: '2 дня назад' },
  { id: 'a2', name: 'Герой гидратации', emoji: '💧', description: 'Пейте 8 стаканов воды 7 дней', unlocked: true, date: 'Вчера' },
  { id: 'a3', name: 'Воин недели', emoji: '⚔️', description: 'Записывайте приёмы пищи 7 дней подряд', unlocked: true, date: 'Сегодня' },
  { id: 'a4', name: 'Профи белка', emoji: '💪', description: 'Достигайте цели по белку 14 дней', unlocked: false, progress: 71 },
  { id: 'a5', name: 'Зелёная машина', emoji: '🥬', description: 'Ешьте 5 порций овощей 30 дней', unlocked: false, progress: 40 },
  { id: 'a6', name: 'Жаворонок', emoji: '🌅', description: 'Записывайте завтрак до 9:00 в течение 10 дней', unlocked: false, progress: 60 },
  { id: 'a7', name: 'Осознанный едок', emoji: '🧘', description: '30 дней сбалансированного питания', unlocked: false, progress: 23 },
  { id: 'a8', name: 'Лучший друг Виви', emoji: '💚', description: 'Общайтесь с Виви 50 раз', unlocked: false, progress: 34 },
];
