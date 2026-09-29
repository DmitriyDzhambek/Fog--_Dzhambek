import os
from pathlib import Path
from uuid import uuid4
from fastapi import FastAPI,File,Form,HTTPException,UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from analyzer import analyze_screenshot
from database import init_db,save_trade,create_monitor,get_active_monitors,update_monitor_price
from market_data import get_futures_price
from telegram_auth import get_user_id_from_init_data
UPLOADS_DIR=Path(__file__).resolve().parent/"uploads"
app=FastAPI(title="Как прекрасна жизнь — AI Trade API")
app.add_middleware(CORSMiddleware,allow_origins=["*"],allow_credentials=False,allow_methods=["*"],allow_headers=["*"])
class MonitorCreate(BaseModel):
 user_id:int=0;ticker:str;side:str;entry_price:float;target_price:float|None=None;stop_price:float|None=None;trade_id:int=0
@app.on_event("startup")
def startup():UPLOADS_DIR.mkdir(parents=True,exist_ok=True);init_db()
@app.get("/api/health")
def health():return {"status":"ok"}
@app.post("/api/analyze")
def analyze_image(file:UploadFile=File(...),init_data:str=Form("")):
 if not file.content_type or not file.content_type.startswith("image/"):raise HTTPException(400,"Нужен файл изображения.")
 user_id=get_user_id_from_init_data(init_data,os.getenv("TELEGRAM_BOT_TOKEN","")) if init_data else 0
 path=UPLOADS_DIR/f"web_{uuid4().hex}{Path(file.filename or 'image.jpg').suffix.lower() or '.jpg'}"
 try:
  with path.open("wb") as dst:
   while chunk:=file.file.read(1024*1024):dst.write(chunk)
  result=analyze_screenshot(path);result["trade_id"]=save_trade(user_id,result["timestamp"],result.get("ticker"),result.get("side"),result.get("action"),result.get("advice"),result.get("current_price"),result.get("reasoning"),str(path));return result
 except Exception as exc:raise HTTPException(500,f"Не удалось обработать скриншот: {exc}") from exc
 finally:file.file.close()
@app.post("/api/monitor/create")
def monitor_create(p:MonitorCreate):
 side=p.side.upper()
 if side not in {"LONG","SHORT"}:raise HTTPException(400,"side должен быть LONG или SHORT")
 if p.target_price is None and p.stop_price is None:raise HTTPException(400,"Укажи target_price или stop_price")
 return {"monitor_id":create_monitor(trade_id=p.trade_id,user_id=p.user_id,ticker=p.ticker,side=side,entry_price=p.entry_price,target_price=p.target_price,stop_price=p.stop_price),"status":"active"}
@app.get("/api/monitor/active")
async def monitor_active(user_id:int=0):
 rows=[m for m in get_active_monitors() if user_id==0 or m["user_id"]==user_id];out=[]
 for m in rows:
  q=await get_futures_price(m["ticker"]);price=q.get("market_price") if q else m.get("last_checked_price")
  if price is not None:update_monitor_price(m["id"],float(price))
  pct=rub=None
  if price is not None:
   sign=1 if m["side"]=="LONG" else -1;pct=(price-m["entry_price"])/m["entry_price"]*100*sign;rub=(price-m["entry_price"])*sign
  x=dict(m);x.update(current_price=price,pnl_percent=pct,pnl_rub=rub);out.append(x)
 return {"monitors":out}
