import base64,json,mimetypes,os,sys,asyncio
from datetime import datetime,timezone
from pathlib import Path
from openai import OpenAI
from market_data import get_futures_price
MODEL=os.getenv("OPENAI_VISION_MODEL","gpt-4o")
PROMPT="""Ты — мудрая Лягушка-трейдер и аккуратный аналитик фьючерсов MOEX. Не выдумывай данные.
Прочитай только то, что видно на скриншоте. Если сделки нет — is_trade=false, action=HOLD.
Извлеки ticker, side LONG/SHORT, entry_price, current_price если виден и leverage.
«ГО/гарантийное обеспечение» — не плечо: объясни это в reasoning.
«-1 шт» означает short 1 контракт. «3 681 пт» может быть ценой входа.
Для SHORT падение цены от входа — прибыль, рост — убыток. Если цена не читается — null.
Дай HOLD или SELL и кратко объясни риск по подтверждённым данным."""
def image_to_data_url(p):
 mime,_=mimetypes.guess_type(p.name)
 if not mime or not mime.startswith("image/"):raise ValueError("Файл должен быть изображением.")
 return f"data:{mime};base64,{base64.b64encode(p.read_bytes()).decode()}"
def analyze_screenshot(path):
 key=os.getenv("OPENAI_API_KEY")
 if not key:raise RuntimeError("Не задан OPENAI_API_KEY.")
 r=OpenAI(api_key=key).chat.completions.create(model=MODEL,temperature=0,response_format={"type":"json_schema","json_schema":{"name":"moex_trade","strict":True,"schema":{"type":"object","additionalProperties":False,"properties":{"is_trade":{"type":"boolean"},"ticker":{"type":["string","null"]},"side":{"type":["string","null"],"enum":["LONG","SHORT",None]},"entry_price":{"type":["number","null"]},"current_price":{"type":["number","null"]},"leverage":{"type":["number","null"]},"advice":{"type":"string"},"reasoning":{"type":"string"},"action":{"type":"string","enum":["HOLD","SELL"]}},"required":["is_trade","ticker","side","entry_price","current_price","leverage","advice","reasoning","action"]}}},messages=[{"role":"system","content":"Не угадывай. Если поле не видно — null."},{"role":"user","content":[{"type":"text","text":PROMPT},{"type":"image_url","image_url":{"url":image_to_data_url(path),"detail":"high"}}]}])
 data=json.loads(r.choices[0].message.content or "{}");ticker=data.get("ticker");moex=None
 if ticker:
  try:moex=asyncio.run(get_futures_price(ticker))
  except Exception:moex=None
 entry=data.get("entry_price");side=data.get("side");screen=data.get("current_price");current=moex.get("market_price") if moex and moex.get("market_price") is not None else screen
 state="UNKNOWN" if entry is None or current is None else ("PROFIT" if (current<entry if side=="SHORT" else current>entry) else "LOSS" if (current>entry if side=="SHORT" else current<entry) else "FLAT")
 profit=None if entry is None or current is None else (current-entry)/entry*100*(-1 if side=="SHORT" else 1)
 data.update(timestamp=datetime.now(timezone.utc).isoformat(),screenshot_current_price=screen,current_price=current,position_state=state,profit_percent=profit,price_source="MOEX ISS" if moex else ("screenshot" if screen is not None else "unknown"),market_data=moex)
 return data
if __name__=="__main__":
 print(json.dumps(analyze_screenshot(Path(sys.argv[1])),ensure_ascii=False,indent=2))
