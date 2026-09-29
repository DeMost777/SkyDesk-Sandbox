# Widget: Overview

> Flow doc виджета. Источник требований — `sources/overview-widget-spec-v1.md` (V1, от пользователя). Updated: 2026-09-29. Phase: **coverage**. Виджет **экспериментальный**: карточки Pricing / Ticket / «No document» ещё не утверждены командой.

**Principle:** показывать сущности и статусы, которые реально есть в бронировании, и не придумывать аналитических состояний. Статус принадлежит сущности, а не ячейке. Виджет не оценивает бронирование.

## Job

Сопоставить Pricing и Tickets с каждым `Passenger × Segment` без ручной сверки разных частей Booking Overview. Показать историю документов (в том числе старые Voided / Ticketed / Inactive) и дать перейти к нужной сущности.

## Terms

| Термин | Значение |
|---|---|
| Pricing | Оценка: расчёт стоимости для одного или нескольких пассажиров. Агент превращает её в Ticket |
| Ticket | Выписанный билет: подтверждённый документ, по которому пассажир летит. Билет уже куплен |
| Segment | Один перелёт `A → B` (`S1`, `S2`…), часть Itinerary |
| Passenger type | `ADT` (adult), `CHD` (child), `INF` (infant) |
| Document | Pricing или Ticket в ячейке. «No document» — ячейка без видимых Documents |
| Coverage | К каким пассажирам и сегментам относится сущность |

## Decided

Решения из спецификации V1 (кратко; полный текст — в `sources/`):
- Строки — сегменты в порядке маршрута; колонки — пассажиры в порядке PNR; ячейка — один `Passenger × Segment`.
- Внутри ячейки Documents идут от старого к новому: Pricing по `createdAt`, Ticket по `issuedAt`. При равных временах порядок стабильный (см. «Open questions»).
- Pricing `Active` и Ticket `Active` — без бейджа. Остальные статусы — бейдж справа.
- Pricing `Deleted` не показывается совсем. `Voided` Ticket, `Ticketed` и `Inactive` Pricing остаются в истории.
- Одна сущность может стоять в нескольких ячейках (её coverage шире одной ячейки).
- Пустая ячейка — «No document».
- Клик по любой карточке ведёт к самой сущности (виджет Pricing или Ticket). Этих виджетов пока нет, поэтому клик — заглушка: вызывает `onOpen({ type, id })`, цель навигации уже точная.
- Не входят в V1: EMD, services, оплата, статусы купонов, аудит, severity, рекомендации, полные метаданные Pricing и Ticket.

Решения пользователя из обсуждения (2026-09-28 — 2026-09-29):
- **Счётчик в заголовке** — число уникальных видимых сущностей (Pricing и Ticket) в виджете. Одна сущность в нескольких ячейках считается один раз; `Deleted` не считаются. Правило — `documentCount` в `buildOverviewMatrix`.
- **Заголовок пассажира** — бейдж `P1` и отдельным текстом тип `ADT` (как в Figma), не одной строкой `P1 / ADT`.
- **Маршрут сегмента** — с длинным тире: `KBP–FRA` (как в спецификации). Если не понравится в вёрстке, заменить на дефис (Figma).
- **Дата сегмента** — с годом: `14 Jun 2026`.
- **`Itinerary changed`** — тот же нейтральный бейдж с текстом из спецификации (в Figma варианта нет).
- **Горизонтальный скролл.** Когда колонки пассажиров не помещаются в ширину виджета, таблица прокручивается по горизонтали. Минимальная ширина колонки = минимальная ширина карточки (156px) + внутренние отступы ячейки (16px) = 172px; первая колонка 140px. При максимальной ширине виджета 800px без скролла помещаются три пассажира. Скролл — по пассажирам (колонкам), не по сегментам.
- **Состояния карточки:** Default, Hover, Focus. Pressed выглядит как Hover; Disabled нет (карточка показывает факт, а не действие). В Figma есть Default и Hover для Ticket и Pricing и Focus для Ticket.
- **Hover** — карточку целиком закрывает светлое покрытие с текстом «See widget» и иконкой перехода. Содержимое скрыто.
- **Focus (клавиатура)** — двойное кольцо как в Figma (эффект «Focus ring»): белый зазор 2px + кольцо 2px, но полоса **`gray-500` `#6b7280`**, а не `gray-400` из Figma (решение пользователя, 2026-09-29). Причина — контраст: `gray-400` даёт 2.54:1 на белом, ниже 3:1 (WCAG 1.4.11); `gray-500` — 4.83:1 на белом и 3.85:1 на stone-200. Стиль «Focus ring» в Figma уже обновлён на Gray/500 (проверено 2026-09-30, узел `8013:11314`). Отдельный токен, `--ring` остальных компонентов остаётся teal. Figma показывает Focus только для Ticket; для Pricing применяем то же.
- **Типы пассажиров в mock:** ADT, CHD и INF.
- **Тестовые данные из Figma не используются** (там `S3` дважды и один маршрут во всех строках) — только сценарии из `src/mocks/bookings/`.

**Stories** (решение пользователя, 2026-09-28): в Storybook документируется только табличная основа (`MatrixTable`: заголовок колонки, ячейка сегмента, общая ячейка) — она будет использоваться в другом виджете. Карточки Pricing, Ticket, «No document» и сам виджет **без stories**, пока команда не даст фидбек: иначе придётся переделывать. Это осознанное исключение из правила 10 (CLAUDE.md). Состояния карточек проверяются на странице Booking Overview и тестами `overview-matrix.test.ts`. Когда карточки утвердят — отдельная задача: stories с описанием состояний, тестами на поведение, а не на пиксели.

## Data

Модель — `src/lib/booking.ts`:

```
Booking { pnr, gds, creationOffice, createdAt, passengers[], segments[], pricings[], tickets[] }
Passenger { ref: 'P1', type: 'ADT'|'CHD'|'INF', name }
Segment { ref: 'S1', from, to, departureDate, flightNumber }
Pricing { id, status, createdAt, coverage }
Ticket { id, number, status, issuedAt, coverage }
Coverage { passengers: ['P1', …], segments: ['S1', …] }
```

Сущности хранятся так, как их отдаёт backend: одна сущность и её coverage. Ячейки матрицы выводит `buildOverviewMatrix(booking)` (`src/lib/overview-matrix.ts`): берёт Pricing и Ticket, покрывающие пассажира и сегмент, убирает `Deleted`, приводит к общему виду, сортирует по времени, пустой список = «No document».

## Mock scenarios

Каждый — отдельный файл в `src/mocks/bookings/`. PNR детерминированные. Тест `booking.test.ts` проверяет согласованность каждого (ссылки на пассажиров и сегменты, уникальные id и номера билетов).

| PNR | GDS | Что проверяет |
|---|---|---|
| `BBV14Q` | Sabre | Эталон из спецификации: ячейка Inactive → Ticketed → Voided Ticket → Active Ticket; Deleted; «No document»; 3 пассажира (ADT, ADT, CHD); Multi trip |
| `7JRWT4` | Amadeus | Ticketed: у каждого пассажира Pricing `Ticketed` и Active Ticket; 2 сегмента, Multi trip |
| `K2M9QP` | Sabre | Pricing only: один пассажир, One way, без билетов, без бейджей |
| `ABC123` | Galileo | Repricing: Pricing `Inactive`, затем `Active`; GDS новая для Skydesk (сценарий GDS Required) |
| `PRC5TS` | Amadeus | Все статусы Pricing: Active, Ticketed, Unknown, Reprice required, Itinerary changed, Inactive |
| `CVR4GE` | Galileo | Coverage: один Ticket на нескольких сегментах; пассажиры ADT, CHD, INF |
| `DEL3T3` | Amadeus | Deleted Pricing скрыт; если он был единственным — «No document»; Round |
| `TIE5AM` | Sabre | Одинаковое время у нескольких документов: порядок не меняется между рендерами |
| `WIDE55` | Sabre | 5 пассажиров × 4 сегмента, Multi trip: горизонтальный скролл и плотность |

`SCENARIO_PNRS` в `src/mocks/pnr-search.mock.ts` (сценарии PNR Search) не менялись: `7JRWT4`, `K2M9QP`, `ABC123` сохранили пассажиров, маршрут, Office и даты.

## Not chosen

- Даты как `Date` в модели: Booking хранится как JSON, как отдаёт backend; в `Date` превращает только `lib`.
- `navigationTarget: string` из псевдокода спецификации: заменён на `{ type, id }` — точная цель, из которой потом строится адрес.
- Один общий статус ячейки: спецификация запрещает (п. 3).
- Stories для карточек сейчас: см. «Stories».

## Known gaps

- UI виджета: `MatrixTable`, карточки, заголовок-аккордеон, страница (ROADMAP 2.1, 3.1).
- Токены карточек из Figma (Neutral, Orange, Blue, Amber, кольцо Focus): в палитре есть, семантических токенов ещё нет. Создаются в 3.1.
- Что открывает клик: виджетов Pricing и Ticket нет — заглушка.

## Open questions

- **Порядок при одинаковом времени.** Спецификация: «стабильный порядок от backend». Сейчас: порядок в ответе — сначала Pricing, затем Tickets, внутри — как в массиве. Нужно подтверждение backend.
- **Hover-текст «See widget».** В спецификации — «open the corresponding entity». Сейчас: текст из Figma.
- **Числа в Figma.** Бейдж `4` в макете — при трёх пассажирах и четырёх строках; правило подсчёта выше взято из ответа пользователя, пример в Figma его не подтверждает.
- **Название токенов** карточек (`pricing-…`, `ticket-…`) в Figma не заданы — выберем сами (как open question #15).
- **Hover у Ticket.** Figma: бейдж «Voided» в Default и «Void» в Hover; берём «Voided».
- **Pressed** совпадает с Hover — подтвердить, когда команда посмотрит.
