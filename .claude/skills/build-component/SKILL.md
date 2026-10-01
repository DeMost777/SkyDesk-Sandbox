---
name: build-component
description: Pattern for building a UI component in Skydesk Sandbox on top of shadcn/ui and the design tokens. Use when a screen needs a component that src/components/ does not have yet, or when extending an existing one.
---

# Skill: Build Component

Паттерн создания компонентов Skydesk Sandbox. Компонент — это код, stories (они же тесты) и строка в каталоге, всё в одном изменении.

## Принципы

1. **Базируется на shadcn/ui** — сначала `src/components/ui/`; есть подходящий примитив — расширить через `className` или обёртку, не переписывать.
2. **Только токены** — цвета, радиусы, размеры шрифта и тени через классы Tailwind (`bg-surface`, `rounded-card`, `text-heading`, `shadow-popover`). Палитру напрямую не использовать (`bg-orange-300` ловит `lint:tokens`): нужен цвет — заводим семантический токен (см. skill `extract-tokens`). Размеры раскладки из Figma (`w-[220px]`) допустимы с комментарием, откуда они.
3. **Новый токен-класс** — добавить в `extendTailwindMerge` в `src/lib/utils.ts`, иначе `cn()` может молча выбросить его.
4. **Без знания предметной области — отдельно от компонента, который её знает.** Таблица или рамка виджета не знает про Pricing и Ticket. Компонент получает готовые значения или типы из `src/lib/`, mock-данные не импортирует.
5. **Доменные правила — в `src/lib/`** чистыми функциями с тестами; компонент их вызывает, не повторяет.
6. **Тёмная тема не используется** — не проверять и не рисовать.
7. **Глоссарий из `CLAUDE.md`** — в тексте UI и в именах: Office, а не PCC; Itinerary, Segment, Pricing, Ticket.
8. **Иконки — только Lucide** — сначала реестр `docs/icons.md`, потом каталог https://lucide.dev/icons/; новая иконка → строка в реестре.

## Где лежит

```
src/components/
├── ui/                        ← shadcn/ui примитивы
└── skydesk/
    └── <component-name>/      ← kebab-case
        ├── index.tsx          ← компонент (несколько частей — index.ts и файл на часть)
        └── <component-name>.stories.tsx
```

## Шаблон

```tsx
import { cn } from '@/lib/utils'

// One line: what it is. Figma <node id>. Flow doc: projects/<flow>/README.md.

export interface ComponentNameProps {
  className?: string
}

export function ComponentName({ className }: ComponentNameProps) {
  return <div className={cn('…', className)} />
}
```

Комментарий с Figma node и flow doc — обязателен (так узел попадает в `docs/figma-map.md`). Комментарии — как в соседних файлах: коротко, только «зачем».

## Состояния

Учесть те, что относятся к компоненту: default, hover, focus (клавиатура), active, disabled, loading, error, empty. Если состояния нет в Figma — не выдумывать: спросить или записать в `docs/open-questions.md`. Фокус — кольцо `shadow-focus-ring`.

## Stories

- Файл рядом с компонентом, `title: 'Skydesk/<Name>'`, `tags: ['ai-generated']`.
- **JSDoc над `const meta`** — назначение компонента (где используется, какие состояния): его берут страница Docs (autodocs) и Storybook MCP. JSDoc над самим компонентом манифест игнорирует — не дублировать. Figma в JSDoc не писать (node id — комментарием в коде и в `docs/figma-map.md`).
- **Props** — JSDoc у неочевидных полей интерфейса: они попадают в таблицу props. Нет props в Docs — проверить `meta.component` и импорты через `@/`.
- **Каталог для поиска готового** — MCP `storybook` (`docs-list`, `docs-show <id>`; локально нужен запущенный `npm run storybook`) или `src/components/**/*.stories.tsx`. Если несколько компонентов в одном файле stories — `component` + `subcomponents`.
- По story на состояние или вариант; `play` проверяет поведение (роли, `aria-*`, видимость), не пиксели.
- Каждая story — тест в Chromium, включая проверку доступности (`a11y.test: 'error'`). Исключение — teal `primary` с текстом (`test: 'todo'`, open question #14).
- Страница — в `<main>`, у popover-диалогов есть `aria-label`.

## Документы (в том же изменении)

- строка в `docs/components.md`: назначение, props, состояния, Figma node, stories;
- строка в `docs/figma-map.md`;
- поведение — во flow doc фичи; неизвестное — `docs/open-questions.md`.

## Проверка

`npm run typecheck && npm run lint:tokens && npm test && npm run build` — результат каждого шага в отчёт. Всё видимое — проверить в браузере самому (Playwright + Chromium).
