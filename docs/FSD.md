# FSD архитектура

Проект построен по Feature Sliced Design и строго разделяет ответственность по слоям.

## Слои

- `shared` — общие библиотеки, UI‑кит, утилиты, api‑клиент, форматтеры
- `entities` — доменные сущности и их типы (`service`, `specialist`, `booking`, `timeSlot`, `user`)
- `features` — бизнес‑сценарии (создать/перенести/отменить/заблокировать)
- `widgets` — крупные составные блоки интерфейса
- `pages-layer` — страницы как композиции виджетов (слой FSD)
- `app` — маршруты Next.js (App Router), без бизнес‑логики

## Правила

- Бизнес‑логика не хранится в UI‑компонентах
- `shared` не зависит от слоёв выше
- `entities` используют только `shared`
- `features` используют `entities` и `shared`
- `widgets` собирают `features` и `entities`
- `pages-layer` собирает `widgets`
