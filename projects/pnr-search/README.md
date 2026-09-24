# Flow: PNR Search

> Flow doc. Read it before the code; update it in the same change as the behavior.
> Updated: 2026-09-23. Phase: **coverage** (see CLAUDE.md → «Фаза»).

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

**Creation office всегда доступен агенту** (решение product, 2026-09-24). Бронирование создавалось на стороне агента, поэтому третий шаг приоритета всегда даёт Office с доступом.

**Список Office в Office Selector:** сначала Default Offices агента, затем все остальные Office. Обе группы — по алфавиту кода Office, без группировки по GDS. При поиске порядок тот же. Так агент сразу видит, какие Default Offices у него настроены (правило пользователя, 2026-09-23).

**Default Office** — настройка агента для каждой GDS отдельно, необязательная. Когда агент открыл бронирование через Office, выбранный вручную, и этот Office ещё не его Default Office для этой GDS, предлагаем сохранить: `☐ Use this as my default office for Amadeus`. Снятие галочки возвращает прежний Default Office. В sandbox значение хранится в localStorage, отдельно для каждой persona.

**Not Found** — PNR нет в той GDS, где искали. Это не тупик: агент видит, где искали, и следующий шаг. Что предложить, зависит от того, откуда взялась GDS (правило пользователя, 2026-09-23):

| Откуда GDS | Что показываем |
|---|---|
| Агент выбрал на шаге GDS Required, или Skydesk знал GDS | Снова кнопки `Amadeus \| Sabre \| Galileo`, рамка primary. Проверенные GDS остаются на месте, но неактивны. Текст: «PNR XYZ789 not found in Amadeus. Select another GDS or check the PNR.» (для двух — «in Amadeus or Sabre») |
| Проверены все 3 GDS | Кнопок нет: «PNR XYZ789 not found in any GDS. Check the PNR.» |
| Выбранный Office | Кнопок GDS нет — GDS задаёт Office: «PNR 7JRWT4 not found in 5GW5 · Sabre. Choose another office or clear the office.» Так же и когда PNR лежит в другой GDS — в другой GDS не ищем (решение product, 2026-09-24). |

Проверенные GDS накапливаются в пределах одной попытки. Смена PNR или Office начинает попытку заново. Правило — `searchPnr` возвращает `gdsSource` и `tried`, `allGdsTried` решает, остались ли варианты.

**Error** — техническая проблема. Error и Not Found — разные состояния: сбой GDS никогда не показываем как «не найдено». Текст зависит от причины (`reason` в результате `searchPnr`). Отдельных кнопок действий в сообщении нет: агент действует элементами, которые уже есть в поле поиска — кнопкой поиска и Office Selector (правило пользователя, 2026-09-23).

| Причина | Текст | Что делает агент |
|---|---|---|
| GDS недоступна, ошибка соединения (`unavailable`) | «Something went wrong. Please try again.» (из Figma) | Нажимает кнопку поиска ещё раз |
| У Office нет доступа к PNR (`access-denied`) | «Office X4PD has no access to PNR K2M9QP. Choose another office.» | Меняет Office в Office Selector и нажимает поиск |

Доступ проверяется для Office, через который идёт поиск: выбранного вручную или Default Office для этой GDS. Creation office доступа не лишается — PNR создан в нём.

**PNR Required** — агент нажал поиск (или Enter) с пустым полем. Кнопка поиска при этом активна всегда — правило пользователя, 2026-09-23. Показываем «Please provide the PNR.» сразу, без Loading; фокус возвращается в поле, у поля `aria-invalid`. Сообщение исчезает, как только агент начинает вводить PNR. Правило — `searchPnr` возвращает `pnr-required` для пустого PNR, не обращаясь к GDS.

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
| Empty | `/` | ✅ |
| PNR Required | `?state=result` | ✅ |
| Ready | `?pnr=7JRWT4` | ✅ |
| Loading | `?pnr=7JRWT4&state=loading` | ✅ (адрес держит состояние, таймер не запускается) |
| GDS Required | `?pnr=ABC123&state=result` | ✅ |
| Found — Default Office (A) | `?pnr=7JRWT4&state=result` | ✅ заглушка без Figma |
| Found — после выбора GDS (B) | `?pnr=ABC123&gds=Galileo&state=result` | ✅ заглушка без Figma |
| Found — выбранный Office + «Use as default» (C) | `?pnr=7JRWT4&office=E6T8&state=result` | ✅ заглушка без Figma |
| Found — Creation office (D) | `?persona=agent-no-defaults&pnr=7JRWT4&state=result` | ✅ заглушка без Figma |
| Not Found — выбранная GDS | `?pnr=XYZ789&gds=Amadeus&state=result` | ✅ |
| Not Found — две GDS | `?pnr=XYZ789&tried=Amadeus&gds=Sabre&state=result` | ✅ |
| Not Found — все GDS | `?pnr=XYZ789&tried=Amadeus,Sabre&gds=Galileo&state=result` | ✅ |
| Not Found — выбранный Office | `?pnr=7JRWT4&office=5GW5&state=result` | ✅ |
| Error — GDS недоступна | `?pnr=ERR000&state=result` | ✅ (в mock-данных `ERR000` падает всегда, повторный поиск снова покажет Error) |
| Error — у Office нет доступа | `?pnr=K2M9QP&office=X4PD&state=result` | ✅ |

«Found» показывает, какой Office выбран и почему. Это заглушка до экрана Booking — она делает правило приоритета видимым для review.

## Known gaps (coverage)

- Подсказка на GDS Required: в спецификации «To continue the search, select the GDS…», в коде «…please select the GDS…» (текст из Figma). Какой вариант верный — open question.

## Open questions

См. `docs/open-questions.md`, раздел «PNR Search».

## Test cases

Юнит-тесты: `src/lib/office.test.ts`, `src/lib/pnr-search.test.ts` (сценарии A–D, PNR Required, Not Found с повторным выбором GDS, Error обоих видов). Ручная проверка в браузере — `docs/testing-plan.md`.
