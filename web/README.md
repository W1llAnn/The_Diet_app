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
npm run dev        # http://localhost:5173/The_Diet_app/
```

> `base` в `vite.config.ts` настроен под GitHub Pages (`/The_Diet_app/`),
> поэтому локальный адрес тоже содержит этот префикс.

## Сборка

```bash
cd web/frontend
npm run build      # результат в web/frontend/dist/
npm run preview    # локальный предпросмотр собранной версии
```

## Публикация на GitHub Pages

GitHub Pages бесплатен для **публичных** репозиториев (для приватных нужен
платный GitHub Pro). Поэтому репо `The_Diet_app` должно быть публичным:
**Settings → General → Danger Zone → Change visibility → Public.**

### Одноразовая настройка (в репозитории)

1. Убедись, что репозиторий публичный (см. выше).
2. **Settings → Pages → Build and deployment → Source: `GitHub Actions`.**

### Автоматический деплой

При пуше в ветку `ui` (изменения в `web/frontend/`) срабатывает workflow
`.github/workflows/deploy-ui.yml`: ставит Node 24, зависимости, собирает
Vite и деплоит `dist/` на Pages. Сайт: `https://w1llann.github.io/The_Diet_app/`

Запустить вручную: **Actions → Deploy UI to GitHub Pages → Run workflow.**

> Workflow сам включает Pages (через `configure-pages enablement: true`),
> но если в Settings → Pages стоит Source «Deploy from a branch» — переключи
> на «GitHub Actions», иначе деплой упадёт.

## Зависимости

- React 18, react-dom
- TailwindCSS 3 (стили), lucide-react (иконки)
- `@supabase/supabase-js` (авторизация/данные — публичные anon-ключи зашиты в `src/lib/supabase.ts`, безопасность на RLS)

## Дорожная карта интеграции с бэкендом

Сейчас UI работает на моках из `src/data/content.ts`. Следующий шаг — связать
его с Python-бэкендом The_Diet_app (расчёт КБЖУ, база продуктов) через API,
который обернёт существующий пакет `diet/`.
