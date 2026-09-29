# Каталог компонентов

> Что есть в `src/components/`: назначение, props, состояния, Figma, stories. Updated: 2026-09-30.
> Правило: новый или изменённый компонент — строка здесь в том же изменении (CLAUDE.md → правило 10). Поведение экрана — в его flow doc; здесь — что лежит в компоненте.
> Figma node — только те, что записаны в коде или документах. «—» значит, что в источниках узла нет: не выдумывать, спросить или записать в `docs/open-questions.md`.
> Storybook: `npm run storybook`, названия ниже — как в боковой панели. Каждая story — тест (`npm test`), включая проверку доступности.

## Общее

- **Токены:** цвета, радиусы, размеры шрифта и тени — только из `src/tokens/` (`npm run lint:tokens`). Страница токенов — Storybook → Foundations / Colors.
- **Слои:** `ui/` — shadcn/ui примитивы; `skydesk/` — компоненты Skydesk на их основе. Компонент без знания предметной области (таблица, рамка виджета) — отдельно от компонента, который знает Pricing или Ticket.
- **Данные:** компоненты получают готовые значения или типы из `src/lib/` (`Booking`, `HistoryEntry`); mock-данные живут в `src/mocks/`, компонент их не импортирует.

## Сводка

| Компонент | Где | Storybook | Figma | Статус |
|---|---|---|---|---|
| Button, Badge, Input, Label | `ui/` | Components / ui / Button, Badge, Input | shadcn kit (узел не записан) | стабильный |
| Dialog, Popover, Command | `ui/` | Components / ui / Dialog, Popover, Command | shadcn kit (узел не записан) | стабильный |
| Sidebar (примитив) | `ui/sidebar.tsx` | через App Sidebar | `4920:69057` | стабильный |
| Office Selector | `ui/office-selector.tsx` | Components / ui / Office Selector | — | стабильный |
| App Sidebar, History Item, части | `skydesk/app-sidebar/` | Skydesk / App Sidebar (+ History Item, Parts) | `548:16649`, `4920:69057`, `7936:79314` | стабильный |
| Booking Header | `skydesk/booking-header/` | Skydesk / Booking Header | `8014:11426` | стабильный |
| Widget Section | `skydesk/widget-section/` | Skydesk / Widget Section | `8014:11331`, `8014:11397` | стабильный |
| Matrix Table, Cell | `skydesk/matrix-table/` | Skydesk / Matrix Table | `8014:11342` | стабильный |
| Ref Badge, Passenger / Segment Header | `skydesk/matrix-table/` | Skydesk / Matrix Table / Headers | `8014:11347`, `8014:11380` | стабильный |
| Overview Widget, Document Card, No Document | `skydesk/overview-widget/` | — (экспериментальный) | `7851:67417`, `8013:11314`, `7876:10095` | экспериментальный |

**Экспериментальный** — вид не утверждён командой, поэтому stories нет (решение пользователя, 2026-09-28); состояния смотреть на странице Booking Overview.

## `ui/` — примитивы shadcn/ui

| Компонент | Props и варианты | Состояния в stories |
|---|---|---|
| `Button` | `variant`: default, destructive, outline, secondary, ghost, link, brand; `size`: default, sm, lg, icon; `asChild` | Default, Secondary, Outline, Ghost, Link, Destructive, Small, Icon, Disabled, CssCheck (проверка, что токены загрузились) |
| `Badge` | `variant`: default, secondary, destructive, outline, brand | Default, Secondary, Outline, Destructive |
| `Input` | как `<input>` | Empty, Filled, Disabled, Invalid |
| `Label` | как `<label>` | — |
| `Dialog` | `Dialog`, `DialogTrigger`, `DialogContent`, `DialogHeader`, `DialogFooter`, `DialogTitle`, `DialogDescription`, `DialogClose` | Default |
| `Popover` | `Popover`, `PopoverTrigger`, `PopoverContent`, `PopoverAnchor` | Default |
| `Command` | `Command`, `CommandInput`, `CommandList`, `CommandGroup`, `CommandItem`, `CommandEmpty`, `CommandSeparator`, `CommandShortcut`, `CommandDialog` | Default |

Заметки: teal `primary` с текстом не проходит контраст AA (3.5:1, нужно 4.5:1) — stories помечены `a11y: todo`, нарушение видно в панели, но тест не падает: Button Default, Link, Small, CssCheck; Badge Default; Dialog Default; Office Selector LoadError (open question #14). Кольцо фокуса — `ring` (zinc-500 `#71717a`, как в Figma). Осознанное отличие от Figma — только `destructive-foreground` (вопрос #22).

## `ui/office-selector.tsx` — Office Selector

- **Назначение:** выбор Office (GDS + код) в поле поиска PNR. Сначала Default Offices агента, затем остальные, обе группы по алфавиту кода.
- **Props:** `offices`, `value: OfficeSelection | null`, `onChange`, `disabled`, `loading`, `error`, `onManageDefaults`, `className`.
- **Правила:** порядок и подписи — `src/lib/office.ts` (`sortOfficesForPicker`); Flow doc — `projects/pnr-search/README.md`.
- **Состояния (stories Components / ui / Office Selector):** Default, Selected, WithoutDefaults, Disabled, Loading, LoadError, NoOffices.
- **Figma:** — (узла в источниках нет).

## `skydesk/app-sidebar/` — App Sidebar

- **Назначение:** левая панель: логотип, New chat, History (недавние бронирования), пользователь. Flow doc — `projects/app-sidebar/README.md`.
- **Props `AppSidebar`:** `history: HistoryEntry[]`, `user: AgentUser`, `activePnr`, `now`, `onBrandClick`, `onNewChat`, `onSelect(entry)`, `onUserClick`, `className`.
- **Части:** `SidebarBrand`, `NewChatButton`, `SidebarUser`, `HistoryItem`, `TravaLogo` (знак перерисован SVG, вопрос #16).
- **`HistoryItem`:** `entry`, `now`, `isActive`, `onSelect`. Показывает `PNR · GDS code`, дату или «Today» и Itinerary (`A → B`, `A ⇆ B`, `A → B → C`).
- **Состояния:** Default, Hover, Pressed, Focus, Active; варианты маршрута One way / Round / Multi city. Pressed и Focus в Figma нет: pressed = hover, focus = `sidebar-ring`, zinc-500 (вопрос #17). Клики ничего не делают в приложении (вопрос #21).
- **Stories:** Skydesk / App Sidebar (Default, Clicks, ActiveItem, EmptyHistory, LongHistory); / History Item (Default, Hover, Pressed, Focus, Active, SelectsOnClick, OneWay, RoundTrip, MultiCity); / Parts (Header, New chat, Footer × Default / Hover / Pressed / Focus, FooterLongName).
- **Figma:** `548:16649` (Type=Default), `4920:69057` (состояния History item), `7936:79314` (раскладка PNR Search с sidebar).

## `skydesk/booking-header/` — Booking Header

- **Назначение:** верхняя панель Booking Overview: что открыто у агента. Flow doc — `projects/booking-overview/README.md`.
- **Props:** `pnr`, `gds`, `passengerCount`, `createdAt` (ISO, показывается в местном времени как `DD/MM/YYYY HH:mm`), `className`.
- **Внутри:** кнопка панели, `PNR | GDS | N passengers | Created: …`, справа History и чат. Три кнопки пока ничего не делают (вопрос #28). PNR — `h1` страницы.
- **Stories:** Default, OnePassenger, Amadeus, Keyboard (порядок Tab).
- **Figma:** `8014:11426`. Токены: `shadow-header`, `text-icon`.

## `skydesk/widget-section/` — Widget Section

- **Назначение:** рамка любого виджета Booking Overview: сворачиваемая секция с заголовком, бейджем-счётчиком и содержимым до 800px по центру.
- **Props:** `title`, `icon` (иконка бейджа), `count` (без него бейджа нет), `defaultOpen` (по умолчанию `true`), `className`, `children`.
- **Доступность:** заголовок — `h2` с кнопкой `aria-expanded`; имя кнопки — название, счётчик — её описание. Содержимое остаётся в DOM при сворачивании.
- **Stories:** Expanded, Collapsed, Toggle, Keyboard, Passengers, ZeroCount, NoCount.
- **Figma:** `8014:11331` (Overview), `8014:11397` (Passengers). Высота строки заголовка 36px (в Figma у свёрнутых 32px — вопрос #28).

## `skydesk/matrix-table/` — Matrix Table

- **Назначение:** табличная основа для виджетов «пассажир × сегмент» (Overview, дальше Services). Знает строки, колонки и ячейки, не знает, что в ячейке.
- **Props `MatrixTable`:** `label`, `cornerLabel` («Segments»), `columns: {id, header}[]`, `rows: {id, header}[]`, `renderCell(row, column)`, `className`. **`MatrixCell`:** отступ 8px, зазор 6px, минимум 59px.
- **Поведение:** первая колонка (140px) закреплена слева; колонки пассажиров минимум 172px и прокручиваются под ней, когда не помещаются (с четвёртого пассажира при 800px). Область прокрутки в фокусе с клавиатуры.
- **Части:** `RefBadge` (`tone`: passenger оранжевый, segment синий, 30px), `PassengerHeader` (`P1 ADT`, имя в подсказке), `SegmentHeader` (`S1 KBP–FRA` / `14 Jun  SK 400`, год в подсказке).
- **Stories:** Skydesk / Matrix Table (Default, ScrollsSideways, FourPassengers, EmptyCells, Keyboard); / Headers (Badges, Passengers, Segments).
- **Figma:** `8014:11342` (таблица), `8014:11347` (заголовок пассажира), `8014:11380` (строка сегмента). Flow doc — `projects/booking-overview/overview-widget.md`.

## `skydesk/overview-widget/` — Overview (экспериментальный)

- **Назначение:** первый виджет Booking Overview: какие Pricing и Ticket есть у каждого пассажира на каждом сегменте и в каком они статусе.
- **`OverviewWidget`:** `booking: Booking`, `onOpen({type, id})`. Данные — `buildOverviewMatrix` (`src/lib/overview-matrix.ts`).
- **`DocumentCard`:** одна кнопка на всю карточку. Pricing: иконка, «Pricing», бейдж статуса; Ticket: иконка, «Ticket», бейдж, номер. Бейджа нет у Active. Состояния: Default, Hover (покрытие «See widget»), Pressed = Hover, Focus (двойное кольцо, полоса Gray/500). **`NoDocument`:** пустая ячейка со штриховкой.
- **Stories:** нет, до фидбека команды. Проверка — `src/lib/overview-matrix.test.ts` и страница `?page=booking-overview&pnr=BBV14Q`.
- **Figma:** `7851:67417` (карточки Default / Hover, бейджи), `8013:11314` (Focus), `7876:10095` (No document). Flow doc — `projects/booking-overview/overview-widget.md`.

## Страницы (не компоненты)

`src/pages/pnr-search/` (stories Pages / pnr-search — все состояния поиска) и `src/pages/booking-overview/` (Pages / booking-overview). Адреса и состояния — в их flow doc.
