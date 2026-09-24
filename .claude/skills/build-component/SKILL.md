---
name: build-component
description: Pattern for building a UI component in Skydesk Sandbox on top of shadcn/ui and the design tokens. Use when a screen needs a component that src/components/ does not have yet, or when extending an existing one.
---

# Skill: Build Component

Паттерн создания UI-компонентов для Skydesk Sandbox.

## Принципы

1. **Базируется на shadcn/ui** — не изобретать с нуля, расширять существующие примитивы
2. **Использует токены** — только CSS-переменные из `src/tokens/`, никакого хардкода
3. **TypeScript** — типизировать все props
4. **Без лишней абстракции** — компонент решает одну задачу

## Структура компонента

```
src/components/
├── ui/              ← shadcn/ui примитивы (не трогать напрямую)
└── skydesk/         ← кастомные Skydesk компоненты
    └── ComponentName/
        ├── index.tsx
        └── ComponentName.stories.tsx  ← когда будет Storybook
```

## Шаблон компонента

```tsx
// src/components/skydesk/ComponentName/index.tsx
import { cn } from '@/lib/utils'

interface ComponentNameProps {
  // props
  className?: string
}

export function ComponentName({ className, ...props }: ComponentNameProps) {
  return (
    <div className={cn('...', className)} {...props}>
      {/* content */}
    </div>
  )
}
```

## Состояния, которые нужно учитывать
- default
- hover / focus
- loading / disabled
- error
- empty

## Перед созданием нового компонента
Проверить, есть ли подходящий примитив в `src/components/ui/` (shadcn/ui). Если есть — расширить через className или wrapper, не переписывать.
