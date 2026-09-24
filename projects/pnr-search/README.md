# Flow: PNR Search

> Flow doc. Read it before the code; update it in the same change as the behavior.
> Updated: 2026-09-24. Phase: **coverage** (see CLAUDE.md → «Фаза»).

**Principle:** не заставлять агента выбирать то, что Skydesk может определить самостоятельно.

Всё ниже выводится из этого принципа. Если вопрос не покрыт документом — решайте его так, чтобы агент делал меньше выборов, а не больше. Если так решить нельзя — вопрос идёт в `docs/open-questions.md`.

## Job

Агент получает PNR (от клиента, из очереди, из письма) и хочет открыть бронирование. Он начинает с пустого поля поиска. Успех — бронирование открыто в Office, у которого есть доступ и нужные права, и агенту не пришлось думать про GDS и Office, если Skydesk мог это решить сам.

Стандартный путь — `PNR → Booking`. Дополнительный шаг появляется, только когда Skydesk действительно не хватает данных.

## Decided

**GDS определяется без агента, когда это возможно.** Источники по порядку:
1. GDS выбранного Office — Office всегда принадлежит одной GDS, поэтому выбор Office уже отвечает на вопрос о GDS.
2. GDS, которую агент выбрал на шаге GDS Required.
3. GDS, которую Skydesk уже знает для этого PNR (бронирование открывали раньше).

Только если все три источника пусты, показываем шаг **GDS Required**: кнопки `Amadeus | Sabre | Galileo` и подсказку. Это не ошибка, а дополнительный шаг поиска. Выбор GDS сразу запускает поиск в ней.

**Office определяется правилом приоритета** (`resolveOffice` в `src/lib/office.ts`):
1. Office, который агент выбрал явно.
2. Default Office агента для GDS этого PNR.
3. Creation office бронирования.

Выбранный Office из другой GDS не участвует: поиск идёт только в GDS этого Office.

**Default Office** — настройка агента для каждой GDS отдельно, необязательная. Когда агент открыл бронирование через Office, выбранный вручную, и этот Office ещё не его Default Office для этой GDS, предлагаем сохранить: `☐ Use this as my default office for Amadeus`. Снятие галочки возвращает прежний Default Office. В sandbox значение хранится в localStorage, отдельно для каждой persona.

**Not Found** — PNR нет в той GDS, где искали. Это не общая ошибка: по спецификации нужно объяснить контекст (в какой GDS / каком Office искали) и предложить «Try another GDS» / «Choose another office». Сейчас не реализовано — см. «States».

**Error** — техническая проблема: GDS недоступна, ошибка соединения, нет доступа. Понятный текст и «Try again»; если проблема в Office — предложить выбрать другой. Error и Not Found — разные состояния: сбой GDS никогда не показываем как «не найдено».

**Логика живёт в `src/lib/`, не в экране.** `searchPnr` и `resolveOffice` — чистые функции с тестами. Экран только вызывает их и показывает результат. Mock-данные подключаются через интерфейс `PnrDirectory`, реальный API позже заменит только его реализацию.

## Deliberately dropped

- **Отдельный обязательный выбор GDS перед поиском.** Противоречит принципу: в большинстве случаев Skydesk знает GDS сам.
- **Поиск по всем GDS сразу, когда выбран Office.** Office задаёт контекст агента; искать за его пределами — значит открыть бронирование не с теми правами.

## Scenarios

| # | Сценарий | Путь |
|---|---|---|
| A | PNR известен Skydesk | Enter PNR → Search → Booking opened (через Default Office) |
| B | PNR новый для Skydesk | Enter PNR → Search → GDS Required → Select GDS → Booking opened |
| C | Агент выбирает Office сам | Enter PNR + Select Office → Search → Booking opened (GDS берётся из Office) |
| D | PNR известен, Default Office нет | Enter PNR → Search → Booking opened через Creation office |

## States and how to reach them

Все адреса — от корня sandbox. Полная таблица и personas — в `APPLICATION.md`.

| State | Address | Status |
|---|---|---|
| Empty | `/` | ✅ кнопка поиска неактивна |
| Ready | `?pnr=7JRWT4` | ✅ |
| Loading | `?pnr=7JRWT4&state=loading` | ✅ (адрес держит состояние, таймер не запускается) |
| GDS Required | `?pnr=ABC123&state=result` | ✅ |
| Found — Default Office (A) | `?pnr=7JRWT4&state=result` | ✅ заглушка без Figma |
| Found — после выбора GDS (B) | `?pnr=ABC123&gds=Galileo&state=result` | ✅ заглушка без Figma |
| Found — выбранный Office + «Use as default» (C) | `?pnr=7JRWT4&office=E6T8&state=result` | ✅ заглушка без Figma |
| Found — Creation office (D) | `?persona=agent-no-defaults&pnr=7JRWT4&state=result` | ✅ заглушка без Figma |
| Not Found | `?pnr=XYZ789&gds=Sabre&state=result` | ⚠️ текст общий, нет действий «Try another GDS» / «Choose another office» |
| Error | `?pnr=ERR000&state=result` | ⚠️ нет «Try again», нет предложения сменить Office |

«Found» показывает, какой Office выбран и почему. Это заглушка до экрана Booking — она делает правило приоритета видимым для review.

## Known gaps (coverage)

- Подсказка на GDS Required: в спецификации «To continue the search, select the GDS…», в коде «…please select the GDS…» (текст из Figma). Какой вариант верный — open question.
- Not Found и Error — см. таблицу выше.

## Open questions

См. `docs/open-questions.md`, раздел «PNR Search».

## Test cases

Юнит-тесты: `src/lib/office.test.ts`, `src/lib/pnr-search.test.ts` (сценарии A–D, Not Found, Error). Ручная проверка в браузере — `docs/testing-plan.md`.
