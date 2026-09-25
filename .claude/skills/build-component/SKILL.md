---
name: build-component
description: Pattern for building or extending a UI component in Skydesk Sandbox — shadcn/ui primitives, design tokens, and a Storybook story file that is the component's documentation and its test. Use when a screen needs a component that src/components/ does not have yet, or when changing an existing one.
---

# Skill: Build Component

Как добавить или изменить компонент. Каталог компонентов — Storybook, отдельного списка нет (`CLAUDE.md` → «Решения и gotchas»).

## 1. Сначала найти готовое

1. Каталог: MCP-сервер `storybook` (`docs-list`, затем `docs-show <id>`). Если MCP недоступен — `src/components/**/*.stories.tsx`.
2. Есть подходящий компонент — использовать или расширить (новый prop, вариант), не писать второй.
3. Есть примитив shadcn/ui в `src/components/ui/`, но нет нужного — собрать поверх него. Нет и примитива — добавить его из shadcn/ui (`components.json` уже настроен), затем строить.

## 2. Куда положить

```
src/components/
├── ui/                     ← примитивы shadcn/ui: button.tsx, popover.tsx, sidebar.tsx…
│   └── button.stories.tsx     story рядом с файлом
└── skydesk/                ← компоненты Skydesk из нескольких частей
    └── app-sidebar/           папка в kebab-case
        ├── index.tsx          главный компонент + его части (SidebarBrand, SidebarUser…)
        ├── history-item.tsx   крупная часть — отдельным файлом, реэкспорт из index.tsx
        ├── *.stories.tsx      по файлу stories на компонент
        └── story-checks.ts    общие проверки для play-функций этой папки
src/pages/<flow>/components/ ← части одного экрана, которые больше нигде не нужны
```

- Файлы в kebab-case, компоненты — PascalCase, именованный export.
- `office-selector.tsx` лежит в `ui/`, хотя это компонент Skydesk. Так сложилось — не переносить без просьбы пользователя.

## 3. Примитивы shadcn/ui можно менять

Примитивы в `ui/` — не сторонний код: их правят под токены и решения продукта. Каждое отличие от стокового shadcn — комментарий в коде (почему), а правило одного flow — ещё и в его flow doc. Пример — `ui/sidebar.tsx`: у Default нет заливки, у Active нет `font-medium`.

## 4. Код компонента

```tsx
// src/components/skydesk/booking-header/index.tsx
import { cn } from '@/lib/utils'
import { gdsCode } from '@/lib/booking-history'   // доменные правила — только из src/lib

export interface BookingHeaderProps {
  /** Описание поля — попадёт в таблицу props в Storybook и в MCP. */
  pnr: string
  onSelect?: (pnr: string) => void
  className?: string
}

export function BookingHeader({ pnr, onSelect, className }: BookingHeaderProps) {
  return <div className={cn('rounded-card bg-surface text-foreground', className)}>…</div>
}
```

- **Props** — экспортируемый interface; у каждого неочевидного поля JSDoc `/** … */`. Назначение компонента сюда не писать — оно в story (шаг 5).
- **Стили** — только классы токенов (`bg-surface`, `rounded-card`, `text-heading`, `shadow-popover`). Цвета, радиусы, размеры шрифта и тени в `[…]` нельзя — `npm run lint:tokens` упадёт. Размер раскладки из Figma (`w-[220px]`) можно, с комментарием, откуда он.
- **Классы** — через `cn()`, не `join(' ')`. Нужен новый токен — skill `extract-tokens`.
- **Логика** — доменные правила (сортировка, форматирование, выбор Office) живут в `src/lib/` с тестами. Компонент их вызывает, не повторяет.
- **Доступность** — у кнопки без текста `aria-label`, у popover-диалога `aria-label`, у активного пункта `aria-current`. Каждая story проходит a11y-проверку, нарушение роняет `npm test`.
- **Тексты UI** — из глоссария `CLAUDE.md`, порядок `Office · GDS`.

## 5. Story — документация и тест

Story обязательна в том же изменении. Autodocs включён для всех, страница Docs появится сама.

```tsx
// booking-header.stories.tsx — рядом с компонентом
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn } from 'storybook/test'
import { BookingHeader } from './index'

/**
 * Назначение: что показывает, где используется, какие состояния есть.
 * Правила — projects/<flow>/README.md.
 */
const meta = {
  title: 'Skydesk/Booking Header',  // UI/… · Skydesk/… · Pages/…
  component: BookingHeader,
  tags: ['ai-generated'],
  args: { pnr: '7JRWT4', onSelect: fn() },
} satisfies Meta<typeof BookingHeader>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const Hover: Story = { parameters: { pseudo: { hover: true } } }
export const Selects: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button'))
    await expect(args.onSelect).toHaveBeenCalledWith('7JRWT4')
  },
}
```

- **JSDoc над `const meta`** — единственное место описания: его берут страница Docs и MCP. JSDoc над самим компонентом манифест игнорирует — не дублировать.
- **Без Figma** — ни ссылок, ни node id, ни тегов в JSDoc и stories (решение пользователя, 2026-09-25).
- **Несколько компонентов в одном файле stories** — `component` + `subcomponents` (см. `app-sidebar/parts.stories.tsx`), иначе MCP не найдёт компонент.
- **Состояния** — по story на каждое: Default, Hover / Pressed / Focus (через `parameters.pseudo`, addon `storybook-addon-pseudo-states`), Active, Disabled, Loading, Error, Empty, длинные данные. Какие нужны — из flow doc; нет в flow doc — записать в «Known gaps».
- **Default без кликов** — клик оставляет focus/hover, и Default покажет чужое состояние. Клики — в отдельных stories.
- **play-функции** проверяют поведение: колбэки, `aria-*`, доступные имена, порядок. Общие проверки папки — в `story-checks.ts`.
- **Даты детерминированы** — `now` в args (`new Date(2026, 2, 13, 18, 0)`), не текущее время.
- **Teal `primary` с текстом** не проходит контраст (open question #14) — у такой story `parameters: { a11y: { test: 'todo' } }` с комментарием. Больше исключений не добавлять.

## 6. Проверить

```bash
npm run typecheck && npm run lint:tokens && npm test && npm run build
```

- Открыть story в браузере (Playwright) и посмотреть все состояния, не только прогнать тесты.
- MCP `docs-show <id>`: описание есть, props с описаниями, `error` нет. Если props пустые — компонент не найден: проверить `meta.component` и импорты через `@/`.
- Документы в том же изменении: flow doc (состояния и решения), `APPLICATION.md` (раздел Storybook), `docs/testing-plan.md`.
