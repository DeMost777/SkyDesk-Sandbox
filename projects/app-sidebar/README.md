# Component: App Sidebar

> Flow doc компонента. Читать до кода, обновлять в том же изменении, что и поведение.
> Updated: 2026-09-24. Phase: **coverage** (см. CLAUDE.md → «Фаза»).

**Principle:** sidebar — постоянная навигация агента: откуда начать новый поиск и к каким бронированиям он недавно возвращался. Сейчас он ничего не решает за агента и ничего не запускает — только показывает.

## Job

Агент работает с несколькими бронированиями за день. Sidebar держит под рукой две вещи: начать новый поиск (**New chat**) и последние бронирования, с которыми агент что-то делал в Skydesk (**History**).

## Источники

| Что | Где |
|---|---|
| Компонент, варианты Default / Collapsed | Figma `548:16649` (Menu_Sidebar) |
| Sidebar на экране PNR Search | Figma `7936:79314` |
| Спецификация History item: состояния и варианты маршрута | Figma `4920:69057` |
| Состав General, кликабельные зоны, отсутствие поведения | Решения пользователя, 2026-09-23 |

## Анатомия

Сделан по стандарту shadcn/ui Sidebar: те же имена частей и та же разметка (`src/components/ui/sidebar.tsx`), поэтому production-версию shadcn можно подставить без изменения экранов.

| Часть | Что внутри | Кликабельно |
|---|---|---|
| **Sidebar Header** | Логотип Trava + «Trava Sky Desk» | Да (кнопка целиком) |
| **Group Label** «General» | Заголовок группы | Нет |
| **New chat** | Иконка + «New chat» | Да |
| **Group Label** «History» | Заголовок группы | Нет |
| **History item** | См. ниже | Да (карточка целиком) |
| **Sidebar Footer** | Аватар с инициалами, имя, email | Да (кнопка целиком) |

### History item

```
BBV14Q · 1S           Today     ← PNR · GDS code        Interaction date
CDG → LON → JFK       15:12     ← Itinerary             Interaction time
```

- **GDS code** — двухсимвольный код GDS: Amadeus `1A`, Sabre `1S`, Galileo `1G` (`gdsCode` в `src/lib/booking-history.ts`).
- **Interaction date / time** — когда агент последний раз что-то делал с этим бронированием в Skydesk. Сегодня — `Today`, иначе `DD/MM/YY`; время — `HH:mm`, локальное время агента (`formatInteraction`).
- **Itinerary** — маршрут по кодам аэропортов/городов (`toItinerary`):

| Вариант (Figma) | Маршрут в данных | Показываем |
|---|---|---|
| One way | `CDG, LON` | `CDG → LON` |
| Round | `YYZ, LON, YYZ` — вернулся в начальную точку, 2 точки | `YYZ ⇆ LON` |
| Multi trip | `CDG, LON, JFK` и всё остальное из 3+ точек | `CDG → LON → JFK` |

## Состояния

Из Figma `4920:69057`: **Default**, **Hover**, **Active** — у History item. Hover и Active выглядят одинаково: фон `--sidebar-accent` (secondary, `#f5f5f4`).

| Состояние | Когда | Вид |
|---|---|---|
| Default | — | Без фона. Заливки нет никогда (правило пользователя, 2026-09-23) |
| Hover | Курсор над элементом | Фон `sidebar-accent` |
| Pressed | Нажатие мышью (`:active`) | Как Hover (Figma не различает) |
| Active | Открытое сейчас бронирование (`isActive`) | Как Hover, плюс `aria-current="page"` |
| Focus | Фокус с клавиатуры (`:focus-visible`) | Фон `sidebar-accent` (правило пользователя, 2026-09-23) + кольцо `sidebar-ring` 2px — кольца нет в Figma, см. open questions |

Те же Default / Hover / Pressed / Focus — у New chat, Header и Footer: одна кнопка `SidebarMenuButton` на всё.

## Decided

- **General — только New chat.** «Search in history» и «Settings» из Figma-компонента не показываем: функциональности под ними нет (решение пользователя, 2026-09-23).
- **Collapsed-вариант — не сейчас.** Есть в Figma, не приоритет (решение пользователя, 2026-09-23).
- **Клики пока ничего не делают.** Header, New chat, History item и Footer — кнопки со всеми состояниями, но поведения под ними нет (решение пользователя, 2026-09-23). Компонент принимает обработчики (`onBrandClick`, `onNewChat`, `onSelect`, `onUserClick`), экран их пока не передаёт. Не придумывать поведение без решения product.
- **Порядок History** — как отдаёт источник (последнее действие сверху). Компонент не сортирует.
- **Данные History — через интерфейс `BookingHistory`** (`src/lib/booking-history.ts`), mock — `src/mocks/booking-history.mock.ts`. Реальный API заменит одну реализацию.
- **Шрифт History item — Roboto Mono.** В Figma дата набрана IBM Plex Mono, остальное — Roboto Mono (переменная `Fonts/Font Mono`). Используем переменную: один mono-шрифт.
- **Заливка `sidebar-accent` — только у Hover, Pressed, Focus и Active; у Default её нет** (Figma `4920:69057` + правило пользователя, 2026-09-23). Story `Default` не кликает по элементу: клик оставляет элемент в focus/hover, и story показывала бы заливку. Клики проверяют отдельные stories (`SelectsOnClick`, `Clicks`); `Default` проверяет, что фон прозрачный.

## Решения и gotchas

Перенесены из `CLAUDE.md` 2026-09-24: относятся только к App Sidebar. Формат: решение → почему → что сломается, если отменить. Остальные решения по sidebar — в «Decided» выше.

- **App Sidebar — по стандарту shadcn Sidebar, примитив написан вручную** (2026-09-23). `src/components/ui/sidebar.tsx` повторяет имена частей и разметку shadcn (`data-sidebar`), но только нужное подмножество: registry shadcn недоступен из среды. Полный shadcn можно подставить без изменения `AppSidebar`. Если переименовать части или разметку, подстановка полного shadcn перестанет быть заменой одного файла.
- **Состояния Hover / Pressed / Focus в Storybook форсируются `storybook-addon-pseudo-states`** (`parameters.pseudo`, 2026-09-23). Так каждое состояние из Figma видно отдельной story без наведения мышью. Правило заливки для этих состояний — в «Decided». Если убрать addon, stories Hover / Pressed / Focus покажут Default, и review состояний станет невозможен.
- **Заливку Hover / Pressed / Focus тесты проверяют по CSS-правилу, а не по цвету на экране** (2026-09-24). Под `npm test` addon pseudo-states не работает: он включается событиями Storybook UI, которых в тестах нет, и цвет остаётся прозрачным. Поэтому `expectAccentFillOn` (`src/components/skydesk/app-sidebar/story-checks.ts`) проверяет, что в стилях есть правило `:hover` / `:active` / `:focus-visible` с `sidebar-accent`, которое применяется к кнопке. Active — атрибут, а не псевдокласс, его проверяет реальный цвет (`expectAccentFill`). Проверено: если убрать `hover:` или `focus-visible:` заливку из `sidebar.tsx`, падают ровно эти stories. Если снова проверять computed-цвет в pseudo-stories, тесты будут падать всегда, хотя в Storybook UI всё верно.

## Deliberately dropped

- Collapsed-вариант, Search in history, Settings — см. выше.
- Мобильный off-canvas из shadcn Sidebar (`Sheet`) — Skydesk desktop-only, в Figma его нет.
- `font-medium` у активного пункта из стандартного shadcn — в Figma Active не жирный.

## Состояния и адреса

| Что | Где |
|---|---|
| Sidebar на экране | `/` — PNR Search, слева |
| Весь sidebar: Default, Active item, Empty history, Long history | Storybook → Skydesk / App Sidebar |
| History item: Default / Hover / Pressed / Focus / Active × One way / Round / Multi trip | Storybook → Skydesk / App Sidebar / History Item |
| Header, New chat, Footer: Default / Hover / Pressed / Focus | Storybook → Skydesk / App Sidebar / Parts |

Active в приложении — на странице Booking: History item открытого бронирования (`?page=booking&pnr=BBV14Q`, решение 2026-09-25, `projects/booking-overview/README.md`). Hover по адресу не открывается.

## Open questions

См. `docs/open-questions.md`, раздел «App Sidebar».
