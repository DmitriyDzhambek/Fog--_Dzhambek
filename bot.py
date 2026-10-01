import asyncio,logging,os
from datetime import datetime,timezone,time
from zoneinfo import ZoneInfo
from aiogram import Bot,Dispatcher
from aiogram.exceptions import TelegramForbiddenError,TelegramBadRequest
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from database import init_db,get_active_monitors,update_monitor_price,mark_monitor_notified
from market_data import get_futures_price
from forex_signal import get_signal
logging.basicConfig(level=logging.INFO);logger=logging.getLogger("frog-trader");scheduler=AsyncIOScheduler()
FOREX_CHAT_ID=os.getenv("FOREX_SIGNAL_CHAT_ID")
MOSCOW=ZoneInfo("Europe/Moscow")
FOREX_START=time(15,0);FOREX_END=time(18,0)
_last_forex_status=None;_last_forex_sent_at=None

def pnl(entry,current,side):
    sign=1 if side=="LONG" else -1
    return (current-entry)/entry*100*sign,(current-entry)*sign

def pulse_allowed(last):
    if not last:return True
    try:
        dt=datetime.fromisoformat(last);dt=dt if dt.tzinfo else dt.replace(tzinfo=timezone.utc)
        return (datetime.now(timezone.utc)-dt).total_seconds()>=1800
    except ValueError:return True

async def check_all_monitors(bot:Bot):
    for m in get_active_monitors():
        try:
            q=await get_futures_price(m["ticker"])
            if not q or q.get("market_price") is None:logger.debug("Smart Exit: no price for %s",m["ticker"]);continue
            price=float(q["market_price"]);update_monitor_price(m["id"],price);side=m["side"]
            target=(side=="SHORT" and m["target_price"] is not None and price<=m["target_price"]) or (side=="LONG" and m["target_price"] is not None and price>=m["target_price"])
            stop=(side=="SHORT" and m["stop_price"] is not None and price>=m["stop_price"]) or (side=="LONG" and m["stop_price"] is not None and price<=m["stop_price"])
            if target and not m["notified_target"]:
                pct,rub=pnl(m["entry_price"],price,side)
                try:
                    await bot.send_message(m["user_id"],f"🎯 🐸 КВА! {m['ticker']} достиг цели! Сейчас {price:,.0f} пт. Твой {'шорт' if side=='SHORT' else 'лонг'} {pct:+.2f}% ({rub:+.0f}₽). Фиксируй прибыль!");mark_monitor_notified(m["id"],"target")
                except (TelegramForbiddenError,TelegramBadRequest) as e:logger.warning("target: %s",e)
                continue
            if stop and not m["notified_stop"]:
                try:
                    await bot.send_message(m["user_id"],f"🚨 🐸 КВА! {m['ticker']} = {price:,.0f} пт. Стоп-лосс сработал. Риск реализован. Закрывай позицию!");mark_monitor_notified(m["id"],"stop")
                except (TelegramForbiddenError,TelegramBadRequest) as e:logger.warning("stop: %s",e)
                continue
            if pulse_allowed(m.get("last_notified_at")):
                pct,rub=pnl(m["entry_price"],price,side)
                try:
                    await bot.send_message(m["user_id"],f"🐸 Проверка: {m['ticker']} = {price:,.0f} пт. Ты {'в плюсе' if pct>=0 else 'в минусе'} на {abs(pct):.2f}% ({rub:+.0f}₽). Всё спокойно, держим.");mark_monitor_notified(m["id"],"target" if m["notified_target"] else "stop")
                except (TelegramForbiddenError,TelegramBadRequest) as e:logger.warning("pulse: %s",e)
        except Exception:logger.exception("Smart Exit failed: %s",m["id"])

def forex_window_open() -> bool:
    now=datetime.now(MOSCOW).time()
    return FOREX_START <= now < FOREX_END

def format_forex_signal(signal:dict) -> str:
    emoji={"GREEN":"🟢","YELLOW":"🟡","RED":"🔴"}[signal["status"]]
    lines=[f"🐸 Miracle_Dzhambek · EUR/USD",f"{emoji} {signal['label']}",f"Цена: {signal['price']:.5f}"]
    if signal.get("direction"):lines.append(f"Направление сетапа: {'CALL ↑' if signal['direction']=='CALL' else 'PUT ↓'}")
    if signal.get("trend"):lines.append(f"Тренд: {signal['trend']}")
    if signal.get("rsi5") is not None:lines.append(f"RSI 5m: {signal['rsi5']}")
    lines.append(f"🐸 {signal['reason']}")
    lines.append("Это рыночный сигнал-наблюдение, не гарантия результата. Перед сделкой проверь котировку у своего брокера.")
    return "\n".join(lines)

async def check_forex_signal(bot:Bot):
    global _last_forex_status,_last_forex_sent_at
    if not FOREX_CHAT_ID or not forex_window_open():return
    try:
        signal=await get_signal();status=signal["status"];now=datetime.now(timezone.utc)
        state=(status,signal.get("direction"),signal.get("trend"))
        changed=state!=_last_forex_status
        cooldown=_last_forex_sent_at is None or (now-_last_forex_sent_at).total_seconds()>=1800
        if changed or (cooldown and status in {"GREEN","RED"}):
            await bot.send_message(int(FOREX_CHAT_ID),format_forex_signal(signal))
            _last_forex_status=state;_last_forex_sent_at=now
            logger.info("EURUSD signal sent: %s",state)
        else:
            logger.debug("EURUSD signal suppressed by cooldown: %s",state)
    except (TelegramForbiddenError,TelegramBadRequest) as e:
        logger.warning("EURUSD Telegram delivery failed: %s",e)
    except Exception:
        logger.exception("EURUSD signal check failed")

async def start_scheduler(bot):
    if scheduler.running:return
    scheduler.add_job(check_all_monitors,trigger="interval",minutes=5,args=[bot],id="monitor_checker",max_instances=1,replace_existing=True)
    scheduler.add_job(check_forex_signal,trigger="interval",minutes=5,args=[bot],id="forex_signal_checker",max_instances=1,replace_existing=True)
    scheduler.start()

async def main():
    token=os.getenv("TELEGRAM_BOT_TOKEN")
    if not token:raise RuntimeError("TELEGRAM_BOT_TOKEN не задан")
    init_db();bot=Bot(token);dp=Dispatcher();await start_scheduler(bot)
    try:await dp.start_polling(bot)
    finally:scheduler.shutdown(wait=False);await bot.session.close()

if __name__=="__main__":asyncio.run(main())
