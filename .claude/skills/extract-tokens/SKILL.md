---
name: extract-tokens
description: Steps for adding or updating design tokens (colors, typography, radius, shadows) from Figma in Skydesk Sandbox — semantic names, exact HSL channels in src/tokens/index.css, Tailwind mapping, tailwind-merge and the lint:tokens check. Use when a design needs a value that has no token yet, or when Figma variables change.
---

# Skill: Extract Tokens

Как токен попадает из Figma в код. Токены уже настроены — обычно задача: добавить один новый или поправить значение.

## Где что лежит

| Файл | Что там |
|---|---|
| `src/tokens/index.css` | CSS-переменные в `@layer base`: `:root` — светлая тема, `.dark` — тёмная. Подключён из `src/index.css` |
| `tailwind.config.ts` | Переменная → класс Tailwind (`colors`, `borderRadius`, `fontSize`, `boxShadow`, `dropShadow`) |
| `src/lib/utils.ts` | `extendTailwindMerge` — новые классы, которые `cn()` должен понимать |
| `scripts/check-tokens.mjs` | `npm run lint:tokens` — ловит хардкод цветов, радиусов, размеров шрифта, теней |

## 1. Получить значения из Figma

Субагент `figma-reader` (только чтение): переменные узла (`get_variable_defs`) и значения в макете. Нужны имя переменной в Figma и точное значение (hex, px, rgba).

Figma недоступна или у значения нет переменной — взять значение из макета и записать название в `docs/open-questions.md` (как #15: «названия выбраны в sandbox»).

## 2. Сначала проверить, нет ли токена

Совпадает значение с существующим токеном — использовать его, а не заводить второй. Пример: `#f5f5f4` — это уже `secondary` / `muted` / `accent` / `sidebar-accent`; hover в sidebar взял `sidebar-accent`, нового цвета не появилось.

## 3. Назвать семантически

Имя — по роли, не по цвету: `surface`, `loading-start`, `radius-card`, не `stone-50` или `gray-light`.

- Роль из набора shadcn/ui (`background`, `primary`, `muted`, `accent`, `destructive`, `border`, `ring`…) — использовать его.
- Своя роль Skydesk — своё имя: `brand`, `surface`, `loading-*`, `border-muted`.
- Токены одного компонента — с префиксом компонента: `sidebar-*`.
- Пара «фон + текст» — `<name>` и `<name>-foreground`.

## 4. Записать в `src/tokens/index.css`

```css
:root {
  /* Surfaces — search card, GDS buttons (Figma: stone-50) */
  --surface: 60 9% 98%;              /* #fafaf9 */
}
.dark {
  --surface: 25 6% 10%;
}
```

- **Цвет — HSL-каналы без `hsl()`**: `174 84% 32%`. Иначе не работают модификаторы прозрачности (`bg-primary/80`).
- **Точные каналы, не округлённые.** Округление до целых сдвигает hex: `#78716c` — это `25 5.3% 44.7%`, а не `25 5% 45%`. Пересчитать и проверить обратным переводом:
  ```bash
  node -e 'const h=process.argv[1].replace("#","");const [r,g,b]=[0,2,4].map(i=>parseInt(h.slice(i,i+2),16)/255);const M=Math.max(r,g,b),m=Math.min(r,g,b),l=(M+m)/2,d=M-m;let H=0,S=0;if(d){S=d/(1-Math.abs(2*l-1));H=M===r?((g-b)/d)%6:M===g?(b-r)/d+2:(r-g)/d+4;H=Math.round(H*60*10)/10;if(H<0)H+=360}console.log(`${H} ${Math.round(S*1000)/10}% ${Math.round(l*1000)/10}%`)' '#78716c'
  ```
  Старые токены из пресета shadcn округлены (`--primary: 174 84% 32%`, точно — `174.7 83.9% 31.6%`). Не «чинить» их попутно: это меняет цвет всего приложения — только отдельной задачей со сравнением скриншотов.
- **Комментарий** — hex и откуда токен (роль, где используется).
- **Тёмная тема** — у каждого цвета есть пара в `.dark`. Нет её в Figma — подобрать из той же палитры stone и записать в open questions.
- **Не цвет** — значение как есть: `--radius-card: 16px`, `--shadow-popover: 0 2px 2px rgba(…)`. Размер шрифта — тройкой `--font-size-*`, `--line-height-*`, `--letter-spacing-*`.

## 5. Подключить в `tailwind.config.ts`

```ts
colors:       { surface: 'hsl(var(--surface))' }
borderRadius: { card: 'var(--radius-card)' }
fontSize:     { heading: ['var(--font-size-heading)', { lineHeight: 'var(--line-height-heading)', letterSpacing: 'var(--letter-spacing-heading)' }] }
boxShadow:    { popover: 'var(--shadow-popover)' }
```

## 6. Научить `cn()` новому классу

Не цвет (размер шрифта, радиус, тень) → добавить в `extendTailwindMerge` в `src/lib/utils.ts`. Иначе tailwind-merge примет `text-2xs` за цвет и молча выбросит один класс из пары (`text-heading text-foreground`). Цвета tailwind-merge понимает сам.

## 7. Проверить

```bash
npm run typecheck && npm run lint:tokens && npm test && npm run build
```

- **Меняли значение существующего токена или переводили хардкод на токен** — сравнить скриншоты до/после (Playwright) всех затронутых stories и экранов: должно совпасть до пикселя. Так проверяли переход на токены 2026-09-23 — 50 скриншотов.
- В Storybook: story `UI/Button → CssCheck` проверяет, что токены вообще загрузились.
- Новый токен — упомянуть в `CLAUDE.md` → «Решения и gotchas», пункт про токены, если он общий для среды; если только для одного flow — в его flow doc.
