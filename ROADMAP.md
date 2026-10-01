# Roadmap

> Карта работ: что строим, что в работе, что дальше. Updated: 2026-10-01.
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
| 2 | Каркас Booking Overview: layout, шапка PNR · GDS · Office, контракт виджета | |
| 3 | Виджеты Booking, по одному | |
| 4 | Чат и AI-действия | |
| 5 | Craft: полировка, визуальная регрессия | |

## Сейчас

—

## Дальше

Сверху — следующая. Порядок меняет только пользователь.

- [1.22] Интервью для новой фичи или виджета: стандартный набор вопросов и запрос материалов (Figma file key и node id, скриншоты, спецификация, поля данных, сценарии и edge cases, тексты, поведение), результат — «карточка готовности» в flow doc и список недостающего; оформить как skill. Первый прогон — на Passengers (3.2) — Фаза 1
- [1.18] Skill `build-widget` — по двум готовым виджетам (Overview и Passengers): что у виджетов общее (`WidgetSection`, счётчик, данные из `Booking`, свой mock-сценарий, stories, раздел flow doc), что специфично. Проверка на третьем виджете — Фаза 1 · зависит от: 3.2, 1.22
- [1.19] Передача открытых вопросов в design пачкой: блокирующие #3, #14, #26, #28, состояния без макета (Pressed / Focus, пустая History, длинный Itinerary, узкое окно, loading / error Booking Overview) — документ или комментарии к узлам Figma; ответы — в `docs/open-questions.md` — Фаза 1
- [1.20] Визуальная регрессия по скриншотам (Playwright / `@chromatic-com/storybook` уже установлены): эталоны для stories и состояний flow, до перехода в Craft, чтобы полировка не ломала соседние экраны — Фаза 1 (раньше Фазы 5)

## Потом

Без порядка. Сюда попадает всё, что замечено по ходу.

**Booking Overview**
- Виджет Passengers: `CNN` / `INS`, FOID и частичная дата рождения — не в V1 (решение пользователя, 2026-10-01); отдельный Pressed карточки, если design нарисует.
- Подсказка с `Passenger N` в матрице Overview (сейчас нативный `title` с именем): `RefBadge` уже умеет `tooltip`, решить, менять ли.
- Остальные виджеты страницы по production: Flights, Pricing, Tickets, Services, Messages. Порядок и состояние по умолчанию — open question #40.
- Stories карточек Pricing / Ticket, «No document» и виджета Overview — после фидбека команды (состояния: Default, Hover, Focus; проверять поведение, не пиксели).
- Виджет Services на общей `MatrixTable` (в Figma и в записи пользователя он уже есть).
- Левая рейка Booking Overview (Passengers, Flights, Tickets, Services, Remarks). Блок: open question #26.
- Дизайн перехода PNR Search → Booking: сейчас ссылка «Open booking». Блок: open question #3.
- Узкое окно: sidebar не сворачивается, ~700px шапка обрезает «Created». Чат справа — Фаза 4.
- Виджеты после Overview, по Figma `8014:11324`: Passengers, Segments, Ticket, Pricing, Services, EMD, Remarks, Messages, Contacts.
- Чат: mock-сценарии AI-действий («найти в бронировании», «проверить условия возврата»), связь с виджетами. Настоящий Claude API — решить.

**Агенты**
- `domain-researcher` — домен GDS и reference из production Skydesk → `projects/<flow>/research.md`. Когда начнётся Фаза 2.
- `builder` — виджет по flow doc в отдельном worktree. Когда появится параллельная работа.
- `doc-reviewer` — документы обновлены вместе с кодом, глоссарий соблюдён. Может оказаться skill.

**Skills** (создавать, когда задача повторилась второй раз)
- `new-flow`, `verify-in-browser`, `close-task`, `add-mock-scenario`, `record-decision`.

**Storybook**
- Stories нет у `ui/label.tsx` и `ui/sidebar.tsx` (sidebar покрыт через App Sidebar).
- Сниппеты addon-mcp пишут `import … from 'skydesk-sandbox'`. Тег `@import` в JSDoc компонента не сработал — найти способ задать путь `@/components/…`.

**Документы**
- `APPLICATION.md`: разделы «Personas» и «Mock PNR» относятся в основном к PNR Search — решить, когда появятся данные Booking.

**Craft (Фаза 5)**
- Полировка по Figma. Визуальная регрессия — [1.20].

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
| 1.11 | Модель Booking (`src/lib/booking.ts`), матрица Overview (`overview-matrix.ts`), 9 сценарных mock-бронирований (`src/mocks/bookings/`), PNR Search читает их же; flow doc `projects/booking-overview/`; глоссарий: Pricing, Ticket, Segment, Passenger type, Overview | `[1.11]` |
| 1.13 | Ветки: основная — `main` (default на GitHub), изменения сессии влиты через PR #4 | `[1.13]` |
| 1.14 | Токены цвета из Figma «shadcn kit - Trava»: палитра (22 шкалы), семантические токены привязаны к палитре, Storybook Foundations / Colors, тест соответствия Figma; mono-шрифт Roboto → IBM Plex Mono | `[1.14]` |
| 1.15 | Open question #22 закрыт: светлые токены приведены к Figma (`popover`, `input`, `*-foreground`, sidebar, `chart-2`); `ring` и `sidebar-ring` — zinc-500 по правке в Figma; `destructive-foreground` осознанно `#fafafa` из-за контраста | `[1.15]` |
| 2.1 | Каркас Booking Overview: страница `?page=booking-overview&pnr=…`, шапка бронирования (`BookingHeader`), рамка виджета (`WidgetSection`, до 800px по центру), панель сценариев, ссылка «Open booking» в строке Found (PNR Search → Booking), токены `page` / `icon` / `shadow-header`; stories и тесты | `[2.1]` |
| 3.1 | Виджет Overview: `MatrixTable` со stories (закреплённая колонка сегментов, горизонтальный скролл), `OverviewWidget`, карточки Pricing / Ticket (Default, Hover, Focus), «No document»; токены матрицы; карточки без stories до фидбека | `[3.1]` |
| 3.2 | Виджет Passengers: модель `Passenger` (дата рождения, пол, документ, Frequent flyer), правила в `src/lib/passenger.ts`, mock-сценарий `PAX7QD` и данные в `BBV14Q`, `PassengerCard` и `PassengersWidget` (индикаторы, раскрытие, фокус), `ui/tooltip` и подсказка на бейдже, токен `success`; stories и тесты; flow doc, источники и open questions #30–40 | `[3.2]` |
| 1.6 | Каталог компонентов `docs/components.md`: сводка, `ui/` и `skydesk/` — назначение, props, состояния, Figma node, stories; правило в CLAUDE.md (правило 10) | `[1.6]` |
| 1.7 | Карта Figma `docs/figma-map.md`: экраны и компоненты → node id → код; file key не найден — open question #29 | `[1.7]` |
| 1.17 | SessionStart-хук и `.claude/settings.json` для облака (`npm install` + запуск Storybook), Storybook MCP для Claude Code (`.mcp.json`) | `[1.17]` |
| 1.21 | Storybook как каталог для агента: autodocs, JSDoc над `meta`, `title` разделов (`UI/…`, `Skydesk/…`, `Pages/…`), props через react-docgen-typescript, `paths` в корневом `tsconfig.json` | `[1.21]` |
| 1.16 | CI: GitHub Actions (`.github/workflows/ci.yml`) на каждый PR и push в `main` — `typecheck`, `lint:tokens`, `test` (stories в Chromium), `build`, `build-storybook`; check `check` (workflow CI) | `[1.16]` |
| 1.8 | Skills `build-component` (путь `skydesk/<kebab-case>/`, stories-тесты, каталог, Figma-карта, токены) и `extract-tokens` (два слоя цвета, HSL, генератор палитры) обновлены под текущий код | `[1.8]` |
| 1.9 | `figma-reader`: формат вывода под текущие токены (имена Figma, палитра, `unbound`), форматы «Токены», «Узел», «Сверка», вход через `docs/figma-map.md` | `[1.9]` |
| 1.10 | Skill `create-screen`: подготовка (ROADMAP, flow doc, источники), `src/lib/` с тестами, stories, документы, проверки перед push, конец задачи | `[1.10]` |
| 1.12 | Субагент `qa-tester` (`.claude/agents/qa-tester.md`): проход состояний flow doc и testing-plan в Playwright, скриншоты, ошибки консоли, отчёт в `qa-report/` (в `.gitignore`); tools — Read, Glob, Grep, Bash, Write, model — sonnet; в деле не запускался | `[1.12]` |
