# Skydesk Sandbox

Рабочая среда для быстрого прототипирования и проверки UI-решений продукта **Skydesk**.

## Что такое Skydesk

B2B Travel Tech-продукт для travel-агентов и агентств. Помогает агентам управлять бронированиями клиентов после их создания.

Бронирование строится вокруг **PNR** и включает:
- пассажиров
- перелёты, сегменты и детали маршрута
- pricing: тарифы, налоги и fare rules
- билеты и их статусы
- дополнительные сервисы (привязанные к пассажирам и сегментам)
- remarks, SSR и OSI-сообщения
- историю бронирования и операционную информацию
- AI-действия (поиск по бронированию, проверка условий возврата)

## Технический стек

- **React + Vite + TypeScript**
- **shadcn/ui** — компонентная библиотека (та же, что в production Skydesk)
- **Tailwind CSS** с кастомными дизайн-токенами из Figma
- **Mock data** — без реального backend
- **Vercel** — деплой и shareable preview links

## Дизайн-система

Токены и компоненты хранятся в Figma. При работе с UI всегда использовать:
- токены из `src/tokens/` — цвета, типографика, радиусы, spacing
- компоненты из `src/components/` — shadcn/ui с кастомной темой
- паттерны из `.claude/skills/build-component/SKILL.md`

## Предметная область: GDS и Office

### GDS (Global Distribution System)
Глобальные системы дистрибуции, через которые создаются и хранятся PNR:
- **Amadeus**
- **Sabre**
- **Galileo**

### Office (PCC / Office ID)
Office — это GDS-specific рабочий контекст агента, определяющий из какого офиса/PCC бронирование открывается и обрабатывается.

Связка: `GDS + Office ID`. Например:
```
Amadeus → STO123 (Stockholm)
Sabre   → YYZ01 (Toronto)
```

От выбранного Office зависит:
- видит ли агент PNR
- какие действия ему доступны
- с какими правами выполняются изменения

### Default Office
У агента может быть настроен Default Office для каждой GDS. Это оптимизация для повседневной работы — не обязательная настройка.

Приоритет выбора Office при открытии PNR:
```
1. Office, явно выбранный пользователем
2. Default Office пользователя для GDS этого PNR
3. Creation office бронирования (Office, где PNR был создан)
```

## Ключевой UX-принцип

> Не заставлять агента выбирать то, что Skydesk способен определить самостоятельно.

Стандартный сценарий:
```
PNR → Booking
```

Если системе не хватает GDS:
```
PNR → Select GDS → Booking
```

Если агент сам хочет выбрать контекст:
```
PNR + Select Office/GDS → Booking
```

## Фаза

> Updated: 2026-09-23

**PNR Search — coverage.** Сначала все экраны и состояния должны открываться, потом полировка. Пробелы в покрытии — в flow doc, раздел «Known gaps». Визуальная доработка (craft) — только после них, и flows при этом должны продолжать работать.

## Источники истины

Когда источники расходятся, решаем в таком порядке:

1. Скриншот или файл, который прислал пользователь.
2. Исключение, которое пользователь явно назвал для конкретного экрана или flow.
3. Figma — для всего, что специально редизайнили.
4. Production Skydesk — для логики, формы flow, данных и текстов. Только как reference, sandbox его не меняет.
5. Собственное суждение — только для пробелов.

**Не выдумывать продукт.** Если источник этого не показывает — спросить или записать в `docs/open-questions.md`. Если код и flow doc расходятся — сказать, что из них верно и почему, а не выбирать молча.

## Глоссарий

Одно слово — одно значение. Синоним для существующего термина — ошибка.

| Термин | Значение | Не использовать |
|---|---|---|
| PNR | Код бронирования в GDS, 6 символов (`7JRWT4`) | «номер брони» |
| Booking | То, что агент открывает в Skydesk по PNR | «reservation» (кроме заголовка из Figma — см. open questions) |
| GDS | Amadeus, Sabre или Galileo | — |
| Office | Рабочий контекст агента в GDS. В UI и документах — только «Office» | «PCC», «Office ID» — это названия Office внутри конкретной GDS, только в цитатах из GDS |
| Default Office | Office, который агент назначил по умолчанию для одной GDS | «home office» |
| Creation office | Office, где PNR был создан (в GDS — Creation PCC) | — |
| GDS Required | Шаг поиска, когда Skydesk не знает GDS и спрашивает агента | «Select GDS» как название состояния |
| GDS code | Двухсимвольный код GDS: Amadeus `1A`, Sabre `1S`, Galileo `1G` | — |
| History | Список бронирований в sidebar, с которыми агент недавно что-то делал в Skydesk | «Recent», «Sessions» |
| History item | Одна карточка History: PNR · GDS code, Itinerary, дата и время последнего действия | «session card» |
| Itinerary | Маршрут бронирования по кодам аэропортов: One way `A → B`, Round `A ⇆ B`, Multi trip `A → B → C` | «route» в UI |
| PNR Required | Поиск запущен с пустым полем PNR | «empty state» — это начальный экран, до поиска |

## Запуск и проверка

```bash
npm run dev        # http://localhost:5173
npm run typecheck  # tsc -b
npm test           # vitest: unit (src/lib) + storybook (каждая story — тест в Chromium)
npm run build      # typecheck + production build
npm run lint:tokens  # нет ли хардкода цветов, радиусов, размеров шрифта, теней
npm run storybook  # Storybook: http://localhost:6006
npm run build-storybook  # статическая сборка в storybook-static/
```

Перед каждым push — `npm run typecheck && npm run lint:tokens && npm test && npm run build`, результат каждого шага — в отчёт.

Всё видимое проверять в браузере самостоятельно (Playwright + Chromium доступны), а не просить пользователя. Как открыть состояния фичи для проверки — в её flow doc.

**Деплой** (проверено 2026-09-23): репозиторий подключён к Vercel. Ветки `main` нет; основная ветка на GitHub — `claude/hopeful-wright-0ar03b`. По умолчанию Vercel публикует основную ветку как production, а каждая другая ветка получает свою preview-ссылку. Это нужно подтвердить в настройках Vercel (open question). До подтверждения push или merge в `claude/hopeful-wright-0ar03b` — релиз, только по явной просьбе.

**Storybook на Vercel** публикуется вместе с приложением по адресу `/storybook/`. Сборка — `buildCommand` в `vercel.json` (`npm run build` + `build-storybook` в `dist/storybook`). Там же: редирект `/storybook` → `/storybook/` и catch-all rewrite приложения, который не трогает `/storybook/…`.

**Локально, до публикации:** `npm run dev` → `http://localhost:5173`. Изменения видны сразу, без push. Инструкция для тестирования — `docs/testing-plan.md` → «Как запустить локально».

## Решения и gotchas

Не отменять без причины. Каждый пункт: решение → почему → что сломается, если отменить.

- **Office и GDS в тексте — в том же порядке, что в Office Selector: сначала Office, потом GDS** (`5GW5 · Sabre`) (правило пользователя, 2026-09-23). Касается всех сообщений: Not Found, Found и новых. Один порядок везде — агент читает связку одинаково.
- **Storybook 10.6 установлен через `npm create storybook@latest`** (2026-09-23). Stories лежат рядом с компонентом (`*.stories.tsx`), каждая story запускается как тест в `npm test` (проект `storybook`). Preview: `src/index.css` + seed localStorage-ключа Default Offices для каждой persona — stories детерминированы.
- **Vitest 4, не 5** (2026-09-23). `@storybook/addon-vitest` 10.6 поддерживает только Vitest 3–4; с Vitest 5 `npm install` падает (ERESOLVE). Вернуть Vitest 5 можно, когда addon начнёт его поддерживать.
- **Playwright 1.56.1** (2026-09-23) — под Chromium, уже установленный в облачном окружении (`/opt/pw-browsers`). Локально браузер для него: `npx playwright install chromium`.
- **В `vite.config.ts` два Vitest-проекта: `unit` и `storybook`** (2026-09-23). Init Storybook создал только `storybook`, и юнит-тесты молча перестали запускаться. Не удалять проект `unit`.
- **Accessibility-проверка в Storybook падает тестом** (`a11y.test: 'error'` в `.storybook/preview.tsx`, 2026-09-23). Исключение — stories с teal `primary` и текстом (`test: 'todo'`, open question #14): вернуть в `error`, когда design решит. Страница — в `<main>`, панель sandbox — `<aside aria-label="Sandbox controls">`; у popover-диалогов есть `aria-label`. Активное состояние в sandbox-панели и навигации — тёмное (`bg-foreground`), потому что teal + белый 12px не проходит контраст.
- **Все визуальные значения — токены; проверка `lint:tokens`** (2026-09-23). Новые токены: `surface`, `loading-start/end`, `radius-card/control`, `text-heading`, `text-2xs`, `shadow-popover`, `drop-shadow-card`. Значения совпадают с прежними до пикселя — проверено сравнением 50 скриншотов до/после. Цвета заданы точными HSL (`25 5.3% 44.7%`), потому что округление сдвигает hex. Новый токен-класс → добавить его в `extendTailwindMerge` в `src/lib/utils.ts`, иначе `cn()` может молча выбросить его (например, `text-heading` рядом с `text-foreground`).
- **Creation office всегда доступен агенту** (решение product, 2026-09-24; закрыт open question #5). Бронирование создавалось на стороне агента. Не моделировать «нет доступа к Creation office» — такого сценария нет.
- **`CLAUDE.md` — правила всей инфраструктуры; правила одного flow — в его flow doc** (правило пользователя, 2026-09-24). Sandbox — среда для многих flows, а не один проект. Правило, записанное здесь, агент применяет к каждому новому экрану. Если снова складывать сюда решения одного flow, они начнут навязываться другим — так skill `create-screen` разошёлся с механикой адресов PNR Search. Решения PNR Search — `projects/pnr-search/README.md`, App Sidebar — `projects/app-sidebar/README.md`, раздел «Решения и gotchas».
- **Skills — в `.claude/skills/<name>/SKILL.md` с frontmatter `name` и `description`** (2026-09-24). Это официальный формат Claude Code: агент видит список skills по `description` и загружает полный текст, только когда skill нужен. Если вернуть их в `skills/` или убрать frontmatter, агент перестанет их находить сам — придётся каждый раз называть файл.

## Структура проекта

```
skydesk-sandbox/
├── CLAUDE.md               ← этот файл: продуктовый контекст и правила
├── APPLICATION.md          ← карта приложения: экраны, адреса состояний, personas, mock PNR
├── .env                    ← API-ключи (не коммитить)
├── docs/
│   ├── open-questions.md   ← нерешённые вопросы — не выбирать ответ молча
│   └── testing-plan.md     ← как проверить каждую фичу
├── .storybook/             ← конфиг Storybook: main.ts, preview.tsx
├── .claude/
│   └── skills/<name>/SKILL.md ← инструкции под конкретные задачи (формат Claude Code)
├── agents/                 ← субагенты для параллельных задач
├── projects/               ← flow doc каждой фичи
│   └── pnr-search/         ← первый проект: поиск PNR
└── src/                    ← React-приложение
    ├── components/         ← компонентная библиотека (+ *.stories.tsx рядом)
    ├── hooks/              ← состояние: Default Offices, адрес sandbox
    ├── lib/                ← доменные правила (чистые функции + тесты)
    ├── mocks/              ← mock-данные и personas
    ├── tokens/             ← дизайн-токены из Figma
    └── pages/              ← экраны-прототипы
```

## Правила работы

1. **Компоненты** — всегда из `src/components/`. Если нужного нет — создать по паттерну skill `build-component`.
2. **Токены** — не хардкодить цвета, радиусы, размеры шрифта и тени. Использовать токены из `src/tokens/index.css` через классы Tailwind (`bg-surface`, `rounded-card`, `text-heading`, `shadow-popover`…). `npm run lint:tokens` ловит нарушения. Размеры раскладки из Figma (`w-[220px]`, `pt-[140px]`) допустимы — с комментарием, откуда они.
3. **Mock data** — хранить в `src/mocks/`. Структура должна отражать реальные данные.
4. **Новая фича** — создавать папку в `projects/` с flow doc (принцип → решения → отброшенное → состояния и как их открыть → open questions). Документ пишется до кода.
5. **Один flow за раз.** Читать `APPLICATION.md` и flow doc задачи, не сканировать остальные flows.
6. **Документы — в том же изменении, что и код.** Изменили поведение → обновили flow doc, `APPLICATION.md`, `docs/testing-plan.md`. Нашли неизвестное → `docs/open-questions.md`.
7. **Доменные правила — в `src/lib/`** как чистые функции с тестами. Экран их вызывает, но не повторяет.
8. **В конце каждой задачи** — перечислить сценарии и edge cases, которые не покрыты.
9. **Правки пользователя — это правила продукта.** Записать и применять дальше: общее для всей среды — в «Решения и gotchas», правило одного flow — в его flow doc.
10. **Storybook** — новый или изменённый компонент получает stories в том же изменении, рядом с компонентом (`*.stories.tsx`). Stories — это и тесты: `npm test` должен проходить.
