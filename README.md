# SlotSync — салон красоты

Онлайн-бронирование услуг с генерацией расписания, блокировкой слотов и
многошаговым процессом записи. Проект реализован строго по ТЗ и FSD.

## Запуск

```bash
npm install
npm run dev
```

Откройте `http://localhost:3000`.

## Архитектура (Feature Sliced Design)

- `shared` — ui, api, форматтеры дат, утилиты
- `entities` — service, specialist, schedule, timeSlot, booking, user
- `features` — create-booking, reschedule-booking, cancel-booking, lock-slot
- `widgets` — service-selector, specialist-schedule, booking-summary, user-bookings
- `pages-layer` — services, booking, profile (слой FSD, чтобы не конфликтовать с Next Pages Router)
- `app` — Next.js маршруты (App Router)

Вся бизнес-логика вынесена из UI-компонентов: генерация слотов, имитация API,
валидаторы конфликтов и управление блокировками находятся в `entities`/`shared`.

## Моделирование сценариев

- **Конкурентный доступ:** `lockSlot` случайно имитирует занятый слот
- **Сетевые ошибки:** случайные `NETWORK` ошибки в mock API
- **Частичные отказы:** `PARTIAL` ошибки при отмене и переносе
- **Повторы:** React Query с ретраями и кешированием

## Trade-offs

- Используется mock API в памяти (ускоряет разработку и позволяет имитировать
  конфликты), но данные не сохраняются между перезапусками.
- Шаги бронирования сохраняются через Zustand `persist`, что упрощает UX,
  но требует локального хранилища.
- Генерация слотов делается на фронте для гибкости, но при реальном API лучше
  переносить часть логики на сервер.
