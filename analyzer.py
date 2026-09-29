#!/usr/bin/env python3
"""
analyzer.py

Прототип AI Vision для анализа скриншота фьючерсной сделки
из приложения "Тинькофф Инвестиции".

Запуск:
    python analyzer.py "C:\\path\\to\\screenshot.png"

API-ключ передаётся через переменную окружения:
    Windows PowerShell:
        $env:OPENAI_API_KEY="sk-..."

    macOS/Linux:
        export OPENAI_API_KEY="sk-..."
"""

import base64
import json
import mimetypes
from datetime import datetime
import os
import sys
from pathlib import Path

from openai import OpenAI


MODEL = "gpt-4o"

PROMPT = """Ты — мудрая лягушка-трейдер. Проанализируй этот скриншот фьючерсной сделки из приложения Тинькофф Инвестиции.

Сначала определи, является ли изображение реальным скриншотом сделки.
Если на картинке нет сделки, верни is_trade: false и action: HOLD. Не выдумывай данные.

Если сделка есть, извлеки:
- тикер фьючерса;
- направление (Лонг/Шорт);
- цену входа;
- текущую цену;
- размер плеча или гарантийного обеспечения (ГО).

Обрати внимание, что интерфейс на русском языке.

В Тинькофф Инвестиции вместо плеча часто указано ГО (Гарантийное обеспечение).
Если видишь ГО, в поле leverage верни значение ГО, а в reasoning укажи,
что это ГО, а не плечо.

Обязательно извлеки current_price (текущую цену), если она видна на экране.
Если значение не видно или его невозможно надёжно прочитать, верни null.
Ничего не выдумывай.

Затем дай краткий совет: 'держать' или 'закрывать/продавать', чтобы не уйти в убыток.
В reasoning кратко объясни, почему Лягушка дала именно такой совет,
опираясь только на данные, видимые на скриншоте.

Поле timestamp НЕ анализируй и НЕ создавай: оно будет добавлено Python после ответа модели.

Представь ответ строго в формате JSON."""

def image_to_data_url(image_path: Path) -> str:
    """Читает изображение и превращает его в data URL с base64."""
    if not image_path.is_file():
        raise FileNotFoundError(f"Файл не найден: {image_path}")

    mime_type, _ = mimetypes.guess_type(image_path.name)
    if not mime_type or not mime_type.startswith("image/"):
        raise ValueError(
            "Файл должен быть изображением (PNG, JPG, JPEG, WEBP и т.п.)."
        )

    image_bytes = image_path.read_bytes()
    encoded = base64.b64encode(image_bytes).decode("utf-8")
    return f"data:{mime_type};base64,{encoded}"


def analyze_screenshot(image_path: Path) -> dict:
    """Отправляет скриншот в OpenAI Vision и возвращает распарсенный JSON."""
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise RuntimeError(
            "Не задан OPENAI_API_KEY. "
            "Перед запуском установите API-ключ в переменную окружения."
        )

    client = OpenAI(api_key=api_key)
    image_data_url = image_to_data_url(image_path)

    response = client.chat.completions.create(
        model=MODEL,
        temperature=0,
        response_format={
            "type": "json_schema",
            "json_schema": {
                "name": "futures_trade_analysis",
                "strict": True,
                "schema": {
                    "type": "object",
                    "additionalProperties": False,
                    "properties": {
                        "is_trade": {"type": "boolean"},
                        "ticker": {"type": ["string", "null"]},
                        "side": {
                            "type": ["string", "null"],
                            "enum": ["LONG", "SHORT", None],
                        },
                        "entry_price": {"type": ["number", "null"]},
                        "current_price": {"type": ["number", "null"]},
                        "leverage": {"type": ["number", "null"]},
                        "advice": {"type": "string"},
                        "reasoning": {"type": "string"},
                        "action": {"type": "string", "enum": ["HOLD", "SELL"]},
                    },
                    "required": [
                        "is_trade",
                        "ticker",
                        "side",
                        "entry_price",
                        "current_price",
                        "leverage",
                        "advice",
                        "reasoning",
                        "action",
                    ],
                },
            },
        },
        messages=[
            {
                "role": "system",
                "content": (
                    "Ты аккуратный Vision-анализатор скриншотов. "
                    "Не выдумывай данные, которых нет на изображении."
                ),
            },
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": PROMPT},
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": image_data_url,
                            "detail": "high",
                        },
                    },
                ],
            },
        ],
    )

    content = response.choices[0].message.content
    if not content:
        raise RuntimeError("OpenAI API вернул пустой ответ.")

    try:
        result = json.loads(content)
    except json.JSONDecodeError as exc:
        raise RuntimeError(
            f"Модель вернула невалидный JSON:\n{content}"
        ) from exc

    required_fields = {
        "is_trade",
        "ticker",
        "side",
        "entry_price",
        "current_price",
        "leverage",
        "advice",
        "reasoning",
        "action",
    }

    missing = required_fields - result.keys()
    if missing:
        raise RuntimeError(
            "В JSON модели отсутствуют поля: "
            + ", ".join(sorted(missing))
        )

    # Если сделки нет, сразу останавливаем дальнейшую обработку.
    if result["is_trade"] is False:
        print("\nНа изображении не найдена сделка")
        return {
            "is_trade": False,
            "ticker": None,
            "side": None,
            "entry_price": None,
            "current_price": None,
            "leverage": None,
            "advice": result["advice"],
            "reasoning": result["reasoning"],
            "action": "HOLD",
            "timestamp": datetime.now().isoformat(),
        }

    return {
        "is_trade": True,
        "ticker": result["ticker"],
        "side": result["side"],
        "entry_price": result["entry_price"],
        "current_price": result["current_price"],
        "leverage": result["leverage"],
        "advice": result["advice"],
        "reasoning": result["reasoning"],
        "action": result["action"],
        "timestamp": datetime.now().isoformat(),
    }


def main() -> int:
    if len(sys.argv) != 2:
        print(
            'Использование:\n'
            '  python analyzer.py "путь\\к\\скриншоту.png"'
        )
        return 2

    image_path = Path(sys.argv[1])

    try:
        result = analyze_screenshot(image_path)

        print("\n=== Результат анализа ===")
        print(json.dumps(result, ensure_ascii=False, indent=2))
        print("=========================\n")
        return 0

    except FileNotFoundError as exc:
        print(f"❌ {exc}")
        return 1
    except ValueError as exc:
        print(f"❌ {exc}")
        return 1
    except RuntimeError as exc:
        print(f"❌ {exc}")
        return 1
    except Exception as exc:
        print(
            "❌ Не удалось выполнить запрос к OpenAI API.\n"
            f"Тип ошибки: {type(exc).__name__}\n"
            f"Сообщение: {exc}"
        )
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
