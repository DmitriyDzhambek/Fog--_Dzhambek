"""
api.py

FastAPI-сервер между React Mini App и analyzer.py/database.py.

Запуск:
    uvicorn api:app --reload --port 8000
"""

import logging
import os
from pathlib import Path
from uuid import uuid4

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from analyzer import analyze_screenshot
from database import init_db, save_trade
from telegram_auth import get_user_id_from_init_data


BASE_DIR = Path(__file__).resolve().parent
UPLOADS_DIR = BASE_DIR / "uploads"
logger = logging.getLogger(__name__)

app = FastAPI(title="Как прекрасна жизнь — AI Trade API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup() -> None:
    UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
    init_db()


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/api/analyze")
def analyze_image(
    file: UploadFile = File(...),
    init_data: str = Form(""),
) -> dict:
    """Принимает скриншот, проверяет Telegram initData и сохраняет результат."""
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=400,
            detail="Нужен файл изображения (PNG, JPG, JPEG, WEBP и т.п.).",
        )

    suffix = Path(file.filename or "image.jpg").suffix.lower()
    if not suffix or len(suffix) > 10:
        suffix = ".jpg"

    bot_token = os.getenv("TELEGRAM_BOT_TOKEN", "")
    user_id = get_user_id_from_init_data(init_data, bot_token)
    if user_id is None:
        user_id = 0
        logger.info("Telegram user_id не передан — используется user_id=0 (режим браузерного теста)")
    else:
        logger.info("Telegram user_id успешно получен: %s", user_id)

    image_path = UPLOADS_DIR / f"web_{uuid4().hex}{suffix}"

    try:
        with image_path.open("wb") as destination:
            while chunk := file.file.read(1024 * 1024):
                destination.write(chunk)

        result = analyze_screenshot(image_path)

        trade_id = save_trade(
            user_id=user_id,
            timestamp=result["timestamp"],
            ticker=result.get("ticker"),
            side=result.get("side"),
            action=result.get("action"),
            advice=result.get("advice"),
            current_price=result.get("current_price"),
            reasoning=result.get("reasoning"),
            image_path=str(image_path),
        )

        result["trade_id"] = trade_id
        return result

    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Не удалось обработать скриншот: {exc}",
        ) from exc
    finally:
        file.file.close()
