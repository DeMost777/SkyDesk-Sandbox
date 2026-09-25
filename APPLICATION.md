# APPLICATION.md — что есть в sandbox

> Карта приложения: экраны, Storybook, personas, mock-данные. Updated: 2026-09-25.
> Продуктовый контекст и правила — `CLAUDE.md`. Поведение каждого flow — его flow doc.

## Экраны

| Page | Адрес | Flow doc | Код |
|---|---|---|---|
| PNR Search | `/` или `?page=pnr-search` | `projects/pnr-search/README.md` | `src/pages/pnr-search/` |
| Booking | `?page=booking&pnr=BBV14Q` (ссылка «Booking» в верхней навигации) | `projects/booking-overview/README.md` | `src/pages/booking/` |

Слева на экране — **App Sidebar** (flow doc `projects/app-sidebar/README.md`, код `src/components/skydesk/app-sidebar/`). Клики в нём пока ничего не делают. На странице Booking History item открытого бронирования — Active.

## Storybook

- На Vercel: `<ссылка preview>/storybook/` (ссылка «Storybook» в верхней навигации приложения).
- Локально: `npm run storybook` → `http://localhost:6006`.

| Раздел | Stories |
|---|---|
| Components / ui | Button (включая `CssCheck` — проверка, что токены загрузились), Input, Badge, Dialog, Popover, Command, Office Selector |
| Skydesk / App Sidebar | Весь sidebar: Default, Active Item, Empty History, Long History. History Item: Default / Hover / Pressed / Focus / Active, One Way / Round Trip / Multi City. Parts: Header, New chat, Footer × Default / Hover / Pressed / Focus |
| Skydesk / Booking Header | Default (`BBV14Q`, как в Figma), One Passenger, Buttons, Narrow |
| Pages / booking | Default (`BBV14Q`), One Passenger, Selected Office, After GDS Required, Creation Office |
| Pages / pnr-search | Все состояния PNR Search — те же адреса, что в flow doc: Empty, PNR Required, Loading, GDS Required, Found ×3, Not Found ×3, Error ×2 |

## Адреса

Экран выбирается параметром `page` (таблица «Экраны» выше). Остальные параметры адреса и как открыть каждое состояние — в flow doc экрана:

| Экран | Где |
|---|---|
| PNR Search | `projects/pnr-search/README.md` → «States and how to reach them» |
| Booking | `projects/booking-overview/README.md` → «States and how to reach them». Те же `persona`, `pnr`, `office`, `gds`; PNR, который не открывается, уводит в PNR Search |

## Personas

| Persona | Default Offices | Для чего |
|---|---|---|
| `agent-with-defaults` | Amadeus `A2K9`, Sabre `5GW5`, Galileo `Q8L3` | Сценарии A, B, C |
| `agent-no-defaults` | нет | Сценарий D: открытие через Creation office |

Сохранённые в sandbox Default Offices хранятся в localStorage отдельно для каждой persona. «Reset demo data» в панели sandbox возвращает исходные значения.

## Mock PNR

Данные детерминированные: фиксированные PNR, даты и Office. Источник — `src/mocks/pnr-search.mock.ts`. Каждый найденный PNR открывает бронирование — `src/mocks/bookings.mock.ts` (дата создания; остальное — из того же источника). Таблица бронирований — `projects/booking-overview/README.md` → «Mock-бронирования».

| PNR | Где существует | Creation office | Skydesk знает GDS? | Итог поиска без контекста |
|---|---|---|---|---|
| `BBV14Q` | Sabre | `D4M5` | да (есть в History) | Found. Бронирование из Figma Booking Overview |
| `7JRWT4` | Amadeus | `B3R7` | да | Found |
| `K2M9QP` | Sabre | `7MTR` | да | Found. С Office `X4PD` — Error: у Office нет доступа |
| `ABC123` | Galileo | `C1Z2` | нет | GDS Required → Galileo → Found |
| `XYZ789` | нигде | — | нет | GDS Required → Not Found в каждой GDS → «not found in any GDS» |
| `ERR000` | — (сбой GDS) | — | да, Amadeus | Error: GDS недоступна. Падает всегда, повторный поиск снова даёт Error |

**Office без прав:** `X4PD` (Sabre) есть в списке Office, но не может открывать бронирования — для сценария «Error — у Office нет доступа».

## Mock History

Источник — `src/mocks/booking-history.mock.ts` (интерфейс `BookingHistory`), 11 бронирований из Figma. Первое — всегда «Today 15:12», остальные — фиксированные даты 10–12/03/26. Пользователь в footer — `src/mocks/user.mock.ts` (Alex Pupkin).

## Слои кода

| Слой | Где | Что внутри |
|---|---|---|
| Домен | `src/lib/office.ts`, `src/lib/pnr-search.ts`, `src/lib/booking-history.ts`, `src/lib/booking.ts`, `src/lib/user.ts` | Типы и правила. Чистые функции, без React, с тестами рядом |
| Данные | `src/mocks/` | Mock-реализации `PnrDirectory`, `BookingDirectory`, `BookingHistory`; Office, personas |
| Состояние | `src/hooks/` | Default Offices (localStorage), адрес sandbox |
| Компоненты | `src/components/ui/` — shadcn/ui примитивы (включая `sidebar.tsx`); `src/components/skydesk/` — компоненты Skydesk из них | UI без логики экрана |
| Экран | `src/pages/<flow>/` | UI; локальные компоненты — в `components/` |
