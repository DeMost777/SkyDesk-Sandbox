# Open questions

> Нерешённые вопросы. Не выбирать ответ молча: пока вопрос открыт, в коде — самое простое поведение, и оно указано здесь.
> Формат: вопрос → что сейчас в коде → кто решает. Закрытый вопрос переносится в CLAUDE.md → «Решения и gotchas».

## PNR Search

1. **Выбор Office отменяет шаг GDS Required.** Office принадлежит одной GDS, поэтому при выбранном Office шаг не показывается.
   Сейчас: реализовано так (следует из принципа flow). Нужно подтверждение.
   Решает: product. Добавлено 2026-09-23.

2. **Экран «Found» / переход в Booking.** В Figma нет состояния после успешного поиска.
   Сейчас: заглушка «Opening 7JRWT4 in Amadeus · A2K9» с причиной выбора Office и checkbox «Use this as my default office». Нужен дизайн.
   Решает: design. Добавлено 2026-09-23.

3. **Где предлагать сохранить Default Office.** Спецификация: «при ручном выборе Office», место не указано.
   Сейчас: checkbox в строке Found, только после успешного открытия через выбранный вручную Office.
   Решает: design. Добавлено 2026-09-23.

4. **Текст подсказки GDS Required.** Спецификация: «To continue the search, select the GDS where this PNR was created.» Код (из Figma): «…please select the GDS…».
   Сейчас: текст из Figma.
   Решает: design. Добавлено 2026-09-23.

## Терминология

5. **Reservation vs Booking.** Заголовок экрана (Figma): «How can I help with your reservation today?». Во всех документах и в Not Found — «booking».
   Сейчас: оставлено как в Figma. Глоссарий (CLAUDE.md) предлагает «booking».
   Решает: design. Добавлено 2026-09-23.

## Процесс

6. **Какая ветка деплоится в production на Vercel.** Сейчас известно только, что каждый push создаёт preview.
   Решает: владелец проекта. Добавлено 2026-09-23.
