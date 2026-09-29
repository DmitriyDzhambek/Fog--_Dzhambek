# Как прекрасна жизнь — Лягушка-трейдер

## Текущая версия
Торговый терминал с RPG-слоем: Долина Рек, живая Лягушка-наставник, карта пути, калькулятор позиции и Smart Exit Alarm.

### Frontend
npm install
npm run build
npm run dev

### Backend
pip install -r requirements.txt
uvicorn api:app --reload --port 8000

### Smart Exit
Сценарий: short YDEX-12.26, вход 3681 → target 3650 / stop 3750 → монитор → MOEX каждые 5 минут → Telegram push при цели/стопе и контрольный pulse не чаще раза в 30 минут.

API:
- GET /api/health
- POST /api/analyze
- POST /api/monitor/create
- GET /api/monitor/active?user_id=0

Для Vision нужен OPENAI_API_KEY. Для Telegram нужен TELEGRAM_BOT_TOKEN.

Vercel подходит для frontend. FastAPI и Telegram polling/scheduler работают отдельно.
