# Каталог компонентов

> Что уже есть в `src/components/`: назначение, props, состояния, Figma node, stories. Updated: 2026-09-25.
> Перед новым компонентом — проверить здесь, нет ли подходящего (правило 1 в `CLAUDE.md`). Новый или изменённый компонент — строка и раздел здесь в том же изменении, что и код (правило 10).
> Поведение и решения — во flow doc компонента или экрана; здесь только ссылка.

## Сводка

| Компонент | Слой | Где в коде | Где используется | Figma | Stories |
|---|---|---|---|---|---|
| [App Sidebar](#app-sidebar) | Skydesk | `src/components/skydesk/app-sidebar/` | PNR Search, Booking | `548:16649` | Skydesk / App Sidebar |
| [History Item](#history-item) | Skydesk | `src/components/skydesk/app-sidebar/history-item.tsx` | App Sidebar | `4920:69057` | Skydesk / App Sidebar / History Item |
| [Booking Header](#booking-header) | Skydesk | `src/components/skydesk/booking-header/` | Booking | `308:12504` | Skydesk / Booking Header |
| [Office Selector](#office-selector) | ui | `src/components/ui/office-selector.tsx` | PNR Search | не записан (задача 1.7) | Components / ui / Office Selector |
| [Sidebar](#sidebar-примитив) (примитив) | ui | `src/components/ui/sidebar.tsx` | App Sidebar | — (shadcn Sidebar) | через App Sidebar |
| [Button](#button) | ui | `src/components/ui/button.tsx` | Booking Header | — (shadcn Button; Button Icon `7441:411520`) | Components / ui / Button |
| [Badge](#badge) | ui | `src/components/ui/badge.tsx` | — | — (shadcn) | Components / ui / Badge |
| [Input](#input) | ui | `src/components/ui/input.tsx` | — | — (shadcn) | Components / ui / Input |
| [Popover](#popover-dialog-command-label) | ui | `src/components/ui/popover.tsx` | — (Office Selector берёт Radix напрямую) | — (shadcn) | Components / ui / Popover |
| [Dialog](#popover-dialog-command-label) | ui | `src/components/ui/dialog.tsx` | Command | — (shadcn) | Components / ui / Dialog |
| [Command](#popover-dialog-command-label) | ui | `src/components/ui/command.tsx` | — | — (shadcn) | Components / ui / Command |
| [Label](#popover-dialog-command-label) | ui | `src/components/ui/label.tsx` | — | — (shadcn) | нет |

**Слои.** `ui` — примитивы shadcn/ui с темой Skydesk, без знания о бронированиях (Office Selector — исключение: он знает Office). `skydesk` — компоненты продукта, собранные из примитивов; получают доменные данные (`Booking`, `HistoryEntry`) и не содержат логики экрана.

Storybook: локально `npm run storybook` → `http://localhost:6006`; на Vercel — `<preview>/storybook/`. Каждая story — тест в `npm test`.

## Skydesk

### App Sidebar

Постоянная навигация агента: New chat и History. Flow doc — `projects/app-sidebar/README.md`.

| Prop | Тип | Что |
|---|---|---|
| `history` | `HistoryEntry[]` | Последние бронирования, последнее действие сверху. Компонент не сортирует |
| `user` | `AgentUser` | Агент в footer: инициалы, имя, email |
| `activePnr` | `string \| null` | PNR открытого бронирования — его History item Active. На странице Booking — PNR страницы |
| `now` | `Date` | Точка отсчёта для «Today» |
| `onBrandClick`, `onNewChat`, `onSelect`, `onUserClick` | обработчики | Экраны не передают: клики пока без действия (open question #21) |

Состояния: Default / Hover / Pressed / Focus / Active у Header, New chat, History item и Footer; пустая и длинная History. Части экспортируются отдельно: `SidebarBrand`, `NewChatButton`, `SidebarUser`, `HistoryItem`.

Stories: Default, Clicks, Active Item, Empty History, Long History; Parts — Header, New chat, Footer × Default / Hover / Pressed / Focus, Footer Long Name.

### History Item

Одна карточка History: `PNR · GDS code`, Itinerary, дата и время последнего действия.

| Prop | Тип | Что |
|---|---|---|
| `entry` | `HistoryEntry` | PNR, GDS, маршрут, время последнего действия |
| `now` | `Date` | «Today» или `DD/MM/YY` (`formatInteraction`) |
| `isActive` | `boolean` | Открытое бронирование: заливка и `aria-current="page"` |
| `onSelect` | `(entry) => void` | Клик по карточке |

Правила текста — `src/lib/booking-history.ts`: `gdsCode`, `toItinerary` (One way / Round / Multi trip), `formatInteraction`. Stories: Default, Hover, Pressed, Focus, Active, Selects On Click, One Way, Round Trip, Multi City.

### Booking Header

Шапка экрана Booking: `◧ │ PNR │ GDS │ 👥 N passengers │ Created: DD/MM/YYYY HH:mm   ◨`. Flow doc — `projects/booking-overview/README.md` → «Header» (размеры, токены, что скрыто и почему).

| Prop | Тип | Что |
|---|---|---|
| `booking` | `Booking` | PNR, GDS, пассажиры, дата создания |
| `onToggleSidebar`, `onTogglePanel` | обработчики | Кнопки ◧ и ◨. Экран не передаёт: без действия (open question #21) |
| `className` | `string` | Раскладка снаружи |

Office не показывается (open question #22). Тексты — `src/lib/booking.ts`: `passengerCountLabel` (`1 passenger`), `formatCreated`. PNR — `<h1>` страницы. Токены: `divider`, `drop-shadow-header`.

Stories: Default (`BBV14Q`, как в Figma), One Passenger, Buttons, Narrow.

## ui

### Office Selector

Выбор Office для поиска PNR: кнопка-триггер и popover со списком и поиском. Flow doc — `projects/pnr-search/README.md` («Список Office в Office Selector»).

| Prop | Тип | Что |
|---|---|---|
| `offices` | `Office[]` | Список; порядок задаёт `sortOfficesForPicker`: сначала Default Offices, потом остальные, по алфавиту |
| `value`, `onChange` | `OfficeSelection \| null` | Выбранный Office; `null` — «Select office» |
| `disabled` | `boolean` | Во время поиска |
| `loading`, `error` | `boolean` | Список грузится / не загрузился |
| `onManageDefaults` | `() => void` | Ссылка на настройку Default Offices |

Stories: Default (проверяет порядок), Selected, Without Defaults, Disabled, Loading, Load Error, No Offices.

### Sidebar (примитив)

Подмножество shadcn Sidebar с теми же именами частей и разметкой `data-sidebar`, написано вручную (registry shadcn недоступен). Части: `Sidebar`, `SidebarHeader`, `SidebarContent`, `SidebarGroup`, `SidebarGroupLabel`, `SidebarGroupContent`, `SidebarMenu`, `SidebarMenuItem`, `SidebarMenuButton` (`isActive`, `size`), `SidebarFooter`. Отличие от shadcn: Active не жирный, Hover / Pressed / Focus / Active — одна заливка `sidebar-accent`. Решения — `projects/app-sidebar/README.md` → «Решения и gotchas».

### Button

shadcn Button. `variant`: `default` (teal), `destructive`, `outline`, `secondary`, `ghost`, `link`, `brand`. `size`: `default` (36px), `sm`, `lg`, `icon` (36×36). `asChild` — отдать стили дочернему элементу. В Booking Header — `ghost` + `size-7` (28×28, Figma Button Icon). Teal с текстом не проходит контраст — open question #14.

Stories: Default, Secondary, Outline, Ghost, Link, Destructive, Small, Icon, Disabled, Css Check (токены загрузились).

### Badge

shadcn Badge. `variant`: `default`, `secondary`, `destructive`, `outline`, `brand`. В экранах пока не используется. Stories: Default, Secondary, Outline, Destructive.

### Input

shadcn Input, все атрибуты `<input>`. Поле PNR на экране поиска — своя разметка по Figma, не этот компонент. Stories: Empty, Filled, Disabled, Invalid.

### Popover, Dialog, Command, Label

Примитивы shadcn без изменений темы. В экранах напрямую не используются: Office Selector собран на Radix Popover, Command — на Dialog. Stories: Popover, Dialog, Command — Default; у Label stories нет.

## Пробелы

- Figma node Office Selector и примитивов не записаны — карта Figma, задача 1.7.
- Badge, Input, Popover, Dialog, Command, Label в экранах не используются: оставлены из shadcn для будущих экранов.
- Hover / Focus кнопок Booking Header не сверены с Figma (`ROADMAP.md` → «Потом»).
