"""Проверка initData Telegram Mini App.

Важно: нельзя доверять user_id, который пришёл из браузера, без проверки hash.
Проверка HMAC-SHA256 подтверждает, что initData сформировал Telegram и что
данные не были изменены по дороге. Без неё злоумышленник мог бы подменить
user.id и привязать сделку к чужому Telegram-пользователю.
"""

import hashlib
import hmac
import json
from urllib.parse import parse_qsl

from fastapi import HTTPException


def get_user_id_from_init_data(init_data: str, bot_token: str) -> int | None:
    """Проверяет подпись Telegram initData и возвращает Telegram user_id.

    Пустой initData допустим для локального запуска в обычном браузере:
    в этом случае возвращается None.
    """
    if not init_data:
        return None

    if not bot_token:
        raise HTTPException(
            status_code=500,
            detail="TELEGRAM_BOT_TOKEN не настроен на сервере.",
        )

    parsed = dict(parse_qsl(init_data, keep_blank_values=True))
    received_hash = parsed.pop("hash", None)

    if not received_hash:
        raise HTTPException(status_code=401, detail="Некорректный Telegram initData: отсутствует hash.")

    data_check_string = "\n".join(
        f"{key}={value}" for key, value in sorted(parsed.items())
    )

    # Официальная схема Telegram: сначала получаем секретный ключ из bot token,
    # затем HMAC-SHA256 проверяет data_check_string. Без этой проверки нельзя
    # считать присланный user.id достоверным.
    secret_key = hmac.new(
        b"WebAppData",
        bot_token.encode("utf-8"),
        hashlib.sha256,
    ).digest()
    calculated_hash = hmac.new(
        secret_key,
        data_check_string.encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()

    if not hmac.compare_digest(calculated_hash, received_hash):
        raise HTTPException(status_code=401, detail="Недействительная подпись Telegram initData.")

    user_raw = parsed.get("user")
    if not user_raw:
        raise HTTPException(status_code=401, detail="В Telegram initData отсутствует пользователь.")

    try:
        user = json.loads(user_raw)
        user_id = int(user["id"])
    except (json.JSONDecodeError, KeyError, TypeError, ValueError) as exc:
        raise HTTPException(status_code=401, detail="Некорректные данные пользователя Telegram.") from exc

    return user_id
