# Иконки

> Реестр иконок Skydesk Sandbox. Правило — `CLAUDE.md` → «Решения и gotchas» → «Иконки — только Lucide». Updated: 2026-09-29.

## Источник

- Набор: **Lucide**, пакет `lucide-react` (версия зафиксирована в `package.json`, сейчас `^0.468.0`).
- Каталог: https://lucide.dev/icons/
- Категория валют (для Pricing, тарифов, налогов): https://lucide.dev/icons/categories#currency
- Каталог на сайте — последней версии. Имя оттуда может отсутствовать в нашей версии или называться иначе (`AlertCircle` в новых версиях — `CircleAlert`). Проверять импортом и `npm run typecheck`.
- Нет нужной иконки в Lucide — не рисовать свою и не подключать другой набор: запись в `docs/open-questions.md`. Набора иконок в Figma, отдельного от Lucide, нет (решение пользователя, 2026-09-29; закрыт open question #41).

## Как использовать

- Один смысл в продукте — одна иконка. Перед выбором смотрим таблицу ниже, а не каталог.
- Новая иконка → строка в таблицу в том же изменении.
- Размер: `size-4` (16px). Исключение — `X` внутри поля ввода: `size-3.5`.
- Толщина: `strokeWidth={2}` у каждой иконки, всегда явно (решение пользователя, 2026-09-29; 1.5 пробовали и отклонили — слишком тонко). Без исключений, включая `X` в полях. Логотип Trava — не иконка, его толщина своя.
- Цвет: токен (`text-icon`, `text-muted-foreground`, `text-destructive`, `text-pricing-foreground`), не hex. Декоративная иконка — `aria-hidden`; иконка без текста рядом — `aria-label` у кнопки.

## Реестр

| Смысл | Иконка Lucide | Где |
|---|---|---|
| Ticket | `Ticket` | `DocumentCard` |
| Pricing | `Timer` | `DocumentCard` |
| Открыть виджет («See widget») | `SquareArrowOutUpRight` | `DocumentCard` |
| Overview (виджет) | `ClipboardList` | `OverviewWidget` |
| Passengers | `Users` | `BookingHeader` |
| History | `Clock` | `BookingHeader` |
| Панель слева / справа | `PanelLeft`, `PanelRight` | `BookingHeader` |
| Itinerary: One way / Round | `ArrowRight` / `ArrowRightLeft` | History item |
| Sandbox-панель | `SquareTerminal` | `AppSidebar` |
| Свернуть / развернуть | `ChevronDown`, `ChevronRight` | `WidgetSection`, `OfficeSelector` |
| Поиск | `Search` | `OfficeSelector`, `Command` |
| Закрыть / очистить | `X` | `Dialog`, `OfficeSelector` |
| Office (выбранный) | `Home` | `OfficeSelector` |
| Настройки Office | `Settings` | `OfficeSelector` |
| Ошибка | `AlertCircle` | `OfficeSelector`, PNR Search |
| Информация | `Info` | PNR Search (строка результата) |
| Отправить | `ArrowUp` | PNR Search (поле запроса) |
