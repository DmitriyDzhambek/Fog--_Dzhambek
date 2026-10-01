"""EUR/USD market classifier for the Miracle_Dzhambek Telegram bot.

This module deliberately separates market classification from trade execution.
It never places a binary-options order.  A signal is only a structured
observation of the EUR/USD market: GREEN (setup may be searched), YELLOW
(observe), or RED (do not trade).
"""

from __future__ import annotations

import logging
from datetime import datetime, timezone
from typing import Any

import httpx

logger = logging.getLogger("frog-trader.forex")
BASE_URL = "https://biquote.io/api"
SYMBOL = "EURUSD"
TIMEOUT = 10.0


def _sma(values: list[float], period: int) -> float | None:
    if len(values) < period:
        return None
    return sum(values[-period:]) / period


def _ema(values: list[float], period: int) -> float | None:
    if len(values) < period:
        return None
    alpha = 2 / (period + 1)
    value = sum(values[:period]) / period
    for price in values[period:]:
        value = alpha * price + (1 - alpha) * value
    return value


def _rsi(values: list[float], period: int = 14) -> float | None:
    if len(values) <= period:
        return None
    gains: list[float] = []
    losses: list[float] = []
    for previous, current in zip(values[:-1], values[1:]):
        delta = current - previous
        gains.append(max(delta, 0.0))
        losses.append(max(-delta, 0.0))
    avg_gain = sum(gains[-period:]) / period
    avg_loss = sum(losses[-period:]) / period
    if avg_loss == 0:
        return 100.0
    rs = avg_gain / avg_loss
    return 100 - (100 / (1 + rs))


async def _get(path: str, params: dict[str, Any] | None = None) -> Any:
    async with httpx.AsyncClient(timeout=TIMEOUT) as client:
        response = await client.get(f"{BASE_URL}/{path}", params=params)
        response.raise_for_status()
        return response.json()


async def get_eurusd_snapshot() -> dict[str, Any]:
    """Return a live EUR/USD tick plus 1m/5m/15m candles."""
    tick, m1, m5, m15 = await _get(SYMBOL), await _get(
        f"{SYMBOL}/ohlc", {"interval": "1m", "limit": 80}
    ), await _get(f"{SYMBOL}/ohlc", {"interval": "5m", "limit": 80}), await _get(
        f"{SYMBOL}/ohlc", {"interval": "15m", "limit": 80}
    )
    return {"tick": tick, "m1": m1.get("bars", []), "m5": m5.get("bars", []), "m15": m15.get("bars", [])}


def _closed_closes(bars: list[dict[str, Any]]) -> list[float]:
    return [float(b["close"]) for b in reversed(bars) if not b.get("isOpen")]


def classify_market(data: dict[str, Any]) -> dict[str, Any]:
    """Classify EUR/USD as GREEN/YELLOW/RED from multiple timeframes.

    The scoring is intentionally conservative: missing/stale data, wide spread,
    or disagreement between timeframes prevents a GREEN result.
    """
    tick = data["tick"]
    price = float(tick["mid"])
    spread = float(tick.get("spread") or 0)
    age = float(tick.get("quoteAgeSeconds") or 0)
    m1 = _closed_closes(data["m1"])
    m5 = _closed_closes(data["m5"])
    m15 = _closed_closes(data["m15"])

    if tick.get("marketState") != "open" or tick.get("stale") or age > 90:
        return {"status": "RED", "label": "Не торгуем", "reason": "Нет свежей рыночной цены.", "price": price}
    if len(m1) < 30 or len(m5) < 30 or len(m15) < 30:
        return {"status": "YELLOW", "label": "Наблюдаем", "reason": "Недостаточно свечей для подтверждения.", "price": price}

    ema9_1 = _ema(m1, 9)
    ema21_1 = _ema(m1, 21)
    ema9_5 = _ema(m5, 9)
    ema21_5 = _ema(m5, 21)
    ema9_15 = _ema(m15, 9)
    ema21_15 = _ema(m15, 21)
    rsi5 = _rsi(m5, 14)
    recent_range = max(m5[-20:]) - min(m5[-20:])
    avg_step = sum(abs(b - a) for a, b in zip(m5[-21:-1], m5[-20:])) / 20

    bullish = ema9_1 > ema21_1 and ema9_5 > ema21_5 and ema9_15 > ema21_15
    bearish = ema9_1 < ema21_1 and ema9_5 < ema21_5 and ema9_15 < ema21_15
    aligned = bullish or bearish
    momentum_ok = rsi5 is not None and ((bullish and 45 <= rsi5 <= 68) or (bearish and 32 <= rsi5 <= 55))
    chaotic = avg_step > 0 and recent_range > avg_step * 9
    spread_ok = spread <= 0.00015

    if chaotic or not spread_ok:
        reason = "Резкое движение или широкий спред — ждём стабилизации."
        return {"status": "RED", "label": "Не торгуем", "reason": reason, "price": price, "trend": "UP" if bullish else "DOWN" if bearish else "FLAT", "rsi5": round(rsi5, 1) if rsi5 is not None else None}

    if aligned and momentum_ok:
        direction = "CALL" if bullish else "PUT"
        return {"status": "GREEN", "label": "Можно искать вход", "direction": direction, "reason": "Тренд согласован на 1m/5m/15m и импульс подтверждён.", "price": price, "trend": "UP" if bullish else "DOWN", "rsi5": round(rsi5, 1) if rsi5 is not None else None}

    return {"status": "YELLOW", "label": "Наблюдаем", "reason": "Движение есть, но подтверждения недостаточно.", "price": price, "trend": "UP" if bullish else "DOWN" if bearish else "FLAT", "rsi5": round(rsi5, 1) if rsi5 is not None else None}


async def get_signal() -> dict[str, Any]:
    data = await get_eurusd_snapshot()
    signal = classify_market(data)
    signal["symbol"] = SYMBOL
    signal["checked_at"] = datetime.now(timezone.utc).isoformat()
    logger.debug("EURUSD signal: %s", signal)
    return signal
