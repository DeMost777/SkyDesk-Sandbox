# Flow: Booking Overview

> Flow doc. Read it before the code; update it in the same change as the behavior.
> Updated: 2026-09-30. Phase: **coverage** (see CLAUDE.md → «Фаза»). Статус: каркас (2.1), модель и mock-данные (1.11), виджет Overview (3.1) построены. Остальные виджеты — дальше.

**Principle:** агент открывает бронирование и видит его целиком — виджеты, каждый со своей частью PNR. Skydesk показывает факты, а не оценивает бронирование.

## Job

Агент нашёл PNR (flow PNR Search) и открыл Booking. Booking Overview — страница, на которой бронирование раскладывается на виджеты: Overview, Passengers, Flight information, Tickets, Pricing, Services, Remarks. Агент по ним понимает состояние бронирования и переходит к нужной сущности.

## Decided

**Названия** (решение пользователя, 2026-09-29): **Booking Overview** — экран, который открывается по PNR. **Overview** — первый виджет на нём. Слово «Overview» без уточнения относится к виджету.

**Раскладка экрана** (пользователь, 2026-09-29; Figma `8014:11324`):
- слева App Sidebar (`projects/app-sidebar/`);
- сверху панель информации о бронировании: `PNR · GDS · пассажиры · Created` (в Figma: `BBV14Q | Sabre | 3 passengers | Created: 08/10/2025 13:44`);
- справа будет чат (Фаза 4), пока места под него нет;
- виджеты идут вертикально в одной колонке, **по центру области Booking Overview**, **максимальная ширина виджета 800px**.

**Виджет** — секция с заголовком-аккордеоном (chevron, название, бейдж со счётчиком). Развёрнут по умолчанию (пользователь, 2026-09-29). Рамка — компонент `WidgetSection` (`src/components/skydesk/widget-section/`): вокруг 16px, снизу линия 1px, содержимое до 800px по центру (Figma `Width/Widget Max Width`), заголовок — кнопка `aria-expanded`, содержимое остаётся в DOM при сворачивании. Высота строки заголовка 36px (в Figma 36 у Overview и 32 у свёрнутых строк — взято 36).

**Шапка бронирования** — `BookingHeader` (`src/components/skydesk/booking-header/`, Figma `8014:11426`): высота 44px, снизу линия и тень `shadow-header`; слева кнопка панели, `PNR | GDS | N passengers | Created: DD/MM/YYYY HH:mm` (время мельче и серее; в местном времени агента), справа кнопки «History» и «Toggle chat». Три кнопки пока ничего не делают (как клики в sidebar, #21). Сверху PNR — `h1` страницы.

**Полоса названия** — под шапкой, 36px, фон `secondary`, снизу линия: «Booking Overview» (Figma `Tabs` `8014:11329`, одна активная вкладка; другие вкладки скрыты).

**Фон области виджетов** — `#f5f5f5` (Neutral/100, токен `page`): в Figma-узле фон не найден, значение измерено по скриншоту пользователя (2026-09-29). Шапка, sidebar и таблицы — белые.

**History в sidebar без выделенного элемента**, как на скриншоте, хотя `AppSidebar` умеет `activePnr` (см. #21).

**Один Booking — источник для всех.** Ввод PNR, History, шапка и виджеты читают одно и то же бронирование (`src/mocks/bookings/`). Модель — `src/lib/booking.ts`. Виджеты не хранят своих данных, а получают Booking и выводят из него своё представление (для Overview — `buildOverviewMatrix`).

**History остаётся декоративной** (пользователь, 2026-09-29): 11 PNR из sidebar не открываются как Booking, кроме `BBV14Q`, который есть и в History, и среди сценариев. Расхождение: History показывает `CDG → LON → JFK`, а Booking `BBV14Q` — `CDG → LHR → JFK`. Когда появится дизайн перехода History → Booking, History выводим из Booking.

**Тёмная тема не трогается** (пользователь, 2026-09-29): токены остаются, но в Booking Overview её не проверяем и не показываем.

## Widgets

| Виджет | Flow doc | Статус |
|---|---|---|
| Overview | `overview-widget.md` | построен (ROADMAP 3.1): матрица, карточки, скролл; карточки без stories, ждут фидбека команды |
| Passengers, Flight information, Tickets, Pricing, Services, Remarks | — | не начаты |

## Not chosen

- Хранить данные матрицы отдельно от Booking: разойдутся с остальными виджетами.
- Скрывать Pricing, когда есть Ticket: они не исключают друг друга (спецификация Overview, п. 15).

## States and how to reach them

Адрес: `?page=booking-overview&pnr=<PNR>`, PNR — из таблицы сценариев в `overview-widget.md`. Верхняя навигация sandbox → «Booking Overview» открывает `BBV14Q`. Панель «Booking» над шапкой переключает между девятью сценариями (у каждой кнопки в подсказке — что проверяет сценарий).

| Состояние | Адрес |
|---|---|
| Booking открыт | `?page=booking-overview&pnr=BBV14Q` (любой PNR из сценариев) |
| Один пассажир: «1 passenger» | `?page=booking-overview&pnr=K2M9QP` |
| Широкая матрица (для 3.1) | `?page=booking-overview&pnr=WIDE55` |
| Из PNR Search | `/` → PNR → Found → ссылка «Open booking» |
| Нет booking по PNR / нет PNR | `?page=booking-overview&pnr=XYZ789` или без `pnr` — сообщение «No mock booking…» (только в sandbox: в продукте Booking приходит из PNR Search, дизайна состояния нет и не нужно) |
| Виджет свёрнут | клик по заголовку «Overview» |
| Горизонтальный скролл колонок пассажиров | `?page=booking-overview&pnr=WIDE55` (5 пассажиров) |
| Все статусы Pricing | `?page=booking-overview&pnr=PRC5TS` |

Storybook: Pages / booking-overview (те же адреса), Skydesk / Booking Header, Skydesk / Widget Section.

Виджет Overview показывает матрицу Passenger × Segment по выбранному сценарию; клик по карточке пишет под виджетом «Sandbox: would open pricing PR-1 …».

## Known gaps

- Дизайн перехода PNR Search → Booking (open question #3): сейчас ссылка «Open booking» в строке Found (решение пользователя, 2026-09-30) и адрес.
- Левая рейка иконок со счётчиками (Figma `Toolbar` `8014:11327`: Passengers, Flights, Tickets, Services, Remarks) — не построена по решению пользователя (2026-09-30), пока design не ответит, что она делает (open question #26). В Figma её счётчики (2 / 4 / 2 / 6 / 22) не выводятся из наших mock-данных.
- Остальные виджеты страницы (Passengers, Segments, Ticket, Pricing, Services, EMD, Remarks, Messages, Contacts) — в Figma есть, у нас нет.
- Чат справа (Фаза 4): места под него в раскладке пока нет.
- Узкое окно: проверено 1440, 1024, 800 — прокрутки нет, виджет сужается с отступом 16px. Уже ~700px шапка обрезает «Created», потому что sidebar не сворачивается (кнопка панели inert).
- Поведение трёх кнопок шапки (open question #28).

## Open questions

- Что показывает шапка, когда у бронирования нет `createdAt`/пассажиров — в Figma только полный случай.
- Счётчики в левой рейке Figma (`2 Passengers`, `4 Flights`, `2 Tickets`…) — это отдельная навигация Booking Overview или часть sidebar? Не входит в 1.11.
