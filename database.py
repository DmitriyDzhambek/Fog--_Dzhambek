"""
database.py

SQLite-хранилище истории анализов сделок Telegram-бота.
"""

import sqlite3
from pathlib import Path
from typing import Any


DB_PATH = Path(__file__).resolve().parent / "trades.db"


def init_db() -> None:
    """Создаёт базу данных и таблицу trades, если их ещё нет."""
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS trades (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                timestamp TEXT NOT NULL,
                ticker TEXT,
                side TEXT,
                action TEXT,
                advice TEXT,
                current_price REAL,
                reasoning TEXT,
                image_path TEXT
            )
            """
        )
        conn.commit()


def save_trade(
    user_id: int,
    timestamp: str,
    ticker: str | None,
    side: str | None,
    action: str | None,
    advice: str | None,
    current_price: float | None,
    reasoning: str | None,
    image_path: str,
) -> int:
    """
    Сохраняет результат анализа.

    Возвращает ID созданной записи.
    """
    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.execute(
            """
            INSERT INTO trades (
                user_id,
                timestamp,
                ticker,
                side,
                action,
                advice,
                current_price,
                reasoning,
                image_path
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                user_id,
                timestamp,
                ticker,
                side,
                action,
                advice,
                current_price,
                reasoning,
                image_path,
            ),
        )
        conn.commit()
        return int(cursor.lastrowid)


def get_trade(trade_id: int) -> dict[str, Any] | None:
    """Необязательная вспомогательная функция для проверки записи."""
    with sqlite3.connect(DB_PATH) as conn:
        conn.row_factory = sqlite3.Row
        row = conn.execute(
            "SELECT * FROM trades WHERE id = ?",
            (trade_id,),
        ).fetchone()

    return dict(row) if row else None
