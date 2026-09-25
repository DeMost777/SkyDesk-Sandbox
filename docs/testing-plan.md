# Testing plan

> Как проверить, что всё работает. Обновлять после каждой новой фичи — это же самый быстрый способ восстановить контекст в следующей сессии.
> Перед demo или в конце рабочего дня — пройти весь план на текущем build и записать регрессии.
> Updated: 2026-09-23.

## Как запустить локально

Нужны Git и Node.js 20+ (проверено на 22).

Первый раз:

```bash
git clone https://github.com/DeMost777/SkyDesk-Sandbox.git
cd SkyDesk-Sandbox
git checkout claude/eloquent-turing-7w2259
npm ci
npm run dev
```

Открыть `http://localhost:5173`. Сервер пересобирает страницу сам при каждом изменении файлов.

Забрать новые изменения из GitHub (dev-сервер можно не останавливать):

```bash
git pull
npm ci   # только если изменился package-lock.json
```

Проверить production-сборку, как её увидит Vercel: `npm run build && npm run preview` → `http://localhost:4173`.

## Автоматическая проверка (перед каждым push)

```bash
npm run typecheck && npm run lint:tokens && npm test && npm run build
```

`npm test` запускает два проекта: `unit` (доменные правила в `src/lib`) и `storybook` (каждая story рендерится в Chromium, play-функции проверяют взаимодействия). Для `storybook` нужен браузер Playwright: локально один раз `npx playwright install chromium`.

## Прогон в браузере (`npm run qa`)

Адреса и сценарии из таблиц ниже, автоматически: `npm run qa` (все flows) или `npm run qa -- booking`. Скрипт сам поднимает dev-сервер и Chromium, результат — `qa-report/report.md` и скриншоты. Id проверки = номер строки таблицы (`B4`, `9c`…). Запускает субагент `qa-tester`.

| Flow | Проверки | Что остаётся вручную |
|---|---|---|
| PNR Search | `scripts/qa/flows/pnr-search.mjs`: адреса 1–12, 5a; живые сценарии B и «пустой PNR» | Default Office сохраняется, persona, порядок Office, «не та GDS», «все GDS», панель State, повтор после Error, смена ввода |
| Booking | `scripts/qa/flows/booking.mjs`: B1–B13 | — |
| App Sidebar | — (stories в `npm test`) | Шаги 1–6 раздела App Sidebar |

Новое состояние flow → строка в таблице flow ниже и проверка с тем же id в `scripts/qa/flows/<flow>.mjs`, в том же изменении.

## PNR Search

Открывать адреса от корня (`npm run dev` → `http://localhost:5173/…`). Для каждого — что должно быть на экране.

| # | Адрес | Ожидаемо |
|---|---|---|
| 1 | `/` | Заголовок, пустое поле, «Select office» |
| 2 | `?pnr=7JRWT4` | PNR в поле, результата нет |
| 3 | `?pnr=7JRWT4&state=loading` | «Loading...», поле и Office заблокированы, рамка primary |
| 4 | `?pnr=ABC123&state=result` | Кнопки Amadeus / Sabre / Galileo, подсказка, рамка primary |
| 5 | `?pnr=7JRWT4&state=result` | «Opening 7JRWT4 in A2K9 · Amadeus — Your default office for Amadeus» |
| 5a | `?pnr=BBV14Q&state=result` | «Opening BBV14Q in 5GW5 · Sabre — Your default office for Sabre» (PNR бронирования Booking Overview из Figma) |
| 6 | `?persona=agent-no-defaults&pnr=7JRWT4&state=result` | «… · B3R7 — Creation office…» |
| 7 | `?pnr=ABC123&gds=Galileo&state=result` | «Opening ABC123 in Q8L3 · Galileo» |
| 8 | `?pnr=7JRWT4&office=E6T8&state=result` | «… · E6T8 — Office you selected» + checkbox «Use this as my default office for Amadeus» |
| 9 | `?pnr=XYZ789&gds=Sabre&state=result` | «PNR XYZ789 not found in Sabre. Select another GDS or check the PNR.», кнопка Sabre неактивна, рамка primary |
| 9a | `?pnr=XYZ789&tried=Amadeus&gds=Sabre&state=result` | «…not found in Amadeus or Sabre…», активна только Galileo |
| 9b | `?pnr=XYZ789&tried=Amadeus,Sabre&gds=Galileo&state=result` | «PNR XYZ789 not found in any GDS. Check the PNR.», кнопок нет, рамки нет |
| 9c | `?pnr=7JRWT4&office=5GW5&state=result` | «PNR 7JRWT4 not found in 5GW5 · Sabre. Choose another office or clear the office.», кнопок нет |
| 10 | `?pnr=ERR000&state=result` | «Something went wrong. Please try again.» (красный), без кнопок действий |
| 11 | `?pnr=K2M9QP&office=X4PD&state=result` | «Office X4PD has no access to PNR K2M9QP. Choose another office.» (красный), без кнопок действий |
| 12 | `?state=result` | «Please provide the PNR.» (красный), поле пустое |

**Живые сценарии**

- **B целиком:** на `/` ввести `abc123` → Enter → через ~1.5 с GDS Required → Galileo → Found через `Q8L3`. URL стал `?pnr=ABC123&gds=Galileo&state=result`.
- **Default Office сохраняется:** адрес 8 → отметить checkbox → открыть адрес 5 → теперь `E6T8` и «Your default office». В Office Selector у `E6T8` метка «Default». «Reset demo data» → снова `A2K9`.
- **Persona:** на адресе 5 нажать «Agent without defaults» → тот же PNR открывается через `B3R7`. Кнопка «назад» в браузере → снова `A2K9`.
- **Порядок Office:** на `/` открыть «Select office» → сверху `5GW5`, `A2K9`, `Q8L3` с меткой «Default», дальше `7MTR`, `B3R7`, `C1Z2`, `D4M5`, `E6T8`, `F9K1`, `X4PD`. После сохранения `E6T8` как default он поднимается наверх, а `A2K9` уходит в общий список. Persona без defaults — весь список по алфавиту.
- **Не та GDS:** ввести `ABC123` → Enter → Amadeus → «not found in Amadeus», Amadeus неактивна → Galileo → Found через `Q8L3`.
- **Все GDS:** ввести `XYZ789` → Amadeus → Sabre → Galileo → «not found in any GDS». URL на каждом шаге содержит `tried`.
- **Панель State:** каждая кнопка открывает своё состояние и подсвечивается, включая три варианта Not Found.
- **Пустой PNR:** на `/` нажать кнопку поиска (или Enter) → «Please provide the PNR.», курсор в поле. Начать вводить → сообщение исчезает.
- **Повтор после Error:** адрес 10 → кнопка поиска → Loading → снова Error (`ERR000` в mock-данных падает всегда).
- **Нет доступа у Office:** адрес 11 → в Office Selector выбрать `5GW5` → кнопка поиска → Found через `5GW5`.
- **Смена ввода сбрасывает результат:** на любом результате изменить PNR или Office → результат исчезает.

## Booking

Flow doc — `projects/booking-overview/README.md`. Сравнивать с Figma `7994:305661` (скриншот в задаче 2.1).

| # | Адрес | Ожидаемо |
|---|---|---|
| B1 | `?page=booking&pnr=BBV14Q` (или ссылка «Booking» в навигации) | Header: `BBV14Q │ Sabre │ 3 passengers │ Created: 08/10/2025 13:44`, справа кнопка панели. Ниже вкладка «Booking Overview», под ней пустая серая область. В History `BBV14Q` — Active |
| B2 | `?page=booking&pnr=K2M9QP` | «1 passenger», «Created: 14/09/2026 16:30» |
| B3 | `?page=booking&pnr=ABC123&gds=Galileo` | Header с `Galileo` |
| B4 | `?page=booking&pnr=XYZ789&gds=Sabre` | Открывается PNR Search: «PNR XYZ789 not found in Sabre…», адрес `?pnr=XYZ789&gds=Sabre&state=result` |
| B5 | `?page=booking&pnr=ABC123` | PNR Search, шаг GDS Required |
| B6 | `?page=booking` | PNR Search: «Please provide the PNR.» |
| B7 | Открыть B4, нажать «Назад» в браузере | Возврат на страницу до B4, не на Booking |
| B8 | Кнопки ◧ и ◨ в Header, клики в sidebar | Ничего не делают (open question #21), адрес не меняется |
| B9 | `?page=booking&pnr=7JRWT4&office=E6T8`, `?page=booking&persona=agent-no-defaults&pnr=BBV14Q` | Бронирование открывается; Office в Header не показан (open question #22) |
| B10 | `?page=booking&pnr=ERR000`, `?page=booking&pnr=7JRWT4&office=5GW5`, `?page=booking&pnr=K2M9QP&office=X4PD` | PNR Search: Error, Not Found · Office, нет доступа у Office |
| B11 | «Booking» → «PNR Search» в навигации, затем «Назад» и «Вперёд» в браузере | Экраны меняются вместе с адресом |
| B12 | Окно 1024×700 | Header 44px, кнопка ◨ видна, у страницы нет прокрутки |
| B13 | На `/` ввести `BBV14Q` → Enter | Заглушка Found «Opening BBV14Q in 5GW5 · Sabre», переход в Booking **не** происходит (решение пользователя, 2026-09-25) |

## Office Selector

Все состояния — в Storybook: Components / ui / Office Selector (`npm run storybook`). Story `Default` сама проверяет порядок: сверху `5GW5`, `A2K9`, `Q8L3` с меткой «Default», дальше по алфавиту.

## App Sidebar

Автоматически: `npm test` — правила `src/lib/booking-history.test.ts`, `src/lib/user.test.ts` и stories Skydesk / App Sidebar (play-функции проверяют клики, `aria-current`, доступные имена; a11y-проверка каждой story).

Вручную на `/`:
1. Sidebar слева, 229px, на всю высоту под навигацией sandbox; сверху «Trava Sky Desk», снизу Alex Pupkin.
2. General — только New chat. General и History — заголовки, не кликаются.
3. History: 11 бронирований, первое — «Today 15:12». Маршруты: `YYZ ⇆ LON` (K7Q2LM), `LAX → SEA` (P9D3XA), `CDG → LON → JFK` (BBV14Q).
4. Без наведения — у элементов нет фона. Наведение на логотип, New chat, History item, пользователя — фон `#f5f5f4`; нажатие — тот же фон; Tab — тот же фон и teal-кольцо.
5. Клики ничего не меняют: URL и экран поиска остаются как были.
6. Окно ниже списка History — History прокручивается, header и footer на месте.

## Последний прогон

- 2026-09-25 (`npm run qa`, задача 1.12): booking + pnr-search — 41/41, ошибок в консоли нет. Контрольная поломка («1 passengers») роняет B2 и B3, код выхода 1.

- 2026-09-25 (Booking, задача 2.6): typecheck, lint:tokens, test (136), build — зелёные. В headless Chromium на dev-сервере пройдены Booking B1–B13, PNR Search 1–12 и 5a, живые сценарии «BBV14Q → Found» и B (ABC123 → Galileo): 40 проверок, все прошли, ошибок в консоли нет. Экран 1920×1115 совпадает со скриншотом пользователя и Figma `7994:305661`.

- 2026-09-23 (App Sidebar): typecheck, lint:tokens, test (unit + storybook), build, build-storybook — зелёные. Sidebar проверен в headless Chromium на dev-сервере: вёрстка против Figma `7936:79314`, hover / pressed / focus, stories Hover / Pressed / Focus / Round Trip / Long Name.

- 2026-09-23 (после удаления кнопок из Error): все пункты выше пройдены в headless Chromium на production build (`vite preview`); ошибок в консоли нет.
