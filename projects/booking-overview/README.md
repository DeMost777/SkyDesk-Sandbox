# Flow: Booking Overview

> Flow doc. Читать до кода, обновлять в том же изменении, что и поведение.
> Updated: 2026-09-25. Phase: **coverage** (см. CLAUDE.md → «Фаза»).

**Principle:** агент открыл PNR — и сразу видит бронирование. Экран показывает, что есть в бронировании, и не просит агента ничего выбирать: GDS и Office уже определил PNR Search.

## Job

Агент нашёл PNR и хочет понять, что в бронировании, и что-то с ним сделать. Сверху — короткий обзор (PNR, GDS, пассажиры, когда создано), ниже — виджеты бронирования, справа (позже) — чат для вопросов и действий.

Путь: `PNR → Booking` (PNR Search → этот экран).

## Источники

| Что | Где |
|---|---|
| Экран первой итерации: App Sidebar + Header + вкладка «Booking Overview», зона виджетов пустая | Figma `7994:305661` + скриншот пользователя, 2026-09-25 |
| Header | Figma `308:12504` |
| Вкладка «Booking Overview» — компонент Tabs | Figma `5123:368550` (внутри `7994:305664` «Widgets overview») |
| Конечный вид: виджеты-аккордеоны и чат справа — **только для планирования** | Figma `4678:125394` + скриншот пользователя, 2026-09-25 |
| План и решения первой итерации | Решения пользователя, 2026-09-25 (ответы на вопросы 1–5 плана) |

## Итерации

| Итерация | Что на экране | ROADMAP |
|---|---|---|
| **1 — каркас (сейчас)** | Header, вкладка «Booking Overview», пустая зона виджетов | 2.1–2.4, 2.6; 2.5 — после утверждения PNR Search |
| 2 — виджеты | Контракт виджета (аккордеон, счётчик), затем виджеты по одному | Фаза 3 |
| 3 — чат | Панель чата справа, AI-действия | Фаза 4 |

## Анатомия (итерация 1)

```
┌──────────┬───────────────────────────────────────────────────────────────┐
│          │ [◧] │ BBV14Q │ Sabre │ 👥 3 passengers │ Created: 08/10/2025 13:44   [◨] │ ← Header, 44px
│   App    ├───────────────────────────────────────────────────────────────┤
│ Sidebar  │ Booking Overview                                               │ ← Tabs, 36px
│  229px   ├───────────────────────────────────────────────────────────────┤
│          │                                                               │
│          │            зона виджетов — колонка, виджеты друг под другом    │ ← пустая в итерации 1
│          │                                                               │
└──────────┴───────────────────────────────────────────────────────────────┘
```

### Header (Figma `308:12504`)

Слева направо, между элементами — вертикальный разделитель 16px:

| Элемент | Пример | Откуда |
|---|---|---|
| Кнопка sidebar (иконка 28×28) | ◧ | — |
| PNR | `BBV14Q` | `booking.pnr` |
| GDS — полное название | `Sabre` | `booking.gds` |
| Иконка Users + число пассажиров | `3 passengers`, `1 passenger` | `booking.passengers.length` |
| Дата и время создания | `Created: 08/10/2025` + `13:44` мельче | `booking.createdAt` |
| Справа: кнопка панели (иконка 28×28) | ◨ | — |

Скрыто в Figma и **не показываем**: «Time Limit: 12 OCT 13:44», кнопка Primary. Иконка часов справа есть только в конечном виде — не показываем.

**Компонент** — `src/components/skydesk/booking-header/` (`BookingHeader`, props: `booking`, `onToggleSidebar`, `onTogglePanel`). Stories — `Skydesk / Booking Header`.

| Что | Figma | В коде |
|---|---|---|
| Высота, отступы | 44px, 16 / 8 | `h-11 px-4 py-2` |
| Фон, нижняя граница, тень | background, border, `0 1px 6px rgba(0,0,0,.08)` | `bg-background border-b drop-shadow-header` (новый токен) |
| Промежуток между элементами | 16px | `gap-4` |
| Разделитель | 0×16, stroke 1px `#e2e6ed` по центру — места не занимает | `Divider`, цвет — новый токен `divider` |
| PNR | Geist Medium 16 / 20 | `text-base font-medium leading-5`, это `<h1>` страницы |
| GDS, пассажиры, «Created:» | Geist Regular 14 / 20 | `text-sm` |
| Время создания | 12 / 16, muted-foreground | `text-xs text-muted-foreground` |
| Кнопки | Button Icon 28×28, иконка 16; слева радиус 8, справа 6 | `Button variant="ghost"`, `size-7`; иконки lucide `PanelLeft`, `PanelRight`, `Users` |

Положение элементов сверено со story в Chromium: x совпадает с Figma до 1–2px (разница — отрисовка шрифта). Ширина Header — вся область, при узкой области элементы остаются в одну строку и обрезаются, кнопка панели всегда видна (story `Narrow`).

Названия кнопок для скринридера — «Toggle sidebar», «Toggle panel»: в Figma их нет, выбраны в sandbox. Hover и Focus кнопок — стандартные у shadcn `ghost` (фон `accent`); с Figma не сверены.

### Вкладка «Booking Overview»

В Figma это компонент **Tabs** с одной вкладкой. В итерации 1 — одна вкладка, всегда активна, переключать нечего. Строка вкладок — фон `secondary`, нижняя граница `border`; вкладка — `px-4 py-2`, Geist Medium 16 / 20, 168×36 (сверено в Chromium). Подчёркивания у вкладки нет — так в макете страницы (в компоненте Figma подчёркнутая primary-вкладка скрыта). Разметка — `tablist` / `tab` / `tabpanel`, локальный `BookingTabs` в `src/pages/booking/index.tsx`: общий компонент Tabs — когда вкладок станет больше одной.

### Зона виджетов

Область под вкладками — Figma «Widgets overview»: фон `secondary`, граница слева `sidebar-border`, прокручивается сама, Header и вкладка остаются на месте. Колонка виджетов в ней. В конечном виде — ширина 800px по центру области, виджеты друг под другом с отступом 16px (Figma `4678:125394`). В итерации 1 пустая: без заглушек и текста — так на скриншоте.

## Decided

- **Office в Header не показываем** (решение пользователя, 2026-09-25). Его нет ни в Figma, ни на скриншоте. Office, в котором открыто бронирование, экран знает (он пришёл из PNR Search) — просто не выводит. Вопрос — open question #22.
- **Дата создания — `DD/MM/YYYY`, время — `HH:mm`** (решение пользователя, 2026-09-25). Тот же порядок день/месяц, что в History. Порядок в Figma из примера не виден — open question #23. Время показываем как есть, без перевода в часовой пояс — в каком поясе оно (агента или Office), open question #27.
- **Число пассажиров — с согласованием: `1 passenger`, `N passengers`.** Figma показывает только множественное.
- **Кнопки Header пока ничего не делают** (решение пользователя, 2026-09-25) — как клики в App Sidebar (open question #21). Кнопки со всеми состояниями, поведения нет.
- **Found → Booking сразу, без промежуточного экрана** (решение пользователя, 2026-09-25). Успешный поиск открывает Booking; заглушка Found в PNR Search удаляется. Следует из принципа `PNR → Booking`. Куда переезжает предложение сохранить Default Office — open question #24.
- **Пока команда утверждает PNR Search, поиск не переходит в Booking** (решение пользователя, 2026-09-25). Found остаётся заглушкой «Opening … in …», чтобы прокликать все состояния поиска, включая Found. Переход Found → Booking (задача 2.5) — после утверждения поиска. В Booking до тех пор ведут ссылка «Booking» в верхней навигации sandbox и адрес `?page=booking&pnr=…`.
- **Sidebar в Booking не ведёт** (решение пользователя, 2026-09-25): клики в sidebar по-прежнему без действия (open question #21). Отброшены: кликабельный только `BBV14Q` и mock-бронирования для всех PNR из History.
- **App Sidebar — тот же компонент, что на PNR Search.** Если открытое бронирование есть в History, его History item — Active (`isActive`, состояние уже описано в `projects/app-sidebar/README.md`). History при открытии бронирования не меняется — open question #25.
- **Mock-данные бронирования привязаны к PNR** (решение пользователя, 2026-09-25). Каждый PNR, который PNR Search находит, открывает своё бронирование. Добавляется `BBV14Q` из Figma — он уже есть в History, данные согласованы с ним.
- **Модель Booking растёт вместе с виджетами.** В итерации 1 — только поля Header. Поля виджетов добавляются в задаче виджета, не заранее: иначе модель придумывается без Figma.
- **Логика — в `src/lib/booking.ts`, данные — через интерфейс** (как `PnrDirectory` у PNR Search). Интерфейс `BookingDirectory` (`get(pnr, gds)`), форматтеры `passengerCountLabel` и `formatCreated`. Экран вызывает их, реальный API заменит одну реализацию `BookingDirectory`.

## Mock-бронирования

Одно бронирование на каждый PNR, который находит PNR Search; среди них `BBV14Q` из Figma. PNR и GDS `BBV14Q` совпадают с его History item (`src/mocks/booking-history.mock.ts`).

| PNR | GDS | Creation office | Пассажиры | Created | Откуда значения |
|---|---|---|---|---|---|
| `BBV14Q` | Sabre | `D4M5` | 3 | 08/10/2025 13:44 | Figma; Creation office и дата вылета — sandbox. Имена — первые три пассажира виджета Passengers в Figma `4678:125394`, титулы как в Figma |
| `7JRWT4` | Amadeus | `B3R7` | 2 | 02/09/2026 09:15 | Mock PNR Search; дата — sandbox |
| `K2M9QP` | Sabre | `7MTR` | 1 | 14/09/2026 16:30 | Mock PNR Search; дата — sandbox |
| `ABC123` | Galileo | `C1Z2` | 1 | 27/08/2026 11:05 | Mock PNR Search; дата — sandbox |

`BBV14Q` Skydesk знает (он в History) — поиск находит его в Sabre без шага GDS Required; с persona `agent-with-defaults` — через Default Office `5GW5`.

**Один источник данных.** PNR, GDS, Creation office и пассажиры берутся из `MOCK_BOOKINGS` (`src/mocks/pnr-search.mock.ts`) — то, что нашёл поиск. `src/mocks/bookings.mock.ts` добавляет к ним только поля Booking (дату создания). Поэтому результат поиска и открытое бронирование не расходятся; тест `src/lib/booking.test.ts` это проверяет.

## Scenarios

| # | Сценарий | Путь |
|---|---|---|
| A | Агент открывает PNR | PNR Search → **Booking** (успешный поиск сразу открывает Booking — после 2.5; пока Found — заглушка) |
| B | Агент открывает бронирование по ссылке (review, Slack) | Адрес `?page=booking&pnr=…` → **Booking** |
| C | Ссылка на PNR, который не находится | Адрес `?page=booking&pnr=XYZ789` → PNR Search с результатом поиска (Not Found / Error) |

## States and how to reach them

Параметры `persona`, `pnr`, `office`, `gds` — те же, что у PNR Search (`projects/pnr-search/README.md` → «Параметры адреса»): Booking открывается функцией `openBooking` (`src/lib/booking.ts`), она вызывает тот же `searchPnr`, поэтому Office и GDS выбираются по тем же правилам. В верхней навигации sandbox ссылка «Booking» открывает `BBV14Q`. Stories — `Pages / booking`, по одной на адрес.

| State | Address | Status |
|---|---|---|
| Booking — Sabre, 3 passengers (Figma) | `?page=booking&pnr=BBV14Q` | ✅ |
| Booking — 1 passenger | `?page=booking&pnr=K2M9QP` | ✅ |
| Booking — через выбранный Office | `?page=booking&pnr=7JRWT4&office=E6T8` | ✅ |
| Booking — после GDS Required | `?page=booking&pnr=ABC123&gds=Galileo` | ✅ |
| Booking — через Creation office | `?page=booking&persona=agent-no-defaults&pnr=BBV14Q` | ✅ (на экране не отличается: Office в Header нет) |
| Переход из PNR Search | `?pnr=BBV14Q` → Search | ⏸ отложен до утверждения PNR Search (2.5); сейчас — заглушка Found |
| Ссылка на PNR, который не открывается → PNR Search | `?page=booking&pnr=XYZ789&gds=Sabre` → Not Found; `?page=booking&pnr=ABC123` → GDS Required; `?page=booking` → PNR Required; `?page=booking&pnr=ERR000` → Error | ✅ адрес заменяется на `?…&state=result`, «Назад» не возвращает на Booking |

## Решения и gotchas

- **Бронирование, которое не открывается, уходит в PNR Search по тому же адресу** (2026-09-25). `openBooking` возвращает `not-opened` с результатом поиска; страница заменяет адрес на `page=pnr-search&…&state=result` через `redirect` (`replaceState`, «Назад» не возвращает на Booking). Так Booking не рисует своих Not Found / Error без Figma. Если показывать ошибку на странице Booking, появится второй, несогласованный вариант этих состояний.
- **Логика открытия — `openBooking` в `src/lib/booking.ts`, не в экране.** Он вызывает `searchPnr`, поэтому Office и GDS выбираются по правилам PNR Search, а не повторяются в странице.

## Deliberately dropped

- **Office в Header.** Нет в Figma (см. Decided).
- **Промежуточный экран Found.** Лишний шаг между PNR и Booking.
- **Свой экран «бронирование не найдено» на странице Booking.** Для этого уже есть Not Found и Error в PNR Search — ссылка на ненайденный PNR ведёт туда, а не рисует новое состояние без Figma.
- **Полная модель Booking заранее** (сегменты, билеты, сервисы). Появится вместе с виджетами.
- **Loading на странице Booking.** Mock отвечает сразу; Loading уже есть в PNR Search перед переходом. Появится, если у Booking будет своя загрузка.

## Известное о конечном виде (для планирования, не делать сейчас)

Из Figma `4678:125394`:
- Виджеты по порядку: Passengers, Segments (заголовок «Flight information»), Ticket, Services, EMD, Remarks, Messages, Contacts. У каждого — аккордеон со счётчиком справа.
- Чат (Dialog) справа, 362px, во всю высоту под Header. Кнопка ◨ в Header, видимо, открывает и закрывает его.
- Header: справа появляется иконка часов, в Figma скрыт Time Limit.

## Known gaps (coverage)

Итерация 1: модель и mock-данные (2.2), Header (2.3), страница по адресу (2.4) готовы. Нет перехода из PNR Search — отложен решением пользователя до утверждения поиска (2.5). В Booking ведут навигация sandbox и адрес.

## Open questions

См. `docs/open-questions.md`, раздел «Booking Overview»: #22–#27.

## Test cases

`src/lib/booking.test.ts`: число пассажиров, формат даты создания, каждый найденный поиском PNR открывает согласованное бронирование с датой создания, `BBV14Q` совпадает с Figma. `src/lib/pnr-search.test.ts`: поиск находит `BBV14Q` в Sabre через Default Office `5GW5`. Stories Header (`booking-header.stories.tsx`): текст и высота 44px, Office не показан, `1 passenger`, кнопки вызывают обработчики, узкая область. Stories страницы (`src/pages/booking/booking.stories.tsx`): Header, выбранная вкладка, пустая зона виджетов, Active item в History. `src/lib/booking.test.ts` → `openBooking`: Default Office, Creation office, выбранный Office, GDS Required, всё, что не открывается. Перенаправление в PNR Search проверено в браузере (Storybook его не проверяет: оно меняет адрес страницы). Ручная проверка — `docs/testing-plan.md` → «Booking».
