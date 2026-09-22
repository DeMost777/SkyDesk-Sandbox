# Skill: Extract Tokens from Figma

Инструкция для извлечения дизайн-токенов из Figma и переноса их в проект.

## Когда использовать
- При первоначальной настройке дизайн-системы
- При обновлении токенов после изменений в Figma
- При добавлении новых цветовых режимов или тем

## Шаги

### 1. Подключиться к Figma
Использовать Figma MCP (`mcp__Figma__get_design_context` или `mcp__Figma__get_variable_defs`) с ссылкой на основной файл компонентов.

### 2. Извлечь переменные
Получить из Figma:
- **Colors** — все цветовые токены (primary, secondary, neutral, semantic)
- **Typography** — font-family, font-size, line-height, font-weight
- **Spacing** — padding, margin, gap значения
- **Border radius** — радиусы скруглений
- **Shadows** — box-shadow значения

### 3. Преобразовать в CSS-переменные
Формат для `src/tokens/index.css`:
```css
:root {
  /* Colors */
  --color-primary: ...;
  --color-primary-foreground: ...;

  /* Radius */
  --radius: ...;

  /* Typography */
  --font-sans: ...;
}
```

### 4. Настроить Tailwind
Обновить `tailwind.config.ts` — привязать CSS-переменные к утилитам Tailwind.

### 5. Настроить shadcn/ui тему
Обновить `src/components/ui/` компоненты — они должны использовать токены, а не хардкод.

## Результат
После выполнения: все компоненты автоматически используют токены из Figma. Изменение токена в одном месте обновляет всё приложение.

## Статус
- [ ] Figma-файл получен
- [ ] Токены извлечены
- [ ] CSS-переменные созданы
- [ ] Tailwind настроен
- [ ] shadcn/ui тема обновлена
