# Project: PNR Search

Первый прототип в Skydesk Sandbox — экран поиска и открытия бронирования по PNR.

## Цель

Проверить и улучшить UX поиска PNR с учётом логики офисного контекста (GDS + Office).

## Ключевой UX-принцип

Не заставлять агента выбирать то, что Skydesk может определить самостоятельно.

## Состояния экрана

```
Empty → Ready → Loading
                  ├─ GDS Required → Loading
                  ├─ Not Found
                  ├─ Error
                  └─ Found → Opening → [Booking view]
```

### 1. Empty / Initial
- Поле PNR пустое
- `Select office` — optional dropdown (не обязательно заполнять)
- Кнопка поиска неактивна

### 2. Ready to Search
- PNR введён
- Форма готова к отправке
- Если Office выбран — отображается в поле

### 3. Loading / Searching
- Поле и Office сохраняются
- Показывается индикатор загрузки
- Система ищет PNR и определяет GDS

### 4. GDS Required
- PNR ранее не обрабатывался SkyDesk — GDS неизвестна
- Показываем выбор: `Amadeus | Sabre | Galileo`
- Подсказка: "To continue the search, select the GDS where this PNR was created."
- Это не ошибка — дополнительный шаг поиска

### 5. Not Found
- PNR не найден в выбранном контексте
- Не generic error — объяснить контекст
- Предложить: "Try another GDS" / "Choose another office"

### 6. Error
- Техническая проблема (GDS недоступна, connection error, access denied)
- Понятный текст + "Try again"
- Если проблема с Office — предложить выбрать другой

## Логика выбора Office

### Приоритет
```
1. Office, явно выбранный пользователем
2. Default Office пользователя для GDS этого PNR
3. Creation PCC бронирования
```

### Default Office
- Настраивается отдельно для каждой GDS
- Предложить сохранить при ручном выборе Office:
  `☐ Use this as my default office for Amadeus`

## Основные сценарии

### Сценарий A: PNR известен SkyDesk
```
Enter PNR → Search → Booking opened
```
GDS известна → проверяем Default Office → открываем

### Сценарий B: PNR новый для SkyDesk
```
Enter PNR → Search → GDS Required → Select GDS → Search → Booking opened
```

### Сценарий C: Агент выбирает Office вручную
```
Enter PNR + Select Office/GDS → Search → Booking opened
```

### Сценарий D: Нет Default Office, PNR известен
```
Enter PNR → Search → Открываем через Creation PCC
```

## Mock Data

Файл: `src/mocks/pnr-search.mock.ts`

Состояния для тестирования:
- `KNOWN_PNR` — PNR известен SkyDesk (с GDS)
- `UNKNOWN_PNR` — PNR неизвестен (нужен выбор GDS)
- `NOT_FOUND_PNR` — PNR не найден
- `ERROR_PNR` — техническая ошибка

## Статус

- [ ] Mock data создана
- [ ] Компоненты созданы
- [ ] Все 6 состояний реализованы
- [ ] Деплой на Vercel
