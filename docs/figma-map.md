# Карта Figma

> Экран или компонент → Figma node id → где это в коде и документах. Updated: 2026-09-30.
> Только узлы, записанные в коде и документах. «—» — в источниках узла нет: не выдумывать, спросить или записать в `docs/open-questions.md`.
> Как читать узел — субагент `figma-reader` (`.claude/agents/figma-reader.md`): ему нужны файл и node id. Источники истины при расхождении — `CLAUDE.md` → «Источники истины».

## Файлы

| Файл Figma | Что в нём | file key |
|---|---|---|
| Skydesk (экраны и компоненты) | экраны, Menu_Sidebar, виджеты Booking Overview | — (не записан в репозитории, вопрос #29) |
| shadcn kit - Trava | Foundations: Primitives (палитра), Color (семантические токены), Fonts, Icons; Components / ui | — (не записан, вопрос #29) |

## Экраны

| Экран | Node | Код | Flow doc |
|---|---|---|---|
| PNR Search (sidebar слева, поиск справа) | `7936:79314` | `src/pages/pnr-search/` | `projects/pnr-search/README.md` |
| Booking Overview | `8014:11324` | `src/pages/booking-overview/` | `projects/booking-overview/README.md` |

## Части экрана Booking Overview

| Часть | Node | Код | Статус |
|---|---|---|---|
| Полоса названия (`Tabs`) | `8014:11329` | `src/pages/booking-overview/index.tsx` | построена |
| Левая рейка (`Toolbar`) | `8014:11327` | — | не построена, вопрос #26 |

## Компоненты Skydesk

| Компонент | Node | Код |
|---|---|---|
| Menu_Sidebar (Type=Default) | `548:16649` | `skydesk/app-sidebar/` |
| History Item (Default / Hover / Active, варианты маршрута) | `4920:69057` | `skydesk/app-sidebar/history-item.tsx` |
| Booking Header | `8014:11426` | `skydesk/booking-header/` |
| Widget Section: Overview | `8014:11331` | `skydesk/widget-section/` |
| Widget Section: Passengers | `8014:11397` | `skydesk/widget-section/` |
| Matrix Table | `8014:11342` | `skydesk/matrix-table/matrix-table.tsx` |
| Passenger Header | `8014:11347` | `skydesk/matrix-table/headers.tsx` |
| Segment Header | `8014:11380` | `skydesk/matrix-table/headers.tsx` |
| Document Card: Pricing / Ticket (Default, Hover) | `7851:67417` | `skydesk/overview-widget/document-card.tsx` |
| Document Card: Focus | `8013:11314` | `skydesk/overview-widget/document-card.tsx` |
| No document | `7876:10095` | `skydesk/overview-widget/` |

## Примитивы shadcn

Button, Badge, Input, Label, Dialog, Popover, Command — в shadcn kit, узлы не записаны (`docs/components.md`). Токены цвета — страницы Foundations в shadcn kit, привязка — `src/tokens/semantic-colors.ts`.

## Ещё не построено

Виджеты Booking Overview после Overview (Passengers, Segments, Ticket, Pricing, Services, EMD, Remarks, Messages, Contacts) лежат в Figma внутри `8014:11324`; отдельные node id появятся здесь, когда виджет начнут строить.

## Как вести

Новый компонент или экран с узлом Figma — строка здесь в том же изменении, что и код (вместе со строкой в `docs/components.md`).
