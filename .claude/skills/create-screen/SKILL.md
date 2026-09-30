---
name: create-screen
description: Pattern for creating a prototype screen in src/pages/ from its flow doc in projects/. Use when starting a new screen or flow, or adding a new state to an existing screen.
---

# Skill: Create Screen

Паттерн создания экрана-прототипа в Skydesk Sandbox. Один flow за раз: читать `APPLICATION.md` и flow doc задачи, остальные flows не сканировать.

## Перед кодом

1. Задача записана в `ROADMAP.md` → «Сейчас» (`CLAUDE.md`, правило 11); ветка создана от свежего `main`.
2. В `projects/<flow>/README.md` есть flow doc: принцип → решения → отброшенное → состояния и как их открыть → open questions. Нет — сначала написать его (правило 4), в шапке `Phase: Coverage`.
3. Источники при расхождении — по порядку из `CLAUDE.md` → «Источники истины». Узлы Figma — `docs/figma-map.md`, читать субагентом `figma-reader`. Чего источники не показывают — спросить или записать в `docs/open-questions.md`, не выдумывать.
4. Прочитать `CLAUDE.md`: глоссарий и «Решения и gotchas» действуют на каждый экран.

## Структура

```
src/
├── pages/<screen-name>/    ← kebab-case
│   ├── index.tsx           ← экран
│   ├── components/         ← локальные компоненты, нужные только этому экрану
│   └── <screen-name>.stories.tsx
├── lib/                    ← доменные правила: чистые функции + *.test.ts рядом
├── mocks/                  ← mock-данные и personas
└── components/             ← общие компоненты (skill build-component)
```

- **Доменные правила — в `src/lib/`** чистыми функциями с тестами (`vitest`, проект `unit`): выбор Office, поиск, статусы, матрица. Экран вызывает их и не повторяет.
- **Mock data — в `src/mocks/`**, структура как у реального ответа; одни и те же данные читают все экраны (PNR Search и Booking Overview берут одни бронирования).
- Компонент, который нужен и другим экранам, — в `src/components/skydesk/` (skill `build-component`), не в `components/` страницы.

## Состояния

Покрыть все реалистичные состояния flow: начальное, загрузка, результат, ошибка, пустой результат — и специфичные для flow (в PNR Search: PNR Required, GDS Required, Not Found). Состояние из макета, до которого нельзя дойти, — пробел покрытия: записать в «Known gaps» flow doc.

Как открыть каждое состояние для проверки — решает flow doc. Общего механизма нет: адреса и панель sandbox — решение PNR Search (`projects/pnr-search/README.md`). Сценарий без явного способа открыть его недоделан.

## Stories

Экран — story на каждое состояние, `title: 'Pages/<Name>'`, `play` проверяет поведение (роли, тексты, переходы), не пиксели. Каждая story — тест в Chromium, включая a11y (`a11y.test: 'error'`): страница в `<main>`, у диалогов `aria-label`. Правила и исключения — skill `build-component`.

## Документы (в том же изменении)

- flow doc: решения, состояния и как их открыть, Known gaps, open questions;
- `APPLICATION.md` — карта экранов и Storybook;
- `docs/testing-plan.md` — как проверить фичу;
- `docs/components.md`, `docs/figma-map.md` — если появились компоненты или узлы;
- `docs/open-questions.md` — всё неизвестное.

## Проверка перед push

```bash
npm run typecheck && npm run lint:tokens && npm test && npm run build
```

Результат каждого шага — в отчёт. Экран открыть в браузере самому (Playwright + Chromium, `npm run dev`) и пройти все состояния по flow doc.

## Конец задачи

- Перечислить сценарии и edge cases, которые не покрыты (правило 8) → «Потом» в `ROADMAP.md`.
- Перенести задачу в «Сделано» в том же коммите; номер — в начале сообщения (`[2.3] …`).
- Правки пользователя — правила продукта: общее — в `CLAUDE.md`, одного flow — в его flow doc (правило 9).
