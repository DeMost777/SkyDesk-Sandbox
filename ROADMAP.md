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
| 1 | Фундамент среды: skills, агенты, Storybook как каталог компонентов, модель Booking | в работе |
| 2 | Каркас Booking Overview: layout, шапка PNR · GDS · Office, контракт виджета | |
| 3 | Виджеты Booking, по одному | |
| 4 | Чат и AI-действия | |
| 5 | Craft: полировка, визуальная регрессия | |

## Сейчас

—

## Дальше

Сверху — следующая. Порядок меняет только пользователь.

- [1.7] Figma node экранов — в flow doc своего flow. Проверить, нужна ли задача отдельно: компоненты с Figma пока не связываем (решение пользователя, 2026-09-25) — Фаза 1
- [1.9] Обновить формат вывода `figma-reader` под текущие токены — Фаза 1 · зависит от: 1.8
- [1.10] Skill `create-screen`: добавить `src/lib/` с тестами, stories, документы, проверки перед push — Фаза 1
- [1.11] Доменная модель Booking (`src/lib/booking.ts`) и сценарные mock-бронирования (`src/mocks/`) — Фаза 1
- [1.12] Субагент `qa-tester`: проход состояний из flow doc в Playwright, скриншоты, ошибки консоли, отчёт — Фаза 1

## Потом

Без порядка. Сюда попадает всё, что замечено по ходу.

**Booking Overview**
- Flow doc `projects/booking-overview/` и каркас: layout, шапка, зона виджетов, чат справа. Блок: скриншот и Figma Booking Overview.
- Переход Found → Booking. Блок: open question #3.
- Виджеты (порядок подтвердить по скриншоту): Passengers, Itinerary / Segments, Tickets, Pricing / Fare rules, Services, Remarks / SSR / OSI, History.
- Чат: mock-сценарии AI-действий («найти в бронировании», «проверить условия возврата»), связь с виджетами. Настоящий Claude API — решить.

**Агенты**
- `domain-researcher` — домен GDS и reference из production Skydesk → `projects/<flow>/research.md`. Когда начнётся Фаза 2.
- `builder` — виджет по flow doc в отдельном worktree. Когда появится параллельная работа.
- `doc-reviewer` — документы обновлены вместе с кодом, глоссарий соблюдён. Может оказаться skill.

**Skills** (создавать, когда задача повторилась второй раз)
- `new-flow`, `verify-in-browser`, `close-task`, `add-mock-scenario`, `build-widget`, `record-decision`.

**Storybook**
- Stories нет у `ui/label.tsx` и `ui/sidebar.tsx` (sidebar покрыт через App Sidebar).
- Сниппеты addon-mcp пишут `import … from 'skydesk-sandbox'`. Тег `@import` в JSDoc компонента не сработал — найти способ задать путь `@/components/…`.

**Токены**
- Токены из пресета shadcn округлены (`primary` `174 84% 32%` вместо `174.7 83.9% 31.6%`). Решить, приводить ли к точным значениям — со сравнением скриншотов.

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
| 1.6 | Storybook — каталог компонентов: autodocs, описания в JSDoc над `meta` (без Figma), props через react-docgen-typescript, манифест для addon-mcp без ошибок | `[1.6]` |
| 1.14 | Storybook MCP в Claude Code: `.mcp.json`, `enabledMcpjsonServers`, SessionStart-хук для облака (npm install + Storybook) | `[1.14]` |
| 1.8 | Skills `build-component` (каталог — Storybook/MCP, структура папок, story как документация и тест, без Figma) и `extract-tokens` (HSL-каналы точно, семантические имена, Tailwind, `extendTailwindMerge`, проверка скриншотами) | `[1.8]` |
| 1.13 | Ветки: основная — `main` (default на GitHub), изменения сессии влиты через PR #4 | `[1.13]` |
