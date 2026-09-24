# Testing plan

> Как проверить, что всё работает. Обновлять после каждой новой фичи — это же самый быстрый способ восстановить контекст в следующей сессии.
> Перед demo или в конце рабочего дня — пройти весь план на текущем build и записать регрессии.
> Updated: 2026-09-24.

## Автоматическая проверка (перед каждым push)

```bash
npm run typecheck && npm test && npm run build
```

## PNR Search

Открывать адреса от корня (`npm run dev` → `http://localhost:5173/…`). Для каждого — что должно быть на экране.

| # | Адрес | Ожидаемо |
|---|---|---|
| 1 | `/` | Заголовок, пустое поле, «Select office»; кнопка поиска бледная и не нажимается. Ввести пробелы — кнопка остаётся неактивной |
| 2 | `?pnr=7JRWT4` | PNR в поле, результата нет; кнопка поиска яркая и активна |
| 3 | `?pnr=7JRWT4&state=loading` | «Loading...», поле, Office и кнопка заблокированы (кнопка яркая, как в Figma), рамка primary |
| 4 | `?pnr=ABC123&state=result` | Кнопки Amadeus / Sabre / Galileo, подсказка, рамка primary |
| 5 | `?pnr=7JRWT4&state=result` | «Opening 7JRWT4 in Amadeus · A2K9 — Your default office for Amadeus» |
| 6 | `?persona=agent-no-defaults&pnr=7JRWT4&state=result` | «… · B3R7 — Creation office…» |
| 7 | `?pnr=ABC123&gds=Galileo&state=result` | «Opening ABC123 in Galileo · Q8L3» |
| 8 | `?pnr=7JRWT4&office=E6T8&state=result` | «… · E6T8 — Office you selected» + checkbox «Use this as my default office for Amadeus» |
| 9 | `?pnr=XYZ789&gds=Sabre&state=result` | «Booking not found…» |
| 10 | `?pnr=ERR000&state=result` | «Something went wrong…» (красный) |

**Живые сценарии**

- **B целиком:** на `/` ввести `abc123` → Enter → через ~1.5 с GDS Required → Galileo → Found через `Q8L3`. URL стал `?pnr=ABC123&gds=Galileo&state=result`.
- **Default Office сохраняется:** адрес 8 → отметить checkbox → открыть адрес 5 → теперь `E6T8` и «Your default office». В Office Selector у `E6T8` метка «Default». «Reset demo data» → снова `A2K9`.
- **Persona:** на адресе 5 нажать «Agent without defaults» → тот же PNR открывается через `B3R7`. Кнопка «назад» в браузере → снова `A2K9`.
- **Смена ввода сбрасывает результат:** на любом результате изменить PNR или Office → результат исчезает.

## Office Selector

`?page=office-selector` — все 9 состояний компонента на одной странице. Метки «Default» у `5GW5`, `A2K9`, `Q8L3`.

## Последний прогон

- 2026-09-24: пункты 1–3 и сценарий B пройдены в headless Chromium на production build (задача 0.1 — неактивная кнопка поиска); ошибок в консоли нет.
- 2026-09-23: все пункты выше пройдены в headless Chromium на production build (`vite preview`); ошибок в консоли нет.
