---
name: extract-tokens
description: Steps for extracting design tokens (colors, typography, spacing, radius, shadows) from Figma via the Figma MCP into src/tokens/ and the Tailwind config. Use when setting up or updating the design system from Figma.
---

# Skill: Extract Tokens from Figma

Обновление токенов после изменений в Figma. Источник — файл «shadcn kit - Trava» (Foundations). Если пользователь не дал ссылку на файл — спросить (file key в репозитории не записан, open question #29). Читать Figma лучше субагентом `figma-reader`.

## Как устроены токены

Цвет — в два слоя:

1. **Палитра** — `src/tokens/palette.css` (переменные `--palette-<scale>-<step>`, HSL) и `palette.ts` (hex). Генерируется: `npm run tokens:palette` (`scripts/generate-palette.mjs`) — 22 шкалы Figma Primitives × 11 оттенков. Руками не править.
2. **Семантические токены** — `src/tokens/index.css`: shadcn-имена, каждое — ссылка на шаг палитры (`--primary: var(--palette-teal-600)`), поэтому значение точное. В комментарии — шаг и hex.

Привязка «имя в Figma → CSS-переменная → ключ Tailwind» — `src/tokens/semantic-colors.ts` (hex светлой темы — из Figma). `colors.test.ts` сверяет привязку с Figma; Storybook → Foundations / Colors показывает результат.

Не цвет — радиусы, размеры шрифта, тени, `bg-hatch` — токены в `src/tokens/index.css` и `tailwind.config.ts`. Mono-шрифт — IBM Plex Mono (`public/fonts/`).

## Шаги

1. **Прочитать Figma**: `get_variable_defs` для переменных, `get_design_context` для узла. Вернуть значения как есть, без интерпретации.
2. **Палитра изменилась** — обновить `SCALES` / значения в `scripts/generate-palette.mjs`, запустить `npm run tokens:palette`.
3. **Семантический цвет изменился** — поправить ссылку на шаг палитры в `src/tokens/index.css` и hex в `semantic-colors.ts`.
4. **Нужен новый цвет** — завести семантический токен (переменная в `index.css`, ключ в `tailwind.config.ts`, при необходимости запись в `semantic-colors.ts`), а не использовать палитру в компоненте. HSL точный (`25 5.3% 44.7%`): округление сдвигает hex.
5. **Новый токен-класс** (`text-heading`, `shadow-small`…) — добавить в `extendTailwindMerge` в `src/lib/utils.ts`.
6. **Значения из Figma не выдумывать.** Расхождение с Figma допустимо только по решению пользователя и с записью в `semantic-colors.ts` (`kept` с причиной) и в `CLAUDE.md` → «Решения и gotchas». Пример — `destructive-foreground` `#fafafa` вместо red-50 из-за контраста.
7. **Тёмную тему не трогать**: токены `.dark` остаются, но не используются и не тестируются.

## Проверка

`npm run typecheck && npm run lint:tokens && npm test && npm run build`. Тесты доступности Storybook упадут, если контраст токена ухудшился. Значения глазами сверять в Storybook → Foundations / Colors.

## Документы

Изменение токена — в том же изменении: `CLAUDE.md` (если это решение), `docs/components.md` (если затронуты компоненты), `docs/open-questions.md` (если осталось неясное).
