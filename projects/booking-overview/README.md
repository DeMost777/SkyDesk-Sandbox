# Flow: Booking Overview

> Flow doc. Read it before the code; update it in the same change as the behavior.
> Updated: 2026-09-29. Phase: **coverage** (see CLAUDE.md → «Фаза»). Статус: каркас не построен (ROADMAP 2.1), есть модель и mock-данные (1.11).

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

**Виджет** — секция с заголовком-аккордеоном (chevron, название, бейдж со счётчиком). Развёрнут по умолчанию (пользователь, 2026-09-29).

**Один Booking — источник для всех.** Ввод PNR, History, шапка и виджеты читают одно и то же бронирование (`src/mocks/bookings/`). Модель — `src/lib/booking.ts`. Виджеты не хранят своих данных, а получают Booking и выводят из него своё представление (для Overview — `buildOverviewMatrix`).

**History остаётся декоративной** (пользователь, 2026-09-29): 11 PNR из sidebar не открываются как Booking, кроме `BBV14Q`, который есть и в History, и среди сценариев. Расхождение: History показывает `CDG → LON → JFK`, а Booking `BBV14Q` — `CDG → LHR → JFK`. Когда появится дизайн перехода History → Booking, History выводим из Booking.

**Тёмная тема не трогается** (пользователь, 2026-09-29): токены остаются, но в Booking Overview её не проверяем и не показываем.

## Widgets

| Виджет | Flow doc | Статус |
|---|---|---|
| Overview | `overview-widget.md` | модель и mock готовы, UI — ROADMAP 3.1 |
| Passengers, Flight information, Tickets, Pricing, Services, Remarks | — | не начаты |

## Not chosen

- Хранить данные матрицы отдельно от Booking: разойдутся с остальными виджетами.
- Скрывать Pricing, когда есть Ticket: они не исключают друг друга (спецификация Overview, п. 15).

## States and how to reach them

Страницы пока нет (ROADMAP 2.1). Адрес: `?page=booking-overview&pnr=<PNR>` — PNR из таблицы сценариев в `overview-widget.md`.

## Known gaps

- Страница, шапка, зона виджетов, переход Found → Booking (open question #3).
- Ширина зоны при узком окне и появление чата справа.

## Open questions

- Что показывает шапка, когда у бронирования нет `createdAt`/пассажиров — в Figma только полный случай.
- Счётчики в левой рейке Figma (`2 Passengers`, `4 Flights`, `2 Tickets`…) — это отдельная навигация Booking Overview или часть sidebar? Не входит в 1.11.
