---
name: create-screen
description: Pattern for creating a prototype screen in src/pages/ from its flow doc in projects/. Use when starting a new screen or flow, or adding a new state to an existing screen.
---

# Skill: Create Screen

Паттерн создания экрана-прототипа в Skydesk Sandbox.

## Перед созданием экрана

1. Убедиться, что в `projects/<screen-name>/` есть описание задачи с:
   - Flow (состояния и переходы между ними)
   - Mock data (или ссылка на `src/mocks/`)
   - UX-принципы для этого экрана

2. Проверить CLAUDE.md — применить актуальные продуктовые правила

## Структура экрана

```
src/pages/
└── ScreenName/
    ├── index.tsx          ← основной компонент экрана
    └── components/        ← локальные компоненты экрана
```

## Обязательные состояния

Каждый экран должен покрывать все реалистичные состояния:
- **Empty / Initial** — начальное состояние
- **Loading** — промежуточные состояния
- **Success / Result** — успешный результат
- **Error** — ошибка
- **Empty result** — результат есть, но он пустой

## Mock data

Хранить в `src/mocks/` (правило `CLAUDE.md`: одни и те же данные нужны нескольким экранам). Структура должна отражать реальный API-ответ даже если backend не подключён.

## Как показывать состояния для review

Решает flow doc фичи. Общего механизма нет: например, адреса состояний и панель sandbox — решение только PNR Search (`projects/pnr-search/README.md`).
