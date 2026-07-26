# Vivora — UI (web/frontend)

Фронтенд приложения **Vivora** — нежный компаньон по питанию. Создан в Bolt на
стеке **Vite + React + TypeScript + TailwindCSS**. Лежит в ветке `ui` и
публикуется на **GitHub Pages** автоматически через GitHub Actions.

## Структура

```
web/frontend/
├── src/
│   ├── pages/          # экраны (Landing, Dashboard, Diary, AIAssistant, ...)
│   ├── components/     # переиспользуемые виджеты (Vivi-маскот, ProgressRing, layout)
│   ├── data/content.ts # текстовый контент приложения
│   ├── App.tsx         # корневой компонент
│   └── main.tsx        # точка входа
├── index.html
├── vite.config.ts      # base=/The_Diet_app/ — важно для GitHub Pages
├── tailwind.config.js
└── package.json
```

Дизайн-референс маскота — `Application_design/mascot_concept_v1.png` в корне репо.

## Локальный запуск

```bash
cd web/frontend
npm install        # один раз
npm run dev        # http://localhost:5173/
```

> Vite поднимает dev-сервер в корне (`http://localhost:5173/`) — `base` в
> `vite.config.ts` не задан, т.к. Vercel деплоит сайт в корень домена.

## Сборка

```bash
cd web/frontend
npm run build      # результат в web/frontend/dist/
npm run preview    # локальный предпросмотр собранной версии
```

## Публикация на Vercel

Vercel подключается к GitHub и автоматически деплоит при пуше. Репозиторий
остаётся приватным, бесплатный тариф не требует карты.

### Одноразовая настройка (на сайте Vercel)

1. **vercel.com** → залогинься через GitHub (OAuth, даёт доступ к репо).
2. **Add New → Project** → выбери репозиторий `W1llAnn/The_Diet_app`.
3. В настройках проекта укажи:
   - **Framework Preset:** `Vite`
   - **Root Directory:** `web/frontend`
   - Build / Install / Output Vercel определит сам (или возьмёт из `vercel.json`).
4. **Deploy.** Первый билд идёт ~1 мин.

После этого каждый пуш в любую ветку автоматически собирает превью-деплой
(`<branch>.the-diet-app.vercel.app`), а мерж в `main` обновляет продакшен.

### Зачем `vercel.json`

`web/frontend/vercel.json` фиксирует build-команды и добавляет SPA-rewrite:
все маршруты отдаются в `index.html`, чтобы внутренние страницы приложения
работали при прямом переходе по ссылке.

> Раньше проект был заточен под GitHub Pages (требует `base` в `vite.config.ts`
> и публичного репо). Для приватного репо без оплаты GitHub Pages недоступен,
> поэтому перешли на Vercel — `base` убран, сайт живёт в корне домена.

## Зависимости

- React 18, react-dom
- TailwindCSS 3 (стили), lucide-react (иконки)
- `@supabase/supabase-js` (авторизация/данные — ключи в `.env`, не коммитить)

## Дорожная карта интеграции с бэкендом

Сейчас UI работает на моках из `src/data/content.ts`. Следующий шаг — связать
его с Python-бэкендом The_Diet_app (расчёт КБЖУ, база продуктов) через API,
который обернёт существующий пакет `diet/`.
