# Roadmap

> Карта работ: что строим, что в работе, что дальше. Updated: 2026-09-25.
> Это не автопилот: сессия не обязана брать задачу отсюда. Обычно задачу ставит пользователь в разговоре — она записывается в «Сейчас» и выполняется. Как вести файл — `CLAUDE.md` → «Правила работы», правило 11.
> Как делать задачу — в flow doc фичи. Неизвестное — в `docs/open-questions.md`. Здесь — только что и в каком порядке.

## Цель

Среда, в которой дизайн Skydesk быстро собирается из задокументированных компонентов и проверяется по ссылке. Работу ведут главный агент и субагенты с ролями (разработка, тестирование, research); skills добавляются по мере повторения задач.

Первая крупная цель продукта — **Booking Overview**: виджеты бронирования и чат справа.

Фазы:

| Фаза | Что | Статус |
|---|---|---|
| 0 | PNR Search: закрыть покрытие | ✅ |
| 1 | Фундамент среды: skills, агенты, каталог компонентов, карта Figma, модель Booking | в работе |
| 2 | Каркас Booking Overview: layout, Header (PNR · GDS · пассажиры · дата создания), вкладка, зона виджетов | в работе |
| 3 | Контракт виджета (аккордеон, счётчик), виджеты Booking по одному | |
| 4 | Чат и AI-действия | |
| 5 | Craft: полировка, визуальная регрессия | |

## Сейчас

- [1.14] Storybook — единственный источник UI для агента (решение пользователя, 2026-09-25). Шаг 1 ✅ Storybook MCP (`@storybook/addon-mcp` 10.6) работает в облачном окружении: `docs-list` ≈150 токенов на всю библиотеку, `docs-show` одного компонента ≈500 (описание, props, stories с кодом); понадобился `react-docgen-typescript`. Шаг 2 ✅ `.mcp.json`, SessionStart hook (Storybook в фоне), субагент `storybook-reader`, запасной `npm run storybook:docs`. Дальше: Foundations (токены) в MDX, JSDoc + Figma у всех компонентов, проверка полноты в `npm test`, удалить `docs/components.md`, перевести skills — Фаза 1

## Дальше

Сверху — следующая. Порядок меняет только пользователь.

Каркас Booking Overview (Фаза 2, итерация 1) готов: 2.1–2.4, 2.6. Переход Found → Booking (2.5) ждёт утверждения PNR Search — в «Потом». Flow doc — `projects/booking-overview/README.md`.

- [1.7] Карта Figma `docs/figma-map.md`: экран или компонент → node id — Фаза 1
- [1.8] Обновить skills `build-component` (Storybook уже есть, путь `src/components/skydesk/`) и `extract-tokens` (HSL и семантические токены) — Фаза 1
- [1.9] Обновить формат вывода `figma-reader` под текущие токены — Фаза 1 · зависит от: 1.8
- [1.10] Skill `create-screen`: добавить `src/lib/` с тестами, stories, документы, проверки перед push — Фаза 1
- [1.11] Доменная модель Booking (`src/lib/booking.ts`) и сценарные mock-бронирования (`src/mocks/`) — Фаза 1 · часть для Header — в 2.2, остальное растёт с виджетами

## Потом

Без порядка. Сюда попадает всё, что замечено по ходу.

**Booking Overview** (конечный вид — Figma `4678:125394`)
- [2.5] Переход Found → Booking, заглушка Found удаляется; решить, куда уходит «Use as default» (open question #24). Блок: команда утверждает PNR Search с заглушкой Found (решение пользователя, 2026-09-25). До тех пор в Booking ведёт навигация sandbox.
- Контракт виджета: аккордеон, заголовок, счётчик справа, раскрытие и сворачивание — Фаза 3.
- Виджеты по порядку из Figma: Passengers, Segments («Flight information»), Ticket, Services, EMD, Remarks, Messages, Contacts — Фаза 3.
- Tabs над виджетами: сейчас одна вкладка «Booking Overview» — какие ещё, решить с design.
- Header: иконка часов справа, Time Limit (скрыт в Figma), действие кнопок sidebar и панели.
- Header: сверить Hover / Focus кнопок с Figma (сейчас — shadcn `ghost`); названия кнопок для скринридера — с design.
- Чат справа (362px): mock-сценарии AI-действий («найти в бронировании», «проверить условия возврата»), связь с виджетами. Настоящий Claude API — решить — Фаза 4.

**Агенты**
- `storybook-reader`: проверить в новой сессии, что MCP-сервер `storybook` подключается сам (в этой сессии `.mcp.json` не загружен — проверено только через HTTP и `npm run storybook:docs`). Если MCP-клиент подключается раньше, чем hook поднимет Storybook, — перевести hook в async или добавить повторное подключение.
- Storybook MCP: у `Skydesk / App Sidebar / Parts` нет `meta.component` — MCP показывает ошибку вместо документации. Импорт в сниппетах — `from 'skydesk-sandbox'` (имя пакета), настоящего пути нет.
- `qa-tester`: добавить в `npm run qa` ручные сценарии PNR Search (Default Office, persona, порядок Office…) и App Sidebar; запуск против preview-ссылки Vercel (`QA_BASE_URL`) — проверить.
- `domain-researcher` — домен GDS и reference из production Skydesk → `projects/<flow>/research.md`. Когда начнётся Фаза 2.
- `builder` — виджет по flow doc в отдельном worktree. Когда появится параллельная работа.
- `doc-reviewer` — документы обновлены вместе с кодом, глоссарий соблюдён. Может оказаться skill.

**Skills** (создавать, когда задача повторилась второй раз)
- `new-flow`, `verify-in-browser`, `close-task`, `add-mock-scenario`, `build-widget`, `record-decision`.

**Документы**
- `APPLICATION.md`: разделы «Personas» и «Mock PNR» относятся в основном к PNR Search — решить, когда появятся данные Booking.

**Craft (Фаза 5)**
- Полировка по Figma, визуальная регрессия по скриншотам.

## Сделано

| # | Что | Коммит (или `git log --grep '\[N\]'`) |
|---|---|---|
| 0 | PNR Search: покрытие (PNR Required, Not Found, Error, App Sidebar, Storybook) | ветка `claude/hopeful-wright-0ar03b`, `242472b` |
| 1.1 | Skills → `.claude/skills/<name>/SKILL.md` | `e9b0572` |
| 1.2 | `CLAUDE.md` — только инфраструктура; решения PNR Search → его flow doc; `create-screen` без противоречия | `20e1be0` |
| 1.3 | Решения App Sidebar → его flow doc | `55c454a` |
| — | Тесты заливки Hover / Pressed / Focus в App Sidebar | `e92935b` |
| — | Раздел «Фаза» — правило для всех flows | `44b3022` |
| — | Параметры адреса PNR Search → его flow doc | `0d13326` |
| 1.4 | `figma-reader` → `.claude/agents/` (tools — явный список, model — sonnet) | `1818d68` |
| 1.5 | `ROADMAP.md` и правило 11 в `CLAUDE.md` | `[1.5]` |
| 1.13 | Ветки: основная — `main` (default на GitHub), изменения сессии влиты через PR #4 | `[1.13]` |
| 1.12 | Субагент `qa-tester` и прогон `npm run qa` (`scripts/qa/`): Booking B1–B13, PNR Search 1–12 + живые сценарии, отчёт и скриншоты в `qa-report/` | `[1.12]` |
| 1.6 | Каталог компонентов `docs/components.md`: 3 компонента Skydesk и 9 ui — назначение, props, состояния, Figma, stories | `[1.6]` |
| 2.1 | План Фазы 2 и flow doc `projects/booking-overview/README.md`; open questions #22–#26, #3 закрыт | `[2.1]` |
| 2.2 | Модель Booking для Header (`src/lib/booking.ts`) и mock-бронирования по PNR, `BBV14Q` находится поиском | `[2.2]` |
| 2.3 | Компонент Booking Header по Figma `308:12504`, stories, токены `divider` и `drop-shadow-header` | `[2.3]` |
| 2.4 | Экран Booking `?page=booking&pnr=…`: App Sidebar + Header + вкладка + пустая зона виджетов; `openBooking`; PNR, который не открывается, → PNR Search | `[2.4]` |
| 2.6 | Проход в браузере: Booking B1–B13 и регрессия PNR Search, 40 проверок без ошибок | `[2.6]` |
