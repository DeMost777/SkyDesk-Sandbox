# APPLICATION.md — что есть в sandbox

> Карта приложения: экраны, адреса состояний, personas, mock-данные. Updated: 2026-09-23.
> Продуктовый контекст и правила — `CLAUDE.md`. Поведение каждого flow — его flow doc.

## Экраны

| Page | Адрес | Flow doc | Код |
|---|---|---|---|
| PNR Search | `/` или `?page=pnr-search` | `projects/pnr-search/README.md` | `src/pages/pnr-search/` |
| Office Selector — все состояния | `?page=office-selector` | — (витрина компонента до Storybook) | `src/pages/office-selector-showcase/` |

## Адреса состояний

Каждое состояние открывается по ссылке — её можно отправить в Slack или на review. URL всегда совпадает с тем, что на экране: после любого поиска его можно просто скопировать.

| Параметр | Значения | Что задаёт |
|---|---|---|
| `page` | `pnr-search` (по умолчанию), `office-selector` | Экран |
| `persona` | `agent-with-defaults` (по умолчанию), `agent-no-defaults` | Кто смотрит (см. ниже) |
| `pnr` | любой PNR | Значение в поле поиска |
| `office` | код Office из `src/mocks/offices.mock.ts` | Office, выбранный вручную |
| `gds` | `Amadeus`, `Sabre`, `Galileo` | GDS, выбранная на шаге GDS Required (или повторно после Not Found) |
| `tried` | GDS через запятую: `Amadeus,Sabre` | GDS, где PNR уже искали до `gds` в этой попытке — для состояний Not Found |
| `state` | `idle` (по умолчанию), `loading`, `result` | `result` — сразу выполнить поиск и показать итог; `loading` — зафиксировать индикатор загрузки |

Состояния-результаты не «рисуются» флагом — их выдаёт настоящая функция `searchPnr` на mock-данных. Поэтому адрес сам по себе проверяет логику.

Готовые адреса для PNR Search — в flow doc, раздел «States and how to reach them». Они же — кнопки панели «State» в sandbox.

Код адресов помечен `SANDBOX-ONLY` (`src/lib/sandbox-url.ts`, `src/hooks/use-sandbox-url.ts`, `src/pages/pnr-search/components/sandbox-bar.tsx`), чтобы удалить его одним проходом при переносе в production.

## Personas

| Persona | Default Offices | Для чего |
|---|---|---|
| `agent-with-defaults` | Amadeus `A2K9`, Sabre `5GW5`, Galileo `Q8L3` | Сценарии A, B, C |
| `agent-no-defaults` | нет | Сценарий D: открытие через Creation office |

Сохранённые в sandbox Default Offices хранятся в localStorage отдельно для каждой persona. «Reset demo data» в панели sandbox возвращает исходные значения.

## Mock PNR

Данные детерминированные: фиксированные PNR, даты и Office. Источник — `src/mocks/pnr-search.mock.ts`.

| PNR | Где существует | Creation office | Skydesk знает GDS? | Итог поиска без контекста |
|---|---|---|---|---|
| `7JRWT4` | Amadeus | `B3R7` | да | Found |
| `K2M9QP` | Sabre | `7MTR` | да | Found |
| `ABC123` | Galileo | `C1Z2` | нет | GDS Required → Galileo → Found |
| `XYZ789` | нигде | — | нет | GDS Required → Not Found в каждой GDS → «not found in any GDS» |
| `ERR000` | — (сбой GDS) | — | да, Amadeus | Error |

## Слои кода

| Слой | Где | Что внутри |
|---|---|---|
| Домен | `src/lib/office.ts`, `src/lib/pnr-search.ts` | Типы и правила. Чистые функции, без React, с тестами рядом |
| Данные | `src/mocks/` | Mock-реализация `PnrDirectory`, Office, personas |
| Состояние | `src/hooks/` | Default Offices (localStorage), адрес sandbox |
| Экран | `src/pages/<flow>/` | UI; локальные компоненты — в `components/` |
