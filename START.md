# Как прекрасна жизнь — запуск этапа анализа сделки

## 1. React

В терминале проекта:

```powershell
npm install
npm start
```

React: http://localhost:5173

## 2. Python / FastAPI

Во втором терминале, в той же папке:

```powershell
pip install -r requirements.txt
uvicorn api:app --reload --port 8000
```

Проверка сервера:

http://localhost:8000/api/health

Ожидаемый ответ:

```json
{"status":"ok"}
```

## 3. Проверка сделки

1. Оставить оба терминала запущенными.
2. Открыть React в браузере.
3. Нажать зелёную кнопку **Сделка**.
4. Выбрать скриншот из Тинькофф.
5. Дождаться ответа Лягушки.

React отправляет файл на:

`POST http://localhost:8000/api/analyze`

Python сохраняет скриншот в `uploads/`, вызывает `analyzer.py` и сохраняет результат через `database.py`.

Для реального анализа также нужен настроенный `OPENAI_API_KEY` в окружении Python.

## 4. Новые экраны Mini App

Добавлен UI-каркас из 7 экранов в `src/screens/`:

- `HomeScreen.tsx` — совет дня, задания, статистика.
- `MapScreen.tsx` — карта Долины и 5 локаций.
- `AchievementsScreen.tsx` — сетка из 6 достижений.
- `JournalScreen.tsx` — мок-журнал сделок с фильтрами и раскрытием деталей.
- `AssistantScreen.tsx` — мок-чат с ИИ-лягушкой и 5 Светлячками.
- `BackpackScreen.tsx` — 6 предметов рюкзака.
- `ShopScreen.tsx` — скины, бусты и премиум с мок-покупками.

Навигация собрана в `src/App.tsx`. `DealModal.tsx` продолжает открываться через центральную кнопку «Сделка» и не изменён.

Для запуска:

```powershell
npm install
npm start
```

Python/FastAPI запускается отдельно и этим этапом не изменяется.
