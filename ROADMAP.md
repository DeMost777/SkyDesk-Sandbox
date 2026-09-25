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

—

## Дальше

Сверху — следующая. Порядок меняет только пользователь.

План Фазы 2 утверждён пользователем 2026-09-25; задачи Фазы 1 идут параллельно. Как делать каждую — `projects/booking-overview/README.md`.

- [2.2] Модель Booking для Header (`src/lib/booking.ts`: тип, интерфейс данных, `getBooking`, число пассажиров, дата создания — с тестами) и mock-бронирования по PNR (`BBV14Q` + `7JRWT4`, `K2M9QP`, `ABC123`) — Фаза 2 · начало 1.11
- [2.3] Компонент Booking Header (`src/components/skydesk/booking-header/`) по Figma `308:12504`, stories — Фаза 2 · зависит от: 2.2
- [2.4] Экран Booking (`src/pages/booking/`, `?page=booking&pnr=…`): App Sidebar + Header + вкладка «Booking Overview» + пустая зона виджетов, stories — Фаза 2 · зависит от: 2.3
- [2.5] Переход Found → Booking, заглушка Found удаляется; решить, куда уходит «Use as default» (open question #24) — Фаза 2 · зависит от: 2.4
- [2.6] Проверка в браузере, `APPLICATION.md`, `docs/testing-plan.md` — Фаза 2 · зависит от: 2.5
- [1.6] Каталог компонентов `docs/components.md`: назначение, props, состояния, Figma node, ссылка на stories — Фаза 1
- [1.7] Карта Figma `docs/figma-map.md`: экран или компонент → node id — Фаза 1
- [1.8] Обновить skills `build-component` (Storybook уже есть, путь `src/components/skydesk/`) и `extract-tokens` (HSL и семантические токены) — Фаза 1
- [1.9] Обновить формат вывода `figma-reader` под текущие токены — Фаза 1 · зависит от: 1.8
- [1.10] Skill `create-screen`: добавить `src/lib/` с тестами, stories, документы, проверки перед push — Фаза 1
- [1.11] Доменная модель Booking (`src/lib/booking.ts`) и сценарные mock-бронирования (`src/mocks/`) — Фаза 1 · часть для Header — в 2.2, остальное растёт с виджетами
- [1.12] Субагент `qa-tester`: проход состояний из flow doc в Playwright, скриншоты, ошибки консоли, отчёт — Фаза 1

## Потом

Без порядка. Сюда попадает всё, что замечено по ходу.

**Booking Overview** (конечный вид — Figma `4678:125394`)
- Контракт виджета: аккордеон, заголовок, счётчик справа, раскрытие и сворачивание — Фаза 3.
- Виджеты по порядку из Figma: Passengers, Segments («Flight information»), Ticket, Services, EMD, Remarks, Messages, Contacts — Фаза 3.
- Tabs над виджетами: сейчас одна вкладка «Booking Overview» — какие ещё, решить с design.
- Header: иконка часов справа, Time Limit (скрыт в Figma), действие кнопок sidebar и панели.
- Чат справа (362px): mock-сценарии AI-действий («найти в бронировании», «проверить условия возврата»), связь с виджетами. Настоящий Claude API — решить — Фаза 4.

**Агенты**
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
| 2.1 | План Фазы 2 и flow doc `projects/booking-overview/README.md`; open questions #22–#26, #3 закрыт | `[2.1]` |
