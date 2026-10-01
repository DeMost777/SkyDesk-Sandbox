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

### Браузерный проход и Foundations

- `npm run qa` (все flows) или `npm run qa -- booking-overview` — Playwright в Chromium поднимает dev-сервер сам, проходит адреса из этого плана (PNR Search 1–12 и живые сценарии; Booking Overview 1–7, Overview, Passengers) и пишет `qa-report/report.md` со скриншотами и ошибками консоли. Код возврата 1 — есть красная проверка или ошибка консоли. Состояния без проверки в флоу — только вручную.
- `npm run foundations` после правки токенов: тест `src/foundations/foundations.test.ts` падает, пока страницы Foundations не перегенерированы или в `layout.mdx` нет нового размера `[Npx]`.

## PNR Search

Открывать адреса от корня (`npm run dev` → `http://localhost:5173/…`). Для каждого — что должно быть на экране.

| # | Адрес | Ожидаемо |
|---|---|---|
| 1 | `/` | Заголовок, пустое поле, «Select office» |
| 2 | `?pnr=7JRWT4` | PNR в поле, результата нет |
| 3 | `?pnr=7JRWT4&state=loading` | «Loading...», поле и Office заблокированы, рамка primary |
| 4 | `?pnr=ABC123&state=result` | Кнопки Amadeus / Sabre / Galileo, подсказка, рамка primary |
| 5 | `?pnr=7JRWT4&state=result` | «Opening 7JRWT4 in A2K9 · Amadeus — Your default office for Amadeus» |
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
- **Found → Booking:** в любом Found справа ссылка «Open booking»; клик открывает Booking Overview этого PNR (`?page=booking-overview&pnr=7JRWT4`), Ctrl/⌘-клик — новую вкладку. Строка Found и галочка Default Office остаются.
- **Панель State:** каждая кнопка открывает своё состояние и подсвечивается, включая три варианта Not Found.
- **Пустой PNR:** на `/` нажать кнопку поиска (или Enter) → «Please provide the PNR.», курсор в поле. Начать вводить → сообщение исчезает.
- **Повтор после Error:** адрес 10 → кнопка поиска → Loading → снова Error (`ERR000` в mock-данных падает всегда).
- **Нет доступа у Office:** адрес 11 → в Office Selector выбрать `5GW5` → кнопка поиска → Found через `5GW5`.
- **Смена ввода сбрасывает результат:** на любом результате изменить PNR или Office → результат исчезает.

## CI

`.github/workflows/ci.yml` запускается на каждом PR и на push в `main`: `npm ci`, установка Chromium для Playwright, `typecheck`, `lint:tokens`, `npm test`, `npm run build`, `build-storybook`.

1. Открыть PR → во вкладке Checks появляется job `check` (workflow CI); зелёный — все шаги прошли.
2. Проверить, что CI ловит ошибки: в ветке сломать тип (например, присвоить строку числу) → job краснеет на шаге `npm run typecheck`. Откатить.
3. Локально те же шаги: `npm run typecheck && npm run lint:tokens && npm test && npm run build && npm run build-storybook -- --output-dir /tmp/sb`.

Обязательным check CI делает владелец репозитория: GitHub → Settings → Branches / Rulesets → require status check `check` для `main` (это настройка репозитория, из кода её не включить).

## Storybook как каталог компонентов

1. `npm run storybook` → у каждого раздела в дереве есть страница **Docs**: описание, таблица props, stories. У Button `variant` и `size` — выбор из списка, не «Set object».
2. Для агента: `curl -s localhost:6006/manifests/components.json` — у каждого компонента нет поля `error`, есть `description`; MCP `docs-show` для History Item показывает описание и props с описаниями.
3. MCP в Claude Code: в новой сессии `/mcp` показывает `storybook` connected (локально — после `npm run storybook`). В облаке хук SessionStart пишет «Storybook is up»; если нет — `/tmp/storybook.log`. Проверить хук без сессии: `CLAUDE_CODE_REMOTE=true ./.claude/hooks/session-start.sh`.

## Office Selector

Все состояния — в Storybook: UI / Office Selector (`npm run storybook`). Story `Default` сама проверяет порядок: сверху `5GW5`, `A2K9`, `Q8L3` с меткой «Default», дальше по алфавиту.

## App Sidebar

Автоматически: `npm test` — правила `src/lib/booking-history.test.ts`, `src/lib/user.test.ts` и stories Skydesk / App Sidebar (play-функции проверяют клики, `aria-current`, доступные имена; a11y-проверка каждой story).

Вручную на `/`:
1. Sidebar слева, 229px, на всю высоту под навигацией sandbox; сверху «Trava Sky Desk», снизу Alex Pupkin.
2. General — только New chat. General и History — заголовки, не кликаются.
3. History: 11 бронирований, первое — «Today 15:12». Маршруты: `YYZ ⇆ LON` (K7Q2LM), `LAX → SEA` (P9D3XA), `CDG → LON → JFK` (BBV14Q).
4. Без наведения — у элементов нет фона. Наведение на логотип, New chat, History item, пользователя — фон `#f5f5f4`; нажатие — тот же фон; Tab — тот же фон и серое кольцо (`#71717a`).
5. Клики ничего не меняют: URL и экран поиска остаются как были.
6. Окно ниже списка History — History прокручивается, header и footer на месте.

## Цвета (Foundations / Colors)

Автоматически: `npm test` — `src/tokens/colors.test.ts` (палитра в CSS = `palette.ts` до hex; светлые семантические токены = значения Figma, кроме `destructive-foreground` с пометкой `kept`, которая держит заданное значение) и stories Foundations / Colors (play-функция сверяет вычисленный браузером цвет каждого образца с тем цветом, который он заявляет).

Вручную в Storybook (`npm run storybook`) → Foundations / Colors:
1. Palette — 22 шкалы по 11 оттенков, под каждым образцом номер и hex.
2. Semantic: Figma-имя, CSS-переменная, Tailwind-класс, hex, статус. Колонка Status: «Matches Figma» или причина, почему значение осознанно другое (`destructive-foreground`). Тёмная тема не проверяется (решение 2026-09-29).
3. History item в sidebar набран IBM Plex Mono (не Roboto Mono); текст не выходит за карточку.

## Booking и Overview (модель и mock-данные)

Автоматически: `npm test` — `src/lib/booking.test.ts` (каждый сценарий из `src/mocks/bookings/` согласован: ссылки покрытия, уникальные id и номера билетов, Office в своей GDS, все типы пассажиров ADT / CHD / INF; сводка для PNR Search совпадает с прежней; маршрут, формат даты) и `src/lib/overview-matrix.test.ts` (эталонная ячейка из спецификации, Deleted и «No document», все статусы Pricing, порядок и равные времена, покрытие, счётчик, цель клика).

Вручную на `?page=booking-overview&pnr=BBV14Q` (или верхняя навигация → «Booking Overview»):
1. Слева App Sidebar, History без выделенного элемента. Сверху панель «Booking» с десятью PNR — клик открывает другое бронирование.
2. Шапка 44px: `BBV14Q | Sabre | 3 passengers | Created: 08/10/2025 13:44` (время серое и мельче), справа иконки History и панели. Tab проходит: панель слева → History → чат.
3. Под шапкой полоса «Booking Overview» на сером фоне; область ниже — `#f5f5f5`.
4. Виджет Overview по центру области, ширина 800px; слева chevron вниз, справа бейдж с иконкой и счётчиком (BBV14Q — 6, K2M9QP — 1, DEL3T3 — 1). Клик или Enter по заголовку сворачивает содержимое и меняет chevron.
5. Без `pnr` или с неизвестным (`XYZ789`): сообщение «No mock booking…».
6. Окно шире и уже: колонка остаётся по центру, горизонтальной прокрутки нет на ширине 800px и больше (проверено 1440, 1024, 800). Уже ~700px шапка обрезает «Created»: sidebar не сворачивается.
7. Путь целиком: `/` → ввести `BBV14Q` → Enter → Found → «Open booking» → Booking Overview `BBV14Q`.

Overview на `?page=booking-overview&pnr=<PNR>` (сценарии — `overview-widget.md` → «Mock scenarios»):
- `BBV14Q`: ячейка P1×S1 сверху вниз — Pricing `Inactive`, Pricing `Ticketed`, Ticket `Voided`, Ticket без бейджа; P3 — «No document» (штриховка); P2×S1 — Pricing без бейджа и Ticket.
- Наведение на карточку: светлое покрытие «See widget ↗» на всю карточку; нажатая — то же.
- Tab: между карточками — двойное кольцо (белый зазор и серая полоса); карточка остаётся видимой.
- Клик: под виджетом «Sandbox: would open …».
- `WIDE55`: 5 пассажиров — таблица прокручивается по горизонтали, колонка Segments остаётся на месте; `BBV14Q` (3 пассажира) не прокручивается.
- `PRC5TS`: все статусы Pricing бейджами; Active — без бейджа. `DEL3T3`: Deleted не виден, счётчик 1. `TIE5AM`: порядок Pricing, Pricing, Ticket.
- Дата сегмента без года (`14 Jun`), в одной строке с рейсом; наведение показывает полную дату с годом.

Автоматически: stories Pages / booking-overview, Skydesk / Booking Header, Skydesk / Widget Section. PNR Search находит все десять: введите PNR на `/` — `BBV14Q`, `PRC5TS`, `CVR4GE`, `DEL3T3`, `TIE5AM`, `WIDE55`, `PAX7QD` открываются без шага GDS Required, `ABC123` проходит его.

## Виджет Passengers

Автоматически: `src/lib/passenger.test.ts` (разбор имени GDS, порядок и регистр, титул, паспорт по номеру, все сочетания индикаторов, пустые значения, формат даты, подсказка бейджа) и stories Skydesk / Passengers Widget (+ Passenger Card): индикаторы по доступному описанию, раскрытие (по вычисленному `display`, а не по атрибуту `hidden`), Tab, Enter и Space, фокус, подсказка бейджа.

Вручную на `?page=booking-overview&pnr=PAX7QD` (виджет идёт после Overview, шесть пассажиров, счётчик 6):
1. Все карточки закрыты. P1: `ADT │ ✓ Date of Birth │ ✗ Passport │ ✓ Frequent flyer`; P2: `ADT │ ✓ Passport`; P3: `✓ Passport │ ✓ Frequent flyer`; P4: `CHD │ ✓ Passport`; P5: `INF │ ✗ Date of Birth │ ✗ Passport`; P6: длинное имя, `✓ Date of Birth │ ✗ Passport │ ✓ Frequent flyer`.
2. Имя — фамилия первой, затем имена, затем серый титул (`Kallio Anna Maria Ms`); у P5 титула нет; составные имена с заглавной после дефиса (`Maria-Antonia`). Всё, включая `ADT` и индикаторы, — 14px (кроме бейджа `P1` и `Show more`, они 12px), вес обычный; закрытая карточка 68px, открытая с тремя картами 232px.
3. Клик по любому месту верхней строки раскрывает карточку, справа `Show less`; несколько карточек открыты одновременно. Курсор на строке — рука, фон не меняется.
4. P1 раскрыта: Date of birth `12/04/1985`, Gender `FEMALE`, Nationality `FINLAND`, паспорт, страна и срок — прочерки; блок Frequent flyer: `4400123456 (AY) │ 9810004455 (SK)`.
5. P5 раскрыта: шесть прочерков и нет блока Frequent flyer. P6: пять карт в строку, на узком окне переносятся.
6. Наведение на бейдж `P1` — подсказка «Passenger 1».
7. Tab с заголовка виджета переходит на P1: кольцо вокруг всей верхней строки; Enter и Space открывают и закрывают. Скринридер читает «P1 Kallio Anna Maria Ms», описание — «ADT Entered: Date of Birth Missing: Passport Entered: Frequent flyer».
8. `BBV14Q` (по умолчанию): три пассажира с разными данными; `K2M9QP`: один без личных данных.

## Последний прогон

- 2026-09-23 (App Sidebar): typecheck, lint:tokens, test (unit + storybook), build, build-storybook — зелёные. Sidebar проверен в headless Chromium на dev-сервере: вёрстка против Figma `7936:79314`, hover / pressed / focus, stories Hover / Pressed / Focus / Round Trip / Long Name.

- 2026-09-23 (после удаления кнопок из Error): все пункты выше пройдены в headless Chromium на production build (`vite preview`); ошибок в консоли нет.

- 2026-09-28 (токены цвета, шрифт): typecheck, lint:tokens, test (unit + storybook, 180 тестов), build — зелёные. Foundations / Colors и sidebar с IBM Plex Mono просмотрены в headless Chromium на Storybook dev.

- 2026-09-30 (Booking Overview, 2.1): typecheck, lint:tokens, test (unit + storybook, 217 тестов), build — зелёные. Страница проверена в headless Chromium на 1440×900: шапка 44px, виджет 800px по центру (x 435–1235 при области 229–1440), счётчик 6 у `BBV14Q`.

- 2026-09-30 (Overview, 3.1): typecheck, lint:tokens, test (225 тестов), build — зелёные. Виджет проверен в headless Chromium на 1440×900: hover, focus-кольцо, клик, скролл WIDE55 (колонка сегментов на x=436 до и после скролла).
