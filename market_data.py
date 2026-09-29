import time
import httpx
BASE="https://iss.moex.com/iss"
CACHE_SECONDS=60
_CACHE={}
async def get_futures_price(ticker):
    ticker=ticker.upper(); now=time.monotonic()
    hit=_CACHE.get(ticker)
    if hit and now-hit[0]<CACHE_SECONDS:return hit[1]
    urls=[f"{BASE}/engines/futures/markets/forts/securities/{ticker}.json?iss.meta=off",f"{BASE}/engines/futures/markets/forts/securities.json?iss.meta=off&securities={ticker}"]
    async with httpx.AsyncClient(timeout=8) as client:
        for url in urls:
            try:
                r=await client.get(url);r.raise_for_status();d=r.json()
                obj={}
                for key in ("securities","marketdata"):
                    b=d.get(key,{})
                    if isinstance(b,dict) and b.get("data"):obj=dict(zip(b.get("columns",[]),b["data"][0]));break
                if not obj:continue
                last=obj.get("LAST")
                try:last=float(last) if last is not None else None
                except (TypeError,ValueError):last=None
                result={"ticker":ticker,"short_name":obj.get("SHORTNAME"),"market_price":last,"previous_price":obj.get("PREVPRICE"),"market_time":obj.get("TIME"),"lot_size":obj.get("LOTSIZE"),"min_step":obj.get("MINSTEP"),"source":"MOEX ISS","received_at":time.time()}
                if last is not None:_CACHE[ticker]=(now,result);return result
            except (httpx.HTTPError,ValueError,KeyError,IndexError):continue
    return None
def clear_market_cache():_CACHE.clear()
